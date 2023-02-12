import nanoid from "nanoid";
import {Mode} from "../../types/Mode";
import {activeConnections, disconnect} from "../Util";
import {addFrame, deleteFrame, filter, sendFrame, subscribe, unsubscribe, updateFrame} from "../BCM";
import {ConnectionMode} from "../../types/ConnectionMode";
import {getCustomSocket, getCustomSocketUndefined} from "../../__test__/TestHelpers";
import {CustomSocket} from "../../models/CustomSocket";

let customSocket: CustomSocket;
let socketId: string;
beforeEach(() => {
    socketId = nanoid.nanoid(8);
    customSocket = getCustomSocket(socketId, Mode.BCM, ConnectionMode.CONTROLLED);
    customSocket.socket.write = jest.fn().mockImplementation((value: string) => {
        return value;
    });
});

describe("BCM", () => {
    describe("unsubscribe", () => {
        it("should return error when unable to find CustomSocket.", () => {
            const result = unsubscribe(socketId, "123");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            const id = nanoid.nanoid(8);
            activeConnections.push(getCustomSocketUndefined(id, undefined, ConnectionMode.CONTROLLED));

            const result = unsubscribe(id, "123");
            expect(result).toStrictEqual(new Error("ERROR cannot unsubscribe, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            const result = unsubscribe(socketId, "123");
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith("< unsubscribe 123 >");

            disconnect(socketId);
        });
    });
    describe("subscribe", () => {
        it("should return error when unable to find CustomSocket.", () => {
            const result = subscribe(socketId, "123", 123, 12345);

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            const id = nanoid.nanoid(8);
            activeConnections.push(getCustomSocketUndefined(id, undefined, ConnectionMode.CONTROLLED));

            const result = subscribe(id, "123", 123, 12345);
            expect(result).toStrictEqual(new Error("ERROR cannot subscribe, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            const result = subscribe(socketId, "123", 123, 12345);
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith("< subscribe 123 12345 123 >");

            disconnect(socketId);
        });
    });
    describe("filter", () => {
        it("should return error when unable to find CustomSocket.", () => {
            const result = filter(socketId, "123", 123, 12345, 4, "FF");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            const id = nanoid.nanoid(8);
            activeConnections.push(getCustomSocketUndefined(id, undefined, ConnectionMode.CONTROLLED));

            const result = filter(id, "123", 123, 12345, 4, "FF");
            expect(result).toStrictEqual(new Error("ERROR cannot filter, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            const result = filter(socketId, "123", 123, 12345, 4, "FF");
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith("< filter 123 123 12345 4 FF >");

            disconnect(socketId);
        });
    });
    describe("sendFrame", () => {
        it("should return error when unable to find CustomSocket.", () => {
            const result = sendFrame(socketId, "123", "4", "");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            const id = nanoid.nanoid(8);
            activeConnections.push(getCustomSocketUndefined(id, undefined, ConnectionMode.CONTROLLED));

            const result = sendFrame(id, "123", "4", "");
            expect(result).toStrictEqual(new Error("ERROR cannot send frame, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in a state and not modify data.", () => {
            activeConnections.push(customSocket);

            const result = sendFrame(socketId, "123", "4", "FF C9 B4 D6");
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith("< send 123 4 FF C9 B4 D6 >");

            disconnect(socketId);
        });

        it("should write data to socket when in a state and modify data.", () => {
            activeConnections.push(customSocket);

            const result = sendFrame(socketId, "123", "4", " F F C9B4 D 6 C8A6B1", true);
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith("< send 123 4 FF C9 B4 D6 C8 A6 B1 >");

            disconnect(socketId);
        });
    });
    describe("deleteFrame", () => {
        it("should return error when unable to find CustomSocket.", () => {
            const result = deleteFrame(socketId, "123");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            const id = nanoid.nanoid(8);
            activeConnections.push(getCustomSocketUndefined(id, undefined, ConnectionMode.CONTROLLED));

            const result = deleteFrame(id, "123");
            expect(result).toStrictEqual(new Error("ERROR cannot delete frame, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            const result = deleteFrame(socketId, "123");
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith("< delete 123 >");

            disconnect(socketId);
        });
    });
    describe("updateFrame", () => {
        it("should return error when unable to find CustomSocket.", () => {
            const result = updateFrame(socketId, "123", 4, "F1C6");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            const id = nanoid.nanoid(8);
            activeConnections.push(getCustomSocketUndefined(id, undefined, ConnectionMode.CONTROLLED));

            const result = updateFrame(id, "123", 4, "F1C6");
            expect(result).toStrictEqual(new Error("ERROR cannot update frame, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            const result = updateFrame(socketId, "123", 4, "F1C6");
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith("< update 123 4 F1C6 >");

            disconnect(socketId);
        });
    });
    describe("addFrame", () => {
        it("should return error when unable to find CustomSocket.", () => {
            const result = addFrame(socketId, "123", 12, 12345, 4, "F1C6");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            const id = nanoid.nanoid(8);
            activeConnections.push(getCustomSocketUndefined(id, undefined, ConnectionMode.CONTROLLED));
            const result = addFrame(id, "123", 12, 12345, 4, "F1C6");
            expect(result).toStrictEqual(new Error("Cannot add frame, wrong state"));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            const result = addFrame(socketId, "123", 12, 12345, 4, "F1C6");
            expect(result).toBe(undefined);
            expect(customSocket.socket.write).toHaveReturnedWith("< add 12 12345 123 4 F1C6 >");

            disconnect(socketId);
        });
    });
});
