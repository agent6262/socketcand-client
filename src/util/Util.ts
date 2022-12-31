import * as url from "url";
import net from "net";
import {CustomSocket} from "../models/CustomSocket";
import nanoid from "nanoid";
import {SocketPoint} from "../models/SocketPoint";
import {Mode} from "../types/Mode";
import {ConnectionMode} from "../types/ConnectionMode";

export const activeConnections = new Array<CustomSocket>();

export function getConnectionFromId(sockId: string) {
    return activeConnections.find(connection => connection.id === sockId);
}

export function connect(urlString: string, connectionMode: ConnectionMode = ConnectionMode.CONTROLLED) {
    const parsedUrl = url.parse(urlString, true, true);
    const protocol = parsedUrl.protocol ?? "";
    const hostname = parsedUrl.hostname ?? "";
    const port = parsedUrl.port ?? "";
    const bus = parsedUrl.path?.replace("/", "") ?? "";

    if (protocol === "" || hostname === "" || port === "" || bus === "") return new Error("Url malformed");
    if (protocol !== "can:") return new Error("Wrong protocol in url only accept 'can:'");


    let scc = net.connect(+port, hostname);
    let customSocket = Object.assign(
        new CustomSocket(
            undefined,
            nanoid.nanoid(8),
            urlString,
            undefined,
            bus
        ),
        scc
    );
    activeConnections.push(customSocket);

    customSocket.on('data',
        (connectionMode === ConnectionMode.RAW ? customSocket.onDataRaw : customSocket.onDataControl).bind(customSocket)
    );
    customSocket.on('close', customSocket.onClose.bind(customSocket));

    return customSocket.id;
}

export function disconnect(sockId: string) {
    findIndexCallback(activeConnections, socket => socket.id === sockId, index => {
        activeConnections[index].destroy();
        activeConnections.splice(index, 1);
    }, () => {
    })
}

export function channelMode(sockId: string, mode: number) {
    const scc = getConnectionFromId(sockId);
    if (scc === undefined) return new Error("Socket not found for id " + sockId);
    if (scc.state === undefined) return new Error('ERROR no open channel');

    if (mode === Mode.BCM && scc.state !== Mode.BCM) {
        scc.write('< bcmmode >');
        scc.state = Mode.BCM;
    } else if (mode === Mode.RAW && scc.state !== Mode.RAW) {
        scc.write('< rawmode >');
        scc.state = Mode.RAW;
    } else if (mode === Mode.ISOTP && scc.state !== Mode.ISOTP) {
        scc.write('< isotpmode >');
        scc.state = Mode.ISOTP;
    }
}

export function echo(sockId: string) {
    const scc = getConnectionFromId(sockId);
    if (scc === undefined) return new Error("Socket not found for id " + sockId);

    if (scc.state !== undefined) {
        scc.write('< echo >');
    } else {
        return new Error('ERROR no open channel');
    }
}

export function findIndexCallback<T>(
    array: Array<T>, predicate: (value: T, index: number, obj: T[]) => unknown,
    foundFn: (index: number) => void,
    notFoundFn: () => void,
    thisArg?: any) {
    let index = array.findIndex(predicate, thisArg);
    if (index > -1) foundFn(index);
    else notFoundFn();
}

export function broadcastNewClient(sp: SocketPoint, update?: boolean) {
    console.log((update ? "Updated Client: " : "New Client: ") + sp.buses.map(bus => bus.name).join(",") + "@" + sp.host + " (" + sp.url + ")");
}