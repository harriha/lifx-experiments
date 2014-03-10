var lifx = require('lifx');
var util = require('util');
var _ = require('lodash');
var Firebase = require('firebase');

var firebaseConfig = require('./firebase-config.json');

var rootRef = new Firebase(firebaseConfig.NAME);
var bulbsRef = rootRef.child('bulbs');

var lx;


rootRef.auth(firebaseConfig.AUTH_TOKEN, function(error, result) {
    if(error) {
        console.log('Authentication failed!', error);
        throw new Error('Authentication failed');
    } else {
        console.log('Authenticated successfully with payload:', JSON.stringify(result));

        initLifx();
    }
});

function testFirebaseWrite(str) {
    var ref = rootRef.child('test');

    ref.update({
        timestamp: new Date().toISOString(),
        str: str || '',
    });
}

function testFirebaseRead() {
    var ref = rootRef.child('test');
    ref.once('value', function(snapshot) {
        console.log('test value is:', JSON.stringify(snapshot.val()));
    });
}

function initLifx() {
    lifx.setDebug(false);

    lx = lifx.init();

    lx.on('bulbstate', function(b) {
        console.log('Bulb state: ' + util.inspect(b));

        updateState(b.bulb, b.state);
    });

    lx.on('bulb', function(b) {
        console.log('New bulb found: ' + b.name);

        updateBulb(b);
    });

    lx.on('gateway', function(g) {
        console.log('New gateway found: ' + g.ipAddress.ip);
    });

    lx.on('packet', function(p) {
        logPacket(p);

        handlePacket(p);
    });
}

function updateState(bulb, state) {
    var address = bulb.lifxAddress.toString("hex");
    var ref = bulbsRef.child(address + '/log');

    // Not interested in all the data
    var data = _.omit(state, [
        'tags',
        'bulbLabel',
    ]);

    ref.push({
        timestamp: Date.now(),
        key: 'state',
        value: data
    });
}

function updateBulb(bulb) {
    var address = bulb.lifxAddress.toString("hex");
    var ref = bulbsRef.child(address + '/info');

    ref.update({
        timestamp: Date.now(),
        address: address,
        name: bulb.name || ''
    });
}

function updateStatus(p) {
    var address = p.preamble.bulbAddress.toString('hex');

    var ref = bulbsRef.child(address + '/log');
    var key, value;

    switch (p.packetTypeShortName) {
        case 'powerState':
            key = 'powerState';
            value = p.payload.onoff > 0
    }

    ref.push({
        timestamp: Date.now(),
        key: key,
        value: value
    });
}

function handlePacket(p) {
    switch (p.packetTypeShortName) {
        case 'powerState':
            updateStatus(p);
            break;
        default:
            break;
    }
}

function logPacket(p) {
    // Show informational packets
    switch (p.packetTypeShortName) {
        case 'powerState':
        case 'wifiInfo':
        case 'wifiFirmwareState':
        case 'wifiState':
        case 'accessPoint':
        case 'bulbLabel':
        case 'tags':
        case 'tagLabels':
        //case 'lightStatus':
        case 'timeState':
        case 'resetSwitchState':
        case 'meshInfo':
        case 'meshFirmware':
        case 'versionState':
        case 'infoState':
        case 'mcuRailVoltage':
            console.log(p.packetTypeName + " - " + p.preamble.bulbAddress.toString('hex') + " - " + util.inspect(p.payload));
            break;
        default:
            break;
    }
}


console.log("Keys:");
console.log("Press 1 to turn the lights on");
console.log("Press 2 to turn the lights off");
console.log("Press 3 to turn the lights a dim red");
console.log("Press 4 to request status update from all bulbs");
console.log("Press 5 to turn the lights a bright white");
console.log("Press 6 to cycle forwards through colours");
console.log("Press 7 to cycle backwards through colours");
console.log("Press 8 to show debug messages including network traffic");
console.log("Press 9 to hide debug messages including network traffic");

var stdin = process.openStdin();
process.stdin.setRawMode(true);
process.stdin.resume();

var cycledColour = 0;

stdin.on('data', function (key) {
    console.log("bulbs.length: " + lx.bulbs.length);
    
    var bulb = lx.bulbs[0];

    switch (key[0]) {

        case 0x31: // 1
            console.log("Lights on");
            lx.lightsOn(bulb);
            break;

        case 0x32: // 2
            console.log("Lights off");
            lx.lightsOff(bulb);
            break;

        case 0x33: // 3
            console.log("Dim red");
            // BB8 7D0
            lx.lightsColour(0x0000, 0xffff, 1000, 0, 0, bulb);
            break;

        case 0x34: // 4
            console.log("Update status");
            lx.requestStatus();
            break;

        case 0x35: // 5
            console.log("Bright white");
            lx.lightsColour(0x0000, 0x0000, 0x8000, 0x0af0, 0x0513, bulb);
            break;

        case 0x36: // 6
            cycledColour = (cycledColour+100) & 0xffff; console.log("Colour value is " + cycledColour);
            lx.lightsColour(cycledColour, 0xffff, 0x0200, 0x0000, 0x0000, bulb);
            break;

        case 0x37: // 7
            cycledColour = (cycledColour-100) & 0xffff; console.log("Colour value is " + cycledColour);
            lx.lightsColour(cycledColour, 0xffff, 0x0200, 0x0000, 0x0000, bulb);
            break;

        case 0x38: // 8
            console.log("Enabling debug");
            lifx.setDebug(true);
            break;

        case 0x39: // 9
            console.log("Disabling debug");
            lifx.setDebug(false);
            break;

        case 0x03: // ctrl-c
            console.log("Closing...");
            lx.close();
            process.stdin.pause();
            process.exit();
            break;

    }
});
