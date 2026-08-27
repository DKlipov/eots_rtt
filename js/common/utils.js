/** import common/library.js*/

function hex_to_int(i) {
    return (Math.floor(i / 100) - 10) * 29 + i % 100
}


function int_to_hex(i) {
    return (Math.floor(i / 29) * 100) + 1000 + i % 29
}


function with_state_as_G(state, apply) {
    var actual_g = G
    G = state
    G = state
    // G.active = actual_g.active
    var log = G.log
    G.log = []
    var result = apply()
    G.log = log
    G = actual_g
    return result
}

function get_direction(from, to) {
    var x = ((from) % 29)
    var d = ((from - x) / 29) % 2
    var r = HEX_DIRECTION[from - to + 30 + d * 10]
    return r ? r : 0
}

function get_edge_hexes(hex) {
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
        while ((current) % 29 < 28 && i < limit) {
            current += 1
            lambda(current)
            i++
        }
    }
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

function in_range_on_map(first_hex, range, hexes, faction = AP) {
    var result = []
    for (var i = 0; i < hexes.length; i++) {
        var hex = hexes[i]
        if (get_map_data(hex).sw) {
            return slow_in_range(first_hex, range, hexes, faction)
        }
        if (get_distance(first_hex, hex) > range) {
            //nothing
        } else if (get_map_data(hex).sw || get_map_data(first_hex).sw) {
            return slow_in_range(first_hex, range, hexes, faction)
        } else {
            set_add(result, hex)
        }
    }
    return result
}

function slow_in_range(first_hex, range, hexes, faction) {
    var queue = [first_hex]
    var distance_map = []
    var result = []
    distance_map[first_hex] = 1
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        var distance = distance_map[item] + 1
        var MD = get_map_data(item)
        let nh_list = get_near_hexes(item)
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (distance > range + 1 || (distance_map[nh] <= distance) || ((MD.edges_int >> 5 * j) % 32) === 0) {
                continue
            }
            distance_map[nh] = distance
            queue.push(nh)
        }
    }
    hexes.forEach(h => {
        if (distance_map[h] && (faction !== JP || get_map_data(h).region !== "IChina")) {
            set_add(result, h)
        }
    })
    return result
}

function offensive_card_header() {
    return `${G.offensive.type === EC ? "EC" : "OC"}: ${cards[G.offensive.active_cards[0]].ops} Ops.`
}

function get_jp_resources() {
    return RESOURCE_HEX.filter(h => is_space_controlled(h, JP) && get_map_data(h).resource).length
}

function get_china_offensive_modifiers() {
    var result = {
        log: [],
        burma_road: 0,
        air_support: 0,
        divisions: G.china_divisions
    }
    result.burma_road = (2 - G.burma_road) * 4
    result.log.push(`Japanese divisions ${G.china_divisions}.`)
    result.log.push(`+${result.burma_road} (Burma road).`)

    if (G.sid === SOUTH_PACIFIC_SCENARIO) {
        result.air_support++
        result.log.push(`+1 ${piece_get_log_str(ap_air("14_lrb"))}.`)
    } else {
        for_each_unit((u, piece, location) => {
            if (location === CHINA_BOX && (piece.type !== "lrb" || u === LRB_14) && !set_has(G.oos, u)) {
                result.log.push(`+1 ${piece_get_log_str(u)}.`)
                result.air_support++
            }
        })
    }
    return result
}

/* log formatting helper functions*/

// below are all functions for pretty formatting (tooltips, hover to piece on click etc) in the log

function hex_get_log_str(h) {
    return `H${h}`
}

function card_get_log_str(c) {
    return `C${c}`
}

function piece_get_log_str(p) {
    return `P${p}`
}

function dice_get_log_str(p, modifiers, faction = G.active) {
    return `${faction === AP ? "B" : "R"}${p} ${modifiers > 0 ? "+" : ""}${modifiers ? modifiers : ""}`
}

function side_get_log_str(side) {
    return `${side === AP ? "AP" : "JP"}`
}

function list_get_log_str(header, items) {
    return `^${header}|${items.join(", ")}^`
}

function units_str(units) {
    return list_get_log_str(`${piece_get_log_str(units[0])} with ${units.length - 1} units`, units.map(u => piece_get_log_str(u)))
}

function scenario_data() {
    return SCENARIO_DATA[G.sid]
}

function solely_occupied_land(hex, faction) {
    return G.supply_cache[hex] & JP_GAH_UNITS << (faction) && !(G.supply_cache[hex] & JP_GAH_UNITS << (1 - faction))
}