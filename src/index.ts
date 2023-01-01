import {SocketPoint} from "./models/SocketPoint";
import {BusName} from "./models/BusName";
import {CanBeaconObj} from "./types/CANBeacon";
import {Mode} from "./types/Mode";
import {broadcastNewClient, channelMode, connect, disconnect, echo, findIndexCallback} from "./util/Util";
import * as dgram from "dgram";
import {EventEmitter} from "events";
import {parseString} from "xml2js";
import {isotpConfig, sendPdu} from "./util/ISOTP";
import {addFrame, deleteFrame, filter, sendFrame, subscribe, unsubscribe, updateFrame} from "./util/BCM";
import {ConnectionMode} from "./types/ConnectionMode";
import {CustomSocket} from "./models/CustomSocket";

const emitter = new EventEmitter();

export function getEmitter() {
    return emitter;
}

const baseSocketPoints = new Array<SocketPoint>();
let lastBaseSocketPoints = new Array<SocketPoint>();
const baseSocket = dgram.createSocket('udp4');
setInterval(() => {
    baseSocketPoints
        .filter(value => value.time < (Date.now() - 3000))
        .map((value, index) => index)
        .forEach(value => baseSocketPoints.splice(value, 1))
}, 3000);
baseSocket.on('listening', () => {
    let address = baseSocket.address();
    console.log(`socketcand-client listening ${address.address}:${address.port}`);
});
baseSocket.on('error', (err: Error) => {
    console.log(`Server error:\n${err.stack}`);
    baseSocket.close();
    return new Error("Server error:\n${err.stack}");
});
baseSocket.on('message', (msg: Buffer) => {
    parseString(msg, (err: Error | null, result: CanBeaconObj) => {
        let obj = new SocketPoint(
            result.CANBeacon.$.name.trim(),
            result.CANBeacon.URL[0].trim(),
            result.CANBeacon.Bus.map<BusName>(bus => {
                return new BusName(bus.$.name.trim());
            }),
            Date.now()
        );

        findIndexCallback(baseSocketPoints, x => x.host === obj.host, index => {
            baseSocketPoints[index].equals(obj, () => {
                baseSocketPoints[index] = obj;
            }, () => {
                baseSocketPoints[index] = obj;
                broadcastNewClient(obj, true);
            });
        }, () => {
            baseSocketPoints.push(obj);
            broadcastNewClient(obj);
        })

        if (!arrayEquals(baseSocketPoints, lastBaseSocketPoints)) {
            lastBaseSocketPoints = [...baseSocketPoints];
            getEmitter().emit('connectionPoints', baseSocketPoints);
        }
    });
});

function start() {
    baseSocket.bind(42000);
}

function getConnectionPoints() {
    return baseSocketPoints;
}

function arrayEquals(a: Array<SocketPoint>, b: Array<SocketPoint>) {
    return a.length === b.length &&
        a.every((val, index) => val.equals(b[index]));
}

export default getEmitter;

export {
    Mode,
    ConnectionMode,
    BusName,
    CustomSocket,
    SocketPoint,
    start,
    getConnectionPoints,
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


