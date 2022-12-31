import net from "net";
import {Mode} from "../types/Mode";
import {channelMode} from "../util/Util";
import {EventEmitter} from "events";
const scd = require("../socketcand")
export class CustomSocket extends net.Socket {
    id?: string;
    url?: string;
    state?: Mode;
    bus?: string;

    constructor(options?: net.SocketConstructorOpts, id?: string, url?: string, state?: Mode, bus?: string) {
        super(options);
        this.id = id;
        this.url = url;
        this.state = state;
        this.bus = bus;
    }

    onDataRaw(rawData: Buffer) {
        scd.getEmitter().emit('data', rawData.toString());
    }

    onDataControl(rawData: Buffer) {
        if (this.id === undefined) return new Error("Invalid state, id not defined");

        let dirtyData = rawData.toString();
        let dataList = new Array<string>();
        let index = 0;
        do {
            let startIndex = dirtyData.indexOf('<', index);
            let endIndex = dirtyData.indexOf('>', index);
            if(startIndex === -1 && endIndex === -1) break;
            dataList.push(dirtyData.substring(startIndex, endIndex + 1));
            index = endIndex + 1;
        } while (index > 0);

        for (const data of dataList) {
            if (data === '< hi >') {
                this.write('< open ' + this.bus + ' >');
                this.state = Mode.BCM;
                scd.getEmitter().emit('connected', {url: this.url, id: this.id});
            } else if (data === "< ok >") {
            } else if (data.startsWith("< frame")) {
                const dataArray = data.split(" ");
                const secArray = dataArray[3].split(".");
                if (dataArray.length > 5) {
                    const frame = {
                        id: dataArray[2],
                        sec: secArray[0],
                        usec: secArray[1],
                        data: dataArray.slice(4, dataArray.length - 1).join(" "),
                        bus: this.bus,
                        url: this.url,
                        sockId: this.id,
                        mode: this.state
                    };
                    scd.getEmitter().emit('frame', frame)
                } else {
                    return new Error("Error could not parse received frame, protocol inconsistency");
                }
            } else {
                return new Error("Error could not parse received frame, not implemented");
            }
        }
    }

    onClose() {
        scd.getEmitter().emit('disconnected', {url: this.url, id: this.id});
    }
}