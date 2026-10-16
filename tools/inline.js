"use strict"

const fs = require("fs")
const { SourceMapGenerator } = require("./source-map/source-map.js")

function compile(output, input) {
    var map = new SourceMapGenerator({ file: output })
    var stm = []

    function emit(source, lineno, text) {
        stm.push(text)
        map.addMapping({
            generated: { line: stm.length, column: 1 },
            source: source,
            original: { line: lineno, column: 1 },
        })
    }

    function process(source) {
        var lineno = 1
        for (var text of fs.readFileSync(source, "utf-8").split("\n")) {
            //text = text.replaceAll("    ", "\t").trimEnd()
            if (text.startsWith("/** import")) {
                var next_file = "js/" + text.replace("/** import ", "").replace("*/", "").trim()
                emit(source, lineno, "/* {{{ " + next_file + " */")
                process(next_file, 0)
                emit(source, lineno, "/* }}} */")
            } else {
                emit(source, lineno, text)
            }
            ++lineno
        }
    }

    emit(input, 1, "// THIS FILE IS GENERATED! DO NOT EDIT!")

    process(input)

    stm.push("//# sourceMappingURL=" + output + ".map")

    fs.writeFileSync(output, stm.join("\n"))
    fs.writeFileSync(output + ".map", map.toString())
}

compile("play.js", "js/play.js")
compile("rules.js", "js/rules.js")
