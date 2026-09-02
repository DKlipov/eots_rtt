let last = Date.now()
let count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

function check_supplied_hexes(faction) {
    check_supply()
    L.supply = {}
    mark_supply_eligable_ports(faction)
    mark_supplied_hexes(faction)
    if (G.burma_road < 2 && faction === AP) {
        mark_hexes_supplied_kunming()
    }
    L.supply = 0
}

function basic_check_supply() {
    L.supply = {}
    clear_supply_cache(CLEAN_ALL_MASK)
    G.burma_road = 0
    for_each_unit_on_map(mark_unit)
    place_virtual_units()
    check_infrastructure()
    var oos_units = [[], []]
    G.oos = []
    check_faction_supply_not_changed(AP, false, oos_units)
    check_faction_supply_not_changed(JP, true, oos_units)
    for (var i = 1; i < 10; i++) {//limit supply check counts
        const ap = check_faction_supply_not_changed(AP, true, oos_units)
        const jp = check_faction_supply_not_changed(JP, true, oos_units)
        if (ap && jp) {
            break
        }
    }
    G.oos = oos_units[0]
    if (G.turn > 1) {
        oos_units[1].forEach(h => set_add(G.oos, h))
    }
    if (G.sid === SOUTH_PACIFIC_SCENARIO && G.turn === 3) {
        var mask = G.supply_cache[TRUK] & JP_UNITS
        G.supply_cache[TRUK] ^= (mask)
    } else if (G.sid === BURMA_SCENARIO) {
        var mask = G.supply_cache[SINGAPORE] & JP_UNITS
        G.supply_cache[SINGAPORE] ^= (mask)
    }
    mark_supply_eligable_ports(AP)
    mark_supply_eligable_ports(JP)
    L.supply = 0
}

function fast_check_supply() {
    L.supply = {}
    clear_supply_cache(CLEAN_ALL_MASK)
    for_each_unit_on_map(mark_unit)
    place_virtual_units()
    check_infrastructure()
    for_each_unit_on_map((i, p) => set_zoi(i, p, [G.oos, G.oos]))
    indian_zoi_hack()
    if (G.sid === SOUTH_PACIFIC_SCENARIO && G.turn === 3) {
        var mask = G.supply_cache[TRUK] & JP_UNITS
        G.supply_cache[TRUK] ^= (mask)
    } else if (G.sid === BURMA_SCENARIO) {
        var mask = G.supply_cache[SINGAPORE] & JP_UNITS
        G.supply_cache[SINGAPORE] ^= (mask)
    }
    L.supply = 0
}

var check_supply = basic_check_supply
if (CLIENT_SIDE_SUPPLY) {
    check_supply = fast_check_supply
}

function indian_zoi_hack() {
    remove_zoi(hex_to_int(1304))
    if (!(G.supply_cache[hex_to_int(1005)] & AP_ZOI)) {
        remove_zoi(hex_to_int(1205))
    }
}

function remove_zoi(hex) {
    if (G.supply_cache[hex] & AP_ZOI) {
        G.supply_cache[hex] -= AP_ZOI
    }
    if (G.supply_cache[hex] & JP_ZOI_NTRL) {
        G.supply_cache[hex] -= JP_ZOI_NTRL
    }
}

function check_units() {
    clear_supply_cache(CLEAN_ALL_MASK)
    G.burma_road = 0
    for_each_unit_on_map(mark_unit)
    place_virtual_units()
    check_infrastructure()
}

function clear_supply_cache(mask) {
    for (var i = 1; i < LAST_BOARD_HEX; i++) {
        G.supply_cache[i] = G.supply_cache[i] & mask
    }
}

function mark_unit(i, piece) {
    const location = G.location[i]
    if (piece.class === "air") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_AIR_UNITS << piece.faction)
    } else if (piece.class === "hq") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_HQ_UNITS << piece.faction)
    } else if (piece.class === "naval") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_NAVAL_UNITS << piece.faction)
    } else if (piece.class === "ground") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_GROUND_UNITS << piece.faction)
    }
    if (piece.br) {
        for_each_hex_in_range(location, 2, h => G.supply_cache[h] |= JP_ZOI_DISABLED << piece.faction)
    }
}

function place_virtual_units() {
    GARRISONED_CITY.forEach(h => {
        if (is_space_controlled(h, JP) && (get_map_data(h).city === CHINESE_CITY || !set_has(G.garr_elim, h))) {
            G.supply_cache[h] = G.supply_cache[h] | JP_GROUND_UNITS
        }
    })
}

function check_infrastructure() {
    ROAD_EVENTS.filter(e => !is_event_active(e)).forEach(e => e.keys.forEach(h => G.supply_cache[h] |= TRANSPORT_ROUTE_DISABLED))
}

function check_hump() {
    if (is_event_active(events.HUMP)
        && ((G.supply_cache[JARHAT] & AP_SUPPLY_AIRFIELD) || (G.supply_cache[DACCA] & AP_SUPPLY_AIRFIELD))) {
        G.burma_road = Math.min(1, G.burma_road)
        return true
    }
    return false
}

function check_burma_road() {
    G.burma_road = 2
    if (G.sid === SOUTH_PACIFIC_SCENARIO) {
        return;
    }
    const faction = AP
    const location = KUNMING
    L.supply.queue = [location]
    L.supply.retracing = [location]
    var distance_map = [location, 0]
    var rangoon_achived = false
    for (var i = 0; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            var distance = get_ground_mp_cost(item, nh, j, faction)
            if (distance > 1 || map_has(distance_map, nh) || occupied_land || is_space_controlled(nh, JP)) {
                continue
            }
            map_set(distance_map, nh, distance)
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            if (nh === MADRAS) {
                G.burma_road = 0
                return
            } else if (nh === RANGOON) {
                rangoon_achived = true
                i++
            }
        }
    }
    if (!rangoon_achived || has_non_n_zoi(RANGOON, JP) || is_space_controlled(RANGOON, JP)) {
        check_hump()
        return;
    }
    L.supply.queue.push(RANGOON)
    L.supply.retracing.push(0)
    distance_map = [RANGOON, 0]
    for (i = L.supply.queue.length - 1; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        var MD = get_map_data(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (!(MD.edges_int & WATER << 5 * j) || map_has(distance_map, nh) || has_non_n_zoi(nh, JP)) {
                continue
            }
            map_set(distance_map, nh, 1)
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            if (nh === MADRAS || get_map_data(nh).supply_source & JOINT_SUPPLIED_HEX) {
                G.burma_road = 0
                return
            }
        }
    }
    check_hump()
}

function for_each_unit(apply) {
    for (let i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        var location = G.location[i]
        apply(i, piece, location)
    }
}

function for_each_unit_on_map(apply) {
    for (let i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        var location = G.location[i]
        if (location > LAST_BOARD_HEX) {
            continue
        }
        apply(i, piece, location)
    }
}

function set_zoi(i, piece, oos_units) {
    let location = G.location[i]
    var zoi_disabled = L && L.move_type === STRAT_MOVE && set_has(G.active_stack, i)
    var mask = 0
    if (piece.br && set_has(oos_units[piece.faction], i) && !zoi_disabled) {
        mask = (JP_ZOI_DISABLED << piece.faction)
    } else if (piece.br && !zoi_disabled) {
        mask = (JP_ZOI << piece.faction)
        if (piece.br < 6) {
            mask = mask | JP_ZOI_NTRL << 1 - piece.faction
        }
    }
    if (mask > 0) {
        for_each_hex_in_range(location, 2, h => G.supply_cache[h] = G.supply_cache[h] | mask)
    }
}

function check_hq_in_supply(hq, piece, supply) {
    const faction = piece.faction
    const location = G.location[hq]
    L.supply.retracing = [location]
    L.supply.queue = [location]
    var overland_set = []
    overland_set[location] = 3
    if (get_map_data(location).supply_source & supply) {
        return true
    }
    for (var i = 0; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
        const overland = overland_set[item] & 1
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const enemy_port_s = (MD.port && is_space_controlled(item, 1 - faction))
        const occupied_land_s = G.supply_cache[item] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[item] & JP_GAH_UNITS << faction)
        const oversea = overland_set[item] & 2
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            var reachable = false
            const enemy_port = enemy_port_s || (MD.port && is_space_controlled(item, 1 - faction))
            const occupied_land = occupied_land_s || G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (!(overland_set[nh] & 1) && (overland || (MD.port && !enemy_port)) && MD.edges_int & GROUND << 5 * j && !occupied_land) {
                reachable = true
                overland_set[nh] |= 1
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!(overland_set[nh] & 2) && (oversea || (MD.port && !enemy_port)) && MD.edges_int & WATER << 5 * j && !non_neutral_zoi) {
                reachable = true
                overland_set[nh] |= 2
            }
            if (reachable) {
                L.supply.queue.push(nh)
                L.supply.retracing.push(item)
                if (get_map_data(nh).supply_source & supply) {
                    return true
                }
            }
        }
    }
    return false
}

function mark_supply_ports_overland(hq, piece) {
    if (!hq.length) {
        return
    }
    const faction = pieces[hq[0]].faction
    L.supply.queue = []
    L.supply.retracing = []
    var distance_map = []
    hq.forEach(u => {
        var location = G.location[u]
        L.supply.queue.push(location)
        L.supply.retracing.push(location)
        G.supply_cache[location] = G.supply_cache[location] | JP_SUPPLY_PORT << faction
        map_set(distance_map, location, 0)
    })
    for (var i = 0; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let base_distance = map_get(distance_map, item)
        let nh_list = get_near_hexes(item)
        if (faction === JP && get_map_data(item).region === "IChina" || !nh_list) {
            continue
        }
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            var distance = base_distance + get_ground_mp_cost(item, nh, j, faction)
            if (distance > SUPPLY_PORT_RANGE || distance >= map_get(distance_map, nh, 100) || occupied_land) {
                continue
            }
            map_set(distance_map, nh, distance)

            if (distance < SUPPLY_PORT_RANGE) {
                L.supply.queue.push(nh)
                L.supply.retracing.push(item)
            }
            if (get_map_data(nh).port && is_space_controlled(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_PORT << faction
            }
            if (get_map_data(nh).airfield && is_space_controlled(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_AIRFIELD << faction
            }
        }
    }
}

function mark_supply_ports_oversea(hq) {
    if (!hq.length) {
        return
    }
    const faction = pieces[hq[0]].faction
    L.supply.queue = []
    L.supply.retracing = []
    var distance_map = []
    hq.forEach(u => {
        var location = G.location[u]
        L.supply.queue.push(location)
        L.supply.retracing.push(location)
        G.supply_cache[location] = G.supply_cache[location] | JP_SUPPLY_PORT << faction
        distance_map[location] = 1
    })
    for (var i = 0; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        if (faction === JP && get_map_data(item).region === "IChina" || !nh_list) {
            continue
        }
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!distance_map[nh] && get_map_data(item).edges_int & WATER << 5 * j && !non_neutral_zoi) {
                distance_map[nh] = 1
                L.supply.queue.push(nh)
                L.supply.retracing.push(item)
                if (get_map_data(nh).port && is_space_controlled(nh, faction)) {
                    G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_PORT << faction
                }
                if (get_map_data(nh).airfield && is_space_controlled(nh, faction)) {
                    G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_AIRFIELD << faction
                }
            }
        }
    }
}

function supply_source_in_range(location, faction) {
    L.supply.port_queue = [location]
    L.supply.port_retracing = [location]
    if (G.supply_cache[location] & JP_SUPPLY_PORT << faction) {
        return true
    }
    const distance_map = []
    map_set(distance_map, location, 0)

    for (var i = 0; i < L.supply.port_queue.length; i++) {
        const item = L.supply.port_queue[i]
        const base_distance = map_get(distance_map, item)
        const nh_list = get_near_hexes(item)
        for (var j = 0; j < nh_list.length; j++) {
            const nh = nh_list[j]
            if (nh <= 0) {
                continue
            }

            var distance = base_distance + get_ground_mp_cost(nh, item, (j + 3) % 6, faction)
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (distance > SUPPLY_PORT_RANGE || occupied_land || distance >= map_get(distance_map, nh, [100])) {
                continue
            }
            L.supply.port_queue.push(nh)
            L.supply.port_retracing.push(item)
            if (G.supply_cache[nh] & JP_SUPPLY_PORT << faction) {
                return true
            }
            map_set(distance_map, nh, distance)


        }
    }
    return false
}

function mark_hexes_supplied_kunming() {
    var i = 0
    const location = KUNMING
    L.supply.queue = []
    L.supply.retracing = []
    var overland_set = [KUNMING, 0]
    const supply_type = JOINT_SUPPLIED_HEX
    G.supply_cache[location] = G.supply_cache[location] | supply_type
    L.supply.queue.push(location)
    L.supply.retracing.push(location)
    for (; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const distance_base = map_get(overland_set, item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const distance = distance_base + get_ground_mp_cost(nh, item, (j + 3) % 6, AP)
            if (distance > SUPPLY_PORT_RANGE || map_get(overland_set, nh, 100) <= distance) {
                continue
            }
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            map_set(overland_set, nh, distance)
            G.supply_cache[nh] = G.supply_cache[nh] | supply_type
        }
    }
}

function unit_or_airfield(location, faction) {
    return is_faction_units(location, faction) || get_map_data(location).airfield
}

function mark_hexes_supplied_from(hq_list, is_check_supply_space, pre_cache) {
    if (!hq_list.length) {
        return;
    }
    var i = 0
    const faction = pieces[hq_list[0]].faction
    var second_ports = []
    var overland_ports = []
    const oversea_set = pre_cache ? pre_cache.oversea_set : []
    const overland_set = pre_cache ? pre_cache.overland_set : []
    L.supply.oversea_set = oversea_set
    L.supply.overland_set = overland_set
    overland_set[LAST_BOARD_HEX] = 100
    oversea_set[LAST_BOARD_HEX] = 100
    L.supply.queue = []
    L.supply.retracing = []
    const supply_type = pieces[hq_list[0]].supply
    const extended_supply_type = supply_type | (faction ? JOINT_SUPPLIED_HEX : 0)
    hq_list.forEach(hq => {
        var piece = pieces[hq]
        var location = G.location[hq]
        G.supply_cache[location] = G.supply_cache[location] | supply_type
        oversea_set[location] = piece.cr
        overland_set[location] = piece.cr
        L.supply.queue.push(location)
        L.supply.retracing.push(location)
    })
    for (; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
        const distance = overland_set[item] - 1
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = (G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction)) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (!(MD.edges_int & GROUND << 5 * j) || occupied_land || overland_set[nh] >= distance || distance < 0) {
                continue
            }
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            const friendly_port = get_map_data(nh).port && is_space_controlled(nh, faction)
            if (friendly_port && !(oversea_set[nh] >= distance)) {
                oversea_set[nh] = (distance)
                second_ports.push(nh)
            }
            overland_set[nh] = (distance)

            if (!(G.supply_cache[nh] & extended_supply_type) && is_check_supply_space(nh, faction) && supply_source_in_range(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
    hq_list.forEach(hq => {
        var piece = pieces[hq]
        var location = G.location[hq]
        L.supply.queue.push(location)
        L.supply.retracing.push(location)
    })

    for (; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        const MD = get_map_data(item)
        let nh_list = MD.nh
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const distance = oversea_set[item] - 1
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
        if (non_neutral_zoi_s || distance < 0) {
            continue;
        }
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if ((oversea_set[nh]) >= distance || !(MD.edges_int & WATER << 5 * j) ||
                (G.supply_cache[nh] & JP_ZOI << (1 - faction) & ((G.supply_cache[nh] ^ JP_ZOI_NTRL << (1 - faction)) >> 2)
                )) {
                continue
            }
            var md1 = get_map_data(nh)
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            const friendly_port = (md1.port && (is_space_controlled(nh, faction)))
            if (friendly_port && !md1.island && !(overland_set[nh] >= distance)) {
                overland_set[nh] = distance
                overland_ports.push(nh)
            }
            oversea_set[nh] = (distance)
            if (md1.terrain > 0) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
    overland_ports.forEach(k => L.supply.queue.push(k))
    overland_ports.forEach(k => L.supply.retracing.push(0))

    for (; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
        const distance = overland_set[item] - 1
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = (G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction)) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (!(MD.edges_int & GROUND << 5 * j) || occupied_land || overland_set[nh] >= distance || distance < 0) {
                continue
            }
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            overland_set[nh] = distance
            if (!(G.supply_cache[nh] & extended_supply_type) && is_check_supply_space(nh, faction) && supply_source_in_range(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
    second_ports.forEach(h => L.supply.queue.push(h))
    second_ports.forEach(h => L.supply.retracing.push(0))
    for (; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const distance = oversea_set[item] - 1
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!(MD.edges_int & WATER << 5 * j) || non_neutral_zoi || oversea_set[nh] >= distance || distance < 0) {
                continue
            }
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            oversea_set[nh] = (distance)
            if (get_map_data(nh).terrain > 0) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
}

function check_piece_supply(location, i, piece) {
    if (piece.class === "hq") {
        return true
    } else if (G.offensive.active_units[piece.faction] && set_has(G.offensive.active_units[piece.faction], i)) {
        return true
    }
    return G.supply_cache[location] & piece.supply
}

function mark_supplied_hexes(faction) {
    HQ_LIST.forEach(hq => {
        var piece = pieces[hq]
        if (G.location[hq] >= LAST_BOARD_HEX) {
            return
        }
        if (piece.faction === faction && !set_has(G.oos, hq)) {
            mark_hexes_supplied_from([hq], unit_or_airfield)
        }
    })
}


function mark_supply_eligable_ports(faction) {
    var hq = HQ_LIST.filter(hq => {
        var piece = pieces[hq]
        return (piece.faction === faction && G.location[hq] < LAST_BOARD_HEX)
    })
    mark_supply_ports_oversea(hq)
    mark_supply_ports_overland(hq)
}

function check_faction_supply_not_changed(faction, both_sides_zoi, oos_units) {
    clear_supply_cache(NON_SUPPLY_MASK)
    var burma = G.burma_road
    if (G.burma_road < 2) {
        G.supply_cache[KUNMING] |= AP_SUPPLY_PORT
        G.supply_cache[CHINA_BOX] = JOINT_SUPPLIED_HEX
    } else {
        G.supply_cache[CHINA_BOX] = 0
    }
    if (G.turn === 1 && faction === AP) {
        for_each_unit_on_map((u, piece) => {
            if (piece.faction === AP) {
                set_add(oos_units[AP], u)
            }
        })
        return true
    }
    for_each_unit_on_map((i, p) => both_sides_zoi || p.faction === faction ? set_zoi(i, p, oos_units) : null)
    indian_zoi_hack()
    mark_supply_eligable_ports(faction)
    var size = oos_units[faction].filter(u => pieces[u].zoi_generator).length
    oos_units[faction] = []
    var hqs = HQ_LIST.filter(hq => {
        var piece = pieces[hq]
        if (G.location[hq] >= LAST_BOARD_HEX) {
            return false
        }
        if (piece.faction === faction && check_hq_in_supply(hq, piece, piece.faction === AP ? JOINT_SUPPLIED_HEX : JP_SUPPLIED_HEX)) {
            return true
        } else if (piece.faction === faction) {
            set_add(oos_units[faction], hq)
        }
        return false
    })
    if (faction === JP) {
        mark_hexes_supplied_from(hqs, unit_or_airfield)
    } else {
        mark_hexes_supplied_from(hqs.filter(hq => pieces[hq].service === "joint"), unit_or_airfield)
        mark_hexes_supplied_from(hqs.filter(hq => pieces[hq].service === "us"), unit_or_airfield)
        mark_hexes_supplied_from(hqs.filter(hq => pieces[hq].service === "br"), unit_or_airfield)
    }

    if (G.burma_road < 2 && faction === AP) {
        mark_hexes_supplied_kunming()
    }
    var tokyo_express = G.events[events.TOKYO_EXPRESS.id]
    if (tokyo_express > 0) {
        G.supply_cache[tokyo_express] |= JP_SUPPLIED_HEX
    }
    for_each_unit((i, p, location) => {
        if ((location <= LAST_BOARD_HEX || location === CHINA_BOX) &&
            p.class !== "hq" && p.faction === faction && !check_piece_supply(G.location[i], i, p)
        ) {
            set_add(oos_units[faction], i)
        }
    })
    if (faction === AP && G.burma_road < 2) {
        check_burma_road()
    }
    return oos_units[faction].filter(u => pieces[u].zoi_generator).length === size && burma === G.burma_road
}

function get_ground_mp_cost(from, to, direction, faction) {
    if (!(get_map_data(from).edges_int & GROUND << 5 * direction)) {
        return 100;
    }
    if ((get_map_data(from).edges_int & ROAD << (5 * direction))
        && !(G.supply_cache[to] & TRANSPORT_ROUTE_DISABLED)
        && !(G.supply_cache[from] & TRANSPORT_ROUTE_DISABLED)
        && ((G.supply_cache[to] & (JP_UNITS << faction)) || !(G.supply_cache[to] & (JP_UNITS << 1 - faction)))
        && ((G.supply_cache[from] & (JP_UNITS << faction)) || !(G.supply_cache[from] & (JP_UNITS << 1 - faction)))
    ) {
        return 1;
    } else {
        return ((get_map_data(to).terrain >> 1) + 1) * 2
    }
}

function get_ground_move_cost(from, to, faction) {
    var direction = get_direction(from, to)
    if (!(get_map_data(from).edges_int & GROUND << 5 * direction)) {
        return 100;
    }
    if ((get_map_data(from).edges_int & ROAD << (5 * direction))
        && !(G.supply_cache[to] & (TRANSPORT_ROUTE_DISABLED | (JP_GA_UNITS << 1 - faction)))
        && !(G.supply_cache[from] & TRANSPORT_ROUTE_DISABLED)
    ) {
        return 1;
    } else {
        return ((get_map_data(to).terrain >> 1) + 1) * 2
    }
}

function is_controllable_hex(hex) {
    return G.supply_cache[hex] & HEX_CONTROLLABLE
}

function is_space_controlled(hex, faction) {
    if (G.control) {
        var mask = ~(JP_CONTROLLED | HEX_CONTROLLABLE)
        clear_supply_cache(mask)
        G.control.forEach(h => G.supply_cache[h] |= JP_CONTROLLED)
        for (var i = 0; i < LAST_BOARD_HEX; i++) {
            if (create_controllable_hex(i)) {
                G.supply_cache[i] |= HEX_CONTROLLABLE
            }
        }
        G.control = null
    }
    return (!(G.supply_cache[hex] & JP_CONTROLLED) == faction) && (!G.non_control || !set_has(G.non_control, hex))
}


function is_faction_units(hex, faction) {
    return G.supply_cache[hex] & JP_UNITS << faction
}

function is_faction_ground_units(hex, faction) {
    return G.supply_cache[hex] & JP_GROUND_UNITS << faction
}

function is_faction_naval_units(hex, faction) {
    return G.supply_cache[hex] & JP_NAVAL_UNITS << faction
}

function has_non_n_zoi(hex, faction) {
    return (G.supply_cache[hex] & ((JP_ZOI << faction) | (JP_ZOI_NTRL << faction))) === (JP_ZOI << faction)
}

function has_zoi(hex, faction) {
    return (G.supply_cache[hex] & JP_ZOI << faction)
}

function check_unit_supply(location, i, piece) {
    if (piece.class === "hq") {
        return true
    } else if (set_has(G.offensive.active_units[piece.faction], i)) {
        return true
    }
    return G.supply_cache[location] & piece.supply
}


function check_japan_resource_trace() {
    check_supply()
    const faction = JP
    let queue = []
    const overland_set = []
    const oversea_set = []
    events.JAPAN_TRACE_RESOURCES.keys.forEach(hh => {
        var h = hex_to_int(hh)
        set_add(queue, h)
        set_add(overland_set, h)
        set_add(oversea_set, h)
    })
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
        const overland = set_has(overland_set, item)
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const enemy_port_s = (MD.port && is_space_controlled(item, 1 - faction))
        const occupied_land_s = G.supply_cache[item] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[item] & JP_GAH_UNITS << faction)
        const oversea = set_has(oversea_set, item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            var reachable = false
            const enemy_port = enemy_port_s || (MD.port && is_space_controlled(nh, 1 - faction))
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
                if (get_map_data(nh).resource && is_space_controlled(nh, JP)) {
                    return true
                }
                queue.push(nh)
            }
        }
    }
    return false
}

function mark_activation_zone(hq) {
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
        const MD = get_map_data(item)
        if (faction === JP && MD.region === "IChina") {
            continue
        }
        const distance = map_get(distance_map, item) + 1
        const non_neutral_zoi = has_non_n_zoi(item, 1 - faction)
        const occupied_land = solely_occupied_land(item, 1 - faction)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (map_get(distance_map, nh, 100) > distance
                && (
                    (MD.edges_int & UNPLAYABLE_LAND << 5 * j && !occupied_land && !solely_occupied_land(nh, 1 - faction)) ||
                    (MD.edges_int & UNPLAYABLE_WATER << 5 * j && !non_neutral_zoi && !has_non_n_zoi(nh, 1 - faction))
                )) {
                map_set(distance_map, nh, distance)
                G.supply_cache[nh] |= HEX_TEMP_FLAG3
                if (distance < range) {
                    queue.push(nh)
                }
            }
        }
    }
}