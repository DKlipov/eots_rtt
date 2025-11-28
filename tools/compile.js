"use strict"

// special globals: active, seed, log, undo
// reserved names not to be used for globals: F
// reserved names not to be used for locals: P, I, R, W

const fs = require("fs")

var filename = null

var debug = 0

var output = []
var program = null
var program_name = "line"
var program_line_no = 0
var wait_list = []
var global_vars = new Set()

var proc_list = []

function print(s) {
	output.push(s)
}

/* LEXER */

function lex(s, line_no) {
	// split "s" into lines of space separated words
	// words can be quoted with balanced (), [], or {} or escaped "" or ''
	// newlines can be embedded inside words

	var lines = []
	var words = []
	var p = 0, n = s.length, m

	var ml = line_no

	function next() {
		if (s[p] === "\\")
			++p
		if (s[p] === "\n")
			++line_no
		++p
	}

	function lex_newline() {
		while (p < n && s[p] === "\n")
			next()
		if (words.length > 0) {
			lines.push(words)
			words = []
		}
	}

	function lex_semi() {
		next()
		if (words.length > 0) {
			lines.push(words)
			words = []
		}
	}

	function lex_hash() {
		var h = p
		while (p < n && s[p] !== "\n")
			next()
		if (s[p] === "\n")
			next()
		h = s.substring(h, p).match(/# (\d+) "([^"]+)"/)
		if (h) {
			line_no = Number(h[1])
			filename = h[2]
		}
	}

	function lex_comment() {
		while (p < n && s[p] !== "\n")
			next()
	}

	function lex_c_comment() {
		var x = 1
		while (p < n && x > 0) {
			if (s[p] === "*" && s[p+1] === "/") {
				next()
				x = 0
			}
			next()
		}
		if (p >= n && x > 0)
			throw new CompileError(ml, "unterminated comment")
	}

	function push_word(s) {
		if (words.length === 0)
			words.line_no = ml
		if (s[0] === "{" || s[0] === "[") {
			s = new String(s)
			s.line_no = ml
		}
		words.push(s)
	}

	function lex_word() {
		while (p < n && !" \t\n".includes(s[p]))
			next()
		push_word(s.substring(m, p))
	}

	function lex_qstring(q) {
		var x = 1
		next()
		while (p < n && x > 0) {
			if (s[p] === q)
				--x
			next()
		}
		if (p >= n && x > 0)
			throw new CompileError(ml, "unterminated string")
		push_word(s.substring(m, p))
	}

	function lex_bstring(a, b) {
		var x = 1
		next()
		while (p < n && x > 0) {
			if (s[p] === a)
				++x
			else if (s[p] === b)
				--x
			next()
		}
		if (p >= n && x > 0)
			throw new CompileError(ml, "unterminated string")
		push_word(s.substring(m, p))
	}

	while (p < n) {
		// skip whitespace
		while (s[p] === " " || s[p] === "\t")
			next()

		// at end-of-file
		if (p >= n)
			break

		ml = line_no
		m = p
		if (s[p] === "{")
			lex_bstring("{", "}")
		else if (s[p] === "[")
			lex_bstring("[", "]")
		else if (s[p] === "(")
			lex_bstring("(", ")")
		else if (s[p] === '`')
			lex_qstring('`')
		else if (s[p] === '"')
			lex_qstring('"')
		else if (s[p] === "'")
			lex_qstring("'")
		else if (s[p] === "\n")
			lex_newline()
		else if (s[p] === ";")
			lex_semi()
		else if (s[p] === "#")
			lex_hash()
		else if (s[p] === "/" && s[p+1] === "/")
			lex_comment()
		else if (s[p] === "/" && s[p+1] === "*")
			lex_c_comment()
		else
			lex_word()
	}

	if (words.length > 0)
		lines.push(words)

	return lines
}

/* COMPILER */

class CompileError extends Error {
	constructor(line_no, msg) {
		super(filename + ":" + line_no + ": " + msg)
		this.name = "CompileError"
	}
}

function check_syntax(line_no, code) {
	try {
		new Function(code)
	} catch (err) {
		throw new CompileError(line_no, err.toString())
	}
}

function sub_var(match, p1) {
	if (global_vars.has(p1))
		return "G." + p1
	return "G.F." + p1
}

function quote(s) {
	if ("${[(`\"".includes(s[0]))
		return s
	return '"' + s + '"'
}

function compile_verbatim(line) {
	var code = line.join(" ")
	check_syntax(line.line_no, code)
	print(code)
}

function check_wait_return(line_no, start) {
	var in_action = false
	var vm_end_action = "{ G.F.I = " + (program.length-1) + " }"
	for (var i = start; i < program.length; ++i) {
		var op = program[i]
		if (in_action) {
			if (op.endsWith(vm_end_action))
				in_action = false
		} else {
			if (op.includes("vm_action"))
				in_action = true
			else if (op.includes("vm_return"))
				throw new CompileError(line_no, "return found in wait block")
			else if (op.includes("vm_tailcall"))
				throw new CompileError(line_no, "goto found in wait block")
			else if (op.includes("vm_tailcall"))
				throw new CompileError(line_no, "call found in wait block")
		}
	}
}

function emit(str) {
	// variable substitutions
	str = str.replace(/\$(\w+)/g, sub_var)
	// prefix line-number for tricky debugging
	if (debug)
		str = "/* " + program_line_no + " */ " + str
	program.push(str)
	return program.length - 1
}

function emit_jz(exp, to = "%") {
	return emit("if (!(" + exp + ")) G.F.I = " + to)
}

function emit_jump(to = "%") {
	return emit("G.F.I = " + to)
}

function label(ix) {
	program[ix] = program[ix].replace("%", program.length)
}

const macro_list = {}

const top_level = {
	global(line) {
		var args = line.slice(1)
		for (var name of line.slice(1))
			global_vars.add(name.valueOf())
	},

	macro(line) {
		var name = line[1]
		var args = line.slice(2,-1).map(s => new RegExp("\\b" + s + "\\b", "g"))
		var body = line[line.length-1]
		console.warn("DEFINE", name, args)
		macro_list[name] = { args, body, line_no: line.line_no }
	},

	proc(line) {
		var name = program_name = line[1]
		var args = line.slice(2,-1)
		var body = line[line.length-1]
		program = []
		c_body(body)
		for (var line of program)
			check_syntax(body.line_no, line)

		proc_list.push({
			name,
			args,
			program,
		})
	},

	function: compile_verbatim,
	const: compile_verbatim,
	var: compile_verbatim,

	"exports.roles": compile_verbatim,
	"exports.scenarios": compile_verbatim,
	'"use strict"': ()=>{}
}

const proc_level = {
	global(line) {
		if (line.length !== 3)
			throw new CompileError(line.line_no, "invalid global statement")
		emit("G." + line[1] + " = " + line[2])
	},
	local(line) {
		if (line.length !== 3)
			throw new CompileError(line.line_no, "invalid local statement")
		emit("G.L." + line[1] + " = " + line[2])
	},
	set(line) {
		if (line.length !== 3)
			throw new CompileError(line.line_no, "invalid set statement")
		emit("$" + line[1] + " = " + line[2])
	},
	incr(line) {
		if (line.length !== 2)
			throw new CompileError(line.line_no, "invalid incr statement")
		emit("++$" + line[1])
	},
	decr(line) {
		if (line.length !== 2)
			throw new CompileError(line.line_no, "invalid decr statement")
		emit("--$" + line[1])
	},

	invoke(line) {
		var macro = macro_list[line[1]]
		var args = line.slice(2)
		if (!macro)
			throw new CompileError(line.line_no, "cannot find macro definition")
		if (args.length !== macro.args.length)
			throw new CompileError(line.line_no, "wrong number of arguments to macro")
		var body = macro.body
		for (var i = 0; i < args.length; ++i) {
			var arg = args[i]
			// unescape blocks!
			if (arg[0] === "{")
				arg = arg.slice(1,-1)
			body = body.replace(macro.args[i], arg)
		}
		c_body(body)
	},

	eval(line) {
		emit(line.slice(1).join(" "))
	},

	prompt(line) {
		emit("prompt(" + line.slice(1).join(" ") + ")")
	},

	log(line) {
		emit("log(" + line.slice(1).join(" ") + ")")
	},

	call(line) {
		if (line.length > 2)
			emit("vm_call_args(" + quote(line[1]) + ",[" + line.slice(2).join(",") + "])")
		else
			emit("vm_call(" + quote(line[1]) + ")")
	},

	goto(line) {
		if (line.length > 2)
			emit("vm_tailcall_args(" + quote(line[1]) + ",[" + line.slice(2).join(",") + "])")
		else
			emit("vm_tailcall(" + quote(line[1]) + ")")
	},

	return(line) {
		if (line.length !== 1)
			throw new CompileError(line_no, "invalid return statement")
		emit("vm_return()")
	},

	for(line) {
		// for x in y to z {}
		if (line.length === 7 && line[2] === "in" && line[4] === "to") {
			var [ _for, x, _in, start, _to, end, body ] = line
			emit(`G.F.${x} = ${start}`)
			var ix_loop = program.length
			c_body(body)
			emit(`if (++G.F.${x} <= ${end}) G.F.I = ${ix_loop}`)
			return
		}

		// for x in y to z where w {}
		if (line.length === 9 && line[2] === "in" && line[4] === "to") {
			var [ _for, x, _in, start, _to, end, _where, pred, body ] = line
			emit(`G.F.${x} = ${start}`)
			var ix_loop = emit_jz(pred, '%')
			c_body(body)
			label(ix_loop)
			emit(`if (++G.F.${x} <= ${end}) G.F.I = ${ix_loop}`)
			return
		}

		// for x in y {}
		if (line.length === 5 && line[2] === "in") {
			var [ _for, x, _in, list, body ] = line
			var i = "_" + x
			var a = "__" + x
			emit(`G.F.${i} = 0; G.F.${a} = ${list}`)
			var ix_loop = emit(`if (G.F.${i} < G.F.${a}.length) { G.F.${x} = G.F.${a}[G.F.${i}++] } else { G.F.I = % }`)
			c_body(body)
			emit_jump(ix_loop)
			label(ix_loop)
			emit(`delete G.F.${i}; delete G.F.${a}`)
			return
		}

		// for x in y where z {}
		if (line.length === 7 && line[2] === "in" && line[4] === "where") {
			var [ _for, x, _in, list, _where, pred, body ] = line
			var i = "_" + x
			var a = "__" + x
			emit(`G.F.${x} = 0; G.F.${a} = ${list}`)
			var ix_loop = emit(`if (G.F.${i} < G.F.${a}.length) { G.F.${x} = G.F.${a}[G.F.${i}++] } else { G.F.I = % }`)
			emit_jz(pred, ix_loop)
			c_body(body)
			emit_jump(ix_loop)
			label(ix_loop)
			emit(`delete G.F.${i}; delete G.F.${a}`)
			return
		}

		throw new CompileError(line.line_no, "invalid for statement")
	},

	if(line) {
		var line_no = line.line_no
		line = line.slice()
		var ix_end = []
		while (line.length > 1) {
			var what = line.shift()
			if ((what === "if" || what === "elseif") && line.length >= 2) {
				var ix_else = emit_jz(line.shift())
				c_body(line.shift())
				ix_end.push(emit_jump())
				label(ix_else)
			} else if ((what === "else") && line.length === 1) {
				c_body(line.shift())
			} else {
				break
			}
		}
		if (line.length > 0)
			throw new CompileError(line_no, "invalid if-elseif-else statement")
		for (var ix of ix_end)
			label(ix)
	},

	while(line) {
		if (line.length !== 3)
			throw new CompileError(line.line_no, "invalid while statement")
		var ix_loop = emit_jz(line[1])
		c_body(line[2])
		emit_jump(ix_loop)
		label(ix_loop)
	},

	wait(line) {
		var ix_begin
		wait_list.unshift([])
		if (line.length === 2) {
			ix_begin = emit("vm_wait_begin()")
			c_body(line[1])
		} else {
			throw new CompileError(line.line_no, "invalid wait statement")
		}
		for (var ix of wait_list.shift())
			label(ix)
		emit("vm_wait_end()")
		check_wait_return(line.line_no, ix_begin)
	},

	view(line) {
		if (line.length === 2 && line[1][0] === "{")
			emit("if (V) " + line[1])
		else
			throw new CompileError(line.line_no, "invalid view statement")
	},

	undo(line) {
		line.shift()
		proc_level.action(line, true)
	},

	noundo(line) {
		line.shift()
		proc_level.action(line, false)
	},

	action(line, undo=true) {
		var name = line[1]
		if (line.length === 4) {
			var arg = line[2]
			var body = line[3]
			var ix_jump = emit(`vm_action(%, ${undo}, ${quote(name)}, ${arg})`)
			c_body(body)
			wait_list[0].push(emit_jump())
			label(ix_jump)
		} else if (line.length === 3) {
			var body = line[2]
			var ix_jump = emit(`vm_action(%, ${undo}, ${quote(name)}, true)`)
			c_body(body)
			wait_list[0].push(emit_jump())
			label(ix_jump)
		} else {
			throw new CompileError(line.line_no, "invalid action statement")
		}
	},

	disable(line) {
		if (line.length !== 2)
			throw new CompileError(line.line_no, "invalid disable statement")
		emit(`if (V) V.actions[${quote(line[1])}] = 0`)
	}
}

function c_body(body) {
	if (body[0] !== "{")
		throw new CompileError(body.line_no, "expected body")
	for (var line of lex(body.slice(1, -1), body.line_no)) {
		program_line_no = line.line_no
		if (line[0][0] === "{") {
			var code = line.join(" ")
			check_syntax(line[0].line_no, code)
			emit(code)
		} else {
			var cc = proc_level[line[0]]
			if (!cc)
				throw new CompileError(line.line_no, "unknown statement: " + line[0])
			cc(line)
		}
	}
}

function compile_top_level(source) {
	for (var line of lex(source, 1)) {
		var cc = top_level[line[0]]
		if (!cc)
			throw new CompileError(line.line_no, "unknown top-level declaration: " + line[0])
		cc(line)
	}
}

function print_procs() {
	const inst_reuse = {}
	const inst_cache = {}

	function reuse_scan(code) {
		// naked function call with no arguments
		if (/^\w+\(\)$/.test(code.trim()))
			return
		inst_reuse[code] = (inst_reuse[code] | 0) + 1
	}

	function reuse_emit() {
		var ix = 1
		for (var code in inst_reuse) {
			if (inst_reuse[code] > 1) {
				var nm = "_" + (ix++)
				print(`function ${nm}(){ ${code} }`)
				inst_cache[code] = nm
			}
		}
	}

	function reuse(code) {
		// naked function call with no arguments
		if (/^\w+\(\)$/.test(code.trim()))
			return code.trim().replace("()", "")
		// line we've seen before
		if (code in inst_cache)
			return inst_cache[code]
		return "()=>{ " + code + " }"
	}

	for (var proc of proc_list)
		for (var line of proc.program)
			reuse_scan(line)

	print()
	print("/* PROCS */")
	print()

	reuse_emit(line)

	for (var proc of proc_list) {
		if (proc.name[0] === '"')
			print("\nP[" + proc.name + "] = {")
		else
			print("\nP." + proc.name + " = {")
		if (proc.args.length > 0)
			print("\targs: " + JSON.stringify(proc.args) + ",")
		print("\tprog: [")
		for (var line of proc.program)
			print("\t\t" + reuse(line) + ",")
		print("\t]\n}")
	}
}

/* RUNTIME */

print(`// DO NOT EDIT!
// This file has been auto-generated.

/* RUNTIME */

"use strict"

var G, V, V_inactive, Aa, Ag, R, P = {}

function log(str) {
	if (G.W)
		throw new Error("cannot 'log' inside a wait!")
	if (str === undefined) {
		if (G.log.length > 0 && G.log[G.log.length - 1] !== "")
			G.log.push("")
	} else {
		G.log.push(str)
	}
}

function prompt(str) {
	if (!G.W)
		throw new Error("cannot 'prompt' outside a wait!")
	if (V)
		V.prompt = str
}

function vm_return() {
	G.F = G.F.R
}

function vm_call(name) {
	var proc = P[name]
	if (!proc)
		throw new Error("proc not found: " + name)
	if (proc.args)
		throw new Error("wrong number of arguments to proc: " + name)
	if (!proc)
		throw new Error("proc not found: " + name)
	G.F = { P: name, I: 0, R: G.F }
}

function vm_call_args(name, args) {
	var proc = P[name]
	if (!proc)
		throw new Error("proc not found: " + name)
	if (!proc.args || proc.args.length !== args.length)
		throw new Error("wrong number of arguments to proc: " + name)
	var F = { P: name, I: 0, R: G.F }
	for (var i = 0, n = args.length; i < n; ++i)
		F[proc.args[i]] = args[i]
	G.F = F
}

function vm_tailcall(name) {
	vm_call(name)
	G.F.R = G.F.R.R
}

function vm_tailcall_args(name, args) {
	vm_call_args(name, args)
	G.F.R = G.F.R.R
}

function vm_wait_begin() {
	if (G.W)
		throw new Error("cannot wait inside a wait!")
	G.W = G.F.I
	if (!V)
		throw "HALT"
}

function vm_wait_end() {
	if (V) {
		G.F.I = G.W
		throw "HALT"
	} else {
		if (G.W) {
			// implicit undo action
			if (Aa === "undo") {
				if (G.undo && G.undo.length > 0)
					pop_undo()
				else
					throw new Error("undo with empty undo stack!")
				G.F.I = G.W
				throw "HALT"
			} else {
				throw new Error("wait block exited without triggering an action")
			}
		}
	}
}

function vm_action(jump, undo, act, arg) {
	if (V) {
		if (V.actions) {
			if (arg === true)
				V.actions[act] = 1
			else if (arg === false)
				V.actions[act] = 0
			else {
				if (!(act in V.actions))
					V.actions[act] = []
				V.actions[act].push(arg)
			}
		}
		G.F.I = jump
	} else {
		if (act === Aa && (arg === true || arg === Ag)) {
			if (undo)
				push_undo()
			G.W = 0
		} else {
			G.F.I = jump
		}
	}
}

function vm_run() {
	if (G.F.I !== G.W)
		throw new Error("script not at wait-point " + G.F.I + " != " + G.W)
	try {
		while (G.F !== null) {
			var prog = P[G.F.P].prog
			if (G.F.I < prog.length) {
				if (${debug})
					console.log(">", G.F.P, G.F.I, prog[G.F.I].toString())
				prog[G.F.I++]()
			} else {
				G.F = G.F.R
			}
		}
	} catch (err) {
		if (err === "HALT") {
			return true
		}
		throw err
	}
	throw new Error("script terminated")
}

function vm_start(p, scope) {
	G.F = { P: p, I: 0, ...scope }
	G.W = 0
	if (!P[p])
		throw new Error("cannot find proc: " + p)
	vm_run()
}

exports.setup = function (seed, scenario, options) {
	G = {
		active: null,
		seed,
		log: [],
		undo: [],
	}
	R = null
	Aa = Ag = null
	V = null

	on_setup(scenario, options)
	on_save()

	return G
}

exports.finish = function (state, result, message) {
	G = state
	R = null
	Aa = Ag = null
	V = null
	vm_start("_finish", { result, message })
	return G
}

exports.view = function (state, role) {
	G = state
	R = role
	Aa = Ag = null
	V = {
		prompt: null,
		log: G.log,
	}
	V_inactive = null

	var is_active = ((Array.isArray(G.active) && G.active.includes(R)) || G.active === R)

	on_load()
	on_view()

	if (is_active) {
		V.actions = {}
		vm_run()
		if (V.actions.undo === undefined) {
			if (G.undo && G.undo.length > 0)
				V.actions.undo = 1
			else
				V.actions.undo = 0
		}
		if (!V.prompt) {
			V.prompt = G.F.P
			for (var frame = G.F.R; frame; frame = frame.R)
				V.prompt = frame.P + " > " + V.prompt
		}
	} else if (!${debug}) {
		if (Array.isArray(G.active))
			V.prompt = "Waiting for " + G.active.join(" and ") + "."
		else
			V.prompt = "Waiting for " + G.active + "."
	}

	if (!V.prompt) {
		V.prompt = G.F.P
		for (var frame = G.F.R; frame; frame = frame.R)
			V.prompt = frame.P + " > " + V.prompt
	}

	on_save()

	return V
}

exports.action = function (state, role, action, argument) {
	G = state
	R = role
	Aa = action
	Ag = argument
	V = null

	var old_active = G.active

	on_load()
	vm_run()
	on_save()

	if (old_active !== G.active)
		clear_undo()

	return G
}
`)

/* MAIN */

compile_top_level(`
	global active
	proc _finish result message {
		{
			G.active = "None"
			G.result = G.F.result
			log()
			log(G.F.message)
		}
		wait {
			prompt (G.F.message)
		}
	}
`)

try {
	for (var i = 2; i < process.argv.length; ++i) {
		filename = process.argv[i]
		print("/* JAVASCRIPT */")
		compile_top_level(fs.readFileSync(filename, "utf8", 1))
	}
} catch (err) {
	if (err instanceof CompileError)
		console.error(err.message)
	else
		console.error(err)
	process.exit(1)
}

print_procs()

process.stdout.write(output.join("\n"))
