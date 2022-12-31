import nanoid from "nanoid";
import {CustomSocket} from "../models/CustomSocket";
import {Mode} from "../types/Mode";
import {activeConnections, disconnect} from "./Util";
import {addFrame, deleteFrame, filter, sendFrame, subscribe, unsubscribe, updateFrame} from "./BCM";

describe("BCM", () => {
    describe("unsubscribe", () => {
        let socketId = nanoid.nanoid(8);
        const customSocket = new CustomSocket(
            undefined,
            socketId,
            "can://127.0.0.1:29536",
            Mode.BCM
        );
        customSocket.write = jest.fn().mockImplementation((value: string) => {return value});

        it("should return error when unable to find CustomSocket.", () => {
            let result = unsubscribe(socketId, "123");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id, undefined, undefined));

            let result = unsubscribe(id, "123");
            expect(result).toStrictEqual(new Error('ERROR cannot unsubscribe, wrong state'));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            let result = unsubscribe(socketId, "123");
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< unsubscribe 123 >");

            disconnect(socketId);
        });
    });
    describe("subscribe", () => {
        let socketId = nanoid.nanoid(8);
        const customSocket = new CustomSocket(
            undefined,
            socketId,
            "can://127.0.0.1:29536",
            Mode.BCM
        );
        customSocket.write = jest.fn().mockImplementation((value: string) => {return value});

        it("should return error when unable to find CustomSocket.", () => {
            let result = subscribe(socketId, "123", 123, 12345);

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id, undefined, undefined));

            let result = subscribe(id, "123", 123, 12345);
            expect(result).toStrictEqual(new Error('ERROR cannot subscribe, wrong state'));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            let result = subscribe(socketId, "123", 123, 12345);
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< subscribe 123 12345 123 >");

            disconnect(socketId);
        });
    });
    describe("filter", () => {
        let socketId = nanoid.nanoid(8);
        const customSocket = new CustomSocket(
            undefined,
            socketId,
            "can://127.0.0.1:29536",
            Mode.BCM
        );
        customSocket.write = jest.fn().mockImplementation((value: string) => {return value});

        it("should return error when unable to find CustomSocket.", () => {
            let result = filter(socketId, "123", 123, 12345, 4, "FF");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id, undefined, undefined));

            let result = filter(id, "123", 123, 12345, 4, "FF");
            expect(result).toStrictEqual(new Error('ERROR cannot filter, wrong state'));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            let result = filter(socketId, "123", 123, 12345, 4, "FF");
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< filter 123 123 12345 4 FF >");

            disconnect(socketId);
        });
    });
    describe("sendFrame", () => {
        let socketId = nanoid.nanoid(8);
        const customSocket = new CustomSocket(
            undefined,
            socketId,
            "can://127.0.0.1:29536",
            Mode.BCM
        );
        customSocket.write = jest.fn().mockImplementation((value: string) => {return value});

        it("should return error when unable to find CustomSocket.", () => {
            let result = sendFrame(socketId, "123", 4, "");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id, undefined, undefined));

            let result = sendFrame(id, "123", 4, "");
            expect(result).toStrictEqual(new Error('ERROR cannot send frame, wrong state'));

            disconnect(id);
        });

        it("should write data to socket when in a state and not modify data.", () => {
            activeConnections.push(customSocket);

            let result = sendFrame(socketId, "123", 4, "FF C9 B4 D6");
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< send 123 4 FF C9 B4 D6 >");

            disconnect(socketId);
        });

        it("should write data to socket when in a state and modify data.", () => {
            activeConnections.push(customSocket);

            let result = sendFrame(socketId, "123", 4, " F F C9B4 D 6 C8A6B1", true);
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< send 123 4 FF C9 B4 D6 C8 A6 B1 >");

            disconnect(socketId);
        });
    });
    describe("deleteFrame", () => {
        let socketId = nanoid.nanoid(8);
        const customSocket = new CustomSocket(
            undefined,
            socketId,
            "can://127.0.0.1:29536",
            Mode.BCM
        );
        customSocket.write = jest.fn().mockImplementation((value: string) => {return value});

        it("should return error when unable to find CustomSocket.", () => {
            let result = deleteFrame(socketId, "123");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id, undefined, undefined));

            let result = deleteFrame(id, "123");
            expect(result).toStrictEqual(new Error('ERROR cannot delete frame, wrong state'));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            let result = deleteFrame(socketId, "123");
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< delete 123 >");

            disconnect(socketId);
        });
    });
    describe("updateFrame", () => {
        let socketId = nanoid.nanoid(8);
        const customSocket = new CustomSocket(
            undefined,
            socketId,
            "can://127.0.0.1:29536",
            Mode.BCM
        );
        customSocket.write = jest.fn().mockImplementation((value: string) => {return value});

        it("should return error when unable to find CustomSocket.", () => {
            let result = updateFrame(socketId, "123", 4, "F1C6");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id, undefined, undefined));

            let result = updateFrame(id, "123", 4, "F1C6");
            expect(result).toStrictEqual(new Error('ERROR cannot update frame, wrong state'));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            let result = updateFrame(socketId, "123", 4, "F1C6");
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< update 123 4 F1C6 >");

            disconnect(socketId);
        });
    });
    describe("addFrame", () => {
        let socketId = nanoid.nanoid(8);
        const customSocket = new CustomSocket(
            undefined,
            socketId,
            "can://127.0.0.1:29536",
            Mode.BCM
        );
        customSocket.write = jest.fn().mockImplementation((value: string) => {return value});

        it("should return error when unable to find CustomSocket.", () => {
            let result = addFrame(socketId, "123", 12, 12345, 4, "F1C6");

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id, undefined, undefined));

            let result = addFrame(id, "123", 12, 12345, 4, "F1C6");
            expect(result).toStrictEqual(new Error('Cannot add frame, wrong state'));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            let result = addFrame(socketId, "123", 12, 12345, 4, "F1C6");
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< add 12 12345 123 4 F1C6 >");

            disconnect(socketId);
        });
    });
});