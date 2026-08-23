/** import server/cycle.js*/

/** import server/actions.js*/
/** import server/events.js*/


function prepare_game_log() {
    G.log = []
    G.capture = []
}

function future_offencive_card(card, turn) {
    var faction = cards[card].faction
    if (G.future_offensive[faction] > 0) {
        discard_card(G.future_offensive[faction])
    }
    G.future_offensive[faction] = card
    G.events[events.FUTURE_OFFENSIVE_JP.id + faction] = turn

    array_delete_item(G.discard[faction], card)
    array_delete_item(G.draw[faction], card)
    array_delete_item(G.removed[faction], card)
    array_delete_item(G.hand[faction], card)
}

function remove_card(card) {
    var faction = cards[card].faction
    discard_card(card)
    array_delete_item(G.discard[faction], card)
    array_delete_item(G.draw[faction], card)
    set_add(G.removed[faction], card)
}

function discard_card(card) {
    var faction = cards[card].faction
    array_delete_item(G.draw[faction], card)
    set_add(G.discard[faction], card)
    if (G.future_offensive[faction] === card) {
        G.future_offensive[faction] = -1
        G.events[events.FUTURE_OFFENSIVE_JP.id + faction] = 0
    } else {
        array_delete_item(G.hand[faction], card)
    }
}

function setup_jp_unit(piece, hex_id, reduced = false) {
    let hex = hex_to_int(hex_id)
    if (hex < LAST_BOARD_HEX && is_controllable_hex(hex) && pieces[piece].faction === JP) {
        capture_hex(hex, JP)
    } else if (hex < LAST_BOARD_HEX && is_controllable_hex(hex) && pieces[piece].faction === AP) {
        capture_hex(hex, AP)
    }
    G.location[piece] = hex
    if (reduced) {
        set_add(G.reduced, piece)
    } else {
        set_delete(G.reduced, piece)
    }
}


/* HOOKS */

function on_setup(scenario, options) {

    G.scenario = scenario
    G.sid = SCENARIO_DATA.filter(s => s.name === G.scenario)[0].id//scenario id
    G.active = JP
    G.redo_count = 0
    G.turn = 1
    G.passes = [0, 0]
    G.removed = [[], []] // removed one-time events
    G.hand = [[], []]
    G.future_offensive = [-1, -1]
    G.discard = [[], []]
    G.asp = [[7, 0], [0, 0]]
    G.active_stack = []
    G.inter_service = [0, 0]
    G.wie = 3
    G.china_divisions = 12
    G.burma_road = 0
    G.political_will = 0

    G.location = []
    G.reduced = []
    G.oos = []
    G.reinforcements = [0, 0]
    G.strategic_warfare = 0
    G.capture = []
    G.garr_elim = []
    G.draw_counter = [0, 0]
    G.events = []
    G.not_delayed = []
    Object.keys(events).forEach(k => G.events[events[k].id] = 0)
    G.surrender = [...Array(Object.keys(nations).length).keys()].map(i => 0)
    G.surrender[nations.MARSHALL.id] = true //only nation under JP control
    G.b29u = 0
    G.supply_cache = []
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        G.supply_cache[i] = 0
        if (create_controllable_hex(i)) {
            G.supply_cache[i] += HEX_CONTROLLABLE
        }
    }
    G.pow = 0
    G.captured_once = []

    if (options.experienced) {
        G.async = 1
    }
    for (let i = 1; i < LAST_BOARD_HEX; i++) {
        if (is_controllable_hex(i) && ["JMandates", "Korea", "Manchuria", "China", "Formosa", "Indochina", "Caroline", "Marshall", "Japan"].includes(get_map_data(i).region)) {
            capture_hex(i, JP)
        }
    }
    capture_hex(hex_to_int(3606), JP)
    capture_hex(hex_to_int(2709), JP)
    reset_offensive()
    construct_decks()
    for (let i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        G.location[i] = NON_PLACED_BOX
        if (piece.start) {
            G.location[i] = hex_to_int(piece.start)
            if (piece.start_reduced) {
                set_add(G.reduced, i)
            }
        }
    }

    scenario_data().setup(options)
}

function create_controllable_hex(hex) {
    var sid = G.sid
    var map_data = get_map_data(hex)
    return map_data.named || hex === WEST_HONSHU
        || hex === KWAI_BRIDGE && !is_event_active(events.KWAI_RIVER_BRIDGE)// && !is_event_active(events.KWAI_RIVER_BRIDGE)
        || hex === KWAI_BRIDGE_1 && !is_event_active(events.KWAI_RIVER_BRIDGE)// && !is_event_active(events.KWAI_RIVER_BRIDGE)
        || hex === CHINA_BOX
        || hex === ATTU && sid === YEAR_1942_SCENARIO
        // || map_data.region === "AMandates" && (sid === YEAR_1943_SCENARIO || sid === YEAR_1942_1943_SCENARIO)// && G.surrender[nations.AUSTRALIAN_MANDATES.id]
        || sid === BURMA_SCENARIO && map_data.region === "Burma" // need to check non named hexes for 17.11.23
}

function get_garrison_count() {
    if (G.china_divisions > 8) {
        return 3
    } else if (G.china_divisions > 4) {
        return 2
    }
    return 1
}

function on_view() {
    is_space_controlled(OAHU, JP)//todo: remove
    if (L.P && P[L.P] && P[L.P].on_view) {
        return P[L.P].on_view()
    }
    return create_view()
}

function create_view() {
    V.active = G.active
    V.turn = G.turn
    V.sid = G.sid
    V.location = G.location
    V.removed = G.removed
    V.discard = G.discard
    V.reduced = G.reduced
    V.political_will = G.political_will
    V.inter_service = G.inter_service
    V.wie = G.wie
    V.passes = G.passes
    V.asp = G.asp
    V.captured_once = G.captured_once
    V.violations = L.violations

    V.non_control = G.non_control
    V.capture = G.capture
    V.oos = G.oos
    V.b29u = G.b29u
    V.supply_cache = G.supply_cache
    V.hand = []
    V.pow = G.pow
    V.future_offensive = [-1, -1]
    V.active_stack = G.active_stack
    V.surrender = G.surrender
    V.events = G.events
    V.garr_elim = G.garr_elim
    V.draw_counter = G.draw_counter
    V.reinforcements = G.reinforcements
    V.burma_road = G.burma_road
    V.china_divisions = G.china_divisions
    V.offensive = object_copy(G.offensive)
    V.move_type = L.move_type
    if (G.offensive.battle.battle_hex) {
        set_add(V.offensive.battle_hexes, G.offensive.battle.battle_hex)
    }
    V.offensive.damaged = G.offensive.battle && G.offensive.battle.damaged && G.offensive.battle.damaged[R] ? G.offensive.battle.damaged[R] : []
    V.garrison = []
    var div_count = get_garrison_count()
    G.offensive.battle_hexes.forEach(h => {
        var city = get_map_data(h).city
        if ((city === CHINESE_CITY || city === JAPANESE_CITY && !set_has(G.garr_elim, h)) && is_space_controlled(h, JP)) {
            map_set(V.garrison, h, city === JAPANESE_CITY ? 0 : div_count)
        }
    })


    if (R !== JP) {
        V.hand[JP] = G.hand[JP].length + G.offensive.draw[JP].filter(c => c >= 0 && cards[c].faction === JP).length
    } else {
        V.hand[JP] = G.hand[JP].slice()
        G.offensive.draw[JP].filter(c => c >= 0 && cards[c].faction === JP).forEach(c => V.hand[JP].push(c))
        V.future_offensive[JP] = G.future_offensive[JP]
    }
    if (R !== AP) {
        V.hand[AP] = G.hand[AP].length + G.offensive.draw[AP].filter(c => c >= 0 && cards[c].faction === AP).length
    } else {
        V.hand[AP] = G.hand[AP].slice()
        G.offensive.draw[AP].filter(c => c >= 0 && cards[c].faction === AP).forEach(c => V.hand[AP].push(c))
        V.future_offensive[AP] = G.future_offensive[AP]
    }
}


function action_card(c) {
    action("card", c)
}

function action_unit(p) {
    action("unit", p)
}

function unselect_unit(p) {
    if (!globalThis.RTT_FUZZER) {
        action("unit", p)
        if (!V.unselect) {
            V.unselect = []
        }
        set_add(V.unselect, p)
    }
}

function action_hex(p) {
    if (p < TUNNEL_BOX) {
        action("action_hex", p)
    }
}

function action_box(p) {
    action("turn_box", p)
}

function reset_offensive() {
    G.offensive = {
        type: EC,
        attacker: JP,
        active_cards: [],
        amp_mod: [],
        offensive_card: -1,
        counter_offensive_card: -1,
        intelligence: SURPRISE,
        stage: EVENT_STAGE,
        logistic: 0,
        naval_move_distance: 0,
        ground_move_distance: 0,
        ground_pbm: [],
        active_hq: [],
        organic: [],
        draw: [[], []],
        r_asp: 0,
        active_units: [[], []],
        paths: [],
        battle_hexes: [],
        landing_hexes: [],
        committed: [],
        battle_names: [],
        barges: 0,
        retreat: [],
        zoi_intelligence_modifier: false,
        battle: {},
    }
}


function construct_decks() {
    G.draw = [[], []]

    for (let c = 1; c < cards.length; ++c) {
        if (cards[c].faction) {
            G.draw[AP].push(c)
        } else {
            G.draw[JP].push(c)
        }

    }
}

function draw_card(side, to_hand = true) {
    if (G.draw[side].length <= 0) {
        G.draw[side] = G.discard[side]
        G.discard[side] = []
    }
    var i = random(G.draw[side].length)
    var c = G.draw[side][i]
    array_delete(G.draw[side], i)
    if (to_hand) {
        G.hand[side].push(c)
    }
    return c
}

function draw_specific_card(card) {
    var card_data = cards[card]
    array_delete_item(G.draw[card_data.faction], card)
    G.hand[card_data.faction].push(card)
    return card
}

function eliminate_permanently(unit) {
    if (G.location[unit] !== NON_PLACED_BOX) {
        log(`${piece_get_log_str(unit)} removed from game.`)
    }
    set_location(unit, PERM_ELIMINATED)
    set_delete(G.reduced, unit)
    set_delete(G.oos, unit)
}

function eliminate(unit, no_log = false) {
    var piece = pieces[unit]
    var size = get_overstack_size(unit)
    var location = G.location[unit]
    if (L.overstack && (location <= LAST_BOARD_HEX || location === CHINA_BOX)) {
        L.overstack[location] -= size
    }
    if (piece.class === "hq" && !piece.notreplaceable) {
        displace_to_turn(unit, 1)
        return
    }
    if (!no_log) {
        log(`${piece_get_log_str(unit)} eliminated.`)
    }
    G.location[unit] = ELIMINATED_BOX
    set_delete(G.reduced, unit)
    set_delete(G.oos, unit)
}

function damage_unit(unit) {
    if (set_has(G.reduced, unit)) {
        eliminate(unit)
    } else {
        reduce_unit(unit)
    }
}

function reduce_unit(unit, no_log = false) {
    if (!no_log) {
        log(`${piece_get_log_str(unit)} reduced.`)
    }
    set_add(G.reduced, unit)
}

function get_year() {
    var t = G.turn + 1
    return (t - (t % 3)) / 3 + 1941
}

function get_year_season() {
    var d = (G.turn + 1) % 3
    return SEASONS[d]
}

P.default_event = script(`
    eval {
        if (cards[G.offensive.offensive_card].isr_rivalry) {
            set_inter_service(1-cards[G.offensive.offensive_card].faction,1)
        }
        if (cards[G.offensive.offensive_card].isr_agreement) {
            set_inter_service(cards[G.offensive.offensive_card].faction,0)
        }
        if (cards[G.offensive.offensive_card].pw) {
            change_political_will(cards[G.offensive.offensive_card].pw, cards[G.offensive.offensive_card].name)
        }
        if (cards[G.offensive.offensive_card].wie) {
            change_wie(cards[G.offensive.offensive_card].wie[get_year()-1942], cards[G.offensive.offensive_card].cause)
        }
        if (cards[G.offensive.offensive_card].china) {
            update_china_status(cards[G.offensive.offensive_card].china)
        }
    }
`)

function set_inter_service(faction, rivalry) {
    if (G.inter_service[faction] && !rivalry) {
        log(`${side_get_log_str(faction)} inter-service agreement.`)
        G.inter_service[faction] = 0
    } else if (!G.inter_service[faction] && rivalry) {
        log(`${side_get_log_str(faction)} inter-service rivalry active.`)
        G.inter_service[faction] = 1
    }
}

function reshuffle() {
    if (G.discard[AP].includes(SOVIET_INVADE)) {
        log(`AP deck reshuffled due to Soviet invasion discarded.`)
        G.draw[AP].push(...G.discard[AP])
        G.discard[AP] = []
    }
    if (G.discard[JP].includes(TOJO_RESIGNS)) {
        log(`JP deck reshuffled due to Tojo resign discarded.`)
        G.draw[JP].push(...G.discard[JP])
        G.discard[JP] = []
    }
}


function check_jp_resources_event() {
    if (get_jp_resources() <= 3 && G.turn >= 5 && G.sid !== SOUTH_PACIFIC_SCENARIO && G.sid !== BURMA_SCENARIO) {
        check_event(events.JAPAN_LACK_OF_RESOURCES)
    }
}

function check_event(event) {
    if (is_event_active(event)) {
        return false
    }
    G.events[event.id] = G.turn
    if (event.pw) {
        change_political_will(event.pw, event.cause)
    }
    return true
}

function check_occupation(event, apply_pw = false) {
    var result = event.keys.filter(k => is_faction_units(hex_to_int(k), JP)).length
    var map_value = G.events[event.id]
    var occupied_for = (G.turn - map_value) + 1
    if (!result && map_value > 0 && occupied_for <= event.turns_to_control) {
        G.events[event.id] = 0
        log(`Timer to ${event.cause} reset.`)
    } else if (apply_pw && result && map_value && occupied_for === event.turns_to_control) {
        change_political_will(event.pw, event.cause)
    } else if (result && map_value <= 0) {
        G.events[event.id] = G.turn
        log(`Started ${event.cause}.`)
    }
}

function check_alaska_occupation(apply_pw = false) {
    var event = events.ALASKA_OCCUPATION
    var event_hexes = events.ALASKA_OCCUPATION_HEXES
    var occupied_for = (G.turn - G.events[event.id]) + 1
    if (G.events[event.id] && occupied_for > event.turns_to_control) {
        return
    }
    var result = event.keys.map(k => is_faction_units(hex_to_int(k), JP) ? 1 : 0)
    var map_value = G.events[event_hexes.id]
    var occupation_map = 0
    var min = 0
    for (var i = event.keys.length - 1; i >= 0; i -= 1) {
        var current = (map_value >> (i * 4)) % 16
        var md = get_map_data(hex_to_int(event.keys[i]))
        if (current && !result[i]) {
            log(`Occupation of ${md.name} stopped.`)
            current = 0
        } else if (!current && result[i]) {
            log(`Occupation of ${md.name} started.`)
            current = G.turn
        }
        occupation_map = (occupation_map << 4) + current
        if (current && current < min || min === 0) {
            min = current
        }
    }
    G.events[event_hexes.id] = occupation_map
    G.events[event.id] = min
    occupied_for = (G.turn - min) + 1
    if (apply_pw && result && min && occupied_for === event.turns_to_control) {
        change_political_will(event.pw, event.cause)
    }
}


function change_political_will(diff, cause) {
    if (diff === 0) {
        return
    }
    G.political_will = Math.max(G.political_will + diff, 0)
    G.political_will = Math.min(G.political_will, 10)
    if (diff > 0) {
        diff = "+" + diff
    }
    log(`Political will changed to ${G.political_will} (${diff}) - ${cause}.`)
}

function get_wie_level() {
    if (G.wie <= 2) {
        return "No effect"
    } else if (G.wie <= 5) {
        return "Level 1"
    } else if (G.wie <= 7) {
        return "Level 2"
    } else if (G.wie <= 9) {
        return "Level 3"
    } else if (G.wie <= 10) {
        return "Level 4"
    }
}

function change_wie(diff, cause) {
    if (diff === undefined) {
        log(`No war in europe changed.`)
        return
    }
    G.wie = Math.max(G.wie + diff, 0)
    G.wie = Math.min(G.wie, G.sid === SOUTH_PACIFIC_SCENARIO ? 7 : 10)
    if (diff > 0) {
        diff = "+" + diff
    }
    log(`War in europe changed to ${get_wie_level()} (${3 - G.wie}), ${cause} (${diff}).`)
}


function displace_to_turn(unit, turns, not_delayed) {
    if (pieces[unit].notreplaceable && unit_on_board(unit)) {
        log(`${piece_get_log_str(unit)} not replaceable, could not be displaced to turn box.`)
        eliminate(unit)
        return
    }
    if (G.turn + turns > 12 || G.sid === SOUTH_PACIFIC_SCENARIO && G.turn + turns > 6 || G.sid === BURMA_SCENARIO && G.turn + turns > 9) {
        log(`${piece_get_log_str(unit)} should be displaced to turn box ${G.turn + turns} but permanently eliminated instead.`)
        if (pieces[unit].class === "hq") {
            set_location(unit, TURN_BOX + 13)
        } else {
            set_location(unit, PERM_ELIMINATED)
        }
    } else {
        log(`${piece_get_log_str(unit)} displaced to turn box ${G.turn + turns}.`)
        set_location(unit, TURN_BOX + G.turn + turns)
        if (not_delayed) {
            set_add(G.not_delayed, unit)
        }
    }
}

function check_sudden_death() {
    var check = [0, 0]
    HQ_LIST.forEach(u => {
        if (unit_on_board(u) && u !== HQ_CENTRAL_PACIFIC) {
            check[pieces[u].faction]++
        }
    })
    if (check[JP] <= 0) {
        finish("Allies", "Allies Victory - All Japanese HQ displaced")
        return true
    } else if (check[AP] <= 0) {
        finish("Japan", "Japanese Victory - All Allies HQ displaced")
        return true
    }
    return false
}

function unit_on_board(unit) {
    return G.location[unit] < LAST_BOARD_HEX
}

function into_turn_draw(faction) {
    if (G.draw_counter[faction] >= 3) {
        log(`${side_get_log_str(faction)} has drawn 3 cards already, draw skipped.`)
        return
    }
    G.draw_counter[faction]++
    G.offensive.draw[faction].push(-1)
}

function resolve_into_turn_draw(faction) {
    var count = G.offensive.draw[faction].filter(c => c <= 0).length
    if (count <= 0) {
        return
    }
    G.offensive.draw[faction] = G.offensive.draw[faction].filter(c => c >= 0)
    for (var i = 0; i < count; i++) {
        log(`${side_get_log_str(faction)} draw additional card.`)
        G.offensive.draw[faction].push(draw_card(faction, false))
    }
    clear_undo()
}

function commit_into_turn_draw() {
    resolve_into_turn_draw(JP)
    resolve_into_turn_draw(AP)
    G.offensive.draw[AP].forEach(c => G.hand[AP].push(c))
    G.offensive.draw[JP].forEach(c => G.hand[JP].push(c))
    G.offensive.draw = []
}

function capture_hex(hex, side = G.active, no_log = false) {
    if (side === AP && is_event_active(events.TOKYO_EXPRESS) === hex) {
        log(`Tokyo express marker removed.`)
        G.events[events.TOKYO_EXPRESS.id] = 0
    }
    if (hex > LAST_BOARD_HEX || !is_controllable_hex(hex)) {
        return
    }
    if (G.non_control) {
        set_delete(G.non_control, hex)
        if (!no_log) {
            log(`AP captured ${int_to_hex(hex)}.`)
        }
    }
    var md = get_map_data(hex)
    if (side && !is_space_controlled(hex, AP)) {
        if (!no_log) {
            log(`AP captured ${hex_get_log_str(hex)}.`)
        }
        G.supply_cache[hex] -= JP_CONTROLLED
        if (md.region === "NIndia") {
            india_stable()
        } else if (md.city === JAPANESE_CITY) {
            set_add(G.garr_elim, hex)
        }
        if (md.resource) {
            check_jp_resources_event()
        }
    } else if (!side && !is_space_controlled(hex, JP)) {
        if (!no_log) {

            log(`JP captured ${hex_get_log_str(hex)}.`)
        }
        G.supply_cache[hex] += JP_CONTROLLED
    } else {
        return
    }
    if (md.named) {
        set_toggle(G.capture, hex)
    }
}

function get_hand(side) {
    if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] < G.turn && G.future_offensive[side] > 0 && G.hand[side].length) {
        var result = G.hand[side].slice()
        result.push(G.future_offensive[side])
        return result
    } else {
        return G.hand[side]
    }
}

function military_card(c) {
    activate_card(c)
    G.offensive.type = EC
    var card = cards[c]
    if (Number.isInteger(card.logistic)) {
        G.offensive.logistic = cards[c].logistic
    }
    if (card.intelligence) {
        G.offensive.intelligence = card.intelligence
    }
    if (cards[c].draw) {
        into_turn_draw(cards[c].faction)
    }
}

function play_counter_offensive(c) {
    play_reaction(c)
    G.offensive.counter_offensive_card = c
    if (cards[c].logistic) {
        G.offensive.logistic = cards[c].logistic
    }
}

function play_reaction(c) {
    play_event(c)
    if (cards[c].intelligence && G.offensive.intelligence !== AMBUSH && G.offensive.intelligence !== cards[c].intelligence) {
        G.offensive.intelligence = cards[c].intelligence
        log(`#IIntelligence condition changed to ${get_named_intelligence(G.offensive.intelligence)}`)
    }
}

function get_named_intelligence(int) {
    if (int === SURPRISE) {
        return "Surprise"
    } else if (int === AMBUSH) {
        return "Ambush"
    } else {
        return "Intercept"
    }
}

function play_event(c) {
    var faction = cards[c].faction
    if (G.future_offensive[faction] === c) {
        log(`${side_get_log_str(faction)} played FO card.`)
    }
    log(`${card_get_log_str(c)} played as event.`)
    if (cards[c].draw) {
        into_turn_draw(faction)
    }
    G.offensive.active_cards.push(c)
    discard_card(c)
    if (cards[c].type === MILITARY) {
        military_card(c)
    } else {
        cards[c].event()
    }
    if (cards[c].remove) {
        set_add(G.removed[faction], c)
        set_delete(G.discard[faction], c)
    } else {
        set_add(G.discard[faction], c)
    }
}

function activate_card(c) {
    var faction = cards[c].faction
    G.offensive.active_cards.push(c)
    G.offensive.offensive_card = c
    if (G.future_offensive[faction] === c) {
        log(`${side_get_log_str(faction)} played FO card.`)
    }
    discard_card(c)
    set_add(G.discard[faction], c)
    G.offensive.attacker = faction
    if (cards[c].faction === JP && cards[c].ops >= 3 && is_event_active(events.BARGES)) {
        G.offensive.barges = 2
    }
    G.offensive.naval_move_distance = (cards[c].ops * 5)
    G.offensive.ground_move_distance = (cards[c].ops * 2)
    G.offensive.air_move_distance = (cards[c].ops)
    G.offensive.logistic = cards[c].ops
}

function bombing(u, close_air_base) {
    var result = random(10)
    var success_rate = 9 - (set_has(G.reduced, u) ? 4 : 0)
    var success = result < success_rate
    var damaged = result >= 9 && !close_air_base
    var modifier = 0
    log(`${piece_get_log_str(u)} strategic bombing (${close_air_base ? "Air" : "No air"} base withing range of Tokyo):`)
    if (is_event_active(events.INTERCEPTORS) && !close_air_base) {
        log(`+1 High altitude interceptors.`)
        modifier++
    }
    log(`${dice_get_log_str(result, modifier, AP)} < ${success_rate} (${success ? "SUCCESS" : "FAILED"}).`)
    if (damaged) {
        damage_unit(u)
    }
    G.b29u |= B29_BOMBED << pieces[u].b29
    if (success) {
        G.strategic_warfare++
        check_event(events.STRAT_BOMBING)
        check_event(events.STRAT_BOMBING_CAMPAIGN)
    }
    clear_undo()
    return success
}


function get_service_reinf_hex() {
    return G.active === AP ? AP_REINF : JP_REINF
}

function change_asp(faction, count) {
    var size = G.asp[faction][0]
    if (size + count <= 0) {
        G.asp[faction][0] = 1
    } else {
        G.asp[faction][0] += count
    }
    if (size !== G.asp[faction][0]) {
        log(`${side_get_log_str(faction)} amphibious shipping points changed to ${G.asp[faction][0]} (${count}).`)
    }
}

function print_reinforcements() {
    var reinf = L.replacement_points
    var string = ""
    if (reinf[NAVAl_REP]) {
        string += `${G.active === AP ? "US Naval" : "Naval"}: ${reinf[NAVAl_REP]}`
    }
    if (reinf[COMMONWEALTH_REP]) {
        string += `, Commonwealth: ${reinf[COMMONWEALTH_REP]}`
    }
    if (reinf[AIR_REP]) {
        string += `, Air: ${reinf[AIR_REP]}`
    }
    if (reinf[GROUND_REP]) {
        string += `, Ground: ${reinf[GROUND_REP]}`
    }
    if (reinf[CHINESE_REP]) {
        string += `, China: ${reinf[CHINESE_REP]}`
    }
    if (L.divisions >= 0) {
        string += ", Divisions from China: " + L.divisions
    }
    if (string.startsWith(", ")) {
        string = string.replace(", ", "")
    }
    return string
}


