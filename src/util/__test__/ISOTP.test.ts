import nanoid from "nanoid";
import {CustomSocket} from "../../models/CustomSocket";
import {Mode} from "../../types/Mode";
import {activeConnections, disconnect} from "../Util";
import {isotpConfig, sendPdu} from "../ISOTP";
import {ConnectionMode} from "../../types/ConnectionMode";
import {getCustomSocket} from "../../__test__/TestHelpers";

let customSocket: CustomSocket;
let socketId: string;
beforeEach(() => {
    socketId = nanoid.nanoid(8);
    customSocket = getCustomSocket(socketId, Mode.ISOTP, ConnectionMode.CONTROLLED);
    customSocket.socket.write = jest.fn().mockImplementation((value: string) => {
        return value;
    });
});

describe("Util Functions", () => {
    describe("sendPdu", () => {
        const pduData = "5616 5165 1321 51 651 45";

        it("should return error when unable to find CustomSocket.", () => {
            const result = sendPdu(socketId, pduData);

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in ISOTP state.", () => {
            const id = nanoid.nanoid(8);
            activeConnections.push(
                new CustomSocket(id, "", "", "", undefined, "", ConnectionMode.CONTROLLED)
            );

            const result = sendPdu(id, pduData);
            expect(result).toStrictEqual(new Error("ERROR cannot send pdu, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in ISOTP state.", () => {
            activeConnections.push(customSocket);

            const result = sendPdu(socketId, pduData);
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith("< sendpdu 5616516513215165145 >");

            disconnect(socketId);
        });
    });
    describe("isotpConfig", () => {
        const txId = "1F998877";
        const rxId = "1F998876";
        const flags = "C";
        const blockSize = "4";
        const stMin = "0";

        it("should return error when unable to find CustomSocket.", () => {
            const result = isotpConfig(socketId, txId, rxId, flags, blockSize, stMin);

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in ISOTP state.", () => {
            const id = nanoid.nanoid(8);
            activeConnections.push(
                new CustomSocket(id, "", "", "", undefined, "", ConnectionMode.CONTROLLED)
            );

            const result = isotpConfig(id, txId, rxId, flags, blockSize, stMin);
            expect(result).toStrictEqual(new Error("ERROR cannot change isotp config, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in ISOTP state with minimum data.", () => {
            activeConnections.push(customSocket);

            const result = isotpConfig(socketId, txId, rxId, flags, blockSize, stMin);
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith("< isotpconf 1F998877 1F998876 C 4 0 >");

            disconnect(socketId);
        });

        it("should write data to socket when in ISOTP state with maximum data.", () => {
            activeConnections.push(customSocket);

            const result = isotpConfig(
                socketId,
                txId,
                rxId,
                flags,
                blockSize,
                stMin,
                "0",
                "1",
                "2",
                "true",
                "true"
            );
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith(
                "< isotpconf 1F998877 1F998876 C 4 0 0 1 2 true true >"
            );

            disconnect(socketId);
        });
    });
});
