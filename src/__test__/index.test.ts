import nanoid from "nanoid";
import net from "net";
import getEmitter, {ConnectionMode, Mode} from "../index";
import {getCustomSocket} from "./TestHelpers";

function randMax(max: number) {
    return Math.floor(Math.random() * max);
}

function oldDataControl(rawData: Buffer) {
    const data = rawData.toString();
    getEmitter().emit("data", data);
    if (data == "< hi >") {
        getEmitter().emit("connected", {url: "this.url", id: "this.id"});
    } else if (data == "< ok >") {
        return undefined;
    } else if (data.match(/<\sframe.+>/i)) {
        const m = data.match(/<\sframe\s([0-9a-fA-F]+)\s(\d+).(\d+)\s+([0-9a-fA-F]*\s?)*\s>/);
        if (m) {
            const frame = {
                id: m[1],
                sec: m[2],
                usec: m[3],
                data: m[4],
                bus: "iface",
                url: "asd",
                sockId: "asd",
                mode: Mode.BCM
            };
            getEmitter().emit("frame", frame);
        } else {
            return new Error("Error could not parse received frame, protocol inconsistency");
        }
    } else {
        // TODO handle this better!
        console.log("Unknown command received " + data.toString());
    }
}

describe("socketcand", () => {
    describe.skip("Performance Tests", () => {
        it("should pass if ", () => {
            const mockFn = jest.fn().mockImplementation();
            const scc = new net.Socket();
            const customSocket = getCustomSocket(nanoid.nanoid(8), Mode.BCM, ConnectionMode.CONTROLLED);
            getEmitter().on("frame", mockFn);
            scc.on("data", customSocket.onDataControl.bind(customSocket));

            const items = 1000000;
            const dataArray = [];
            for (let i = 0; i < items; i++) {
                dataArray.push(
                    Buffer.from(
                        "< frame " +
                            randMax(256) +
                            " 23.424242 " +
                            randMax(256).toString(16) +
                            " " +
                            randMax(256).toString(16) +
                            " " +
                            randMax(256).toString(16) +
                            " " +
                            randMax(256).toString(16) +
                            " >"
                    )
                );
            }

            const startTime = process.hrtime.bigint();
            for (const item of dataArray) {
                oldDataControl(item);
            }
            const endTime = process.hrtime.bigint();

            const newStartTime = process.hrtime.bigint();
            for (const item of dataArray) {
                customSocket.onDataControl(item);
            }
            const newEndTime = process.hrtime.bigint();

            const bigIntItems = BigInt(items);
            console.log("Old Throughput: " + (endTime - startTime) / bigIntItems + " frames/ns");
            console.log(
                "Old Frames/sec: " +
                    (((endTime - startTime) / bigIntItems) * BigInt(1000000000)).toLocaleString()
            );
            console.log("New Throughput: " + (newEndTime - newStartTime) / bigIntItems + " frames/ns");
            console.log(
                "New Frames/sec: " +
                    (((newEndTime - newStartTime) / bigIntItems) * BigInt(1000000000)).toLocaleString()
            );
            expect(mockFn).toBeCalledTimes(items * 2);

            const newVal = parseInt(BigInt((newEndTime - newStartTime) / bigIntItems).toString());
            const oldVal = parseInt(BigInt((endTime - startTime) / bigIntItems).toString());
            expect(newVal).toBeGreaterThan(oldVal);
        });
    });
});
