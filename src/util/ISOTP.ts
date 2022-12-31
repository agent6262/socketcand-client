import {Mode} from "../types/Mode";
import {getConnectionFromId} from "./Util";

export function isotpConfig(sockId: string,
                            txId: string,
                            rxId: string,
                            flags: string,
                            blockSize: string,
                            stMin: string,
                            wftMax?: string,
                            txPad?: string,
                            rxPad?: string,
                            extAddr?: string,
                            rxExtAddr?: string) {
    const scc = getConnectionFromId(sockId);
    if (scc == undefined) {
        return new Error("Socket not found for id " + sockId);
    }

    if (scc.state == Mode.ISOTP) {
        let str = '< isotpconf ' + txId + ' ' + rxId + ' ' + flags + ' ' + blockSize + ' ' + stMin;
        str += wftMax === undefined ? '' : ' ' + wftMax;
        str += wftMax === undefined ? '' : ' ' + txPad;
        str += wftMax === undefined ? '' : ' ' + rxPad;
        str += wftMax === undefined ? '' : ' ' + extAddr;
        str += wftMax === undefined ? '' : ' ' + rxExtAddr;
        str += ' >';
        scc.write(str);
    } else {
        return new Error('ERROR cannot change isotp config, wrong state');
    }
}

export function sendPdu(sockId: string, data: string) {
    const scc = getConnectionFromId(sockId);
    if (scc == undefined) return new Error("Socket not found for id " + sockId);

    if (scc.state === Mode.ISOTP) {
        scc.write('< sendpdu ' + data.split(" ").join("") + ' >');
    } else {
        return new Error('ERROR cannot send pdu, wrong state');
    }
}