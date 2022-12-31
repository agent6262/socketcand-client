import {CustomSocket} from "./models/CustomSocket";
import nanoid from "nanoid";
import {Mode} from "./types/Mode";

function randMax(max: number) {
    return Math.floor(Math.random() * max);
}

describe("socketcand", () => {
    describe("Performance Tests", () => {
        it("should pass if ", () => {
            let mockFn = jest.fn().mockImplementation();
            let customSocket = new CustomSocket(
                undefined,
                nanoid.nanoid(8),
                "can://127.0.0.1:29536",
                Mode.BCM,
                "can0"
            );
            customSocket.on('frame', mockFn);

            let items = 100000;
            let dataArray = [];
            for (let i = 0; i < items; i++) {
                dataArray.push(Buffer.from("< frame " + randMax(256) + " 23.424242 " +
                    randMax(256).toString(16) + " " + randMax(256).toString(16) +
                    " " + randMax(256).toString(16) + " " + randMax(256).toString(16) + " >"));
            }


            let startTime = process.hrtime.bigint();
            for (const item of dataArray) {
                customSocket.emit('frame', item);
            }
            let endTime = process.hrtime.bigint();

            console.log("Throughput: " + ((endTime - startTime) / BigInt(items)) + " frames/ns")
            console.log("Frames/sec: " + (((endTime - startTime) / BigInt(items)) * BigInt(1000000000)).toLocaleString())
            expect(mockFn).toBeCalledTimes(items);
        });
    });
});