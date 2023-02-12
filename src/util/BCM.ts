import {Mode} from "../types/Mode";
import {getConnectionFromId} from "./Util";

export function addFrame(
    sockId: string,
    id: string,
    seconds: number,
    usec: number,
    dlc: number,
    data: string
) {
    const scc = getConnectionFromId(sockId);
    if (scc === undefined) return new Error("Socket not found for id " + sockId);

    if (scc.state === Mode.BCM) {
        scc.socket.write("< add " + seconds + " " + usec + " " + id + " " + dlc + " " + data + " >");
    } else {
        return new Error("Cannot add frame, wrong state");
    }
}

export function updateFrame(sockId: string, id: string, dlc: number, data: string) {
    const scc = getConnectionFromId(sockId);
    if (scc === undefined) return new Error("Socket not found for id " + sockId);

    if (scc.state === Mode.BCM) {
        scc.socket.write("< update " + id + " " + dlc + " " + data + " >");
    } else {
        return new Error("ERROR cannot update frame, wrong state");
    }
}

export function deleteFrame(sockId: string, id: string) {
    const scc = getConnectionFromId(sockId);
    if (scc === undefined) return new Error("Socket not found for id " + sockId);

    if (scc.state === Mode.BCM) {
        scc.socket.write("< delete " + id + " >");
    } else {
        return new Error("ERROR cannot delete frame, wrong state");
    }
}

export function sendFrame(sockId: string, id: string, dlc: string, data: string, formatData?: boolean) {
    const scc = getConnectionFromId(sockId);
    if (scc === undefined) return new Error("Socket not found for id " + sockId);

    if (scc.state === Mode.BCM || scc.state === Mode.RAW) {
        if (formatData) {
            while (data.indexOf(" ") !== -1) {
                data = data.replace(" ", "");
            }
            const dataArray = [];
            for (let i = 0; i < data.length / 2; i++) {
                dataArray.push(data.substring(i * 2, i * 2 + 2));
            }
            data = dataArray.join(" ");
        }
        scc.socket.write("< send " + id + " " + dlc + " " + data + " >");
    } else {
        return new Error("ERROR cannot send frame, wrong state");
    }
}

export function filter(sockId: string, id: string, sec: number, usec: number, dlc: number, mask: string) {
    const scc = getConnectionFromId(sockId);
    if (scc === undefined) return new Error("Socket not found for id " + sockId);

    if (scc.state === Mode.BCM) {
        scc.socket.write("< filter " + id + " " + sec + " " + usec + " " + dlc + " " + mask + " >");
    } else {
        return new Error("ERROR cannot filter, wrong state");
    }
}

export function subscribe(sockId: string, id: string, sec: number, usec: number) {
    const scc = getConnectionFromId(sockId);
    if (scc === undefined) return new Error("Socket not found for id " + sockId);

    if (scc.state === Mode.BCM) {
        scc.socket.write("< subscribe " + sec + " " + usec + " " + id + " >");
    } else {
        return new Error("ERROR cannot subscribe, wrong state");
    }
}

export function unsubscribe(sockId: string, id: string) {
    const scc = getConnectionFromId(sockId);
    if (scc === undefined) return new Error("Socket not found for id " + sockId);

    if (scc.state === Mode.BCM) {
        scc.socket.write("< unsubscribe " + id + " >");
    } else {
        return new Error("ERROR cannot unsubscribe, wrong state");
    }
}
