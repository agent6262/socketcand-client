export interface CANBeaconBusData {
    name: string;
}

export interface CANBeaconBus {
    $: CANBeaconBusData;
}

export interface CANBeaconData {
    name: string;
    type: string;
    description: string;
}

export interface CANBeacon {
    $: CANBeaconData;
    URL: Array<string>;
    Bus: Array<CANBeaconBus>;
}

export interface CanBeaconObj {
    CANBeacon: CANBeacon;
}