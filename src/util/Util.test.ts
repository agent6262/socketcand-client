import {
    activeConnections,
    broadcastNewClient,
    channelMode, connect,
    disconnect,
    echo,
    findIndexCallback, getConnectionFromId
} from "./Util";
import {SocketPoint} from "../models/SocketPoint";
import {CustomSocket} from "../models/CustomSocket";
import {Mode} from "../types/Mode";
import nanoid from "nanoid";


describe("Util Functions", () => {
    describe("broadcastNewClient", () => {
        let consoleLogSpy: jest.SpyInstance;
        const socketPoint = new SocketPoint(
            "fqdn_host_one",
            "can://127.0.0.1:29536",
            [{name: "can0"}, {name: "can1"}, {name: "can2"}],
            Date.now()
        );

        beforeAll(() => {
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        });

        afterAll(() => {
            consoleLogSpy.mockRestore();
        });

        it("should call console.log with new client if bool is missing.", () => {
            broadcastNewClient(socketPoint);
            expect(consoleLogSpy).toBeCalledWith("New Client: can0,can1,can2@fqdn_host_one (can://127.0.0.1:29536)");
        });

        it("should call console.log with new client if bool is false.", () => {
            broadcastNewClient(socketPoint, false);
            expect(consoleLogSpy).toBeCalledWith("New Client: can0,can1,can2@fqdn_host_one (can://127.0.0.1:29536)");
        });

        it("should call console.log with update client if bool is true.", () => {
            broadcastNewClient(socketPoint, true);
            expect(consoleLogSpy).toBeCalledWith("Updated Client: can0,can1,can2@fqdn_host_one (can://127.0.0.1:29536)");
        });
    });
    describe("findIndexCallback", () => {
        const testArray = [5, 6, 8, 4, 3, 1, 7, 9, 2, 3];
        const predicateFn = (value: number) => value === 3;
        const predicateFnBad = (value: number) => value === 10;

        it("should call function if index is greater than -1.", () => {
            const callbackFunctionTrue = jest.fn();
            const callbackFunctionFalse = jest.fn();
            findIndexCallback(testArray, predicateFn, callbackFunctionTrue, callbackFunctionFalse);

            expect(callbackFunctionTrue).toBeCalled();
            expect(callbackFunctionFalse).not.toBeCalled();
        });

        it("should call function if index is -1.", () => {
            const callbackFunctionTrue = jest.fn();
            const callbackFunctionFalse = jest.fn();
            findIndexCallback(testArray, predicateFnBad, callbackFunctionTrue, callbackFunctionFalse);

            expect(callbackFunctionFalse).toBeCalled();
            expect(callbackFunctionTrue).not.toBeCalled();
        });
    });
    describe("echo", () => {
        let socketId = nanoid.nanoid(8);
        const customSocket = new CustomSocket(
            undefined,
            socketId,
            "can://127.0.0.1:29536",
            Mode.RAW
        );
        customSocket.write = jest.fn().mockImplementation((value: string) => {return value});

        it("should return error when unable to find CustomSocket.", () => {
            let result = echo(socketId);

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id, undefined, undefined));

            let result = echo(id);
            expect(result).toStrictEqual(new Error('ERROR no open channel'));

            disconnect(id);
        });

        it("should write data to socket when in a state.", () => {
            activeConnections.push(customSocket);

            let result = echo(socketId);
            expect(result).toBe(undefined);
            expect(customSocket.write).toHaveReturnedWith("< echo >");

            disconnect(socketId);
        });
    });
    describe("channelMode", () => {
        let socketId = nanoid.nanoid(8);

        it("should return error when unable to find CustomSocket.", () => {
            let result = channelMode(socketId, Mode.BCM);

            expect(result).toStrictEqual(new Error("Socket not found for id " + socketId));
        });

        it("should return error when not in any state (undefined).", () => {
            let id = nanoid.nanoid(8);
            activeConnections.push(new CustomSocket(undefined, id, undefined, undefined));

            let result = channelMode(id, Mode.BCM);
            expect(result).toStrictEqual(new Error('ERROR no open channel'));

            disconnect(id);
        });

        it("should write data to socket and change mode when not in requested mode (BCM).", () => {
            let id = nanoid.nanoid(8);
            let customSocketTest = new CustomSocket(undefined, id, undefined, Mode.RAW);
            customSocketTest.write = jest.fn().mockImplementation((value: string) => {return value});
            activeConnections.push(customSocketTest);

            let result = channelMode(id, Mode.BCM);
            expect(result).toBe(undefined);
            expect(customSocketTest.write).toHaveReturnedWith("< bcmmode >")
            expect(customSocketTest.state).toBe(Mode.BCM);

            disconnect(socketId);
        });

        it("should write data to socket and change mode when not in requested mode (RAW).", () => {
            let id = nanoid.nanoid(8);
            let customSocketTest = new CustomSocket(undefined, id, undefined, Mode.BCM);
            customSocketTest.write = jest.fn().mockImplementation((value: string) => {return value});
            activeConnections.push(customSocketTest);

            let result = channelMode(id, Mode.RAW);
            expect(result).toBe(undefined);
            expect(customSocketTest.write).toHaveReturnedWith("< rawmode >")
            expect(customSocketTest.state).toBe(Mode.RAW);

            disconnect(socketId);
        });

        it("should write data to socket and change mode when not in requested mode (BCM).", () => {
            let id = nanoid.nanoid(8);
            let customSocketTest = new CustomSocket(undefined, id, undefined, Mode.BCM);
            customSocketTest.write = jest.fn().mockImplementation((value: string) => {return value});
            activeConnections.push(customSocketTest);

            let result = channelMode(id, Mode.ISOTP);
            expect(result).toBe(undefined);
            expect(customSocketTest.write).toHaveReturnedWith("< isotpmode >")
            expect(customSocketTest.state).toBe(Mode.ISOTP);

            disconnect(socketId);
        });
    });
    describe("disconnect", () => {
        it("should not contain the socket when removed.", () => {
            let id = nanoid.nanoid(8);
            let customSocketTest = new CustomSocket(undefined, id, "can://127.0.0.1:29536", Mode.BCM);
            activeConnections.push(customSocketTest);

            expect(activeConnections).toContainEqual(customSocketTest)
            disconnect(id);
            expect(activeConnections).not.toContainEqual(customSocketTest);
        });

        it("should not change the array when the socket can not be found.", () => {
            let id = nanoid.nanoid(8);
            let customSocketTest = new CustomSocket(undefined, id, "can://127.0.0.1:29536", Mode.BCM);
            customSocketTest.destroy = jest.fn().mockImplementation();
            activeConnections.push(new CustomSocket(undefined, nanoid.nanoid(8), "can://127.0.0.1:29536", Mode.RAW));

            expect(activeConnections).not.toContainEqual(customSocketTest)
            disconnect(id);
            expect(customSocketTest.destroy).not.toHaveBeenCalled();
        });
    });
    describe("connect", () => {
        it("should return error if protocol is not 'can:'.", () => {
            let result = connect("ftp://127.0.0.1:29536/can0");

            expect(result).toStrictEqual(new Error("Wrong protocol in url only accept 'can:'"));
        });

        it("should return error if url is malformed.", () => {
            let result = connect("");

            expect(result).toStrictEqual(new Error("Url malformed"));
        });

        it("should return socket id and store socket in array.", () => {
            let bus = "can0";
            let url = "can://127.0.0.1:29536/"+bus;
            let result = connect(url);
            let socket = getConnectionFromId(<string>result);

            expect(result).not.toBeInstanceOf(Error);
            expect(result).toHaveLength(8);
            expect(socket).not.toBe(undefined);
            expect(socket?.id).toEqual(result);
            expect(socket?.url).toEqual(url);
            expect(socket?.bus).toEqual(bus);
            expect(socket?.state).toBe(undefined);

            disconnect(<string>result);
        });
    });
});
