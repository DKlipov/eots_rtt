"use strict"

const fs = require("fs")
const rules = require("../rules")

var output = ["var original_control = {}"]

function compile_scenario(s) {
    var G = rules.setup(0, s, {})
    output.push(`original_control["${s}"] = [${rules.query(G, "Japan", "original_control").original_control}]`)
}

rules.scenarios.forEach(s => compile_scenario(s))
fs.writeFileSync("original_control.js", output.join("\n") + "\n")