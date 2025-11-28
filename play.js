"use strict"

const P_GERMAN = 0
const P_FRENCH = 1

const Z_GERMAN_RESERVE = 79
const Z_FRENCH_RESERVE = 80

const Z_GERMAN_EN_ROUTE = 81
const Z_GERMAN_TRENCHES = 82
const Z_GERMAN_POOL = 83

const Z_FRENCH_EN_ROUTE = 84
const Z_FRENCH_TRENCHES = 85
const Z_FRENCH_POOL = 86

const first_unit = [ 0, 60 ]
const last_unit = [ 59, 119 ]

const first_zone = 0
const last_zone = 78

function on_focus_card_tip(c) {
	if (data.cards[c].type === "Barrage")
		document.getElementById("tooltip").classList = "card barrage c" + c
	else
		document.getElementById("tooltip").classList = "card c" + c
}

function on_blur_card_tip(c) {
	document.getElementById("tooltip").classList = "hide"
}

function on_click_zone_tip(z) {
	scroll_into_view(lookup_thing("zone", z))
}

function on_focus_zone_tip(z) {
	lookup_thing("zone", z).classList.toggle("tip", true)
}

function on_blur_zone_tip(z) {
	lookup_thing("zone", z).classList.toggle("tip", false)
}

function get_zone_control(z) {
	var w = z >> 5
	var b = z & 31
	return (G.control[w] >> b) & 1
}

function get_unit_zone(u) {
	return G.units[u] & 127
}

function is_unit_exhausted(u) {
	return (G.units[u] & 128) !== 0
}

function is_unit_in_zone(u, z) {
	return (G.units[u] & 127) === z
}

function has_unit(side, z) {
	for (var u = first_unit[side]; u <= last_unit[side]; ++u)
		if (is_unit_in_zone(u, z))
			return true
	return false
}

function has_trench(side, z) {
	var off = side * 20
	for (var i = off; i < off + 20; ++i)
		if (G.trenches[i] === z)
			return true
	return false
}

function vp_layout_y(vp) {
	if (vp < 0) vp = -vp
	if (vp < 1) vp = 0.5
	if (vp > 37) vp = 37 + (37 - vp)
	if (vp == 37) vp = 36.5
	return 38 + (vp - 1) * 38.2
}

function vp_layout_x(vp) {
	if (vp >= 38 || vp <= -1)
		return 23
	if (vp >= 1 && vp <= 36)
		return 107
	return 65
}

function get_us_drm() {
	return 5
}

const M_TURN = 0
const M_AIR = 1
const M_VP = 2
const M_MORALE_G = 3
const M_MORALE_F = 4
const M_ROUND_G = 5
const M_ROUND_F = 6
const M_US_ENTRY = 7
const M_US_DRM = 8

function is_zone_front_line(z) {
	var ctl = get_zone_control(z)
	for (var next of data.edges[z])
		if (get_zone_control(next) !== ctl)
			return true
	return false
}

function needs_control_marker(z) {
	var g = has_unit(P_GERMAN, z)
	var f = has_unit(P_FRENCH, z)
	if (g && f)
		return true
	if (get_zone_control(z) === P_GERMAN)
		return !g
	else
		return !f
}

function on_init() {
	var i

	define_preference_checkbox("volko", false)

	define_board("map", 2894, 1447)

	define_panel("played", 0, "played")
	define_panel("permanent", P_GERMAN, "german_permanent")
	define_panel("permanent", P_FRENCH, "french_permanent")
	define_panel("hand", P_GERMAN, "german_hand")
	define_panel("hand", P_FRENCH, "french_hand")
	define_panel("draw", 0, "draw")

	define_layout_track_v("track-turn", 1, 6, layout.nodes.track_turns, 0)
	define_layout_track_v("track-air", -3, 3, layout.nodes.track_air, 0)
	define_layout_track_v("track-morale-g", 0, 10, layout.nodes.track_morale_g, 0)
	define_layout_track_v("track-morale-f", 10, 0, layout.nodes.track_morale_f, 0)
	define_layout_track_v("track-round-g", 1, 7, layout.nodes.track_rounds_g, 0)
	define_layout_track_v("track-round-f", 7, 1, layout.nodes.track_rounds_f, 0)
	for (i = -15; i <= 50; ++i)
		define_layout("track-vp", i, [ vp_layout_x(i), vp_layout_y(i), 44, 34 ])

	define_layout("track-us", 0, layout.nodes.us_track_1)
	define_layout("track-us", 1, layout.nodes.us_track_2)

	define_marker("marker", M_US_ENTRY, [ "us", "border" ])
	define_marker("marker", M_US_DRM, [ "us", "border" ])
	define_marker("marker", M_TURN, [ "turn", "border" ])
	define_marker("marker", M_AIR, "cylinder")
	define_marker("marker", M_VP, "cylinder")
	define_marker("marker", M_ROUND_G, "cylinder german")
	define_marker("marker", M_ROUND_F, "cylinder french")

	define_marker("morale", P_GERMAN, "cylinder german")
	define_marker("morale", P_FRENCH, "cylinder french")

	for (i = 0; i <= 78; ++i) {
		var [ x1, y1, w, h ] = layout.nodes["zone_" + i]
		var x = x1 + w/2 - (20*3 + 6*2) / 2 + 15
		var y = y1 + h/2 - 5

		define_layout("zone-markers", i, [ x - 35 - 26, y - 26, 52, 52 ], "stack offset:15")
		define_layout("zone-units-g", i,  [ x, y - 20 - 8, 6*20+5*8, 20 ], "grav-sw")
		define_layout("zone-trench", i,   [ x, y, 100, 10 ], "grav-w")
		define_layout("zone-units-f", i,  [ x, y + 10 + 8, 6*20+5*8, 20 ], "grav-nw")

		define_html("zone", i, "zone_" + i)

		register_tooltip("zone", i, data.zone_full_name[i])
	}

	define_space("zone", Z_GERMAN_RESERVE, layout.nodes.g_reserve)
	define_space("zone", Z_FRENCH_RESERVE, layout.nodes.f_reserve)
	define_space("zone", Z_GERMAN_TRENCHES, layout.nodes.g_trenches)
	define_space("zone", Z_FRENCH_TRENCHES, layout.nodes.f_trenches)
	define_space("zone", Z_GERMAN_EN_ROUTE, layout.nodes.g_en_route)
	define_space("zone", Z_GERMAN_POOL, layout.nodes.g_pool)
	define_space("zone", Z_FRENCH_EN_ROUTE, layout.nodes.f_en_route)
	define_space("zone", Z_FRENCH_POOL, layout.nodes.f_pool)

	define_layout("zone-units-g", Z_GERMAN_RESERVE, layout.nodes.g_reserve)
	define_layout("zone-units-f", Z_FRENCH_RESERVE, layout.nodes.f_reserve)

	define_layout("zone-trench", Z_GERMAN_TRENCHES, layout.nodes.g_trenches, "trench-pool grow-s")
	define_layout("zone-trench", Z_FRENCH_TRENCHES, layout.nodes.f_trenches, "trench-pool grow-n")

	define_layout("zone-units-g", Z_GERMAN_EN_ROUTE, layout.nodes.g_en_route)
	define_layout("zone-units-g", Z_GERMAN_POOL, layout.nodes.g_pool, "unit-pool graw-w grow-s")

	define_layout("zone-units-f", Z_FRENCH_EN_ROUTE, layout.nodes.f_en_route)
	define_layout("zone-units-f", Z_FRENCH_POOL, layout.nodes.f_pool, "unit-pool grav-w grow-n")

	for (i = 0; i < 20; ++i)
		define_piece("trench", i, "german")
	for (i = 20; i < 40; ++i)
		define_piece("trench", i, "french")

	for (i = 0; i < 60; ++i)
		define_piece("unit", i, "german")
	for (i = 60; i < 120; ++i)
		define_piece("unit", i, "french")

	for (i = 1; i <= 100; ++i) {
		if ((i >= 1 && i <= 22) || (i >= 52 && i <= 68))
			define_card("card", i, [ "c" + i, "barrage" ])
		else
			define_card("card", i, [ "c" + i ])
		if (data.cards[i].text)
			register_tooltip("card", i, data.cards[i].name + " \u2013 " + data.cards[i].text)
		else
			register_tooltip("card", i, data.cards[i].name)
	}
}

function update_hand(side, hand) {
	var c
	if (typeof hand === "number") {
		for (c = 0; c < hand; ++c)
			populate_generic("hand", side, side === P_GERMAN ? "card back german" : "card back french")
	} else {
		for (c of hand)
			if (data.cards[c].type !== "Barrage")
				populate("hand", side, "card", c)
		for (c of hand)
			if (data.cards[c].type === "Barrage")
				populate("hand", side, "card", c)
	}
}

function on_update() {
	var z, u

	begin_update()

	var volko = get_preference("volko", false)

	populate("track-turn", G.turn, "marker", M_TURN)
	populate("track-air", G.air, "marker", M_AIR)
	populate("track-vp", Math.max(-15, Math.min(50, G.vp)), "marker", M_VP)

	populate("track-morale-g", G.morale[P_GERMAN], "morale", P_GERMAN)
	populate("track-morale-f", G.morale[P_FRENCH], "morale", P_FRENCH)

	if (G.round >= 2)
		populate("track-round-g", (G.round) >> 1, "marker", M_ROUND_G)
	if (G.round >= 3)
		populate("track-round-f", (G.round-1) >> 1, "marker", M_ROUND_F)

	populate("track-us", 0, "marker", M_US_ENTRY)
	populate("track-us", 1, "marker", M_US_DRM)

	update_keywords("marker", M_TURN, [ (G.month & 1) ? "month1" : "month2" ])
	update_keywords("marker", M_US_ENTRY, "us_" + G.us_entry)
	update_keywords("marker", M_US_DRM, "us_drm_" + G.us_drm)

	for (z = 0; z <= 78; ++z) {
		toggle_keyword("zone", z, "select", V.where === z)
		if (is_zone_front_line(z) && needs_control_marker(z)) {
			if (get_zone_control(z) === P_GERMAN)
				populate_generic("zone-markers", z, "zone-marker german control")
			else
				populate_generic("zone-markers", z, "zone-marker french control")
		}

		var level = map_get(V.oos[P_GERMAN], z, 0) + map_get(V.oos[P_FRENCH], z, 0)
		if (level === 1)
			populate_generic("zone-markers", z, "zone-marker supply1")
		if (level === 2)
			populate_generic("zone-markers", z, "zone-marker supply2")
	}

	for (var z of V.vps[P_FRENCH])
		populate_generic("zone-markers", z, "zone-marker french vp")
	for (var z of V.vps[P_GERMAN])
		populate_generic("zone-markers", z, "zone-marker german vp")

	toggle_keyword("zone", Z_GERMAN_RESERVE, "select", V.where === Z_GERMAN_RESERVE)
	toggle_keyword("zone", Z_FRENCH_RESERVE, "select", V.where === Z_FRENCH_RESERVE)

	for (z = 0; z <= 78; ++z) {
		toggle_keyword("zone", z, "select", V.where === z)
	}

	if (V.barrage) {
		if (V.barrage.length >= 1 && V.barrage[0] >= 0)
			populate_generic("zone-markers", V.barrage[0], "marker barrage")
		if (V.barrage.length >= 2 && V.barrage[1] >= 0)
			populate_generic("zone-markers", V.barrage[1], "marker barrage")
	}

	for (u = 0; u < 40; ++u) {
		z = G.trenches[u]
		populate("zone-trench", z, "trench", u)
	}

	if (volko) {
		for (u = first_unit[P_GERMAN]; u <= last_unit[P_GERMAN]; ++u)
			if (is_unit_exhausted(u) && get_unit_zone(u) <= 78)
				populate("zone-units-g", get_unit_zone(u), "unit", u)
		for (u = first_unit[P_FRENCH]; u <= last_unit[P_FRENCH]; ++u)
			if (!is_unit_exhausted(u) && get_unit_zone(u) <= 78)
				populate("zone-units-f", get_unit_zone(u), "unit", u)

		for (z = 0; z <= 78; ++z) {
			populate_generic("zone-units-g", z, "break")
			populate_generic("zone-units-f", z, "break")
		}

		for (u = first_unit[P_GERMAN]; u <= last_unit[P_GERMAN]; ++u)
			if (!is_unit_exhausted(u) && get_unit_zone(u) <= 78)
				populate("zone-units-g", get_unit_zone(u), "unit", u)
		for (u = first_unit[P_FRENCH]; u <= last_unit[P_FRENCH]; ++u)
			if (is_unit_exhausted(u) && get_unit_zone(u) <= 78)
				populate("zone-units-f", get_unit_zone(u), "unit", u)

		for (u = 0; u < 120; ++u) {
			z = get_unit_zone(u)
			if (z > 78) {
				if (u < 60)
					populate("zone-units-g", z, "unit", u)
				else
					populate("zone-units-f", z, "unit", u)
				toggle_keyword("unit", u, "volko", false)
			} else {
				toggle_keyword("unit", u, "volko", !is_unit_exhausted(u))
			}
			toggle_keyword("unit", u, "exhausted", is_unit_exhausted(u))
			toggle_keyword("unit", u, "select", V.who === u)
		}
	} else {
		for (u = 0; u < 120; ++u) {
			z = get_unit_zone(u)
			if (u < 60)
				populate("zone-units-g", z, "unit", u)
			else
				populate("zone-units-f", z, "unit", u)
			toggle_keyword("unit", u, "exhausted", is_unit_exhausted(u))
			toggle_keyword("unit", u, "select", V.who === u)
			toggle_keyword("unit", u, "volko", false)
		}
	}

	populate_with_list("played", 0, "card", G.played)

	populate_with_list("permanent", P_FRENCH, "card", G.permanent.filter(c => c <= 51))
	populate_with_list("permanent", P_GERMAN, "card", G.permanent.filter(c => c >= 52))

	update_hand(P_GERMAN, V.hand[P_GERMAN])
	update_hand(P_FRENCH, V.hand[P_FRENCH])

	if (V.draw)
		populate_with_list("draw", 0, "card", V.draw)

	// maximum number of rerolls is double barrage with stockpile (10+8+4)
	for (var i = 0; i <= 22; ++i)
		action_button_with_argument("number", i, i)

	action_button("build_trench", "Trench")
	action_button("reinforcements", "Reinforcements")
	action_button("refresh", "Refresh")
	action_button("strategic", "Strategic")
	action_button("tactical", "Tactical")

	action_button("two_zone_barrage", "Two Zone")
	action_button("double_barrage", "Double!")
	action_button("simple_barrage", "Simple")

	action_button("assault", "Assault")

	action_button("roll", "Roll")
	action_button("keep", "Keep")
	action_button("reroll", "Re-roll")
	action_button("double", "Double")
	action_button("rotate", "Special")
	action_button("stop", "Stop")
	action_button("skip", "Skip")

	action_button("discard", "Discard &amp; Draw")
	action_button("barrage", "Barrage")
	action_button("event", "Event")
	action_button("ap", "Action Points")

	action_button("end_round", "End Round")

	action_button("pass", "Pass")
	action_button("next", "Next")
	action_button("done", "Done")
	action_button("undo", "Undo")

	end_update()
}

const ICONS = {
	B0: '<span class="die black d0"></span>',
	B1: '<span class="die black d1"></span>',
	B2: '<span class="die black d2"></span>',
	B3: '<span class="die black d3"></span>',
	B4: '<span class="die black d4"></span>',
	B5: '<span class="die black d5"></span>',
	B6: '<span class="die black d6"></span>',
	W0: '<span class="die white d0"></span>',
	W1: '<span class="die white d1"></span>',
	W2: '<span class="die white d2"></span>',
	W3: '<span class="die white d3"></span>',
	W4: '<span class="die white d4"></span>',
	W5: '<span class="die white d5"></span>',
	W6: '<span class="die white d6"></span>',
	R0: '<span class="die red d0"></span>',
	R1: '<span class="die red d1"></span>',
	R2: '<span class="die red d2"></span>',
	R3: '<span class="die red d3"></span>',
	R4: '<span class="die red d4"></span>',
	R5: '<span class="die red d5"></span>',
	R6: '<span class="die red d6"></span>',
}

function sub_card(match, p1) {
	var c = p1 | 0
	var cn = (c <= 51) ? "card-tip french" : "card-tip german"
	return `<span class="${cn}" onmouseenter="on_focus_card_tip(${c})" onmouseleave="on_blur_card_tip()">${data.cards[c].name}</span>`
}

function sub_zone(match, p1) {
	var z = p1 | 0
	var name = data.zone_name[z]
	return `<span class="zone-tip" onclick="on_click_zone_tip(${z})" onmouseenter="on_focus_zone_tip(${z})" onmouseleave="on_blur_zone_tip(${z})">${name}</span>`
}

function escape_text(text) {
	text = String(text)
	text = text.replace(/---/g, "\u2014")
	text = text.replace(/--/g, "\u2013")
	text = text.replace(/->/g, "\u2192")
	text = text.replace(/-( ?[\d])/g, "\u2212$1")
	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/>/g, "&gt;")
	text = text.replace(/\[/g, "<")
	text = text.replace(/\]/g, ">")
	text = text.replace(/([ +-]1) action points/g, "$1 action point")
	text = text.replace(/([ +-]1) trenches/g, "$1 trench")
	text = text.replace(/([ +-]1) units/g, "$1 unit")
	text = text.replace(/([ +-]1) hits/g, "$1 hit")
	text = text.replace(/[BRW]\d/g, (m) => ICONS[m] ?? m)
	text = text.replace(/C(\d+)/g, sub_card)
	text = text.replace(/Z(\d+)/g, sub_zone)
	return text
}

function on_prompt(text) {
	return escape_text(text)
}

function on_log(text) {
	var p = document.createElement("div")

	switch (text[0]) {
	case "%":
		var m = text.substring(2)
		p.classList.add(text[1] === "F" ? "fm" : "gm")
		if (Number(m) < 4)
			p.classList.add("dark")
		text = m
		break
	case "Q":
		p.className = "q"
		text = data.cards[parseInt(text.substring(1))].text
		break
	case ">":
		p.className = "i"
		text = text.substring(1)
		break
	case "#":
		p.className = "h1"
		text = text.substring(1)
		break
	case "=":
		var round = Number(text.substring(1))
		if (round & 1) {
			p.className = "h2 french"
			text = "French Round " + (round>>1)
		} else {
			p.className = "h2 german"
			text = "German Round " + (round>>1)
		}
		break
	}

	p.innerHTML = escape_text(text)

	return p
}
