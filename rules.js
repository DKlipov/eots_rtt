"use strict"

var G, L, R, V, P = {}

const ROLES = ["Japan", "Alies"]

const SCENARIOS = [
    "1942",
]

exports.default_scenario = "1942"

const P_GERMAN = 0
const P_FRENCH = 1

const JP = 0
const AP = 1

const {pieces, cards, edges} = require("./data.js")

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

const Z_RESERVE = [Z_GERMAN_RESERVE, Z_FRENCH_RESERVE]
const Z_EN_ROUTE = [Z_GERMAN_EN_ROUTE, Z_FRENCH_EN_ROUTE]
const Z_TRENCHES = [Z_GERMAN_TRENCHES, Z_FRENCH_TRENCHES]
const Z_POOL = [Z_GERMAN_POOL, Z_FRENCH_POOL]

const all_hill_zones = [14, 16, 17, 18, 23, 24, 25, 26, 29, 30, 31, 32, 33, 35, 37, 38, 42, 43, 46, 51, 53, 77]
const all_fortress_zones = [38, 45, 46, 48, 56, 57, 59, 61, 62, 68, 69, 70, 71, 72, 74, 76, 77]
const map_german_vp = [38, 1, 59, 1, 61, 1, 65, 1, 66, 1, 68, 1, 70, 1, 72, 1, 74, 1]
const map_french_vp = [0, 2, 1, 2, 2, 2, 3, 2, 4, 2, 5, 2, 6, 2, 7, 2, 38, 3]
const all_one_star = [68, 70, 72, 74]
const all_two_star = [71]

const first_unit = [0, 60]
const last_unit = [59, 119]

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

const french_air_superiority_cards = [FE_AIR_SUPPORT_1, FE_AIR_SUPPORT_2]


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


function is_german_zone(z) {
    return get_zone_control(z) === P_GERMAN
}


function count_units(side, z) {
    var n = 0
    for (var u = first_unit[side]; u <= last_unit[side]; ++u)
        if (is_unit_in_zone(u, z))
            ++n
    return n
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
}

function move_unit(u, to) {
    log_summary(from, to)

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

P.strategic_phase = script(`
    log ("Turn " + G.turn + ", Strategic phase")
    call reinforcement_segment
    call replacement_segment
    call strategic_warfare
    call deal_cards
    goto offensive_phase
`)

P.reinforcement_segment = function () {
    log("Reinforcements skipped")
    end()
}

P.replacement_segment = function () {
    log("Replacements skipped")
    end()
}

function submarine_success() {
    log("Successful submarine attack")
    G.strategic_warfare[0] = 1
    if (G.amph_points[JP] > 1) {
        G.amph_points[JP] -= 1
        log("Japan amphibious shipping points reduced to: " + G.amph_points[JP])
    }
}

P.strategic_warfare = {
    _begin() {
        G.strategic_warfare = [0, 0]
        G.active = AP
    },
    prompt() {
        prompt("Roll for a submarine warfare.")
        button("roll")
    },
    roll() {
        let result = random(10)
        if (G.turn <= 4) {
            result += 2
        }
        if (result - G.turn <= 0) {
            submarine_success()
        }
        end()
    },
}

P.deal_cards = function () {
    let ap_cards = 4
    G.passes[AP] = 0
    if (G.turn === 2) {
        ap_cards = 2
        G.passes[AP] = 2
    } else if (G.turn === 3) {
        ap_cards = 3
        G.passes[AP] = 1
    }
    log("Allied draw " + ap_cards + ", " + G.passes[AP] + " passes")
    for (let i = 0; i < ap_cards; i++) {
        draw_card(AP)
    }
    let jp_cards = 4
    G.passes[JP] = 1
    jp_cards -= G.strategic_warfare[0]
    jp_cards -= G.strategic_warfare[1]
    log("Japan draw " + jp_cards + ", " + G.passes[JP] + " passes")
    for (let i = 0; i < jp_cards; i++) {
        draw_card(JP)
    }
    end()
}

P.offensive_phase = script(`
    log ("Offensives phase")
    eval {console.log("Offensives phase")}
    call initiative_segment
    while (G.hand[AP].length > 0 || G.hand[JP].length > 0) {
        if (G.hand[G.active].length > 0){
            call offensive_segment
        }
        set G.active (1 - G.active)
    }
    goto political_phase
`)

P.initiative_segment = function () {
    if (G.hand[AP].length > G.hand[JP].length) {
        G.active = AP
    }
    if (G.hand[JP].length > G.hand[AP].length) {
        G.active = JP
    } else {
        G.active = G.turn <= 4 ? 0 : 1
    }

    if (G.hand[JP].length !== G.hand[AP].length) {
        G.active = 1 - G.active
        call('future_offensive')
    }
    end()
}

P.future_offensive = {
    _begin() {
        if (G.future_offensive[(1 - G.active)][1] <= 0) {
            end()
        }
        G.active = 1 - G.active
    },
    prompt() {
        prompt("Play future offensive card or pass.")
        button("pass")
        action_card(G.future_offensive[R][1])
    },
    card() {
        push_undo()
        let card = G.future_offensive[R][1]
        G.future_offensive[R] = [0, 0]
        goto("play_event", {card: card})
    },
    pass() {
        G.active = 1 - G.active
        end()
    }
}

P.offensive_segment = {
    _begin() {

    },
    prompt() {
        prompt("Turn " + G.turn + " Take one action.")
        if (G.passes[R] > 0) {
            button("pass")
        }
        for (let i = 0; i < G.hand[R].length; i++) {
            action_card(G.hand[R][i])
        }
        if (G.future_offensive[R][0] < G.turn) {
            action_card(G.future_offensive[R][1])
        }
    },
    card(c) {
        push_undo()
        G.offensive.active_card = c
        G.offensive.attacker = R
        goto("choose_action", {c})
    },
    pass() {
        G.passes[R] -= 1
        end()
    }
}

P.choose_action = {
    _begin() {

    },
    prompt() {
        let card = cards[L.c]
        prompt(card.name + ". Choose action.")
        button("event")
        button("ops")
        if (card.ops >= 3) {
            button("inter_service")
            button("infrastructure")
            if (R === JP) {
                button("china_offensive")
            }
        }
    },
    ops() {
        push_undo()
        goto("offensive_sequence")
    },
    event() {
        push_undo()
    },
    inter_service() {
    },
    infrastructure() {
    },
    china_offensive() {
    },
    pass() {
        G.passes[R] -= 1
        end()
    }
}

P.choose_hq = {
    prompt() {
        prompt(cards[G.offensive.active_card].name + ". Choose HQ.")
        for (let i = 1; i < pieces.length; i++) {
            let piece = pieces[i]
            let faction = R === AP ? "ap" : "jp"
            if (piece.faction === faction && piece.class === "hq") {
                action_unit(i)
            }
        }
    },
    unit(u) {
        push_undo()
        G.offensive.active_hq.push(u)
        end()
    },
}

function get_distance(first_hex, second_hex) {
    return 1
}

P.activate_units = {
    _begin() {
        L.hq_bonus = pieces[G.offensive.active_hq[0]].cm
    },
    prompt() {
        prompt(`${cards[G.offensive.active_card].name}. Activate units ${G.offensive.logistic} + ${L.hq_bonus} / ${G.offensive.active_units.length}.`)
        for (let i = 1; i < pieces.length; i++) {
            let piece = pieces[i]
            let faction = R === AP ? "ap" : "jp"
            let hq = G.offensive.active_hq[0]
            if (piece.faction === faction && get_distance(G.location[hq], G.location[i]) <= pieces[hq].cr) {
                action_unit(i)
            }
        }
        button("pass")
    },
    unit(u) {
        push_undo()
        set_add(G.offensive.active_units, u)
        if (G.offensive.active_units.length >= (G.offensive.logistic + L.hq_bonus)) {
            end()
        }
    },
    pass(){
        push_undo()
        end()
    }
}

// call("move_offensive_units")
// call("declare_battle_hexes")
// call("special_reaction")
// call("change_intelligence_condition")
// call("choose_reaction_hq")
// call("activate_units")
// call("move_reaction_units")
// call("resolve_battles")
// call("post_battle_movement")
// call("emergency_movement")
P.offensive_sequence = script(`
    set G.offensive.logistic cards[G.offensive.active_card].ops
    call choose_hq
    call activate_units
    call move_offensive_units
    eval {
        console.log("end activation")
        set_add(G.discard[G.offensive.attacker], G.offensive.active_card)
        array_delete_item(G.hand[G.offensive.attacker], G.offensive.active_card)
        G.active = G.offensive.attacker
        reset_offensive()
    }
    
`)

P.political_phase = script(`
    log ("Political phase")
  
    call national_status_segment
    call political_will_segment
    goto attrition_phase
`)

P.national_status_segment = function () {
    //todo
    log("National status not changed")
    end()
}

P.political_will_segment = function () {
    //todo
    if (random(10) % 2 === 0) {
        G.political_will -= 1
        log("Us political will reduced to " + G.political_will)
    } else {
        log("Political will not changed")
    }
    end()
}

P.attrition_phase = script(`
    log ("Attrition phase")
    
    eval {
    for (let i = 1; i < pieces.length; i++) {
        if (random(10) % 5 === 0) {
            set_add(G.reduced, i)
            log(pieces[i].name + " reduced as attrition")
        }
    }
    }
    goto end_of_turn_phase
`)

P.end_of_turn_phase = script(`
    log ("Turn " + G.turn + ", End of turn phase")
    eval {
    if (G.political_will <= 0) {
        finish("Japan", "US surrenders")
    }
    if (G.turn >= G.finish) {
        finish("Alies", "Japan surrenders")
    }
    }
    incr G.turn
    goto strategic_phase
`)

/* EVENTS */

function can_play_event(c) {
    let req = cards[c].req

    return !!cards[c].event
}

P.play_event = function () {
    var event = cards[L.c].event
    var text = cards[L.c].text
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


P.event_total_submarine_warfare = function () {
    log("US entry DRM +3")
    G.us_drm += 3
    G.active = P_FRENCH
    goto("total_submarine_warfare")
}

P.event_they_shall_not_pass = script(`
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

/* SUPPLY */

const NORTH_EDGE = [0, 1, 2, 3, 4, 5, 6, 7]
const SOUTH_EDGE = [65, 66, 68, 70, 72, 73, 74, 75, 76, 78]

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
                set_zone_control(z, 1 - G.active)
            }
        }
    })
    if (supplied.length + unsupplied.length + isolated.length > 0) {
        log("Supply")
        for (var z of isolated)
            log(">Z" + z + " isolated")
        if (supplied.length + unsupplied.length > 0)
            goto("apply_supply", {supplied, unsupplied})
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
                    call("supply_exhaust", {z})
                } else {
                    this._resume()
                }
            } else if (level === 2) {
                log(">Z" + z + " eliminated")
                map_delete(G.oos[G.active], z)
                call("supply_eliminate", {z})
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
            set_zone_control(L.z, 1 - G.active)
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
    G.draw = [[], []]

    for (let c = 1; c < cards.length; ++c) {
        if (cards[c].faction === "ap") {
            G.draw[AP].push(c)
        } else {
            G.draw[JP].push(c)
        }

    }
}

function draw_card(side) {
    if (G.draw[side].length <= 0) {
        G.draw[side] = G.discard[side]
        G.discard[side] = []
    }
    console.log(side == 0 ? "JP" : "AP")
    console.log(G.draw[side].length)
    var i = random(G.draw[side].length)
    var c = G.draw[side][i]
    array_delete(G.draw[side], i)
    G.hand[side].push(c)
    return c
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

function setup_scenario_1942() {
    log("#Japan Offensive")
    log("The Japan assault on Asia (December 1941) caught allies off guard")

    G.location = []
    for (let i = 1; i < pieces; i++) {
        G.location[i] = hex_to_int(pieces[i].start)
    }

    construct_decks()

    while (G.hand[JP].length < 7)
        draw_card(JP)
    while (G.hand[AP].length < 5)
        draw_card(AP)
    G.passes[AP] = 2
    G.passes[JP] = 0
    G.turn = 2
    G.amph_points = [7, 1]
    G.political_will = 8

    console.log("setup 1942")
    call("offensive_phase")
}


/* HOOKS */

function on_setup(scenario, options) {

    G.scenario = scenario

    G.active = JP
    G.turn = 1
    G.finish = 12
    G.passes = [0, 0]
    G.removed = [] // removed one-time events (both sides)
    G.hand = [[], []]
    G.future_offensive = [[100, 0], [100, 0]]
    G.discard = [[], []]
    G.amph_points = [0, 0]

    G.location = []
    G.reduced = []
    G.oos = []
    reset_offensive()

    switch (scenario) {
        case "1942":
            return setup_scenario_1942()
    }
}

function on_view() {
    V.turn = G.turn
    V.location = G.location
    V.reduced = G.reduced
    V.political_will = G.political_will

    V.permanent = G.permanent

    V.control = G.control
    V.units = G.units
    V.trenches = G.trenches
    V.vps = G.vps
    V.exhausted = G.exhausted
    V.oos = G.oos
    V.hand = []
    V.future_offensive = []
    V.offensive = []


    if (R !== JP) {
        V.hand[JP] = G.hand[JP].map(a => a === G.offensive.active_card ? a : 0)
        let jfo = G.future_offensive[JP][1]
        V.future_offensive.push([G.future_offensive[JP][0], jfo === G.offensive.active_card ? jfo : 0])
    } else {
        V.hand[JP] = G.hand[JP]
        V.future_offensive.push(G.future_offensive[JP])
    }
    if (R !== AP) {
        V.hand[AP] = G.hand[AP].map(a => a === G.offensive.active_card ? a : 0)
        let jfo = G.future_offensive[AP][1]
        V.future_offensive.push([G.future_offensive[AP][0], jfo === G.offensive.active_card ? jfo : 0])
    } else {
        V.hand[AP] = G.hand[AP]
        V.future_offensive.push(G.future_offensive[AP])
    }
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

function hex_to_int(i) {
    return (Math.floor(i / 100) - 10) * 29 + i % 100
}

function reset_offensive() {
    G.offensive = {
        attacker: JP,
        active_card: 0,
        logistic: 0,
        active_hq: [],
        active_units: [],
        strat_moved_units: [],
        paths: [],
        active_stack: []
    }
}

/* FRAMEWORK */

/*
"use strict"
const ROLES = []
const SCENARIOS = []
var G, L, R, V, P = {}
function on_setup(scenario, options) {}
function on_static_view() {}
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
    G.L = L = {message}
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
    G.L = L = {...env, P: name, I: 0, L: L}
    P[name]?._begin?.()
}

function goto(name, env) {
    P[L.P]?._end?.()
    G.L = L = {...env, P: name, I: 0, L: L.L}
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

exports.scenarios ??= (typeof SCENARIOS !== "undefined") ? SCENARIOS : ["Standard"]

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

exports.static_view = function (game) {
    var SV = null
    if (typeof on_static_view === "function") {
        G = state
        L = null
        R = role
        V = null
        _load()
        SV = on_static_view()
        _save()
    }
    return SV
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

        try {
            if (P[L.P])
                P[L.P].prompt()
            else
                V.prompt = "TODO: " + L.P
        } catch (x) {
            console.error(x)
            V.prompt = x.toString()
        }

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
            else if (s[p] === "/" && s[p + 1] === "/") lex_comment()
            else if (s[p] === "-" && s[p + 1] === "-") lex_comment()
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

function script(text) {
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

function random_bigint(range) {
    // Largest MLCG that will fit its state in a double.
    // Uses BigInt for arithmetic, so is an order of magnitude slower.
    // https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf
    // m = 2**53 - 111
    return (G.seed = Number(BigInt(G.seed) * 5667072534355537n % 9007199254740881n)) % range
}

function shuffle(list) {
    // Fisher-Yates shuffle
    var i, j, tmp
    for (i = list.length - 1; i > 0; --i) {
        j = random(i + 1)
        tmp = list[j]
        list[j] = list[i]
        list[i] = tmp
    }
}

function shuffle_bigint(list) {
    // Fisher-Yates shuffle
    var i, j, tmp
    for (i = list.length - 1; i > 0; --i) {
        j = random_bigint(i + 1)
        tmp = list[j]
        list[j] = list[i]
        list[i] = tmp
    }
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

// Fast deep object comparison for objects without cycles
function object_diff(a, b) {
    var i, key
    var a_length
    if (a === b)
        return false
    if (a !== null && b !== null && typeof a === "object" && typeof b === "object") {
        if (Array.isArray(a)) {
            if (!Array.isArray(b))
                return true
            a_length = a.length
            if (b.length !== a_length)
                return true
            for (i = 0; i < a_length; ++i)
                if (object_diff(a[i], b[i]))
                    return true
            return false
        }
        for (key in a)
            if (object_diff(a[key], b[key]))
                return true
        for (key in b)
            if (!(key in a))
                return true
        return false
    }
    return true
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
        array[i] = array[i - 2]
        array[i + 1] = array[i - 1]
    }
    array[index] = key
    array[index + 1] = value
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

// Map as plain sorted array of key/value pairs

function map_clear(map) {
    map.length = 0
}

function map_has(map, key) {
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
            return true
    }
    return false
}

function map_get(map, key, missing) {
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

function map_delete(map, key) {
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
            array_delete_pair(map, m << 1)
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
        f(map[i], map[i + 1])
}

// same as Object.groupBy
function object_group_by(items, callback) {
    var item, key
    var groups = {}
    if (typeof callback === "function") {
        for (item of items) {
            key = callback(item)
            if (key in groups)
                groups[key].push(item)
            else
                groups[key] = [item]
        }
    } else {
        for (item of items) {
            key = item[callback]
            if (key in groups)
                groups[key].push(item)
            else
                groups[key] = [item]
        }
    }
    return groups
}

// like Object.groupBy but for plain array maps
function map_group_by(items, callback) {
    var item, key, arr
    var groups = []
    if (typeof callback === "function") {
        for (item of items) {
            key = callback(item)
            arr = map_get(groups, key)
            if (arr)
                arr.push(item)
            else
                map_set(groups, key, [item])
        }
    } else {
        for (item of items) {
            key = item[callback]
            arr = map_get(groups, key)
            if (arr)
                arr.push(item)
            else
                map_set(groups, key, [item])
        }
    }
    return groups
}