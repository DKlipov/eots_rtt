/* WORLD JAVASCRIPT - DO NOT EDIT */

"use strict"

var G, V, R // convenient aliases so that we can share bits of code verbatim from rules.js

/* CUSTOM */

function onc_click_focus(e,evt) {

	if (world.focus !== e.parent) {
		if (world.focus != null) {
			world.focus.classList.remove("focus")
		}
		world.focus = e.parent
		e.parent.classList.add("focus")
		on_update()
		if (e.parent.childNodes.length > 1) {
			evt.stopPropagation()
		}
	}
}


/* MISC */

function assert(exp, msg) {
	if (!exp)
		throw new Error("ASSERT: " + msg)
}

function $(x) {
	if (typeof x === "object") {
		if (x instanceof Element)
			return x
		if (x.element instanceof Element)
			return x.element
	}
	return document.querySelector(x)
}

function toggle_pieces() {
	document.body.classList.toggle("hide-pieces")
}

function toggle_markers() {
	document.body.classList.toggle("hide-markers")
}

function toggle_markers_and_pieces() {
	// cycle between showing everything, only pieces, and nothing.
	var hidden_pieces = document.body.classList.contains("hide-pieces")
	var hidden_markers = document.body.classList.contains("hide-markers")
	if (hidden_pieces && hidden_markers) {
		document.body.classList.remove("hide-pieces")
		document.body.classList.remove("hide-markers")
	} else if (hidden_pieces) {
		document.body.classList.add("hide-markers")
	} else {
		document.body.classList.add("hide-pieces")
	}
}

function is_disabled_button(action, id) {
	if (id === undefined && V.actions && V.actions[action] === 0)
		return true
	return false
}

function is_action(action, id) {
	if (V.actions) {
		if (id === undefined)
			return V.actions[action] === 1
		if (V.actions[action] === undefined)
			return false
		if (!Array.isArray(V.actions[action]))
			throw new Error("action is not a list: " + action)
		return V.actions[action].includes(id)
	}
	return false
}

function resize_rect(rect, w, h) {
	var x = rect[0] + rect[2]/2
	var y = rect[1] + rect[3]/2
	return [ x - w/2, y - h/2, w, h ]
}

function translate_rect(rect, dx, dy) {
	var x = rect[0] + rect[2]/2
	var y = rect[1] + rect[3]/2
	return [ rect[0] + dx, rect[1] + dy, rect[2], rect[3] ]
}

function expand_rect(rect, dx, dy) {
	var x = rect[0] + rect[2]/2
	var y = rect[1] + rect[3]/2
	return [ rect[0] - dx, rect[1] - dy, rect[2] + dx * 2, rect[3] + dy * 2 ]
}

/* WORLD */

const world = {
	things: {},
	favicon: $("link[rel='icon']"),
	header: $("header"),
	status: $("#status"),
	mapwrap: $("#mapwrap"),
	panzoom: $("#pan_zoom_main"),
	tip: $("#tip"),
	log: $("#log"),
	parent_list: [],
	stack_list: [],
	action_list: [],
	button_list: [],
	animate_list: [],
	keyword_list: [],
	text_list: [],
	log_boxes: [],
	window_list: [],
	focus: null,
	mouse_focus: false,
	last_focus: null,
	generic_unused: {},
	generic_used: {},
	prefs: {},
	parent: $("#map"),
	parent_w: 1920,
	parent_h: 1080,
}

class Thing {
	constructor(element, action, id) {
		assert(element, "thing without an html element")

		element.thing = this

		this.element = element
		this.my_action = action
		this.my_id = id

		element.classList.add(action)
		this.my_keywords = Array.from(element.classList)

		this.is_parent = false
		this.is_stack = false
		this.is_action = false
		this.is_keyword = false
		this.is_text = false
		this.is_animate = false
		this.is_rotate = false

		if (!world.things[action])
			world.things[action] = []
		world.things[action][id] = this
	}

	register_focusable(){
		register_focusable(this.element)
		this.element.addEventListener("mousedown", e=>console.log(e))
		console.log(this.element)
		this.element.onclick = function() { alert('blah'); };
		return this
	}

	action() {
		if (!this.is_action) {
			this.is_action = true
			this.element.addEventListener("mousedown", _on_click_thing)
			world.action_list.push(this)
		}
		return this
	}

	button() {
		if (!this.is_action) {
			this.is_action = true
			this.element.addEventListener("mousedown", _on_click_thing)
			world.button_list.push(this)
		}
		return this
	}

	stackable() {
		// for non-action elements that populate stacks (and should expand the stack when clicked)
		// also for mouse-focusable things
		if (!this.is_stackable) {
			this.is_stackable = true
			if (!this.is_action)
				this.element.addEventListener("mousedown", _on_click_stackable)
			this.element.addEventListener("mouseenter", _on_focus_stackable)
		}
		return this
	}

	animate(time = 300) {
		if (!this.is_animate) {
			this.is_animate = true
			world.animate_list.push(this)
		}
		this.my_time = time
		return this
	}

	ensure_parent() {
		if (!this.is_parent) {
			this.is_parent = true
			world.parent_list.push(this)
		}
		return this
	}

	ensure_keyword() {
		if (!this.is_keyword) {
			this.is_keyword = true
			this.my_dynamic_keywords = []
			world.keyword_list.push(this)
		}
		return this
	}

	ensure_text() {
		if (!this.is_text) {
			this.is_text = true
			this.my_text = null
			this.my_text_html = null
			world.text_list.push(this)
		}
		return this
	}

	ensure_rotate() {
		if (!this.is_rotate) {
			this.is_rotate = true
			this.my_old_angle = 0
			this.my_new_angle = 0
		}
		return this
	}

	tooltip(tip) {
		var id = this.my_id
		this.element.addEventListener("mouseenter", function () {
			try {
				world.status.innerHTML = (typeof tip === "function") ? tip(id) : tip
			} catch (err) {
				world.status.textContent = err.toString()
			}
		})
		this.element.addEventListener("mouseleave", function () {
			world.status.innerHTML = ""
		})
		return this
	}

	tooltip_image(tip) {
		var id = this.my_id
		this.element.addEventListener("mouseenter", function () {
			if (typeof tip === "function") tip(id, true)
		})
		this.element.addEventListener("mouseleave", function () {
			if (typeof tip === "function") tip(id, false)
		})
		return this
	}

	layout(rect, keywords) {
		var e = this.element

		world.parent.appendChild(this.element)

		this.keyword(keywords)

		if (Array.isArray(rect))
			var [ x, y, w, h ] = rect
		else
			var { x, y, w, h } = rect
		x = Math.round(x)
		y = Math.round(y)
		w = Math.round(w ?? 0)
		h = Math.round(h ?? 0)

		var r = world.parent_w - (x + w)
		var b = world.parent_h - (y + h)
		//TEMP TODO
		// for some reason, the layout gets completly broken if we don't corrupt these two values
		r = b = NaN
		var grow_n = this.my_keywords.includes("grow-n")
		var grow_e = this.my_keywords.includes("grow-e")
		var grow_s = this.my_keywords.includes("grow-s")
		var grow_w = this.my_keywords.includes("grow-w")

		if (!grow_n) e.style.top = Math.round(y) + "px"
		if (!grow_s) e.style.bottom = Math.round(b) + "px"
		if (!grow_e) e.style.right = Math.round(r) + "px"
		if (!grow_w) e.style.left = Math.round(x) + "px"
		if (grow_w || grow_e)
			this.keyword("grow-h")

		e.style.minHeight = Math.round(h) + "px"
		e.style.minWidth = Math.round(w) + "px"

		return this
	}

	stack(rect, dx, dy, major_dx, major_dy, minor_dx, minor_dy, threshold, wrap, gravity_x, gravity_y) {
		world.parent.appendChild(this.element)

		if (Array.isArray(rect))
			var [ x, y, w, h ] = rect
		else
			var { x, y, w, h } = rect
		this.element.style.left = Math.round(x) + "px"
		this.element.style.top = Math.round(y) + "px"
		this.element.style.width = Math.round(w) + "px"
		this.element.style.height = Math.round(h) + "px"

		this.is_stack = true
		this.my_stack = {
			w, h,
			dx, dy, // normal
			major_dx, major_dy, // expanded major-axis
			minor_dx, minor_dy, // expanded minor-axis
			threshold,
			wrap,
			gravity_x, gravity_y,
		}

		world.stack_list.push(this)

		return this
	}

	static_child(parent) {
		$(parent).appendChild(this.element)
		return this
	}

	keyword(keywords, on = true) {
		if (keywords && on) {
			if (typeof keywords === "string")
				keywords = keywords.trim().split(" ")
			for (var word of keywords) {
				if (!this.my_keywords.includes(word))
					this.my_keywords.push(word)
				this.element.classList.add(word)
			}
		}
		return this
	}

	// style({ key: value, ... }) or style(key, value)
	style(dict_or_key, value) {
		if (typeof dict_or_key === "string") {
			this.element.style.setProperty(dict_or_key, value)
		} else {
			for (var key in dict_or_key)
				this.element.style.setProperty(key, styles[key])
		}
		return this
	}

	text(s) {
		this.element.textContent = s
		return this
	}

	text_html(s) {
		this.element.innerHTML = s
		return this
	}
}

function lookup_thing(action, id) {
	var list = world.things[action]
	if (list === undefined)
		throw new Error(`cannot find thing: ${action} ${id}`)
	var thing = list[id]
	if (thing === undefined)
		throw new Error(`cannot find thing: ${action} ${id}`)
	return thing
}

function _on_click_thing(evt) {
	if (evt.button === 0) {
		var thing = evt.target.thing
		evt.stopPropagation()
		if (_focus_stack(thing.element.parentElement.thing))
			if (!send_action(thing.my_action, thing.my_id))
				_blur_stack()
	}
}

function _on_click_stackable(evt) {
	if (evt.button === 0) {
		var thing = evt.currentTarget.thing
		evt.stopPropagation()
		_focus_stack(thing.element.parentElement.thing)
	}
}

function _on_focus_stackable(evt) {
	if (world.mouse_focus) {
		var thing = evt.currentTarget.thing
		_focus_stack(thing.element.parentElement.thing)
	}
}

/* DEFINE THINGS */

function define_thing(action, id) {
	return new Thing(document.createElement("div"), action, id)
}

function define_html_thing(selector, action, id) {
	return new Thing($(selector), action, id)
}

function define_board(selector, w, h, padding=[0,0,0,0]) {
	world.parent = $(selector)
	world.parent.my_padding = padding
	assert(world.parent, "board not found: " + selector)
	world.parent.classList.add("board")
	if (!w || !h) {
		w = world.parent.offsetWidth
		h = world.parent.offsetHeight
	}
	world.parent_w = w
	world.parent_h = h
}

function sort_board(x_weight = 1, y_weight = 2) {
	var parent = world.parent
	var list = Array.from(parent.childNodes).filter(node => node instanceof Element)
	list.sort((a,b) => {
		// svg at the start
		if ((a instanceof SVGElement) && !(b instanceof SVGElement)) return -1
		if (!(a instanceof SVGElement) && (b instanceof SVGElement)) return 1

		// overlays at the end
		if ((a instanceof HTMLDetailsElement) && !(b instanceof HTMLDetailsElement)) return 1
		if (!(a instanceof HTMLDetailsElement) && (b instanceof HTMLDetailsElement)) return -1

		// everything else sorted for cabinet projection order
		var ra = a.getBoundingClientRect()
		var rb = b.getBoundingClientRect()
		var za = ra.top * y_weight + ra.left * x_weight
		var zb = rb.top * y_weight + rb.left * x_weight
		return za - zb
	})
	parent.replaceChildren()
	for (var e of list)
		parent.appendChild(e)
}

function define_stack(action, id, rect, dx=-12, dy=-12, major_dx=dx, major_dy=dy, minor_dx=0, minor_dy=0, threshold=1, wrap=1000, gravity_x=0.5, gravity_y=0.5) {
	return define_thing(action, id)
		.keyword("stack")
		.stack(rect, dx, dy, major_dx, major_dy, minor_dx, minor_dy, threshold, wrap, gravity_x, gravity_y)
}

function define_layout(action, id, rect, keywords, styles) {
	return define_thing(action, id)
		.keyword("layout")
		.keyword(keywords)
		.style(styles)
		.layout(rect)
}

function define_layout_track_h(action, a, b, layout, gap=0, keywords, styles) {
	var [ x, y, w, h ] = layout
	var n = 1 + Math.abs(b - a)
	var cell_w = (w - gap * (n-1)) / n
	if (a < b) {
		for (var id = a; id <= b; ++id) {
			define_layout(action, id, [ x, y, cell_w, h ], keywords, styles)
			x += cell_w + gap
		}
	} else {
		for (var id = a; id >= b; --id) {
			define_layout(action, id, [ x, y, cell_w, h ], keywords, styles)
			x += cell_w + gap
		}
	}
}

function define_layout_track_v(action, a, b, layout, gap=0, keywords, styles) {
	var [ x, y, w, h ] = layout
	var n = 1 + Math.abs(b - a)
	var cell_h = (h - gap * (n-1)) / n
	if (a < b) {
		for (var id = a; id <= b; ++id) {
			define_layout(action, id, [ x, y, w, cell_h ], keywords, styles)
			y += cell_h + gap
		}
	} else {
		for (var id = a; id >= b; --id) {
			define_layout(action, id, [ x, y, w, cell_h ], keywords, styles)
			y += cell_h + gap
		}
	}
}

function define_layout_grid(action, order, cols, rows, layout, gapx, gapy, keywords, styles) {
	var [ x, y, w, h ] = layout
	var cell_w = (w - gapx * (cols-1)) / cols
	var cell_h = (h - gapy * (rows-1)) / rows
	var r, c, i
	i = 0
	for (r = 0; r < rows; ++r) {
		x = layout[0]
		for (c = 0; c < cols; ++c) {
			define_layout(action, order[i++], [ x, y, cell_w, cell_h ], keywords, styles)
			x += cell_w + gapx
		}
		y += cell_h + gapy
	}
}

function define_button(action, id, text) {
	var element = document.createElement("button")
	element.innerHTML = text
	return define_html_thing(element, action, id)
		.button()
}

function define_html_space(selector, action, id) {
	return define_html_thing(selector, action, id)
		.keyword("space")
		.action()
}

function define_space(action, id, rect, keywords) {
	return define_thing(action, id)
		.keyword("space")
		.action()
		.keyword(keywords)
		.layout(rect)
}

function define_piece(action, id, keywords) {
	return define_thing(action, id)
		.keyword("piece")
		.action()
		.animate()
		.keyword(keywords)
		.stackable()
}

function define_marker(action, id, keywords) {
	return define_thing(action, id)
		.keyword("marker")
		.action()
		.animate()
		.keyword(keywords)
		.stackable()
}

function define_card(action, id, keywords) {
	return define_thing(action, id)
		.keyword("card")
		.action()
		.keyword(keywords)
}

function define_piece_list(action, a, b, keywords) {
	for (var i = a; i <= b; ++i)
		define_piece(action, i, keywords)
}

function define_marker_list(action, a, b, keywords) {
	for (var i = a; i <= b; ++i)
		define_marker(action, i, keywords)
}

function define_card_list(action, a, b, keywords_with_prefix) {
	for (var i = a; i <= b; ++i)
		define_card(action, i, keywords_with_prefix + i)
}

/* UPDATE THINGS */

function update_favicon(url) {
	world.favicon.href = url
}

// populate(parent_action, [parent_id], child_action, [child_id])
function populate(parent_action, arg2, arg3, arg4) {
	var parent_id, child_action, child_id
	if (typeof arg2 === "string") {
		parent_id = undefined
		child_action = arg2
		child_id = arg3
	} else {
		parent_id = arg2
		child_action = arg3
		child_id = arg4
	}
	var parent = lookup_thing(parent_action, parent_id)
	var child = lookup_thing(child_action, child_id)
	parent.ensure_parent()
	parent.element.appendChild(child.element)
	return child.element
}

// populate_with_list(parent_action, [parent_id], child_action, child_id_list, fallback)
function populate_with_list(parent_action, arg2, arg3, arg4, arg5) {
	var parent_id, child_action, child_id_list, fallback
	if (typeof arg2 === "string") {
		parent_id = undefined
		child_action = arg2
		child_id_list = arg3
		fallback = arg4
	} else {
		parent_id = arg2
		child_action = arg3
		child_id_list = arg4
		fallback = arg5
	}
	var parent = lookup_thing(parent_action, parent_id)
	parent.ensure_parent()
	if (child_id_list) {
		for (var child_id of child_id_list) {
			if (child_id < 0)
				parent.element.appendChild(_create_generic(fallback))
			else
				parent.element.appendChild(lookup_thing(child_action, child_id).element)
		}
	}
}

function _create_generic(keywords) {
	var unused = world.generic_unused[keywords] ??= []
	var used = world.generic_used[keywords] ??= []
	var e
	if (unused.length > 0) {
		e = unused.pop()
	} else {
		e = document.createElement("div")
		e.className = keywords
	}
	used.push(e)
	return e
}

// populate_generic(parent_action, [parent_id], keywords, n=1)
function populate_generic(parent_action, arg2, arg3, arg4) {
	var parent_id, keywords, n
	if (typeof arg2 === "string" || Array.isArray(arg2)) {
		parent_id = undefined
		keywords = arg2
		n = arg4
	} else {
		parent_id = arg2
		keywords = arg3
		n = arg4
	}
	n = n ?? 1
	var parent = lookup_thing(parent_action, parent_id)
	parent.ensure_parent()
	while (n-- > 0)
		parent.element.appendChild(_create_generic(keywords))
}

function populate_generic_to_parent(parent, keywords) {
    var child = _create_generic(keywords)
    child.className = keywords
    child.parent = parent
    parent.appendChild(child)
    return child
 }

function update_position(action, id, x, y) {
	var thing = lookup_thing(action, id)
	thing.element.style.left = Math.round(x) + "px"
	thing.element.style.top = Math.round(y) + "px"
}
function set_add(set, item) {
    var a = 0
    var b = set.length - 1
    // optimize fast case of appending items in order
    if (item > set[b]) {
        set[b + 1] = item
        return
    }
    while (a <= b) {
        var m = (a + b) >> 1
        var x = set[m]
        if (item < x)
            b = m - 1
        else if (item > x)
            a = m + 1
        else
            return
    }
    array_insert(set, a, item)
}

function array_insert(array, index, item) {
    for (var i = array.length; i > index; --i)
        array[i] = array[i - 1]
    array[index] = item
}

function set_delete(set, item) {
    var a = 0
    var b = set.length - 1
    while (a <= b) {
        var m = (a + b) >> 1
        var x = set[m]
        if (item < x)
            b = m - 1
        else if (item > x)
            a = m + 1
        else {
            array_delete(set, m)
            return
        }
    }
}

function update_size(action, id, w, h) {
	var thing = lookup_thing(action, id)
	thing.element.style.width = Math.round(w) + "px"
	thing.element.style.height = Math.round(h) + "px"
}

function update_show(action, id, show) {
	var thing = lookup_thing(action, id)
	thing.element.hidden = !show
}

function update_style(action, id, key, value) {
	var thing = lookup_thing(action, id)
	thing.element.style.setProperty(key, value)
}

function update_rotation(action, id, angle) {
	var thing = lookup_thing(action, id)
	thing.ensure_rotate()
	thing.my_new_angle = angle
	thing.element.style.transform = `rotate(${angle}deg)`
}

function update_keyword(action, id, keyword, on = true) {
	var thing = lookup_thing(action, id)
	thing.ensure_keyword()
	if (on)
		thing.my_dynamic_keywords.push(keyword)
}

function update_text(action, id, text) {
	var thing = lookup_thing(action, id)
	thing.ensure_text()
	thing.my_text = text
}

function update_text_html(action, id, text) {
	var thing = lookup_thing(action, id)
	thing.ensure_text()
	thing.my_text_html = text
}

/* STACKS */

$("main")?.addEventListener("mousedown", function (evt) {
	if (evt.button === 0)
		_blur_stack()
})

function _focus_stack(stack) {
	if (stack?.is_stack) {
		if (world.focus === stack)
			return true

		world.focus = stack
		if (world.focus.element.children.length <= world.focus.my_stack.threshold)
			return true

		_animate_begin()
		_layout_stacks()
		_animate_end(200)

		return false
	}
	return true
}

function _blur_stack() {
	if (world.focus) {
		world.focus = null
		_animate_begin()
		_layout_stacks()
		_animate_end(200)
	}
}

function focus_stack_with_thing(action, id) {
	if (world.last_focus) {
		var stack = lookup_thing(action, id).element.parentElement?.thing
		if (stack?.is_stack)
			world.focus = stack
	}
}

function _layout_stacks() {
	function _(x) { return (typeof x === "function") ? x(n, stack) : x }
	for (var stack of world.stack_list) {
		var padding = stack.element.parentElement.my_padding

		var n = stack.element.children.length
		if (n === 0)
			continue

		var expand = (world.focus === stack || n <= _(stack.my_stack.threshold))
		var z = (world.focus === stack ? 1 : null)
		var major_dx = expand ? _(stack.my_stack.major_dx) : _(stack.my_stack.dx)
		var major_dy = expand ? _(stack.my_stack.major_dy) : _(stack.my_stack.dy)
		var minor_dx = expand ? _(stack.my_stack.minor_dx) : _(0)
		var minor_dy = expand ? _(stack.my_stack.minor_dy) : _(0)
		var wrap = expand ? _(stack.my_stack.wrap) : n
		var major = Math.min(n, wrap) - 1
		var minor = Math.ceil(n / wrap) - 1
		var stack_w = stack.my_stack.w
		var stack_h = stack.my_stack.h
		var grav_x = stack.my_stack.gravity_x
		var grav_y = stack.my_stack.gravity_y

		// clamp start so it fits on board
		var min_x = padding[3]
		var min_y = padding[0]
		var max_x = stack.element.parentElement.offsetWidth - stack.element.offsetWidth - padding[1]
		var max_y = stack.element.parentElement.offsetHeight - stack.element.offsetHeight - padding[2]

		var start_x = stack.element.offsetLeft
		var start_y = stack.element.offsetTop
		if (start_x < min_x) start_x = min_x
		if (start_y < min_y) start_y = min_y
		if (start_x > max_x) start_x = max_x
		if (start_y > max_y) start_y = max_y
		if (start_x + major_dx * major + minor_dx * minor < min_x) start_x = min_x - (major_dx * major + minor_dx * minor)
		if (start_y + major_dy * major + minor_dy * minor < min_y) start_y = min_y - (major_dy * major + minor_dy * minor)
		if (start_x + major_dx * major + minor_dx * minor > max_x) start_x = max_x - (major_dx * major + minor_dx * minor)
		if (start_y + major_dy * major + minor_dy * minor > max_y) start_y = max_y - (major_dy * major + minor_dy * minor)

		// use stack-local coords for children
		start_x -= stack.element.offsetLeft
		start_y -= stack.element.offsetTop

		var i = 0, k = 0
		for (var child of stack.element.children) {
			var w = child.offsetWidth
			var h = child.offsetHeight
			var x = start_x + major_dx * i + minor_dx * k + (stack_w - w) * grav_x
			var y = start_y + major_dy * i + minor_dy * k + (stack_h - h) * grav_y
			child.style.left = x + "px"
			child.style.top = y + "px"
			child.style.zIndex = z
			if (++i === wrap) {
				i = 0
				++k
			}
		}
	}
}

function _reset_stacks() {
	for (var stack of world.stack_list) {
		for (var e of stack.element.children) {
			e.style.left = null
			e.style.top = null
			e.style.zIndex = null
		}
	}
}

/* ANIMATION */

function _animate_begin() {
	for (var thing of world.animate_list)
		_remember_position(thing)
}

function _animate_end(max_duration = 1000) {
	var scale1 = Number(world.mapwrap?.dataset?.scale ?? 1)
	var scale2 = Number(world.panzoom?.dataset?.scale ?? 1)
	var inv_scale = 1 / (scale1 * scale2)
	for (var thing of world.animate_list)
		_animate_position(thing, inv_scale, max_duration)
}

function _remember_position(thing) {
	var e = thing.element
	if (e.offsetParent) {
		var prect = e.offsetParent.getBoundingClientRect()
		var rect = e.getBoundingClientRect()
		e.my_parent = e.offsetParent
		e.my_px = prect.x
		e.my_py = prect.y
		e.my_x = rect.x
		e.my_y = rect.y
		if (thing.is_rotate)
			thing.my_old_angle = thing.my_new_angle
	} else {
		e.my_parent = null
		e.my_px = e.my_py = e.my_x = e.my_y = 0
		if (thing.is_rotate)
			thing.my_old_angle = 0
	}
}

function _animate_position(thing, inv_scale, max_duration) {
	var e = thing.element
	if (e.offsetParent && e.my_parent) {
		var prect = e.offsetParent.getBoundingClientRect()
		var rect = e.getBoundingClientRect()
		var new_parent = e.offsetParent
		var new_px = prect.x
		var new_py = prect.y
		var new_x = rect.x
		var new_y = rect.y
		var dx, dy, da
		var duration = Math.min(thing.my_time, max_duration)
		if (new_parent === e.my_parent) {
			// animate piece relative to parent in case parent is also moving
			dx = (e.my_x - e.my_px) - (new_x - new_px)
			dy = (e.my_y - e.my_py) - (new_y - new_py)
		} else {
			dx = e.my_x - new_x
			dy = e.my_y - new_y
		}
		if (thing.is_rotate) {
			da = thing.my_new_angle - thing.my_old_angle
		} else {
			da = 0
		}
		if (dx !== 0 || dy !== 0 || da !== 0) {
			dx *= inv_scale
			dy *= inv_scale
			if (thing.is_rotate) {
				e.animate(
					[
						{ transform: `translate(${dx}px, ${dy}px) rotate(${thing.my_old_angle}deg)`, },
						{ transform: `translate(0, 0) rotate(${thing.my_new_angle}deg)`, },
					],
					{ duration, easing: "ease" }
				)
			} else {
				e.animate(
					[
						{ transform: `translate(${dx}px, ${dy}px)`, },
						{ transform: `translate(0, 0)`, },
					],
					{ duration, easing: "ease" }
				)
			}
		}
	}
}

/* ENGINE */

function begin_update() {
	G = V = view
	R = roles[player]?.index ?? -1

	// reset unused element cache
	for (var key in world.generic_used) {
		var unused = world.generic_unused[key]
		var used = world.generic_used[key]
		while (used.length > 0)
			unused.push(used.pop())
	}

	_animate_begin()

	_reset_stacks()

	for (var thing of world.parent_list)
		thing.element.replaceChildren()
	for (var thing of world.keyword_list)
		thing.my_dynamic_keywords = []
	for (var thing of world.text_list)
		thing.my_text = thing.my_text_html = null

	world.last_focus = world.focus
}

function end_update() {
	var e, thing

	for (e of document.querySelectorAll(".layout.square"))
		e.style.setProperty("--square", Math.ceil(Math.sqrt(e.childElementCount)))

	/* FIXME: workaround WebKit bug with :has(:empty) selectors */
	for (e of document.querySelectorAll(".panel.autohide"))
		e.hidden = (e.querySelector(".panel-body").children.length === 0)

	_layout_stacks()

	for (thing of world.keyword_list)
		thing.element.setAttribute("class", [ ...thing.my_keywords, ...thing.my_dynamic_keywords ].join(" "))

	for (thing of world.text_list) {
		if (thing.my_text_html !== null)
			thing.element.innerHTML = thing.my_text_html
		else if (thing.my_text !== null)
			thing.element.textContent = thing.my_text
		else
			thing.element.textContent = ""
	}

	for (thing of world.action_list) {
		thing.element.classList.toggle("action", is_action(thing.my_action, thing.my_id))
	}

	for (thing of world.button_list) {
		if (is_action(thing.my_action, thing.my_id)) {
			thing.element.disabled = false
			thing.element.hidden = false
		} else if (is_disabled_button(thing.my_action, thing.my_id)) {
			thing.element.disabled = true
			thing.element.hidden = false
		} else {
			thing.element.disabled = true
			thing.element.hidden = true
		}
	}

	for (thing of world.window_list) {
		if (thing.auto_update && !thing.element.hidden) {
			var text = thing.auto_update()
			if (text instanceof Element)
				thing.body.replaceChildren(text)
			else
				thing.body.innerHTML = text
		}
	}

	_animate_end()
}

/* PANELS */

/* FIXME: workaround WebKit bug with :has(:empty) selectors */
document.querySelectorAll(".panel.autohide").forEach(e => e.hidden = true)

function create_panel(parent, action, id, text) {
	var panel = document.createElement("div")
	var head = document.createElement("div")
	var body = document.createElement("div")
	panel.className = "panel"
	head.className = "panel-head"
	body.className = "panel-body"
	head.textContent = text
	panel.append(head, body)
	$(parent).append(panel)
	return define_panel(panel, action, id)
}

function define_panel(selector, action, id) {
	var panel = $(selector)
	var head = panel.querySelector(".panel-head")
	var body = panel.querySelector(".panel-body")
	var thing = new Thing(panel.querySelector(".panel-body"), action, id)
	thing.my_panel = panel
	thing.my_panel_head = head
	thing.my_panel_body = body
	return thing
}

function update_panel_show(action, id, show) {
	var thing = lookup_thing(action, id)
	assert(thing.my_panel, "not a panel")
	thing.my_panel.hidden = !show
}

function update_panel_text(action, id, text) {
	var thing = lookup_thing(action, id)
	assert(thing.my_panel, "not a panel")
	thing.my_panel_head.textContent = text
	
}

function update_panel_text_html(action, id, text) {
	var thing = lookup_thing(action, id)
	assert(thing.my_panel, "not a panel")
	thing.my_panel_head.innerHTML = text
}

/* OVERLAYS */

function create_overlay(parent, action, id, text) {
	var overlay = document.createElement("details")
	var head = document.createElement("summary")
	var body = document.createElement("div")
	overlay.className = "overlay"
	head.className = "overlay-head"
	body.className = "overlay-body"
	head.textContent = text
	overlay.append(head, body)
	$(parent).append(overlay)
	return define_overlay(overlay, action, id)
}

function define_overlay(selector, action, id) {
	var overlay = $(selector)
	var head = overlay.querySelector("summary")
	var body = overlay.querySelector("div")
	var thing = new Thing(overlay.querySelector(".overlay-body"), action, id)
	thing.my_overlay = overlay
	thing.my_overlay_head = head
	thing.my_overlay_body = body
	thing.my_overlay.hidden = true
	thing.my_overlay.open = true
	return thing
}

function lookup_overlay(action, id) {
	var thing = lookup_thing(action, id)
	assert(thing.my_overlay, "not an overlay")
	return thing.my_overlay
}

function is_overlay_open(action, id) {
	return lookup_overlay(action, id).open
}

function is_overlay_hidden(action, id) {
	return lookup_overlay(action, id).hidden
}

function update_overlay_show(action, id, show = true) {
	var overlay = lookup_overlay(action, id)
	if (show) {
		if (overlay.hidden) {
			overlay.open = true
			overlay.hidden = false
		}
	} else {
		if (!overlay.hidden) {
			overlay.open = true
			overlay.hidden = true
		}
	}
	return show
}

// position overlay to be aligned with gravity on x/y but still fit parent board within margins
function update_overlay_position(action, id, x, y, grav_x=0.5, grav_y=0.5, top=12, right=12, bottom=top, left=right) {
	var overlay = lookup_overlay(action, id)
	if (overlay.my_last_x !== x || overlay.my_last_y !== y) {
		// remember so we don't need to redo every update
		overlay.my_last_x = x
		overlay.my_last_y = y

		// reset position (so we can calculate accurate size)
		overlay.style.top = null
		overlay.style.left = null

		// calculate size
		var w = overlay.clientWidth
		var h = overlay.clientHeight
		var parent_w = overlay.parentElement.clientWidth
		var parent_h = overlay.parentElement.clientHeight

		// gravity alignment
		x = x - w * grav_x
		y = y - h * grav_y

		// clamp to fit on parent
		if (y + h > parent_h - bottom) y = parent_h - h - bottom
		if (x + w > parent_w - right) x = parent_w - w - right
		if (x < left) x = left
		if (y < top) y = top

		overlay.style.top = y + "px"
		overlay.style.left = x + "px"
	}
}

function update_overlay_text(action, id, text) {
	var thing = lookup_thing(action, id)
	assert(thing.my_overlay, "not an overlay")
	thing.my_overlay_head.textContent = text
}

function update_overlay_text_html(action, id, text) {
	var thing = lookup_thing(action, id)
	assert(thing.my_overlay, "not an overlay")
	thing.my_overlay_head.innerHTML = text
}

/* WINDOWS */

function create_window(html_id, title, auto_update, should_resize) {
	var element = document.createElement("div")
	element.id = html_id
	element.className = "window"
	element.hidden = true

	var wind_head = document.createElement("div")
	wind_head.className = "window-head"
	wind_head.innerHTML = title
	element.append(wind_head)
	drag_element_with_mouse(element, wind_head)

	var wind_close = document.createElement("div")
	wind_close.className = "window-close"
	wind_close.textContent = "\u2716"
	wind_close.onclick = function () { element.hidden = true }
	element.append(wind_close)

	var wind_body = document.createElement("div")
	wind_body.className = "window-body"
	element.append(wind_body)

	if (should_resize) {
		var wind_resize = document.createElement("div")
		wind_resize.className = "window-resize"
		element.append(wind_resize)
		resize_element_with_mouse(element, wind_resize)
	}

	document.body.append(element)

	world.window_list.push({
		element,
		head: wind_head,
		body: wind_body,
		auto_update: auto_update,
	})
}

document.body.addEventListener("keydown", function (e) {
	if (e.key === "Escape") {
		for (var wind of world.window_list) {
			if (!wind.element.hidden) {
				e.preventDefault()
				wind.element.hidden = true
			}
		}
	}
})

window.addEventListener("resize", function (e) {
	if (window.innerWidth < 800) {
		for (var wind of world.window_list) {
			wind.element.style.top = null
			wind.element.style.left = null
			wind.element.style.width = null
			wind.element.style.height = null
		}
	}
})

function lookup_window(html_id) {
	for (var wind of world.window_list)
		if (wind.element.id === html_id)
			return wind
	throw new Error(`cannot find window: ${html_id}`)
}

function show_window(html_id) {
	var wind = lookup_window(html_id)

	// close other windows if mobile
	if (window.innerWidth < 800) {
		for (var other of world.window_list)
			if (other !== wind)
				other.element.hidden = true
	}

	// auto-update when window is shown
	if (wind.auto_update && wind.element.hidden) {
		var text = wind.auto_update()
		if (text instanceof Element)
			wind.body.replaceChildren(text)
		else
			wind.body.innerHTML = text
	}

	wind.element.hidden = false
}

function hide_window(html_id) {
	lookup_window(html_id).element.hidden = true
}

function toggle_window(html_id) {
	if (lookup_window(html_id).element.hidden)
		show_window(html_id)
	else
		hide_window(html_id)
}

function update_window_title(html_id, title) {
	lookup_window(html_id).head.innerHTML = title
}

function update_window_content(html_id, body) {
	if (body instanceof Element)
		lookup_window(html_id).body.replaceChildren(body)
	else
		lookup_window(html_id).body.innerHTML = body
}

/* LOG FORMATTING */

function escape_html(text) {
	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/>/g, "&gt;")
	return text
}

function escape_typography(text) {
	text = String(text)
	// TODO: smart quotes
	text = text.replace(/---/g, "\u2014")
	text = text.replace(/--/g, "\u2013")
	text = text.replace(/->/g, "\u2192")
	text = text.replace(/-( ?[\d])/g, "\u2212$1")
	return text
}

const _escape_dice_cache = {}

function escape_dice(text, re = /\b([BW])([0-6])\b/g) {
	if (typeof re === "string")
		re = _escape_dice_cache[re] ??= new RegExp("\\b([" + re + "])([0-6])\\b", "g")
	return text.replace(re, '<span class="dice $1 d$2"></span>')
}

function escape_icon(text, re, icons) {
	return text.replace(re, (m) => icons[m] ?? m)
}

function _tip_focus_class(name) {
	world.tip.setAttribute("class", name)
	world.tip.hidden = false
}

function _tip_blur_class(action, id) {
	world.tip.removeAttribute("class")
	world.tip.hidden = true
}

function _tip_focus_clone(action, id) {
	var thing = lookup_thing(action, id)
	var clone = thing.element.cloneNode(true)
	clone.setAttribute("class", thing.my_keywords.join(" "))
	clone.removeAttribute("style")
	world.tip.replaceChildren(clone)
	world.tip.hidden = false
}

function _tip_blur_clone() {
	world.tip.replaceChildren()
	world.tip.hidden = true
}

function _tip_focus_light(action, id) {
	lookup_thing(action, id).element.classList.add("highlight")
}

function _tip_blur_light(action, id) {
	lookup_thing(action, id).element.classList.remove("highlight")
}

function _tip_click_light(action, id) {
	scroll_into_view(lookup_thing(action, id).element)
}

function escape_tip_light(text, re, log_className, action, names) {
	return text.replace(re, (m,x) => `<span
		class="${log_className}"
		onmouseenter="_tip_focus_light('${action}',${x})"
		onmouseleave="_tip_blur_light('${action}',${x})"
		onmousedown="_tip_click_light('${action}',${x})"
		>${escape_typography(names[x])}</span>`
	)
}

function escape_tip_class(text, re, log_className, tip_classNames, names) {
	return text.replace(re, (m,x) => `<span
		class="${log_className}"
		onmouseenter="_tip_focus_class('${tip_classNames[x]}')"
		onmouseleave="_tip_blur_class()"
		>${escape_typography(names[x])}</span>`
	)
}

function escape_tip_class_sub(text, re, log_className, tip_className, names) {
	return text.replace(re, (m,x) => `<span
		class="${log_className}"
		onmouseenter="_tip_focus_class('${tip_className.replace("$1",x)}')"
		onmouseleave="_tip_blur_class()"
		>${escape_typography(names[x])}</span>`
	)
}

function escape_tip_clone(text, re, log_className, action, names) {
	return text.replace(re, (m,x) => `<span
		class="${log_className}"
		onmouseenter="_tip_focus_clone('${action}',${x})"
		onmouseleave="_tip_blur_clone()"
		>${escape_typography(names[x])}</span>`
	)
}

/* GROUPED BOXES IN LOG */

function update_log_boxes(ix) {
	// forget open/close markers when log is undone
	for (var box of world.log_boxes) {
		if (ix <= box.open)
			box.open = -1
		if (ix <= box.close)
			box.close = -1
	}
	// remove boxes that are popped out of existence
	world.log_boxes = world.log_boxes.filter(box => box.open >= 0)
}

function open_log_box(ix, keyword) {
	world.log_boxes.push({ open: ix, close: -1, keyword })
}

function close_log_box(ix) {
	for (var i = world.log_boxes.length - 1; i >= 0; --i) {
		if (world.log_boxes[i].close < 0) {
			world.log_boxes[i].close = ix
			return
		}
	}
}

function apply_log_boxes(ix, div, common) {
	var result = []
	for (var box of world.log_boxes) {
		// add to class if box is open and not yet closed!
		if (ix >= box.open && (ix < box.close || box.close < 0))
			result.push(box.keyword)
	}
	if (result.length > 0) {
		div.classList.add(common)
		div.classList.add(result.join("-"))
	}
}

/* PREFERENCES (WIP) */

function get_preference(name, fallback) {
	var key = params.title_id + "/" + name
	var value = window.localStorage.getItem(key)
	if (value)
		return JSON.parse(value)
	return fallback
}

function _set_preference(name, value, onchange) {
	var key = params.title_id + "/" + name
	window.localStorage.setItem(key, JSON.stringify(value))
	document.body.dataset[name] = value
	close_toolbar_menus()
	if (typeof onchange === "function")
		onchange(name, value)
	on_update()
}

function toggle_preference_checkbox(name, value) {
	world.prefs[name].checked = !world.prefs[name].checked
	world.prefs[name].dispatchEvent(new Event("change"))
}

function set_preference_checkbox(name, value) {
	world.prefs[name].checked = value
	world.prefs[name].dispatchEvent(new Event("change"))
}

function set_preference_radio(name, value) {
	world.prefs[name][value].checked = true
	world.prefs[name][value].dispatchEvent(new Event("change"))
}

function init_preference_checkbox(name, initial, onchange) {
	var value = get_preference(name, initial)
	var input = document.querySelector(`input[name="${name}"]`)
	world.prefs[name] = input
	input.checked = value
	input.onchange = () => _set_preference(name, input.checked, onchange)
	document.body.dataset[name] = value
}

function init_preference_radio(name, initial, onchange) {
	var value = get_preference(name, initial)
	world.prefs[name] = {}
	document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
		world.prefs[name][input.value] = input
		input.checked = (value === input.value)
		input.onchange = () => _set_preference(name, input.value, onchange)
	})
	document.body.dataset[name] = value
}

/* LIBRARY */

function set_has(set, item) {
	if (set === item)
		return true
	if (!set)
		return false
	var a = 0
	var b = set.length - 1
	while (a <= b) {
		var m = (a + b) >> 1
		var x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return true
	}
	return false
}

function map_get(map, key, missing) {
	if (!map)
		return missing
	var a = 0
	var b = (map.length >> 1) - 1
	while (a <= b) {
		var m = (a + b) >> 1
		var x = map[m << 1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return map[(m << 1) + 1]
	}
	return missing
}

function map_for_each(map, f) {
	for (var i = 0; i < map.length; i += 2)
		f(map[i], map[i+1])
}

function map_set(map, key, value) {
    var a = 0
    var b = (map.length >> 1) - 1
    while (a <= b) {
        var m = (a + b) >> 1
        var x = map[m << 1]
        if (key < x)
            b = m - 1
        else if (key > x)
            a = m + 1
        else {
            map[(m << 1) + 1] = value
            return
        }
    }
    array_insert_pair(map, a << 1, key, value)
}


function set_toggle(set, item) {
    var a = 0
    var b = set.length - 1
    while (a <= b) {
        var m = (a + b) >> 1
        var x = set[m]
        if (item < x)
            b = m - 1
        else if (item > x)
            a = m + 1
        else {
            array_delete(set, m)
            return
        }
    }
    array_insert(set, a, item)
}

function array_insert_pair(array, index, key, value) {
    for (var i = array.length; i > index; i -= 2) {
        array[i] = array[i - 2]
        array[i + 1] = array[i - 1]
    }
    array[index] = key
    array[index + 1] = value
}

function q(obj) {
	console.log(JSON.stringify(obj, 0, 4))
}
