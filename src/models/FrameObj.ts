import {Mode} from "../types/Mode";

export class FrameObj {

    id: string;
    sec: string;
    usec: string;
    data: string;
    bus: string | undefined;
    url: string | undefined;
    sockId: string;
    mode: Mode | undefined;

    constructor(id: string, sec: string, usec: string, data: string, bus: string | undefined, url: string | undefined, sockId: string, mode: Mode | undefined) {
        this.id = id;
        this.sec = sec;
        this.usec = usec;
        this.data = data;
        this.bus = bus;
        this.url = url;
        this.sockId = sockId;
        this.mode = mode;
    }
}