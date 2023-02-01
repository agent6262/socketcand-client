import net from "net";
import {Mode} from "../types/Mode";
import {ConnectionMode, disconnect, getEmitter} from "../index";
import {ConnectionObj} from "./ConnectionObj";
import {FrameObj} from "./FrameObj";

export class CustomSocket {
    id: string;
    url: string;
    port: string;
    hostname: string;
    state: Mode | undefined;
    bus: string;
    socket: net.Socket;

    constructor(id: string, url: string, port: string, hostname: string, state: Mode | undefined, bus: string, connectionMode: ConnectionMode) {
        this.id = id;
        this.url = url;
        this.port = port;
        this.hostname = hostname;
        this.state = state;
        this.bus = bus;

        this.socket = net.connect(+this.port, this.hostname);

        this.socket.on('data', (connectionMode === ConnectionMode.RAW ? this.onDataRaw : this.onDataControl).bind(this));
        this.socket.on('close', this.onClose.bind(this));
        this.socket.on('end', this.onDisconnect.bind(this));
    }

    onDataRaw(rawData: Buffer) {
        getEmitter().emit('data', rawData.toString());
    }

    onDataControl(rawData: Buffer) {
        const dirtyData = rawData.toString();
        const dataList = new Array<string>();
        let index = 0;
        do {
            const startIndex = dirtyData.indexOf('<', index);
            const endIndex = dirtyData.indexOf('>', index);
            if (startIndex === -1 && endIndex === -1) break;
            dataList.push(dirtyData.substring(startIndex, endIndex + 1));
            index = endIndex + 1;
        } while (index > 0);

        for (const data of dataList) {
            if (data === '< hi >') {
                this.socket.write('< open ' + this.bus + ' >');
                this.state = Mode.BCM;
                getEmitter().emit('connected', new ConnectionObj(this.url, this.id));
            } else if (data === '< ok >') {
                continue;
            } else if (data.startsWith("< frame")) {
                const dataArray = data.split(" ");
                const secArray = dataArray[3].split(".");
                if (dataArray.length > 5) {
                    const frame = new FrameObj(
                        dataArray[2],
                        secArray[0],
                        secArray[1],
                        CustomSocket.getDataArray(dataArray).join(" "),
                        this.bus,
                        this.url,
                        this.id,
                        this.state
                    );
                    getEmitter().emit('frame', frame)
                } else {
                    return new Error("Error could not parse received frame, protocol inconsistency");
                }
            } else {
                return new Error("Error could not parse received frame, not implemented");
            }
        }
    }

    static getDataArray(origArray: string[]) {
        if (origArray.length !== 6) {
            return origArray.slice(4, origArray.length - 1);
        }

        const data = origArray[4];
        const dataArray = [];
        for (let i = 0; i < data.length; i += 2) {
            dataArray.push(data.slice(i, i + 2));
        }
        return dataArray;
    }

    onClose() {
        getEmitter().emit('disconnected', new ConnectionObj(this.url, this.id));
    }

    onDisconnect() {
        disconnect(this.id ?? "");
    }
}