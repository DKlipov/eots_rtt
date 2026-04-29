#!/usr/bin/env -S node

/* PARSE LAYOUT DATA

usage: node parse-layout.js input.svg [ input2.svg ... ] > layout.js

	Process an Inkscape flavor SVG file to extract layout boxes and paths.

This program looks for <rect> and <circle> objects and records their areas.
If the object has an inkscape label, that is used as its name; otherwise
the nearest text object will be used as a name.

Any paths will be parsed and match each end point to the closest layout object.

OUTPUT:

	A javascript program defining a const layout object (and possibly a const edges array).

	If the objects are grouped in <g> tags with labels, the layout object will be grouped.

	The layout object maps layout names to rectangle [x, y, w, h] records.

	The edges are an array of [ name1, name2, edgeName, x1, y1, x2, y2 ] records. (edgeName is "null" if no label set)

CAVEATS:

	The SVG must not use any transform attributes!

SEE ALSO:

	Use the "new-layout.js" tool to create a blank layout SVG file with the map graphics as a backdrop.

*/

"use strict"

const fs = require("fs")
const Path = require('path')
const { round, hypot } = Math

let nodes = []
let edges = []
let labels = []
let groups = []
let group_stack = []
let mode, group, name, x, y, w, h, cx, cy, rx, ry, x2, y2, lname

function flush() {
	if (mode === 'path') {
		edges.push({ group, name, x1: x, y1: y, x2, y2 })
	}
	if (mode === 'rect') {
		nodes.push({ group, name, x: x + w/2, y: y + h/2, rect: [x,y,w,h] })
	}
	if (mode === 'circle') {
		x = cx - rx
		y = cy - ry
		w = rx * 2
		h = ry * 2
		nodes.push({ group, name, x: cx, y: cy, rect: [x,y,w,h] })
	}
	x = y = x2 = y2 = w = h = cx = cy = rx = ry = 0
	name = null
}

function parse_path_data(path) {
	let cx = 0
	let cy = 0
	let abs = 0
	for (let i = 0; i < path.length;) {
		switch (path[i]) {
		case 'M':
			x = cx = Number(path[i+1])
			y = cy = Number(path[i+2])
			i += 3
			abs = true
			break
		case 'm':
			x = cx = cx + Number(path[i+1])
			y = cy = cy + Number(path[i+2])
			i += 3
			abs = false
			break
		case 'C':
			x2 = cx = Number(path[i+5])
			y2 = cy = Number(path[i+6])
			i += 7
			abs = true
			break
		case 'L':
			i += 1
			abs = true
			break
		case 'H':
			x2 = cx = Number(path[i+1])
			y2 = cy
			i += 2
			abs = true
			break
		case 'V':
			x2 = cx
			y2 = cy = Number(path[i+1])
			i += 2
			abs = true
			break
		case 'c':
			x2 = cx = cx + Number(path[i+5])
			y2 = cy = cy + Number(path[i+6])
			i += 7
			break
		case 'l':
			i += 1
			abs = false
			break
		case 'h':
			x2 = cx = cx + Number(path[i+1])
			y2 = cy
			i += 2
			abs = false
			break
		case 'v':
			x2 = cx
			y2 = cy = cy + Number(path[i+1])
			i += 2
			abs = false
			break
		default:
			if (abs) {
				x2 = cx = Number(path[i+0])
				y2 = cy = Number(path[i+1])
			} else {
				x2 = cx = cx + Number(path[i+0])
				y2 = cy = cy + Number(path[i+1])
			}
			i += 2
			break
		}
	}
}

function parse_svg(filename) {
	lname = Path.parse(filename).name;
	mode = null
	for (let line of fs.readFileSync(filename, "utf-8").split("\n")) {
		line = line.trim()
		if (line.startsWith("<g")) {
			flush()
			mode = "g"
		} else if (line.startsWith("<rect")) {
			flush()
			mode = "rect"
			x = y = w = h = 0
		} else if (line.startsWith("<ellipse") || line.startsWith("<circle")) {
			flush()
			mode = "circle"
			cx = cy = rx = ry = 0
		} else if (line.startsWith("<path")) {
			flush()
			mode = "path"
		} else if (line.startsWith('x="'))
			x = round(Number(line.split('"')[1]))
		else if (line.startsWith('y="'))
			y = round(Number(line.split('"')[1]))
		else if (line.startsWith('width="'))
			w = round(Number(line.split('"')[1]))
		else if (line.startsWith('height="'))
			h = round(Number(line.split('"')[1]))
		else if (line.startsWith('cx="'))
			cx = round(Number(line.split('"')[1]))
		else if (line.startsWith('cy="'))
			cy = round(Number(line.split('"')[1]))
		else if (line.startsWith('r="'))
			rx = ry = round(Number(line.split('"')[1]))
		else if (line.startsWith('rx="'))
			rx = round(Number(line.split('"')[1]))
		else if (line.startsWith('ry="'))
			ry = round(Number(line.split('"')[1]))
		else if (line.startsWith('d="'))
			parse_path_data(line.split('"')[1].split(/[ ,]/))

		else if (line.startsWith('inkscape:label="') && mode === "g") {
			group_stack.push(line.split('"')[1])
			group = group_stack.join("/")
			groups.push(group)
		}

		else if (line.startsWith('inkscape:label="') && mode !== "g") {
			name = line.split('"')[1].replaceAll("&amp;", "&")
		}
		else if (line.startsWith("</g>")) {
			flush()
			mode = null
			group_stack.pop()
			group = group_stack.join("/")
		}

		if (line.endsWith("/>") && mode === "g") {
			flush()
			mode = null
			group_stack.pop()
			group = group_stack.join("/")
		}

		if (line.includes("</tspan>")) {
			let name = line.replace(/^[^>]*>/, "").replace(/<\/tspan.*/, "")
			if (labels.some(x => x.name === name))
				console.error("DUPLICATE LABEL", name)
			labels.push({ group, name, x, y })
		}
	}
	flush()
	emit()
}

function find_closest_node(x, y) {
	let nd = Infinity, nn = null

	for (let n of nodes) {
		let d = hypot(n.x - x, n.y - y)
		if (d < nd) {
			nd = d
			nn = n.name
		}
	}

	if (!nn)
		console.error("NOT FOUND", x, y)

	return nn
}

function find_label(x, y, limit) {
	let nd = Infinity, nn = null

	for (let n of labels) {
		let d = hypot(n.x - x, n.y - y)
		if (d < nd) {
			nd = d
			nn = n
		}
	}

	if (!nn || nd > limit) {
		console.error("LABEL NOT FOUND", x, y)
		return null
	}

	return nn.name
}

function emit() {
	if (labels.length > 0) {
		for (let n of nodes) {
			if (n.name === null)
				n.name = find_label(n.x, n.y, 75)
		}
	}

	if (edges.length > 0) {
		console.log("const "+lname+": {}")
		console.log()
		console.log(""+lname+".nodes = {")
	} else {
		console.log("\""+lname+"\" : {")
	}

	if (groups.length > 0) {
		var grouped_nodes = Object.groupBy(nodes, x => x.group)
		for (var key in grouped_nodes) {
			console.log("\t\"" + key + "\": {")
			for (let n of grouped_nodes[key])
				console.log("\t\t\"" + n.name + "\": " + JSON.stringify(n.rect) + ",")
			console.log("\t},")
		}
	} else {
		for (let n of nodes)
			console.log("\t\"" + n.name + "\": " + JSON.stringify(n.rect) + ",")
	}
	console.log("},")

	if (edges.length > 0) {
		if (groups.length > 0) {
			console.log()
			console.log("layout.edges = {")
			var grouped_edges = Object.groupBy(edges, x => x.group)
			for (var key in grouped_edges) {
				console.log("\t\"" + key + "\": [")
				for (let e of grouped_edges[key]) {
					let n1 = find_closest_node(e.x1, e.y1)
					let n2 = find_closest_node(e.x2, e.y2)
					console.log(`\t\t["${n1}","${n2}","${e.name}",${e.x1|0},${e.y1|0},${e.x2|0},${e.y2|0},"${e.name}"],`)
				}
				console.log("\t],")
			}
			console.log("}")
		} else {
			console.log()
			console.log(""+lname+".edges = [")
			for (let e of edges) {
				let n1 = find_closest_node(e.x1, e.y1)
				let n2 = find_closest_node(e.x2, e.y2)
				console.log(`\t["${n1}","${n2}","${e.name}",${e.x1|0},${e.y1|0},${e.x2|0},${e.y2|0}],`)
			}
			console.log("]")
		}
	}

	
	nodes = []
	edges = []
	labels = []
	groups = []
	group_stack = []
}

if (process.argv.length < 3) {
	console.error("usage: node parse-layout.js input.svg")
	process.exit(1)
} else {
	console.log("const layout = {")
	process.argv.slice(2).forEach(parse_svg)
	console.log("}")
	console.log()
	console.log(`if (typeof module !== "undefined") module.exports = layout`)
}
