#!/usr/bin/env node

var fs = require("fs");

// Load the config json file
var config = (JSON.parse(fs.readFileSync("./config.json", "utf8")));

// Get the file names and append their data
var outputFile = config.output;
var wstream = null;
try {
    wstream = fs.createWriteStream(outputFile);
    for (var i in config.build_order) {
        var file = config.build_order[i];
        if (fs.existsSync(file)) {
            var content = fs.readFileSync(file).toString();
            // Replace {{ text }} inside each file with the data in config
            var s = 0, 
                e = 0;
            while(s != -1 && e != -1) {
                s = content.indexOf("{{", e);
                if (s != -1) {
                    e = content.indexOf("}}", s + 2);
                    if (e != -1) {
                        var key = content.substring(s + 2, e).trim();
                        if (config.data.hasOwnProperty(key)) {
                            content = content.substring(0, s) + config.data[key] + content.substring(e + 2);
                        } else {
                            content = content.substring(0, s) + content.substring(e + 2);
                        }
                    }
                }
            }
            console.log(file);
            wstream.write(content);
        }
    }
} catch(e) {
    console.log("Failed to build file", outputFile, e);
} finally {
    if (wstream) {
        wstream.end();
    }
}
console.log("Finished");