"use strict"

var G, L, R, V, P = {}

const ROLES = ["Japan", "Alies"]

const SCENARIOS = [
    "1942",
]

exports.default_scenario = "1942"

const JP = 0
const AP = 1

//Move types
const ANY_MOVE = 0
const AMPH_MOVE = 1
const NAVAL_MOVE = 2
const NAVAL_STRAT_MOVE = 4
const AIR_STRAT_MOVE = 8
const AIR_MOVE = 16
const AIR_CLOSE_MOVE = 32
const GROUND_MOVE = 64

const LAST_BOARD_HEX = 1476

const {pieces, cards, edges} = require("./data.js")

/* DATA */


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
        G.offensive.active_cards.push(c)
        if (G.future_offensive[R][1] === c) {
            G.future_offensive[R] = [100, 0]
        } else {
            array_delete_item(G.hand[R], c)
        }
        G.discard[R].push(c)
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
        log(`${R} played ${cards[L.c].name} as operation card`)
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
        prompt(cards[G.offensive.active_cards[0]].name + ". Choose HQ.")
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
        log(`${pieces[u].name} activated`)
        end()
    },
}

function get_distance(first_hex, second_hex) {
    return Math.abs(Math.floor(first_hex / 29) - Math.floor(second_hex / 29)) + Math.abs(first_hex % 29 - second_hex % 29)
}

P.activate_units = {
    _begin() {
        L.hq_bonus = pieces[G.offensive.active_hq[0]].cm
    },
    prompt() {
        prompt(`${cards[G.offensive.active_cards[0]].name}. Activate units ${G.offensive.logistic} + ${L.hq_bonus} / ${G.offensive.active_units.length}.`)
        for (let i = 1; i < pieces.length; i++) {
            let piece = pieces[i]
            let faction = R === AP ? "ap" : "jp"
            let hq = G.offensive.active_hq[0]
            if (piece.faction === faction && get_distance(G.location[hq], G.location[i]) <= pieces[hq].cr && piece.class !== "hq" &&
                !set_has(G.offensive.active_units, i)) {
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
    pass() {
        push_undo()
        end()
    }
}

function is_active_air() {
    let active_air = false
    for (let i = 0; i < G.offensive.active_stack.length; i++) {
        if (pieces[G.offensive.active_stack[i]].class === "air") {
            active_air = true
        }
    }
    return active_air
}

P.move_offensive_units = {
    _begin() {
    },
    prompt() {
        prompt(`${cards[G.offensive.active_cards[0]].name}. Move activated units.`)
        button("pass")
        if (G.offensive.active_stack.length === 0) {
            for (let i = 0; i < G.offensive.active_units.length; i++) {
                if (!G.offensive.paths[i]) {
                    action_unit(G.offensive.active_units[i])
                }
            }
        } else {
            let loc = G.location[G.offensive.active_stack[0]]
            let active_air = is_active_air()
            for (let i = 0; i < G.offensive.active_units.length; i++) {
                let unit = G.offensive.active_units[i]
                if (!G.offensive.paths[i] && loc === G.location[unit] &&
                    (active_air === (pieces[unit].class === "air")) && !set_has(G.offensive.active_stack, unit)) {
                    action_unit(unit)
                }
            }
            button("move")
            button("strat_move")
            if (active_air) {
                button("displace")
            } else {
                button("amphibious")
            }
        }
    },
    unit(u) {
        push_undo()
        set_add(G.offensive.active_stack, u)
    },
    move() {
        push_undo()
        goto("move_stack", {type: is_active_air() ? AIR_MOVE : ANY_MOVE})
    },
    displace() {
        push_undo()
        // end()
    },
    strat_move() {
        push_undo()
        goto("move_stack", {type: is_active_air() ? AIR_STRAT_MOVE : NAVAL_STRAT_MOVE})
    },
    amphibious() {
        push_undo()
        // end()
    },
    pass() {
        push_undo()
        let path = G.offensive.paths
        for (let i = 0; i < G.offensive.active_units.length; i++) {
            if (!path[i]) {
                path[i] = [ANY_MOVE]
            }
        }
        end()
    },
}

function get_allowed_move_type() {
    let active_air = false
    let active_ground = false
    let active_naval = false
    let result = 0
    for (let i = 0; i < G.offensive.active_stack.length; i++) {
        switch (pieces[G.offensive.active_stack[i]].class) {
            case "air":
                active_air = true;
                break;
            case "ground":
                active_ground = true;
                break;
            case "naval":
                active_naval = true;
                break;
        }
    }
    if (active_air) {
        return AIR_MOVE
    }
    if (active_ground && !active_naval) {
        result += GROUND_MOVE
    }
    if (active_ground) {//todo hex==port
        result += AMPH_MOVE
    }
    if (active_naval && !active_ground) {
        result += NAVAL_MOVE
    }
    return result
}

function get_near_hexes(hex) {
    let x = Math.floor(hex / 29)
    let y = hex % 29
    let y_diff = x % 2 ? 1 : -1
    let result = []
    if (y > 0) {
        result.push(hex - 1)
    }
    if (y < 28) {
        result.push(hex + 1)
    }
    if (x > 0) {
        result.push(hex - 29)
        result.push(hex - 29 + y_diff)
    }
    if (x < 50) {
        result.push(hex + 29)
        result.push(hex + 29 + y_diff)
    }
    return result
}

function get_allowed_hexes(distance_max) {
    let queue = []
    let distance_map = []
    queue.push(L.location)
    map_set(distance_map, L.location, 0)
    let i = 0
    while (true) {
        let item = queue[i]
        let distance = map_get(distance_map, item) + 1
        if (distance <= distance_max) {
            get_near_hexes(item).forEach(nh => {
                let d = map_get(distance_map, nh, null)
                if (d == null || distance < d) {
                    map_set(distance_map, nh, distance)
                    queue.push(nh)
                }
            })
        }
        i++
        if (i >= queue.length) {
            break
        }
    }
    let result = []
    for (let i = 1; i < queue.length; i++) {
        set_add(result, queue[i])
    }
    return result
}

P.move_stack = {
    _begin() {
        if (!L.type) {
            L.type = get_allowed_move_type()
        }
        L.location = G.location[G.offensive.active_stack[0]]
        L.distance = cards[G.offensive.active_cards[0]].ops * 5
        L.allowed_hexes = get_allowed_hexes(L.distance)
        let last_from_stack = G.offensive.active_units.indexOf(G.offensive.active_stack[G.offensive.active_stack.length - 1])
        L.last_from_stack = last_from_stack
        for (let i = 0; i < G.offensive.active_stack.length; i++) {
            G.offensive.paths[i] = last_from_stack
        }
        G.offensive.paths[last_from_stack] = [ANY_MOVE, L.location]
    },
    prompt() {
        prompt(`${cards[G.offensive.active_cards[0]].name}. Move activated units.`)

        for (let i = 0; i < L.allowed_hexes.length - 1; i++) {
            action_hex(L.allowed_hexes[i])
        }
        button("stop")
    },
    board_hex(hex) {
        push_undo()
        for (let i = 0; i < G.offensive.active_stack.length; i++) {
            G.location[G.offensive.active_stack[i]] = hex
        }
        L.distance -= get_distance(L.location, hex)
        L.location = hex
        L.allowed_hexes = get_allowed_hexes(L.distance)
        G.offensive.paths[L.last_from_stack].push(hex)
        if (L.distance <= 0) {
            this.stop()
        }
    },
    stop() {
        push_undo()
        G.offensive.active_stack = []
        let path = G.offensive.paths[L.last_from_stack]
        log(`Units moved to ${int_to_hex(path[path.length - 1])}`)
        end()
    },
}

P.declare_battle_hexes = {
    _begin() {
        L.possible_hexes = []
        let jp_hexes = []
        console.log(pieces.length)
        for (let i = 1; i < pieces.length; i++) {
            let location = G.location[i]
            if (location > 0 && location < LAST_BOARD_HEX && pieces[i].faction === "jp") {
                set_add(jp_hexes, location)
            }
        }
        console.log(pieces.length)
        for (let i = 1; i < pieces.length; i++) {
            let location = G.location[i]
            if (pieces[i].faction === "ap" && set_has(jp_hexes, location) && !set_has(G.offensive.battle_hexes, location)) {
                set_add(L.possible_hexes, location)
            }
        }
        console.log(pieces.length)
    },
    prompt() {
        prompt(`${cards[G.offensive.active_cards[0]].name}. Declare battle hexes.`)
        console.log(L)
        console.log(L.possible_hexes.length)
        for (let i = 0; i < L.possible_hexes.length; i++) {
            let location = L.possible_hexes[i]
            if (!set_has(G.offensive.battle_hexes, location)) {
                action_hex(location)
            }
        }

        button("stop")
    },
    board_hex(hex) {
        push_undo()
        set_add(G.offensive.battle_hexes, hex)
        if (G.offensive.battle_hexes.length >= L.possible_hexes.length) {
            end()
        }
    },
    stop() {
        push_undo()
        end()
    },
}

P.commit_offensive = {
    prompt() {
        prompt(`${cards[G.offensive.active_cards[0]].name}. Commit offensive.`)
        button("next")
    },
    next() {
        end()
    },
}

// call("change_intelligence_condition")
// call("choose_reaction_hq")
// call("activate_units")
// call("move_reaction_units")
// call("resolve_battles")
// call("post_battle_movement")
// call("emergency_movement")
P.offensive_sequence = script(`
    set G.offensive.logistic cards[G.offensive.active_cards[0]].ops
    call choose_hq
    call activate_units
    while (G.offensive.active_units.length > G.offensive.paths.filter(a => a != null).length) {
        call move_offensive_units
    }
    call declare_battle_hexes
    call commit_offensive
    call define_intelligence_condition
    eval {
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

//todo

/* SUPPLY */

//todo

/* SETUP */

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

function setup_scenario_1942() {
    log("#Japan Offensive")
    log("The Japan assault on Asia (December 1941) caught allies off guard")

    G.location = []
    for (let i = 1; i < pieces.length; i++) {
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
    V.offensive = G.offensive


    if (R !== JP) {
        V.hand[JP] = G.hand[JP].map(() => 0)
        V.future_offensive.push([G.future_offensive[JP][0], 0])
    } else {
        V.hand[JP] = G.hand[JP]
        V.future_offensive.push(G.future_offensive[JP])
    }
    if (R !== AP) {
        V.hand[AP] = G.hand[AP].map(() => 0)
        V.future_offensive.push([G.future_offensive[AP][0], 0])
    } else {
        V.hand[AP] = G.hand[AP]
        V.future_offensive.push(G.future_offensive[AP])
    }
}

function action_card(c) {
    action("card", c)
}

function action_unit(p) {
    action("unit", p)
}

function action_hex(p) {
    action("board_hex", p)
}

function hex_to_int(i) {
    return (Math.floor(i / 100) - 10) * 29 + i % 100
}

function int_to_hex(i) {
    return (Math.floor(i / 29) * 100) + 1000 + i % 29
}

function reset_offensive() {
    G.offensive = {
        attacker: JP,
        active_cards: [],
        logistic: 0,
        active_hq: [],
        active_units: [],
        strat_moved_units: [],
        paths: [],
        active_stack: [],
        battle_hexes: []
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