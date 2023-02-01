import {BusName} from "./BusName";

export class SocketPoint {
    host: string;
    url: string;
    buses: Array<BusName>;
    time: number;

    constructor(host: string, url: string, buses: Array<BusName>, time: number) {
        this.host = host;
        this.url = url;
        this.buses = buses;
        this.time = time;
    }

    busEqual(bus: Array<BusName>) {
        if (this.buses.length !== bus.length) return false;
        if (this.buses.length === 0) return true;
        return this.buses.every((val, index) => val.name === bus[index].name)
    }

    equals(sp: SocketPoint, callbackTrue?: () => void, callbackFalse?: () => void) {
        const eq = this.host === sp.host && this.url === sp.url && this.busEqual(sp.buses);

        if(callbackTrue === undefined && callbackFalse === undefined) return eq;
        if (eq) callbackTrue?.();
        else callbackFalse?.();
    }
}