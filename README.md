# socketcand-client
An updated NodeJS client for socketcand daemon, based on zorce's socketcand-client (https://github.com/zorce/socketcand-client).

socketcand - https://github.com/linux-can/socketcand

## Example
```nodejs
const cand = require('./socketcand');

cand.on('connected', function(conn) {
	console.log("connected", conn);
	cand.sendFrame(conn.id, '66', 4, 'DEADBEEF')
});

cand.on('disconnected', function() {
	console.log("disconnected");
});

cand.on('connectionPoints', function(points) {
	console.log("connection point received", points);
	let id = cand.connect(points[0].url+"/"+points[0].buses[0].name, cand.Mode.RAW);
	console.log(id)
});

cand.start();
```