//dependencies
var spawn = require('child_process').spawn;
var request = require('request');

//Button constructor
function Button(mac, name, brand, handler) {
    return {
        mac: mac,
        name: name,
        brand: brand,
        handler: function() { handler(this); },
        last_fired: null
    };
}


//settings
var buttons = [];
var interface = 'mon0'; //< used for monitoring with airodump
var channel = 7;        //< channel of your wifi network to stop airodump from channel hopping


//set up airodrump
var airdump = spawn('airodump-ng', [interface, '--channel', channel, '--berlin', 1]);
airdump.stdout.on('data', function(data) { handleOutput('STDOUT', data); });
airdump.stderr.on('data', function(data) { handleOutput('STDERR', data); });
airdump.on('close', function(code) { console.log('Process ended. Code: ' + code); });


//functions
function handleOutput(source, data) {
    var lines = ('' + data).match(/[^\r\n]+/g);
    for (line in lines) {
        line = lines[line].replace(/[\x00-\x1F\x7F-\x9F]/g, '').toLowerCase();

        if (line.indexOf('74:75') > -1 || line.indexOf('74:c2') > -1) {
            for (button in buttons) {
                button = buttons[button];

                var date = new Date();
                if (line.indexOf(button.mac.toLowerCase()) > -1 && (button.last_fired == null || Math.abs(date - button.last_fired) > 15000)) {
                    button.last_fired = date;
                    log('event', 'Button '' + button.name + '' pushed.');
                    button.handler();
                    return;
                }
            }
        }
    }
}

function log(tag, message) {
    var date = new Date();
    date = '[' + date.getFullYear() + '/' + (date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()) + '/' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + ']';

    //pad the tag
    if (tag.length < 10) {for (i = tag.length;i<10;i++) {tag += ' ';}}

    console.log(date + ' [' + tag.toUpperCase() + '] ~ ' + message);
}




//application logic
console.log('[dash.js]');


//EXAMPLE OF PUSHBULLET DOORBELL
buttons.push(Button('74:c2:XX:XX:XX:XX', 'doorbell', 'gatorade', function(self) {
    var sendPush = function (title, message, email) {
        request.post({
            url: 'https://api.pushbullet.com/v2/pushes',
            body: '{ "type" : "note", "title" : "' + title + '", "body" : "' + message + '", "email" : "' + email + '" }',
            headers: { 'Content-Type' : 'application/json', 'Access-Token' : 'PUSHBULLETAPITOKEN' }
        }, function(error, response, body){
                log(self.name, 'Push sent to: ' + email + '\r\n\t' + body);
        });
    };

    var title = 'Ding Dong';
    var message = 'The doorbell is ringing...';

    //send a push to all the flat mates
    sendPush(title, message, 'PUSHBULLETEMAIL1');
    sendPush(title, message, 'PUSHBULLETEMAIL2');
}));


//EXAMPLE OF ROKU NETFLIX INTEGRATION
buttons.push(Button('74:75:XX:XX:XX:XX', 'elements', 'amazon', function(self) {
    request.post({
        url: 'http://ROKUIPADDRESS:8060/launch/12'
    }, function(error, response, body){
        log(self.name, 'Response: ' + response.statusCode);
        if (response.statusCode == 200) { log(self.name, 'Netflix engaged.'); }
        else { log(self.name, 'Failed to launch netflix.'); }
    });
}));

//print button header
for (button in buttons) {
    button = buttons[button];
    log('loading', 'Mac: ' + button.mac + ', Brand: ' + button.brand + ', Name: ' + button.name);
}

log('general', 'Ready.\r\n');



