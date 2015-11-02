var fs = require('fs');
var path_module = require('path');


//application state
var handlers = {};
var monitors = {};


function log(tag, message) {
    var date = new Date();
    date = '[' + date.getFullYear() + '/' + (date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()) + '/' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + ']';

    //pad the tag
    if (tag.length < 11) {for (i = tag.length;i<10;i++) {tag += ' ';}}

    console.log(date + ' [' + tag.toUpperCase() + '] ~ ' + message);
}

function loadModules(base) {
	var ret = {};

	//check base dir
	if (fs.lstatSync(base).isDirectory() == true) {
		var dirs = fs.readdirSync(base);
		for (subdir in dirs) {
			subdir = dirs[subdir];

			//load modules from sub dirs
			var path = path_module.join(base, subdir);
			if (fs.lstatSync(path).isDirectory() == true) {
				var files = fs.readdirSync(path);

				for (file in files) {
					file = files[file];

					//only loading .js files
					if (file.indexOf('.js', file.length - 3) !== -1) {
						var module = require(path_module.join(path, file))(log);
						ret[module.name] = module;
					}
				}
			}
		}
	}
	return ret;
}

var monitors_dir = path_module.join(__dirname, 'monitors');
var monitors = loadModules(monitors_dir);


function handler(source, mac) {
	log("HANDLER", "[" + source.name + "] " + mac);
}

for (mon in triggers) {
	mon = monitors[mon];
	mon.start(handler);
}
