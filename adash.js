var fs = require('fs');
var path_module = require('path');

function log(e,t){var g=new Date;if(g="["+g.getFullYear()+"/"+(g.getMonth()<10?"0"+g.getMonth():g.getMonth())+"/"+(g.getDate()<10?"0"+g.getDate():g.getDate())+" "+(g.getHours()<10?"0"+g.getHours():g.getHours())+":"+(g.getMinutes()<10?"0"+g.getMinutes():g.getMinutes())+":"+(g.getSeconds()<10?"0"+g.getSeconds():g.getSeconds())+"]",e.length<15)for(i=e.length;i<10;i++)e+=" ";console.log(g+" ["+e.toUpperCase()+"] ~ "+t)}

function loadModules(base, prefix, index) {
	var ret = {};

	//check base dir
	if (fs.lstatSync(base).isDirectory() == true) {
		var dirs = fs.readdirSync(base);
		for (subdir in dirs) {
			if (dirs[subdir].substring(0,prefix.length).indexOf(prefix) !== -1) {
				//load modules from sub dirs with prefix
				var path = path_module.join(base, dirs[subdir]);
				if (fs.lstatSync(path).isDirectory() == true) {
					var files = fs.readdirSync(path);

					for (file in files) {
						file = files[file];

						//only loading .js files
						if (file.indexOf('.js', file.length - 3) !== -1) {
							var full = path_module.join(path, file);
							var module = require(full)(full, log);
							if (module != null) { 
								ret[module[index].toLowerCase()] = module;
		}}}}}}}
	return ret;
}

function handler(source, mac) {
	var beacon = beacons[mac.toLowerCase()];


	if (beacon != null ) {
		var date = new Date();
		if (beacon.last_triggered == null || Math.abs(date - beacon.last_triggered) > 15000) {
			beacon.last_triggered = date;
			log('event', "Beacon '" + beacon.name + "' pushed.");
			
			try { beacon.execute(); } catch (ex) { log('ERROR', 'Exception :' + ex); }
		}
	}
}





//====================
// application logic
//====================

//state
var modules_dir = path_module.join(__dirname, 'node_modules');
var handlers = {};
var monitors = {};

//setup
console.log("[adash.js]");
log('setup', 'Loading triggers...');
var triggers = loadModules(modules_dir, 'trigger-', 'name');
for (trigger in triggers) { log('setup', '    (*) ' + triggers[trigger].name); }
log('setup', Object.keys(triggers).length + ' trigger' + (Object.keys(triggers).length > 1 ? 's' : '') + ' loaded.');


log('setup', 'Loading beacons...');
var beacons = loadModules(modules_dir, 'beacon-', 'mac');
for (beacon in beacons) { log('setup', '    (*) ' + beacons[beacon].mac + ' - ' + beacons[beacon].name); }
log('setup', Object.keys(beacons).length + ' beacon' + (Object.keys(beacons).length > 1 || Object.keys(beacons).length < 1 ? 's' : '') + ' loaded.');



//start the triggers!
for (trigger in triggers) {
	trigger = triggers[trigger];
	trigger.start(handler);
}


log('setup', 'Ready!\r\n');

