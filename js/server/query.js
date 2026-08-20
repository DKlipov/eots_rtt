
function on_query(q, params, b) {
    if (q.name === "battle_info") {
        return battle_info_query(q.index)
    }
    if (q.name === "check_unit_supply") {
        return supply_query(q.u)
    } else if (q.startsWith("event_cards")) {
        return draw_list()
    } else if (q === "vp_check") {
        return vp_query()
    } else if (q === "pw_check") {
        return pw_query()
    }
}

function vp_query() {
    return get_victory()
}

function supply_query(unit) {
    L = {supply: {}}

    var result = {unit, path: {}}
    var piece = pieces[unit]
    var location = G.location[unit]
    result.oos = set_has(G.oos, unit)
    if (unit === CHINA_BOX) {
        piece = pieces[ap_army("5_cn")]
        location = KUNMING
        result.oos = G.burma_road === 2
        result.hq = -1
    }
    clear_supply_cache(CLEAN_ALL_MASK)
    for_each_unit_on_map((i, p) => (!result.oos || p.faction === piece.faction) ? mark_unit(i, p) : null)
    place_virtual_units()
    check_infrastructure()
    for_each_unit_on_map((i, p) => (!result.oos || p.faction === piece.faction) ? set_zoi(i, p, [G.oos, G.oos]) : null)
    indian_zoi_hack()
    mark_supply_eligable_ports(piece.faction)
    L.supply_ports = L.supply
    L.supply = {}
    if (unit === CHINA_BOX) {
        trace_kunming(result)
        return result
    }
    if (piece.class === "hq") {
        result.hq = unit
    }
    HQ_LIST.forEach(hq => {
        var hq_piece = pieces[hq]
        if (result.hq || G.location[hq] >= LAST_BOARD_HEX || !(hq_piece.supply & piece.supply) || get_distance(location, G.location[hq]) > hq_piece.cr
            || set_has(G.oos, hq) || piece.faction !== hq_piece.faction) {
            return
        }
        mark_hexes_supplied_from([hq], l => l === location)
        if (G.supply_cache[location] & piece.supply) {
            result.hq = hq
            L.supply.queue = L.supply.queue.slice(0, L.supply.queue.indexOf(location) + 1)
            result.path.to_hq = retrace_supply_path(location)
            if (L.supply.port_queue) {
                L.supply.queue = L.supply.port_queue
                L.supply.retracing = L.supply.port_retracing
                result.path.to_port = retrace_supply_path(L.supply.queue[L.supply.queue.length - 1])
                result.supply_port = result.path.to_port[0]
                L.supply.queue = L.supply_ports.queue
                L.supply.retracing = L.supply_ports.retracing
                result.path.from_port = retrace_supply_path(result.supply_port)
            }
        }
    })
    L.supply = {}
    if (result.hq) {
        check_hq_in_supply(result.hq, pieces[result.hq], piece.faction === AP ? JOINT_SUPPLIED_HEX : JP_SUPPLIED_HEX)
        result.path.to_source = retrace_supply_path(L.supply.queue[L.supply.queue.length - 1])
    } else if (piece.faction === AP && (G.burma_road < 2 || result.oos)) {
        mark_hexes_supplied_kunming()
        if (G.supply_cache[location] & piece.supply) {
            result.path.to_hq = retrace_supply_path(location)
            trace_kunming(result)
        }
    }
    return result
}

function trace_kunming(result) {
    if (G.burma_road === 0 || result.oos) {
        if (result.oos) {
            G.control = []//todo: fix trace
        }
        check_burma_road()
        result.path.to_source = retrace_supply_path(L.supply.queue[L.supply.queue.length - 1])
    } else {
        var airfields = [DACCA, JARHAT].filter(h => G.supply_cache[h] & AP_SUPPLY_AIRFIELD)
        if (airfields.length) {
            L.supply.queue = L.supply_ports.queue
            L.supply.retracing = L.supply_ports.retracing
            result.path.from_port = retrace_supply_path(airfields[0])
            result.path.to_port = [KUNMING, airfields[0]]
        }
    }
}

function retrace_supply_path(location) {
    var queue_i = L.supply.queue.length - 1
    while (L.supply.queue[queue_i] !== location && queue_i > 0 || L.supply.retracing[queue_i] === 0) {
        queue_i -= 1
    }
    var result = [L.supply.queue[queue_i]]
    var parent = L.supply.retracing[queue_i]
    while (queue_i > 0) {
        if (L.supply.queue[queue_i] === parent && L.supply.retracing[queue_i] !== 0) {
            result.push(parent)
            parent = L.supply.retracing[queue_i]
        }
        if (L.supply.retracing[queue_i] === L.supply.queue[queue_i] && parent === L.supply.queue[queue_i]) {
            return result
        }
        queue_i -= 1
    }
    result.push(L.supply.queue[0])
    return result
}

//could corrupt G, run only in safe context
function battle_info_query(battle) {
    if(!set_has(G.offensive.battle,battle)){
        create_battle_hex(battle)
    }
    G.log = []
    var result = {
        naval_cf: [],
        naval_distant_hits: [],
        naval_rm: [],
        naval_log: [],
        ground_cf: [],
        ground_rm: [],
        ground_log: [],
        battle_hex: G.offensive.battle_names[battle],
        battle_name: battle,
    }
    var battle_hex = G.offensive.battle_names[battle]
    G.offensive.battle = {battle_hex}
    prepare_battle()
    result.air_naval = G.offensive.battle.air_naval
    G.log = []
    prepare_attack(JP)
    get_battle_modifiers(JP)
    result.naval_cf = G.offensive.battle.strength
    result.naval_rm[JP] = G.offensive.battle.roll_modifiers
    result.naval_distant_hits[JP] = G.offensive.battle.distant_hits
    result.naval_log[JP] = G.log
    G.log = []
    prepare_attack(AP)
    get_battle_modifiers(AP)
    result.naval_rm[AP] = G.offensive.battle.roll_modifiers
    result.naval_distant_hits[AP] = G.offensive.battle.distant_hits
    result.naval_log[AP] = G.log
    G.log = []
    prepare_ground_battle()
    result.ground = G.offensive.battle.ground
    G.log = []
    prepare_attack(JP)
    get_battle_modifiers(JP)
    result.ground_cf = G.offensive.battle.strength
    result.ground_rm[JP] = G.offensive.battle.roll_modifiers
    result.ground_log[JP] = G.log
    G.log = []
    prepare_attack(AP)
    get_battle_modifiers(AP)
    result.ground_rm[AP] = G.offensive.battle.roll_modifiers
    result.ground_log[AP] = G.log
    return result
}

function draw_list() {
    var hand = [G.draw[JP].concat(G.hand[JP]), G.draw[AP].concat(G.hand[AP])]
    if (G.future_offensive[AP] > 0) {
        hand[AP].push(G.future_offensive[AP])
    }
    if (G.future_offensive[JP] > 0) {
        hand[JP].push(G.future_offensive[JP])
    }
    hand[AP].sort()
    hand[JP].sort()
    return {hand}
}