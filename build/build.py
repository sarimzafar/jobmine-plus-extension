#!/usr/bin/env python

import json

# Load the config.json file
json_data = open("config.json")
config = json.load(json_data)
json_data.close()

# Get the file names and append their data
output_file = config["output"]
try:
    with open(output_file, "w") as wf:
        for file in config["build_order"]:
            with open(file, "r") as content_file:
                content = content_file.read()
                # Replace {{ text }} inside each file with the data in config
                s = 0
                e = 0
                while s != -1 and e != -1:
                    s = content.find("{{", e)
                    if s != -1:
                        e = content.find("}}", s + 2)
                        if e != -1:
                            key = content[s + 2:e].strip()
                            if key in config["data"]:
                                content = content[:s] + config["data"][key] + content[e + 2:]
                            else:
                                content = content[:s] + content[e + 2:]
                print file
                wf.write(content)
                
except IOError:
    print("Failed to build file", output_file)
        
print("Finished")