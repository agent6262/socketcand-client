export enum Mode {
    BCM = 0,
    RAW = 1,
    ISOTP = 2
}

export function modeFromString(modeStr: string) {
    switch(modeStr) {
        case "rawmode": return Mode.RAW;
        case "bcmmode": return Mode.BCM;
        case "controlmode": return -1;
        case "isotpmode": return Mode.ISOTP;
        default: return -1;
    }
}

export function modeToString(mode?: Mode | undefined) {
    switch(mode) {
        case Mode.RAW: return "rawmode";
        case Mode.BCM: return "bcmmode";
        case Mode.ISOTP: return "isotpmode";
        default: return "undefined"
    }
}