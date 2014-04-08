var conv = require('binstring');

// Hack: not really a good way to use this private component...
var packet = require('./node_modules/lifx/packet');

var input = process.argv[2];

console.log("Give me a Lifx packet as a string, I parse it for you.");
console.log();

if(input) {
    console.dir(packet.fromBytes(conv(input, { in: 'hex' })));
}
else {
    console.error("NO INPUT GIVEN");
}
