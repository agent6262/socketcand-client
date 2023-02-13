# socketcand-client
![GitHub build status](https://img.shields.io/github/actions/workflow/status/agent6262/socketcand-client/ci.yml?style=flat-square)
![Codeclimate coverage](https://img.shields.io/codeclimate/coverage/agent6262/socketcand-client?style=flat-square)
![npm version](https://img.shields.io/npm/v/@agent6262/socketcand-client?style=flat-square)
![npm downloads](https://img.shields.io/npm/dt/@agent6262/socketcand-client?style=flat-square)
![github license](https://img.shields.io/github/license/agent6262/socketcand-client?style=flat-square)

An updated NodeJS client for socketcand daemon, based on [zorce's socketcand-client](https://github.com/zorce/socketcand-client).

## Usage

Availible emitter enpoints are:
* connectionPoints - Lists avalible connections options (Created from socketcand broadcasting packets).
* data - Outputs raw frame data as recieved from a socektcand server (Only emits data when connected in raw mode).
* frame - Outputs a parsed can frame obj from socketcand server(s) (Only emits data when connected in controlled mode).
* connected - Ouputs a data object when this library connects to a socketcand server.
* disconnected - Outputs a data object when this library disconnects from a socketcand server.

## Example

```typescript
import {connect, getEmitter, SocketPoint, start, ConnectionObj, FrameObj} from "@agent6262/socketcand-client";

getEmitter().on("connectionPoints", function (points: Array<SocketPoint>) {
    console.log(points);

    let exampleStr = "can0@host (can://127.0.0.1:12345)";
    let id = connect(exampleStr, ConnectionMode.CONTROLLED);
});

getEmitter().on("frame", (frame: FrameObj) => {
    console.log(frame);
});

getEmitter().on("connected", function (conn: ConnectionObj) {
    
});

getEmitter().on("disconnected", function (data: ConnectionObj) {
    console.log("CLOSED");
});

getEmitter().on("data", function (data: string) {
    console.log(data);
});

start();
```

# Refrences
* [zorce/socketcand-client](https://github.com/zorce/socketcand-client)
* [linux-can/socketcand](https://github.com/linux-can/socketcand)
