"use strict"

/*
	We build a set of custom elements and keep a registry of "things":

		- board (primarily the map, and any extra boards like battle boards etc)
		- space -- a fixed location on a board that you can interact with
		- layout -- a location on a board that contains other things
		- piece -- a piece that you can interact with, positioned in a layout
		- marker -- a piece that you cannot interact with, positioned in a layout
		- static marker -- a piece that you cannot interact with, position directly on a board

	In on_init you should define all the boards, spaces, layouts, pieces and markers you will use.
	In on_update you should update all the positions and populate the layouts with the necessary pieces.

	Each time on_update is called, we recreate the entire layout from scratch to guarantee that we
	never show stale data in case we forget to update something.

	// TODO: my_rotate + block rotation
	// TODO: common keyword set for layouts (grid, flex, flood-fill)
	// TODO: overlay (battle boxes)
*/

var G, V, R // convenience aliases

const world = {
	things: {},
	favicon: document.querySelector("link[rel='icon']"),
	header: document.querySelector("header"),
	status: document.getElementById("status"),
	mapwrap: document.getElementById("mapwrap"),
	panzoom: document.getElementById("pan_zoom_main"),
	parent_list: [],
	action_list: [],
	animate_list: [],
	parent: document.getElementById("map"),
}

function get_preference(name, fallback) {
	var key = params.title_id + "/" + name
	var value = window.localStorage.getItem(key)
	if (value)
		return JSON.parse(value)
	return fallback
}

function set_preference(name, value) {
	var key = params.title_id + "/" + name
	window.localStorage.setItem(key, JSON.stringify(value))
	return value
}

function define_preference_checkbox(name, initial) {
	var input = document.getElementById(name)
	var value = get_preference(name, initial)
	input.checked = value
	input.onchange = function () {
		_update_preference_checkbox(name)
		close_toolbar_menus()
		on_update()
	}
	document.body.classList.toggle(name, value)
}

function _update_preference_checkbox(name) {
	var input = document.getElementById(name)
	var value = input.checked
	set_preference(name, value)
	document.body.classList.toggle(name, value)
}

function define_preference_radio(name, initial) {
	var value = get_preference(name, initial)
	for (var input of document.querySelectorAll(`input[name="${name}"]`)) {
		if (value === input.value) {
			input.checked = true
			document.body.dataset[name] = value
		} else {
			input.checked = false
		}
		input.onchange = function () {
			_update_preference_radio(name)
			close_toolbar_menus()
			on_update()
		}
	}
}

function _update_preference_radio(name) {
	for (var input of document.querySelectorAll(`input[name="${name}"]`)) {
		if (input.checked) {
			set_preference(name, input.value)
			document.body.dataset[name] = input.value
		}
	}
}

function toggle_pieces() {
	document.body.classList.toggle("hide-pieces")
}

function toggle_markers_and_pieces() {
	// cycle between showing everything, only pieces, and nothing.
	let hidden_pieces = document.body.classList.contains("hide-pieces")
	let hidden_markers = document.body.classList.contains("hide-markers")
	if (hidden_pieces && hidden_markers) {
		document.body.classList.remove("hide-pieces")
		document.body.classList.remove("hide-markers")
	} else if (hidden_pieces) {
		document.body.classList.add("hide-markers")
	} else {
		document.body.classList.add("hide-pieces")
	}
}

function set_favicon(url) {
	world.favicon.href = url
}

function is_action(action, id) {
	if (view.actions) {
		if (id === undefined)
			return view.actions[action] === 1
		if (view.actions[action] === undefined)
			return false
		if (!Array.isArray(view.actions[action]))
			throw new Error("action is not a list: " + action)
		return view.actions[action].includes(id)
	}
	return false
}

function on_click_action(evt) {
	if (evt.button === 0)
		if (send_action(evt.target.my_action, evt.target.my_id))
			evt.stopPropagation()
}

function register_thing(action, id, e) {
	if (!world.things[action])
		world.things[action] = {}
	world.things[action][id] = e
	e.my_action = action
	e.my_id = id
	return e
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

function register_action(action, id, e) {
	e.onmousedown = on_click_action
	world.action_list.push(e)
}

function register_tooltip(action, id, tip) {
	var e = lookup_thing(action, id)
	e.onmouseenter = function () {
		if (typeof tip === "function")
			world.status.textContent = tip(id)
		else
			world.status.textContent = tip
	}
	e.onmouseleave = function () {
		world.status.textContent = ""
	}
}

function _add_keywords(e, keywords) {
	if (keywords) {
		if (typeof keywords === "string")
			keywords = keywords.trim().split(" ")
		for (var word of keywords)
			e.classList.add(word)
	}
}

function _define_element(e, tag, action, id, keywords) {
	if (tag)
		e.classList.add(tag)
	e.classList.add(action)
	_add_keywords(e, keywords)
	e.my_className = e.className
	e.my_action = action
	e.my_id = id
	register_thing(action, id, e)
	return e
}

function _create_element(tag, action, id, keywords) {
	return _define_element(document.createElement("div"), tag, action, id, keywords)
}

function _find_element(tag, action, id, selector, keywords) {
	return _define_element(document.getElementById(selector), tag, action, id, keywords)
}

function _apply_layout(e, layout) {
	if (Array.isArray(layout))
		var [ x, y, w, h ] = layout
	else
		var { x, y, w, h } = layout

	e.my_x = x = Math.round(x)
	e.my_y = y = Math.round(y)
	e.my_w = w = Math.round(w ?? 0)
	e.my_h = h = Math.round(h ?? 0)

	var r = world.parent_w - (x + w)
	var b = world.parent_h - (y + h)

	var grow_n = e.classList.contains("grow-n")
	var grow_e = e.classList.contains("grow-e")
	var grow_s = e.classList.contains("grow-s")
	var grow_w = e.classList.contains("grow-w")

	if (!grow_n) e.style.top = Math.round(y) + "px"
	if (!grow_s) e.style.bottom = Math.round(b) + "px"
	if (!grow_e) e.style.right = Math.round(r) + "px"
	if (!grow_w) e.style.left = Math.round(x) + "px"

	if (grow_w || grow_e) {
		e.classList.add("grow-h")
		e.my_className = e.className
	}

	e.style.minHeight = Math.round(h) + "px"
	e.style.minWidth = Math.round(w) + "px"
}

function _apply_styles(e, styles) {
	if (styles) {
		for (var key in styles)
			e.style.setProperty(key, styles[key])
	}
}

function _init_parent(tag) {
	var parent = world.parent.querySelector("." + tag)
	if (!parent) {
		parent = document.createElement("div")
		parent.className = tag
		world.parent.appendChild(parent)
	}
	return parent
}

function _append_element(tag, e) {
	_init_parent(tag).appendChild(e)
}

function define_board(selector, w, h) {
	world.parent = document.getElementById(selector)
	if (!w || !h) {
		var rect = world.parent.getBoundingClientRect()
		w = rect.width
		h = rect.height
	}
	world.parent_w = w
	world.parent_h = h
	_init_parent("space-parent")
	_init_parent("decor-parent")
	_init_parent("layout-parent")
}

function define_panel(action, id, selector) {
	var panel = document.getElementById(selector)
	var head = panel.querySelector(".panel-head")
	var body = panel.querySelector(".panel-body")
	body.my_panel = panel
	body.my_head = head
	register_thing(action, id, body)
	world.parent_list.push(body)
	return body
}

function define_layout(action, id, layout, keywords, styles) {
	var e = _create_element("layout", action, id, keywords)
	world.parent_list.push(e)
	_append_element("layout-parent", e)
	_apply_layout(e, layout)
	_apply_styles(e, styles)
	return e
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

function define_html(action, id, selector, keywords) {
	var e = _find_element(null, action, id, selector, keywords)
	register_action(action, id, e)
	return e
}

function define_html_parent(action, id, selector, keywords) {
	var e = _find_element(null, action, id, selector, keywords)
	world.parent_list.push(e)
	return e
}

function define_space(action, id, layout, keywords) {
	var e = _create_element("space", action, id, keywords)
	register_action(action, id, e)
	_append_element("space-parent", e)
	_apply_layout(e, layout)
	return e
}

function define_card(action, id, keywords) {
	var e = _create_element("card", action, id, keywords)
	register_action(action, id, e)
	world.parent_list.push(e)
	// world.animate_list.push(e)
	return e
}

function define_piece(action, id, keywords) {
	var e = _create_element("piece", action, id, keywords)
	register_action(action, id, e)
	world.parent_list.push(e)
	world.animate_list.push(e)
	return e
}

function define_marker(action, id, keywords) {
	var e = _create_element("marker", action, id, keywords)
	register_action(action, id, e)
	world.animate_list.push(e)
	return e
}

function define_decor(action, id, [x, y, w, h], keywords) {
	if (typeof keywords === "string")
		keywords = keywords.split(" ")
	if (typeof keywords === "undefined")
		keywords = []
	var e = _create_element("decor", action, id, keywords)
	e.classList.add("hide")
	e.style.left = Math.round(x + (w|0)/2) + "px"
	e.style.top = Math.round(y + (h|0)/2) + "px"
	_append_element("decor-parent", e)
	return e
}

function show_decor(action, id, visible) {
	lookup_thing(action, id).classList.toggle("hide", !visible)
}

function define_card_list(action, a, b, keywords_with_prefix) {
	for (var i = a; i <= b; ++i)
		define_card(action, i, keywords_with_prefix + i)
}

function define_piece_list(action, a, b, keywords) {
	for (var i = a; i <= b; ++i)
		define_piece(action, i, keywords)
}

function define_marker_list(action, a, b, keywords) {
	for (var i = a; i <= b; ++i)
		define_marker(action, i, keywords)
}

function populate_with_list(parent_action, parent_id, child_action, child_id_list) {
	var parent = lookup_thing(parent_action, parent_id)
	for (var child_id of child_id_list)
		parent.appendChild(lookup_thing(child_action, child_id))
}

function populate(parent_action, parent_id, child_action, child_id) {
	var parent = lookup_thing(parent_action, parent_id)
	var child = lookup_thing(child_action, child_id)
	parent.appendChild(child)
}

function populate_generic(parent_action, parent_id, keywords, n=1) {
	var parent = lookup_thing(parent_action, parent_id)
	while (n-- > 0) {
		// TODO: use generic marker cache ?
		var child = document.createElement("div")
		child.className = keywords
		parent.appendChild(child)
	}
}

function update_position(action, id, x, y) {
	var e = lookup_thing(action, id)
	e.style.left = Math.round(x) + "px"
	e.style.top = Math.round(y) + "px"
}

function update_transform(action, id, transform) {
	var e = lookup_thing(action, id)
	e.style.transform = transform
}

function update_keywords(action, id, keywords) {
	var e = lookup_thing(action, id)
	if (e instanceof SVGElement)
		throw new Error("cannot update keywords on SVG elements")
	e.className = e.my_className
	_add_keywords(e, keywords)
}

function toggle_keyword(action, id, keyword, on) {
	var e = lookup_thing(action, id)
	e.classList.toggle(keyword, !!on)
}

function update_text(action, id, text) {
	var e = lookup_thing(action, id)
	if (e.my_head)
		e.my_head.textContent = text
	else
		e.textContent = text
}

function update_html(action, id, text) {
	var e = lookup_thing(action, id)
	if (e.my_head)
		e.my_head.innerHTML = text
	else
		e.innerHTML = text
}

function _remember_position(e) {
	if (e.offsetParent) {
		let prect = e.offsetParent.getBoundingClientRect()
		e.my_parent = e.offsetParent
		e.my_px = prect.x
		e.my_py = prect.y
		e.my_x = prect.x + e.offsetLeft
		e.my_y = prect.y + e.offsetTop
	} else {
		e.my_parent = null
		e.my_px = e.my_py = e.my_x = e.my_y = 0
	}
}

function _animate_position(e, inv_scale) {
	if (e.offsetParent && e.my_parent) {
		let prect = e.offsetParent.getBoundingClientRect()
		let new_x = prect.x + e.offsetLeft
		let new_y = prect.y + e.offsetTop
		let dx, dy
		// TODO: fix dx,dy calculation with nested transform
		if (e.offsetParent === e.my_parent) {
			// animate pieces on pieces
			dx = (e.my_x - e.my_px) - (new_x - prect.x)
			dy = (e.my_y - e.my_py) - (new_y - prect.y)
		} else {
			dx = e.my_x - new_x
			dy = e.my_y - new_y
		}
		if (dx !== 0 || dy !== 0) {
			dx *= inv_scale
			dy *= inv_scale
			let dist = Math.hypot(dx, dy)
			let time = Math.max(500, Math.min(1000, dist / 2))
			e.animate(
				[
					{ transform: `translate(${dx}px, ${dy}px)`, },
					{ transform: "translate(0, 0)", },
				],
				{ duration: time, easing: "ease" }
			)
		}
	}
}

function _sort_z(parent) {
	var list = Array.from(parent.childNodes)
	list.sort((a,b) => {
		var ra = a.getBoundingClientRect()
		var rb = b.getBoundingClientRect()
		var za = ra.top * 2 + ra.left
		var zb = rb.top * 2 + rb.left
		return za - zb
	})
	parent.replaceChildren()
	for (var e of list)
		parent.appendChild(e)
}

function sort_layout() {
	_sort_z(document.querySelector(".layout-parent"))
}

function begin_update() {
	G = V = view
	R = player
	for (var e of world.animate_list)
		_remember_position(e)
	for (var parent of world.parent_list)
		parent.replaceChildren()
}

function end_update() {
	for (var item of world.action_list)
		item.classList.toggle("action", is_action(item.my_action, item.my_id))

	for (var e of document.querySelectorAll(".layout.square"))
		e.style.setProperty("--square", Math.ceil(Math.sqrt(e.childElementCount)))

	var scale1 = Number(world.mapwrap?.dataset?.scale ?? 1)
	var scale2 = Number(world.panzoom?.dataset?.scale ?? 1)
	var inv_scale = 1 / (scale1 * scale2)
	for (var e of world.animate_list)
		_animate_position(e, inv_scale)
}

function set_has(set, item) {
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
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m << 1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return map[(m << 1) + 1]
	}
	return missing
}
