var spawn = require('child_process').spawn;

function handleOutput(source, data, callback) {
	//split lines
    var lines = ('' + data).match(/[^\r\n]+/g);
    for (line in lines) {
    	//clean out the linux control chars
        line = lines[line].replace(/[\x00-\x1F\x7F-\x9F]/g, '').toLowerCase();

        //filter out mac addresses, only take the first occurence per line
        //var matches = /((?:[\dA-Fa-f]{2}\:){5}(?:[\dA-Fa-f]{2}))/.exec(line); // << includes all mac addresses
        var matches = /(?:\(not associated\)\W+)((?:[\dA-Fa-f]{2}\:){5}(?:[\dA-Fa-f]{2}))/.exec(line); //<< ignores the access points
        if (matches != null && matches.length > 0) {
            callback(source, matches[1]);
        }
    }
};

module.exports = function (log) {
    var module = {};

    //settings
    var airodump = null;
    module.name = "airodump-ng";
    module.interface = "mon0";
    module.channel = 7;

    //start function
    module.start = function(callback) {
        if (airodump == null) {
        	log(module.name, "Starting monitoring...");

        	airodump = spawn('airodump-ng', [module.interface, '--channel', module.channel, '--berlin', 1]);
			airodump.stdout.on('data', function(data) { handleOutput(module, data, callback); });
			airodump.stderr.on('data', function(data) { handleOutput(module, data, callback); });
			airodump.on('close', function(code) { log(module.name, 'Process ended. Code: ' + code); });
			
			log(module.name, "Started.");
		}
    };

    module.stop = function() {
    	if (airodump != null) {
    		airodump.kill();
    		airodump = null;
    	}
    };

    return module;
};