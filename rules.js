"use strict"

/*
mask if event cards in hand?
	[ ] raynal
	[ ] unknown heroes
	[ ] jellicoe (not important)
*/

var G, L, R, V, P = {}

const ROLES = [ "German", "French" ]

const SCENARIOS = [
	"1 - Operation Gericht",
	"2 - French counter-offensive",
	"3 - Campaign",
]

exports.default_scenario = "3 - Campaign"

const P_GERMAN = 0
const P_FRENCH = 1

const { cards, edges } = require("./data.js")

/* DATA */

/* non-map zones */

const OPT_NO_DICE = 1
const OPT_GERMAN_CARDS = 2
const OPT_FRENCH_CARDS = 4

const Z_GERMAN_RESERVE = 79
const Z_FRENCH_RESERVE = 80

const Z_GERMAN_EN_ROUTE = 81
const Z_GERMAN_TRENCHES = 82
const Z_GERMAN_POOL = 83

const Z_FRENCH_EN_ROUTE = 84
const Z_FRENCH_TRENCHES = 85
const Z_FRENCH_POOL = 86

const Z_RESERVE = [ Z_GERMAN_RESERVE, Z_FRENCH_RESERVE ]
const Z_EN_ROUTE = [ Z_GERMAN_EN_ROUTE, Z_FRENCH_EN_ROUTE ]
const Z_TRENCHES = [ Z_GERMAN_TRENCHES, Z_FRENCH_TRENCHES ]
const Z_POOL = [ Z_GERMAN_POOL, Z_FRENCH_POOL ]

const all_hill_zones = [ 14, 16, 17, 18, 23, 24, 25, 26, 29, 30, 31, 32, 33, 35, 37, 38, 42, 43, 46, 51, 53, 77 ]
const all_fortress_zones = [ 38, 45, 46, 48, 56, 57, 59, 61, 62, 68, 69, 70, 71, 72, 74, 76, 77 ]
const map_german_vp = [ 38, 1, 59, 1, 61, 1, 65, 1, 66, 1, 68, 1, 70, 1, 72, 1, 74, 1 ]
const map_french_vp = [ 0, 2, 1, 2, 2, 2, 3, 2, 4, 2, 5, 2, 6, 2, 7, 2, 38, 3 ]
const all_one_star = [ 68, 70, 72, 74 ]
const all_two_star = [ 71 ]

const first_unit = [ 0, 60 ]
const last_unit = [ 59, 119 ]

const first_zone = 0
const last_zone = 78
const last_zone_and_reserve = 80

const FE_AIR_SUPPORT_1 = 23
const FE_AIR_SUPPORT_2 = 24
const FE_OFFENSIVE_IN_ITALY = 30
const FE_PETAIN = 31
const FE_CASTELNAU = 32
const FE_RAYNAL = 33
const FE_LA_NORIA = 35
const FE_DRIANT = 36
const FE_MANGIN = 40
const FE_HOSPITALS = 41
const FE_JOFFRE = 42
const FE_NIVELLE = 43
const FE_HEAVY_ARTILLERY = 44
const FE_HAIG = 45
const FE_JELLICOE = 46
const FE_COORDINATED_TACTICS = 47
const FE_UNKNOWN_HEROES = 51

const GE_BARRAGE_6 = 59
const GE_KRONPRINZ = 71
const GE_FALKENHAYNS_LAST_PUSH = 72
const GE_LUNAR_LANDSCAPE = 73
const GE_DISARMED_FORTRESS = 74
const GE_AIR_SUPPORT_1 = 75
const GE_AIR_SUPPORT_2 = 76
const GE_CHAOS_IN_THE_REAR = 83
const GE_SUBMARINE_WARFARE = 84
const GE_TOTAL_SUBMARINE_WARFARE = 85
const GE_REINFORCEMENTS_TO_RUSSIA = 86
const GE_REINFORCEMENTS_FROM_RUSSIA = 87
const GE_FLAMETHROWERS = 88
const GE_KAISERS_ORDER = 90
const GE_OFFENSIVE_STOCKPILE = 91
const GE_THE_RED_BARON = 99
const GE_BAD_WEATHER = 100

const french_air_superiority_cards = [ FE_AIR_SUPPORT_1, FE_AIR_SUPPORT_2 ]

const all_river_adjacent = [
	2, 3,
	3, 12,
	13, 22,
	13, 23,
	23, 24,
	23, 35,
	34, 35,
	35, 44,
	35, 45,
	36, 45,
	45, 46,
	46, 58,
	58, 59,
	59, 71,
	61, 71,
	71, 73,
	72, 73
]

const month_names = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
]

function is_across_meuse(from, to) {
	for (var i = 0; i <= all_river_adjacent.length; i += 2) {
		if (all_river_adjacent[i] === from && all_river_adjacent[i+1] === to)
			return true
		if (all_river_adjacent[i] === to && all_river_adjacent[i+1] === from)
			return true
	}
	return false
}

function is_zone_adjacent_to_zone(a, b) {
	return set_has(edges[a], b)
}

function get_unit_owner(u) {
	return u <= 59 ? P_GERMAN : P_FRENCH
}

function is_friendly_unit(u) {
	return get_unit_owner(u) === G.active
}

function is_card_barrage(c) {
	return cards[c].type === "Barrage"
}

function is_card_permanent(c) {
	return cards[c].type === "Permanent"
}

function is_card_one_time(c) {
	return cards[c].type === "One-time"
}

/* CARDS & DECKS */

function is_event_played(c) {
	return set_has(G.permanent, c)
}

function discard_permanent(c) {
	log("Discarded C" + c)
	set_delete(G.permanent, c)
}

function is_card_in_hand(side, c) {
	return G.hand[side].includes(c)
}

function play_hand(side, c) {
	log("Played C" + c)
	array_delete_item(G.hand[side], c)
	G.played.push(c)
}

function discard_hand(side, c) {
	log("Discarded C" + c)
	array_delete_item(G.hand[side], c)
}

function remove_hand(side, c) {
	discard_hand(side, c)
	set_add(G.removed, c)
}

function is_card_active_this_turn(c) {
	if ((c === GE_THE_RED_BARON || c === GE_BAD_WEATHER) && !(G.options & OPT_GERMAN_CARDS))
		return false
	if ((c === FE_UNKNOWN_HEROES) && !(G.options & OPT_FRENCH_CARDS))
		return false
	return (G.turn >= cards[c].turn1 && G.turn <= cards[c].turn2)
}

function is_card_active_next_month(c) {
	var turn = (G.month === 1) ? G.turn : G.turn + 1
	return (turn >= cards[c].turn1 && turn <= cards[c].turn2)
}

function keep_card_this_turn(c) {
	return (G.turn <= cards[c].turn2)
}

function filter_cards_for_this_turn() {
	for (var i = 0; i < 2; ++i) {
		G.hand[i] = G.hand[i].filter(keep_card_this_turn)
		G.draw[i] = G.draw[i].filter(keep_card_this_turn)
	}
	// TODO: log discarded permanent events
	G.permanent = G.permanent.filter(keep_card_this_turn)
}

/* UNITS & ZONES */

function can_place_trench_in_controlled(z) {
	return is_controlled_zone(z) && !has_trench(G.active, z)
}

function can_place_trench_in_any_controlled() {
	for (var z = 0; z <= last_zone; ++z)
		if (can_place_trench_in_controlled(z))
			return true
	return false
}

function can_build_trench_in_zone(side, z, contested_okay) {
/*
	NOTE:
	Since control only changes at end of an action round,
	there are cases not covered by the rules text.
	I've made the following interpretation:

	- friendly controlled & uncontested: 1/2 AP
	- friendly controlled & contested: 1 AP
	- enemy controlled & contested (friendly and enemy units): 1 AP
	- enemy controlled & uncontested (friendly units): 1/2 AP (case not covered in rules)
	- enemy controlled & uncontested (enemy units): impossible
	- enemy controlled & uncontested (no units): impossible

*/

	if (has_trench(side, z))
		return false
	if (is_controlled_zone(z) || has_friendly_units(z)) {
		if (has_enemy_units(z))
			return contested_okay
		return true
	}
	return false
}

function can_build_trench(side, contested_okay) {
	for (var z = 0; z <= last_zone; ++z)
		if (can_build_trench_in_zone(side, z, contested_okay))
			return true
	return false
}

function find_free_trench(side) {
	var off = side * 20
	for (var i = off; i < off + 20; ++i)
		if (G.trenches[i] === Z_TRENCHES[side])
			return i
	return -1
}

function find_free_unit(side) {
	for (var i = last_unit[side]; i >= first_unit[side]; --i)
		if (G.units[i] === Z_POOL[side])
			return i
	return -1
}

function count_free_units(side) {
	var n = 0
	var off = side * 60
	for (var i = off; i < off + 60; ++i)
		if (G.units[i] === Z_POOL[side])
			++n
	return n
}

function set_zone_control(z, side) {
	var w = z >> 5
	var b = z & 31
	var m = 1 << b
	G.control[w] &= ~m
	if (side === 1)
		G.control[w] |= m
}

function get_zone_control(z) {
	var w = z >> 5
	var b = z & 31
	return (G.control[w] >> b) & 1
}

function is_german_zone(z) {
	return get_zone_control(z) === P_GERMAN
}

function is_french_zone(z) {
	return get_zone_control(z) === P_FRENCH
}

function is_controlled_zone(z) {
	return get_zone_control(z) === G.active
}

function is_enemy_controlled_zone(z) {
	return get_zone_control(z) !== G.active
}

function is_contested_zone(z) {
	return has_friendly_units(z) && has_enemy_units(z)
}

function is_uncontested_friendly_zone(z) {
	return is_controlled_zone(z) && !has_enemy_units(z)
}

function is_uncontested_enemy_controlled_zone(z) {
	return is_enemy_controlled_zone(z) && !has_friendly_units(z)
}

function count_units(side, z) {
	var n = 0
	for (var u = first_unit[side]; u <= last_unit[side]; ++u)
		if (is_unit_in_zone(u, z))
			++n
	return n
}

function count_fresh_units(side, z) {
	var n = 0
	for (var u = first_unit[side]; u <= last_unit[side]; ++u)
		if (is_unit_in_zone(u, z) && is_unit_fresh(u))
			++n
	return n
}

function has_units(side, z) {
	for (var u = first_unit[side]; u <= last_unit[side]; ++u)
		if (is_unit_in_zone(u, z))
			return true
	return false
}

function has_unmoved_units(side, z) {
	for (var u = first_unit[side]; u <= last_unit[side]; ++u)
		if (is_unit_in_zone(u, z) && !set_has(G.moved, u))
			return true
	return false
}

function has_fresh_units(side, z) {
	for (var u = first_unit[side]; u <= last_unit[side]; ++u)
		if (is_unit_in_zone(u, z) && is_unit_fresh(u))
			return true
	return false
}

function has_exhausted_units(side, z) {
	for (var u = first_unit[side]; u <= last_unit[side]; ++u)
		if (is_unit_in_zone(u, z) && is_unit_exhausted(u))
			return true
	return false
}

function count_friendly_units(z) {
	return count_units(G.active, z)
}

function has_friendly_units(z) {
	return has_units(G.active, z)
}

function has_friendly_unmoved_units(z) {
	return has_unmoved_units(G.active, z)
}

function has_enemy_units(z) {
	return has_units(1-G.active, z)
}

function find_trench(side, z) {
	var off = side * 20
	for (var i = off; i < off + 20; ++i)
		if (G.trenches[i] === z)
			return i
	return -1
}

function has_trench(side, z) {
	var off = side * 20
	for (var i = off; i < off + 20; ++i)
		if (G.trenches[i] === z)
			return true
	return false
}

function is_unit_fresh(u) {
	return (G.units[u] & 128) === 0
}

function is_unit_exhausted(u) {
	return (G.units[u] & 128) !== 0
}

function is_unit_in_zone(u, z) {
	return (G.units[u] & 127) === z
}

function is_unit_in_zone_list(u, zz) {
	for (var z of zz)
		if ((G.units[u] & 127) === z)
			return true
	return false
}

function set_unit_zone(u, z) {
	G.units[u] &= 128
	G.units[u] |= z
}

function get_unit_zone(u) {
	return G.units[u] & 127
}

function set_unit_fresh(u) {
	G.units[u] &= 127
}

function set_unit_exhausted(u) {
	G.units[u] |= 128
}

function for_each_trench(side, f) {
	var off = side * 20
	for (var i = off; i < off + 20; ++i)
		f(i)
}

function for_each_unit(side, f) {
	var off = side * 60
	for (var i = off; i < off + 60; ++i)
		f(i)
}

function for_each_unit_in_zone(side, z, f) {
	var off = side * 60
	for (var i = off; i < off + 60; ++i)
		if (is_unit_in_zone(i, z))
			f(i)
}

function is_unit_adjacent_to_zone(u, z) {
	for (var next of edges[z])
		if (is_unit_in_zone(u, next))
			return true
	return false
}

function for_each_zone(f) {
	for (var i = 0; i <= 78; ++i)
		f(i)
}

function has_enemy_fortress(z) {
	return is_enemy_controlled_zone(z) && set_has(all_fortress_zones, z)
}

function is_zone_hill(z) {
	return set_has(all_hill_zones, z)
}

function is_zone_unsupplied(z) {
	return map_has(G.oos[G.active], z)
}

function is_zone_supplied(z) {
	return !map_has(G.oos[G.active], z)
}

function roll_d6() {
	clear_undo()
	return random(6) + 1
}

function add_morale(side, n) {
	G.morale[side] = Math.max(0, Math.min(10, G.morale[side] + n))
}

function add_side_vp(side, n, msg) {
	if (side === P_FRENCH)
		add_vp(-n, msg)
	else
		add_vp(n, msg)
}

function add_vp(n, msg) {
	G.vp = Math.max(-15, Math.min(50, G.vp + n))
	n = (n < 0) ? (n + " VP") : ("+" + n + " VP")
	if (msg)
		log(n + " " + msg)
	else
		log(n)
}

function clamp_vp() {
	G.vp = Math.max(-15, Math.min(50, G.vp))
}

function eliminate_unit(u) {
	var side = get_unit_owner(u)
	set_unit_zone(u, Z_POOL[side])
	set_unit_fresh(u)
	add_morale(side, -1)
}

function move_unit(u, to) {
	var side = get_unit_owner(u)
	var from = get_unit_zone(u)
	if (from === Z_RESERVE[side])
		add_morale(side, 1)
	log_summary(from, to)
	set_unit_zone(u, to)
	set_add(G.take_control, from)
	set_add(G.take_control, to)
}

/* MOVE SUMMARY */

function log_morale(side) {
	if (side === P_FRENCH)
		log("%F" + G.morale[side])
	else
		log("%G" + G.morale[side])
}

function log_summary_begin() {
	G.summary = []
}

function log_summary(from, to) {
	if (G.summary) {
		var mm = map_get_set(G.summary, from)
		map_set(mm, to, map_get(mm, to, 0) + 1)
	} else {
		log(">Z" + from + " -> Z" + to)
		if (from === Z_GERMAN_RESERVE)
			log_morale(P_GERMAN)
		if (from === Z_FRENCH_RESERVE)
			log_morale(P_FRENCH)
	}
}

function log_summary_end() {
	if (G.summary) {
		var morale = false
		map_for_each(G.summary, (from, mm) => {
			map_for_each(mm, (to, n) => {
				if (to < 0) {
					if (n > 1)
						log(`>Z${from} (${n})`)
					else
						log(`>Z${from}`)
				} else {
					if (n > 1)
						log(`>Z${from} -> Z${to} (${n})`)
					else
						log(`>Z${from} -> Z${to}`)
				}
				if (from === Z_GERMAN_RESERVE || from === Z_FRENCH_RESERVE)
					morale = true
			})
		})
		if (morale)
			log_morale(G.active)
	}
	delete G.summary
}

/* SEQUENCE OF PLAY */

P.s1 = script (`
	for G.turn in 1 to 3 {
		call turn
	}
`)

P.s2 = script (`
	set G.active P_FRENCH
	call setup_units { n: 34, zz: 46 }
	call setup_trenches { n: 15 }
	call setup_done
	set G.active P_GERMAN
	call setup_units { n: 34 }
	call setup_exhaust { n: 4 }
	call setup_trenches { n: 15 }
	call setup_done
	for G.turn in 5 to 6 {
		call turn
	}
`)

P.s3 = script (`
	for G.turn in 1 to 6 {
		call turn
	}
`)

P.turn = script (`
	eval {
		log("#Turn " + G.turn)
		filter_cards_for_this_turn()
		construct_decks()
	}

	if (G.turn === 1) {
		set G.month 2
		call month
	} else {
		for G.month in 1 to 2 {
			call month
		}
	}

	if (G.nivelle && is_event_played(FE_NIVELLE)) {
		set G.active P_FRENCH
		call discard_nivelle
	}

	goto victory_check
`)

P.month = script (`
	log ("#" + month_names[G.turn * 2 + G.month - 3])

	if (is_event_played(FE_MANGIN)) {
		set G.mangin 0
	}

	if (is_event_played(FE_JOFFRE)) {
		set G.active P_FRENCH
		call joffre
	}

	if (is_event_played(FE_HOSPITALS)) {
		set G.active P_FRENCH
		call hospitals
	}

	if (G.turn > 1) {
		set G.active [ P_GERMAN, P_FRENCH ]
		call draw_phase
	}

	for G.round in 2 to 15 {
		call round
	}

	set G.round 0

	set G.active [ P_GERMAN, P_FRENCH ]
	call discard_phase

	eval { clear_barrage() }
`)

P.round = script (`
	log ("=" + G.round)
	set G.active (G.round & 1)
	call check_supply
	call choose_action_card
	call stacking_limitation
	call end_action
`)

/* DRAW PHASE */

P.draw_phase = {
	_begin() {
		L.undo = [ 0, 0 ]
	},
	prompt() {
		V.draw = G.draw[R]
		if (L.undo[R] < 1) {
			prompt("Choose a card from your draw deck.")
			for (var c of G.draw[R])
				action_card(c)
		} else {
			prompt("Draw phase done.")
			button("undo")
			button("next")
		}
	},
	card(c) {
		set_delete(G.draw[R], c)
		G.hand[R].push(c)
		L.undo[R] = c
	},
	undo() {
		array_delete_item(G.hand[R], L.undo[R])
		set_add(G.draw[R], L.undo[R])
		L.undo[R] = 0
	},
	next() {
		set_delete(G.active, R)
		if (G.active.length === 0)
			end()
	},
	_end() {
		while (G.hand[P_GERMAN].length < 8)
			draw_card(P_GERMAN)
		while (G.hand[P_FRENCH].length < 8)
			draw_card(P_FRENCH)
	},
}

/* DISCARD PHASE - END OF MONTH (SEE SIDEBAR) */

function has_keepable_cards(hand) {
	for (var c of hand)
		if (is_card_active_next_month(c))
			return true
	return false
}

P.discard_phase = {
	_begin() {
		L.undo = [ [], [] ]
		if (!has_keepable_cards(G.hand[P_GERMAN]))
			set_delete(G.active, P_GERMAN)
		if (!has_keepable_cards(G.hand[P_FRENCH]))
			set_delete(G.active, P_FRENCH)
		if (G.active.length === 0)
			end()
	},
	prompt() {
		prompt("You may discard cards in hand.")
		for (var c of G.hand[R])
			if (is_card_active_next_month(c))
				action_card(c)
		button("undo", L.undo[R].length > 0)
		button("done")
	},
	card(c) {
		array_delete_item(G.hand[R], c)
		L.undo[R].push(c)
	},
	undo() {
		G.hand[R].push(L.undo[R].pop())
	},
	done() {
		for (var c of L.undo[R])
			log("Discarded C" + c)
		set_delete(G.active, R)
		if (G.active.length === 0)
			end()
	},
}

/* END OF TURN PHASE - VPS AND VICTORY */

P.victory_check = function () {
	var z
	var m = 1
	var vps = G.vps.flat()

	log("#Victory Check")

	if (G.turn === G.last)
		m = 2

	log("German VPs:")
	map_for_each(map_german_vp, (z, n) => {
		if (is_german_zone(z)) {
			log(">+" + (n*m) + " for Z" + z)
			G.vp += (n*m)
		}
	})

	for (z of vps) {
		if (is_german_zone(z)) {
			log(">+" + (m) + " for Z" + z + " marker")
			G.vp += (m)
		}
	}

	var forts = 0
	for (z of all_fortress_zones)
		if (is_german_zone(z))
			forts++
	if (forts >= 2) {
		log(">+" + ((forts>>1) * m) + " for forts")
		G.vp += ((forts>>1) * m)
	}

	log("French VPs:")
	map_for_each(map_french_vp, (z, n) => {
		if (is_french_zone(z)) {
			log(">-" + (n*m) + " for Z" + z)
			G.vp -= (n*m)
		}
	})

	for (z of vps) {
		if (is_french_zone(z)) {
			log(">-" + (m) + " for Z" + z + " marker")
			G.vp -= (m)
		}
	}

	if (G.turn === 6) {
		switch (G.us_entry) {
		case 0:
			log(">+15 for US entry")
			G.vp += 15
			break
		case 1:
			log(">+5 for US entry")
			G.vp += 5
			break
		case 2:
			log(">-0 for US entry")
			break
		case 3:
			log(">-5 for US entry")
			G.vp -= 5
			break
		}
	}

	clamp_vp()

	// AUTOMATIC VICTORY CHECK

	if (G.vp >= 50)
		return finish(P_GERMAN, "Germans have 50 victory points!")

	var red_stars = 0
	for (z of all_two_star)
		if (is_german_zone(z))
			red_stars += 2
	for (z of all_one_star)
		if (is_german_zone(z))
			red_stars += 1
	if (red_stars >= 2)
		return finish(P_GERMAN, `Germans control ${red_stars} red stars!`)

	// LAST TURN VICTORY

	if (G.turn === G.last) {
		if (G.turn === 2) {
			if (G.vp >= 20)
				return finish(P_GERMAN, "German victory!")
			else
				return finish(P_FRENCH, "French victory!")
		} else {
			if (G.vp >= 0)
				return finish(P_GERMAN, "German victory!")
			else
				return finish(P_FRENCH, "French victory!")
		}
	}

	end()
}

/* ACTION ROUND: PLAY CARDS */

function update_zone_control(z) {
	if (get_zone_control(z) === P_FRENCH) {
		if (!has_units(P_FRENCH, z) && has_units(P_GERMAN, z))
			set_zone_control(z, P_GERMAN)
	} else {
		if (!has_units(P_GERMAN, z) && has_units(P_FRENCH, z))
			set_zone_control(z, P_FRENCH)
	}
}

function auto_skip_end_round() {
	// automatically skip end_round confirmation
	if (L.P === "end_action")
		P.end_action.end_round()
}

P.end_action = {
	prompt() {
		prompt("End action round.")
		button("end_round")
	},
	end_round() {
		// en-route to reserve boxes
		for_each_unit_in_zone(G.active, Z_EN_ROUTE[G.active], u => {
			set_unit_zone(u, Z_RESERVE[G.active])
		})

		// take control in zones moved through at end of round
		for (var z of G.take_control) {
			if (is_enemy_controlled_zone(z) && !has_enemy_units(z)) {
				set_zone_control(z, G.active)
			} else if (is_controlled_zone(z) && has_enemy_units(z) && !has_friendly_units(z)) {
				// and contested zones we leave
				set_zone_control(z, 1-G.active)
			}
		}
		set_clear(G.take_control)

		if (G.barrage)
			update_zone_control(G.barrage.target)
		if (G.barrage2)
			update_zone_control(G.barrage2.target)

		// remove enemy trenches in uncontested friendly zones (and vice versa)
		for_each_trench(1-G.active, i => {
			if (is_uncontested_friendly_zone(G.trenches[i]))
				G.trenches[i] = Z_TRENCHES[1-G.active]
		})
		for_each_trench(G.active, i => {
			if (is_uncontested_enemy_controlled_zone(G.trenches[i]))
				G.trenches[i] = Z_TRENCHES[G.active]
		})

		set_clear(G.played)
		set_clear(G.moved)
		G.tm = 0

		end()
	},
}

const discardable_permanents = [
	[
		GE_REINFORCEMENTS_FROM_RUSSIA,
		GE_REINFORCEMENTS_TO_RUSSIA,
		GE_BAD_WEATHER,
	],
	[
		FE_MANGIN,
		// FE_HOSPITALS,
		FE_JOFFRE,
	]
]

P.choose_action_card = {
	prompt() {
		prompt(`Action Round ${G.round >> 1}: Play a card.`)

		if (G.morale[G.active] < 4)
			V.prompt += ` [i]Morale level is ${G.morale[G.active]}![/i]`

		for (let c of G.hand[G.active])
			action_card(c)

		// TODO: allow discarding all permanents here per rules?
		for (var c of discardable_permanents[G.active])
			if (set_has(G.permanent, c))
				action_card(c)

		if (G.hand[G.active].length >= 2)
			button("discard")
		button("pass")
	},
	discard() {
		push_undo()
		clear_barrage()
		goto("discard_cards", { n: 2 })
	},
	card(c) {
		push_undo()
		clear_barrage()
		if (set_has(G.permanent, c)) {
			discard_permanent(c)
		} else {
			play_hand(G.active, c)
			goto("choose_action", { c })
		}
	},
	pass() {
		push_undo()
		clear_barrage()
		log("Pass")
		end()
	},
}

P.choose_action = {
	prompt() {
		prompt(`Take an action with "${cards[L.c].name}".`)
		if (is_card_barrage(L.c)) {
			button("barrage", G.morale[G.active] > 0)
			if (G.morale[G.active] > 0) {
				for (var c of G.hand[G.active])
					if (is_card_barrage(c))
						action_card(c)
			}
		}
		if (can_play_event(L.c))
			button("event")
		button("ap")
	},
	card(c) {
		push_undo()
		play_hand(G.active, c)
		goto("double_or_two_zone_barrage", { c1: L.c, c2: c })
	},
	barrage() {
		push_undo()
		init_barrage(cards[L.c].barrage)
		goto("barrage")
	},
	event() {
		push_undo()
		log("Event")
		goto("play_event_and_use_ap", { c: L.c, ap: cards[L.c].ap2 })
	},
	ap() {
		push_undo()
		goto("use_ap", { ap: cards[L.c].ap1 })
	},
}

P.play_event_and_use_ap = script (`
	call play_event { c: L.c }
	if (L.ap > 0) {
		call use_ap { ap: L.ap }
	}
`)

/* DISCARD TWO CARDS TO DRAW A NEW CARD */

P.discard_cards = {
	prompt() {
		prompt("Discard two cards to draw a new card.")
		for (let c of G.hand[G.active])
			action_card(c)
	},
	card(c) {
		push_undo()
		discard_hand(G.active, c)
		if (--L.n === 0)
			goto("draw_replacement")
	},
}

P.draw_replacement = {
	prompt() {
		prompt("Draw a new card.")
		V.draw = G.draw[G.active]
		for (let c of G.draw[G.active])
			action_card(c)
	},
	card(c) {
		push_undo()
		log("Drew 1 card")
		set_delete(G.draw[G.active], c)
		G.hand[G.active].push(c)
		end()
	},
}

/* STACKING LIMITATION */

function has_over_stacked_units() {
	for (var z = first_zone; z <= last_zone; ++z)
		if (count_units(G.active, z) > 3)
			return true
	return false
}

P.stacking_limitation = function () {
	log_summary_end()
	if (has_over_stacked_units())
		goto("enforce_stacking_limitation")
	else
		end()
}

P.enforce_stacking_limitation = {
	prompt() {
		prompt("Eliminate units in over-stacked zones.")
		for_each_zone(z => {
			if (count_units(G.active, z) > 3)
				for_each_unit_in_zone(G.active, z, action_unit)
		})
	},
	unit(u) {
		push_undo()
		log("Over-stacked Z" + get_unit_zone(u))
		eliminate_unit(u)
		log_morale(G.active)
		if (!has_over_stacked_units())
			end()
	},
}

/* BARRAGE */

function clear_barrage() {
	delete G.barrage
	delete G.barrage2
}

function init_barrage(dice, n_cards=1) {
	if (G.active === P_FRENCH && G.nivelle) {
		delete G.nivelle
	}
	if (G.active === P_FRENCH && is_non_event_barrage() && is_event_played(FE_HEAVY_ARTILLERY)) {
		log("+" + n_cards + " heavy artillery")
		dice += n_cards
	}
	G.barrage = {
		dice,
		target: -1,
		initial: 1,
		assault: 0,
	}
}

P.double_or_two_zone_barrage = {
	prompt() {
		prompt("Barrage with two cards.")
		button("double_barrage")
		button("two_zone_barrage")
	},
	double_barrage() {
		push_undo()
		init_barrage(cards[L.c1].barrage + cards[L.c2].barrage, 2)
		goto("double_barrage")
	},
	two_zone_barrage() {
		push_undo()
		init_barrage(cards[L.c2].barrage)
		swap_barrage()
		init_barrage(cards[L.c1].barrage)
		goto("two_zone_barrage")
	},
}

P.counter_barrage = {
	_begin() {
		clear_undo()
		G.active = 1 - G.active
	},
	prompt() {
		prompt("Counter barrage in Z" + G.barrage.target + "?")
		for (var c of G.hand[G.active])
			if (cards[c].type === "Barrage")
				action_card(c)
		button("pass")
	},
	card(c) {
		play_hand(G.active, c)
		G.barrage.dice -= cards[c].barrage
		G.active = 1 - G.active
		end()
	},
	pass() {
		G.active = 1 - G.active
		end()
	},
}

P.barrage = script (`
	call barrage_target
	call infantry_assault
	call stacking_limitation
	call barrage_resolution
	if (G.barrage.infiltrate && !has_enemy_units(G.barrage.target)) {
		call infiltrate
	}
`)

P.double_barrage = script (`
	call barrage_target
	call infantry_assault
	call stacking_limitation
	call counter_barrage
	call barrage_resolution
`)

function swap_barrage() {
	var tmp = G.barrage
	G.barrage = G.barrage2
	G.barrage2 = tmp
}

P.two_zone_barrage = script (`
	call barrage_target

	eval { swap_barrage() }
	call barrage_target

	eval { swap_barrage() }
	call infantry_assault

	eval { swap_barrage() }
	call infantry_assault

	call stacking_limitation

	eval { swap_barrage() }
	call barrage_resolution

	eval { swap_barrage() }
	call barrage_resolution
`)

P.barrage_resolution = script (`
	call response_mangin
	call response_raynal
	call response_offensive_stockpile
	call artillery_roll
	if (active_air_support() >= 1) {
		call artillery_reroll_air
	}
	call artillery_hits
	call response_driant
	call apply_hits
	if (G.barrage.assault && is_contested_zone(G.barrage.target)) {
		call response_unknown_heroes
		call infantry_hits
		call apply_hits
	}
`)

// BARRAGE TARGET

P.barrage_target = {
	prompt() {
		prompt("Target for barrage " + G.barrage.dice + ".")
		for (var z = first_zone; z <= last_zone; ++z) {
			if (G.barrage2 && G.barrage2.target === z)
				continue
			if (has_enemy_units(z))
				action_zone(z)
		}
	},
	zone(z) {
		push_undo()

		log("Target Z" + z)

		G.barrage.target = z
		if (has_friendly_units(z))
			G.barrage.initial = 0

		if (G.barrage.gas_attack) {
			for_each_unit_in_zone(1-G.active, G.barrage.target, u => {
				set_unit_exhausted(u)
			})
		}

		end()
	},
}

// INFANTRY ASSAULT DECLARATION & PRE-MOVE

function can_assault_into(from, target, allow_contested) {
	if (is_zone_unsupplied(from))
		return false
	if (is_contested_zone(from) && !allow_contested)
		return false
	if (is_across_meuse(from, target)) {
		return (
			is_controlled_zone(59) &&
			(from === 61 && target === 71) || (from === 71 && target === 61)
		)
	}
	return true
}

P.infantry_assault = {
	_begin() {
		L.in = 0
		L.out = 0
		L.replace = []
		log_summary_begin()
	},
	_end() {
		if (G.barrage.assault) {
			log("Assault")
			log_summary_end()
		}
	},
	prompt() {
		prompt("Infantry assault declaration.")
		V.where = G.barrage.target

		// If the morale level is less than 4, infantry assaults are not possible
		if (G.morale[G.active] < 4) {
			prompt(`Infantry assault is not possible (morale level is ${G.morale[R]}).`)
			button("skip")
			return
		}

		if (count_fresh_units(G.active, G.barrage.target) > 0)
			button("assault")

		if (L.in === 0)
			button("skip")

		// rotate up to 3 exhausted units out of the target zone
		if (L.out < 3) {
			if (!is_zone_unsupplied(G.barrage.target)) {
				for_each_unit_in_zone(G.active, G.barrage.target, u => {
					if (is_unit_exhausted(u) && !set_has(G.moved, u))
						action_unit(u)
				})
			}
		}

		// move up to 3 fresh units from friendly adjacent into the target zone
		if (L.in < 3) {
			for (var from of edges[G.barrage.target]) {
				if (can_assault_into(from, G.barrage.target, L.in > 0)) {
					for_each_unit_in_zone(G.active, from, u => {
						if (is_unit_fresh(u) && !set_has(G.moved, u))
							action_unit(u)
					})
				}
			}
		}

		// replacing assaulting units
		map_for_each(L.replace, (replace, n) => {
			if (n > 0) {
				for (var from of edges[replace]) {
					if (from !== G.barrage.target && !is_zone_unsupplied(from)) {
						for_each_unit_in_zone(G.active, from, u => {
							if (!set_has(G.moved, u))
								action_unit(u)
						})
					}
				}
			}
		})
	},
	unit(u) {
		push_undo()
		G.barrage.assault = 1
		set_add(G.moved, u)
		var z = get_unit_zone(u)
		if (z === G.barrage.target) {
			++L.out
			call("assault_rotate", { u })
		} else {
			call("assault_move", { u })
		}
	},
	skip() {
		push_undo()
		G.barrage.assault = 0
		end()
	},
	assault() {
		push_undo()
		G.barrage.assault = 1
		end()
	},
}

P.assault_rotate = {
	prompt() {
		prompt("Infantry assault declaration.")
		V.where = G.barrage.target
		V.who = L.u

		// rotate out
		for (var to of edges[G.barrage.target])
			if (is_controlled_zone(to))
				action_zone(to)
	},
	zone(z) {
		move_unit(L.u, z)
		end()
	},
}

P.assault_move = {
	prompt() {
		prompt("Infantry assault declaration.")
		V.where = G.barrage.target
		V.who = L.u
		var here = get_unit_zone(L.u)

		// assault in
		if (L.L.in < 3 && is_zone_adjacent_to_zone(here, G.barrage.target) && can_assault_into(here, G.barrage.target, L.L.in > 0)) {
			action_zone(G.barrage.target)
		}

		// replace
		for (var from of edges[here]) {
			if (map_get(L.L.replace, from, 0) > 0)
				action_zone(from)
		}
	},
	zone(new_z) {
		var old_z = get_unit_zone(L.u)
		move_unit(L.u, new_z)
		if (new_z === G.barrage.target) {
			++L.L.in
			map_set(L.L.replace, old_z, map_get(L.L.replace, old_z, 0) + 1)
		} else {
			map_set(L.L.replace, new_z, map_get(L.L.replace, new_z, 0) - 1)
		}
		end()
	},
}

// ARTILLERY BARRAGE RESOLUTION

// Air support level 1: no friendly fire; may reroll each barrage once
// Air support level 2: opponent barrage do not reroll 6
// Air support level 3: reroll 5 + 6

function active_air_support() {
	if (G.active === P_GERMAN)
		return -G.air
	return G.air
}

function roll_barrage(n) {
	var target = G.barrage.target
	var air = active_air_support()

	var has_ff = air < 1 && G.barrage.assault && G.barrage.initial

	var hit_threshold = 5
	for (var z of edges[target])
		if (is_controlled_zone(z))
			hit_threshold = 4

	var reroll_threshold = (air <= -2) ? 7 : (air >= 3) ? 5 : 6

	var list = []

	G.barrage.reroll = 0
	for (var i = 0; i < n; ++i) {
		var die = random(6) + 1
		if (die >= hit_threshold) {
			++G.barrage.hits
			if (die >= reroll_threshold) {
				++G.barrage.reroll
			}
			if (die === 6 && has_ff) {
				++G.barrage.ff_hits
				list.push("R" + die)
			} else {
				list.push("B" + die)
			}
		} else {
			list.push("W" + die)
		}
	}

	log(">" + list.join(" "))
}

P.artillery_roll = function () {
	clear_undo()

	if (G.barrage2) {
		log()
		log("Artillery Z" + G.barrage.target)
	} else {
		log("Artillery")
	}

	G.barrage.hits = 0
	G.barrage.ff_hits = 0

	if (G.barrage.dice > 0) {
		roll_barrage(G.barrage.dice)
	} else {
		log(">No dice")
		G.barrage.reroll = 0
	}

	if (G.barrage.reroll > 0)
		goto("artillery_reroll")
	else
		end()
}

P.artillery_reroll = {
	prompt() {
		prompt(`Artillery barrage resolution: you may roll up to ${G.barrage.reroll} more dice.`)
		V.where = G.barrage.target
		action_number_range(1, G.barrage.reroll)
		button("skip")
	},
	number(n) {
		roll_barrage(n)
		if (G.barrage.reroll === 0)
			end()
	},
	roll() {
		this.number(G.barrage.reroll)
	},
	skip() {
		push_undo()
		end()
	},
}

P.artillery_reroll_air = {
	prompt() {
		prompt(`Artillery barrage resolution: you may re-roll all the dice.`)
		V.where = G.barrage.target
		button("reroll")
		button("keep")
	},
	reroll() {
		push_undo()
		log("Air-support reroll")
		goto("artillery_roll")
	},
	keep() {
		push_undo()
		end()
	},
}

P.artillery_hits = function () {
	var target = G.barrage.target
	var hits = G.barrage.hits
	var ff_hits = G.barrage.ff_hits

	log("Barrage")

	log(">+" + hits + " hits")

	if (!G.barrage.ignore_fortress && has_enemy_fortress(target)) {
		if (G.active === P_FRENCH && is_event_played(FE_COORDINATED_TACTICS)) {
			log(">-1 fortress")
			hits -= 1
		} else {
			log(">-2 fortress")
			hits -= 2
		}
	}

	if (has_trench(1 - G.active, target)) {
		log(">-1 trench")
		hits -= 1
	}

	if (G.barrage.raynal) {
		log(">-3 raynal")
		hits -= 3
	}

	hits = Math.max(0, hits)

	log(">= " + hits + " hits")

	ff_hits = Math.floor(ff_hits / 3)
	if (ff_hits > 0) {
		log("Friendly fire")
		log(">" + ff_hits + " hits")
	}

	G.barrage.hits = hits
	G.barrage.ff_hits = ff_hits
	end()
}

// INFANTRY ASSAULT RESOLUTION

P.infantry_hits = function () {
	var target = G.barrage.target
	var hits = 0
	var ff_hits = 0

	log("Attacker")
	for_each_unit_in_zone(G.active, target, u => {
		if (is_unit_fresh(u))
			hits += 1
	})
	log(">+" + hits + " units")
	if (G.barrage.mangin) {
		log(">+" + hits + " mangin")
		hits += hits
	}

	if (G.active === P_GERMAN && is_event_played(GE_FLAMETHROWERS)) {
		log(">+1 flamethrowers")
		hits += 1
	}

	if (G.active === P_FRENCH && is_event_played(FE_COORDINATED_TACTICS)) {
		log(">+1 coordinated tactics")
		hits += 1
	}

	if (has_trench(1-G.active, target)) {
		log(">-1 trench")
		hits -= 1
	}

	hits = Math.min(hits)

	log(">= " + hits + " hits")

	log("Defender")

	for_each_unit_in_zone(1-G.active, target, u => {
		if (is_unit_fresh(u) || G.barrage.unknown_heroes)
			ff_hits += 3
		else
			ff_hits += 1
	})
	log(">+" + ff_hits + " units")

	if (G.barrage.mangin) {
		log(">+" + ff_hits + " mangin")
		ff_hits += ff_hits
	}

	if (is_zone_hill(target) && is_enemy_controlled_zone(target)) {
		log(">+1 hills")
		ff_hits += 1
	}

	if (is_event_played(GE_BAD_WEATHER)) {
		log(">+1 bad weather")
		if (--G.bad_weather === 0) {
			discard_permanent(GE_BAD_WEATHER)
			delete G.bad_weather
		}
	}

	log(">= " + ff_hits + " hits")

	G.barrage.hits = hits
	G.barrage.ff_hits = ff_hits
	end()
}

// HIT APPLICATION

P.apply_hits = {
	_begin() {
		L.exhausted = 0
		L.eliminated = 0
		L.ff_exhausted = 0
		L.ff_eliminated = 0
	},
	prompt() {
		var target = G.barrage.target

		prompt(`Apply ${G.barrage.hits} hits to enemy units and ${G.barrage.ff_hits} hits to friendly units.`)
		V.where = G.barrage.target

		var prio = false

		// priority: fresh units (absorb 1 hit)
		if (G.barrage.hits >= 1) {
			for_each_unit_in_zone(1-G.active, target, u => {
				if (is_unit_fresh(u)) {
					action_unit(u)
					prio = true
				}
			})
		}

		// second: exhausted units (absorb 2 hits)
		if (G.barrage.hits >= 2 && !prio) {
			for_each_unit_in_zone(1-G.active, target, u => {
				if (is_unit_exhausted(u))
					action_unit(u)
			})
		}

		var ff_prio = false

		// priority: fresh units (absorb 1 hit)
		if (G.barrage.ff_hits >= 1) {
			for_each_unit_in_zone(G.active, target, u => {
				if (is_unit_fresh(u)) {
					action_unit(u)
					ff_prio = true
				}
			})
		}

		// second: exhausted units (absorb 2 hits)
		if (G.barrage.ff_hits >= 2 && !ff_prio) {
			for_each_unit_in_zone(G.active, target, u => {
				if (is_unit_exhausted(u))
					action_unit(u)
			})
		}

		if (!V.actions.unit) {
			button("next")
		}
	},
	unit(u) {
		if (is_unit_fresh(u)) {
			set_unit_exhausted(u)
			if (is_friendly_unit(u)) {
				L.ff_exhausted += 1
				G.barrage.ff_hits -= 1
			} else {
				L.exhausted += 1
				G.barrage.hits -= 1
			}
		} else {
			eliminate_unit(u)
			if (is_friendly_unit(u)) {
				L.ff_eliminated += 1
				G.barrage.ff_hits -= 2
			} else {
				L.eliminated += 1
				G.barrage.hits -= 2
			}
		}
	},
	next() {
		if (L.eliminated + L.ff_eliminated > 0) {
			log("Eliminated")
			if (L.eliminated) {
				log(`>${L.eliminated} ${ROLES[1-G.active]}`)
				log_morale(1-G.active)
			}
			if (L.ff_eliminated) {
				log(`>${L.ff_eliminated} ${ROLES[G.active]}`)
				log_morale(G.active)
			}
		}
		end()
	},
}

/* USE ACTION POINTS */

P.use_ap = {
	prompt() {
		prompt(`Use ${L.ap} action points.`)
		button("build_trench", can_build_trench(G.active, true))
		button("reinforcements", count_free_units(G.active) > 0)
		button("refresh", can_refresh_units())
		button("strategic", can_strategic_movement())
		button("rotate")
		button("tactical")
		button("pass")
	},
	build_trench() {
		push_undo()
		log("Trenches")
		call_or_goto(--L.ap > 0, "trench", { n: 2 })
	},
	reinforcements() {
		push_undo()
		log("Reinforcements")
		if (G.active === P_GERMAN) {
			if (is_event_played(GE_REINFORCEMENTS_FROM_RUSSIA))
				return call_or_goto(--L.ap > 0, "reinforcements_from_russia")
			if (is_event_played(GE_REINFORCEMENTS_TO_RUSSIA))
				return call_or_goto(--L.ap > 0, "reinforcements_to_russia")
		}
		call_or_goto(--L.ap > 0, "reinforcements")
	},
	refresh() {
		push_undo()
		log("Refresh")
		call_or_goto(--L.ap > 0, "refresh", { n: 2 })
	},
	strategic() {
		push_undo()
		if (G.active === P_FRENCH && is_event_played(GE_CHAOS_IN_THE_REAR)) {
			log("Strategic (2 AP)")
			L.ap -= 2
		} else {
			log("Strategic")
			L.ap -= 1
		}
		log_summary_begin()
		call_or_goto(L.ap > 0, "strategic_movement")
	},
	tactical() {
		push_undo()
		G.tm = 1
		log("Tactical")
		log_summary_begin()
		call_or_goto(--L.ap > 0, "tactical_movement")
	},
	rotate() {
		push_undo()
		G.tm = 1
		log("Special Tactical")
		call_or_goto(--L.ap > 0, "rotate")
	},
	pass() {
		push_undo()
		log("Pass")
		end()
	},
	_resume() {
		log_summary_end()
	},
}

/* BUILD A TRENCH */

P.trench_from_event = {
	_begin() {
		if (!can_place_trench_in_any_controlled())
			end()
	},
	prompt() {
		prompt(`Place up to ${L.n} trenches.`)
		for (var z = 0; z <= last_zone; ++z)
			if (can_place_trench_in_controlled(z))
				action_zone(z)
		button("done")
	},
	zone(z) {
		push_undo()
		log(">Z" + z)
		L.n --
		if (!can_place_trench_in_any_controlled())
			L.n = 0
		if (find_free_trench(G.active) < 0) {
			call_or_goto(L.n > 0, "move_trench", { z })
		} else {
			place_trench(G.active, z)
			if (L.n === 0)
				end()
		}
	},
	done() {
		push_undo()
		end()
	},
}

P.trench = {
	_begin() {
		if (!can_build_trench(G.active, L.n >= 2))
			end()
	},
	prompt() {
		prompt(`Build up to ${L.n} trenches.`)
		for (var z = 0; z <= last_zone; ++z)
			if (can_build_trench_in_zone(G.active, z, L.n >= 2))
				action_zone(z)
		button("done")
	},
	zone(z) {
		push_undo()
		log(">Z" + z)
		L.n -= has_enemy_units(z) ? 2 : 1
		if (!can_build_trench(G.active, L.n >= 2))
			L.n = 0
		if (find_free_trench(G.active) < 0) {
			call_or_goto(L.n > 0, "move_trench", { z })
		} else {
			place_trench(G.active, z)
			if (L.n === 0)
				end()
		}
	},
	done() {
		push_undo()
		end()
	},
}

P.move_trench = {
	prompt() {
		prompt(`Move a trench to Z${L.z}.`)
		V.where = L.z
		for (var z = 0; z <= last_zone; ++z)
			if (has_trench(G.active, z))
				action_zone(z)
	},
	zone(z) {
		remove_trench(G.active, z)
		place_trench(G.active, L.z)
		end()
	},
}

/* REQUEST REINFORCEMENTS */

P.reinforcements = {
	prompt() {
		prompt("Request up to 3 reinforcements for 1 VP each.")
		action_number_range(1, Math.min(3, count_free_units(G.active)))
	},
	number(n) {
		push_undo()
		add_side_vp(G.active, -n)
		log(`>Z${Z_POOL[G.active]} -> Z${Z_EN_ROUTE[G.active]} (${n})`)
		while (n-- > 0)
			setup_unit(G.active, Z_EN_ROUTE[G.active])
		end()
	},
}

P.reinforcements_from_russia = {
	prompt() {
		prompt("Request 4 reinforcements for 3 VP.")
		action_number(4)
	},
	number(n) {
		push_undo()
		add_side_vp(G.active, -3)
		log(`>Z${Z_POOL[G.active]} -> Z${Z_EN_ROUTE[G.active]} (${n})`)
		while (n-- > 0)
			setup_unit(G.active, Z_EN_ROUTE[G.active])
		end()
	},
}

P.reinforcements_to_russia = {
	prompt() {
		prompt("Request 2 reinforcements for 3 VP.")
		action_number(2)
	},
	number(n) {
		push_undo()
		add_side_vp(G.active, -3)
		log(`>Z${Z_POOL[G.active]} -> Z${Z_EN_ROUTE[G.active]} (${n})`)
		while (n-- > 0)
			setup_unit(G.active, Z_EN_ROUTE[G.active])
		end()
	},
}

/* REFRESH UNITS */

function get_refresh_cost(z) {
	// cost is tracked in 1/2 action points
	if (G.active === P_FRENCH && is_event_played(FE_LA_NORIA))
		return 1
	if (is_contested_zone(z))
		return 2
	return 1
}

function can_refresh_unit(u, supply, n) {
	if (is_unit_exhausted(u)) {
		var z = get_unit_zone(u)
		if (set_has(supply, z)) {
			return n >= get_refresh_cost(z)
		}
	}
}

function can_refresh_units(n = 2) {
	// If the morale level is 3 or less, exhausted units may not be refreshed
	if (G.morale[G.active] <= 3)
		return false
	var supply = search_supply(G.active)
	for (var u = first_unit[G.active]; u <= last_unit[G.active]; ++u)
		if (can_refresh_unit(u, supply, n))
			return true
	return false
}

P.refresh = {
	_begin() {
		log_summary_begin()
	},
	_end() {
		log_summary_end()
	},
	prompt() {
		prompt(`Refresh exhausted units.`)
		var supply = search_supply(G.active)
		for_each_unit(G.active, u => {
			if (can_refresh_unit(u, supply, L.n))
				action_unit(u)
		})
	},
	unit(u) {
		push_undo()
		var z = get_unit_zone(u)
		log_summary(z, -1)
		set_unit_fresh(u)
		L.n -= get_refresh_cost(z)
		if (L.n === 0 || !can_refresh_units(L.n))
			end()
	},
}

/* STRATEGIC MOVEMENT */

function can_strategic_movement() {
	if (G.tm)
		return false
	if (G.active === P_FRENCH && is_event_played(GE_CHAOS_IN_THE_REAR))
		return L.ap >= 2
	return true
}

P.strategic_movement = {
	prompt() {
		prompt("Designate one zone for strategic movement.")
		for (var z = 0; z <= last_zone; ++z)
			if (is_uncontested_friendly_zone(z) && has_friendly_units(z) && !is_zone_unsupplied(z))
				action_zone(z)
		if (has_friendly_units(Z_RESERVE[G.active]))
			action_zone(Z_RESERVE[G.active])
	},
	zone(z) {
		push_undo()
		var n = count_friendly_units(z)
		if (z === Z_RESERVE[G.active])
			n = Math.min(3, n)
		goto("strategic_movement_from", { from: z, n })
	},
}

P.strategic_movement_from = {
	prompt() {
		prompt("Strategic movement from Z" + L.from + ".")
		V.where = L.from
		for_each_unit(G.active, u => {
			if (is_unit_in_zone(u, L.from))
				action_unit(u)
		})
		button("done")
	},
	unit(u) {
		push_undo()
		call_or_goto(--L.n > 0, "strategic_movement_to", { from: L.from, who: u })
	},
	done() {
		push_undo()
		end()
	},
}

P.strategic_movement_to = {
	prompt() {
		prompt("Strategic movement from Z" + L.from + ".")
		V.where = L.from
		V.who = L.who
		for (var z of search_supply(G.active))
			if (is_uncontested_friendly_zone(z) && !is_unit_in_zone(L.who, z))
				action_zone(z)
	},
	zone(z) {
		move_unit(L.who, z)
		end()
	},
}

/* TACTICAL MOVEMENT */

function can_tactical_move_from(from) {
	if (is_zone_unsupplied(from))
		return false
	if (from <= last_zone_and_reserve)
		for (var next of edges[from])
			if (can_tactical_move_to(from, next))
				return true
	return false
}

function can_tactical_move_to(from, to) {
	if (to === Z_GERMAN_RESERVE && G.active === P_FRENCH)
		return false
	if (to === Z_FRENCH_RESERVE && G.active === P_GERMAN)
		return false

	if (is_contested_zone(from) && is_uncontested_enemy_controlled_zone(to))
		return false

	// occupied uncontested enemy zone -- only possible during assault
	if (is_enemy_controlled_zone(to) && has_enemy_units(to) && !has_friendly_units(to))
		return false

	return true
}

P.tactical_movement = {
	_begin() {
		L.n = 3
	},
	prompt() {
		prompt("Move up to " + L.n + " units.")
		for_each_unit(G.active, u => {
			if (!set_has(G.moved, u) && can_tactical_move_from(get_unit_zone(u)))
				action_unit(u)
		})
		if (L.n < 3)
			button("done")
	},
	unit(u) {
		push_undo()
		set_add(G.moved, u)
		call_or_goto(--L.n > 0, "tactical_movement_to", { who: u })
	},
	done() {
		push_undo()
		end()
	},
}

P.tactical_movement_to = {
	prompt() {
		prompt("Tactical movement to.")
		V.who = L.who
		var here = get_unit_zone(L.who)
		for (var next of edges[here])
			if (can_tactical_move_to(here, next))
				action_zone(next)
	},
	zone(to) {
		var from = get_unit_zone(L.who)
		move_unit(L.who, to)
		if (can_tactical_move_again(from, to)) {
			goto("tactical_movement_again", { from, who: L.who })
		} else {
			end()
		}
	},
}

function can_tactical_move_again(from, to) {
	if (to > last_zone)
		return false
	if (G.active === P_FRENCH && G.turn === 1)
		return false
	if (is_across_meuse(from, to))
		return false
	if (is_uncontested_friendly_zone(from) && !has_enemy_units(to))
		for (var next of edges[to])
			if (next !== from && !is_across_meuse(to, next) && !has_enemy_units(next) && can_tactical_move_to(to, next))
				return true
	return false
}

P.tactical_movement_again = {
	prompt() {
		prompt("Tactical movement bonus.")
		V.who = L.who
		var here = get_unit_zone(L.who)
		for (var next of edges[here])
			if (next !== L.from && !is_across_meuse(here, next) && !has_enemy_units(next) && can_tactical_move_to(here, next))
				action_zone(next)
		action_unit(L.who)
		button("stop")
	},
	zone(to) {
		move_unit(L.who, to)
		end()
	},
	unit(_) {
		this.stop()
	},
	stop() {
		end()
	},
}

function can_rotate_from(from) {
	if (is_zone_supplied(from) && has_friendly_units(from))
		for (var next of edges[from])
			if (is_zone_supplied(next) && has_friendly_units(next))
				return true
	return false
}

P.rotate = {
	prompt() {
		prompt("Designate zone to rotate combat units.")
		for (var z = first_zone; z <= last_zone; ++z)
			if (can_rotate_from(z))
				action_zone(z)
		if (!V.actions.zone)
			button("skip")
	},
	zone(z) {
		var adjacent = edges[z].filter(has_friendly_units)
		goto("rotate_who", { where: z, in: 3, out: 3, adjacent })
	},
	skip() {
		end()
	},
}

P.rotate_who = {
	_begin() {
		// to avoid moving twice in same special movement
		L.once = []
	},
	prompt() {
		prompt(`Exchange units between Z${L.where} and adjacent zones (${L.in} in and ${L.out} out).`)
		V.where = L.where
		for_each_unit(G.active, u => {
			if (L.out > 0) {
				if (is_unit_in_zone(u, L.where) && !set_has(L.once, u))
					action_unit(u)
			}
			if (L.in > 0) {
				if (is_unit_in_zone_list(u, L.adjacent) && !set_has(L.once, u))
					action_unit(u)
			}
		})
		button("done", L.in + L.out < 6)
	},
	unit(u) {
		push_undo()
		set_add(L.once, u)
		var z = get_unit_zone(u)
		if (z === L.where) {
			--L.out
			call_or_goto(L.in + L.out > 0, "rotate_out", { where: L.where, who: u, adjacent: L.adjacent })
		} else {
			--L.in
			call_or_goto(L.in + L.out > 0, "rotate_in", { where: L.where, who: u, adjacent: L.adjacent })
		}
	},
	done() {
		push_undo()
		end()
	},
}

P.rotate_out = {
	prompt() {
		prompt(`Move unit out of Z${L.where}.`)
		V.where = L.where
		V.who = L.who
		for (var next of L.adjacent)
			if (can_tactical_move_to(L.where, next))
				action_zone(next)
	},
	zone(to) {
		move_unit(L.who, to)
		end()
	},
}

P.rotate_in = {
	prompt() {
		prompt(`Move unit into Z${L.where}.`)
		V.where = L.where
		V.who = L.who
		action_zone(L.where)
	},
	zone(to) {
		move_unit(L.who, to)
		end()
	},
}

/* EVENTS */

function can_play_event(c) {
	let req = cards[c].req
	if (req) {
		for (var r of req) {
			if (!G.permanent.includes(r))
				return false
		}
		return true
	}

	// If morale level is 0, no artillery barrage by this side.
	if (G.morale[G.active] === 0)
		if (cards[c].barrage > 0)
			return false

	if (c === FE_AIR_SUPPORT_1 || c === FE_AIR_SUPPORT_2)
		return G.air < 3
	if (c === GE_AIR_SUPPORT_1 || c === GE_AIR_SUPPORT_2)
		return G.air > -3

	if (c === GE_KRONPRINZ)
		return G.turn <= 2

	if (c === FE_RAYNAL)
		return false
	if (c === FE_DRIANT)
		return false
	if (c === FE_JELLICOE)
		return false
	if (c === FE_UNKNOWN_HEROES)
		return false

	return !!cards[c].event
}

P.play_event = function () {
	var event = cards[L.c].event
	var text = cards[L.c].text
	if (is_card_permanent(L.c))
		set_add(G.permanent, L.c)
	if (is_card_one_time(L.c))
		set_add(G.removed, L.c)
	if (text)
		log('Q' + L.c)
	goto(event)
}

// french permanent with no effect when played
P.event_la_noria = end
P.event_mangin = end
P.event_hospitals = end
P.event_joffre = end
P.event_heavy_artillery = end
P.event_haig = end
P.event_coordinated_tactics = end

// german permanent with no effect when played
P.event_chaos_in_the_rear = end
P.event_flamethrowers = end
P.event_offensive_stockpile = end

P.event_air_support = function () {
	if (G.active === P_GERMAN)
		G.air -= 1
	else
		G.air += 1
	if (G.air < 0)
		log("Air Superiority to " + (-G.air) + " German")
	else if (G.air > 0)
		log("Air Superiority to " + G.air + " French")
	else
		log("Air Superiority to 0")
	end()
}

P.event_propaganda = function () {
	add_side_vp(G.active, 2)
	end()
}

P.event_offensive_in_italy = function () {
	var die = (G.options & OPT_NO_DICE) ? 3 : roll_d6()
	log("W" + die)
	add_side_vp(G.active, 2 + die)
	end()
}

P.event_submarine_warfare = function () {
	log("US entry DRM +2")
	G.us_drm += 2
	G.active = P_FRENCH
	goto("submarine_warfare")
}

P.event_total_submarine_warfare = function () {
	log("US entry DRM +3")
	G.us_drm += 3
	G.active = P_FRENCH
	goto("total_submarine_warfare")
}

P.event_trenches = function () {
	log("Trenches")
	goto("trench_from_event", { n: 6 })
}

P.event_petain = function () {
	log("Trenches")
	goto("trench_from_event", { n: 3 })
}

P.event_castelnau = function () {
	log("Strategic")
	goto("strategic_movement")
}

P.event_voie_sacree = function () {
	for (var i = 0; i < 12; ++i)
		setup_unit(G.active, Z_FRENCH_EN_ROUTE)
	end()
}

P.event_they_shall_not_pass = script (`
	call draw_a_card
	eval {
		if (G.morale[P_FRENCH] < 10)
			log("%F10")
		G.morale[P_FRENCH] = 10
		for_each_unit(P_FRENCH, u => {
			set_unit_fresh(u)
		})
	}
`)

P.event_presidents_visit = P.event_kaisers_visit = P.event_kaisers_order = script (`
	call draw_a_card
	goto place_vp_marker
`)

P.draw_a_card = {
	_begin() {
		clear_undo()
		L.c = draw_card(G.active)
		log("Drew a card")
	},
	prompt() {
		prompt(`You drew "${cards[L.c].name}".`)
		button("next")
	},
	next() {
		end()
	},
}

P.place_vp_marker = {
	prompt() {
		prompt("Place a victory point marker in an enemy controlled zone.")
		for_each_zone(z => {
			if (is_enemy_controlled_zone(z))
				action_zone(z)
		})
		if (!V.actions.zone)
			button("skip")
	},
	zone(z) {
		push_undo()
		log("VP marker")
		log(">Z" + z)
		set_add(G.vps[G.active], z)
		end()
	},
	skip() {
		end()
	},
}

P.event_reinforcements_to_russia = function () {
	if (is_event_played(GE_REINFORCEMENTS_FROM_RUSSIA))
		discard_permanent(GE_REINFORCEMENTS_FROM_RUSSIA)
	end()
}

P.event_reinforcements_from_russia = function () {
	if (is_event_played(GE_REINFORCEMENTS_TO_RUSSIA))
		discard_permanent(GE_REINFORCEMENTS_TO_RUSSIA)
	end()
}

P.event_the_red_baron = function () {
	clear_undo()
	for (var c of french_air_superiority_cards) {
		if (is_card_in_hand(P_FRENCH, c)) {
			G.active = P_FRENCH
			goto("the_red_baron")
			return
		}
	}
	log("No air superiority card")
	end()
}

P.the_red_baron = {
	prompt() {
		prompt("The Red Baron: Discard one air superiority card.")
		for (var c of french_air_superiority_cards)
			if (is_card_in_hand(G.active, c))
				action_card(c)
		if (!V.actions.card)
			button("pass")
	},
	card(c) {
		push_undo()
		discard_hand(G.active, c)
		goto("the_red_baron_done")
	},
}

P.the_red_baron_done = {
	prompt() {
		prompt("The Red Baron: Done.")
		button("next")
	},
	next() {
		G.active = P_GERMAN
		end()
		auto_skip_end_round()
	},
}

P.event_bad_weather = function () {
	G.bad_weather = 2
	end()
}

P.event_nivelle = function () {
	G.nivelle = 1
	end()
}

P.discard_nivelle = {
	prompt() {
		prompt("Dicard Nivelle (did not use Barrage).")
		action_card(FE_NIVELLE)
	},
	card(c) {
		discard_permanent(c)
		end()
	},
}

P.joffre = {
	prompt() {
		prompt("Joffre: Lose one Front Morale point or discard Joffre.")
		action_card(FE_JOFFRE)
		action("morale", P_FRENCH)
	},
	card(c) {
		push_undo()
		discard_permanent(c)
		goto("joffre_done")
	},
	morale() {
		push_undo()
		log("-1 French morale (Joffre)")
		add_morale(P_FRENCH, -1)
		log_morale(P_FRENCH)
		goto("joffre_done")
	},
}

P.joffre_done = {
	prompt() {
		prompt("Joffre: Done.")
		button("next")
	},
	next() {
		clear_undo()
		end()
	},
}

P.hospitals = {
	prompt() {
		prompt("Hospitals: Gain 3 Front Morale points.")
		action("morale", P_FRENCH)
	},
	morale() {
		log("+3 French morale (Hospitals)")
		add_morale(P_FRENCH, 3)
		log_morale(P_FRENCH)
		end()
	},
}

P.submarine_warfare = {
	_begin() {
		L.n = Math.min(2, G.hand[G.active].length)
	},
	prompt() {
		prompt("Submarine warfare: Discard two cards.")
		for (var c of G.hand[G.active])
			action_card(c)
	},
	card(c) {
		push_undo()
		discard_hand(G.active, c)
		if (--L.n === 0)
			goto("submarine_warfare_done")
	},
}

P.submarine_warfare_done = {
	prompt() {
		prompt("Submarine warfare: Done.")
		button("next")
	},
	next() {
		clear_undo()
		G.active = P_GERMAN
		end()
	},
}

P.total_submarine_warfare = {
	_begin() {
		var hand = G.hand[G.active]
		L.n = Math.min(2, hand.length)
		L.i = random(hand.length)
	},
	prompt() {
		prompt("Total submarine warfare: Discard two cards at random.")
		action_card(G.hand[G.active][L.i])
	},
	card(c) {
		discard_hand(G.active, c)
		if (--L.n === 0)
			goto("total_submarine_warfare_done")
		else
			L.i = random(G.hand[G.active].length)
	},
}

P.total_submarine_warfare_done = {
	prompt() {
		prompt("Total submarine warfare: Done.")
		button("next")
	},
	next() {
		G.active = P_GERMAN
		end()
	},
}


/* EVENTS: ROLL ON TABLE */

// TODO: confirm or roll immediately?

function roll_on_table(name, table) {
	var d1 = (G.options & OPT_NO_DICE) ? 1 : roll_d6()
	var d2 = (G.options & OPT_NO_DICE) ? 6 : roll_d6()
	var sum = d1 + d2
	log(name + ":")
	log(`>W${d1} W${d2} = ${sum}`)
	return (sum <= 4) ? table[0] : (sum <= 9) ? table[1] : table[2]
}

P.event_offensive_in_russia = function () {
	var n = roll_on_table("Eastern offensive", [ 0, 5, 7 ])
	add_side_vp(G.active, n)
	end()
}

P.event_jutland = function () {
	clear_undo()
	G.active = P_FRENCH
	// TODO - don't leak info that we don't have it in hand?
	if (is_card_in_hand(G.active, FE_JELLICOE))
		goto("jellicoe")
	else
		roll_jutland()
}

P.jellicoe = {
	prompt() {
		if (is_card_in_hand(G.active, FE_JELLICOE)) {
			prompt("You may discard Jellicoe to neutralize Jutland event.")
			action_card(FE_JELLICOE)
		} else {
			prompt("You don't have Jellicoe to neutralize Jutland event.")
		}
		button("pass")
	},
	card(c) {
		push_undo()
		remove_hand(G.active, c)
		goto("jellicoe_done")
	},
	pass() {
		roll_jutland()
	},
}

P.jellicoe_done = {
	prompt() {
		prompt("Jutland neutralized by Jellicoe.")
		button("next")
	},
	next() {
		G.active = P_GERMAN
		end()
		auto_skip_end_round()
	},
}

function roll_jutland() {
	G.active = P_GERMAN
	var n = roll_on_table("Jutland naval battle", [ -5, 5, 10 ])
	add_side_vp(G.active, n)
	end()
}

P.event_rumanian_offensive = function () {
	var n = roll_on_table("Rumanian campaign", [ 0, 5, 7 ])
	add_side_vp(G.active, n)
	end()
}

P.event_brusilovs_offensive = function () {
	var n = roll_on_table("Russian offensive", [ 3, 9, 12 ])
	if (is_event_played(GE_REINFORCEMENTS_TO_RUSSIA)) {
		log(">C" + GE_REINFORCEMENTS_TO_RUSSIA + " (-3 VP)")
		add_side_vp(G.active, n - 3)
	} else if (is_event_played(GE_REINFORCEMENTS_FROM_RUSSIA)) {
		log(">C" + GE_REINFORCEMENTS_FROM_RUSSIA + " (x2)")
		add_side_vp(G.active, n * 2)
		discard_permanent(GE_REINFORCEMENTS_FROM_RUSSIA)
	} else {
		add_side_vp(G.active, n)
	}
	end()
}

P.event_somme_offensive = function () {
	var n = roll_on_table("Somme offensive", [ 2, 7, 9 ])
	add_side_vp(G.active, n)
	end()
}

P.event_us_diplomacy = {
	_begin() {
		L.drm = 0
	},
	prompt() {
		prompt("Roll on the US diplomacy table (you may discard for +2 DRM each).")

		// only discard if useful
		if (G.us_drm + L.drm + 2 < 8) {
			for (var c of G.hand[G.active])
				action_card(c)
		}

		button("roll")
	},
	card(c) {
		push_undo()
		discard_hand(G.active, c)
		L.drm += 2
	},
	roll() {
		clear_undo()
		log("US diplomacy table:")
		var d1 = (G.options & OPT_NO_DICE) ? 3 : roll_d6()
		var d2 = (G.options & OPT_NO_DICE) ? 3 : roll_d6()
		log(">W" + d1 + " W" + d2)
		log(">+" + L.drm + " for discards")
		log(">+" + G.us_drm + " submarine warfare")
		if (d1 + d2 + L.drm + G.us_drm <= 8) {
			log("No effect")
		} else {
			log("+1 US entry")
			G.us_entry += 1
		}
		end()
	},
}

/* EVENTS: USE AS BARRAGE */

function is_non_event_barrage() {
	return G.played.every(is_card_barrage)
}

P.event_gas_attack = function () {
	init_barrage(8)
	G.barrage.gas_attack = 1
	goto("barrage")
}

P.event_infiltration = function () {
	init_barrage(6)
	G.barrage.infiltrate = 1
	goto("barrage")
}

P.event_kronprinz = function () {
	init_barrage(14)
	goto("barrage")
}

P.event_falkenhayns_last_push = function () {
	init_barrage(14)
	goto("barrage")
}

P.event_lunar_landscape = function () {
	init_barrage(11)
	G.barrage.ignore_fortress = 1
	goto("barrage")
}

P.event_disarmed_fortress = function () {
	init_barrage(8)
	G.barrage.ignore_fortress = 1
	goto("barrage")
}

P.infiltrate = {
	_begin() {
		log_summary_begin()
	},
	_end() {
		log("Infiltrate")
		log_summary_end()
	},
	prompt() {
		prompt("Infiltrate: Attacking units may advance.")
		V.where = G.barrage.target
		for_each_unit_in_zone(G.active, G.barrage.target, action_unit)
		button("done")
	},
	unit(u) {
		push_undo()
		call("infiltrate_to", { who: u })
	},
	done() {
		push_undo()
		end()
	},
}

P.infiltrate_to = {
	prompt() {
		prompt("Infiltrate: Attacking units may advance.")
		var from = G.barrage.target
		V.where = from
		V.who = L.who
		for (var to of edges[from])
			if (!is_across_meuse(from, to) && !has_enemy_units(to))
				action_zone(to)
	},
	zone(z) {
		move_unit(L.who, z)
		end()
	},
}

/* EVENTS: RESPONSE */

P.response_offensive_stockpile = function() {
	if (G.active === P_GERMAN && is_non_event_barrage() && is_event_played(GE_OFFENSIVE_STOCKPILE))
		goto("offensive_stockpile")
	else
		end()
}

P.offensive_stockpile = {
	prompt() {
		prompt("You may discard Offensive Stockpile for +4 dice.")
		V.where = G.barrage.target
		if (G.active === P_GERMAN && is_non_event_barrage() && is_event_played(GE_OFFENSIVE_STOCKPILE))
			action_card(GE_OFFENSIVE_STOCKPILE)
		button("pass")
	},
	card(c) {
		if (c === GE_OFFENSIVE_STOCKPILE) {
			discard_permanent(GE_OFFENSIVE_STOCKPILE)
			log(">+4 dice")
			G.barrage.dice += 4
		}
		end()
	},
	pass() {
		end()
	},
}

P.response_mangin = function () {
	if (G.barrage.assault && !G.mangin && is_event_played(FE_MANGIN)) {
		goto("mangin")
	} else {
		end()
	}
}

P.mangin = {
	_begin() {
		L.active = G.active
		if (G.active !== P_FRENCH) {
			clear_undo()
			G.active = P_FRENCH
		}
	},
	prompt() {
		prompt("Mangin: Double infantry hits?")
		V.where = G.barrage.target
		button("double")
		button("pass")
	},
	double() {
		log("Used Mangin")
		G.barrage.mangin = 1
		G.mangin = 1
		G.active = L.active
		end()
	},
	pass() {
		G.active = L.active
		end()
	}
}

P.response_driant = function () {
	if (G.active === P_GERMAN && G.turn <= 2 && is_card_in_hand(P_FRENCH, FE_DRIANT) && G.barrage.hits > 0) {
		clear_undo()
		G.active = P_FRENCH
		goto("driant")
	} else {
		end()
	}
}

P.driant = {
	prompt() {
		prompt("Discard Driant to absorb two hits?")
		V.where = G.barrage.target
		action_card(FE_DRIANT)
		button("pass")
	},
	card(c) {
		push_undo()
		remove_hand(G.active, c)
		log(">-2 hits")
		G.barrage.hits = Math.max(0, G.barrage.hits - 2)
		goto("confirm_response")
	},
	pass() {
		G.active = P_GERMAN
		end()
	},
}

P.response_raynal = function () {
	if (G.active === P_GERMAN && G.turn >= 3 && G.turn <= 4 && is_card_in_hand(P_FRENCH, FE_RAYNAL)) {
		clear_undo()
		G.active = P_FRENCH
		goto("raynal")
	} else {
		end()
	}
}

P.raynal = {
	prompt() {
		prompt("Discard Raynal to absorb three hits?")
		V.where = G.barrage.target
		action_card(FE_RAYNAL)
		button("pass")
	},
	card(c) {
		push_undo()
		remove_hand(G.active, c)
		G.barrage.raynal = 1
		goto("confirm_response")
	},
	pass() {
		G.active = P_GERMAN
		end()
	},
}

P.response_unknown_heroes = function () {
	if (G.active === P_GERMAN && G.turn <= 2 && is_card_in_hand(P_FRENCH, FE_UNKNOWN_HEROES) && has_exhausted_units(P_FRENCH, G.barrage.target)) {
		clear_undo()
		G.active = P_FRENCH
		goto("unknown_heroes")
	} else {
		end()
	}
}

P.unknown_heroes = {
	prompt() {
		prompt("Discard Unknown Heroes to have each defending unit inflict three hits?")
		V.where = G.barrage.target
		action_card(FE_UNKNOWN_HEROES)
		button("pass")
	},
	card(c) {
		push_undo()
		remove_hand(G.active, c)
		G.barrage.unknown_heroes = 1
		goto("confirm_response")
	},
	pass() {
		G.active = P_GERMAN
		end()
	},
}

P.confirm_response = {
	prompt() {
		prompt("Response done.")
		button("next")
	},
	next() {
		G.active = 1-G.active
		end()
	},
}

/* SUPPLY */

const NORTH_EDGE = [ 0, 1, 2, 3, 4, 5, 6, 7 ]
const SOUTH_EDGE = [ 65, 66, 68, 70, 72, 73, 74, 75, 76, 78 ]

function search_supply(side) {
	if (side === P_GERMAN)
		return search_supply_german()
	else
		return search_supply_french()
}

function search_supply_german() {
	return search_supply_imp(is_german_zone, NORTH_EDGE)
}

function search_supply_french() {
	return search_supply_imp(is_french_zone, SOUTH_EDGE)
}

function search_supply_imp(pred, start) {
	var seen = start.slice()
	var queue = start.filter(pred)
	while (queue.length > 0) {
		var here = queue.shift()
		for (var next of edges[here]) {
			if (next > 78)
				continue
			if (set_has(seen, next))
				continue
			set_add(seen, next)
			if (pred(next)) {
				queue.push(next)
			}
		}
	}
	return seen
}

P.check_supply = function () {
	var supply = search_supply(G.active)
	var supplied = []
	var unsupplied = []
	var isolated = []
	for_each_zone(z => {
		if (has_friendly_units(z)) {
			if (set_has(supply, z)) {
				// back in supply
				if (map_has(G.oos[G.active], z))
					set_add(supplied, z)
			} else {
				// out of supply
				set_add(unsupplied, z)
			}
		} else {
			map_delete(G.oos[G.active], z)

			// empty friendly-controlled zones lose control through lack of supply
			if (is_controlled_zone(z) && !set_has(supply, z)) {
				set_add(isolated, z)
				set_zone_control(z, 1-G.active)
			}
		}
	})
	if (supplied.length + unsupplied.length + isolated.length > 0) {
		log("Supply")
		for (var z of isolated)
			log(">Z" + z + " isolated")
		if (supplied.length + unsupplied.length > 0)
			goto("apply_supply", { supplied, unsupplied })
		else
			end()
	} else {
		end()
	}
}

P.apply_supply = {
	prompt() {
		var z
		prompt("Supply check.")
		for (z of L.supplied)
			action_zone(z)
		for (z of L.unsupplied)
			action_zone(z)
	},
	zone(z) {
		if (set_has(L.supplied, z)) {
			log(">Z" + z + " restored")
			set_delete(L.supplied, z)
			map_delete(G.oos[G.active], z)
			this._resume()
		} else {
			set_delete(L.unsupplied, z)
			var level = map_get(G.oos[G.active], z, 0)
			if (level === 0) {
				log(">Z" + z + " to L1")
				map_set(G.oos[G.active], z, 1)
				this._resume()
			} else if (level === 1) {
				log(">Z" + z + " to L2")
				map_set(G.oos[G.active], z, 2)
				if (has_fresh_units(G.active, z)) {
					call("supply_exhaust", { z })
				} else {
					this._resume()
				}
			} else if (level === 2) {
				log(">Z" + z + " eliminated")
				map_delete(G.oos[G.active], z)
				call("supply_eliminate", { z })
			}
		}
	},
	_resume() {
		if (L.supplied.length + L.unsupplied.length === 0)
			end()
	},
}

P.supply_exhaust = {
	prompt() {
		prompt("Exhaust unsupplied units.")
		for_each_unit_in_zone(G.active, L.z, u => {
			if (is_unit_fresh(u))
				action_unit(u)
		})
	},
	unit(u) {
		set_unit_exhausted(u)
		if (!has_fresh_units(G.active, L.z))
			end()
	},
}

P.supply_eliminate = {
	prompt() {
		prompt("Eliminate unsupplied units.")
		for_each_unit_in_zone(G.active, L.z, u => {
			action_unit(u)
		})
	},
	unit(u) {
		eliminate_unit(u)
		log_morale(G.active)
		if (!has_units(G.active, L.z)) {
			set_zone_control(L.z, 1-G.active)
			end()
		}
	},
}

/* SETUP */

P.setup_units = {
	prompt() {
		prompt("Deploy " + L.n + " units.")
		for_each_zone(z => {
			if ((is_controlled_zone(z) || z === L.zz) && count_units(G.active, z) < 3)
				action_zone(z)
		})
	},
	zone(z) {
		push_undo()
		setup_unit(G.active, z)
		if (--L.n === 0)
			end()
	},
}

P.setup_exhaust = {
	prompt() {
		prompt("Exhaust " + L.n + " units.")
		for_each_unit(G.active, u => {
			if (is_unit_fresh(u) && get_unit_zone(u) <= last_zone)
				action_unit(u)
		})
	},
	unit(u) {
		push_undo()
		set_unit_exhausted(u)
		if (--L.n === 0)
			end()
	},
}

P.setup_trenches = {
	prompt() {
		prompt(`Deploy ${L.n} trenches.`)
		for (var z = 0; z <= last_zone; ++z)
			if (is_controlled_zone(z) && !has_trench(G.active, z))
				action_zone(z)
	},
	zone(z) {
		push_undo()
		place_trench(G.active, z)
		if (--L.n === 0)
			end()
	},
}

P.setup_done = {
	prompt() {
		prompt("Setup done.")
		button("done")
	},
	done() {
		clear_undo()
		end()
	},
}

function construct_decks() {
	var c

	G.draw = [ [], [] ]

	for (c = 1; c <= 51; ++c)
		if (is_card_active_this_turn(c) && !set_has(G.removed, c) && !set_has(G.permanent, c) && !is_card_in_hand(P_FRENCH, c))
			G.draw[P_FRENCH].push(c)

	for (c = 52; c <= 100; ++c)
		if (is_card_active_this_turn(c) && !set_has(G.removed, c) && !set_has(G.permanent, c) && !is_card_in_hand(P_GERMAN, c))
			G.draw[P_GERMAN].push(c)
}

function draw_card(side) {
	var i = random(G.draw[side].length)
	var c = G.draw[side][i]
	array_delete(G.draw[side], i)
	G.hand[side].push(c)
	return c
}

function place_trench(side, z) {
	G.trenches[find_free_trench(side)] = z
}

function remove_trench(side, z) {
	G.trenches[find_trench(side, z)] = Z_TRENCHES[side]
}

function setup_unit(side, z) {
	set_unit_zone(find_free_unit(side), z)
}

function setup_units(side, trenches, n, zones) {
	for (var z of zones) {
		set_zone_control(z, side)
		if (trenches)
			place_trench(side, z)
		for (var i = 0; i < n; ++i)
			setup_unit(side, z)
	}
}

function setup_scenario_1() {
	log("#Operation Gericht")
	log("The German assault on Verdun (February to April 1916)")

	for (var z = 0; z <= 78; ++z)
		set_zone_control(z, P_FRENCH)
	set_zone_control(2, P_GERMAN)
	set_zone_control(7, P_GERMAN)
	set_zone_control(8, P_GERMAN)

	setup_units(P_GERMAN, true, 3, [ 3, 4, 5, 6, 18, 28 ])
	setup_units(P_GERMAN, true, 2, [ 9, 0, 1, 11, 12 ])
	setup_units(P_FRENCH, true, 1, [ 29, 19, 10, 20, 21, 22, 13, 14, 15, 16, 17, 27, 40 ])
	setup_units(P_FRENCH, false, 3, [ Z_FRENCH_RESERVE ])

	G.hand[P_GERMAN] = [ GE_CHAOS_IN_THE_REAR, GE_BARRAGE_6 ]
	G.hand[P_FRENCH] = [ FE_DRIANT, FE_CASTELNAU ]

	set_add(G.removed, FE_OFFENSIVE_IN_ITALY)

	construct_decks()

	while (G.hand[P_GERMAN].length < 10)
		draw_card(P_GERMAN)
	while (G.hand[P_FRENCH].length < 8)
		draw_card(P_FRENCH)

	G.last = 2

	call("s1")
}

const s2_german_zones = [
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
	33, 37, 38, 39, 40, 48, 49, 50,
	29, 30, 31, 32, 34, 35, 36, 46, 60, 47, 63, 64, 78
]

const s2_german_front = [
	29, 30, 31, 32, 34, 35, 36, 46, 60, 47, 63, 64, 78
]

const s2_french_front = [
	41, 42, 43, 44, 45, 58, 59, 61, 62, 77, 76, 46
]

function setup_scenario_2() {
	var z

	log("#The French counter-offensive")
	log("(September-December 1916)")

	for (z = 0; z <= 78; ++z)
		set_zone_control(z, P_FRENCH)
	for (z of s2_german_zones)
		set_zone_control(z, P_GERMAN)

	setup_units(P_GERMAN, false, 3, [ Z_GERMAN_RESERVE ])

	// TODO - pre-deploy along front line
	// setup_units(P_GERMAN, true, 1, s2_german_front)
	// setup_units(P_FRENCH, true, 1, s2_french_front)

	set_add(G.permanent, FE_JOFFRE)
	set_add(G.permanent, FE_HAIG)
	set_add(G.permanent, FE_NIVELLE)
	set_add(G.permanent, FE_MANGIN)

	set_add(G.removed, FE_OFFENSIVE_IN_ITALY)
	set_add(G.removed, FE_JELLICOE)

	G.hand[P_GERMAN] = []
	G.hand[P_FRENCH] = []

	G.us_drm = 2
	G.vp = 24

	construct_decks()

	call("s2")
}

function setup_scenario_3() {
	log("#Verdun 1916, Steel Inferno")
	log("The full campaign game")

	for (var z = 0; z <= 78; ++z)
		set_zone_control(z, P_FRENCH)
	set_zone_control(2, P_GERMAN)
	set_zone_control(7, P_GERMAN)
	set_zone_control(8, P_GERMAN)

	setup_units(P_GERMAN, true, 3, [ 3, 4, 5, 6, 18, 28 ])
	setup_units(P_GERMAN, true, 2, [ 9, 0, 1, 11, 12 ])
	setup_units(P_FRENCH, true, 1, [ 29, 19, 10, 20, 21, 22, 13, 14, 15, 16, 17, 27, 40 ])
	setup_units(P_FRENCH, false, 3, [ Z_FRENCH_RESERVE ])

	G.hand[P_GERMAN] = [ GE_CHAOS_IN_THE_REAR, GE_BARRAGE_6 ]
	G.hand[P_FRENCH] = [ FE_DRIANT, FE_CASTELNAU ]

	construct_decks()

	while (G.hand[P_GERMAN].length < 10)
		draw_card(P_GERMAN)
	while (G.hand[P_FRENCH].length < 8)
		draw_card(P_FRENCH)

	call("s3")
}

/* HOOKS */

function on_setup(scenario, options) {
	var i

	G.scenario = parseInt(scenario)

	G.options = 0
	if (options.no_dice) {
		log("- No dice for VP events")
		G.options |= OPT_NO_DICE
	}
	if (options.optional_german_cards) {
		log("- Optional German cards")
		G.options |= OPT_GERMAN_CARDS
	}
	if (options.optional_french_cards) {
		log("- Optional French cards")
		G.options |= OPT_FRENCH_CARDS
	}

	G.turn = 1
	G.last = 6
	G.month = 1
	G.round = 0
	G.vp = 0
	G.air = 0
	G.us_entry = 0
	G.us_drm = 0
	G.morale = [ 10, 10 ]

	G.played = [] // events in order of play
	G.permanent = [] // played permanent events (both sides)
	G.removed = [] // removed one-time events (both sides)
	G.hand = [ [], [] ]

	G.control = [ 0, 0, 0 ]
	G.units = new Array(120).fill(0)
	G.trenches = new Array(40).fill(0)
	G.vps = [ [], [] ]
	G.oos = [ [], [] ]
	G.moved = []
	G.tm = 0
	G.take_control = []

	for (i = 0; i < 20; ++i) G.trenches[i] = Z_GERMAN_TRENCHES
	for (i = 20; i < 40; ++i) G.trenches[i] = Z_FRENCH_TRENCHES
	for (i = 0; i < 60; ++i) G.units[i] = Z_GERMAN_POOL
	for (i = 60; i < 120; ++i) G.units[i] = Z_FRENCH_POOL

	for (i = 0; i <= 86; ++i)
		set_zone_control(i, P_FRENCH)

	set_zone_control(Z_GERMAN_RESERVE, P_GERMAN)
	set_zone_control(Z_GERMAN_EN_ROUTE, P_GERMAN)
	set_zone_control(Z_GERMAN_TRENCHES, P_GERMAN)
	set_zone_control(Z_GERMAN_POOL, P_GERMAN)

	set_zone_control(Z_FRENCH_RESERVE, P_FRENCH)
	set_zone_control(Z_FRENCH_EN_ROUTE, P_FRENCH)
	set_zone_control(Z_FRENCH_TRENCHES, P_FRENCH)
	set_zone_control(Z_FRENCH_POOL, P_FRENCH)

	switch (parseInt(scenario)) {
	case 1: return setup_scenario_1()
	case 2: return setup_scenario_2()
	case 3: return setup_scenario_3()
	}
}

function on_view() {
	V.turn = G.turn
	V.month = G.month
	V.round = G.round
	V.vp = G.vp
	V.air = G.air
	V.us_entry = G.us_entry
	V.us_drm = G.us_drm
	V.morale = G.morale

	V.played = G.played
	V.permanent = G.permanent

	V.control = G.control
	V.units = G.units
	V.trenches = G.trenches
	V.vps = G.vps
	V.exhausted = G.exhausted
	V.oos = G.oos

	if (G.barrage) {
		if (G.barrage2)
			V.barrage = [ G.barrage.target, G.barrage2.target ]
		else
			V.barrage = [ G.barrage.target ]
	}

	if (R === P_FRENCH)
		V.hand = [ G.hand[P_GERMAN].length, G.hand[P_FRENCH] ]
	else if (R === P_GERMAN)
		V.hand = [ G.hand[P_GERMAN], G.hand[P_FRENCH].length ]
	else
		V.hand = [ G.hand[P_GERMAN].length, G.hand[P_FRENCH].length ]
}

function action_card(c) {
	action("card", c)
}

function action_zone(s) {
	action("zone", s)
}

function action_unit(p) {
	action("unit", p)
}

function action_number(x) {
	action("number", x)
}

function action_number_range(a, b) {
	for (var x = a; x <= b; ++x)
		action("number", x)
}

/* FRAMEWORK */

/*
"use strict"
const ROLES = []
const SCENARIOS = []
var G, L, R, V, P = {}
function on_setup(scenario, options) {}
function on_view() {}
function on_query(q) {}
function on_assert() {}
*/

function log(s) {
	if (s === undefined) {
		if (G.log.length > 0 && G.log[G.log.length - 1] !== "")
			G.log.push("")
	} else {
		G.log.push(s)
	}
}

function prompt(s) {
	V.prompt = s
}

function button(action, enabled = true) {
	V.actions[action] = !!enabled | 0
}

function action(action, argument) {
	if (!(action in V.actions))
		V.actions[action] = []
	set_add(V.actions[action], argument)
}

function finish(result, message) {
	G.active = -1
	G.result = ROLES[result] ?? result
	G.L = L = { message }
	log()
	log(message)
}

function call_or_goto(pred, name, env) {
	if (pred)
		call(name, env)
	else
		goto(name, env)
}

function call(name, env) {
	G.L = L = { ...env, P: name, I: 0, L: L }
	P[name]?._begin?.()
}

function goto(name, env) {
	P[L.P]?._end?.()
	G.L = L = { ...env, P: name, I: 0, L: L.L }
	P[name]?._begin?.()
}

function end(result) {
	P[L.P]?._end?.()
	G.L = L = L.L
	if (result !== undefined)
		L.$ = result
	P[L.P]?._resume?.()
}

exports.roles ??= ROLES

exports.scenarios ??= (typeof SCENARIOS !== "undefined") ? SCENARIOS : [ "Standard" ]

exports.setup = function (seed, scenario, options) {
	G = {
		active: null,
		seed,
		log: [],
		undo: [],
	}
	L = null
	R = null
	V = null

	on_setup(scenario, options)
	_run()
	_save()

	return G
}

exports.view = function (state, role) {
	G = state
	L = G.L
	R = role
	V = {
		log: G.log,
		prompt: null,
	}

	if ((Array.isArray(G.active) && G.active.includes(R)) || G.active === R) {
		_load()
		on_view()

		V.actions = {}

		if (P[L.P])
			P[L.P].prompt()
		else
			V.prompt = "TODO: " + L.P

		if (V.actions.undo === undefined)
			button("undo", G.undo?.length > 0)

		_save()
	} else {
		_load()
		on_view()
		_save()

		if (G.active === "None") {
			V.prompt = L.message
		} else {
			var inactive = P[L.P]?.inactive
			if (inactive) {
				if (Array.isArray(G.active))
					V.prompt = `Waiting for ${G.active.join(" and ")} to ${inactive}.`
				else
					V.prompt = `Waiting for ${G.active} to ${inactive}.`
			} else {
				if (Array.isArray(G.active))
					V.prompt = `Waiting for ${G.active.join(" and ")}.`
				else
					V.prompt = `Waiting for ${G.active}.`
			}
		}
	}

	return V
}

exports.action = function (state, role, action, argument) {
	G = state
	L = G.L
	R = role
	V = null

	var old_active = G.active

	_load()

	var this_state = P[L.P]
	if (this_state && typeof this_state[action] === "function") {
		this_state[action](argument)
		_run()
	} else if (action === "undo" && G.undo.length > 0) {
		pop_undo()
	} else {
		throw new Error("Invalid action: " + action)
	}

	_save()

	if (old_active !== G.active)
		clear_undo()

	return G
}

exports.finish = function (state, result, message) {
	G = state
	L = G.L
	R = null
	V = null

	_load()
	finish(result, message)
	_save()

	return G
}

exports.query = function (state, role, q) {
	G = state
	L = G.L
	R = role
	V = null

	_load()
	var result = on_query(q)
	_save()

	return result
}

exports.assert = function (state) {
	if (typeof on_assert === "function") {
		G = state
		L = G.L
		R = null
		V = null
		_load()
		on_assert()
		_save()
	}
}

function _load() {
	R = ROLES.indexOf(R)
	if (Array.isArray(G.active))
		G.active = G.active.map(r => ROLES.indexOf(r))
	else
		G.active = ROLES.indexOf(G.active)
}

function _save() {
	if (Array.isArray(G.active))
		G.active = G.active.map(r => ROLES[r])
	else
		G.active = ROLES[G.active] ?? "None"
}

function _run() {
	for (var i = 0; i < 1000 && L; ++i) {
		var prog = P[L.P]
		if (typeof prog === "function") {
			prog()
		} else if (Array.isArray(prog)) {
			if (L.I < prog.length) {
				try {
					prog[L.I++]()
				} catch (err) {
					err.message += "\n\tat P." + L.P + ":" + L.I
					throw err
				}
			} else {
				end()
			}
		} else {
			return // state
		}
	}
	if (L)
		throw new Error("runaway script")
}

function _parse(text) {
	var prog = []

	function lex(s) {
		var words = []
		var p = 0, n = s.length, m

		function lex_flush() {
			if (words.length > 0) {
				command(words)
				words = []
			}
		}

		function lex_newline() {
			while (p < n && s[p] === "\n")
				++p
			lex_flush()
		}

		function lex_semi() {
			++p
			lex_flush()
		}

		function lex_comment() {
			while (p < n && s[p] !== "\n")
				++p
		}

		function lex_word() {
			while (p < n && !" \t\n".includes(s[p]))
				++p
			words.push(s.substring(m, p))
		}

		function lex_qstring(q) {
			var x = 1
			++p
			while (p < n && x > 0) {
				if (s[p] === q)
					--x
				++p
			}
			if (p >= n && x > 0)
				throw new Error("unterminated string")
			words.push(s.substring(m, p))
		}

		function lex_bstring(a, b) {
			var x = 1
			++p
			while (p < n && x > 0) {
				if (s[p] === a)
					++x
				else if (s[p] === b)
					--x
				++p
			}
			if (p >= n && x > 0)
				throw new Error("unterminated string")
			words.push(s.substring(m, p))
		}

		while (p < n) {
			while (s[p] === " " || s[p] === "\t")
				++p
			if (p >= n) break
			m = p
			if (s[p] === "{") lex_bstring("{", "}")
			else if (s[p] === "[") lex_bstring("[", "]")
			else if (s[p] === "(") lex_bstring("(", ")")
			else if (s[p] === '"') lex_qstring('"')
			else if (s[p] === "\n") lex_newline()
			else if (s[p] === ";") lex_semi()
			else if (s[p] === "#") lex_comment()
			else if (s[p] === "/" && s[p+1] === "/") lex_comment()
			else if (s[p] === "-" && s[p+1] === "-") lex_comment()
			else lex_word()
		}

		if (words.length > 0)
			command(words)
	}

	function command(line) {
		var ix_loop, ix1, ix2
		var i, k, start, end, array, body

		switch (line[0]) {
		case "set":
			if (line.length !== 3)
				throw new Error("invalid set - " + line.join(" "))
			emit(line[1] + " = " + line[2])
			break

		case "incr":
			if (line.length !== 2)
				throw new Error("invalid incr - " + line.join(" "))
			emit("++(" + line[1] + ")")
			break

		case "decr":
			if (line.length !== 2)
				throw new Error("invalid decr - " + line.join(" "))
			emit("--(" + line[1] + ")")
			break

		case "eval":
			emit(line.slice(1).join(" "))
			break

		case "log":
			emit("log(" + line.slice(1).join(" ") + ")")
			break

		case "call":
			if (line.length === 3)
				emit("call(" + quote(line[1]) + ", " + line[2] + ")")
			else if (line.length === 2)
				emit("call(" + quote(line[1]) + ")")
			else
				throw new Error("invalid call - " + line.join(" "))
			break

		case "goto":
			if (line.length === 3)
				emit("goto(" + quote(line[1]) + ", " + line[2] + ")")
			else if (line.length === 2)
				emit("goto(" + quote(line[1]) + ")")
			else
				throw new Error("invalid goto - " + line.join(" "))
			break

		case "return":
			if (line.length === 1)
				emit(`end()`)
			else if (line.length === 2)
				emit(`end(${line[1]})`)
			else
				throw new Error("invalid return - " + line.join(" "))
			break

		case "while":
			// while (exp) { block }
			if (line.length !== 3)
				throw new Error("invalid while - " + line.join(" "))
			ix_loop = emit_jz(line[1])
			block(line[2])
			emit_jump(ix_loop)
			label(ix_loop)
			break

		case "for":
			// for i in (start) to (end) { block }
			if (line.length === 7 && line[2] === "in" && line[4] === "to") {
				i = line[1]
				start = line[3]
				end = line[5]
				body = line[6]
				emit(`${i} = ${start}`)
				ix_loop = prog.length
				block(body)
				emit(`if (++(${i}) <= ${end}) L.I = ${ix_loop}`)
				return
			}
			// for i in (array) { block }
			// NOTE: array is evaluated repeatedly so should be a constant!
			else if (line.length === 5 && line[2] === "in") {
				k = line[1]
				i = k.replace(/^G\./, "L.G_") + "_"
				array = line[3]
				body = line[4]
				emit(`${i} = 0`)
				ix_loop = emit(`if (${i} < ${array}.length) { ${k} = ${array}[${i}++] } else { delete ${i} ; L.I = % }`)
				block(body)
				emit_jump(ix_loop)
				label(ix_loop)
			} else {
				throw new Error("invalid for - " + line.join(" "))
			}
			break

		case "if":
			// if (exp) { block}
			// if (exp) { block } else { block }
			// TODO: if (exp) { block } elseif (exp) { block } else { block }
			ix1, ix2
			if (line.length === 3) {
				ix1 = emit_jz(line[1])
				block(line[2])
				label(ix1)
			} else if (line.length === 5 && line[3] === "else") {
				ix1 = emit_jz(line[1])
				block(line[2])
				ix2 = emit_jump()
				label(ix1)
				block(line[4])
				label(ix2)
			} else {
				throw new Error("invalid if - " + line.join(" "))
			}
			break

		default:
			throw new Error("unknown command - " + line.join(" "))
		}
	}

	function quote(s) {
		if ("{[(`'\"".includes(s[0]))
			return s
		return '"' + s + '"'
	}

	function emit_jz(exp, to = "%") {
		return emit("if (!(" + exp + ")) L.I = " + to)
	}

	function emit_jump(to = "%") {
		return emit("L.I = " + to)
	}

	function emit(s) {
		prog.push(s)
		return prog.length - 1
	}

	function label(ix) {
		prog[ix] = prog[ix].replace("%", prog.length)
	}

	function block(body) {
		if (body[0] !== "{")
			throw new Error("expected block")
		lex(body.slice(1, -1))
	}

	lex(text)

	return prog
}

function script (text) {
	return text
}

(function _compile() {
	var cache = {}
	for (var name in P) {
		if (typeof P[name] === "string") {
			var prog = []
			try {
				for (var inst of _parse(P[name])) {
					try {
						prog.push(cache[inst] ??= eval("(function(){" + inst + "})"))
					} catch (err) {
						err.message += "\n\tat (" + inst + ")"
						throw err
					}
				}
			} catch (err) {
				err.message += "\n\tat P." + name
				throw err
			}
			P[name] = prog
		}
	}
})()

/* LIBRARY */

function clear_undo() {
	if (G.undo) {
		G.undo.length = 0
	}
}

function push_undo() {
	var copy, k, v
	if (G.undo) {
		copy = {}
		for (k in G) {
			v = G[k]
			if (k === "undo")
				continue
			else if (k === "log")
				v = v.length
			else if (typeof v === "object" && v !== null)
				v = object_copy(v)
			copy[k] = v
		}
		G.undo.push(copy)
	}
}

function pop_undo() {
	if (G.undo) {
		var save_log = G.log
		var save_undo = G.undo
		G = save_undo.pop()
		save_log.length = G.log
		G.log = save_log
		G.undo = save_undo
	}
}

function random(range) {
	// An MLCG using integer arithmetic with doubles.
	// https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf
	// m = 2**35 − 31
	return (G.seed = G.seed * 200105 % 34359738337) % range
}

// Fast deep copy for objects without cycles
function object_copy(original) {
	var copy, i, n, v
	if (Array.isArray(original)) {
		n = original.length
		copy = new Array(n)
		for (i = 0; i < n; ++i) {
			v = original[i]
			if (typeof v === "object" && v !== null)
				copy[i] = object_copy(v)
			else
				copy[i] = v
		}
		return copy
	} else {
		copy = {}
		for (i in original) {
			v = original[i]
			if (typeof v === "object" && v !== null)
				copy[i] = object_copy(v)
			else
				copy[i] = v
		}
		return copy
	}
}

// Array remove and insert (faster than splice)

function array_delete(array, index) {
	var i, n = array.length
	for (i = index + 1; i < n; ++i)
		array[i - 1] = array[i]
	array.length = n - 1
}

function array_delete_item(array, item) {
	var i, n = array.length
	for (i = 0; i < n; ++i)
		if (array[i] === item)
			return array_delete(array, i)
}

function array_insert(array, index, item) {
	for (var i = array.length; i > index; --i)
		array[i] = array[i - 1]
	array[index] = item
}

function array_delete_pair(array, index) {
	var i, n = array.length
	for (i = index + 2; i < n; ++i)
		array[i - 2] = array[i]
	array.length = n - 2
}

function array_insert_pair(array, index, key, value) {
	for (var i = array.length; i > index; i -= 2) {
		array[i] = array[i-2]
		array[i+1] = array[i-1]
	}
	array[index] = key
	array[index+1] = value
}

// Set as plain sorted array

function set_clear(set) {
	set.length = 0
}

function set_has(set, item) {
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

function set_add(set, item) {
	var a = 0
	var b = set.length - 1
	// optimize fast case of appending items in order
	if (item > set[b]) {
		set.push(item)
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

// Map as plain sorted array of key/value pairs

function map_has(map, key) {
	var a = 0
	var b = (map.length >> 1) - 1
	while (a <= b) {
		var m = (a + b) >> 1
		var x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return true
	}
	return false
}

function map_get(map, key, missing) {
	var a = 0
	var b = (map.length >> 1) - 1
	while (a <= b) {
		var m = (a + b) >> 1
		var x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return map[(m<<1)+1]
	}
	return missing
}

function map_set(map, key, value) {
	var a = 0
	var b = (map.length >> 1) - 1
	while (a <= b) {
		var m = (a + b) >> 1
		var x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else {
			map[(m<<1)+1] = value
			return
		}
	}
	array_insert_pair(map, a<<1, key, value)
}

function map_delete(map, key) {
	var a = 0
	var b = (map.length >> 1) - 1
	while (a <= b) {
		var m = (a + b) >> 1
		var x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else {
			array_delete_pair(map, m<<1)
			return
		}
	}
}

function map_get_set(map, key) {
	var set = map_get(map, key, null)
	if (set === null)
		map_set(map, key, (set = []))
	return set
}

function map_for_each(map, f) {
	for (var i = 0; i < map.length; i += 2)
		f(map[i], map[i+1])
}
