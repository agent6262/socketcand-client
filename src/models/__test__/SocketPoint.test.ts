import {SocketPoint} from "../SocketPoint";
import {BusName} from "../BusName";
import {cloneSocketPoint, getSocketPoint} from "../../__test__/TestHelpers";

let socketPoint: SocketPoint;
beforeEach(() => {
    socketPoint = getSocketPoint();
});

describe("SocketPoint", () => {
    describe("busEqual", () => {
        it("should return true if buses are equal.", () => {
            const newBuses = [{name: "can0"}, {name: "can1"}, {name: "can2"}];
            const result = socketPoint.busEqual(newBuses);

            expect(result).toBe(true);
        });

        it("should return false if buses are not equal.", () => {
            const newBuses = [{name: "can0"}, {name: "can1"}];
            const result = socketPoint.busEqual(newBuses);

            expect(result).toBe(false);
        });

        it("should return false if buses are not equal (out of order).", () => {
            const newBuses = [{name: "can1"}, {name: "can0"}, {name: "can2"}];
            const result = socketPoint.busEqual(newBuses);

            expect(result).toBe(false);
        });

        it("should return true if buses are equal (size 0).", () => {
            const socketPoint = new SocketPoint("fqdn_host_one", "can://127.0.0.1:29536", [], Date.now());

            const newBuses = new Array<BusName>();
            const result = socketPoint.busEqual(newBuses);

            expect(result).toBe(true);
        });
    });
    describe("equals", () => {
        it("should return true if object fields are equal.", () => {
            const socketPointTest = cloneSocketPoint(socketPoint);

            socketPoint.busEqual = jest.fn().mockReturnValue(true);
            const result = socketPoint.equals(socketPointTest);

            expect(result).toBe(true);
        });

        it("should return false if object host is not equal.", () => {
            const socketPointTest = cloneSocketPoint(socketPoint);
            socketPointTest.host = socketPoint.host + "new_data";

            socketPoint.busEqual = jest.fn().mockReturnValue(true);
            const result = socketPoint.equals(socketPointTest);

            expect(result).toBe(false);
        });

        it("should return false if object url is not equal.", () => {
            const socketPointTest = cloneSocketPoint(socketPoint);
            socketPointTest.url = socketPoint.url + "new_data";

            socketPoint.busEqual = jest.fn().mockReturnValue(true);
            const result = socketPoint.equals(socketPointTest);

            expect(result).toBe(false);
        });

        it("should return false if object buses are not equal.", () => {
            const socketPointTest = cloneSocketPoint(socketPoint);

            socketPoint.busEqual = jest.fn().mockReturnValue(false);
            const result = socketPoint.equals(socketPointTest);

            expect(result).toBe(false);
        });

        it("should call function if object fields are equal and function is not undefined.", () => {
            const socketPointTest = cloneSocketPoint(socketPoint);

            socketPoint.busEqual = jest.fn().mockReturnValue(true);
            const callbackFunction = jest.fn();
            socketPoint.equals(socketPointTest, callbackFunction);

            expect(callbackFunction).toBeCalled();
        });

        it("should not call function if object fields are equal and function is undefined.", () => {
            const socketPointTest = cloneSocketPoint(socketPoint);

            socketPoint.busEqual = jest.fn().mockReturnValue(true);
            const callbackFunctionFalse = jest.fn();
            const result = socketPoint.equals(socketPointTest, undefined, callbackFunctionFalse);

            expect(result).toBe(undefined);
        });

        it("should call function if object fields are not equal and function is not undefined.", () => {
            const socketPointTest = cloneSocketPoint(socketPoint);

            socketPoint.busEqual = jest.fn().mockReturnValue(false);
            const callbackFunction = jest.fn();
            socketPoint.equals(socketPointTest, undefined, callbackFunction);

            expect(callbackFunction).toBeCalled();
        });

        it("should not call function if object fields are not equal and function is undefined.", () => {
            const socketPointTest = cloneSocketPoint(socketPoint);

            socketPoint.busEqual = jest.fn().mockReturnValue(false);
            const callbackFunctionTrue = jest.fn();
            const result = socketPoint.equals(socketPointTest, callbackFunctionTrue, undefined);

            expect(result).toBe(undefined);
        });
    });
});
