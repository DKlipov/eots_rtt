"use strict"

var G, L, R, V, P = {}

const ROLES = ["Japan", "Allies"]

const SCENARIOS = [
    "1942",
    "1943",
]

exports.default_scenario = "1942"

const JP = 0
const AP = 1

//cards
const EC = 0 //Event card
const OC = 1 //Offensive card

//card types
const POLITICAL = 1
const RESOURCE = 2
const COUNTER_OFFENSIVE = 3
const MILITARY = 4
const INTELLIGENCE = 5
const REACTION = 6
const CANCEL = 7

//reaction types
const BEFORE_COMBAT = 1
const AFTER_COMBAT = 2

//Move types
const ANY_MOVE = 0
const STRAT_MOVE = 1 << 0
const NAVAL_MOVE = 1 << 1
const GROUND_MOVE = 1 << 2
const AMPH_MOVE = 1 << 3
const AIR_STRAT_MOVE = 1 << 4
const AIR_MOVE = 1 << 5
const AIR_CLOSE_MOVE = 1 << 6
const POST_BATTLE_MOVE = 1 << 7
const REACTION_MOVE = 1 << 8
const AIR_EXTENDED_MOVE = 1 << 9
const ATTACK_MOVE = 1 << 10
const AVOID_ZOI = 1 << 11
const ORGANIC_ONLY = 1 << 12

//Offensive stages
const ATTACK_STAGE = ATTACK_MOVE
const REACTION_STAGE = REACTION_MOVE
const BATTLE_STAGE = 2
const POST_BATTLE_STAGE = POST_BATTLE_MOVE

//Intelligence
const SURPRISE = 1
const INTERCEPT = 2
const AMBUSH = 3

//hex data
const CITY = 1
const JAPANESE_CITY = 2
const CHINESE_CITY = 3

//Terrain
const OCEAN = 0
const OPEN = 1
const JUNGLE = 2
const MIXED = 3
const MOUNTAIN = 4
const ATOLL = 5

// Hex sides
const WATER = 1
const GROUND = 2
const ROAD = 4
const UNPLAYABLE = 8
const MAP_BORDER = 16


const SUPPLY_PORT_RANGE = 4 * 2 //ground movement points count with multiplier

// Hex supply status flags
const JP_ZOI = 1 << 0
const AP_ZOI = 1 << 1
const JP_ZOI_NTRL = 1 << 2
const AP_ZOI_NTRL = 1 << 3
const JP_AIR_UNITS = 1 << 4
const AP_AIR_UNITS = 1 << 5
const JP_GROUND_UNITS = 1 << 6
const AP_GROUND_UNITS = 1 << 7
const JP_NAVAL_UNITS = 1 << 8
const AP_NAVAL_UNITS = 1 << 9
const JP_HQ_UNITS = 1 << 10
const AP_HQ_UNITS = 1 << 11
const TRANSPORT_ROUTE_DISABLED = 1 << 12
const JP_SUPPLY_PORT = 1 << 13
const AP_SUPPLY_PORT = 1 << 14
const JP_SUPPLIED_HEX = 1 << 15
const BR_SUPPLIED_HEX = 1 << 16
const JOINT_SUPPLIED_HEX = 1 << 17
const US_SUPPLIED_HEX = 1 << 18
const JP_SUPPLY_AIRFIELD = 1 << 19
const AP_SUPPLY_AIRFIELD = 1 << 20
const HEX_TEMP_FLAG1 = 1 << 21
const HEX_TEMP_FLAG2 = 1 << 22
const HEX_TEMP_FLAG3 = 1 << 23

const JP_UNITS = JP_AIR_UNITS | JP_GROUND_UNITS | JP_NAVAL_UNITS | JP_HQ_UNITS
const AP_UNITS = JP_UNITS << 1
const JP_GA_UNITS = JP_AIR_UNITS | JP_GROUND_UNITS
const JP_GAH_UNITS = JP_AIR_UNITS | JP_GROUND_UNITS | JP_HQ_UNITS
const NON_SUPPLY_MASK = [...Array(9).keys()].reduce((a, b) => a + Math.pow(2, b + 4), 0)
const CLEAN_UNITS_MASK = [...Array(24).keys()].filter(a => a < 4 || a > 11).reduce((a, b) => a + Math.pow(2, b), 0)
const CLEAN_SUPPLY_MASK = [(NON_SUPPLY_MASK | JP_SUPPLY_PORT | JP_SUPPLY_AIRFIELD | JP_SUPPLIED_HEX), (NON_SUPPLY_MASK | AP_SUPPLY_PORT | AP_SUPPLY_AIRFIELD | BR_SUPPLIED_HEX | JOINT_SUPPLIED_HEX | US_SUPPLIED_HEX)]
const CLEAN_ATTACK_ZONE_MASK = [...Array(22).keys()].reduce((a, b) => a + Math.pow(2, b - 1), 0)
const AP_SUPPLIED_HEX = (BR_SUPPLIED_HEX | JOINT_SUPPLIED_HEX | US_SUPPLIED_HEX)

const LAST_BOARD_HEX = 1476
const NON_PLACED_BOX = 1477
const ELIMINATED_BOX = 1478
const DELAYED_BOX = 1479
const CHINA_BOX = 1500
const TURN_BOX = 1480

const {pieces, cards, map, nations, events} = require("./data.js")

const ROAD_EVENTS = Object.keys(events).filter(k => events[k].road).map(k => {
    var event = events[k]
    event.keys = event.keys.map(h => hex_to_int(h))
    return event
})

//cards
const COL_TSUJI = find_card(JP, 3)
const JN_25_SPECIAL = find_card(JP, 13)
const TOJO_RESIGNS = find_card(JP, 43)
const SHO_GO = find_card(JP, 45)
const GENERAL_ADACHI = find_card(JP, 48)
const DOOLITLE_RAID = find_card(AP, 8)
const SOVIET_INVADE = find_card(AP, 79)

// PIECES
const HQ_CENTRAL_PACIFIC = find_piece("hq_ap_c")
const HQ_SOUTH_WEST = find_piece("hq_ap_sw")
const HQ_SOUTH_GHORMLEY = find_piece("hq_ap_sg")
const HQ_SOUTH_HELSEY = find_piece("hq_ap_sh")
const HQ_MALAYA = find_piece("hq_ap_m")
const HQ_SEAC = find_piece("hq_ap_seac")
const HQ_ABDA = find_piece("hq_ap_abda")
const HQ_ANZAC = find_piece("hq_ap_anzac")

const M_CORPS = find_piece("army_ap_m")
const NL_CORPS = find_piece("army_ap_nl")
const SL_CORPS = find_piece("army_ap_sl")
const HK_DIVISION = find_piece("army_ap_hk")
const ARMOR_BRIG = find_piece("army_ap_7")
const US_FEAF = find_piece("air_ap_feaf")
const LRB_19 = find_piece("air_ap_19_lrb")
const LRB_14 = find_piece("air_ap_14_lrb")
const AF7 = find_piece("air_ap_7")
const AF7_LRB = find_piece("air_ap_7_lrb")
const US_ASIA_CA = find_piece("casia")
const N_ORLEANS = find_piece("orleans")
const B_29_1 = ap_air("20_bc")
const B_29_2 = ap_air("21_bc")
const ARMOR_BRIGADE = ap_army("7")


const HQ_YAMAMOTO = find_piece("hq_jp_cy")
const HQ_OZAWA = find_piece("hq_jp_co")
const HQ_JP_SOUTH = find_piece("hq_jp_s")
const HQ_SOUTH_SEAS = find_piece("hq_jp_ss")
const KOREAN_ARMY = find_piece("army_jp_kor")
const ED_ARMY = find_piece("army_jp_ed")

//hexes
const AIR_FERRY = hex_to_int(5408)
const FRENCH_FRIGATE_SHOALS = hex_to_int(5508)
const MORESBY = hex_to_int(3823)
const WEST_HONSHU = hex_to_int(3606)
const KWAI_BRIDGE = hex_to_int(2108)
const KWAI_BRIDGE_1 = hex_to_int(2109)
const AKYAB = hex_to_int(2006)
const MANDALAY = hex_to_int(2106)
const IMPHAL = hex_to_int(2105)
const RANGOON = hex_to_int(2008)
const JARHAT = hex_to_int(2104)
const DACCA = hex_to_int(1905)
const MADRAS = hex_to_int(1406)
const KUNMING = hex_to_int(2407)
const TOKYO = hex_to_int(3706)
const OAHU = hex_to_int(5808)
const TOKYO_AIR_BASES = [3307, 3704, 3407, 3506, 3507, 3607, 3706, 3705, 3305, 3306, 3303, 3209, 3709].map(h => hex_to_int(h))

const COM_REPLACEMENT_POINTS = [1307, 1308, 2114, 2709, 3727].map(h => hex_to_int(h))

function find_piece(id) {
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].id === id) {
            return i
        }
    }
    throw new Error("Missed unit " + id);
}

function find_card(faction, num) {
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].faction === faction && cards[i].num === num) {
            return i
        }
    }
    throw new Error(`Missed card ${faction} ${num}`);
}

/* INIT */

const MAP_DATA = []
const AIRFIELD_LINKS = []

map.forEach(h => MAP_DATA[hex_to_int(h.id)] = h)

for (let i = 0; i <= LAST_BOARD_HEX; ++i) {
    let hex = MAP_DATA[i]
    if (!hex) {
        hex = {id: int_to_hex(i), terrain: OCEAN, region: "Ocean"}
        MAP_DATA[i] = hex
    }

    hex.edges_int = 0
    hex.coastal = false
    let nh = get_near_hexes(i)
    for (let j = 0; j < nh.length; j++) {

        let near_hex = MAP_DATA[nh[j]]
        let nh_index = (j + 3) % 6

        let border = GROUND

        if (nh[j] < 0) {
            border = MAP_BORDER
        } else if (hex.edges) {
            border = hex.edges[j] | (hex.edges[j] & ROAD ? GROUND : 0)
        } else if (near_hex && near_hex.edges) {
            border = near_hex.edges[nh_index]
        } else if (hex.island || hex.terrain === ATOLL || hex.terrain === OCEAN) {
            border = 1
        }

        if (j === 3 && border & MAP_BORDER) {
            hex.supply_source = AP //south side of the map
        }
        hex.coastal = hex.coastal || (border & WATER)
        hex.edges_int = hex.edges_int | (border << 5 * j)

    }
    if (hex.terrain === ATOLL) {
        hex.island = true
    }
    if (hex.airfield || hex.port || hex.port || hex.city || hex.resource) {
        hex.named = true
    }
    if (hex.city === JAPANESE_CITY) {
        hex.supply_source = JP
    } else if (i < 29 || i > (LAST_BOARD_HEX - 29)) {
        hex.supply_source = AP ////left or right side of the map
    }
}

for (var i = 0; i < map.length; i++) {
    if (!map[i].airfield) {
        continue
    }
    var links = []
    var hex_i = hex_to_int(map[i].id)
    for (var j = 0; j < map.length; j++) {
        if (!map[j].airfield || i === j) {
            continue
        }
        var hex_j = hex_to_int(map[j].id)
        let distance = get_distance(hex_i, hex_j)
        if (distance <= 8) {
            links.push([hex_j, distance])
        }
    }
    map_set(AIRFIELD_LINKS, hex_i, links.sort((a, b) => a[1] - b[1]).flatMap(a => a))
}

function get_hq_supply_type(piece) {
    if (!piece.faction) {
        return JP_SUPPLIED_HEX
    } else if (piece.service === "us") {
        return US_SUPPLIED_HEX
    } else if (piece.service === "br") {
        return BR_SUPPLIED_HEX
    } else {
        return JOINT_SUPPLIED_HEX
    }
}

function get_unit_replacement_type(piece) {
    if (piece.notreplaceable || piece.class === "hq") {
        return null
    }
    if (piece.service === "ch") {
        return "CHINESE"
    } else if (piece.class === "naval" && (piece.service === "au" || piece.service === "br")) {
        return "COMMONWEALTH"
    } else if (piece.class === "air") {
        return "AIR"
    } else if (piece.class === "ground") {
        return "GROUND"
    }
    return "NAVAL"
}

function get_unit_supply_type(piece) {
    if (!piece.faction) {
        return JP_SUPPLIED_HEX
    } else if (piece.service === "ch" || piece.class === "air" && (piece.service === "navy" || piece.service === "army")) {
        return AP_SUPPLIED_HEX
    } else if (piece.service === "br" || piece.service === "au" || piece.service === "bu" || piece.service === "ind") {
        return BR_SUPPLIED_HEX | JOINT_SUPPLIED_HEX
    } else if (piece.service === "navy" || piece.service === "army") {
        return US_SUPPLIED_HEX | JOINT_SUPPLIED_HEX
    } else if (piece.service === "du") {
        return JOINT_SUPPLIED_HEX
    }
    throw new Error("Invalid piece supply: " + piece.name)
}

for (var i = 0; i < pieces.length; i++) {
    const piece = pieces[i]
    piece.u = i
    const supply = piece.class === "hq" ? get_hq_supply_type(piece) : get_unit_supply_type(piece)
    piece.supply = supply
    piece.replacement = get_unit_replacement_type(piece)
    if (piece.class === "naval" && !piece.faction) {
        piece.service = "navy"
        if (["ca", "cl", "apd"].includes(piece.type)) {
            piece.organic = true
        }
    }

    if (!piece.ebr && piece.br) {
        piece.ebr = piece.br
    }

    if (i === jp_army("kor")) {
        piece.asp = 4
        piece.aspr = 2
        piece.strat_move = true
    } else if (i === ARMOR_BRIG) {
        piece.strat_move = true
    } else if (piece.class === "ground" && ["du", "ind", "ch", "bu"].includes(piece.service)) {
        piece.strat_move = false
    } else if (piece.class === "ground" && piece.size < 3) {
        piece.asp = 1
        piece.aspr = 1
        piece.strat_move = true
    } else if (piece.class === "ground") {
        piece.asp = 2
        piece.aspr = 1
        piece.strat_move = true
    }
}


/* DATA */


/* SEQUENCE OF PLAY */

P.strategic_phase = script(`
    log ("Turn " + G.turn + ", Strategic phase")
    eval {
        check_jp_resources_event()
    }
    set G.active AP 
    call reinforcement_segment
    set G.active JP 
    call reinforcement_segment
    log ("Replacement segment")
    set G.active AP 
    call replacement_segment {scheduled_points: 1}
    set G.active JP
    call replacement_segment {scheduled_points: 1}
    call submarine_warfare
    call strategic_bombing
    call deal_cards
    eval {
        G.pow = Math.min(4,G.asp[AP][0])
    }
    goto offensive_phase
`)

function wie_roll_result() {
    if (G.wie >= 10) {
        return 7
    } else if (G.wie >= 8) {
        return 5
    } else if (G.wie >= 6) {
        return 3
    } else if (G.wie >= 3) {
        return 1
    }
    return 0
}

function try_delay_reinforcement(u, piece, location) {
    if (G.active === JP || location === DELAYED_BOX || set_has(G.not_delayed, u) || piece.class === "hq" || u === B_29_1 || u === B_29_2) {
        set_delete(G.not_delayed, u)
        return false
    }
    var result = G.wie > 2 || piece.service === "army" && G.inter_service[AP]
    if (result) {
        set_location(u, DELAYED_BOX)
        sent_to_europe(u)
    }
    return result
}

function sent_to_europe(u) {
    var piece = pieces[u]
    var result = false
    if (piece.faction === AP && G.wie >= 3 && (piece.service === "army" || piece.type === "cve")) {
        var modifier = wie_roll_result() + G.inter_service[AP]
        var roll = random(10)
        result = roll <= modifier
        log(`${piece.name} sent to Europe roll ${roll} ${result ? "<=" : ">"} ${modifier} ${G.inter_service[AP] ? "(ISR active)" : ""}`)
        if (result) {
            log(`${piece.name} sent to Europe`)
            displace_to_turn(u, 3)
        }
    }
    return result
}

function get_unit_reinforcement_hexes(u) {
    var piece = pieces[u]
    var faction = piece.faction
    var result = []
    if (piece.service === "ch") {
        return [KUNMING]
    }
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        var map_data = MAP_DATA[i]
        if ((piece.class === "air" && map_data.airfield || piece.class !== "air" && map_data.port)
            && is_space_controlled(i, faction)
            && check_unit_supply(i, u, piece)
            && !is_overstack(i, u)) {
            set_add(result, i)
        }

    }
    return result
}

function get_hq_reinforcement_hexes() {
    let result = []
    const faction = G.active
    let queue = []
    const overland_set = []
    const oversea_set = []
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        if (MAP_DATA[i].supply_source === faction) {
            queue.push(i)
            set_add(overland_set, i)
            set_add(oversea_set, i)
            if (MAP_DATA[i].port && is_space_controlled(i, faction) && !(G.overstack[i] & 1)) {
                set_add(result, i)
            }
        }
    }
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const MD = MAP_DATA[item]
        const overland = set_has(overland_set, item)
        const non_neutral_zoi_s = has_non_n_zoi(item, 1 - faction)
        const enemy_port_s = (MD.port && is_space_controlled(item, 1 - faction))
        const occupied_land_s = G.supply_cache[item] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[item] & JP_GAH_UNITS << faction)
        const oversea = set_has(oversea_set, item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0 || nh > LAST_BOARD_HEX) {
                continue
            }
            var reachable = false
            const enemy_port = enemy_port_s || (MD.port && is_space_controlled(nh, 1 - faction))
            const occupied_land = occupied_land_s || G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (!set_has(overland_set, nh) && (overland || (MD.port && !enemy_port)) && MD.edges_int & GROUND << 5 * j && !occupied_land) {
                reachable = true
                set_add(overland_set, nh)
            }
            const non_neutral_zoi = non_neutral_zoi_s || has_non_n_zoi(nh, 1 - faction)
            if (!set_has(oversea_set, nh) && (oversea || (MD.port && !enemy_port)) && MD.edges_int & WATER << 5 * j && !non_neutral_zoi) {
                reachable = true
                set_add(oversea_set, nh)
            }
            if (reachable) {
                queue.push(nh)
            }
            if (reachable && MAP_DATA[nh].port && is_space_controlled(nh, faction) && !(G.overstack[nh] & 1)) {
                set_add(result, nh)
            }
        }
    }
    return result
}

function is_reinforcement_denied(piece) {
    return (piece.service === "au" && is_event_active(events.AUSTRALIA_SURRENDER) && !set_has(G.reduced, piece.u))
        || (piece.service === "ind" && G.surrender[nations.INDIA.id] >= 4)
        || (is_event_active(events.INDEPENDENCE_CAMPAIGN) && piece.class === "ground" &&
            (piece.service === "ind" || piece.service === "au" || piece.service === "br"));
}

P.reinforcement_segment = {
    _begin() {
        log(`${G.active === AP ? "Allied" : "Japan"} reinforcement segment`)
        if (G.wie <= 7 && G.active === AP) {
            change_asp(AP, 1)
        } else if (G.active === AP) {
            log(`War in europe prevent from AP amphibious shipping reinforcement`)
        }
        L.hq_reinforcement = []
        L.unit_reinforcement = []
        var reinforcement_hex = G.active === AP ? hex_to_int(5709) : hex_to_int(3808)
        var delayed_units = false
        for_each_unit((u, piece, location) => {
            if (piece.faction !== G.active || !(
                piece.reinforcement === G.turn
                || location === DELAYED_BOX
                || location === TURN_BOX + G.turn
            )) {
                return
            }
            if (piece.reinforcement === G.turn && piece.start_reduced) {
                set_add(G.reduced, u)
            }
            if (is_reinforcement_denied(piece)) {
                eliminate_permanently(u)
                return;
            }
            if (try_delay_reinforcement(u, piece, location)) {
                delayed_units = true
                return;
            }
            set_location(u, reinforcement_hex)
            if (piece.class === "hq") {
                set_add(L.hq_reinforcement, u)
            }
            set_add(L.unit_reinforcement, u)
        })
        if (L.hq_reinforcement.length) {
            L.allowed_hexes = get_hq_reinforcement_hexes()
        }
        if (delayed_units) {
            log(`US reinforcements delayed`)
        }
    },
    prompt() {
        if (G.active_stack.length) {

            L.allowed_hexes.forEach(hex => action_hex(hex))
            if (L.allowed_hexes.length === 0) {
                prompt(`Choose hex to place ${pieces[G.active_stack[0]].name} as reinforcement. (Not possible hexes).`)
                button("delay")
            } else {
                prompt(`Choose hex to place ${pieces[G.active_stack[0]].name} as reinforcement.`)
                button("delay")
            }
            return
        }
        var hq_in_list = false
        L.hq_reinforcement.filter(hq => L.unit_reinforcement.includes(hq)).forEach(hq => {
            hq_in_list = true
            action_unit(hq)
        })
        if (hq_in_list) {
            prompt(`Choose hq to place as reinforcement.`)
            return
        }
        L.unit_reinforcement.forEach(u => action_unit(u))
        if (!L.unit_reinforcement.length) {
            button("done")
        }
        prompt(`Choose unit to place as reinforcement.`)
    },
    unit(u) {
        push_undo()
        G.active_stack = [u]
        set_delete(L.unit_reinforcement, u)
        if (pieces[u].class !== "hq") {
            L.allowed_hexes = get_unit_reinforcement_hexes(u)
        }
    },
    action_hex(hex) {
        push_undo()
        log(`${pieces[G.active_stack[0]].name} placed to ${int_to_hex(hex)}`)
        set_location(G.active_stack[0], hex)
        if (pieces[G.active_stack[0]].class === "hq") {
            set_delete(L.allowed_hexes, hex)
            G.supply_cache[hex] |= pieces[G.active_stack[0]].supply
        }
        G.active_stack = []
    },
    delay() {
        push_undo()
        set_location(G.active_stack[0], DELAYED_BOX)
        if (!sent_to_europe(G.active_stack[0])) {
            log(`${pieces[G.active_stack[0]].name} delayed to next turn`)
        }
        G.active_stack = []
    },
    done() {
        push_undo()
        check_supply()
        end()
    }
}


function get_replacement_points() {
    var result = {}
    if (G.active === JP) {
        G.reinforcements.NAVAL += ([3, 4, 11].includes(G.turn) ? 1 : 0)
        result.NAVAL = G.reinforcements.NAVAL
        result.AIR = G.reinforcements.AIR
        return result
    }
    if (is_space_controlled(OAHU, AP)) {
        result.NAVAL = 2
    } else {
        result.NAVAL = 1
    }
    if ([6, 9, 12].includes(G.turn) && COM_REPLACEMENT_POINTS.filter(h => is_space_controlled(h, AP)).length) {
        result.COMMONWEALTH = 1
    }
    result.GROUND = 2
    result.AIR = 5
    if (G.turn >= 3 && G.turn % 2 === 1) {
        result.CHINESE = 1
    }
    if (is_event_active(events.INDEPENDENCE_CAMPAIGN)) {
        result.GROUND -= 1
        log(`-1 AP ground replacement, Indian independence campaign (no commonwealth units could be replaced)`)
    }
    return result
}

function print_reinforcements() {
    var reinf = L.replacement_points
    var string = ""
    if (reinf.NAVAL !== undefined) {
        string += `${G.active === AP ? "US Naval" : "Naval"}: ${reinf.NAVAL}`
    }
    if (reinf.COMMONWEALTH !== undefined) {
        string += ", Commonwealth: " + reinf.COMMONWEALTH
    }
    if (reinf.AIR !== undefined) {
        string += `, Air: ${reinf.AIR}`
    }
    if (reinf.GROUND !== undefined) {
        string += `, Ground: ${reinf.GROUND}`
    }
    if (reinf.CHINESE !== undefined) {
        string += `, China: ${reinf.CHINESE}`
    }
    if (L.divisions >= 0) {
        string += ", Divisions from China: " + L.divisions
    }
    if (string.startsWith(", ")) {
        string = string.replace(", ", "")
    }
    return string
}

P.replacement_segment = {
    _begin() {
        if (L.scheduled_points) {
            L.replacement_points = get_replacement_points()
            L.divisions = G.active === JP ? Math.min(2, G.china_divisions) : undefined
        }
        L.divisions_used = 0
        L.replacable_units = []
        L.allowed_hexes = []
        for_each_unit((u, piece, location) => {
            if (piece.faction === G.active
                && !piece.notreplaceable
                && !is_reinforcement_denied(piece)
                && !set_has(G.oos, u)
                && (location === ELIMINATED_BOX || set_has(G.reduced, u))) {
                set_add(L.replacable_units, u)
            }
        })
        trigger_event("before_replacement")
    },
    prompt() {
        if (G.active_stack.length > 0) {
            prompt(`Choose hex to place ${pieces[G.active_stack[0]].name}.`)
            L.allowed_hexes.forEach(h => action_hex(h))
            return
        }
        if (L.divisions_used <= 0 || L.replacement_points.GROUND <= 0) {
            button("done")
        }
        if (L.divisions) {
            action("divisions", 0)
        }

        prompt(`Choose unit to reinforce. ` + print_reinforcements())
        L.replacable_units.filter(u => L.replacement_points[pieces[u].replacement] > 0).forEach(u => action_unit(u))

    },
    divisions() {
        push_undo()
        L.divisions -= 1
        G.china_divisions -= 1
        L.divisions_used++
        log(`Japanese divisions in China reduced to ${G.china_divisions}`)
        if (L.replacement_points.GROUND) {
            L.replacement_points.GROUND++
        } else {
            L.replacement_points.GROUND = 1
        }
    },
    action_hex(hex) {
        push_undo()
        log(`${pieces[G.active_stack[0]].name} placed to ${int_to_hex(hex)}`)
        set_location(G.active_stack[0], hex)
        G.active_stack = []
    },
    unit(u) {
        push_undo()
        if (set_has(G.reduced, u)) {
            set_delete(G.reduced, u)
            set_delete(L.replacable_units, u)
        } else {
            set_add(G.reduced, u)
            G.active_stack = [u]
            L.allowed_hexes = get_unit_reinforcement_hexes(u)
        }
        L.replacement_points[pieces[u].replacement] -= 1
        if (G.active === JP && (pieces[u].replacement === "AIR" || pieces[u].replacement === "NAVAL")) {
            G.reinforcements[pieces[u].replacement] -= 1
        }
    },
    done() {
        push_undo()
        check_supply()
        end()
    }
}

function change_asp(faction, count) {
    var size = G.asp[faction][0]
    if (size + count <= 0) {
        G.asp[faction][0] = 1
    } else {
        G.asp[faction][0] += count
    }
    if (size !== G.asp[faction][0]) {
        log(`${faction === AP ? "Allied" : "Japanese"} amphibious shipping points changed to ${G.asp[faction][0]} (${count})`)
    }
}

P.submarine_warfare = {
    _begin() {
        G.active = AP
    },
    prompt() {
        prompt("Roll for a submarine warfare.")
        button("roll")
    },
    roll() {
        var result = random(10)
        var modifiers = 0
        log(`US submarine warfare.`)
        if (G.turn <= 4) {
            modifiers += 1
            log(`+1 Defective torpedoes (1942)`)
        }
        if (is_event_active(events.MIGHTY_JP_ESCORTS)) {
            modifiers += 4
            log(`+4 Escort`)
        } else if (is_event_active(events.JP_ESCORTS)) {
            modifiers += 2
            log(`+2 Escort`)
        }
        log(`Submarine warfare roll : ${result} ${modifiers ? "+" + modifiers : ""} `)
        if (result + modifiers - G.turn <= 0) {
            log(`(Success) ${result + modifiers} <= ${G.turn}`)
            G.strategic_warfare++
            if (is_event_active(events.MIGHTY_JP_ESCORTS)) {
                G.events[events.MIGHTY_JP_ESCORTS.id] = 0
                G.events[events.JP_ESCORTS.id] = G.turn
                log(`Escort reduced +2`)
            } else if (is_event_active(events.JP_ESCORTS)) {
                G.events[events.JP_ESCORTS.id] = 0
                log(`Escort modifier removed`)
            }
            change_asp(JP, -1)
        } else {
            log(`(Failed) ${result + modifiers} > ${G.turn}`)
        }
        end()
    },
}

P.strategic_bombing = {
    _begin() {
        L.allowed_units = []
        var units = [B_29_1, B_29_2]
        units.forEach(u => {
            var check_location = G.location[u] < LAST_BOARD_HEX && get_distance(G.location[u], TOKYO) <= 8 || G.location[u] === CHINA_BOX
            if (check_location && !set_has(G.oos, u) && !G.committed.includes(u)) {
                set_add(L.allowed_units, u)
            }
        })
        G.active = AP
        G.active_stack = []
        if (!L.allowed_units.length) {
            end()
        }
    },
    prompt() {
        prompt("Choose units to strategic bombing.")
        if (G.active_stack.length > 0) {
            button("roll")
        } else {
            button("skip")
        }
        L.allowed_units.forEach(u => action_unit(u))
        button("all")
    },
    unit(u) {
        push_undo()
        set_add(G.active_stack, u)
        set_delete(L.allowed_units, u)
    },
    all() {
        L.allowed_units.forEach(u => set_add(G.active_stack, u))
        this.roll()
    },
    skip() {
        log(`No units committed to strategic bombing`)
        G.events[events.STRAT_BOMBING_CAMPAIGN.id] = 0
        end()
    },
    roll() {
        log(`Roll for strategic bombing`)
        var close_air_base = TOKYO_AIR_BASES.filter(h => !set_has(G.control, h)).length > 0
        if (!G.active_stack.map(u => bombing(u, close_air_base)).reduce((a, b) => a || b, false)) {
            G.events[events.STRAT_BOMBING_CAMPAIGN.id] = 0
        }
        G.active_stack = []
        clear_undo()
        end()
    },
}

function bombing(u, close_air_base) {
    var result = random(10)
    var success_rate = 9 - (set_has(G.reduced, u) ? 4 : 0)
    var success = result < success_rate
    var damaged = result >= 9 && !close_air_base
    log(`${result} for ${pieces[u].name}`)
    log(`${success ? "Success" : "Failed"}: ${result} ${success ? "<" : ">="} ${success_rate} ${damaged ? "(unit damaged)" : ""}`)
    if (damaged && set_has(G.reduced, u)) {
        eliminate(u)
    } else if (damaged) {
        set_add(G.reduced, u)
    }
    set_add(G.committed, u)
    if (success) {
        G.strategic_warfare++
        check_event(events.STRAT_BOMBING)
        check_event(events.STRAT_BOMBING_CAMPAIGN)
    }
    return success
}

P.deal_cards = function () {
    var jp_cards = 7
    if (G.turn > 4) {
        var jp_resources = get_jp_resources()
        jp_cards = Math.max(Math.ceil(jp_resources / 2), 4)
        log(`Japan resources - ${jp_resources} (${jp_cards} cards)`)
    } else {
        log(`Japan use strategic reserves (${jp_cards} cards)`)
    }
    if (G.strategic_warfare) {
        jp_cards = Math.max(jp_cards - G.strategic_warfare, 4)
        log(`Strategic warfare reduces draw to ${jp_cards} (-${G.strategic_warfare})`)
    }
    G.passes[JP] = 0
    if (jp_cards === 6) {
        G.passes[JP] = 1
    } else if (jp_cards <= 5) {
        G.passes[JP] = 2
    }
    if (G.passes[JP]) {
        log(`Japan receives ${G.passes[JP]} passes`)
    }
    for (let i = 0; i < jp_cards; i++) {
        draw_card(JP)
    }

    let ap_cards = 7
    G.passes[AP] = 0
    if (G.turn === 1) {
        ap_cards = 0
    } else if (G.turn === 2) {
        ap_cards = 5
        G.passes[AP] = 2
    } else if (G.turn === 3) {
        ap_cards = 6
        G.passes[AP] = 1
    }
    if (G.surrender[nations.CHINA.id] >= 5) {
        ap_cards -= 1
        G.passes[AP]++
        log(`Allied draw reduced by China`)
    }
    if (G.surrender[nations.INDIA.id] >= 4) {
        ap_cards -= 1
        G.passes[AP]++
        log(`Allied draw reduced by India`)
    }
    if (G.surrender[nations.AUSTRALIA.id]) {
        ap_cards -= 1
        G.passes[AP]++
        log(`Allied draw reduced by Australia`)
    }
    if (G.wie >= 10) {
        ap_cards -= 1
        G.passes[AP]++
        log(`Allied draw reduced by War in Europe`)
    }
    ap_cards = Math.max(ap_cards, 4)
    G.passes[AP] = Math.min(G.passes[AP], 2)
    log(`Allied draw ${ap_cards} cards, receive ${G.passes[AP]} passes`)
    for (let i = 0; i < ap_cards; i++) {
        draw_card(AP)
    }
    draw_all_cards()
    end()
}

P.offensive_phase = script(`
    log ("Offensives phase")
    call initiative_segment
    eval {
        G.active = G.first_active 
        reset_offensive()
        G.offensive.attacker = G.active
    }
    while (G.hand[AP].length > 0 || G.hand[JP].length > 0) {
        if (G.hand[G.active].length > 0){
            call offensive_segment
            eval {
                G.active = 1 - G.offensive.attacker
                reset_offensive()
                G.offensive.attacker = G.active
            }
        } else {
            set G.active (1 - G.active)
        }
    }
    goto political_phase
`)

P.initiative_segment = script(`
    eval {
        if (G.hand[AP].length > G.hand[JP].length) {
            G.active = AP
        } else if (G.hand[JP].length > G.hand[AP].length) {
            G.active = JP
        } else {
            G.active = G.turn <= 4 ? 0 : 1
        }
        G.first_active = G.active
    }
    if (G.hand[JP].length !== G.hand[AP].length) {
        set G.active 1-G.active
        goto future_offensive
    }
`)

P.future_offensive = {
    _begin() {
        L.pass = false
        if (G.future_offensive[G.active] <= 0) {
            end()
        }
        var card = cards[G.future_offensive[G.active] > 0 ? G.future_offensive[G.active] : 0]
        if (card.type !== MILITARY || !event_hq_check(card)) {
            L.pass = true
        }
    },
    prompt() {
        prompt("Play future offensive card or pass.")
        if (L.pass) {
            button("done")
        } else {
            button("pass")
            action("event", G.future_offensive[G.active])
        }
    },
    event(c) {
        push_undo()
        military_card(c)
        log(`${R} played ${cards[c].name} as event card`)
        goto("offensive_sequence")
    },
    pass() {
        push_undo()
        L.pass = true
    },
    done() {
        end()
    }
}

function event_hq_check(card) {
    if (!card.hq) {
        return true
    }
    for (var hq of card.hq) {
        if (unit_on_board(hq) && !set_has(G.oos, hq)) {
            return true
        }
    }
    return false
}

function is_imphal_build_enabled() {
    var mandalay = G.supply_cache[MANDALAY]
    var rangoon = G.supply_cache[RANGOON]
    var imphal = G.supply_cache[IMPHAL]
    return is_space_controlled(RANGOON, JP) && is_space_controlled(MANDALAY, JP)
        && (rangoon & JP_SUPPLY_PORT) && !(mandalay & AP_UNITS) && !(rangoon & AP_UNITS)
        && !(imphal & AP_UNITS) && is_space_controlled(IMPHAL, JP)
        && !((hex_to_int(2007) & AP_UNITS) && (hex_to_int(2107) & AP_UNITS))
}

function get_infrastructure_actions() {
    if (R === AP && check_nation_controlled(nations.INDIA, AP) && is_space_controlled(AKYAB, AP)) {
        if (!is_event_active(events.JARHAT_ROAD)) {
            return ["jarhat"]
        }
        var result = []
        if (!is_event_active(events.LEDO_ROAD)) {
            result.push("ledo")
        }
        if (!is_event_active(events.IMPHAL_ROAD)) {
            result.push("imphal")
        }
        return result
    }
    if (R === JP && !is_event_active(events.IMPHAL_ROAD) && is_imphal_build_enabled()) {
        return ["imphal"]
    }
    return []
}

function get_allowed_actions(num) {
    let card = cards[num]
    if (num === TOJO_RESIGNS && G.turn >= 8 || num === SOVIET_INVADE && is_event_active(events.TOJO)) {
        return ["event"]
    } else if (num === TOJO_RESIGNS) {
        return ["event", "ops", "discard"]
    } else if (num === SOVIET_INVADE) {
        return ["ops"]
    }
    let result = ["ops", "discard"]
    if ((card.type === MILITARY && event_hq_check(card) || card.type === POLITICAL || card.type === RESOURCE) && card.can_play()) {
        result.push("event")
    }
    if (card.ops >= 3) {
        // result.push("inter_service")
        get_infrastructure_actions().forEach(a => result.push(a))
        if (R === JP && G.turn - G.events[events.CHINA_OFFENSIVE.id] > 1 && G.surrender[nations.CHINA.id] < 5) {
            result.push("china_offensive")
        }
    }
    if (G.future_offensive[R] <= 0 && !card.reshuffle) {
        result.push("future_offensive")
    }
    return result
}

function military_card(c) {
    activate_card(c)
    G.offensive.type = EC
    var card = cards[c]
    if (card.logistic) {
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
    G.offensive.active_cards.push(c)
    if (cards[c].intelligence && G.offensive.intelligence !== AMBUSH && G.offensive.intelligence !== cards[c].intelligence) {
        G.offensive.intelligence = cards[c].intelligence
        log(`Intelligence condition changed to ${get_named_intelligence(G.offensive.intelligence)}`)
    }
}

function get_named_intelligence(int) {
    if (int === SURPRISE) {
        return "surprise"
    } else if (int === AMBUSH) {
        return "ambush"
    } else {
        return "intercept"
    }
}

function play_event(c) {
    var faction = cards[c].faction
    if (G.future_offensive[faction] === c) {
        G.future_offensive[faction] = -1
        G.events[events.FUTURE_OFFENSIVE_JP.id + faction] = 0
    } else {
        array_delete_item(G.hand[faction], c)
    }
    if (cards[c].remove) {
        set_add(G.removed, c)
    } else {
        set_add(G.discard[faction], c)
    }
    if (cards[c].draw) {
        into_turn_draw(faction)
    }
}

function activate_card(c) {
    var faction = cards[c].faction
    G.offensive.active_cards.push(c)
    G.offensive.offensive_card = c
    if (G.future_offensive[faction] === c) {
        G.future_offensive[faction] = -1
        G.events[events.FUTURE_OFFENSIVE_JP.id + faction] = 0
    } else {
        array_delete_item(G.hand[faction], c)
    }
    set_add(G.discard[faction], c)
    G.offensive.attacker = faction
    if (!cards[c].faction && cards[c].ops >= 3) {
        G.offensive.barges = true
    }
    G.offensive.naval_move_distance = (cards[c].ops * 5)
    //todo debug
    G.offensive.naval_move_distance = 30
    G.offensive.ground_move_distance = (cards[c].ops * 2)
    G.offensive.air_move_distance = (cards[c].ops)
    G.offensive.logistic = cards[c].ops
}

function get_hand(side) {
    if (G.events[events.FUTURE_OFFENSIVE_JP.id + R] < G.turn && G.future_offensive[R] >= 0) {
        var result = G.hand[side].slice()
        result.push(G.future_offensive[R])
        return result
    } else {
        return G.hand[side]
    }
}

function build_road(card, event) {
    push_undo()
    activate_card(card)
    check_event(event)
    log(`${R === AP ? "Allies" : "Japan"} build infrastructure ${event.name}`)
    check_supply()
    goto("end_action")
}

P.offensive_segment = {
    _begin() {
        L.debug = false
        L.eliminate = false
        if (G.active === AP) {
            G.offensive.weather_rollback = copy_state()
        }
    },
    prompt() {
        prompt("Turn " + G.turn + " Take one action.")
        if (G.passes[R] > 0) {
            button("pass")
        }
        var hand = get_hand(R)
        for (let i = 0; i < hand.length; i++) {
            let card = hand[i]
            get_allowed_actions(card).forEach(a => action(a, card))
        }
        console.log(Object.keys(G))
        // console.log(Object.keys(G.active_stack))
        console.log(G.undo)
        //debug
        button("isr")
        button("ns")
        button("control")
        button("eliminate")
        button("deploy_b29")
        if (L.debug) {
            for (var i = 1; i < MAP_DATA.length; i++) {
                if (is_controllable_hex(i)) {
                    action_hex(i)
                }
            }
        }
        if (L.eliminate) {
            for_each_unit_on_map(u => action_unit(u))
        }
    },
    ops(c) {
        push_undo()
        activate_card(c)
        G.offensive.type = OC
        log(`${R} played ${cards[c].name} as operation card`)
        goto("offensive_sequence")
    },
    event(c) {
        push_undo()
        log(`${R} played ${cards[c].name} as event card`)
        if (cards[c].type === MILITARY) {
            military_card(c)
            goto("offensive_sequence")
        } else {
            play_event(c)
            G.offensive.active_cards.push(c)
            G.offensive.offensive_card = c
            goto("default_event")
        }
    },
    discard(c) {
        push_undo()
        activate_card(c)
        log(`${R} discards ${cards[c].name}`)
        goto("end_action")
    },
    inter_service() {
    },
    jarhat(c) {
        build_road(c, events.JARHAT_ROAD)
    },
    imphal(c) {
        build_road(c, events.IMPHAL_ROAD)
    },
    ledo(c) {
        build_road(c, events.LEDO_ROAD)
    },
    china_offensive(c) {
        push_undo()
        activate_card(c)
        goto("china_offensive")
    },
    future_offensive(c) {
        push_undo()
        log(`${R} played future offensive`)
        G.events[events.FUTURE_OFFENSIVE_JP.id + R] = G.turn
        G.future_offensive[R] = c
        array_delete_item(G.hand[R], c)
        goto("end_action")
    },
    pass() {
        push_undo()
        G.passes[R] -= 1
        goto("end_action")
    },
    //debug
    isr() {
        G.inter_service[R] = 1 - G.inter_service[R]
    },
    ns() {
        G.hand[AP].forEach(c => {
            G.discard[AP].push(c)
        })
        G.hand[JP].forEach(c => {
            G.discard[JP].push(c)
        })
        G.hand = [[], []]
        goto("political_phase")
    },
    control() {
        L.debug = !L.debug
    },
    eliminate() {
        L.eliminate = !L.eliminate
    },
    action_hex(hex) {
        capture_hex(hex, set_has(G.control, hex) ? AP : JP)
        check_supply()
    },
    unit(u) {
        if (set_has(G.reduced, u)) {
            eliminate(u)
        } else {
            set_add(G.reduced, u)
        }
    },
    deploy_b29() {
        capture_hex(hex_to_int(3709), AP)
        set_location(ap_air("20_bc"), hex_to_int(3709))
        set_location(ap_air("21_bc"), hex_to_int(3709))
    },
}

P.china_offensive = {
    prompt() {
        prompt(`Start China Offensive.`)
        button("roll")
    },
    roll() {
        G.events[events.CHINA_OFFENSIVE.id] = G.turn
        let result = random(10)
        var air_support = 0
        for_each_unit_on_map((u, piece, location) => {
            if (location === CHINA_BOX && (piece.type !== "lrb" || u === LRB_14)) {
                air_support++
            }
        })
        var burma_road = (2 - G.burma_road) * 4
        var baseline = G.china_divisions - burma_road - air_support
        var success = result <= baseline
        log(`Japan started China offensive`)
        log(`Japanese divisions ${G.china_divisions}, burma road ${burma_road}, AP air support ${air_support}`)
        log(`Roll ${result} ${success ? "<=" : ">"} ${baseline} (${success ? "SUCCESS" : "FAILED"})`)
        if (success) {
            update_china_status(1)
        } else {
            update_china_status(-1)
        }
        clear_undo()
        goto("end_action")
    },
}

P.choose_hq = {
    _begin() {
        L.possible_units = []
        var hq_list = []
        if (R === G.offensive.attacker && G.offensive.type === EC && cards[G.offensive.offensive_card].hq) {
            L.card = G.offensive.offensive_card
            hq_list = cards[G.offensive.offensive_card].hq
        } else if (R !== G.offensive.attacker && G.offensive.counter_offensive_card >= 0 && cards[G.offensive.counter_offensive_card].hq) {
            L.card = G.offensive.counter_offensive_card
            hq_list = cards[G.offensive.counter_offensive_card].hq
        }
        for_each_unit_on_map((u, piece) => {
            if (piece.faction === R && piece.class === "hq" &&
                (!set_has(G.oos, u) || L.card === GENERAL_ADACHI)
                && (
                    R === G.offensive.attacker
                    || G.offensive.battle_hexes.filter(bh => get_distance(bh, G.location[u]) <= piece.cr).length
                )
                && (hq_list.length <= 0 || hq_list.includes(u))
            ) {
                L.possible_units.push(u)
            }
        })
        if (L.possible_units.length === 1) {
            this.unit(L.possible_units[0])
        } else if (!L.possible_units.length) {
            log(`No hq could be selected`)
        }
    },
    prompt() {
        prompt(`${offensive_card_header()} Choose HQ.`)
        L.possible_units.forEach(u => action_unit(u))
    },
    unit(u) {
        push_undo()
        G.offensive.active_hq[R] = u
        if (G.offensive.type === EC && L.card >= 0 && cards[L.card].logistic_alt && cards[L.card].logistic_alt[0].includes(u)) {
            G.offensive.logistic = cards[L.card].logistic_alt[1]
        }
        log(`${pieces[u].name} activated for ${R === G.offensive.attacker ? "offensive" : "reaction"}`)
        end()
    },
}

function get_distance(first_hex, second_hex) {
    if (first_hex > LAST_BOARD_HEX || second_hex > LAST_BOARD_HEX) {
        return 500
    }
    var yf = first_hex % 29
    var ys = second_hex % 29
    var xf = (first_hex - yf) / 29
    var xs = (second_hex - ys) / 29
    var rx = Math.abs(xs - xf)
    var ry = ys - yf - (rx % 2) * (xf % 2)
    if (ry <= (-rx >> 1)) {
        ry = Math.abs(ry) - rx % 2
    } else if (ry < rx >> 1) {
        const c = (rx >> 1) - ry
        ry = (rx >> 1) + ((c + (rx % 2)) >> 1)
        rx -= c
    }
    return rx + ry - (rx >> 1)
}

function apply_inter_service(u) {
    const piece = pieces[u]
    if (!G.inter_service[R] || (piece.service !== "army" && piece.service !== "navy")) {
        return
    }
    const rival_service = piece.service === "army" ? "navy" : "army"
    L.possible_units.filter(i => pieces[i].service === rival_service).forEach(i => set_delete(L.possible_units, i))
}

function solely_occupied_land(hex, faction) {
    return G.supply_cache[hex] & JP_GAH_UNITS << (faction) && !(G.supply_cache[hex] & JP_GAH_UNITS << (1 - faction))
}

function mark_ground_reaction_hexes(location) {
    if (MAP_DATA[location].island) {
        return
    }
    const queue = [location]
    const distance_map = [location, 0]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_distance = map_get(distance_map, item)
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            var distance = base_distance + get_ground_move_cost(nh, item, (j + 3) % 6, R)//to correct distance processing with backward tracing
            if (distance > G.offensive.ground_move_distance
                || distance >= map_get(distance_map, nh, 100)
                || set_has(G.offensive.battle_hexes, nh)) {
                continue
            }
            map_set(distance_map, nh, distance)
            G.supply_cache[nh] |= HEX_TEMP_FLAG3
            if (distance < G.offensive.ground_move_distance) {
                queue.push(nh)
            }
        }
    }
}

function mark_asp_reaction_hexes(hex) {
    if (!MAP_DATA[hex].coastal) {
        return;
    }
    const asp_capable = is_hex_asp_capable(hex)
    const location = hex
    const queue = [location]
    const distance_map = [location, 0]
    const range = G.offensive.naval_move_distance
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        const distance = map_get(distance_map, item) + 1
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (distance > range
                || !(MAP_DATA[item].edges_int & WATER << 5 * j)
                || distance >= map_get(distance_map, nh, 100)) {
                continue
            }
            if (distance < G.offensive.naval_move_distance) {
                queue.push(nh)
            }
            map_set(distance_map, nh, distance)
            G.supply_cache[nh] |= HEX_TEMP_FLAG1
            if (asp_capable) {
                G.supply_cache[nh] |= HEX_TEMP_FLAG2
            }
        }
    }
}

function get_reaction_able_units() {
    clear_supply_cache(CLEAN_ATTACK_ZONE_MASK)
    G.offensive.battle_hexes.forEach(hex => {
        mark_asp_reaction_hexes(hex)
        mark_ground_reaction_hexes(hex)
    })
    const has_asp = Math.max(G.asp[R][0] - G.asp[R][1], 0)
    for_each_unit_on_map((u, piece) => {
        if (piece.faction === R && piece.class === "ground" && G.supply_cache[G.location[u]] & HEX_TEMP_FLAG3) {
            set_add(L.reaction_able_units, u)
        } else if (piece.faction === R && piece.class === "ground" && G.supply_cache[G.location[u]] & HEX_TEMP_FLAG2 && has_asp) {
            set_add(L.asp_ground_units, u)
        } else if (piece.faction === R && piece.class === "naval" && !piece.br && G.supply_cache[G.location[u]] & HEX_TEMP_FLAG1) {
            set_add(L.reaction_able_units, u)
        }
    })
}

function get_activatable_units(hq) {
    const result = []
    L.reaction_able_units = []
    L.asp_ground_units = []
    const reaction_movement = G.offensive.stage === REACTION_STAGE
    if (reaction_movement) {
        get_reaction_able_units()
    }
    clear_supply_cache(CLEAN_ATTACK_ZONE_MASK)
    const location = G.location[hq]
    G.supply_cache[location] |= HEX_TEMP_FLAG3
    const range = pieces[hq].cr
    const faction = pieces[hq].faction
    let queue = [location]
    const distance_map = [location, 0]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const MD = MAP_DATA[item]
        const distance = map_get(distance_map, item) + 1
        const non_neutral_zoi = has_non_n_zoi(item, 1 - faction)
        const occupied_land = solely_occupied_land(item, 1 - faction)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (map_get(distance_map, nh, 100) > distance
                && (
                    (MD.edges_int & GROUND << 5 * j && !occupied_land && !solely_occupied_land(nh, 1 - faction)) ||
                    (MD.edges_int & WATER << 5 * j && !non_neutral_zoi && !has_non_n_zoi(nh, 1 - faction)) ||
                    MD.edges_int & UNPLAYABLE << 5 * j
                )) {
                map_set(distance_map, nh, distance)
                G.supply_cache[nh] |= HEX_TEMP_FLAG3
                if (distance < range) {
                    queue.push(nh)
                }
            }
        }
    }
    const hq_supply_type = pieces[hq].supply
    L.cv_reaction_hex_map = []
    L.air_reaction_hex_map = []
    L.move_data = {}
    G.offensive.battle_hexes.forEach(h => mark_attack_zone(h, R === AP ? 2 : 3))
    for (let i = 0; i < pieces.length; i++) {
        let piece = pieces[i]
        if (piece.supply & hq_supply_type
            && G.supply_cache[G.location[i]] & HEX_TEMP_FLAG3
            && piece.class !== "hq"
            && !set_has(G.offensive.active_units[R], i)
            && (!set_has(G.oos, i) || L.card === GENERAL_ADACHI)
            && (!reaction_movement || is_unit_reaction_able(i))
            && (!G.committed.includes(i) || reaction_movement && is_faction_units(G.location[i], JP))
        ) {
            set_add(result, i)
        }
    }
    return result
}

function is_unit_reaction_able(i) {
    return set_has(L.reaction_able_units, i)
        || set_has(L.asp_ground_units, i) && (pieces[i].asp === 1 || set_has(G.reduced, i) && pieces[i].aspr === 1)
        || is_cv_reaction_able(i)
        || is_air_reaction_able(i)
}

function is_cv_reaction_able(u) {
    const piece = pieces[u]
    if (piece.class !== "naval" || !piece.br) {
        return false
    }
    const location = G.location[u]
    const cached = map_get(L.cv_reaction_hex_map, location)
    if (cached === 1) {
        return true
    } else if (cached === 0) {
        return false
    }
    const queue = [location]
    const distance_map = [location, 0]
    const range = G.offensive.naval_move_distance
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        const distance = map_get(distance_map, item) + 1
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (distance > range
                || !(MAP_DATA[item].edges_int & WATER << 5 * j)
                || distance >= map_get(distance_map, nh, 100)) {
                continue
            }
            if (distance < range) {
                queue.push(nh)
            }
            map_set(distance_map, nh, distance)
            if (G.supply_cache[nh] & HEX_TEMP_FLAG1) {
                map_set(L.cv_reaction_hex_map, location, 1)
                return true
            }
        }
    }
    map_set(L.cv_reaction_hex_map, location, 0)
    return false
}

function is_air_reaction_able(u) {
    const piece = pieces[u]
    if (piece.class !== "air" || !piece.br) {
        return false
    }
    const location = G.location[u]
    const cached = map_get(L.air_reaction_hex_map, location)
    if (cached === 1) {
        return true
    } else if (cached === 0) {
        return false
    }
    var selected = [location]
    var range = piece.parenthetical ? piece.br : piece.ebr
    var leg_limit = G.offensive.air_move_distance
    let queue = [location]
    let leg_distance = 1
    let distance_incr_i = 0
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = map_get(AIRFIELD_LINKS, item)
        let j = 1;
        while (j < nh_list.length && nh_list[j] <= range) {
            let nh = nh_list[j - 1]
            if (set_has(selected, nh) || !(is_space_controlled(nh, R))) {
                j += 2
                continue
            }
            set_add(selected, nh)
            if (nh !== AIR_FERRY && !is_faction_units(nh, 1 - R) && !set_has(G.offensive.battle_hexes, nh) &&
                target_in_battle_range(range, nh, G.offensive.battle_hexes)) {
                map_set(L.air_reaction_hex_map, location, 1)
                return true
            }
            if (leg_distance < leg_limit) {
                queue.push(nh)
            }
        }
        if (i >= distance_incr_i) {
            leg_distance++
            distance_incr_i = queue.length - 1
        }
    }
    map_set(L.air_reaction_hex_map, location, 0)
    return false
}

P.activate_units = {
    _begin() {
        if (R === G.offensive.attacker && G.offensive.type === EC && cards[G.offensive.offensive_card].hq) {
            L.card = G.offensive.offensive_card
        } else if (R !== G.offensive.attacker && G.offensive.counter_offensive_card >= 0 && cards[G.offensive.counter_offensive_card].hq) {
            L.card = G.offensive.counter_offensive_card
        }
        L.hq_bonus = pieces[G.offensive.active_hq[G.active]].cm
        L.possible_units = get_activatable_units(G.offensive.active_hq[G.active])
        trigger_event("before_unit_activation")
    },
    prompt() {
        prompt(`${offensive_card_header()} Activate units ${G.offensive.logistic} + ${L.hq_bonus} / ${G.offensive.active_units[R].length}.`)
        L.possible_units.forEach(u => action_unit(u))
        button("done")
    },
    unit(u) {
        push_undo()
        set_add(G.offensive.active_units[R], u)
        set_delete(L.possible_units, u)
        apply_inter_service(u)
        if (set_has(L.asp_ground_units, u)) {
            L.asp_ground_units.forEach(gu => set_delete(L.possible_units, gu))
            L.asp_ground_units = []
        }
        trigger_event("after_unit_activation", u)
        if (G.offensive.active_units[R].length >= (G.offensive.logistic + L.hq_bonus) || L.possible_units.length <= 0) {
            end()
        }
    },
    done() {
        push_undo()
        end()
    },
}

function offensive_card_header() {
    return `${G.offensive.type === EC ? "EC" : "OC"}: ${cards[G.offensive.active_cards[0]].name}.`
}

function is_controllable_hex(hex) {
    return MAP_DATA[hex].named || hex === WEST_HONSHU || hex === KWAI_BRIDGE || hex === KWAI_BRIDGE_1
}

function control_hex(hex, side = G.active) {
    if (!is_controllable_hex(hex)) {
        return
    }
    if (side && set_has(G.control, hex)) {
        set_delete(G.control, hex)
    } else if (!side && !set_has(G.control, hex)) {
        set_add(G.control, hex)
    }
}

function capture_hex(hex, side = G.active) {
    if (side === AP && is_event_active(events.TOKYO_EXPRESS) === hex) {
        log(`Tokyo express marker removed`)
        G.events[events.TOKYO_EXPRESS.id] = 0
    }
    if (!is_controllable_hex(hex)) {
        return
    }
    if (side && set_has(G.control, hex)) {
        log(`AP captured ${int_to_hex(hex)}`)
        set_delete(G.control, hex)
        if (MAP_DATA[hex].region === "NIndia") {
            india_stable()
        }
        if (MAP_DATA[hex].resource) {
            check_jp_resources_event()
        }
    } else if (!side && !set_has(G.control, hex)) {
        log(`JP captured ${int_to_hex(hex)}`)
        set_add(G.control, hex)

    } else {
        return
    }
    if (MAP_DATA[hex].named) {
        set_toggle(G.capture, hex)
    }
}

function is_valid_cv_stop() {
    if (!L.move_data.is_naval_present || !L.move_data.is_naval_present || G.active_stack.length <= 0) {
        return true
    }
    var location = G.location[G.active_stack[0]]
    return set_has(G.offensive.battle_hexes, location) || set_has(G.offensive.landind_hexes, location) || is_space_controlled(location, R) && MAP_DATA[location].port
}

function is_reaction_move() {
    return G.offensive.attacker !== G.active
}

P.move_offensive_units = {
    _begin() {
        if (!L.type) {
            L.type = 0
        }
        L.move_data = {}
        L.movable_units = []
        L.allowed_hexes = []
        L.state = "choose"
        L.move_cache = []
        G.offensive.active_units[G.active].filter(u => {
            if (!unit_on_board(u) || G.offensive.stage === POST_BATTLE_STAGE && pieces[u].class === "ground" && !set_has(G.offensive.ground_pbm, u)) {
                return false
            }
            return true
        }).forEach(u => set_add(L.movable_units, u))
        if (L.movable_units.length <= 0) {
            log(`No movable units ${G.active ? "AP" : "JP"}`)
            end()
        }
    },
    prompt() {
        if (L.state === "attack") {
            prompt(`${offensive_card_header()} Commit units to battle.`)
            if (is_valid_cv_stop() && !is_reaction_move()) {
                button("pass")
            }
        } else if (L.state === "move") {
            prompt(`${offensive_card_header()} Continue move ground units.`)
            button("pass")
        } else {
            prompt(`${offensive_card_header()} Move activated units.`)
            if (G.offensive.stage === ATTACK_MOVE) {
                button("done")
            }
        }
        if (G.active_stack.length === 0) {
            L.movable_units.forEach(u => action_unit(u))
        } else if (L.state === "choose") {
            let loc = G.location[G.active_stack[0]]
            L.movable_units.filter(u => loc === G.location[u]
                && !L.move_data.is_air_present
                && pieces[u].type !== "air"
                && !set_has(G.active_stack, u))
                .forEach(u => action_unit(u))
            if (G.offensive.stage === ATTACK_MOVE || is_valid_cv_stop()) {
                button("no_move")
            }
        }
        for (let i = 0; i < L.allowed_hexes.length; i += 2) {
            action_hex(L.allowed_hexes[i])
        }
    },
    unit(u) {
        push_undo()
        G.active_stack.push(u)
        map_set(G.offensive.paths, u, [ANY_MOVE, 0, G.location[u]])
        L.move_data = get_move_data()
        if (L.move_data.is_air_present) {
            compute_air_move_hexes()
        } else {
            compute_ground_naval_move_hexes()
        }
        set_delete(L.movable_units, u)
    },
    pass() {
        L.state = "choose"
        L.allowed_hexes = []
        G.active_stack = []
        if (L.movable_units.length <= 0) {
            end()
        }
    },
    action_hex(hex) {
        push_undo()
        log(`Units ${G.active_stack} moved to ${int_to_hex(hex)}`)
        var curr_path = map_get(L.allowed_hexes, hex)
        if (is_faction_units(hex, 1 - R)) {
            set_add(G.offensive.battle_hexes, hex)
        } else if (is_space_controlled(hex, 1 - R) && curr_path[0] & AMPH_MOVE) {
            set_add(G.offensive.landind_hexes, hex)
        }

        if (curr_path[0] & AMPH_MOVE && !(MAP_DATA[hex].port && is_space_controlled(hex, R) && !is_faction_units(hex, 1 - R))) {
            G.asp[R][1] += L.move_data.asp_points
        }
        if (L.state === "move") {
            const prev_path = map_get(G.offensive.paths, G.active_stack[0])
            curr_path = [curr_path[0], curr_path[1], ...prev_path.slice(2), ...curr_path.slice(3)]
        } else if (L.state === "attack") {
            curr_path[0] |= ATTACK_MOVE
        }

        if (L.state !== "attack" && L.move_data.move_type & REACTION_MOVE && is_faction_units(hex, 1 - R)) {
            G.offensive.active_units[1 - R].filter(u => G.location[u] === hex).map(u => map_get(G.offensive.paths, u))
                .forEach(path => {
                    if (path[path.length - 1] !== hex) {
                        path.pop()
                    }
                })
        }
        G.active_stack.forEach(u => {
            map_set(G.offensive.paths, u, curr_path.slice())
            if (L.state !== "attack") {
                set_location(u, hex)
            }
        })
        if (curr_path[0] & GROUND_MOVE) {
            for (var i = 2; i < curr_path.length; i++) {
                const hex = curr_path[i]
                if (!(G.supply_cache[hex] & JP_UNITS << (1 - R))) {
                    capture_hex(hex)
                }
            }
        }
        if (!G.offensive.zoi_intelligence_modifier && !(curr_path[0] & AVOID_ZOI) && L.state !== "attack") {
            log("Reaction zoi violated!")
            G.offensive.zoi_intelligence_modifier = true
        }
        check_supply()
        L.allowed_hexes = []
        //move ground units step by step
        // if (curr_path[0] & GROUND_MOVE && curr_path[1] < L.move_data.ground_move_distance && !should_ground_move_stop(hex, R)) {
        //     L.move_data.ground_move_distance -= curr_path[1]
        //     L.move_data.location = hex
        //     L.move_data.move_type = curr_path[0]
        //     compute_ground_naval_move_hexes()
        //     L.state = "move"
        //
        // } else
        if (L.state === "choose" && L.move_data.battle_range && G.active_stack.length === 1
            && !is_faction_units(hex, 1 - R)
            && !set_has(G.offensive.battle_hexes, hex)
            && !G.committed.includes(G.active_stack[0])) {
            compute_air_commit_hexes()
            L.state = "attack"
        }
        if (L.allowed_hexes.length === 0) {
            this.pass()
        }
    },
    no_move() {
        if (L.move_data.battle_range && G.active_stack.length === 1) {
            compute_air_commit_hexes()
            L.state = "attack"
            if (L.allowed_hexes.length === 0) {
                this.pass()
            }
        } else {
            this.pass()
        }
    },
    done() {
        push_undo()
        G.offensive.active_units[R].filter(u => !map_has(G.offensive.paths, u))
            .forEach(u => map_set(G.offensive.paths, u, [ANY_MOVE, 0, G.location[u]]))
        if (L.type & POST_BATTLE_MOVE) {
            G.offensive.active_units[R] = []
        }
        G.active_stack = []
        end()
    },
}

function for_each_hex_in_range(hex, range, lambda) {
    lambda(hex)
    const y = hex % 29
    const x = (hex - y) / 29
    const d = x % 2
    var i

    for (var j = -range; j <= range; j++) {
        if (x + j < 0 || x + j > 50) {
            continue
        }
        const d2 = Math.abs(j) % 2
        var current = (x + j) * 29 + y
        lambda(current)
        var limit = (range - d2) / 2 + (1 - d) * d2 + Math.floor((range - Math.abs(j)) / 2)
        i = 0
        while (current % 29 > 0 && i < limit) {
            current -= 1
            lambda(current)
            i++
        }
        limit = (range - d2) / 2 + d * d2 + Math.floor((range - Math.abs(j)) / 2)
        current = (x + j) * 29 + y
        i = 0
        while ((current - d) % 29 < 28 && i < limit) {
            current += 1
            lambda(current)
            i++
        }
    }
}

function get_near_hexes(hex) {
    let y = hex % 29
    let x = (hex - y) / 29

    let y_diff = 1 - (x % 2)
    let y1_diff = 1 - y_diff
    let result = []
    result.push((-y >> 31) * hex * -1 - 1)                                                                          //N or -1
    result.push((-((x - 50 >> 31) & (-y1_diff | -hex % 29 >> 31)) - 1) * (hex + 30 - y_diff) + hex + 29 - y_diff)   //NE or -1
    result.push((-((x - 50 >> 31) & ((-hex - 1) % 29 >> 31)) - 1) * (hex + 30 + y1_diff) + hex + 29 + y1_diff)      //SE or -1
    result.push((-((-hex - 1 - y1_diff) % 29 >> 31) - 1) * (hex + 2) + hex + 1)                                     //S or -1
    result.push((-((-x >> 31) & ((-hex - 1) % 29 >> 31)) - 1) * (hex - 28 + y1_diff) + hex - 29 + y1_diff)      //SW or -1
    result.push((-((-x >> 31) & (-y1_diff | -hex % 29 >> 31)) - 1) * (hex - 28 - y_diff) + hex - 29 - y_diff)   //NW or -1
    return result
}

function for_each_card(apply) {
    for (let i = 0; i < cards.length; i++) {
        var card = cards[i]
        var returned = apply(i, card)
        if (returned) {
            return returned
        }

    }
}

function for_each_unit(apply) {
    for (let i = 0; i < pieces.length; i++) {
        var piece = pieces[i]
        var location = G.location[i]
        var returned = apply(i, piece, location)
        if (returned) {
            return returned
        }

    }
}

function for_each_unit_on_map(apply) {
    for (let i = 0; i < pieces.length; i++) {
        var piece = pieces[i]
        var location = G.location[i]
        if (location > LAST_BOARD_HEX) {
            continue
        }
        var returned = apply(i, piece, location)
        if (returned) {
            return returned
        }
    }
}

function set_zoi(i, piece, oos_units) {
    let location = G.location[i]
    if (piece.br && !set_has(oos_units[piece.faction], i)) {
        var mask = 0 | (JP_ZOI << piece.faction)
        if (piece.br < 6) {
            mask = mask | JP_ZOI_NTRL << 1 - piece.faction
        }
        G.supply_cache[location] = G.supply_cache[location] | mask
        get_near_hexes(location).flatMap(h => get_near_hexes(h)).forEach(h => {
            G.supply_cache[h] = G.supply_cache[h] | mask
        })
    }
}

function mark_unit(i, piece) {
    const location = G.location[i]
    if (piece.class === "air") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_AIR_UNITS << piece.faction)
    } else if (piece.class === "hq") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_HQ_UNITS << piece.faction)
    } else if (piece.class === "ground") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_GROUND_UNITS << piece.faction)
    } else if (piece.class === "naval") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_NAVAL_UNITS << piece.faction)
    }
}

function check_hq_in_supply(hq, piece) {
    const faction = piece.faction
    const location = G.location[hq]
    let queue = [location]
    const overland_set = [location]
    const oversea_set = [location]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const MD = MAP_DATA[item]
        const overland = set_has(overland_set, item)
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const enemy_port_s = (MD.port && set_has(G.control, item) == (1 - faction))
        const occupied_land_s = G.supply_cache[item] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[item] & JP_GAH_UNITS << faction)
        const oversea = set_has(oversea_set, item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            var reachable = false
            const enemy_port = enemy_port_s || (MD.port && set_has(G.control, nh) == (1 - faction))
            const occupied_land = occupied_land_s || G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (!set_has(overland_set, nh) && (overland || (MD.port && !enemy_port)) && MD.edges_int & GROUND << 5 * j && !occupied_land) {
                reachable = true
                set_add(overland_set, nh)
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!set_has(oversea_set, nh) && (oversea || (MD.port && !enemy_port)) && MD.edges_int & WATER << 5 * j && !non_neutral_zoi) {
                reachable = true
                set_add(oversea_set, nh)
            }
            if (reachable) {
                if (MAP_DATA[nh].supply_source === piece.faction) {
                    return true
                }
                queue.push(nh)
            }
        }
    }
    return false
}

function mark_supply_ports_overland(hq, piece) {
    const faction = piece.faction
    const location = G.location[hq]
    var queue = [location]
    var distance_map = [location, 0]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_distance = map_get(distance_map, item)
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            var distance = base_distance + get_ground_move_cost(item, nh, j, faction)
            if (distance > SUPPLY_PORT_RANGE || distance >= map_get(distance_map, nh, [100])[0] || occupied_land) {
                continue
            }
            map_set(distance_map, nh, distance)

            if (distance < SUPPLY_PORT_RANGE) {
                queue.push(nh)
            }
            if (MAP_DATA[nh].port && is_space_controlled(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_PORT << faction
            }
            if (MAP_DATA[nh].airfield && is_space_controlled(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_AIRFIELD << faction
            }
        }
    }
}

function mark_supply_ports_oversea(hq, piece) {
    const faction = piece.faction
    const location = G.location[hq]
    G.supply_cache[location] = G.supply_cache[location] | JP_SUPPLY_PORT << faction
    var queue = [location]
    var distance_map = [location]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!set_has(distance_map, nh) && MAP_DATA[item].edges_int & WATER << 5 * j && !non_neutral_zoi) {
                set_add(distance_map, nh)
                queue.push(nh)
                if (G.supply_cache[nh] & JP_SUPPLY_PORT << faction) {
                    return
                }
                if (MAP_DATA[nh].port && is_space_controlled(nh, faction)) {
                    G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_PORT << faction
                }
                if (MAP_DATA[nh].airfield && is_space_controlled(nh, faction)) {
                    G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_AIRFIELD << faction
                }
            }
        }
    }
}

function supply_source_in_range(location, faction) {
    if (!is_faction_units(location, faction) && !MAP_DATA[location].airfield) {
        return false
    } else if (G.supply_cache[location] & JP_SUPPLY_PORT << faction) {
        return true
    }
    const queue = [location]
    const distance_map = []
    map_set(distance_map, location, 0)

    for (var i = 0; i < queue.length; i++) {
        const item = queue[i]
        const base_distance = map_get(distance_map, item)
        const nh_list = get_near_hexes(item)
        for (var j = 0; j < 6; j++) {
            const nh = nh_list[j]
            if (nh <= 0) {
                continue
            }

            var distance = base_distance + get_ground_move_cost(item, nh, j, faction)
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (distance > SUPPLY_PORT_RANGE || occupied_land || distance >= map_get(distance_map, nh, [100])[0]) {
                continue
            }
            if (G.supply_cache[nh] & JP_SUPPLY_PORT << faction) {
                return true
            }
            map_set(distance_map, nh, distance)

            if (distance < SUPPLY_PORT_RANGE) {
                queue.push(nh)
            }
        }
    }
    return false
}

function mark_hexes_supplied_from(hq, piece) {
    const faction = piece.faction
    const location = G.location[hq]
    var queue = [location]
    const oversea_set = [location, 0]
    const overland_set = [location, 0]
    const supply_type = piece.supply
    const extended_supply_type = supply_type | (faction ? JOINT_SUPPLIED_HEX : 0)
    G.supply_cache[location] = G.supply_cache[location] | supply_type
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const MD = MAP_DATA[item]
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const distance = map_get(oversea_set, item) + 1
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!(MD.edges_int & WATER << 5 * j) || non_neutral_zoi || map_get(oversea_set, nh, 100) <= distance) {
                continue
            }
            if (distance < piece.cr) {
                queue.push(nh)
                const friendly_port = (MAP_DATA[nh].port && set_has(G.control, nh) !== faction)
                if (friendly_port && !MAP_DATA[nh].island && MAP_DATA[nh].terrain !== ATOLL) {
                    map_set(overland_set, nh, distance)
                }
            }
            map_set(oversea_set, nh, distance)
            if (MAP_DATA[nh].terrain > 0) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
    queue.push(location)
    map_for_each(overland_set, (k, v) => queue.push(k))
    const second_ports = []
    for (; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const MD = MAP_DATA[item]
        const distance = map_get(overland_set, item) + 1
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (!(MD.edges_int & GROUND << 5 * j) || occupied_land || map_get(overland_set, nh, 100) <= distance) {
                continue
            }
            if (distance < piece.cr) {
                queue.push(nh)
                const friendly_port = MAP_DATA[nh].port && is_space_controlled(nh, faction)
                if (friendly_port && map_get(oversea_set, nh, 100) > distance) {
                    map_set(oversea_set, nh, distance)
                    second_ports.push(nh)
                }
            }
            map_set(overland_set, nh, distance)
            if (!(G.supply_cache[nh] & extended_supply_type) && supply_source_in_range(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
    second_ports.forEach(h => queue.push(h))
    for (; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const MD = MAP_DATA[item]
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const distance = map_get(oversea_set, item) + 1
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!(MD.edges_int & WATER << 5 * j) || non_neutral_zoi || map_get(oversea_set, nh, 100) <= distance) {
                continue
            }
            if (distance < piece.cr) {
                queue.push(nh)
            }
            map_set(oversea_set, nh, distance)
            if (MAP_DATA[nh].terrain > 0) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
}

function check_unit_supply(location, i, piece) {
    if (piece.class === "hq") {
        return false
    } else if (set_has(G.offensive.active_units[piece.faction], i)) {
        return true
    }
    return G.supply_cache[location] & piece.supply
}

function check_faction_supply_not_changed(faction, both_sides_zoi, oos_units) {
    for (i = 1; i < LAST_BOARD_HEX; i++) {
        G.supply_cache[i] = G.supply_cache[i] & CLEAN_SUPPLY_MASK[1 - faction]
    }
    if (G.burma_road < 2) {
        G.supply_cache[KUNMING] |= AP_SUPPLY_PORT
    }
    for_each_unit_on_map((i, p) => both_sides_zoi || p.faction === faction ? set_zoi(i, p, oos_units) : null)
    for_each_unit_on_map((i, p) => {
        if (p.class === "hq" && p.faction === faction) {
            mark_supply_ports_oversea(i, p)
        }
    })
    for_each_unit_on_map((i, p) => {
        if (p.class === "hq" && p.faction === faction) {
            mark_supply_ports_overland(i, p)
        }
    })
    var size = oos_units[faction].length
    oos_units[faction] = []
    for_each_unit_on_map((i, p) => {
        if (p.class === "hq" && p.faction === faction && check_hq_in_supply(i, p)) {
            mark_hexes_supplied_from(i, p)
        } else if (p.class === "hq" && p.faction === faction) {
            set_add(oos_units[faction], i)
        }
    })
    var tokyo_express = G.events[events.TOKYO_EXPRESS.id]
    if (tokyo_express > 0) {
        G.supply_cache[tokyo_express] |= JP_SUPPLIED_HEX
    }
    for_each_unit_on_map((i, p) => {
        if (p.class !== "hq" && p.faction === faction && !check_unit_supply(G.location[i], i, p)) {
            set_add(oos_units[faction], i)
        }
    })
    return oos_units[faction].length === size
}

function check_infrastructure() {
    ROAD_EVENTS.filter(e => !is_event_active(e)).forEach(e => e.keys.forEach(h => G.supply_cache[h] |= TRANSPORT_ROUTE_DISABLED))
}

function check_hump() {
    if (is_event_active(events.HUMP)
        && ((G.supply_cache[JARHAT] & AP_SUPPLY_AIRFIELD) || (G.supply_cache[DACCA] & AP_SUPPLY_AIRFIELD))) {
        G.burma_road = 1
    }
}

function check_burma_road() {
    G.burma_road = 2
    const faction = AP
    const location = KUNMING
    var queue = [location]
    var distance_map = [location, 0]
    var rangoon_achived = false
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            var distance = get_ground_move_cost(item, nh, j, faction)
            if (distance > 1 || map_has(distance_map, nh) || occupied_land || is_space_controlled(nh, JP)) {
                continue
            }
            map_set(distance_map, nh, distance)

            if (nh === MADRAS) {
                G.burma_road = 0
                return
            } else if (nh === RANGOON) {
                rangoon_achived = true
            } else {
                queue.push(nh)
            }
        }
    }
    if (!rangoon_achived || has_non_n_zoi(RANGOON, JP) || is_space_controlled(RANGOON, JP)) {
        check_hump()
        return;
    }
    queue = [RANGOON]
    distance_map = [RANGOON, 0]
    for (i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (map_has(distance_map, nh) || has_non_n_zoi(nh, JP)) {
                continue
            }
            map_set(distance_map, nh, 1)
            if (nh === MADRAS || MAP_DATA[nh].supply_source === AP) {
                G.burma_road = 0
                return
            } else {
                queue.push(nh)
            }
        }
    }
    check_hump()
}

function is_overstack(hex, unit) {
    var overstack = G.overstack[hex]
    var piece = pieces[unit]
    var multiplier = G.location[unit] === hex ? 0 : 1
    if (piece.class === "hq") {
        return overstack & 1
    } else if (piece.class !== "naval") {
        return ((overstack + 2 * multiplier) % (1 << 7)) > 8
    } else {
        return ((overstack + 128 * multiplier) >> 7) > 5
    }
}

function get_overstack_size(unit) {
    var piece = pieces[unit]
    if (piece.class === "hq") {
        return 1
    } else if (piece.class !== "naval") {
        return 2
    } else {
        return 1 << 7
    }
}

P.check_overstacking = {
    _begin() {
        L.allowed_units = []
        L.ground_units = []
        var overstack_naval = []
        var overstack_land = []
        for (var i = 0; i < LAST_BOARD_HEX; i++) {
            if ((G.overstack[i] % (1 << 7)) > 8) {
                set_add(overstack_land, i)
            }
            if ((G.overstack[i] >> 7) > 6) {
                set_add(overstack_naval, i)
            }
        }
        if (!overstack_naval.length && !overstack_land.length) {
            end()
        }
        var air_hex = []
        for_each_unit_on_map((u, piece, location) => {
            if (piece.class === "naval" && set_has(overstack_naval, location)) {
                set_add(L.allowed_units, u)
            } else if (piece.class === "ground" && set_has(overstack_land, location)) {
                set_add(L.ground_units, u)
            } else if (piece.class === "air" && set_has(overstack_land, location)) {
                set_add(L.allowed_units, u)
                set_add(air_hex, location)
            }
        })
        L.ground_units.forEach(u => {
            if (!set_has(air_hex, G.location[u])) {
                set_add(L.allowed_units, u)
            }
        })
    },
    prompt() {
        prompt(`Remove overstacked units.`)
        L.allowed_units.forEach(u => action_unit(u))
        if (L.allowed_units.length === 0) {
            button("done")
        }
    },
    done() {
        push_undo()
        end()
    },
    unit(u) {
        push_undo()
        var location = G.location[u]
        log(`${pieces[u].name} removed due to overstacking.`)
        if (set_has(G.oos, u)) {
            eliminate(u)
        } else {
            displace_to_turn(u, 1, true)
        }
        set_delete(L.allowed_units, u)
        var still_overstack = is_overstack(location, u)
        if (!still_overstack && pieces[u].class === "naval") {
            L.allowed_units = L.allowed_units.filter(u => G.location[u] !== location || pieces[u].class !== "naval")
        } else if (!still_overstack && pieces[u].class === "ground") {
            L.allowed_units = L.allowed_units.filter(u => G.location[u] !== location || pieces[u].class !== "ground")
        } else if (!still_overstack && pieces[u].class === "air") {
            L.allowed_units = L.allowed_units.filter(u => G.location[u] !== location || pieces[u].class !== "air")
        } else if (still_overstack && pieces[u].class === "air") {
            console.log("4 condition")
            var air_present = L.allowed_units.filter(u => G.location[u] === location && pieces[u].class === "air").length
            console.log(air_present)
            if (!air_present) {
                L.ground_units.forEach(u => {
                    if (G.location[u] === location) {
                        set_add(L.allowed_units, u)
                    }
                })
            }
        }
    }
}

function set_location(unit, location) {
    var prev_location = G.location[unit]
    var size = get_overstack_size(unit)
    if (prev_location <= LAST_BOARD_HEX || prev_location === CHINA_BOX) {
        G.overstack[prev_location] -= size
    }
    if (location <= LAST_BOARD_HEX || location === CHINA_BOX) {
        G.overstack[location] += size
    }
    G.location[unit] = location
}

function fill_overstack() {
    for (var i = 0; i <= LAST_BOARD_HEX; i++) {
        G.overstack[i] = 0
    }
    G.overstack[CHINA_BOX] = 0
    for_each_unit((u, piece, location) => {
        if (location <= LAST_BOARD_HEX && piece.class === "hq") {
            G.overstack[location] |= 1
        } else if (location <= LAST_BOARD_HEX && piece.class !== "naval") {
            G.overstack[location] += (1 << 1)
        } else if (location <= LAST_BOARD_HEX) {
            G.overstack[location] += (1 << 7)
        } else if (location === CHINA_BOX) {
            G.overstack[location] += 2
        }
    })
}

function check_supply() {
    check_burma_road()
    G.supply_cache = []
    for_each_unit_on_map(mark_unit)
    check_infrastructure()

    var oos_units = [[], []]
    G.oos = []
    check_faction_supply_not_changed(AP, false, oos_units)
    check_faction_supply_not_changed(JP, true, oos_units)
    for (var i = 0; i < 10; i++) {//limit supply check counts
        const ap = check_faction_supply_not_changed(AP, true, oos_units)
        const jp = check_faction_supply_not_changed(JP, true, oos_units)
        if (ap && jp) {
            break
        }
        break
    }
    G.oos = oos_units[0]
    oos_units[1].forEach(h => set_add(G.oos, h))
    check_burma_road()
    log("Check supply")
}

function get_move_data() {
    let result = {
        is_new_battle_allowed: false,
        is_ground_present: false,
        is_air_present: false,
        is_naval_present: false,
        battle_range: 0,
        naval_move_distance: 0,
        ground_move_distance: 0,
        extended_battle_range: 0,
        air_move_legs: 0,
        move_type: 0,
        location: 0,
        moved: false,
        asp_points: 0,
    }
    var strat_move = true
    var asp_move = true
    var organic_naval_counter = 0
    var organic_ground_counter = 0
    var organic_only_ships = true
    if (G.offensive.attacker !== G.active) {
        result.move_type |= REACTION_MOVE
    }
    G.active_stack.forEach(u => {
        let piece = pieces[u]
        if (piece.class === "ground") {
            result.is_ground_present = true
        } else if (piece.class === "naval") {
            result.is_naval_present = true
        } else if (piece.class === "air") {
            result.is_air_present = true
        }
        if (piece.br) {
            result.battle_range = piece.br
            result.extended_battle_range = piece.br
        }
        if (piece.ebr && (!piece.parenthetical || G.offensive.stage === POST_BATTLE_STAGE)) {
            result.extended_battle_range = piece.ebr
        }
        if (piece.organic && piece.class === "ground") {
            organic_ground_counter++
        } else if (piece.organic && piece.class === "naval") {
            organic_naval_counter++
        } else if (piece.class === "naval") {
            organic_only_ships = false
        }
        if (piece.class === "ground" && !piece.strat_move) {
            strat_move = false
            asp_move = false
        } else if (piece.class === "ground" && !piece.asp) {
            asp_move = false
        } else if (piece.class === "ground") {
            result.asp_points += set_has(G.reduced, u) ? piece.aspr : piece.asp
        }
    })
    result.location = G.location[G.active_stack[0]]
    if (strat_move && !result.is_air_present && MAP_DATA[result.location].coastal) {
        result.move_type |= NAVAL_MOVE
    }
    result.naval_move_distance = G.offensive.naval_move_distance
    result.ground_move_distance = G.offensive.ground_move_distance
    result.air_move_legs = cards[G.offensive.active_cards[0]].ops
    if (result.extended_battle_range < result.battle_range) {
        result.extended_battle_range = result.battle_range
    }

    result.is_new_battle_allowed = R === G.offensive.attacker
        && (G.offensive.type === EC || G.offensive.battle_hexes.length === 0)
        && G.offensive.stage !== POST_BATTLE_STAGE
    var asp_total = Math.max(G.asp[R][0] - G.asp[R][1], 0)
    if (!R && G.inter_service[0]) {
        asp_total = Math.ceil(asp_total / 2)
    }
    if (strat_move) {
        result.move_type |= STRAT_MOVE
    }
    result.asp_points -= Math.min(organic_naval_counter, organic_ground_counter)
    if (result.is_ground_present && asp_move && result.asp_points <= asp_total) {
        result.move_type |= AMPH_MOVE
        if (organic_only_ships && organic_naval_counter <= organic_ground_counter) {
            result.move_type |= ORGANIC_ONLY
        }
    }
    return result
}

function get_ground_move_cost(from, to, direction, faction) {
    if (!(MAP_DATA[from].edges_int & GROUND << 5 * direction)) {
        return 100;
    }
    if ((MAP_DATA[from].edges_int & ROAD << (5 * direction))
        && !(G.supply_cache[to] & (TRANSPORT_ROUTE_DISABLED | (JP_GA_UNITS << 1 - faction)))
        && !(G.supply_cache[from] & TRANSPORT_ROUTE_DISABLED)
    ) {
        return 1;
    } else {
        return ((MAP_DATA[to].terrain >> 1) + 1) * 2
    }
}

function compute_possible_battle_hexes() {
    const unit_ranges = []
    const selected_units = []
    const selected_hexes = []
    L.possible_hexes = selected_hexes
    L.possible_units = selected_units
    const new_battle_allowed = G.offensive.type === EC || G.offensive.battle_hexes.length <= 0
    G.offensive.active_units[R].filter(u => pieces[u].br).forEach(u => {
        const location = G.location[u]
        var path = map_get(G.offensive.paths, u)
        var range = pieces[u].ebr ? pieces[u].ebr : pieces[u].br
        if (u.parenthetical) {
            range = pieces[u].br
        }
        if (path[0] & ATTACK_MOVE || path[0] & AIR_EXTENDED_MOVE || is_faction_units(location, 1 - pieces[u].faction)
            || G.committed.includes(u)) {
            return
        }
        var saved_value = map_get(unit_ranges, location, [range])
        if (range > saved_value[0]) {
            saved_value[0] = range
        }
        saved_value.push(u)
        saved_value.push(range)
        map_set(unit_ranges, location, saved_value)
    })
    map_for_each(unit_ranges, (attacker_stack_hex, value) => for_each_hex_in_range(attacker_stack_hex, value[0], (h) => {
        if (new_battle_allowed && is_faction_units(h, 1 - R) || set_has(G.offensive.battle_hexes, h) || set_has(G.offensive.landind_hexes, h)) {
            set_add(selected_hexes, h)
            var has_not_selected = false
            const distance = get_distance(attacker_stack_hex, h)
            for (var i = 2; i < value.length; i += 2) {
                if (value[i] >= distance) {
                    set_add(selected_units, value[i - 1])
                } else {
                    has_not_selected = true
                }
            }
            if (!has_not_selected) {
                value = [0]
            }
        }
    }))

}

function compute_air_commit_hexes() {
    var move_data = L.move_data
    var result = []
    var location = G.location[G.active_stack[0]]
    var parenthetical = pieces[G.active_stack[0]].parenthetical
    var range = parenthetical ? L.move_data.battle_range : L.move_data.extended_battle_range
    const path = map_get(G.offensive.paths, G.active_stack[0])
    for (var i = 0; i < G.active_stack.length; i++) {
        var u = G.active_stack[i]
        if ((map_get(G.offensive.paths, u)[0] & AIR_EXTENDED_MOVE)) {
            L.allowed_hexes = []
            return
        }
    }
    G.offensive.battle_hexes.filter(h => get_distance(h, location) <= range)
        .forEach(h => {
            const path_u = path.slice()
            path_u.push(h)
            map_set(result, h, path_u)
        })
    if (move_data.is_new_battle_allowed) {
        for (i = 0; i < G.supply_cache.length; i++) {
            if ((G.supply_cache[i] & JP_UNITS << (1 - R)) && get_distance(i, location) <= range) {
                const path_u = path.slice()
                path_u.push(i)
                map_set(result, i, path_u)
            }
        }
    }
    L.allowed_hexes = result
}

function compute_air_move_hexes() {
    var move_data = L.move_data
    let leg_distance = 1
    let distance_incr_i = 0
    const selected = [move_data.location, [ANY_MOVE, leg_distance, move_data.location]]
    let queue = [move_data.location]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = map_get(AIRFIELD_LINKS, item)
        let j = 1;
        while (j < nh_list.length && nh_list[j] <= move_data.extended_battle_range) {
            let nh = nh_list[j - 1]
            if (map_has(selected, nh) || !is_space_controlled(nh, R)) {
                j += 2
                continue
            }
            var path_array = map_get(selected, item)
            path_array = path_array.slice()
            path_array.push(nh)
            map_set(selected, nh, path_array)
            if (leg_distance < move_data.air_move_legs) {
                queue.push(nh)
            }
        }
        if (i >= distance_incr_i) {
            leg_distance++
            distance_incr_i = queue.length - 1
        }
    }
    L.allowed_hexes = []
    map_for_each(selected, (nh, v) => {
        if (nh !== AIR_FERRY && !is_faction_units(nh, 1 - R) && !set_has(G.offensive.battle_hexes, nh)
            && (target_in_battle_range(move_data.extended_battle_range, nh, G.offensive.battle_hexes) || G.offensive.stage !== REACTION_STAGE)) {
            map_set(L.allowed_hexes, nh, v)
        }
    })
}

function compute_ground_naval_move_hexes() {
    let location = L.move_data.location
    L.allowed_hexes = []
    let move_data = L.move_data

    if (L.move_data.move_type & NAVAL_MOVE) {
        var zoi_mask = 0
        if (move_data.is_ground_present && !move_data.is_naval_present) {
            zoi_mask = zoi_mask | JP_NAVAL_UNITS << (1 - R)
        }
        clear_supply_cache(CLEAN_ATTACK_ZONE_MASK)
        if (G.offensive.stage !== POST_BATTLE_STAGE) {
            mark_participate_attack_hex()
        }
        map_for_each(get_naval_move(zoi_mask), (k, v) => {
            v.unshift(move_data.move_type)
            if (G.offensive.stage === ATTACK_STAGE || !is_faction_units(k, 1 - R) || set_has(G.offensive.battle_hexes, k)) {
                map_set(L.allowed_hexes, k, v)
            }
        })
        if (!G.offensive.zoi_intelligence_modifier && G.offensive.stage === ATTACK_STAGE) {
            zoi_mask = zoi_mask | JP_ZOI << (1 - R)
            map_for_each(get_naval_move(zoi_mask), (k, v) => {
                v.unshift(move_data.move_type | AVOID_ZOI)
                map_set(L.allowed_hexes, k, v)
            })
        }
    }
    if (move_data.is_ground_present && !move_data.is_naval_present) {
        map_for_each(get_ground_move(false), (k, v) => {
            v.unshift(GROUND_MOVE)
            if (G.offensive.stage === ATTACK_STAGE || set_has(G.offensive.battle_hexes, k)) {
                map_set(L.allowed_hexes, k, v)
            }
        })
        if (!G.offensive.zoi_intelligence_modifier && G.offensive.stage === ATTACK_STAGE) {
            map_for_each(get_ground_move(true), (k, v) => {
                v.unshift(GROUND_MOVE | AVOID_ZOI)
                if (map_get(L.allowed_hexes, k, [100])[1] >= v[1]) {
                    map_set(L.allowed_hexes, k, v)
                }
            })
        }
    }
    map_delete(L.allowed_hexes, location)
}

function should_ground_move_stop(hex, faction) {
    return G.supply_cache[hex] & JP_GAH_UNITS << (1 - faction) || set_has(G.offensive.battle_hexes, hex)
}

function get_ground_move(avoid_zoi) {
    const location = L.move_data.location
    const move_data = L.move_data

    if (avoid_zoi && G.supply_cache[location] & JP_ZOI << (1 - R)) {
        return []
    }
    const queue = [location]
    const distance_map = [location, [0, location]]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_distance = map_get(distance_map, item)
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            var distance = base_distance[0] + get_ground_move_cost(item, nh, j, R)
            if ((avoid_zoi && G.supply_cache[nh] & JP_ZOI << (1 - R)) || distance > move_data.ground_move_distance || distance >= map_get(distance_map, nh, [100])[0]) {
                continue
            }
            const stop_move = should_ground_move_stop(nh, R)

            let path_array = base_distance.slice()
            path_array.push(nh)
            path_array[0] = distance
            map_set(distance_map, nh, path_array)

            if (distance < move_data.ground_move_distance && !stop_move) {
                queue.push(nh)
            }
        }
    }
    return distance_map
}

function mark_attack_zone(location, battle_range) {
    G.supply_cache[location] = G.supply_cache[location] | HEX_TEMP_FLAG2 | HEX_TEMP_FLAG1
    if (!L.move_data.is_ground_present) {
        for_each_hex_in_range(location, battle_range, h => {
            G.supply_cache[h] = G.supply_cache[h] | HEX_TEMP_FLAG1
        })
    }
}

function clear_supply_cache(mask) {
    for (var i = 1; i < LAST_BOARD_HEX; i++) {
        G.supply_cache[i] = G.supply_cache[i] & mask
    }
}

function mark_participate_attack_hex() {
    var base_location = L.move_data.location
    var base_distance = G.offensive.naval_move_distance + L.move_data.battle_range
    G.offensive.battle_hexes.forEach(h => mark_attack_zone(h, L.move_data.battle_range))
    G.offensive.landind_hexes.forEach(h => mark_attack_zone(h, L.move_data.battle_range))
    if (!L.move_data.is_new_battle_allowed) {
        return
    }
    for (var i = 0; i < pieces.length; i++) {
        var piece = pieces[i]
        var location = G.location[i]
        if (piece.faction !== R && get_distance(location, base_location) <= base_distance && !(G.supply_cache[location] & HEX_TEMP_FLAG2)) {
            mark_attack_zone(location, L.move_data.battle_range)
        }
    }
}


function has_non_n_zoi(hex, faction) {
    return (G.supply_cache[hex] & (JP_ZOI << faction | JP_ZOI_NTRL << faction)) === JP_ZOI << faction
}

function has_zoi(hex, faction) {
    return (G.supply_cache[hex] & JP_ZOI << faction)
}

function get_naval_move(zoi_mask) {
    const location = L.move_data.location
    const move_data = L.move_data
    const non_cv_ground_unit = move_data.is_ground_present && !move_data.battle_range

    if (G.supply_cache[location] & zoi_mask || non_cv_ground_unit && has_non_n_zoi(location, 1 - R)) {
        return []
    }
    const marine_landed_islands = []
    var us_army_unit_active = false
    if (R) {
        G.offensive.active_units[R].forEach(u => {
            const p = pieces[u]
            if (p.class === "ground" && p.type === "marine") {
                set_add(marine_landed_islands, G.location[u])
            }
        })
        us_army_unit_active = G.active_stack.map(u => pieces[u]).filter(p => p.class === "ground" && p.service === "army").length
    }
    const queue = [location]
    const distance_map = [location, [0, location]]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_path = map_get(distance_map, item)
        const distance = base_path[0] + 1
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (G.supply_cache[nh] & zoi_mask
                || non_cv_ground_unit && has_non_n_zoi(nh, 1 - R)
                || distance > move_data.naval_move_distance
                || !(MAP_DATA[item].edges_int & WATER << 5 * j)
                || distance >= map_get(distance_map, nh, [100])[0]) {
                continue
            }
            if (distance < move_data.naval_move_distance) {
                queue.push(nh)
            }
            let path_array = base_path.slice()
            path_array.push(nh)
            path_array[0] = distance
            map_set(distance_map, nh, path_array)

        }
    }
    let result = []
    map_for_each(distance_map, (nh, v) => {
        if (is_amph_attack_possible(nh) && (!us_army_unit_active || set_has(marine_landed_islands, nh) || !MAP_DATA[nh].island || G.offensive.stage === REACTION_STAGE)
            || !is_faction_units(nh, 1 - R) &&
            ((MAP_DATA[nh].port && is_space_controlled(nh, R)) || (move_data.move_type & AMPH_MOVE && is_hex_asp_capable(nh)
                    && (!move_data.is_naval_present || move_data.move_type & ORGANIC_ONLY))
            ) && (G.offensive.stage !== REACTION_STAGE)
        ) {
            map_set(result, nh, v)
        }
    })

    return result
}

function is_amph_attack_possible(hex) {
    return (G.supply_cache[hex] & HEX_TEMP_FLAG1 && (L.move_data.move_type & AMPH_MOVE || !L.move_data.is_ground_present))
}

function is_hex_asp_capable(hex) {
    const terrain = MAP_DATA[hex].terrain
    return hex === MORESBY || (terrain !== OCEAN && terrain !== MOUNTAIN)
}

function is_faction_units(hex, faction) {
    return G.supply_cache[hex] & JP_UNITS << faction
}

function is_faction_ground_units(hex, faction) {
    return G.supply_cache[hex] & JP_GROUND_UNITS << faction
}

function is_space_controlled(hex, faction) {
    return is_controllable_hex(hex) && set_has(G.control, hex) == 1 - faction
}

function target_in_battle_range(range, location, targets) {
    for (var i = 0; i < targets.length; i++) {
        if (get_distance(location, targets[i]) <= range) {
            return true
        }
    }
    return false
}

function commit_to_attack(unit, hex) {
    const path = map_get(G.offensive.paths, unit)
    path.push(hex)
    path[0] = path[0] | ATTACK_MOVE
}

P.declare_battle_hexes = {
    _begin() {
        check_supply()
        G.offensive.battle_hexes.forEach(h => log(`Battle declared in hex ${int_to_hex(h)}`))
        compute_possible_battle_hexes()
        if (L.possible_units.length <= 0) {
            log("Additional battle hexes could not be declared")
            end()
        }
    },
    prompt() {
        prompt(`${offensive_card_header()} Declare battle hexes and commit units.`)
        if (G.active_stack.length === 0) {
            L.possible_units.forEach(u => action_unit(u))
            button("done")
        } else {
            const location = G.location[G.active_stack[0]]
            const range = pieces[G.active_stack[0]].ebr
            L.possible_hexes.filter(loc => get_distance(loc, location) <= range).forEach(loc => action_hex(loc))
        }
    },
    action_hex(hex) {
        push_undo()
        commit_to_attack(G.active_stack[0], hex)
        if (!set_has(G.offensive.battle_hexes, hex)) {
            set_add(G.offensive.battle_hexes, hex)
            if (G.offensive.type === OC) {
                L.possible_hexes = G.offensive.battle_hexes.slice()
                L.possible_units = L.possible_units.filter(u =>
                    target_in_battle_range(pieces[u].parenthetical ? pieces[u].br : pieces[u].ebr, G.location[u], L.possible_hexes))
            }
        }
        G.active_stack = []
        if (L.possible_units.length <= 0) {
            end()
        }
    },
    unit(u) {
        push_undo()
        G.active_stack = [u]
        set_delete(L.possible_units, u)
    },
    done() {
        push_undo()
        end()
    },
}

P.commit_offensive = {
    _begin() {
        check_supply()
        L.verify_error = trigger_event("before_commit_offensive")
    },
    prompt() {
        var action = "offensive"
        if (G.offensive.stage === REACTION_STAGE) {
            action = "reaction"
        } else if (G.offensive.stage === POST_BATTLE_STAGE) {
            action = "post battle move"
        }

        if (!L.verify_error) {
            prompt(`${offensive_card_header()} Commit ${action}.`)
            button("next")
        } else {
            prompt(`${offensive_card_header()} Commit ${action}. ` + L.verify_error)
        }
    },
    next() {
        end()
    },
}

P.end_action = {
    prompt() {
        prompt(`End action.`)
        button("done")
    },
    done() {
        end()
    },
}

function roll_intelligence_dice() {
    const card = cards[G.offensive.active_cards[0]]
    const card_value = (G.offensive.type === EC && card.ec) ? card.ec : card.oc
    var modifier = 0
    if (G.offensive.zoi_intelligence_modifier) {
        modifier -= 2
        log(`-2 ZOI modifier`)
    }
    var event_modifier = trigger_event("before_intelligence_roll")
    if (event_modifier) {
        modifier += event_modifier
    }
    let result = random(10)
    const success = result !== 9 && result + modifier <= card_value
    if (modifier > 0) {
        modifier = "+" + modifier
    }
    log(`Intelligence roll ${result}${modifier ? modifier : ""}, card value ${card_value} (${success ? "SUCCESS" : "FAILED"})`)
    return success
}

P.special_reaction = {
    _begin() {
        const hq_list = []
        for_each_unit_on_map((u, piece) => {
            if (piece.faction === R && piece.class === "hq") {
                hq_list.push(G.location[u], piece.cr)
            }
        })
        L.possible_hexes = G.offensive.landind_hexes.filter(h => {
            if (!MAP_DATA[h].named || !has_zoi(h, R)) {
                return false
            }
            for (var i = 1; i < hq_list.length; i += 2) {
                if (get_distance(h, hq_list[i - 1]) <= hq_list[i]) {
                    return true
                }
            }
            return false
        })
        if (L.possible_hexes.length <= 0) {
            end()
        }
    },
    prompt() {
        prompt(`${offensive_card_header()} Do a special reaction.`)
        button("pass")
        L.possible_hexes.forEach(h => action_hex(h))
    },
    pass() {
        this._begin()
    },
    action_hex(hex) {
        log(`Special reaction in ${int_to_hex(hex)}`)
        const success = roll_intelligence_dice()
        set_delete(L.possible_hexes, hex)
        if (success) {
            set_add(G.offensive.battle_hexes, hex)
            set_delete(G.offensive.landind_hexes, hex)
        }
        clear_undo()
        if (L.possible_hexes.length <= 0) {
            end()
        }
    },
}

function into_turn_draw(faction) {
    if (G.draw_counter[faction] >= 3) {
        log(`${faction === AP ? "AP" : "JP"} already drown 3 cards, draw skipped`)
        return
    }
    log(`${faction === AP ? "AP" : "JP"} draw additional card`)
    G.draw_counter[faction]++
    set_add(G.offensive.draw, draw_card(faction, false))
    clear_undo()
}

P.cancel_offensive = {
    _begin() {
        if (G.active === AP) {
            end()
        }
        L.cancel = for_each_card((c, card) => {
            return card.type === CANCEL && card.could_play()
        })
        if (!L.cancel) {
            end()
        }
    },
    prompt() {
        prompt(`${offensive_card_header()} Cancel offensive.`)
        if (L.reactions_card >= 0) {
            button("done")
            return
        }
        G.hand[R].filter(c => cards[c].type === CANCEL && cards[c].can_play()).forEach(c => action_card(c))
        button("skip")
    },
    skip() {
        push_undo()
        end()
    },
    card(c) {
        push_undo()
        L.reactions_card = c
        G.offensive.active_cards.push(c)
    },
    done() {
        var offensive_card = G.offensive.offensive_card
        var reaction_card = L.reactions_card
        restore_state(G.offensive.weather_rollback)
        discard_card(offensive_card)
        remove_card(L.reactions_card)
        log(`Japan played ${cards[reaction_card].name}`)
        log(`Offensive resets, ${cards[offensive_card].name} discard`)
        play_event(reaction_card)
        G.offensive.offensive_card = reaction_card
        G.offensive.active_cards = [reaction_card]
        end()
        goto("default_event")
    }
}

P.define_intelligence_condition = {
    _begin() {
        if (G.offensive.battle_hexes.length <= 0) {
            end()
        }
        L.rolled = false
        L.card = false
        G.offensive.logistic = cards[G.offensive.offensive_card].ops
    },
    prompt() {
        prompt(`${offensive_card_header()} Change intelligence condition.`)
        if (G.offensive.type === EC && cards[G.offensive.offensive_card].intelligence && !L.card && !L.rolled) {
            button("skip")
        } else if ((G.offensive.type === OC || !cards[G.offensive.offensive_card].intelligence)
            && G.offensive.intelligence === SURPRISE && !L.rolled) {
            button("roll")
        }

        if (!L.rolled) {
            get_hand(G.active).filter(c => {
                var card = cards[c]
                return (card.type === INTELLIGENCE || card.type === COUNTER_OFFENSIVE && G.offensive.counter_offensive_card <= 0)
                    && card.can_play()
            }).forEach(c => action_card(c))
        } else if (G.hand[R].includes(JN_25_SPECIAL)) {
            action_card(JN_25_SPECIAL)
        }
        if (L.rolled || L.card) {
            button("done")
        }
    },
    done() {
        push_undo()
        end()
    },
    skip() {
        push_undo()
        if (L.cancel) {
            L.cancel = false
        } else {
            end()
        }
    },
    card(c) {
        push_undo()
        L.card = true
        if (cards[c].type === COUNTER_OFFENSIVE) {
            play_counter_offensive(c)
        } else {
            play_reaction(c)
        }
    },
    roll() {
        log('Change intelligence condition')
        var success = roll_intelligence_dice()
        if (success) {
            G.offensive.intelligence = INTERCEPT
            log(`Intelligence condition changed to ${get_named_intelligence(G.offensive.intelligence)}`)
        }
        L.rolled = true
        clear_undo()
        if (success || !get_hand(R).includes(JN_25_SPECIAL)) {
            end()
        }
    }
}

P.attack_reaction_cards = {
    _begin() {
        if (get_hand(R).filter(c => cards[c].type === REACTION && cards[c].can_play()).length <= 0) {
            end()
        }
    },
    prompt() {
        prompt(`${offensive_card_header()} Play reaction cards.`)
        get_hand(R).filter(c => cards[c].type === REACTION && cards[c].can_play()).forEach(c => action_card(c))
        button("done")
    },
    done() {
        push_undo()
        end()
    },
    card(c) {
        push_undo()
        play_event(c)
        G.offensive.active_cards.push(c)
    }
}

P.apply_attack_reaction = {
    _begin() {
        if (G.offensive.battle_hexes.length <= 0 && G.offensive.stage !== BATTLE_STAGE) {
            end()
        }
        var stage = G.offensive.stage === POST_BATTLE_STAGE ? AFTER_COMBAT : BEFORE_COMBAT
        L.allowed_cards = []
        G.offensive.active_cards.filter(c => cards[c].type === REACTION &&
            (cards[c].stage === stage || G.offensive.battle_hexes.length <= 0 && G.offensive.stage === BATTLE_STAGE))
            .forEach(c => set_add(L.allowed_cards, c))
        if (L.allowed_cards.length <= 0) {
            end()
        }
    },
    prompt() {
        prompt(`${offensive_card_header()} Apply reaction cards.`)
        L.allowed_cards.forEach(c => action_card(c))
    },
    done() {
        push_undo()
        end()
    },
    card(c) {
        push_undo()
        set_delete(L.allowed_cards, c)
        if (L.allowed_cards.length <= 0) {
            end()
        }
        cards[c].event()
    }
}

function sum_combat_factor(units, battle_hex = G.offensive.battle.battle_hex) {
    return units.map(u => {
        var piece = pieces[u]
        var cf = set_has(G.reduced, u) ? piece.rcf : piece.cf
        if (piece.class === "air" && get_distance(battle_hex, G.location[u]) > piece.br) {
            cf = Math.ceil(cf / 2)
        }
        return cf
    }).reduce((a, b) => a + b, 0)
}

function naval_battle_table(roll) {
    if (roll < 3) {
        return 1 / 4
    } else if (roll < 6) {
        return 1 / 2
    } else {
        return 1
    }
}

function ground_battle_table(roll) {
    if (roll < 3) {
        return 1 / 2
    } else if (roll < 7) {
        return 1
    } else if (roll < 9) {
        return 3 / 2
    } else {
        return 2
    }
}

function fill_hit_able_units(faction) {
    var battle = G.offensive.battle
    var enemy_faction = 1 - faction
    L.pool = []
    var units = ((battle.ground_stage || battle.air_naval[enemy_faction].length === 0)
        ? battle.ground[enemy_faction] : battle.air_naval[enemy_faction])
    units.filter(u => unit_on_board(u))
        .forEach(u => {
            var piece = pieces[u]
            map_set(L.pool, u, piece.lf)
        })
    trigger_event("before_apply_hits", faction)
    var result = []
    var ground_bombing = battle.air_naval[faction].length && !battle.air_naval[enemy_faction].length
    var reduced = []
    var critical = battle.critical[faction]
    var lower_lf_unit = [-1, 100]
    var hit_limit = battle.hits[faction]
    var distant_hits = battle.distant_hits_provided[faction] > 0
    for (var i = 0; i < L.pool.length; i += 2) {
        var unit = L.pool[i]
        var piece = pieces[unit]
        var base_lf = L.pool[i + 1]
        var loss_factor = battle.ground_stage && set_has(battle.amph_ground, unit) ? Math.ceil(base_lf / 2) : base_lf
        var reduced_status = map_get(battle.damaged[faction], unit, 0)
        if (!reduced_status) {
            reduced_status = set_has(G.reduced) ? 1 : 0
        }
        if (reduced_status >= 2) {
            continue
        }
        var could_be_damaged = loss_factor <= hit_limit && (distant_hits || !piece.br || G.location[unit] === battle.battle_hex)
        if (could_be_damaged && (critical || reduced_status || ground_bombing)) {
            map_set(result, unit, loss_factor)
        } else if (could_be_damaged) {
            map_set(result, unit, loss_factor)
        } else if (critical && lower_lf_unit[1] > loss_factor) {
            lower_lf_unit = [unit, loss_factor]
        }
    }
    if (!result.length && reduced.length) {
        result = reduced
    } else if (result.length <= 0 && critical && lower_lf_unit[0] >= 0 && !battle.damaged[faction].length) {
        map_set(result, lower_lf_unit[0], hit_limit)
    }
    battle.hit_able_units[faction] = result
}

function unit_on_board(unit) {
    return G.location[unit] < LAST_BOARD_HEX
}

function get_ground_roll_modifiers(faction) {
    var battle = G.offensive.battle
    var result = 0
    if (faction === G.offensive.attacker) {
        var air = [false, false]
        var naval = [false, false]
        battle.air_naval[faction].concat(battle.air_naval[1 - faction]).filter(u => unit_on_board(u)).forEach(u => {
            if (pieces[u].class === "naval" && G.location[u] === battle.battle_hex) {
                naval[pieces[u].faction] = true
            }
            if (pieces[u].br) {
                air[pieces[u].faction] = true
            }
        })
        if (air[faction] && !air[faction]) {
            result += 2
            log(`+2 ${faction ? "Ap" : "Jp"} air support`)
        }
        if (naval[faction] && !naval[faction]) {
            result += 2
            log(`+2 ${faction ? "Ap" : "Jp"} naval support`)
        }
    } else {
        var terrain = MAP_DATA[battle.battle_hex].terrain
        if (terrain === JUNGLE) {
            result += 1
            log(`+1 Jungle`)
        } else if (terrain === MIXED) {
            result += 2
            log(`+2 Mixed terrain`)
        }
        if (terrain === MOUNTAIN) {
            result += 3
            log(`+3 Mountains`)
        }

        if (battle.amph_ground.filter(u => unit_on_board(u)).length && !set_has(G.offensive.landind_hexes, battle.battle_hex)) {
            result += 3
            log(`+3 Amphibious assault`)
        }
    }
    if (faction === AP && G.location[ARMOR_BRIGADE] === battle.battle_hex) {
        result += 1
        log(`+1 Armor brigade`)
    }
    if (faction === JP && is_event_active(events.NEW_OPERATION_PLAN) && MAP_DATA[battle.battle_hex].island) {
        result += 1
        log(`+1 Defensive doctrine`)
    }
    return result
}

function get_naval_roll_modifiers(faction) {
    var battle = G.offensive.battle
    var result = 0
    if (faction === AP && G.offensive.intelligence === AMBUSH) {
        result += 4
        log(`+4 Ambush`)
    }
    if (faction === G.offensive.attacker && G.offensive.intelligence === SURPRISE) {
        result += 3
        log(`+3 Surprise attack`)
    }
    var ap_air_superiority = faction === AP && battle.air_naval[AP].filter(u => unit_on_board(u) && pieces[u].br).length > 0
    if (ap_air_superiority && G.turn >= 8) {
        result += 3
        log(`+3 Allied air superiority (1944-1945)`)
    } else if (ap_air_superiority && G.turn >= 5) {
        result += 1
        log(`+3 Allied air superiority (1943)`)
    }
    return result
}

function is_col_tsuji_applied(faction) {
    if (!(faction === JP && G.offensive.offensive_card === COL_TSUJI && G.offensive.type === EC
        && G.offensive.battle.ground_stage)) {
        return false
    }
    var map_data = MAP_DATA[G.offensive.battle.battle_hex]
    return map_data.terrain === JUNGLE || map_data.terrain === MIXED || map_data.region === "Malaya"
}

function execute_attack(faction) {
    var battle = G.offensive.battle
    var pool = (battle.ground_stage ? battle.ground : battle.air_naval)[faction].filter(u => unit_on_board(u))
    if (pool.length <= 0) {
        log(`${G.offensive.attacker === faction ? "Attacker" : "Defender"} has no ${battle.ground_stage ? "ground" : "air/naval"} units`)
        return
    }
    battle.strength[faction] = sum_combat_factor(pool)
    log(`${G.offensive.attacker === faction ? "Attacker" : "Defender"} fire (${battle.strength[faction]})`)
    battle.roll[faction] = random(10)
    battle.roll_modifiers = 0
    if (battle.ground_stage && is_col_tsuji_applied(faction)) {
        battle.roll_modifiers = 4
        log(`+4 Col.Tsuji`)
    } else if (battle.ground_stage) {
        battle.roll_modifiers = get_ground_roll_modifiers(faction)
    } else {
        battle.roll_modifiers = get_naval_roll_modifiers(faction)
    }
    trigger_event("before_battle_roll", faction)
    let roll = battle.roll[faction]
    var modififed_roll = roll + battle.roll_modifiers
    battle.hits[faction] = Math.ceil(battle.strength[faction] * (battle.ground_stage ? ground_battle_table(modififed_roll) : naval_battle_table(modififed_roll)))
    battle.distant_hits_provided[faction] = pool.filter(u => unit_on_board(u) && pieces[u].br).length
    if (roll === 9 && !battle.ground_stage) {
        battle.critical[faction] = true
    }
    log(`${roll}${battle.roll_modifiers ? " +" + battle.roll_modifiers : ""} (${ground_battle_table(modififed_roll)}) ${battle.critical[faction] ? " - critical !" : ""} x ${battle.strength[faction]} = ${battle.hits[faction]}`)
    fill_hit_able_units(faction)
}

P.choose_battle = {
    _begin() {
        G.offensive.battle = {}
        G.active = G.offensive.attacker
    },
    prompt() {
        prompt(`Choose battle hex.`)
        G.offensive.battle_hexes.forEach(b => action_hex(b))
    },
    action_hex(hex) {
        G.offensive.battle = {
            battle_hex: hex,
            ground_stage: false,
            air_naval: [[], []],
            ground: [[], []],
            amph_ground: [],
            strength: [0, 0],
            hits: [0, 0],
            roll: [-1, -1],
            hit_able_units: [[], []],
            distant_hits_provided: [0, 0],
            critical: [false, false],
            damaged: [[], []],
        }
        set_delete(G.offensive.battle_hexes, hex)
        naval_battle()
    },
}

P.assign_hits = {
    _begin() {
        var battle = G.offensive.battle
        L.done = [!battle.hit_able_units[0].length, !battle.hit_able_units[1].length]
        if (L.done[0] && L.done[1]) {
            apply_loss()
        }
    },
    prompt() {
        map_for_each(G.offensive.battle.hit_able_units[R], u => action_unit(u))
        if (!G.offensive.battle.hit_able_units[R].length) {
            button("done")
            prompt(`Commit hits. Remaining: ${Math.max(G.offensive.battle.hits[R], 0)}.`)
        } else {
            prompt(`Apply hits. ${G.offensive.battle.hits[R]}`)
        }
    },
    unit(unit) {
        push_undo()
        var piece = pieces[unit]
        var battle = G.offensive.battle
        var status = map_get(battle.damaged[R], unit, -1)
        if (status < 0) {
            status = set_has(G.reduced, unit) ? 1 : 0
        }
        map_set(battle.damaged[R], unit, ++status)
        battle.hits[R] -= map_get(G.offensive.battle.hit_able_units[R], unit)
        if (G.location[unit] !== battle.battle_hex && piece.br) {
            battle.distant_hits_provided[R] -= 1
        }
        fill_hit_able_units(R)
    },
    done() {
        push_undo()
        L.done[R] = true
        if (!L.done[1 - R]) {
            G.active = 1 - R
        } else {
            apply_loss()
        }
    }
}

function apply_loss() {
    var battle = G.offensive.battle
    var d = battle.damaged[0].concat(battle.damaged[1])
    for (var i = 1; i < d.length; i += 2) {
        var unit = d[i - 1]
        if (d[i] === 2) {
            eliminate(unit)
        } else {
            reduce_unit(unit)
        }
    }

    if (battle.roll[JP] < 0) {
        execute_attack(JP)
    } else if (battle.roll[AP] < 0) {
        execute_attack(AP)
    }
    if (battle.hit_able_units[0].length && !battle.hit_able_units[1].length) {
        G.active = 0
    } else if (battle.hit_able_units[1].length && !battle.hit_able_units[0].length) {
        G.active = 1
    } else if (!battle.ground_stage) {
        apply_battle_winner()
        ground_battle()
    } else {
        var attacker_win = battle.damaged[G.offensive.attacker].length > battle.damaged[1 - G.offensive.attacker].length ||
            battle.ground[G.offensive.attacker].filter(unit_on_board).length && !battle.ground[1 - G.offensive.attacker].filter(unit_on_board).length
        log(`${attacker_win ? "Attacker" : "Defender"} win in ground combat ${int_to_hex(battle.battle_hex)}`)
        battle.winner = (attacker_win == G.offensive.attacker) + 0
        check_us_casualties()
        goto("retreat")
    }
}

function check_us_casualties() {
    if (G.offensive.attacker === JP) {
        return
    }
    var battle = G.offensive.battle

    var survived_attacker_ground = battle.ground[AP].filter(u => G.location[u] <= LAST_BOARD_HEX).length
    var div_corp_size_unit = !survived_attacker_ground && battle.ground[AP].filter(u => {
        var piece = pieces[u]
        return piece.faction === AP && piece.class === "ground" && (piece.service === "army" || piece.service === "navy") && piece.size > 1
    }).length
    if (!survived_attacker_ground && div_corp_size_unit) {
        check_event(events.US_CASUALTIES)
    }
}

function apply_battle_winner() {
    var battle = G.offensive.battle
    var attacker_units = battle.air_naval[G.offensive.attacker].filter(u => unit_on_board(u))
    var defender_units = battle.air_naval[1 - G.offensive.attacker].filter(u => unit_on_board(u))
    var attacker_power = sum_combat_factor(attacker_units)
    var defender_power = sum_combat_factor(defender_units)

    var air_cover = attacker_units.filter(u => pieces[u].br).length || !defender_units.filter(u => pieces[u].br).length
    var attacker_win = attacker_power > defender_power && air_cover || defender_power === 0
    log(`${attacker_win ? "Attacker" : "Defender"} win battle (${attacker_power} - ${defender_power}) ${!air_cover ? "no attacker CV or " : ""}`)
    if (!attacker_win) {
        battle.amph_ground.forEach(u => set_delete(battle.ground[G.offensive.attacker], u))
    }
}

function naval_battle() {
    var battle = G.offensive.battle
    var hex = battle.battle_hex
    map_for_each(G.offensive.paths, (u, v) => {
        const piece = pieces[u]
        if (v[v.length - 1] === hex && (piece.class === "air" || piece.class === "naval")) {
            set_add(battle.air_naval[piece.faction], u)
        }
    })
    var attacker = G.offensive.attacker
    for_each_unit_on_map((u, piece) => {
        var location = G.location[u]
        if (location === hex && (piece.class === "air" || piece.class === "naval")
            && !set_has(G.offensive.active_units[piece.faction], u)) {
            set_add(battle.air_naval[piece.faction], u)
        } else if (location === hex && piece.class === "ground") {
            set_add(battle.ground[piece.faction], u)
            if (attacker === piece.faction && map_get(G.offensive.paths, u)[0] & AMPH_MOVE) {
                set_add(battle.amph_ground, u)
            }
        }
    })
    G.committed.forEach(u => set_delete(battle.air_naval[AP], u))
    if (battle.air_naval[JP].length || battle.air_naval[AP].length) {
        log(`Battle at ${int_to_hex(hex)}, 
            ${sum_combat_factor(battle.air_naval[G.offensive.attacker])} vs ${sum_combat_factor(battle.air_naval[1 - G.offensive.attacker])}`)
    }
    if (G.offensive.intelligence === INTERCEPT) {
        execute_attack(G.offensive.attacker)
        execute_attack(1 - G.offensive.attacker)
    } else if (G.offensive.intelligence === AMBUSH) {
        execute_attack(1 - G.offensive.attacker)
    } else {
        execute_attack(G.offensive.attacker)
    }
    if (G.offensive.intelligence === AMBUSH && battle.hit_able_units[1 - G.offensive.attacker].length < 1) {
        execute_attack(G.offensive.attacker)
    } else if (G.offensive.intelligence === SURPRISE && battle.hit_able_units[G.offensive.attacker].length < 1) {
        execute_attack(1 - G.offensive.attacker)
    }
    if (battle.hit_able_units[0].length && !battle.hit_able_units[1].length) {
        G.active = 0
    } else if (battle.hit_able_units[1].length && !battle.hit_able_units[0].length) {
        G.active = 1
    } else if (battle.hit_able_units[0].length && battle.hit_able_units[1].length) {
        G.active = [0, 1]
    } else {
        apply_loss()
        return
    }
    goto("assign_hits")
}

function ground_battle() {
    var battle = G.offensive.battle
    G.offensive.battle = {
        battle_hex: battle.battle_hex,
        ground_stage: true,
        air_naval: [[], []],
        ground: battle.ground,
        amph_ground: battle.amph_ground,
        strength: [0, 0],
        hits: [0, 0],
        roll: [-1, -1],
        hit_able_units: [[], []],
        distant_hits_provided: [0, 0],
        critical: [false, false],
        damaged: [[], []],
        winner: 1 - G.offensive.attacker
    }
    battle = G.offensive.battle
    var hex = battle.battle_hex
    if (battle.ground[JP].length || battle.ground[AP].length) {
        log(`Ground battle at ${int_to_hex(hex)}`)
    }
    execute_attack(G.offensive.attacker)
    execute_attack(1 - G.offensive.attacker)

    if (battle.hit_able_units[0].length && !battle.hit_able_units[1].length) {
        G.active = 0
    } else if (battle.hit_able_units[1].length && !battle.hit_able_units[0].length) {
        G.active = 1
    } else if (battle.hit_able_units[0].length && battle.hit_able_units[1].length) {
        G.active = [0, 1]
    } else {
        goto("retreat")
        return
    }
    goto("assign_hits")
}

P.retreat = {
    _begin() {
        G.active = 1 - G.offensive.battle.winner
        L.unit_to_retreat = []
        L.hex_to_retreat = []
        var battle_hex = G.offensive.battle.battle_hex
        capture_hex(battle_hex, G.offensive.battle.winner)
        var near = get_near_hexes(battle_hex)
        for (var j = 0; j < near.length; j++) {
            if (MAP_DATA[battle_hex].edges_int & GROUND << 5 * j && !is_faction_units(near[j], 1 - G.active)) {
                L.hex_to_retreat.push(near[j])
            }
        }
        for_each_unit_on_map((u, piece) => {
            var retreat_unit = piece.faction === G.active && piece.class === "ground" && G.location[u] === battle_hex
            if (retreat_unit && set_has(G.offensive.battle.amph_ground, u)) {
                set_add(G.offensive.ground_pbm, u)
            } else if (retreat_unit) {
                set_add(L.unit_to_retreat, u)
            }
        })
        if (!L.unit_to_retreat.length) {
            end()
        }
    },
    prompt() {
        if (G.active_stack.length) {
            prompt(`Choose space to retreat.`)
            L.hex_to_retreat.forEach(u => action_hex(u))
            if (!L.hex_to_retreat.length) {
                button("eliminate")
            }
        } else if (L.unit_to_retreat.length) {
            prompt(`Choose unit to retreat.`)
            L.unit_to_retreat.forEach(u => action_unit(u))
        } else {
            prompt(`Commit retreat.`)
            button("done")
        }
    },
    eliminate() {
        push_undo()
        eliminate(G.active_stack[0])
    },
    action_hex(hex) {
        push_undo()
        set_location(G.active_stack[0], hex)
        G.active_stack = []
    },
    unit(u) {
        push_undo()
        G.active_stack = [u]
        set_delete(L.unit_to_retreat, u)
    },
    done() {
        push_undo()
        end()
    }
}

function get_emergency_retreat_hexes(unit) {
    var piece = pieces[unit]
    var range = piece.class === "air" ? piece.ebr : 10
    var result = []
    for_each_hex_in_range(G.location[unit], range, h => {
        if (is_space_controlled(h, piece.faction) && (MAP_DATA[h].port && piece.class === "naval"
            || MAP_DATA[h].airfield && piece.class === "air")) {
            set_add(result, h)
        }
    })
    return result
}

P.emergency_move = {
    _begin() {
        L.hex_to_retreat = []
        L.unit_to_retreat = []
        for_each_unit_on_map((u, piece, location) => {
            if (piece.faction !== G.active || is_space_controlled(location, G.active) || piece.class === "ground") {
                return
            }
            if (piece.class === "hq") {
                eliminate(u)
            } else {
                set_add(L.unit_to_retreat, u)
            }
        })
        if (!L.unit_to_retreat.length) {
            end()
        }
    },
    prompt() {
        if (G.active_stack.length) {
            prompt(`Choose space to move.`)
            L.hex_to_retreat.forEach(u => action_hex(u))
            if (!L.hex_to_retreat.length) {
                button("eliminate")
            }
        } else if (L.unit_to_retreat.length) {
            prompt(`Choose unit to emergency move.`)
            L.unit_to_retreat.forEach(u => action_unit(u))
        } else {
            prompt(`Commit emergency move.`)
            button("done")
        }
    },
    eliminate() {
        push_undo()
        eliminate(G.active_stack[0])
        G.active_stack = []
    },
    unit(u) {
        push_undo()
        G.active_stack = [u]
        set_delete(L.unit_to_retreat, u)
        L.hex_to_retreat = get_emergency_retreat_hexes(u)
    },
    action_hex(hex) {
        push_undo()
        log(`${pieces[G.active_stack[0]].name} emergency moved to ${int_to_hex(hex)}`)
        set_location(G.active_stack[0], hex)
        G.active_stack = []
        check_supply()
    },
    done() {
        push_undo()
        end()
    }
}

function capture_landing_hexes() {
    G.offensive.landind_hexes.forEach(h => capture_hex(h, G.offensive.attacker))
    G.offensive.landind_hexes = []
}

P.offensive_sequence = script(`
    eval {
        trigger_event("before_activation")
    }
    call choose_hq
    call activate_units
    call move_offensive_units
    call declare_battle_hexes
    call commit_offensive
    set G.active 1-G.offensive.attacker
    call cancel_offensive
    call special_reaction
    call define_intelligence_condition
    if (G.offensive.intelligence != SURPRISE) {
        set G.offensive.stage REACTION_STAGE
        call choose_hq
        if (G.offensive.active_hq[G.active]) {
            call activate_units
            call move_offensive_units
        }
    }
    call attack_reaction_cards
    set G.offensive.stage BATTLE_STAGE
     call apply_attack_reaction
    if (G.offensive.active_hq[G.active]) {
        call commit_offensive
    }
    set G.active G.offensive.attacker
    while (G.offensive.battle_hexes.length > 0) {
        call choose_battle
    }
    eval {
        capture_landing_hexes()
    }
    set G.offensive.stage POST_BATTLE_STAGE
    set G.active 1-G.offensive.attacker
    call apply_attack_reaction
    if (G.offensive.active_units[G.active].length) {
        call move_offensive_units
        set G.offensive.active_units[1-G.offensive.attacker] []
        call check_overstacking
        call commit_offensive
    }
    set G.active G.offensive.attacker
    call move_offensive_units
    set G.offensive.active_units[G.offensive.attacker] []
    call check_overstacking
    call commit_offensive
    set G.active 1-G.offensive.attacker
    call emergency_move
    call check_overstacking
`)

P.political_phase = script(`
    log ("Political phase")
  
    call national_status_segment
    call india_surrender
    set G.active JP
    call emergency_move    
    set G.active AP
    call emergency_move
    call political_will_segment
    goto attrition_phase
`)

P.national_status_segment = function () {
    log(`Turn ${G.turn}. National status segment`)
    if (check_nation_surrender(nations.PHILIPPINES)) {
        if (G.surrender[nations.PHILIPPINES.id]) {
            for_each_unit_on_map((u, piece, location) => {
                if ((piece.class === "ground" || piece.class === "hq" ||
                        (piece.service !== "army" && piece.service !== "navy" && piece.service !== "us"))
                    && piece.faction === AP
                    && nations.PHILIPPINES.regions.includes(MAP_DATA[location].region)) {
                    eliminate(u)
                }
            })
        }
        set_control_over_nation(nations.PHILIPPINES)
    }
    check_nation_surrender(nations.MALAYA)
    if (check_nation_surrender(nations.DEI)) {
        if (G.surrender[nations.DEI.id]) {
            for_each_unit_on_map((u, piece) => {
                if (piece.service === "du") {
                    eliminate(u)
                }
            })
        }
        set_control_over_nation(nations.DEI)
    }
    if (check_nation_surrender(nations.BURMA) && G.surrender[nations.BURMA.id]) {
        for_each_unit((u, piece) => {
            if (piece.service === "bu") {
                eliminate_permanently(u)
            }
        })
    }
    degrade_india(true)
    if (check_nation_surrender(nations.AUSTRALIA) && check_event(events.AUSTRALIA_SURRENDER)) {
        for_each_unit((u, piece, location) => {
            if (piece.service === "au" && location >= LAST_BOARD_HEX) {
                eliminate_permanently(u)
            }
        })
    }
    if (check_nation_surrender(nations.AUSTRALIAN_MANDATES)) {
        set_control_over_nation(nations.AUSTRALIAN_MANDATES)
    }
    if (check_nation_surrender(nations.NEW_GUINEA)) {
        set_control_over_nation(nations.NEW_GUINEA, false)
    }
    if (check_nation_surrender(nations.MARSHALL)) {
        set_control_over_nation(nations.MARSHALL)
    }
    if (check_nation_controlled(nations.JAPAN, AP)) {
        finish("Allies", nations.JAPAN.name)
        return
    }
    end()
}

function india_stable() {
    if (G.surrender[nations.INDIA.id] === 0) {
        return
    } else if (G.surrender[nations.INDIA.id] < 4) {
        log(`India again stable`)
        G.surrender[nations.INDIA.id] = 0
    }
}

function update_china_status(diff, to_stable = false) {
    if (G.surrender[nations.CHINA.id] >= 5) {
        return
    }
    var prev = G.surrender[nations.CHINA.id]
    G.surrender[nations.CHINA.id] = Math.min(Math.max(prev + diff, 0), 5)

    if (!to_stable && prev > 0 && G.surrender[nations.CHINA.id] === 0) {
        G.surrender[nations.CHINA.id] = 1
    }
    if (G.surrender[nations.CHINA.id] === 5) {
        china_surrender()
    } else if (prev !== G.surrender[nations.CHINA.id]) {
        log(`China status changed to ${nations.CHINA.statuses[G.surrender[nations.CHINA.id]]}`)
    }
}

function degrade_india(could_revolt = false) {
    var jp_occupied = check_nation_controlled(nations.INDIA, JP)
    if (G.surrender[nations.INDIA.id] < (could_revolt ? 4 : 3) && jp_occupied) {
        G.surrender[nations.INDIA.id] += 1
        log(`India status changed to ${nations.INDIA.statuses[G.surrender[nations.INDIA.id]]}`)
    } else if (G.surrender[nations.INDIA.id] < 4 && !jp_occupied) {
        india_stable()
    }
}

function displace_to_turn(unit, turns, not_delayed) {
    if (pieces[unit].notreplaceable) {
        log(`${pieces[unit].name} not replacable, could not be displaced to turn box`)
        eliminate(unit)
        return
    }
    log(`${pieces[unit].name} displaced to turn box ${G.turn + turns}`)
    set_location(unit, TURN_BOX + G.turn + turns)
    if (not_delayed) {
        set_add(G.not_delayed, unit)
    }
}

function china_surrender() {
    log(`China surrenders!`)
    var units = [ap_army("5_cn"), ap_army("6_cn"), ap_army("66_cn")]
    units.forEach(u => {
        eliminate_permanently(u)
    })
    for_each_unit((u, piece, location) => {
        if (location === CHINA_BOX) {
            displace_to_turn(u, 1, true)
        }
    })
    change_political_will(-nations.CHINA.pw, "")
}

function change_political_will(diff, cause) {
    G.political_will = Math.max(G.political_will + diff, 0)
    G.political_will = Math.min(G.political_will, 10)
    log(`Political will changed to ${G.political_will} (${diff}) ${cause}`)
}

P.india_surrender = {
    _begin() {
        if (G.surrender[nations.INDIA.id] !== 4) {
            end()//stable or already executed
            return
        }
        G.active = AP
        L.hex_to_retreat = []
        L.unit_to_retreat = []
        for_each_unit((u, piece, location) => {
            var in_india = nations.INDIA.regions.includes(MAP_DATA[location].region)
            if (in_india && piece.class === "hq" && piece.service === "br") {
                eliminate(u)
            } else if (piece.service === "ind" && location <= LAST_BOARD_HEX || in_india) {
                set_add(L.unit_to_retreat, u)
            } else if (piece.service === "ind") {
                eliminate_permanently(u)
            }
        })
        change_political_will(-nations.INDIA.pw, nations.INDIA.name)

        log(`${nations.INDIA.name} surrendering -2 Political will`)
        check_supply()
        G.surrender[nations.INDIA.id] = 5
        if (!L.unit_to_retreat.length) {
            end()
        }
    },
    prompt() {
        if (G.active_stack.length) {
            prompt(`Choose space to move.`)
            L.hex_to_retreat.forEach(u => action_hex(u))

            var piece = pieces[G.active_stack[0]]
            if (piece.service === "army" || piece.service === "navy" || piece.service === "us") {
                button("no_move")
            } else if (!L.hex_to_retreat.length) {
                button("eliminate")
            }
        } else if (L.unit_to_retreat.length) {
            prompt(`Choose unit to emergency move.`)
            L.unit_to_retreat.forEach(u => action_unit(u))
        }
        if (!G.active_stack.length && (!L.unit_to_retreat.length || L.unit_to_retreat.map(u => pieces[u])
            .filter(piece => piece.service === "army" || piece.service === "navy" || piece.service === "us").length === L.unit_to_retreat.length)) {
            prompt(`Commit emergency move.`)
            button("done")
        }
    },
    eliminate() {
        push_undo()
        eliminate_permanently(pieces[G.active_stack[0]])
        G.active_stack = []
    },
    unit(u) {
        push_undo()
        G.active_stack = [u]
        set_delete(L.unit_to_retreat, u)
        L.hex_to_retreat = nations.INDIA.retreat_hexes.map(h => hex_to_int(h))
            .filter(h => is_space_controlled(h, AP) && !has_non_n_zoi(h, JP) && !is_overstack(h, u) && check_unit_supply(h, u, pieces[u]))
        if (pieces[u].service === "ind" || pieces[u].service === "bu") {
            L.hex_to_retreat = []
        }
    },
    action_hex(hex) {
        push_undo()
        log(`${pieces[G.active_stack[0]].name} emergency moved to ${int_to_hex(hex)}`)
        set_location(G.active_stack[0], hex)
        G.active_stack = []
        check_supply()
    },
    done() {
        push_undo()
        end()
    }
}

function check_nation_controlled(nation, faction) {
    for (var i = 0; i < nation.keys.length; i++) {
        if (set_has(G.control, hex_to_int(nation.keys[i])) == faction) {
            return false
        }
    }
    return true
}

function check_nation_surrender(nation) {
    if (!check_nation_controlled(nation, G.surrender[nation.id] ? AP : JP)) {
        return false
    }
    G.surrender[nation.id] = set_has(G.control, hex_to_int(nation.keys[0]))
    log(`${nation.name} ${G.surrender[nation.id] ? "occupied" : "liberated"}`)
    if (nation.pw) {
        change_political_will(nation.pw * (G.surrender[nation.id] ? -1 : 1), "")
    }
    return true
}

function set_control_over_nation(nation, only_ground = true) {
    clear_supply_cache(CLEAN_UNITS_MASK)
    for_each_unit_on_map(mark_unit)
    var faction = G.surrender[nation.id] ? JP : AP
    for (var i = 1; i < MAP_DATA.length; i++) {
        var hex_data = MAP_DATA[i]
        if (!nation.regions.includes(hex_data.region)) {
            continue
        }
        var no_enemy_units = (only_ground && !is_faction_ground_units(i, 1 - faction)) || !is_faction_units(i, 1 - faction)
        var control_changed = hex_data.named && no_enemy_units
        if (control_changed && faction === JP) {
            set_add(G.control, i)
        } else if (control_changed && faction === AP) {
            set_delete(G.control, i)
        }
    }
}


P.political_will_segment = function () {
    if (!events.ALLIED_NATIONS_SURRENDERS.nations.filter(n => !G.surrender[n]).length) {
        check_event(events.ALLIED_NATIONS_SURRENDERS)
    }
    check_occupation(events.ALASKA_OCCUPATION)
    check_occupation(events.HAWAII_OCCUPATION)
    check_jp_resources_event()
    check_naval_situation()
    check_progress_of_war()
    Object.keys(events).forEach(k => {
        var event = events[k]
        if (event.once_per_turn) {
            G.events[event.id] = 0
        }
    })
    check_supply()
    end()
}

function check_progress_of_war() {
    if (G.turn < 4) {
        return
    }
    var pow_count = G.capture.filter(h => !set_has(G.control, h)).length
    if (pow_count < G.pow) {
        change_political_will(-1, `current progress of war ${pow_count} < ${G.pow}`)
    }
}

function check_naval_situation() {
    var us_ship_count = 0
    var us_cv_count = 0
    for_each_unit_on_map((u, piece) => {
        if (piece.faction === AP && piece.service === "navy" && piece.class === "naval") {
            us_ship_count++
            if (piece.br) {
                us_cv_count++
            }
        }
    })
    if (!us_ship_count) {
        change_political_will(-1, "no US naval units")
    }
    if (!us_cv_count) {
        change_political_will(-1, "no US CV units")
    }
}

function check_jp_resources_event() {
    if (get_jp_resources() <= 3 && G.turn >= 5) {
        check_event(events.JAPAN_LACK_OF_RESOURCES)
    }
}

function is_event_active(event) {
    return G.events[event.id]
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

function check_occupation(event) {
    var result = event.keys.filter(k => is_faction_units(hex_to_int(k), JP)).length
    var map_value = G.events[event.id]
    var occupied_for = (G.turn - map_value) + 1
    if (!result && map_value > 0 && occupied_for <= event.turns_to_control) {
        G.events[event.id] = 0
        log(`Timer to ${event.cause} reset`)
    } else if (result && map_value && occupied_for === event.turns_to_control) {
        change_political_will(event.pw, event.cause)
    } else if (result && map_value <= 0) {
        G.events[event.id] = G.turn
        log(`Started ${event.cause}`)
    }
}

function get_jp_resources() {
    return G.control.filter(h => MAP_DATA[h].resource).length
}

P.attrition = {
    _begin() {
        L.unit_to_attrition = []
        var hq_list = []
        for_each_unit_on_map((u, piece) => {
            if (piece.faction === G.active && piece.class === "hq") {
                set_add(hq_list, u)
            }
        })
        for_each_unit_on_map((u, piece, location) => {
            if (piece.faction !== G.active || pieces[u].class === "naval" || pieces[u].class === "hq") {
                return;
            }
            if (set_has(G.oos, u)) {
                if (!set_has(G.reduced, u)) {
                    set_add(L.unit_to_attrition, u)
                } else {
                    for (var i = 0; i < hq_list.length; i++) {
                        var hq = hq_list[i]
                        if (get_distance(location, G.location[hq]) <= pieces[hq].cr) {
                            return
                        }
                    }
                    set_add(L.unit_to_attrition, u)
                }
            }
        })
        if (!L.unit_to_attrition.length) {
            end()
        }
    },
    prompt() {
        prompt(`Apply attrition for not-supplied units`)
        if (!L.unit_to_attrition.length) {
            button("done")
        }
        L.unit_to_attrition.forEach(u => action_unit(u))
    },
    unit(u) {
        if (set_has(G.reduced, u)) {
            eliminate(u)
        } else {
            reduce_unit(u)
        }
        set_delete(L.unit_to_attrition, u)
        clear_undo()
    },
    done() {
        clear_undo()
        end()
    }
}

P.attrition_phase = script(`
    log ("Attrition phase")
    set G.active JP
    call attrition
    set G.active AP
    call attrition
    eval {
        check_supply()
    }
    goto end_of_turn_phase
`)

function reshuffle() {
    if (G.discard[AP].includes(SOVIET_INVADE)) {
        log(`Allied deck reshuffled due to Soviet invasion discarded`)
        G.draw[AP].push(...G.discard[AP])
        G.discard[AP] = []
    }
    if (G.discard[JP].includes(TOJO_RESIGNS)) {
        log(`Japan deck reshuffled due to Tojo resign discarded`)
        G.draw[JP].push(...G.discard[JP])
        G.discard[JP] = []
    }
}

P.end_of_turn_phase = script(`
    log ("Turn " + G.turn + ", End of turn phase")
    eval {
    if (G.political_will <= 0) {
        finish("Japan", "US surrenders")
    }
    if (G.turn >= G.finish) {
        finish("Allies", "Japan surrenders")
    }
    }
    incr G.turn
    set G.asp[JP][1] 0
    set G.asp[AP][1] 0
    set G.capture []
    set G.committed []
    set G.draw_counter [0,0]
    set G.strategic_warfare 0
    set G.passes [0,0]
    eval {
        reshuffle()
    }
    goto strategic_phase
`)

function set_inter_service(faction, rivalry) {
    if (G.inter_service[faction] && !rivalry) {
        log(`${faction === AP ? "Allied" : "Japan"} service agreement`)
        G.inter_service[faction] = 0
    } else if (!G.inter_service[faction] && rivalry) {
        log(`${faction === AP ? "Allied" : "Japan"} inter-service rivalry`)
        G.inter_service[faction] = 1
    }
}

/* EVENTS */

function filter_activation_units(condition, faction) {
    if (G.active !== faction) {
        return
    }
    L.possible_units = L.possible_units.filter(u => condition(u, pieces[u]))
}

function could_play(card) {
    var faction = card.faction
    return get_hand(faction).length && !set_has(G.discard[faction], card.c) && !set_has(G.removed, card.c)
}

function trigger_event(stage, arg) {
    var result = null
    if (G.offensive.type === EC && G.offensive.offensive_card >= 0 && cards[G.offensive.offensive_card][stage]) {
        result = cards[G.offensive.offensive_card][stage](arg)
    }
    if (G.offensive.counter_offensive_card >= 0 && cards[G.offensive.counter_offensive_card][stage]) {
        result += cards[G.offensive.counter_offensive_card][stage](arg)
    }
    return result
}

function only_one_ground_unit(card) {
    var faction = cards[card].faction
    cards[card].after_unit_activation = function (u) {
        if (pieces[u].class === "ground") {
            filter_activation_units((u, piece) => piece.class !== "ground", faction)
        }
    }
}

cards[COL_TSUJI].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class === "ground", JP)
}

cards[JN_25_SPECIAL].can_play = function () {
    return G.offensive.active_cards.filter(c => cards[c].type === INTELLIGENCE && cards[c].faction === JP).length <= 0
}

cards[find_card(JP, 5)].event = function () {
    G.reinforcements.AIR += 2
    call("replacement_segment", {replacement_points: {AIR: 2}})
}

cards[find_card(JP, 6)].can_play = function () {
    return set_has(G.removed, DOOLITLE_RAID)
}

cards[find_card(JP, 8)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class === "naval", JP)
}

cards[find_card(JP, 8)].before_battle_roll = function (faction) {
    if (faction !== JP || G.offensive.battle.ground_stage) {
        return
    }
    var any_com_unit = false
    G.offensive.battle.air_naval[AP].map(u => pieces[u]).forEach(piece => {
        if (piece.service === "br" && piece.class === "air" || piece.id === "kent") {
            any_com_unit = true
        }
    })
    if (any_com_unit) {
        G.offensive.battle.roll_modifiers += 1
        log(`+1 Operation C`)
    }
}

cards[find_card(JP, 9)].before_unit_activation = function () {
    G.offensive.naval_move_distance = 21
}

only_one_ground_unit(find_card(JP, 9))

cards[find_card(JP, 10)].can_play = function () {
    return !G.inter_service[JP]
}

cards[find_card(JP, 12)].before_commit_offensive = function () {
    if (G.offensive.stage !== ATTACK_STAGE) {
        return
    }
    if (G.offensive.battle_hexes.filter(h => !MAP_DATA[h].island)) {
        return "All battles must be fought in one hex island."
    }
}

cards[find_card(JP, 12)].before_intelligence_roll = function () {
    var ca_in_shoals = false
    for_each_unit((u, piece, location) => {
        if (piece.type === "ca" && piece.faction === AP && piece.service === "navy" && get_distance(FRENCH_FRIGATE_SHOALS, location) <= 3) {
            ca_in_shoals = true
        }
    })
    if ((G.supply_cache[FRENCH_FRIGATE_SHOALS] & AP_ZOI) === 0 && !ca_in_shoals) {
        log(`+4 Japanese superior information security`)
        return 4
    }
}

only_one_ground_unit(find_card(JP, 14))

cards[find_card(JP, 14)].before_apply_hits = function (faction) {
    if (faction === JP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    for (var i = 0; i < L.pool.length; i++) {
        var piece = pieces[L.pool[i]]
        if (piece.type === "cv") {
            L.pool[i + 1] += 2
            modifier++
        }
    }
}

cards[find_card(JP, 15)].event = function () {
    degrade_india()
    check_event(events.INDEPENDENCE_CAMPAIGN)
}


cards[find_card(JP, 16)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", JP)
}

cards[find_card(JP, 17)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "ground", JP)
}

cards[find_card(JP, 17)].after_unit_activation = function (u) {
    var p_class = pieces[u].class
    filter_activation_units((u, piece) => piece.class === p_class, JP)
}

cards[find_card(JP, 17)].before_battle_roll = function (faction) {
    if (faction === AP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    G.offensive.battle.air_naval[JP].filter(u => unit_on_board(u)).map(u => pieces[u]).forEach(piece => {
        if (piece.type === "ca" || piece.type === "cl" || piece.type === "apd") {
            G.offensive.battle.strength[faction] += 2
            modifier += 2
        }
    })
    if (modifier) {
        log(`+${modifier} attack strength (Night fighting advantage)`)
    }
}

cards[find_card(JP, 18)].can_play = function () {
    return events.KWAI_RIVER_BRIDGE.keys.filter(h => is_space_controlled(h, JP)).length >= 2
}

cards[find_card(JP, 18)].event = function () {
    check_event(events.KWAI_RIVER_BRIDGE)
}

cards[find_card(JP, 20)].before_commit_offensive = function () {
    call("naval_battle_guadalcanal")
}

P.naval_battle_guadalcanal = {
    _begin() {
        L.allowed_units = []
        var jp_bb_hex = []
        G.offensive.active_units[JP].forEach(u => {
            var piece = pieces[u]
            if (piece.type === "bb" && set_has(G.offensive.battle_hexes, G.location[u])) {
                set_add(jp_bb_hex, G.location[u])
            }
        })
        var ap_bb_hex = []
        for_each_unit_on_map((u, piece, location) => {
            if (piece.faction === JP || !set_has(G.offensive.battle_hexes, location)) {
                return
            }
            if (piece.type === "bb") {
                set_add(ap_bb_hex, location)
            } else if (piece.class === "air") {
                set_add(L.allowed_units, u)
            }
        })
        L.allowed_units = L.allowed_units.filter(u => !set_has(ap_bb_hex, G.location[u]))
    },
    prompt() {
        prompt(`${offensive_card_header()} Choose airfield bombardment target.`)
        L.allowed_units.forEach(u => action_unit(u))
        if (L.allowed_units.length <= 0) {
            button("skip")
        }
    },
    skip() {
        push_undo()
        log(`No airfield bombardment`)
        end()
    },
    unit(u) {
        push_undo()
        log(`${G.location[u]} airfield bombardment selected`)
        damage_unit(u)
        end()
    }
}

cards[find_card(JP, 21)].can_play = function () {
    return G.offensive.active_hq.includes(HQ_SEAC)
}

P.worker_strikes_unit = {
    _begin() {
        L.allowed_units = []
        for_each_unit_on_map((u, piece, location) => {
            if (piece.service !== "ind" || piece.size !== 3 || set_has(G.reduced, u)) {
                return
            }
            set_add(L.allowed_units, u)
        })
        if (L.allowed_units.length <= 0) {
            log(`No full strength Indian corps`)
            end()
        }
    },
    prompt() {
        prompt(`Worker strikes. Choose unit.`)
        L.allowed_units.forEach(u => action_unit(u))
    },
    unit(u) {
        push_undo()
        log(`Worker strikes: ${pieces[u].name}`)
        damage_unit(u)
        end()
    }
}

cards[find_card(JP, 21)].event = function () {
    G.active = AP
    G.offensive.active_cards = [find_card(JP, 21)]
    call("worker_strikes_unit")
}


cards[find_card(JP, 23)].before_battle_roll = function (faction) {
    if (faction === AP || !G.offensive.battle.ground_stage) {
        return
    }
    var any_com_unit = false
    G.offensive.battle.ground[JP].map(u => pieces[u]).forEach(piece => {
        if (unit_on_board(piece.u) && piece.class === "ground" && piece.size === 3) {
            any_com_unit = true
        }
    })
    G.offensive.battle.ground[AP].map(u => pieces[u]).forEach(piece => {
        if (unit_on_board(piece.u) && piece.class === "ground" && piece.size === 3) {
            any_com_unit = true
        }
    })
    if (any_com_unit) {
        G.offensive.battle.roll_modifiers += 1
        log(`+1 Operation RE`)
    }
}

cards[find_card(JP, 24)].event = function () {
    call("submarine_attack", {success: 4, card: find_card(JP, 24)})
}

cards[find_card(JP, 25)].before_battle_roll = function (faction) {
    if (faction === JP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    G.offensive.battle.air_naval[AP].filter(u => unit_on_board(u)).map(u => pieces[u]).forEach(piece => {
        if (piece.type === "cv") {
            G.offensive.battle.strength[faction] -= 2
            modifier -= 2
        }
    })
    if (modifier) {
        log(`${modifier} attack strength (Allied tactical confusion)`)
    }
}

cards[find_card(JP, 27)].event = function () {
    call("submarine_attack", {success: 4, critical: 7, card: find_card(JP, 27)})
}

only_one_ground_unit(find_card(JP, 28))

cards[find_card(JP, 28)].before_activation = function () {
    call("tokyo_express")
}

P.tokyo_express = {
    _begin() {
    },
    prompt() {
        prompt(`${offensive_card_header()} Place Tokyo express marker.`)
        for_each_unit_on_map((u, piece, location) => {
            if (piece.class === "hq" && piece.faction === JP && !set_has(G.oos, u)) {
                for_each_hex_in_range(location, piece.cr, h => {
                    if (MAP_DATA[h].terrain > OCEAN && !is_space_controlled(h, AP) && !is_faction_units(h, AP)) {
                        action_hex(h)
                    }
                })
            }
        })
    },
    action_hex(h) {
        push_undo()
        log(`Tokyo Express placed: ${int_to_hex(h)}`)
        G.events[events.TOKYO_EXPRESS.id] = h
        check_supply()
        end()
    }
}

cards[find_card(JP, 29)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "ground", JP)
}

cards[find_card(JP, 29)].before_battle_roll = function (faction) {
    if (faction === AP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    G.offensive.battle.air_naval[JP].filter(u => unit_on_board(u)).map(u => pieces[u]).forEach(piece => {
        if (piece.class === "naval" && piece.br) {
            G.offensive.battle.strength[faction] += 2
            modifier += 2
        }
    })
    if (modifier) {
        log(`+${modifier} attack strength (Effective aerial torpedo tactics)`)
    }
}

cards[find_card(JP, 30)].event = function () {
    G.reinforcements.AIR += 3
    call("replacement_segment", {replacement_points: {AIR: 3}})
}

cards[find_card(JP, 31)].event = function () {
    check_event(events.NEW_OPERATION_PLAN)
}

cards[find_card(JP, 32)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class === "air", JP)
}

cards[find_card(JP, 32)].before_battle_roll = function (faction) {
    if (faction === AP || G.offensive.battle.ground_stage) {
        return
    }
    var battle = G.offensive.battle.battle_hex
    var cv_present = for_each_unit_on_map((u, piece, location) => {
        if (piece.faction === JP && (piece.type === "cv" || piece.type === "cvl") && get_distance(battle, location) <= 6) {
            return true
        }
    })
    if (cv_present) {
        G.offensive.battle.roll_modifiers += 1
        log(`+1 Air shuttle`)
    }
}

cards[find_card(JP, 33)].event = function () {
    call("draw_from_discard")
}

P.draw_from_discard = {
    _begin() {
        if (G.discard[R].length === 0 || G.discard[R].length === 1 && G.discard[R][0] === G.offensive.offensive_card) {
            log(`Discard pile is empty, could not replace card`)
            end()
        }
        if (G.future_offensive[R] < 0 && G.hand[R].length === 0) {
            log(`Have no card to discard, could not replace card`)
            end()
        }
    },
    prompt() {
        if (L.card) {
            prompt(`${offensive_card_header()} Choose card to draw.`)
            G.discard[R].forEach(c => action_card(c))
        } else {
            prompt(`${offensive_card_header()} Choose card to discard.`)
            if (G.future_offensive[R] >= 0) {
                action_card(G.future_offensive[R])
            }
            G.hand[R].forEach(c => action_card(c))
            button("skip")
        }
    },
    skip() {
        log(`${R === AP ? "Ap" : "Jp"} choose to skip replace card`)
        end()
    },
    card(c) {
        push_undo()
        if (!L.card) {
            L.card = c
            G.offensive.active_cards = []
            var event = G.offensive.offensive_card
            G.discard[R].forEach(c => {
                if (event !== c) {
                    G.offensive.active_cards.push(c)
                }
            })
            log(`${R === AP ? "Ap" : "Jp"} discard ${cards[c].name}`)
            discard_card(c)
            return
        }
        set_delete(G.discard, c)
        G.hand[R].push(c)
        G.offensive.active_cards = []
        log(`${R === AP ? "Ap" : "Jp"} draw ${cards[c].name} from discard pile`)
        end()
    }
}

cards[find_card(JP, 35)].event = function () {
    call("guadalcanal_evacuation")
}

P.guadalcanal_evacuation = {
    _begin() {
        L.allowed_hexes = []
        for (var i = 0; i < LAST_BOARD_HEX; i++) {
            if (is_faction_units(i, JP) && MAP_DATA[i].coastal) {
                set_add(L.allowed_hexes, i)
            }
        }
        L.allowed_units = []
        L.stage = 1
    },
    prompt() {
        if (L.stage === 1) {
            prompt(`${offensive_card_header()} Choose coastal hex.`)
            L.allowed_hexes.forEach(c => action_hex(c))
        } else if (L.stage === 2) {
            prompt(`${offensive_card_header()} Choose units to evacuation.${G.offensive.active_units[JP].length === 0 && L.allowed_units.length === 0 ? " (No possible units)." : ""}`)
            if (G.offensive.active_units[JP].length) {
                button("done")
            }
            L.allowed_units.forEach(u => action_unit(u))
        } else {
            prompt(`${offensive_card_header()} Choose destination port hex.${L.allowed_hexes.length === 0 ? " (No possible hex)." : ""}`)
            L.allowed_hexes.forEach(c => action_hex(c))
        }
    },
    done() {
        push_undo()
        L.stage++
    },
    action_hex(h) {
        push_undo()
        if (L.stage === 1) {
            L.allowed_hexes = get_guadalcanal_evacuation_destination(h)
            L.stage++
            for_each_unit_on_map((u, piece, location) => {
                if (piece.faction === JP && piece.class === "ground" && get_distance(location, h) <= 1) {
                    set_add(L.allowed_units, u)
                }
            })
        } else {
            G.offensive.active_units[JP].forEach(u => set_location(u, h))
            G.offensive.active_units[JP] = []
            check_supply()
            goto("check_overstacking")
        }
    },
    unit(u) {
        push_undo()
        set_add(G.offensive.active_units[JP], u)
        set_delete(L.allowed_units, u)
        if (L.allowed_units.length <= 0 || G.offensive.active_units[JP].length >= 3) {
            L.stage++
        }
    }
}

function get_guadalcanal_evacuation_destination(location) {
    const move_data = {naval_move_distance: 15}
    if (MAP_DATA[location].port && is_space_controlled(location, JP)) {
        move_data.naval_move_distance = 30
    }
    const queue = [location]
    const distance_map = [location, 0]
    const result = []
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        const distance = map_get(distance_map, item) + 1
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (distance > move_data.naval_move_distance
                || !(MAP_DATA[item].edges_int & WATER << 5 * j)
                || distance >= map_get(distance_map, nh, [100])) {
                continue
            }
            if (distance < move_data.naval_move_distance) {
                queue.push(nh)
            }
            map_set(distance_map, nh, distance)
            if (MAP_DATA[nh].port && is_space_controlled(nh, JP)) {
                set_add(result, nh)
            }
        }
    }
    return result
}

cards[find_card(JP, 36)].event = function () {
    call("submarine_attack", {success: 4, card: find_card(JP, 36)})
}

cards[find_card(JP, 37)].before_activation = function () {
    if (is_event_active(events.SUBMARINE_DOCTRINE)) {
        log(`US Submarine doctrine suppress JP escorts`)
        return
    }
    if (is_event_active(events.JP_ESCORTS)) {
        log(`JP gains +4 escort bonus`)
        G.events[events.MIGHTY_JP_ESCORTS.id] = G.turn
        G.events[events.JP_ESCORTS.id] = 0
    } else {
        log(`JP gains +2 escort bonus`)
        G.events[events.JP_ESCORTS.id] = G.turn
    }
}

cards[find_card(JP, 38)].before_activation = cards[find_card(JP, 37)].before_activation

cards[find_card(JP, 39)].event = function () {
    call("replacement_segment", {replacement_points: {GROUND: 2}})
}

cards[find_card(JP, 39)].before_replacement = function () {
    L.replacable_units = []
    for_each_unit_on_map((u, piece, location) => {
        if (piece.class === "ground" && piece.faction === JP && set_has(G.reduced, u) && get_distance(RANGOON, location) <= 3) {
            set_add(L.replacable_units, u)
        }
    })
}

cards[find_card(JP, 40)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", JP)
}

cards[TOJO_RESIGNS].event = function () {
    check_event(events.TOJO)
}

cards[find_card(JP, 44)].before_activation = function () {
    G.jp_asp = []
    G.jp_asp[0] = 2 + Math.max(0, G.asp[JP][1] - G.asp[JP][0])
    G.jp_asp[1] = G.asp[JP][1]
    log('Japan gain 2 temporary ASPs')
    G.asp[JP][0] += G.jp_asp[0]
    call("tokyo_express")
}

cards[find_card(JP, 44)].before_commit_offensive = function () {
    G.asp[JP][0] -= G.jp_asp[0]
    G.asp[JP][1] -= Math.min(G.asp[JP][1] - G.jp_asp[1], 2)
    delete G['jp_asp']
}

function check_kamikaze_playable() {
    if (!G.offensive.kamikaze) {
        set_kamikaze_able_battles()
    }
    return G.offensive.active_cards.filter(c => cards[c].kamikaze).length < G.offensive.kamikaze.length
}

function set_kamikaze_able_battles() {
    if (G.offensive.kamikaze) {
        return
    }
    var ap_naval_commited = []
    map_for_each(G.offensive.paths, (u, path) => {
        if (pieces[u].faction === AP && pieces[u].class === "naval" && unit_on_board(u)) {
            set_add(ap_naval_commited, path[path.length - 1])
        }
    })
    var battles = []
    for_each_unit_on_map((u, piece, location) => {
        if (piece.faction === JP && piece.class === "air") {
            G.offensive.battle_hexes
                .filter(h => get_distance(h, TOKYO) <= 11
                    && set_has(ap_naval_commited, h)
                    && get_distance(h, location) <= piece.ebr)
                .forEach(h => set_add(battles, h))
        }
    })
    G.offensive.kamikaze = battles
}

P.kamikaze_attack = {
    _begin() {
        L.allowed_units = []
        for_each_unit_on_map((u, piece, location) => {
            if (piece.faction === JP && piece.class === "air" && G.offensive.kamikaze.filter(bh => get_distance(bh, location) <= piece.ebr).length) {
                set_add(L.allowed_units, u)
            }
        })
        if (L.allowed_units.length <= 0) {
            log(`No kamikaze attack possible`)
            end()
        }
        L.stage = 1
    },
    prompt() {
        if (L.stage === 1) {
            prompt(`Kamikaze attack. Choose air unit.`)
            L.allowed_units.forEach(u => action_unit(u))
        } else {
            prompt(`Kamikaze attack. Choose target. Hits: ${L.hits}.`)
            var has_non_damaged = L.allowed_units.filter(u => !set_has(G.reduced, u)).length
            if (L.hits > 0) {
                L.allowed_units.forEach(u => {
                    if (!set_has(G.reduced, u) || !has_non_damaged) {
                        action_unit(u)
                    }
                })
            }
            if (G.offensive.counter_offensive_card === SHO_GO && !G.offensive.sho_go) {
                action_card(SHO_GO)
            }
        }
        if (L.allowed_units.length <= 0 || L.hits <= 0) {
            button("done")
        }
    },
    done() {
        push_undo()
        end()
    },
    card(c) {
        push_undo()
        G.offensive.sho_go = 1
        L.hits += 1
        log(`+1 kamikaze hit (Sho-go)`)
    },
    unit(u) {
        push_undo()
        if (L.stage === 1) {
            var location = G.location[u]
            log(`${pieces[u].name} launch kamikaze attack.`)
            damage_unit(u)
            L.allowed_units = []
            map_for_each(G.offensive.paths, (ap, path) => {
                var bh = path[path.length - 1]
                console.log(pieces[u].name)
                console.log(int_to_hex(bh))
                console.log(G.offensive.kamikaze.map(h => int_to_hex(h)))
                console.log(int_to_hex(location))
                console.log(get_distance(bh, location))
                console.log(pieces[u].ebr)
                if (pieces[ap].faction === AP && pieces[ap].class === "naval" && unit_on_board(ap) && set_has(G.offensive.kamikaze, bh)
                    && get_distance(bh, location) <= pieces[u].ebr) {
                    set_add(L.allowed_units, ap)
                }
            })
            L.stage++
            L.hits = 2
        } else {
            L.hits -= 1
            var bh = get_unit_battle_hex(u)
            set_delete(G.offensive.kamikaze, bh)
            damage_unit(u)
            L.allowed_units = L.allowed_units.filter(au => unit_on_board(au) && get_unit_battle_hex(au) === bh)
        }
    }
}

function get_unit_battle_hex(unit) {
    var path = map_get(G.offensive.paths, unit)
    return path[path.length - 1]
}

cards[find_card(JP, 46)].before_apply_hits = function (faction) {
    if (faction === AP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    for (var i = 0; i < L.pool.length; i++) {
        var piece = pieces[L.pool[i]]
        if (piece.br && piece.class === "naval") {
            L.pool[i + 1] += 2
            modifier++
        }
    }
}

cards[find_card(JP, 47)].before_battle_roll = function (faction) {
    if (faction === AP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    G.offensive.battle.air_naval[JP].filter(u => unit_on_board(u)).map(u => pieces[u]).forEach(piece => {
        if (piece.type === "ca") {
            G.offensive.battle.strength[faction] += 2
            modifier += 2
        }
    })
    if (modifier) {
        log(`+${modifier} attack strength (Float plane tactics)`)
    }
}

cards[GENERAL_ADACHI].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", JP)
}

cards[find_card(JP, 50)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", JP)
}

cards[find_card(JP, 75)].event = function () {
    call("submarine_attack", {success: 4, card: find_card(JP, 75)})
}

cards[find_card(JP, 86)].event = function () {
    call("submarine_attack", {success: 7, card: find_card(JP, 86)})
}

P.submarine_attack = {
    _begin() {
        log(`${cards[L.card].name} played`)
        var roll = random(10)
        L.hits = 0
        if (roll <= L.success) {
            log(`${roll} - Loss one naval step`)
            L.hits = 1
        } else if (L.critical && roll <= L.critical) {
            log(`${roll} - Loss two naval steps`)
            L.hits = 2
        } else {
            log(`${roll} - No effect`)
        }
        L.allowed_units = []
        G.offensive.active_units[AP].forEach(u => {
            if (unit_on_board(u) && pieces[u].class === "naval") {
                set_add(L.allowed_units, u)
            }
        })
        clear_undo()
        if (L.allowed_units.length <= 0 || L.hits <= 0) {
            end()
        }
    },
    prompt() {
        prompt(`Submarine attack. Apply hits: ${L.hits}.`)
        L.allowed_units.forEach(u => action_unit(u))
    },
    unit(u) {
        push_undo()
        log(`Submarine attack: ${pieces[u].name}`)
        damage_unit(u)
        if (!unit_on_board(u)) {
            set_delete(L.allowed_units, u)
        }
        L.hits -= 1
        if (L.allowed_units.length <= 0 || L.hits <= 0) {
            end()
        }
    }
}

for (var i = 0; i < cards.length; i++) {
    var always_true = () => true
    const card = cards[i]
    card.c = i
    cards[i].could_play = () => could_play(card)
    if (!cards[i].can_play) {
        cards[i].can_play = always_true
    }
    if (!cards[i].event) {
        cards[i].event = always_true
    }
    if (cards[i].kamikaze) {
        cards[i].event = () => call("kamikaze_attack")
        cards[i].can_play = () => check_kamikaze_playable()
    }
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
        if (cards[G.offensive.offensive_card].china) {
            update_china_status(cards[G.offensive.offensive_card].china)
        }
        cards[G.offensive.offensive_card].event()
    }
    goto end_action
`)

/* SETUP */

function construct_decks() {
    G.draw = [[], []]

    for (let c = 0; c < cards.length; ++c) {
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

function eliminate_permanently(unit) {
    if (G.location[unit] !== NON_PLACED_BOX) {
        log(`${pieces[unit].name} removed from game`)
    }
    set_location(unit, NON_PLACED_BOX)
    set_delete(G.reduced, unit)
}

function eliminate(unit) {
    var piece = pieces[unit]
    var size = get_overstack_size(unit)
    var location = G.location[unit]
    if (location <= LAST_BOARD_HEX || location === CHINA_BOX) {
        G.overstack[i] -= size
    }
    if (piece.class === "hq" && !piece.notreplaceable) {
        displace_to_turn(unit, 1)
        return
    }
    log(`${pieces[unit].name} eliminated`)
    G.location[unit] = ELIMINATED_BOX
    set_delete(G.reduced, unit)
}

function damage_unit(unit) {
    if (set_has(G.reduced, unit)) {
        eliminate(unit)
    } else {
        reduce_unit(unit)
    }
}

function reduce_unit(unit) {
    log(`${pieces[unit].name} reduced`)
    set_add(G.reduced, unit)
}

function draw_all_cards() {
    G.hand = [[], []]
    for (let i = 0; i < cards.length; i++) {
        G.hand[cards[i].faction].push(i)
    }
}

function setup_scenario_1942() {
    log("#Japan Offensive")
    log("The Japan assault on Asia (December 1941) caught allies off guard")

    for (let i = 0; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.reinforcement !== 2) {
            continue
        }
        if (piece.faction) {
            G.location[i] = DELAYED_BOX
        }
        if (piece.start_reduced) {
            set_add(G.reduced, i)
        }
    }
    //ap setup
    eliminate(find_piece("mdca"))
    eliminate(M_CORPS)
    eliminate(HK_DIVISION)
    eliminate(find_piece("forcez"))
    eliminate(NL_CORPS)
    G.location[HQ_SEAC] = hex_to_int(1805)
    G.location[US_FEAF] = hex_to_int(2813)
    set_add(G.reduced, US_FEAF)
    G.location[SL_CORPS] = hex_to_int(2912)
    set_add(G.reduced, SL_CORPS)
    G.location[LRB_19] = hex_to_int(2917)
    set_add(G.reduced, LRB_19)
    G.location[US_ASIA_CA] = hex_to_int(3014)
    set_add(G.reduced, US_ASIA_CA)
    G.location[AF7] = hex_to_int(5108)
    G.location[AF7_LRB] = hex_to_int(5808)
    G.location[find_piece("lexington")] = hex_to_int(5808)
    set_delete(G.reduced, find_piece("lexington"))
    G.location[find_piece("enterprise")] = hex_to_int(5808)
    set_delete(G.reduced, find_piece("enterprise"))
    G.location[N_ORLEANS] = hex_to_int(5808)
    set_add(G.reduced, N_ORLEANS)

    //jp setup
    set_add(G.control, hex_to_int(1912))
    set_add(G.control, hex_to_int(2012))
    setup_jp_unit(jp_army(38), 1913)
    setup_jp_unit(jp_army(15), 2109)
    setup_jp_unit(jp_army(28), 2110, true)
    setup_jp_unit(jp_army(25), 2112, true)
    setup_jp_unit(jp_air(22), 2212)
    setup_jp_unit(HQ_JP_SOUTH, 2212)
    setup_jp_unit(find_piece("mogami"), 2311)
    setup_jp_unit(find_piece("kongo"), 2311)
    setup_jp_unit(jp_army("2sn"), 2415)
    setup_jp_unit(jp_army(17), 2709, true)
    setup_jp_unit(jp_army(14), 2812)
    setup_jp_unit(jp_air(5), 2812)
    setup_jp_unit(jp_air(21), 2909)
    setup_jp_unit(find_piece("takao"), 2909)
    setup_jp_unit(jp_army("1sn"), 2911)
    setup_jp_unit(jp_army(19), 2913, true)
    setup_jp_unit(jp_army(16), 2915, true)
    setup_jp_unit(find_piece("ryujo"), 2915)
    setup_jp_unit(find_piece("zuiho"), 2915)
    setup_jp_unit(find_piece("nachi"), 2915)
    setup_jp_unit(jp_air(2), 3004)
    setup_jp_unit(jp_army(35), 3007, true)
    setup_jp_unit(jp_air(23), 3009)
    setup_jp_unit(KOREAN_ARMY, 3305)
    setup_jp_unit(HQ_YAMAMOTO, 3407)
    setup_jp_unit(find_piece("nagato"), 3407)
    setup_jp_unit(find_piece("yamato"), 3407, true)
    setup_jp_unit(jp_air(25), 3407)
    setup_jp_unit(jp_air(3), 3607)
    setup_jp_unit(jp_air(4), 3607)
    setup_jp_unit(jp_army(27), 3704, true)
    setup_jp_unit(ED_ARMY, 3706)
    setup_jp_unit(jp_air(1), 3706)
    setup_jp_unit(jp_army(18), 3706, true)
    setup_jp_unit(find_piece("akagi"), 3706)
    setup_jp_unit(find_piece("soryu"), 3706)
    setup_jp_unit(find_piece("shokaku"), 3706)
    setup_jp_unit(find_piece("hiei"), 3706)
    setup_jp_unit(jp_army("3sn"), 3814)
    setup_jp_unit(HQ_SOUTH_SEAS, 4017)
    setup_jp_unit(find_piece("kamikaze"), 4017)
    setup_jp_unit(find_piece("aoba"), 4021)
    setup_jp_unit(jp_army("ss"), 4021)
    setup_jp_unit(jp_army("4sn"), 4715, true)
    setup_jp_unit(jp_air(24), 4715)
    setup_jp_unit(find_piece("tenyru"), 4715)

    for_each_unit_on_map(u => control_hex(G.location[u], pieces[u].faction))

    remove_card(find_card(JP, 1))
    remove_card(find_card(JP, 2))

    while (G.hand[JP].length < 7)
        draw_card(JP)
    while (G.hand[AP].length < 5)
        draw_card(AP)
    G.passes[AP] = 2
    G.passes[JP] = 0
    G.turn = 2
    G.asp[1] = [1, 0]
    G.political_will = 8
    G.china_divisions = 11
    draw_all_cards()
    check_supply()
    fill_overstack()
    call("offensive_phase")
}


function setup_scenario_1943() {
    log("#1943 War never changes")

    var surrender = [nations.MALAYA, nations.PHILIPPINES, nations.DEI, nations.BURMA, nations.AUSTRALIAN_MANDATES]
    surrender.forEach(n => {
        G.surrender[n.id] = 1
        set_control_over_nation(n)
    })

    G.reduced = []
    //ap setup
    for (var i = 0; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.faction === AP && piece.start && piece.notreplaceable) {
            G.location[i] = ELIMINATED_BOX
        }
    }
    for (let i = 0; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.reinforcement !== 5) {
            continue
        }
        if (piece.faction) {
            G.location[i] = DELAYED_BOX
        }
        if (piece.start_reduced) {
            set_add(G.reduced, i)
        }
    }
    G.location[find_piece("wasp")] = ELIMINATED_BOX
    G.location[find_piece("northampton")] = ELIMINATED_BOX
    G.location[HQ_SOUTH_GHORMLEY] = ELIMINATED_BOX
    G.location[find_piece("indomitable")] = hex_to_int(1005)
    G.location[find_piece("warspite")] = hex_to_int(1005)
    G.location[find_piece("london")] = hex_to_int(1005)
    G.location[HQ_SEAC] = hex_to_int(1805)
    G.location[ap_air("seac")] = hex_to_int(1805)
    G.location[ap_army("15")] = hex_to_int(1905)
    G.location[ap_air("10_lrb")] = hex_to_int(1905)
    G.location[ap_air("14_lrb")] = CHINA_BOX
    G.location[ap_army("4_ind")] = hex_to_int(2006)
    G.location[ap_air("14")] = hex_to_int(2104)
    G.location[ap_army("33")] = hex_to_int(2105)
    G.location[ap_army("1_ind")] = hex_to_int(2205)
    set_add(G.reduced, ap_army("1_ind"))
    G.location[ap_army("5_cn")] = hex_to_int(2205)
    G.location[ap_army("6_cn")] = hex_to_int(2407)
    G.location[ap_army("66_cn")] = hex_to_int(2407)
    set_add(G.reduced, ap_army("6_cn"))
    set_add(G.reduced, ap_army("66_cn"))
    G.location[ap_army("1_m")] = hex_to_int(3626)
    G.location[ap_air("5")] = hex_to_int(3626)
    G.location[ap_air("5_lrb")] = hex_to_int(3626)
    G.location[HQ_SOUTH_WEST] = hex_to_int(3727)
    G.location[ap_army("2_au")] = hex_to_int(3727)
    G.location[find_piece("kent")] = hex_to_int(3727)
    G.location[HQ_ANZAC] = hex_to_int(3823)
    G.location[ap_army("pm")] = hex_to_int(3823)
    set_add(G.reduced, ap_army("pm"))
    G.location[ap_army("3_au")] = hex_to_int(3823)
    G.location[ap_air("au")] = hex_to_int(3823)
    G.location[ap_army("11")] = hex_to_int(3922)
    G.location[ap_army("1")] = hex_to_int(4024)
    G.location[ap_army("14")] = hex_to_int(4423)
    G.location[ap_army("2_m")] = hex_to_int(4423)
    G.location[ap_air("1_maw")] = hex_to_int(4423)
    G.location[ap_air("2_maw")] = hex_to_int(4825)
    G.location[ap_air("13")] = hex_to_int(4825)
    G.location[ap_air("13_lrb")] = hex_to_int(4825)
    G.location[ap_army("sf")] = hex_to_int(4825)
    G.location[HQ_SOUTH_HELSEY] = hex_to_int(4828)
    G.location[ap_army("3_nz")] = hex_to_int(4828)
    G.location[find_piece("lexington")] = hex_to_int(4828)
    G.location[find_piece("enterprise")] = hex_to_int(4828)
    G.location[find_piece("washington")] = hex_to_int(4828)
    G.location[find_piece("carolina")] = hex_to_int(4828)
    set_add(G.reduced, find_piece("lexington"))
    set_add(G.reduced, find_piece("enterprise"))
    G.location[ap_air("11")] = hex_to_int(5100)
    G.location[ap_air("11_lrb")] = hex_to_int(5100)
    G.location[ap_air("7_lrb")] = hex_to_int(5108)
    G.location[HQ_CENTRAL_PACIFIC] = hex_to_int(5808)
    G.location[ap_air("7")] = hex_to_int(5808)
    G.location[ap_army("10")] = hex_to_int(5808)
    G.location[ap_army("mb")] = hex_to_int(5808)
    G.location[find_piece("missouri")] = hex_to_int(5808)


    //jp setup
    G.location[find_piece("kongo")] = ELIMINATED_BOX
    G.location[find_piece("akagi")] = ELIMINATED_BOX
    G.location[find_piece("soryu")] = ELIMINATED_BOX
    G.location[find_piece("ryujo")] = ELIMINATED_BOX
    G.location[find_piece("tenyru")] = ELIMINATED_BOX
    G.location[jp_air("t")] = ELIMINATED_BOX
    set_add(G.control, hex_to_int(1813))
    setup_jp_unit(jp_air(3), 1916, true)
    setup_jp_unit(jp_army(25), 1916, true)
    setup_jp_unit(jp_army(28), 2008)
    setup_jp_unit(jp_air(5), 2008)
    set_add(G.control, hex_to_int(2108))
    set_add(G.control, hex_to_int(2014))
    set_add(G.control, hex_to_int(2015))
    set_add(G.control, hex_to_int(2017))
    set_add(G.control, hex_to_int(2018))
    setup_jp_unit(jp_army(33), 2106)
    set_add(G.control, hex_to_int(2019))
    set_add(G.control, hex_to_int(2110))
    setup_jp_unit(jp_army(15), 2206)
    G.location[HQ_JP_SOUTH] = hex_to_int(2212)
    setup_jp_unit(jp_army(38), 2212)
    setup_jp_unit(jp_air(27), 2212)
    setup_jp_unit(jp_air(23), 2220)
    setup_jp_unit(jp_army(16), 2220, true)
    set_add(G.control, hex_to_int(2305))
    set_add(G.control, hex_to_int(2415))
    set_add(G.control, hex_to_int(2517))
    setup_jp_unit(jp_army(37), 2616, true)
    setup_jp_unit(jp_air(28), 2620)
    set_add(G.control, hex_to_int(2709))
    setup_jp_unit(jp_army(14), 2813)
    setup_jp_unit(jp_air(22), 2909, true)
    setup_jp_unit(jp_air(8), 2915)
    setup_jp_unit(jp_army(35), 2915)
    setup_jp_unit(jp_air(2), 3004)
    setup_jp_unit(jp_air(4), 3004)
    setup_jp_unit(jp_air(7), 3119)
    set_add(G.control, hex_to_int(3219))
    set_add(G.control, hex_to_int(3319))
    setup_jp_unit(jp_army("kor"), 3305)
    setup_jp_unit(HQ_YAMAMOTO, 3407)
    setup_jp_unit(find_piece("junyo"), 3407)
    setup_jp_unit(find_piece("nagato"), 3407)
    setup_jp_unit(find_piece("mogami"), 3407, true)
    set_add(G.control, hex_to_int(3520))
    set_add(G.control, hex_to_int(3620))
    setup_jp_unit(jp_army("27"), 3704, true)
    setup_jp_unit(jp_army("ed"), 3706)
    setup_jp_unit(jp_air(1), 3706)
    setup_jp_unit(jp_air(6), 3720)
    setup_jp_unit(jp_army(19), 3720)
    set_add(G.control, hex_to_int(3721))
    set_add(G.control, hex_to_int(3814))
    setup_jp_unit(jp_army(31), 3813, true)
    setup_jp_unit(jp_army(18), 3822)
    setup_jp_unit(HQ_SOUTH_SEAS, 4017)
    setup_jp_unit(find_piece("yamato"), 4017)
    setup_jp_unit(find_piece("shokaku"), 4017)
    setup_jp_unit(find_piece("zuiho"), 4017)
    setup_jp_unit(find_piece("hiei"), 4017)
    setup_jp_unit(find_piece("nachi"), 4017)
    setup_jp_unit(jp_army(17), 4021)
    setup_jp_unit(jp_air(21), 4021, true)
    setup_jp_unit(find_piece("aoba"), 4021, true)
    setup_jp_unit(find_piece("takao"), 4021)
    setup_jp_unit(find_piece("kamikaze"), 4021)
    setup_jp_unit(jp_air(25), 4222, true)
    setup_jp_unit(jp_army("ss"), 4322)
    setup_jp_unit(jp_air(26), 4415)
    setup_jp_unit(jp_army("2sn"), 4600, true)
    setup_jp_unit(jp_army("4sn"), 4612, true)
    setup_jp_unit(jp_army("3sn"), 4715)
    setup_jp_unit(jp_air(24), 4715, true)
    set_add(G.control, hex_to_int(4719))
    setup_jp_unit(jp_army("1sn"), 5018)

    for_each_unit_on_map(u => control_hex(G.location[u], pieces[u].faction))

    G.turn = 5
    G.asp[JP] = [7, 0]
    G.asp[AP] = [4, 0]
    G.pow = 4
    G.political_will = 6
    G.china_divisions = 7
    G.surrender[nations.CHINA.id] = 2
    G.wie = 4
    G.inter_service = [1, 1]
    G.events[events.HUMP.id] = 1
    G.events[events.JARHAT_ROAD.id] = 1


    var jr = [1, 2, 5, 6, 13, 15, 18, 39, 55, 73, 78]
    jr.forEach(i => remove_card(find_card(JP, i)))
    var ar = [1, 3, 4, 6, 7, 8, 10, 11, 12, 14, 16, 17, 20, 51]
    ar.forEach(i => remove_card(find_card(AP, i)))
    discard_card(find_card(AP, 13))
    discard_card(find_card(AP, 15))
    var jd = [8, 12, 14, 20, 25, 29, 35]
    jd.forEach(i => discard_card(find_card(JP, i)))

    while (G.hand[JP].length < 7) {
        draw_card(JP)
    }
    while (G.hand[AP].length < 7) {
        draw_card(AP)
    }
    draw_all_cards()
    check_supply()
    fill_overstack()
    call("offensive_phase")
}

function remove_card(card) {
    var faction = cards[card].faction
    discard_card(card)
    array_delete(G.discard[faction], card)
    set_add(G.removed, card)
}

function discard_card(card) {
    var faction = cards[card].faction
    array_delete(G.draw[faction], card)
    set_add(G.discard[faction], card)
    if (G.future_offensive[faction] === card.c) {
        G.future_offensive[faction] = -1
        G.events[events.FUTURE_OFFENSIVE_JP.id + faction] = 0
    } else {
        array_delete_item(G.hand[faction], card)
    }
}

function ap_air(id) {
    return find_piece("air_ap_" + id)
}

function ap_army(id) {
    return find_piece("army_ap_" + id)
}

function jp_air(id) {
    return find_piece("air_jp_" + id)
}

function jp_army(id) {
    return find_piece("army_jp_" + id)
}

function setup_jp_unit(piece, hex_id, reduced = false) {
    let hex = hex_to_int(hex_id)
    if (MAP_DATA[hex].named) {
        set_add(G.control, hex)
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

    G.active = JP
    G.turn = 1
    G.finish = 12
    G.passes = [0, 0]
    G.removed = [] // removed one-time events (both sides)
    G.hand = [[], []]
    G.future_offensive = [-1, -1]
    G.discard = [[], []]
    G.asp = [[7, 0], [0, 0]]
    G.active_stack = []
    G.inter_service = [0, 0]
    G.wie = 3
    G.china_divisions = 12
    G.burma_road = 0

    G.location = []
    G.reduced = []
    G.oos = []
    G.reinforcements = {NAVAL: 0, AIR: 0}
    G.strategic_warfare = 0
    G.control = []
    G.capture = []
    G.draw_counter = [0, 0]
    G.events = []
    G.not_delayed = []
    Object.keys(events).forEach(k => G.events[events[k].id] = 0)
    G.surrender = [...Array(Object.keys(nations).length).keys()].map(i => 0)
    G.surrender[nations.MARSHALL.id] = true //only nation under JP control
    G.committed = []
    G.supply_cache = []
    G.overstack = []
    G.pow = 0
    for (let i = 1; i < LAST_BOARD_HEX; i++) {
        if (is_controllable_hex(i) && ["JMandates", "Korea", "Manchuria", "China", "Formosa", "Indochina", "Siam", "Caroline", "Marshall", "Japan"].includes(MAP_DATA[i].region)) {
            set_add(G.control, i)
        }
    }
    set_add(G.control, hex_to_int(2109))
    set_add(G.control, hex_to_int(3606))
    reset_offensive()
    construct_decks()
    for (let i = 0; i < pieces.length; i++) {
        var piece = pieces[i]
        G.location[i] = NON_PLACED_BOX
        if (piece.start) {
            G.location[i] = hex_to_int(piece.start)
            if (piece.start_reduced) {
                set_add(G.reduced, i)
            }
        }
    }

    switch (scenario) {
        case "1942":
            return setup_scenario_1942()
        case "1943":
            return setup_scenario_1943()
    }
}

function on_view() {
    V.turn = G.turn
    V.location = G.location
    V.removed = G.removed
    V.reduced = G.reduced
    V.political_will = G.political_will
    V.inter_service = G.inter_service
    V.wie = G.wie
    V.passes = G.passes
    V.asp = G.asp

    V.control = G.control
    V.capture = G.capture
    V.oos = G.oos
    V.supply_cache = G.supply_cache
    V.hand = []
    V.pow = G.pow
    V.future_offensive = [-1, -1]
    V.active_stack = G.active_stack
    V.surrender = G.surrender
    V.events = G.events
    V.draw_counter = G.draw_counter
    V.reinforcements = G.reinforcements
    V.burma_road = G.burma_road
    V.china_divisions = G.china_divisions
    V.offensive = {
        active_units: G.offensive.active_units[0].concat(G.offensive.active_units[1]),
        paths: G.offensive.paths,
        active_cards: G.offensive.active_cards,
        active_hq: G.offensive.active_hq,
        battle_hexes: G.offensive.battle_hexes,
        landind_hexes: G.offensive.landind_hexes,
        damaged: G.offensive.battle && G.offensive.battle.damaged ? G.offensive.battle.damaged[R] : [],
    }


    if (R !== JP) {
        V.hand[JP] = G.hand[JP].length + G.offensive.draw.filter(c => cards[c].faction === JP).length
    } else {
        V.hand[JP] = G.hand[JP].slice()
        G.offensive.draw.filter(c => cards[c].faction === JP).forEach(c => V.hand[JP].push(c))
        V.future_offensive[JP] = G.future_offensive[JP]
    }
    if (R !== AP) {
        V.hand[AP] = G.hand[AP].length + G.offensive.draw.filter(c => cards[c].faction === AP).length
    } else {
        V.hand[AP] = G.hand[AP].slice()
        G.offensive.draw.filter(c => cards[c].faction === AP).forEach(c => V.hand[AP].push(c))
        V.future_offensive[AP] = G.future_offensive[AP]
    }
}

function action_card(c) {
    action("card", c)
}

function action_unit(p) {
    action("unit", p)
}

function action_hex(p) {
    action("action_hex", p)
}

function hex_to_int(i) {
    return (Math.floor(i / 100) - 10) * 29 + i % 100
}

function int_to_hex(i) {
    return (Math.floor(i / 29) * 100) + 1000 + i % 29
}

function reset_offensive() {
    G.offensive = {
        type: EC,
        attacker: JP,
        active_cards: [],
        offensive_card: -1,
        counter_offensive_card: -1,
        intelligence: SURPRISE,
        stage: ATTACK_STAGE,
        logistic: 0,
        naval_move_distance: 0,
        ground_move_distance: 0,
        ground_pbm: [],
        active_hq: [],
        draw: [],
        active_units: [[], []],
        paths: [],
        battle_hexes: [],
        landind_hexes: [],
        barges: false,
        zoi_intelligence_modifier: false,
        battle: {},
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
    if (G.undo) {
        G.undo.push(copy_state())
    }
}

function restore_state(state) {
    if (state) {
        var save_log = G.log
        var save_undo = G.undo
        G = state
        G.log = save_log
        G.undo = save_undo
    }
}

function copy_state() {
    var copy, k, v
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
    return copy
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