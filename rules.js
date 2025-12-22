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
const NAVAL_STRAT_MOVE = 1 << 0
const NAVAL_MOVE = 1 << 1
const GROUND_MOVE = 1 << 2
const AMPH_MOVE = 1 << 3
const AIR_STRAT_MOVE = 1 << 4
const AIR_MOVE = 1 << 5
const AIR_CLOSE_MOVE = 1 << 6
const POST_BATTLE_MOVE = 1 << 7
const REACTION_MOVE = 1 << 8

//Intelligence
const SURPRISE = 0
const INTERCEPT = 1
const AMBUSH = 2

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

// Hex status
const JP_ZOI = 1 << 0
const AP_ZOI = 1 << 1
const JP_ZOI_NTRL = 1 << 2
const AP_ZOI_NTRL = 1 << 3
const JP_SUPPLY = 1 << 4
const US_SUPPLY = 1 << 5
const BR_SUPPLY = 1 << 6
const JOINT_SUPPLY = 1 << 7
const JP_UNITS = 1 << 8
const AP_UNITS = 1 << 9
const JP_GAH_UNITS = 1 << 10
const AP_GAH_LOCK = 1 << 11
const JP_STRAT_MOVE_LOCK = 1 << 12
const AP_STRAT_MOVE_LOCK = 1 << 13

const LAST_BOARD_HEX = 1476
const ELIMINATED_BOX = 1478
const DELAYED_BOX = 1479
const TURN_BOX = 1480

const {pieces, cards, map} = require("./data.js")

// PIECES
const SEAC_HQ = find_piece("hq_ap_seac")
const M_CORPS = find_piece("army_ap_m")
const NL_CORPS = find_piece("army_ap_nl")
const SL_CORPS = find_piece("army_ap_sl")
const HK_DIVISION = find_piece("army_ap_hk")
const US_FEAF = find_piece("air_ap_feaf")
const LRB_19 = find_piece("air_ap_19")
const AF7 = find_piece("air_ap_7")
const AF7_LRB = find_piece("air_ap_7_lrb")
const US_ASIA_CA = find_piece("casia")
const US_ASIA_DD = find_piece("dasia")
const N_ORLEANS = find_piece("orleans")

const JP_SOUTH_HQ = find_piece("hq_jp_s")
const JP_SOUTH_SEAS_HQ = find_piece("hq_jp_ss")
const YAMAMOTO_HQ = find_piece("hq_jp_cy")
const KOREAN_ARMY = find_piece("army_jp_kor")
const ED_ARMY = find_piece("army_jp_ed")


function find_piece(id) {
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].id === id) {
            return i
        }
    }
    throw new Error("Missed unit " + id);
}

/* INIT */

const map_data = []
map.forEach(h => map_data[hex_to_int(h.id)] = h)

for (let i = 1; i < LAST_BOARD_HEX; ++i) {
    let hex = map_data[i]
    if (!hex) {
        hex = {id: int_to_hex(i), terrain: OCEAN, region: "Ocean"}
        map_data[i] = hex
    }

    hex.edges_int = 0
    hex.coastal = false
    let nh = get_near_hexes(i)
    for (let j = 0; j < nh.length; j++) {

        let near_hex = map_data[nh[j]]
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
        hex.coastal = hex.coastal || (border & WATER)
        hex.edges_int = hex.edges_int | (border << 5 * j)

    }
    if (hex.airfield || hex.port || hex.port || hex.city) {
        hex.named = true
    }
}


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
    call initiative_segment
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
        G.future_offensive[R] = [-1, 0]
        goto("play_event", {card: card})
    },
    pass() {
        G.active = 1 - G.active
        end()
    }
}

function get_allowed_actions(num) {
    let card = cards[num]
    let result = ["ops", "discard", "event"]
    if (card.ops >= 3) {
        result.push("inter_service")
        result.push("infrastructure")
        if (R === JP) {
            result.push("china_offensive")
        }
    }
    if (G.future_offensive[R][0] <= 0) {
        result.push("future_offensive")
    }
    return result
}

function activate_card(c) {
    push_undo()
    G.offensive.active_cards.push(c)
    if (G.future_offensive[R][1] === c) {
        G.future_offensive[R] = [-1, 0]
    } else {
        array_delete_item(G.hand[R], c)
    }
    G.discard[R].push(c)
    G.offensive.attacker = R
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
            let card = G.hand[R][i]
            get_allowed_actions(card).forEach(a => action(a, card))
        }
        if (G.future_offensive[R][0] > 0 && G.future_offensive[R][0] < G.turn) {
            let card = G.future_offensive[R][1]
            get_allowed_actions(card).forEach(a => action(a, card))
        }
    },
    ops(c) {
        activate_card(c)
        log(`${R} played ${cards[c].name} as operation card`)
        goto("offensive_sequence")
    },
    event(c) {
        activate_card(c)
        log(`${R} played ${cards[c].name} as event card(not implemented so just operations)`)
        goto("offensive_sequence")
    },
    discard(c) {
        activate_card(c)
        log(`${R} discards ${cards[c].name}`)
        goto("end_action")
    },
    inter_service() {
    },
    infrastructure() {
    },
    china_offensive() {
    },
    future_offensive(c) {
        push_undo()
        log(`${R} played future offensive`)
        G.future_offensive[R] = [G.turn, c]
        goto("end_action")
    },
    pass() {
        G.passes[R] -= 1
        goto("end_action")
    }
}

P.choose_hq = {
    prompt() {
        prompt(cards[G.offensive.active_cards[0]].name + ". Choose HQ.")
        for (let i = 0; i < pieces.length; i++) {
            let piece = pieces[i]
            let faction = R === AP ? "ap" : "jp"
            if (piece.faction === faction && piece.class === "hq") {
                action_unit(i)
            }
        }
    },
    unit(u) {
        push_undo()
        G.offensive.active_hq[R] = u
        log(`${pieces[u].name} activated`)
        end()
    },
}

function get_distance(first_hex, second_hex) {
    return Math.abs(Math.floor(first_hex / 29) - Math.floor(second_hex / 29)) + Math.abs(first_hex % 29 - second_hex % 29)
}

P.activate_units = {
    _begin() {
        L.hq_bonus = pieces[G.offensive.active_hq[G.active]].cm
    },
    prompt() {
        prompt(`${cards[G.offensive.active_cards[0]].name}. Activate units ${G.offensive.logistic} + ${L.hq_bonus} / ${G.offensive.active_units[R].length}.`)
        for (let i = 0; i < pieces.length; i++) {
            let piece = pieces[i]
            let faction = R === AP ? "ap" : "jp"
            let hq = G.offensive.active_hq[G.active]
            if (piece.faction === faction && get_distance(G.location[hq], G.location[i]) <= pieces[hq].cr && piece.class !== "hq" &&
                !set_has(G.offensive.active_units[R], i)) {
                action_unit(i)
            }
        }
        button("done")
    },
    unit(u) {
        push_undo()
        set_add(G.offensive.active_units[R], u)
        if (G.offensive.active_units[R].length >= (G.offensive.logistic + L.hq_bonus)) {
            end()
        }
    },
    done() {
        push_undo()
        end()
    },
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
        if (!L.type) {
            L.type = 0
        }
        check_supply()
    },
    prompt() {
        prompt(`${cards[G.offensive.active_cards[0]].name}. Move activated units.`)
        button("done")
        if (G.offensive.active_stack.length === 0) {
            for (let i = 0; i < G.offensive.active_units[R].length; i++) {
                if (!G.offensive.paths[R][i] || L.type & POST_BATTLE_MOVE) {
                    action_unit(G.offensive.active_units[R][i])
                }
            }
        } else {
            let loc = G.location[G.offensive.active_stack[0]]
            let active_air = is_active_air()
            for (let i = 0; i < G.offensive.active_units[R].length; i++) {
                let unit = G.offensive.active_units[R][i]
                if ((!G.offensive.paths[R][i] || L.type & POST_BATTLE_MOVE) && loc === G.location[unit] &&
                    (active_air === (pieces[unit].class === "air")) && !set_has(G.offensive.active_stack, unit)) {
                    action_unit(unit)
                }
            }
            for (let i = 0; i < L.allowed_hexes.length - 1; i++) {
                action_hex(L.allowed_hexes[i])
            }
        }
    },
    unit(u) {
        push_undo()
        G.offensive.active_stack.push(u)
        if (G.offensive.active_stack.length === 1) {
            L.leader = G.offensive.active_units[R].indexOf(u)
            L.distance = cards[G.offensive.active_cards[0]].ops * 5
            L.location = G.location[u]
            ground_naval_move_hexes(L.distance, L.type ? L.type : 0)
            G.offensive.paths[G.active][L.leader] = [ANY_MOVE, L.location]
        } else {
            G.offensive.paths[G.active][G.offensive.active_units[R].indexOf(u)] = 1
            ground_naval_move_hexes(L.distance, L.type ? L.type : 0)
        }
    },
    action_hex(hex) {
        push_undo()
        log(`Units ${G.offensive.active_stack} moved to ${int_to_hex(hex)}`)
        let leader = G.offensive.active_units[R][0]
        for (let i = 0; i < G.offensive.active_stack.length; i++) {
            G.location[G.offensive.active_stack[i]] = hex
        }
        L.allowed_hexes = []
        G.offensive.paths[R][L.leader].push(hex)
        if (L.type & POST_BATTLE_MOVE) {
            G.offensive.active_stack.forEach(u => array_delete_item(G.offensive.active_units[R], u))
        }
        G.offensive.active_stack = []
        end()
    },
    done() {
        push_undo()
        let path = G.offensive.paths[R]
        for (let i = 0; i < G.offensive.active_units[R].length; i++) {
            if (!path[i]) {
                path[i] = 1
            }
        }
        if (L.type & POST_BATTLE_MOVE) {
            G.offensive.active_units[R] = []
        }
        end()
    },
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

function check_supply() {
    L.supply_cache = []
    for (let i = 0; i < pieces.length; i++) {
        let piece = pieces[i]
        let location = G.location[i]
        if (location > LAST_BOARD_HEX) {
            continue
        }
        let faction = piece.faction === "ap"
        if (piece.class === "air") {
            let mask = 0 | (JP_ZOI << faction) | (JP_ZOI_NTRL << 1 - faction)
            L.supply_cache[location] = L.supply_cache[location] | (JP_GAH_UNITS << faction) | (JP_UNITS << faction)
            get_near_hexes(location).flatMap(h => get_near_hexes(h)).forEach(h => {
                L.supply_cache[h] = L.supply_cache[h] | mask
                console.log(`Hex zoi ${int_to_hex(h)} - ${piece.faction}`)
            })
        } else if (piece.class === "hq" || piece.class === "ground") {
            L.supply_cache[location] = L.supply_cache[location] | (JP_GAH_UNITS << faction) | (JP_UNITS << faction)
        }
    }
    console.log(L.supply_cache.filter(h => h))
}

function get_move_data() {
    let result = {
        ground_present: false,
        naval_present: false,
        battle_range: 0,
        is_cv_escort: false,
        naval_move_distance: 0,
        strat_move_distance: 0,
        ground_move_distance: 0,
    }
    G.offensive.active_stack.forEach(u => {
        let piece = pieces[u]
        if (piece.class === "ground") {
            result.ground_present = true
        } else if (piece.class === "naval") {
            result.naval_present = true
        }
        if (piece.br && (result.battle_range === 0 || piece.br < result.battle_range)) {
            result.battle_range = piece.br
        }
    })
    result.naval_move_distance = (cards[G.offensive.active_cards[0]].ops * 5)
    result.strat_move_distance = cards[G.offensive.active_cards[0]].ops * 5 * 2
    result.ground_move_distance = (cards[G.offensive.active_cards[0]].ops * 2)
    result.is_cv_escort = result.battle_range > 0
    return result
}

function get_move_cost(terrain) {
    return terrain - (terrain > 2) ? 1 : 0
}

function ground_naval_move_hexes(distance_max, move_type) {
    let location = L.location
    let result = []
    let participate_battle = []
    let move_data = get_move_data()
    console.log(L)
    console.log(map_data[location])
    console.log(move_data)
    if (!(move_type & POST_BATTLE_MOVE) && !(move_type & REACTION_MOVE) && map_data[location].port) {
        move_type = move_type | NAVAL_STRAT_MOVE
    }
    if (move_data.ground_present && !move_data.naval_present) {
        move_type = move_type | GROUND_MOVE
    }

    if (map_data[location].coastal) {
        move_type = move_type | NAVAL_MOVE
        if (move_data.ground_present) {
            move_type = move_type | AMPH_MOVE
        }
    }
    if (map_data[location].coastal) {
        console.log(`Check navy ${move_data}`)
        for (let i = 0; i < L.supply_cache.length; i++) {
            if (L.supply_cache[i] & (JP_UNITS << R)) {
                console.log(int_to_hex(i))
            }
        }
        check_hexes_in_distance(location,
            (h, nh, j) => {
                return (map_data[h].edges_int & WATER << 5 * j) && true
            },
            move_data.naval_move_distance,
            h => {
                // console.log(`Try ${int_to_hex(h)}`)
                if ((map_data[h].port && G.control[h] === R) //to friendly port
                    || L.supply_cache[h] & (JP_UNITS << R) //directly attack to hex
                    || set_has(participate_battle, h) //cv ranged attack is possible
                    || move_data.is_cv_escort && move_data.ground_present && map_data[h].terrain > OCEAN //amphibious landing with cv cover
                ) {
                    console.log(`success ${h}`)
                    set_add(result, h)
                }
            })
        console.log(`Check navy no zoi`)
        console.log(`${L.supply_cache[hex_to_int(2910)] & JP_ZOI << 1 - R} - ${L.supply_cache[hex_to_int(2910)] & JP_ZOI_NTRL << 1 - R}`)
        console.log(`${L.supply_cache[hex_to_int(3009)] & JP_ZOI << 1 - R} - ${L.supply_cache[hex_to_int(3009)] & JP_ZOI_NTRL << 1 - R}`)
        console.log(`${L.supply_cache[hex_to_int(3108)] & JP_ZOI << 1 - R} - ${L.supply_cache[hex_to_int(3108)] & JP_ZOI_NTRL << 1 - R}`)
        check_hexes_in_distance(location, (h, nh, j) => (map_data[h].edges_int & WATER << 5 * j && (!(L.supply_cache[nh] & JP_ZOI << 1 - R) || (L.supply_cache[nh] & JP_ZOI_NTRL << 1 - R))) && true,
            move_data.naval_move_distance * ((move_type & NAVAL_STRAT_MOVE) << 1),
            (h, distance) => {
                console.log(h)
                console.log(map_data[h])
                if ((map_data[h].port && G.control[h] === R) //to friendly port
                    || move_data.ground_present && distance <= move_data.naval_move_distance && map_data[h].terrain > OCEAN //amphibious landing avoiding ezoi
                ) {
                    // console.log(`Hex accepted ${int_to_hex(h)}, distance ${distance}, port ${(map_data[h].port && G.control[h] === R)}, `)
                    set_add(result, h)
                }
            }
        )
    }
    if (move_data.ground_present && !move_data.naval_present) {
        console.log(`Check ground`)
        check_hexes_in_distance(location,
            (h, nh, j) => {
                if (!(map_data[h].edges_int & GROUND << 5) || L.supply_cache[h] & JP_GAH_UNITS << R) {
                    return 0;
                }
                if (map_data[h].edges_int & ROAD << 5 * j && !(L.supply_cache[nh] & JP_STRAT_MOVE_LOCK << R)) {
                    return 1;
                } else {
                    return get_move_cost(map_data[nh].terrain) * 2
                }
            },
            move_data.ground_move_distance,
            h => {
                if (map_data[h].terrain > OCEAN) {
                    set_add(result, h)
                }
            }
        )
    }
    set_delete(result, location)
    L.allowed_hexes = result

}

function check_hexes_in_distance(location, connection_check, limit, process_hex) {
    let queue = []
    let distance_map = []
    queue.push(location)
    map_set(distance_map, location, 0)
    let i = 0
    while (true) {
        let item = queue[i]
        console.log(`Check item ${item}`)
        let base_distance = map_get(distance_map, item)
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < 6; j++) {
            let nh = nh_list[j]
            if (nh < 0 || map_get(distance_map, nh)) {
                continue
            }
            let distance = base_distance
            let con_check_result = connection_check(item, nh, j, distance)
            if (con_check_result <= 0) {
                continue
            }
            distance += con_check_result
            // console.log(`distance ${int_to_hex(item)} -> ${int_to_hex(nh)} ${distance}`)
            if (distance > limit) {
                continue
            }
            if (map_get(distance_map, nh) < distance) {
                //do nothing
            } else {
                process_hex(nh, distance)
                map_set(distance_map, nh, distance)
                queue.push(nh)
            }
        }
        i++
        if (i >= queue.length) {
            break
        }
    }
}

P.declare_battle_hexes = {
    _begin() {
        L.possible_hexes = []
        let jp_hexes = []
        for (let i = 0; i < pieces.length; i++) {
            let location = G.location[i]
            if (location > 0 && location < LAST_BOARD_HEX && pieces[i].faction === "jp") {
                set_add(jp_hexes, location)
            }
        }
        for (let i = 0; i < pieces.length; i++) {
            let location = G.location[i]
            if (pieces[i].faction === "ap" && set_has(jp_hexes, location) && !set_has(G.offensive.battle_hexes, location)) {
                set_add(L.possible_hexes, location)
            }
        }
    },
    prompt() {
        prompt(`${cards[G.offensive.active_cards[0]].name}. Declare battle hexes.`)
        for (let i = 0; i < L.possible_hexes.length; i++) {
            let location = L.possible_hexes[i]
            if (!set_has(G.offensive.battle_hexes, location)) {
                action_hex(location)
            }
        }
    },
    action_hex(hex) {
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

P.end_action = {
    prompt() {
        prompt(`End action.`)
        button("done")
    },
    done() {
        end()
    },
}

P.define_intelligence_condition = {
    _begin() {
        if (G.offensive.battle_hexes.length <= 0) {
            end()
        }
        let card = cards[G.offensive.active_cards[0]]
        L.card = card
        if (card.intelligence !== "surprise") {
            L.roll_allowed = true
        }
        if (G.hand[G.active].filter(c => c.intelligence && (c.type === "intercept" || c.type === "conteroffensive")).length > 0) {
            L.card_allowed = true
        }
        if (!L.roll_allowed && !L.card_allowed) {
            end()
        }
    },
    prompt() {
        prompt(`${L.card.name}. Change intelligence condition.`)
        button("roll")
        G.hand[G.active].filter(c => c.intelligence && (c.type === "intercept" || c.type === "conteroffensive"))
            .forEach(c => action_card(c))
    },
    card(c) {
        G.offensive.intelligence = INTERCEPT
        end()
    },
    roll() {
        let result = random(10)
        clear_undo()

        let treshhold = L.card.oc + 3
        log(`Intercept roll to ${result} vs ${treshhold}, offensive condition is ${result <= treshhold ? "intercept" : "surprise"}`)
        if (result <= treshhold) {
            G.offensive.intelligence = INTERCEPT
        }
        end()
    }
}

P.naval_air_battle = {
    prompt() {
        prompt(`Choose battle hex.`)
        G.offensive.battle_hexes.forEach(b => action_hex(b))
    },
    action_hex(c) {
        clear_undo()
        let result_a = random(10)
        let result_d = random(10)
        let winner = result_a > result_d ? G.offensive.attacker : 1 - G.offensive.attacker
        log(`Battle at ${c}, attacker rolled ${result_a}, defender rolled ${result_d}, ${winner} wins`)
        set_delete(G.offensive.battle_hexes, c)
        end()
    },
}

P.offensive_sequence = script(`
    set G.offensive.logistic cards[G.offensive.active_cards[0]].ops
    call choose_hq
    call activate_units
    eval {
        G.offensive.paths[G.active] = G.offensive.active_units[G.active].map(u=>null)
    }
    while (G.offensive.active_units[G.active].length > G.offensive.paths[G.active].filter(a => a != null).length) {
        call move_offensive_units
    }
    call declare_battle_hexes
    call commit_offensive
    set G.active 1-G.offensive.attacker
    call define_intelligence_condition
    if (G.offensive.intelligence != SURPRISE) {
        call choose_hq
        call activate_units
        while (G.offensive.active_units[G.active].length > G.offensive.paths[G.active].filter(a => a != null).length) {
            call move_offensive_units
        }
        call commit_offensive
    }
    set G.active G.offensive.attacker
    while (G.offensive.battle_hexes.length > 0) {
        call naval_air_battle
    }
    set G.active 1-G.offensive.attacker
    while (G.offensive.active_units[G.active].length > 0) {
       call move_offensive_units { type: POST_BATTLE_MOVE }
    }
    set G.active G.offensive.attacker
    while (G.offensive.active_units[G.active].length > 0) {
       call move_offensive_units { type: POST_BATTLE_MOVE }
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
    for (let i = 0; i < pieces.length; i++) {
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

    for (let c = 0; c < cards.length; ++c) {
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

function eliminate(unit) {
    G.location[unit] = ELIMINATED_BOX
    set_delete(G.reduced, unit)
}

function setup_scenario_1942() {
    log("#Japan Offensive")
    log("The Japan assault on Asia (December 1941) caught allies off guard")

    for (let i = 0; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.reinforcement !== 2) {
            continue
        }
        if (piece.faction === "ap") {
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
    G.location[SEAC_HQ] = hex_to_int(1805)
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
    setup_jp_unit(JP_SOUTH_HQ, 2212)
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
    setup_jp_unit(YAMAMOTO_HQ, 3407)
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
    setup_jp_unit(JP_SOUTH_SEAS_HQ, 4017)
    setup_jp_unit(find_piece("kamikaze"), 4017)
    setup_jp_unit(find_piece("aoba"), 4021)
    setup_jp_unit(jp_army("ss"), 4021)
    setup_jp_unit(jp_army("4sn"), 4715, true)
    setup_jp_unit(jp_air(24), 4715)
    setup_jp_unit(find_piece("tenyru"), 4715)

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

function jp_air(id) {
    return find_piece("air_jp_" + id)
}

function jp_army(id) {
    return find_piece("army_jp_" + id)
}

function setup_jp_unit(piece, hex_id, reduced = false) {
    let hex = hex_to_int(hex_id)
    if (map_data[hex].named) {
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
    G.future_offensive = [[-1, 0], [-1, 0]]
    G.discard = [[], []]
    G.amph_points = [0, 0]

    G.location = []
    G.reduced = []
    G.oos = []
    G.control = []
    for (let i = 1; i < LAST_BOARD_HEX; i++) {
        if (map_data[i].named && ["JMandates", "Korea", "Manchuria", "China", "Formosa", "Indochina", "Siam", "Caroline", "Marshall", "Japan"].includes(map_data[i].region)) {
            set_add(G.control, i)
        }
    }
    reset_offensive()
    G.location = []
    for (let i = 0; i < pieces.length; i++) {
        var piece = pieces[i]
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
    V.offensive = {
        active_units: G.offensive.active_units[0].concat(G.offensive.active_units[1]),
        paths: G.offensive.paths[0].concat(G.offensive.paths[1]),
        active_cards: G.offensive.active_cards,
        active_hq: G.offensive.active_hq,
        active_stack: G.offensive.active_stack,
        battle_hexes: G.offensive.battle_hexes
    }


    if (R !== JP) {
        V.hand[JP] = G.hand[JP].length
        V.future_offensive.push([G.future_offensive[JP][0], -1])
    } else {
        V.hand[JP] = G.hand[JP]
        V.future_offensive.push(G.future_offensive[JP])
    }
    if (R !== AP) {
        V.hand[AP] = G.hand[AP].length
        V.future_offensive.push([G.future_offensive[AP][0], -1])
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
        attacker: JP,
        active_cards: [],
        intelligence: SURPRISE,
        logistic: 0,
        active_hq: [],
        active_units: [[], []],
        strat_moved_units: [],
        paths: [[], []],
        active_stack: [],
        battle_hexes: [],
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