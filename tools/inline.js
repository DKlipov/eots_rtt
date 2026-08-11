const fs = require("fs")
const Path = require('path')

const inlined = ["init.js", "common.js"]
const target = ["rules.js", "play.js"]

target.forEach(f => replace_in_file(f))

function replace_in_file(target) {
    var content = fs.readFileSync(target, "utf-8").split("\n")
    var stream = fs.createWriteStream(target);
    var templates = inlined.map(f => create_template(f))
    var current_template = null

    stream.once('open', function (fd) {
        for (let i = 0; i < content.length; i++) {
            var line = content[i]
            var temp_index = templates.indexOf(line.trim())
            if (temp_index >= 0 && current_template != null) {
                for (let line1 of fs.readFileSync(inlined[temp_index], "utf-8").split("\n")) {
                    stream.write(line1);
                    stream.write("\n");
                }
                current_template = null
                temp_index = null
            } else if (temp_index >= 0) {
                current_template = temp_index
            } else if (current_template) {
                continue
            }
            stream.write(line);
            if (i < content.length - 1) {
                stream.write("\n");
            }
        }
        stream.end();
    });
}

function create_template(file) {
    return `/** ${file}*/`
}

