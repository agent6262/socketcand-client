import net, {Socket} from "net";
import {Mode} from "../types/Mode";
import {ConnectionMode} from "../types/ConnectionMode";
import {CustomSocket} from "../models/CustomSocket";
import nanoid from "nanoid";
import {SocketPoint} from "../models/SocketPoint";

export function mockNetConnect() {
    jest.spyOn(net, "connect").mockReturnValueOnce(new Socket());
}

export function getCustomSocket(
    id: string = nanoid.nanoid(8),
    state: Mode | undefined = undefined,
    mode: ConnectionMode = ConnectionMode.RAW
) {
    mockNetConnect();
    return new CustomSocket(id, "can://127.0.0.1:29536", "29536", "127.0.0.1", state, "can0", mode);
}

export function getCustomSocketUndefined(
    id: string,
    state: Mode | undefined = undefined,
    mode: ConnectionMode = ConnectionMode.RAW
) {
    mockNetConnect();
    return new CustomSocket(id, "", "", "", state, "", mode);
}

export function getSocketPoint() {
    return new SocketPoint(
        "fqdn_host_one",
        "can://127.0.0.1:29536",
        [{name: "can0"}, {name: "can1"}, {name: "can2"}],
        Date.now()
    );
}

export function cloneSocketPoint(sp: SocketPoint) {
    return new SocketPoint(sp.host, sp.url, [...sp.buses], sp.time);
}
