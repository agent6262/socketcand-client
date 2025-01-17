import {SocketPoint} from "./models/SocketPoint";
import {BusName} from "./models/BusName";
import {CanBeaconObj} from "./types/CANBeacon";
import {Mode, modeFromString, modeToString} from "./types/Mode";
import {
    broadcastNewClient,
    channelMode,
    connect,
    disconnect,
    echo,
    findIndexCallback,
    getConnectionFromId,
    getConnectionFromUrl
} from "./util/Util";
import * as dgram from "dgram";
import {EventEmitter} from "events";
import {parseString} from "xml2js";
import {isotpConfig, sendPdu} from "./util/ISOTP";
import {addFrame, deleteFrame, filter, sendFrame, subscribe, unsubscribe, updateFrame} from "./util/BCM";
import {ConnectionMode} from "./types/ConnectionMode";
import {CustomSocket} from "./models/CustomSocket";
import {ConnectionObj} from "./models/ConnectionObj";
import {FrameObj} from "./models/FrameObj";

const emitter = new EventEmitter();
let timer: NodeJS.Timer;

export function getEmitter() {
    return emitter;
}

const baseSocketPoints = new Array<SocketPoint>();
let lastBaseSocketPoints = new Array<SocketPoint>();
let baseSocket: dgram.Socket;

function onListen() {
    const address = baseSocket.address();
    console.log(`socketcand-client listening ${address.address}:${address.port}`);
}

function onError(err: Error) {
    console.log(`Server error:\n${err.stack}`);
    baseSocket.close();
    return new Error("Server error:\n${err.stack}");
}

function onMessage(msg: Buffer) {
    parseString(msg, (err: Error | null, result: CanBeaconObj) => {
        const obj = new SocketPoint(
            result.CANBeacon.$.name.trim(),
            result.CANBeacon.URL[0].trim(),
            result.CANBeacon.Bus.map<BusName>((bus) => {
                return new BusName(bus.$.name.trim());
            }),
            Date.now()
        );

        findIndexCallback(
            baseSocketPoints,
            (x) => x.host === obj.host,
            (index) => {
                baseSocketPoints[index].equals(
                    obj,
                    () => {
                        baseSocketPoints[index] = obj;
                    },
                    () => {
                        baseSocketPoints[index] = obj;
                        broadcastNewClient(obj, true);
                    }
                );
            },
            () => {
                baseSocketPoints.push(obj);
                broadcastNewClient(obj);
            }
        );

        if (!arrayEquals(baseSocketPoints, lastBaseSocketPoints)) {
            lastBaseSocketPoints = [...baseSocketPoints];
            getEmitter().emit("connectionPoints", baseSocketPoints);
        }
    });
}

function start() {
    baseSocket = dgram.createSocket("udp4");

    timer = setInterval(() => {
        baseSocketPoints
            .filter((value) => value.time < Date.now() - 4000)
            .map((value, index) => index)
            .forEach((value) => baseSocketPoints.splice(value, 1));
        if (!arrayEquals(baseSocketPoints, lastBaseSocketPoints)) {
            lastBaseSocketPoints = [...baseSocketPoints];
            getEmitter().emit("connectionPoints", baseSocketPoints);
        }
    }, 4000);

    baseSocket.on("listening", onListen);
    baseSocket.on("error", onError);
    baseSocket.on("message", onMessage);
    baseSocket.bind(42000);
}

function stop() {
    clearInterval(timer);
    baseSocket.close();
}

function getConnectionPoints() {
    return baseSocketPoints;
}

function arrayEquals(a: Array<SocketPoint>, b: Array<SocketPoint>) {
    return a.length === b.length && a.every((val, index) => val.equals(b[index]));
}

export default getEmitter;

export {
    Mode,
    ConnectionMode,
    BusName,
    CustomSocket,
    SocketPoint,
    ConnectionObj,
    FrameObj,
    start,
    stop,
    getConnectionPoints,
    getConnectionFromUrl,
    getConnectionFromId,
    findIndexCallback,
    modeFromString,
    modeToString,
    connect,
    disconnect,
    channelMode,
    addFrame,
    updateFrame,
    deleteFrame,
    sendFrame,
    filter,
    subscribe,
    unsubscribe,
    echo,
    isotpConfig,
    sendPdu
};
