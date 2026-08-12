const fs = require("fs")
const Path = require('path')

const inlined = []
const templates = []
const output = []

read_dir("js")

for (var i = 0; i < output.length - 1; i += 2) {
    create_by_template(output[i], output[i + 1])
}

function read_dir(dir) {
    fs.readdirSync(dir, {withFileTypes: true})
        .forEach(item => {
            var full_name=item.path + "/" + item.name
            if (item.isDirectory()) {
                read_dir(full_name)
            } else {
                var content = fs.readFileSync(full_name, "utf-8").split("\n")[0]
                if (content.includes("/** main*/")) {
                    output.push(full_name, item.name)
                }
                inlined.push(full_name.trim())
                templates.push(create_template(full_name).replace("js/","").trim())
            }
        })
}

function create_by_template(target, filename) {
    var stream = fs.createWriteStream(filename);
    stream.once('open', function (fd) {
        insert_into(target, stream)
        stream.end();
    });
    console.log(`Compiled: ${target}`)
}

function insert_into(target, stream) {
    var content = fs.readFileSync(target, "utf-8").split("\n")
    for (let i = 0; i < content.length; i++) {
        var line = content[i]
        if (line.startsWith("/** import")) {
            stream.write(line);
            stream.write("\n");
            var file_name=inlined[templates.indexOf(line.trim())]
            if(!file_name){
                console.log(`Failed read: ${file_name}(${line})`)
            }
            insert_into(file_name, stream)
        }
        stream.write(line);
        if (i < content.length - 1) {
            stream.write("\n");
        }
    }

}

function create_template(file) {
    return `/** import ${file}*/`
}

