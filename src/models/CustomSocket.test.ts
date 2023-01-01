const scd = require("../index");
import {CustomSocket} from "./CustomSocket";
import {Mode} from "../types/Mode";
import nanoid from "nanoid";

describe("CustomSocket", () => {
    describe("onClose", () => {
        const customSocket = new CustomSocket(
            undefined,
            nanoid.nanoid(8),
            "can://127.0.0.1:29536",
            Mode.RAW
        );

        it("should emit object on 'disconnected' when socket is closed.", () => {
            let fnMock = jest.fn().mockImplementation();
            let obj = {url: customSocket.url, id: customSocket.id};
            scd.getEmitter().on('disconnected', fnMock);

            customSocket.onClose();

            expect(fnMock).toBeCalledWith(obj);
        });
    });
    describe("onDataRaw", () => {
        const customSocket = new CustomSocket(
            undefined,
            nanoid.nanoid(8),
            "can://127.0.0.1:29536",
            Mode.RAW
        );

        it("should emit string on 'data' when socket is in raw mode.", () => {
            let fnMock = jest.fn().mockImplementation();
            let strData = "< frame 123 23.424242 11 22 33 44 >";
            let buffer = Buffer.from(strData, 'utf-8');
            scd.getEmitter().on('data', fnMock);

            customSocket.onDataRaw(buffer)

            expect(fnMock).toBeCalledWith(strData);
        });
    });
    describe("onDataControl", () => {
        it("should return error if id is not defined.", () => {
            const customSocketTest = new CustomSocket(undefined, undefined, "can://127.0.0.1:29536", Mode.RAW, "can0");
            let buffer = Buffer.from("< hi >", 'utf-8');

            let result = customSocketTest.onDataControl(buffer);

            expect(result).toStrictEqual(new Error("Invalid state, id not defined"));
        });

        it("should emit obj on 'connected', set socket state, and send open command to socket.", () => {
            const customSocketTest = new CustomSocket(undefined, nanoid.nanoid(8), "can://127.0.0.1:29536", Mode.RAW, "can0");
            customSocketTest.write = jest.fn().mockImplementation((value: string) => {
                return value
            });
            let fnMock = jest.fn().mockImplementation();
            let buffer = Buffer.from("< hi >", 'utf-8');
            scd.getEmitter().on('connected', fnMock);

            customSocketTest.onDataControl(buffer);

            expect(customSocketTest.write).toHaveReturnedWith('< open can0 >');
            expect(customSocketTest.state).toBe(Mode.BCM);
            expect(fnMock).toBeCalledWith({url: customSocketTest.url, id: customSocketTest.id});
        });

        it("should do nothing if 'ok' frame.", () => {
            const customSocketTest = new CustomSocket(undefined, nanoid.nanoid(8), "can://127.0.0.1:29536", Mode.RAW, "can0");
            let buffer = Buffer.from("< ok >", 'utf-8');

            let result = customSocketTest.onDataControl(buffer);

            expect(result).toBe(undefined);
        });

        it("should emit obj on 'frame'.", () => {
            const customSocketTest = new CustomSocket(undefined, nanoid.nanoid(8), "can://127.0.0.1:29536", Mode.RAW, "can0");
            let fnMock = jest.fn().mockImplementation();
            let buffer = Buffer.from("< frame 123 23.424242 11 22 33 44 >", 'utf-8');
            scd.getEmitter().on('frame', fnMock);

            let result = customSocketTest.onDataControl(buffer);

            expect(result).toBe(undefined);
            expect(fnMock).toBeCalledWith({
                id: "123",
                sec: "23",
                usec: "424242",
                data: "11 22 33 44",
                bus: customSocketTest.bus,
                url: customSocketTest.url,
                sockId: customSocketTest.id,
                mode: customSocketTest.state
            });
        });

        it("should return error if frame is not correct size.", () => {
            const customSocketTest = new CustomSocket(undefined, nanoid.nanoid(8), "can://127.0.0.1:29536", Mode.RAW, "can0");
            let buffer = Buffer.from("< frame 123 23.424242 >", 'utf-8');

            let result = customSocketTest.onDataControl(buffer);

            expect(result).toStrictEqual(new Error("Error could not parse received frame, protocol inconsistency"));
        });

        it("should return error if frame is unknown.", () => {
            const customSocketTest = new CustomSocket(undefined, nanoid.nanoid(8), "can://127.0.0.1:29536", Mode.RAW, "can0");
            let buffer = Buffer.from("< hidden_test 1 6 8 1 3 5 6 >", 'utf-8');

            let result = customSocketTest.onDataControl(buffer);

            expect(result).toStrictEqual(new Error("Error could not parse received frame, not implemented"));
        });
    });
});