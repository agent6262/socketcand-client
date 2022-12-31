import {SocketPoint} from "../models/SocketPoint";
import nanoid from "nanoid";
import {CustomSocket} from "../models/CustomSocket";
import {Mode} from "../types/Mode";
import {activeConnections, disconnect} from "./Util";
import {isotpConfig, sendPdu} from "./ISOTP";

describe("Util Functions", () => {
    describe("sendPdu", () => {
        let socketId = nanoid.nanoid(8);
        let pduData = "5616 5165 1321 51 651 45";
        const customSocket = new CustomSocket(
            undefined,
            socketId,
            "can://127.0.0.1:29536",
            Mode.ISOTP
        );
        customSocket.write = jest.fn().mockImplementation((value: string) => {return value});

        it("should return error when unable to find CustomSocket.", () => {
            let result = sendPdu(socketId, pduData);

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in ISOTP state.", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id));

            let result = sendPdu(id, pduData);
            expect(result).toStrictEqual(new Error("ERROR cannot send pdu, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in ISOTP state.", () => {
            activeConnections.push(customSocket);

            let result = sendPdu(socketId, pduData);
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< sendpdu 5616516513215165145 >")

            disconnect(socketId);
        });
    });
    describe("isotpConfig", () => {
        let socketId = nanoid.nanoid(8);
        let txId = "1F998877";
        let rxId = "1F998876";
        let flags = "C";
        let blockSize = "4";
        let stMin = "0";
        const customSocket = new CustomSocket(
            undefined,
            socketId,
            "can://127.0.0.1:29536",
            Mode.ISOTP
        );
        customSocket.write = jest.fn().mockImplementation((value: string) => {return value});

        it("should return error when unable to find CustomSocket.", () => {
            let result = isotpConfig(socketId, txId, rxId, flags, blockSize, stMin);

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in ISOTP state.", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id));

            let result = isotpConfig(id, txId, rxId, flags, blockSize, stMin);
            expect(result).toStrictEqual(new Error("ERROR cannot change isotp config, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in ISOTP state with minimum data.", () => {
            activeConnections.push(customSocket);

            let result = isotpConfig(socketId, txId, rxId, flags, blockSize, stMin);
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< isotpconf 1F998877 1F998876 C 4 0 >")

            disconnect(socketId);
        });

        it("should write data to socket when in ISOTP state with maximum data.", () => {
            activeConnections.push(customSocket);

            let result = isotpConfig(socketId, txId, rxId, flags, blockSize, stMin, "0", "1", "2", "true", "true");
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< isotpconf 1F998877 1F998876 C 4 0 0 1 2 true true >")

            disconnect(socketId);
        });
    });
});