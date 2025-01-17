import {Mode} from "../../types/Mode";
import {CustomSocket} from "../CustomSocket";
import {ConnectionObj} from "../ConnectionObj";
import {FrameObj} from "../FrameObj";
import getEmitter from "../../index";
import {getCustomSocket} from "../../__test__/TestHelpers";

let customSocket: CustomSocket;
beforeEach(() => {
    customSocket = getCustomSocket();
});

describe("CustomSocket", () => {
    describe("onClose", () => {
        it("should emit object on 'disconnected' when socket is closed.", () => {
            const fnMock = jest.fn().mockImplementation();
            const obj = new ConnectionObj(customSocket.url, customSocket.id);
            getEmitter().on("disconnected", fnMock);

            customSocket.onClose();

            expect(fnMock).toBeCalledWith(obj);
        });
    });
    describe("onDataRaw", () => {
        it("should emit string on 'data' when socket is in raw mode.", () => {
            const fnMock = jest.fn().mockImplementation();
            const strData = "< frame 123 23.424242 11 22 33 44 >";
            const buffer = Buffer.from(strData, "utf-8");
            getEmitter().on("data", fnMock);

            customSocket.onDataRaw(buffer);

            expect(fnMock).toBeCalledWith(strData);
        });
    });
    describe("onDataControl", () => {
        it("should emit obj on 'connected', set socket state, and send open command to socket.", () => {
            const customSocketTest = getCustomSocket();

            customSocketTest.socket.write = jest.fn().mockImplementation((value: string) => {
                return value;
            });
            const fnMock = jest.fn().mockImplementation();
            const buffer = Buffer.from("< hi >", "utf-8");
            getEmitter().on("connected", fnMock);

            customSocketTest.onDataControl(buffer);

            expect(customSocketTest.socket.write).toHaveReturnedWith("< open can0 >");
            expect(customSocketTest.state).toBe(Mode.BCM);
            expect(fnMock).toBeCalledWith(new ConnectionObj(customSocketTest.url, customSocketTest.id));
        });

        it("should do nothing if 'ok' frame.", () => {
            const buffer = Buffer.from("< ok >", "utf-8");

            const result = customSocket.onDataControl(buffer);

            expect(result).toBe(undefined);
        });

        it("should emit obj on 'frame'.", () => {
            const fnMock = jest.fn().mockImplementation();
            const buffer = Buffer.from("< frame 123 23.424242 11 22 33 44 >", "utf-8");
            getEmitter().on("frame", fnMock);

            const result = customSocket.onDataControl(buffer);

            expect(result).toBe(undefined);
            expect(fnMock).toBeCalledWith(
                new FrameObj(
                    "123",
                    "23",
                    "424242",
                    "11 22 33 44",
                    customSocket.bus,
                    customSocket.url,
                    customSocket.id,
                    customSocket.state
                )
            );
        });

        it("should return error if frame is not correct size.", () => {
            const buffer = Buffer.from("< frame 123 23.424242 >", "utf-8");

            const result = customSocket.onDataControl(buffer);

            expect(result).toStrictEqual(
                new Error("Error could not parse received frame, protocol inconsistency")
            );
        });

        it("should return error if frame is unknown.", () => {
            const buffer = Buffer.from("< hidden_test 1 6 8 1 3 5 6 >", "utf-8");

            const result = customSocket.onDataControl(buffer);

            expect(result).toStrictEqual(new Error("Error could not parse received frame, not implemented"));
        });
    });
});
