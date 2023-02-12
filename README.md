# socketcand-client
![GitHub build status](https://img.shields.io/github/actions/workflow/status/agent6262/socketcand-client/ci.yml?style=flat-square)
![Codeclimate coverage](https://img.shields.io/codeclimate/coverage/agent6262/socketcand-client?style=flat-square)
![npm downloads](https://img.shields.io/npm/dt/@agent6262/socketcand-client?style=flat-square)
![github license](https://img.shields.io/github/license/agent6262/socketcand-client?style=flat-square)

An updated NodeJS client for socketcand daemon, based on zorce's socketcand-client (https://github.com/zorce/socketcand-client).

socketcand - https://github.com/linux-can/socketcand

## Example

```javascript
import {connect, getEmitter, SocketPoint, start, ConnectionObj, FrameObj} from "@agent6262/socketcand-client";

getEmitter().on("connectionPoints", function (points: Array<SocketPoint>) {
    console.log(points);

    let exampleStr = "can0@host (can://127.0.0.1:12345)";
    let id = connect(exampleStr, ConnectionMode.CONTROLLED);
});

getEmitter().on("frame", (frame: FrameObj) => {
    console.log(frame);
});

getEmitter().on("connected", function (conn: ConnectionObj) {});

getEmitter().on("disconnected", function (data: ConnectionObj) {
    console.log("CLOSED");
});

getEmitter().on("data", function (data: any) {
    console.log(data);
});

start();
```
