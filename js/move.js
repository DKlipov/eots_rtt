function update_move_hex() {
    if (G.active_stack.length === 0) {
        L.allowed_hexes = []
        return
    }

    L.move_data = get_move_data()

    if (G.offensive.stage === POST_BATTLE_MOVE && L.move_type === BARGES_MOVE) {
        return compute_barges_pbm()
    } else if (L.move_data.is_air_present) {
        compute_air_move_hexes()
    } else if (L.move_data.move_type & STRAT_MOVE) {
        compute_ground_naval_strat_move()
    } else {
        compute_ground_naval_move_hexes()
    }
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
        sm_possible: true,
    }
    var asp_move = true
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
        if (piece.ebr && (!piece.parenthetical || G.offensive.stage === POST_BATTLE_STAGE && extended_pbm_possible() || L.move_type === STRAT_MOVE)) {
            result.extended_battle_range = piece.ebr
        }
        if (piece.ebr && piece.parenthetical && L.move_type === AIR_EXTENDED_MOVE) {
            result.extended_battle_range = piece.ebr
            result.move_type |= AIR_EXTENDED_MOVE
        }
        if (piece.class === "naval" && (!piece.organic || !G.offensive.organic.includes(u))) {
            organic_only_ships = false
        }
        if (piece.class === "ground" && !piece.strat_move) {
            result.sm_possible = false
            asp_move = false
        } else if (piece.class === "ground" && !piece.asp) {
            asp_move = false
        } else if (piece.class === "ground" && !G.offensive.organic.includes(u)) {
            result.asp_points += set_has(G.reduced, u) ? piece.aspr : piece.asp
        }
    })
    result.location = G.location[G.active_stack[0]]
    if (result.sm_possible && !result.is_air_present && get_map_data(result.location).coastal) {
        result.move_type |= NAVAL_MOVE
    }
    result.naval_move_distance = G.offensive.naval_move_distance
    result.air_move_legs = cards[G.offensive.active_cards[0]].ops
    if (L.move_type & STRAT_MOVE) {
        result.air_move_legs = cards[G.offensive.active_cards[0]].ops * 2
    }
    if (L.move_type & STRAT_MOVE && get_map_data(result.location).port) {
        result.naval_move_distance = G.offensive.naval_move_distance * 2
    }
    result.ground_move_distance = G.offensive.ground_move_distance
    if (result.extended_battle_range < result.battle_range) {
        result.extended_battle_range = result.battle_range
    }


    result.is_new_battle_allowed = (G.active === G.offensive.attacker
        && (G.offensive.type === EC || G.offensive.battle_hexes.length === 0)
        && G.offensive.stage !== POST_BATTLE_STAGE) && L.move_type !== STRAT_MOVE
    var asp_total = get_asp_limit(G.active)
    if (G.offensive.stage === REACTION_STAGE) {
        asp_total = Math.min(asp_total, 1 - G.offensive.r_asp)
    }
    if (result.sm_possible && L.move_type & STRAT_MOVE) {
        result.move_type |= STRAT_MOVE
    }
    if (L.move_type & AVOID_ZOI) {
        result.move_type |= AVOID_ZOI
    }
    if (G.offensive.counter_offensive_card === MATADOR) {
        result.asp_points = 0
    }
    if (result.is_ground_present && asp_move && result.asp_points <= asp_total) {
        result.move_type |= AMPH_MOVE
        if (organic_only_ships) {
            result.move_type |= ORGANIC_ONLY
        }
    }
    if (L.move_type & BARGES_MOVE) {
        result.naval_move_distance = 1
        result.move_type |= AMPH_MOVE
        result.move_type |= BARGES_MOVE
        result.asp_points = 0
    }
    if (result.is_ground_present && !result.is_naval_present && !(L.move_type & BARGES_MOVE) && G.offensive.stage !== POST_BATTLE_STAGE) {
        result.move_type |= GROUND_MOVE
    }
    return result
}

function extended_pbm_possible() {
    var u = G.active_stack[0]
    return !map_has(G.offensive.committed, u) && !set_has(G.offensive.all_bh, G.location[u])
}

function get_asp_limit(faction) {
    var asp_lim = G.asp[faction][0]
    if (faction === JP && G.inter_service[0]) {
        asp_lim = Math.ceil(asp_lim / 2)
    }
    return Math.max(asp_lim - G.asp[faction][1], 0)
}

function compute_barges_pbm() {
    var path = []
    var retreat_target = 0
    map_for_each(G.offensive.paths, (u, p) => {
        if (p[0] & BARGES_MOVE) {
            path = p
            retreat_target = path[path.length - 2]
        }
    })
    path.push(retreat_target)
    if (L.move_data.is_naval_present && get_map_data(retreat_target).port || !L.move_data.is_naval_present) {
        L.allowed_hexes = [retreat_target, path]
    } else {
        L.allowed_hexes = []
    }
}

function compute_air_move_hexes() {
    let location = L.move_data.location
    L.allowed_hexes = []
    let move_data = L.move_data
    var move_type = AIR_MOVE
    if (move_data.move_type & STRAT_MOVE) {
        move_type |= STRAT_MOVE
    }
    if (move_data.move_type & AIR_EXTENDED_MOVE) {
        move_type |= AIR_EXTENDED_MOVE
    }
    if (L.move_type === STRAT_MOVE) {
        check_supply()
    }
    var strat_flag = move_data.move_type & STRAT_MOVE
    if ((L.move_type === STRAT_MOVE) && has_non_n_zoi(location, 1 - R)) {
        return []
    }
    var avoid_zoi_flag = L.move_type === AVOID_ZOI
    if ((L.move_type === AVOID_ZOI) && has_zoi(location, 1 - R)) {
        return []
    }
    const distance_map = [move_data.location, [0, 1, move_data.location]]
    let queue = [move_data.location]
    let fields_queue = []
    var i = 0
    var bh = G.offensive.battle_hexes.slice()
    if (set_has(G.offensive.battle_hexes, location) && G.offensive.stage === REACTION_STAGE) {
        bh = [location]
    }
    while (true) {
        if (i >= queue.length) {
            break
        }
        let item = queue[i]
        var MD = get_map_data(item)
        let base_path = map_get(distance_map, item)
        var china_result = process_china_box_move(item, base_path, move_type)
        let nh_list = get_near_hexes(item)
        var distance = base_path[0] + 1
        if (item === CHINA_BOX) {
            nh_list = china_result
            distance = L.move_data.extended_battle_range
        }

        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0 || nh === HARBIN || nh === MUKDEN) {
                continue
            }
            var cached = map_get(distance_map, nh, [9])[0]
            if (strat_flag && has_non_n_zoi(nh, 1 - R)
                || avoid_zoi_flag && has_zoi(nh, 1 - R)
                || distance % 10 > L.move_data.extended_battle_range
                || (distance >= cached && distance % 10 >= cached % 10)
                || G.offensive.stage === REACTION_STAGE && set_has(G.offensive.battle_hexes, nh)
                || ((MD.edges_int >> 5 * j) % 32) <= 0) {
                continue
            }
            if (distance % 10 < L.move_data.extended_battle_range) {
                queue.push(nh)
            }
            var path_array = base_path.slice()
            path_array.push(nh)
            path_array[0] = distance
            map_set(distance_map, nh, path_array)
            if (get_map_data(nh).airfield && is_space_controlled(nh, G.active) && (nh !== AIR_FERRY || !is_faction_units(AIR_FERRY, JP))) {
                fields_queue.push(nh)
                if (nh !== AIR_FERRY && (!set_has(G.offensive.landing_hexes, nh) && !set_has(G.offensive.battle_hexes, nh) || G.offensive.stage === POST_BATTLE_STAGE)
                    && (target_in_battle_range(move_data.extended_battle_range, nh, bh) || G.offensive.stage !== REACTION_STAGE)) {
                    path_array = path_array.slice()
                    path_array[0] = move_type
                    map_set(L.allowed_hexes, nh, path_array)
                }
            }
        }
        i++
        if (i >= queue.length) {
            fields_queue.forEach(h => {
                var f = map_get(distance_map, h)
                if (f[1] < move_data.air_move_legs) {
                    f[1]++
                    f[0] = f[1] * 10
                    f[f.length] = h
                    queue.push(h)
                }
            })
            fields_queue = []
        }
    }
    map_delete(L.allowed_hexes, location)
    check_china_box_restriction()
}

function compute_ground_naval_move_hexes() {
    let location = L.move_data.location
    let move_data = L.move_data
    var enemy_non_n_zoi = move_data.is_ground_present && !move_data.battle_range && has_non_n_zoi(location, 1 - R) && G.offensive.stage !== POST_BATTLE_STAGE

    // when last ground unit depart by sea supply could changed. We persist original state to be able restore it after pathfinding
    var supply = G.supply_cache
    var oos = G.oos
    if (L.move_data.is_ground_present && !L.move_data.battle_range) {
        var ground_unit_stay = 0
        for_each_unit_on_map((u, piece, loc) => {
            if (loc === location && piece.class !== "naval" && piece.faction === G.active && !set_has(G.active_stack, u)) {
                ground_unit_stay++
            }
        })
        if (!ground_unit_stay) {
            G.active_stack.forEach(u => G.location[u] = ELIMINATED_BOX)
            supply = object_copy(G.supply_cache)
            check_supply()
            G.active_stack.forEach(u => G.location[u] = location)
        }
    }


    L.allowed_hexes = []
    var mt = 0
    if (L.move_data.move_type & NAVAL_MOVE && !enemy_non_n_zoi) {
        var zoi_mask = 0
        if (move_data.is_ground_present && !move_data.is_naval_present) {
            zoi_mask = zoi_mask | JP_NAVAL_UNITS << (1 - R)
        }
        mt = NAVAL_MOVE
        if (move_data.move_type & BARGES_MOVE) {
            mt |= BARGES_MOVE
        }
        if (move_data.move_type & AVOID_ZOI) {
            zoi_mask = zoi_mask | JP_ZOI << (1 - R)
            mt |= AVOID_ZOI
        }
        if (G.offensive.stage === POST_BATTLE_STAGE && move_data.is_ground_present) {
            zoi_mask = 0
        }
        clear_supply_cache(CLEAN_ATTACK_ZONE_MASK)
        if (G.offensive.stage !== POST_BATTLE_STAGE) {
            mark_participate_attack_hex()
        }
        map_for_each(get_naval_move(zoi_mask), (k, v) => {
            if (move_data.is_ground_present) {
                v.unshift(mt | AMPH_MOVE)
            } else {
                v.unshift(mt)
            }
            if (!move_data.is_ground_present || L.move_type === AMPH_MOVE || L.move_type === BARGES_MOVE || get_distance(move_data.location, k) > 1 || G.offensive.stage !== ATTACK_STAGE) {
                map_set(L.allowed_hexes, k, v)
            }
        })
    }
    if ((L.move_data.move_type & GROUND_MOVE) && (L.move_type !== AMPH_MOVE)) {
        compute_ground_move_hexes()
    }
    if (G.offensive.stage !== POST_BATTLE_STAGE) {
        map_delete(L.allowed_hexes, location)
    }

    //restore original supply map if it was temporaly changed
    G.supply_cache = supply
    G.oos = oos
}

function compute_ground_move_hexes() {
    var mt = GROUND_MOVE
    if (L.move_data.move_type & AVOID_ZOI) {
        mt |= AVOID_ZOI
    }
    map_for_each(get_ground_move(L.move_data.move_type & AVOID_ZOI), (k, v) => {
        v.unshift(mt)
        if (G.offensive.stage === ATTACK_STAGE && (L.move_data.is_new_battle_allowed || !is_faction_units(k, 1 - G.active))
            || set_has(G.offensive.battle_hexes, k)) {
            map_set(L.allowed_hexes, k, v)
        }
    })
    if (G.offensive.stage !== POST_BATTLE_STAGE) {
        map_delete(L.allowed_hexes, L.move_data.location)
    }
}

function compute_ground_naval_strat_move() {
    let location = L.move_data.location
    let move_data = L.move_data
    L.allowed_hexes = []
    if (has_non_n_zoi(location, 1 - R)) {
        return
    }
    // to check when depart of ground unit could change zoi
    var ground_unit_stay = 0
    for_each_unit_on_map((u, piece, loc) => {
        if (loc === location && piece.class !== "naval" && piece.faction === G.active && !set_has(G.active_stack, u)) {
            ground_unit_stay++
        }
    })
    if (!ground_unit_stay || move_data.battle_range) {
        G.active_stack.forEach(u => G.location[u] = ELIMINATED_BOX)
        check_supply()
        G.active_stack.forEach(u => G.location[u] = location)
    }
    if (move_data.battle_range && has_non_n_zoi(location, 1 - R)) {
        return
    }
    const queue = [location]
    const distance_map = [location, [0, location]]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_path = map_get(distance_map, item)
        const distance = base_path[0] + 1
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (has_non_n_zoi(nh, 1 - R)
                || set_has(nh, G.offensive.battle_hexes)
                || distance > move_data.naval_move_distance
                || !(get_map_data(item).edges_int & WATER << 5 * j)
                || distance >= map_get(distance_map, nh, [100])[0]) {
                continue
            }
            if (distance < move_data.naval_move_distance) {
                queue.push(nh)
            }
            var path_array = base_path.slice()
            path_array.push(nh)
            path_array[0] = distance
            map_set(distance_map, nh, path_array)
            if (get_map_data(nh).port && is_space_controlled(nh, G.active) && !is_faction_units(nh, 1 - G.active)) {
                path_array = path_array.slice()
                path_array.unshift(STRAT_MOVE | NAVAL_MOVE)
                map_set(L.allowed_hexes, nh, path_array)
            }

        }
    }
    map_delete(L.allowed_hexes, location)
}

function mark_attack_zone(location, battle_range) {
    G.supply_cache[location] = G.supply_cache[location] | HEX_TEMP_FLAG2 | HEX_TEMP_FLAG1
    if (!L.move_data.is_ground_present) {
        for_each_hex_in_range(location, battle_range, h => {
            if (G.offensive.stage === REACTION_STAGE || !is_faction_units(h, 1 - G.active)) {
                G.supply_cache[h] = G.supply_cache[h] | HEX_TEMP_FLAG1
            }
        })
    }
}

function mark_participate_attack_hex() {
    var base_location = L.move_data.location
    var base_distance = G.offensive.naval_move_distance + L.move_data.battle_range
    if (G.offensive.stage === REACTION_STAGE && set_has(G.offensive.battle_hexes, base_location)) {
        mark_attack_zone(base_location, L.move_data.battle_range)
        return;
    }
    if (!L.move_data.is_ground_present) {
        map_for_each(G.offensive.paths, (u, path) => {
            var piece = pieces[u]
            if (piece.faction === G.active && piece.class === "naval" && piece.br && !set_has(G.active_stack, u)) {
                var location = G.location[u]
                G.supply_cache[location] = G.supply_cache[location] | HEX_TEMP_FLAG1
            }
        })
    }
    G.offensive.battle_hexes.forEach(h => mark_attack_zone(h, L.move_data.battle_range))
    if (G.offensive.stage === ATTACK_STAGE) {
        G.offensive.landing_hexes.forEach(h => mark_attack_zone(h, L.move_data.battle_range))
    }
    if (!L.move_data.is_new_battle_allowed) {
        return
    }
    for_each_hex_in_range(base_location, base_distance, h => {
        if (is_faction_units(h, 1 - R) && !(G.supply_cache[h] & HEX_TEMP_FLAG2)) {
            mark_attack_zone(h, L.move_data.battle_range)
        }
    })
}

function get_naval_move(zoi_mask) {
    const location = L.move_data.location
    const move_data = L.move_data
    const non_cv_ground_unit = move_data.is_ground_present && !move_data.battle_range
    var pbm = G.offensive.stage === POST_BATTLE_STAGE

    if (G.supply_cache[location] & zoi_mask
        || G.offensive.stage === ATTACK_STAGE && move_data.is_ground_present && move_data.is_naval_present && !(move_data.move_type & AMPH_MOVE)) {
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
        us_army_unit_active = G.active_stack.map(u => pieces[u]).filter(p => p.class === "ground" && p.service === "army").length &&
            !G.active_stack.map(u => pieces[u]).filter(p => p.class === "ground" && p.type === "marine").length
    }
    if (G.offensive.type === EC && G.offensive.offensive_card === KING_II) {
        us_army_unit_active = false
    }
    const queue = [location]
    const distance_map = [location, [0, location]]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_path = map_get(distance_map, item)
        const distance = base_path[0] + 1
        let nh_list = get_near_hexes(item)
        var item_non_n_zoi = !non_cv_ground_unit || has_non_n_zoi(item, 1 - R)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (G.supply_cache[nh] & zoi_mask
                || (non_cv_ground_unit && has_non_n_zoi(nh, 1 - R) && !(pbm && item_non_n_zoi))
                || pbm && is_faction_units(nh, 1 - R) && move_data.is_ground_present
                || distance > move_data.naval_move_distance
                || !(get_map_data(item).edges_int & WATER << 5 * j)
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
        var naval_attack = is_amph_attack_possible(nh) && (!us_army_unit_active || set_has(marine_landed_islands, nh) || !get_map_data(nh).island || G.offensive.stage === REACTION_STAGE)
        var port_transport = (get_map_data(nh).port && is_space_controlled(nh, R) && (!move_data.is_ground_present || !move_data.is_naval_present || G.offensive.stage === POST_BATTLE_STAGE || (L.move_type === AMPH_MOVE)))
        var aa_landing = move_data.move_type & AMPH_MOVE
            && is_hex_asp_capable(nh)
            && (!move_data.is_naval_present || move_data.move_type & ORGANIC_ONLY)
            && !pbm
        var no_enemy_units = !is_faction_units(nh, 1 - R)
        var landing = port_transport && (no_enemy_units || G.offensive.stage === POST_BATTLE_STAGE) || aa_landing && no_enemy_units
        if ((naval_attack || landing && G.offensive.stage !== REACTION_STAGE) && (!L.move_data.is_ground_present || !ground_move_denied(nh))) {
            map_set(result, nh, v)
        }
    })
    var burma_pbm = G.sid === BURMA_SCENARIO &&
        G.offensive.stage === POST_BATTLE_STAGE &&
        G.active === JP
    var kamikaze_only = burma_pbm && set_has(G.active_stack, KAMIKAZE) &&
        !map_get(G.offensive.paths, KAMIKAZE, [0, 0, 0]).includes(SINGAPORE, 2)
        && G.active_stack.filter(u => pieces[u].class === "naval").length === 1

    if (burma_pbm && move_data.is_naval_present && !kamikaze_only) {
        var s = map_get(result, SINGAPORE)
        if (s) {
            return [SINGAPORE, s]
        } else {
            return []
        }
    }

    return result
}

function is_amph_attack_possible(hex) {
    return (G.supply_cache[hex] & HEX_TEMP_FLAG1 && (L.move_data.move_type & AMPH_MOVE || !L.move_data.is_ground_present))
}

function is_hex_asp_capable(hex) {
    const terrain = get_map_data(hex).terrain
    return hex === MORESBY || (terrain !== OCEAN && terrain !== MOUNTAIN)
}

function should_ground_move_stop(hex, faction) {
    return G.supply_cache[hex] & JP_GAH_UNITS << (1 - faction) || set_has(G.offensive.battle_hexes, hex)
}

function ground_move_denied(hex) {
    var region = get_map_data(hex).region
    var faction = pieces[G.active_stack[0]].faction
    if (region === "Manchuria") {
        return true
    }
    if (region === "IChina") {
        return G.active_stack.filter(u => pieces[u].service !== "ch").length
    }
    if (faction === JP && region === "India") {
        return G.active_stack.filter(u => pieces[u].class === "ground").length
    }
    if (G.active_stack.filter(u => pieces[u].service === "ch").length) {
        return !(region === "IChina" || region === "NIndia" || region === "Burma")
    }
    if (G.sid === SOUTH_PACIFIC_SCENARIO && faction === AP && hex === TRUK && G.turn === 3) {
        return true;
    }
    if (G.sid === BURMA_SCENARIO && faction === AP && (region === "Siam" || region === "Indochina")) {
        return true;
    }
    if (G.sid === BURMA_SCENARIO && hex === SINGAPORE) {
        return true;
    }
    if (G.turn === 1 && faction === JP && (hex === SINGAPORE || hex === MANILA) && !L.move_data.is_naval_present) {
        return true;
    }
}

function get_ground_move(avoid_zoi) {
    const location = L.move_data.location
    const move_data = L.move_data
    var max_distance = move_data.ground_move_distance
    var spent_distance = 0
    var path = map_get(G.offensive.paths, G.active_stack[0])
    if (path) {
        spent_distance = path[1]
    }
    if (avoid_zoi && G.supply_cache[location] & JP_ZOI << (1 - G.active)) {
        return []
    }
    const queue = [location]
    const distance_map = [location, [spent_distance, location]]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_distance = map_get(distance_map, item)
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            var distance = base_distance[0] + get_ground_move_cost(item, nh, G.active)
            if ((avoid_zoi && G.supply_cache[nh] & JP_ZOI << (1 - G.active)) || distance > max_distance || distance >= map_get(distance_map, nh, [100])[0]
                || ground_move_denied(nh)) {
                continue
            }
            const stop_move = should_ground_move_stop(nh, G.active)

            let path_array = base_distance.slice()
            path_array.push(nh)
            path_array[0] = distance
            map_set(distance_map, nh, path_array)

            if (distance < max_distance && !stop_move) {
                queue.push(nh)
            }
        }
    }
    return distance_map
}


function check_china_box_restriction() {
    var count = 0
    for (var i = 0; i < pieces.length; i++) {
        if (G.location[i] === CHINA_BOX) {
            count++
        }
    }
    if (count >= 2 || pieces[G.active_stack[0]].b29 && (G.location[B_29_1] === CHINA_BOX || G.location[B_29_2] === CHINA_BOX)) {
        map_delete(L.allowed_hexes, CHINA_BOX)
    }
}

function process_china_box_move(hex, base_path, move_type) {
    var faction = pieces[G.active_stack[0]].faction
    var move_data = L.move_data
    var china_rebase = faction === AP && base_path[0] % 10 === 0 && base_path[1] <= move_data.air_move_legs
    if (china_rebase && (hex === DACCA || hex === JARHAT || hex === LEDO) && G.supply_cache[hex] & AP_SUPPLY_AIRFIELD && !map_has(L.allowed_hexes, CHINA_BOX)
        && G.offensive.stage !== REACTION_STAGE) {
        var path_array = base_path.slice()
        path_array.push(CHINA_BOX)
        path_array[0] = move_type
        map_set(L.allowed_hexes, CHINA_BOX, path_array)
    } else if (china_rebase && hex === CHINA_BOX && base_path[1] === 1) {
        var result = []
        if (G.supply_cache[DACCA] & AP_SUPPLY_AIRFIELD) {
            result.push(DACCA)
        }
        if (G.supply_cache[JARHAT] & AP_SUPPLY_AIRFIELD) {
            result.push(JARHAT)
        }
        if (G.supply_cache[LEDO] & AP_SUPPLY_AIRFIELD) {
            result.push(LEDO)
        }
        if (result.length) {
            return result
        }
    }
    return []
}

function target_in_battle_range(range, location, targets) {
    for (var i = 0; i < targets.length; i++) {
        if (get_distance(location, targets[i]) <= range) {
            return true
        }
    }
    return false
}

function is_overstack(hex, unit, multip = 1) {
    var piece = pieces[unit]
    fill_overstack(piece.faction)
    var overstack = L.overstack[hex]
    var multiplier = ((G.location[unit] === hex || G.location[piece.pair] === hex) ? 0 : 1) * multip
    if (hex === CHINA_BOX && piece.b29) {
        var count = 0
        count += unit === B_29_1 ? G.location[B_29_2] === CHINA_BOX : 0
        count += unit === B_29_2 ? G.location[B_29_1] === CHINA_BOX : 0
        if (count) {
            return false
        }
    }

    if (piece.class === "hq") {
        return overstack & 1
    } else if (piece.class !== "naval") {
        return ((overstack + 2 * multiplier) % (1 << 7)) > 7
    } else {
        return ((overstack + 128 * multiplier) >> 7) > 6
    }
}

function fill_overstack(faction) {
    if (L.overstack && L.overstack[0] === faction) {
        return
    }
    L.overstack = []
    L.overstack[0] = faction
    for (var i = 0; i <= LAST_BOARD_HEX; i++) {
        L.overstack[i] = 0
    }
    L.overstack[CHINA_BOX] = 2
    for_each_unit((u, piece, location) => {
        if (piece.faction !== faction) {
            return
        }
        var pair_location = G.location[pieces[u].pair]
        if (location <= LAST_BOARD_HEX && piece.class === "hq") {
            L.overstack[location] |= 1
        } else if (location <= LAST_BOARD_HEX && piece.class === "naval") {
            L.overstack[location] += (1 << 7)
        } else if (location === CHINA_BOX || (location <= LAST_BOARD_HEX && (piece.type !== "lrb" || pair_location !== location))) {
            L.overstack[location] += (1 << 1)
        }
    })
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

function init_overstack_check(ignore_movable) {
    var positions = []
    if (ignore_movable) {
        G.offensive.active_units[G.active].forEach(u => {
            var path = map_get(G.offensive.paths, u, [0])[0]
            var piece = pieces[u]
            var pbm_impossible = (path & STRAT_MOVE) || piece.class === "ground"
            if (!pbm_impossible) {
                map_set(positions, u, G.location[u])
                G.location[u] = NON_PLACED_BOX
            }
        })
    }
    fill_overstack(G.active)
    var result = count_units_stacking()
    map_for_each(positions, (u, l) => G.location[u] = l)
    return result
}


function count_units_stacking() {
    L.allowed_units = []
    L.ground_units = []
    var overstack_naval = []
    var overstack_land = []
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        if ((L.overstack[i] % (1 << 7)) > 7) {
            set_add(overstack_land, i)
        }
        if ((L.overstack[i] >> 7) > 6) {
            set_add(overstack_naval, i)
        }
    }
    if (!overstack_naval.length && !overstack_land.length) {
        return true
    }
    var air_hex = []
    for_each_unit_on_map((u, piece, location) => {
        if (piece.faction !== G.active) {
            return false
        }
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
        if (pieces[u].faction !== G.active) {
            return false
        }
        if (!set_has(air_hex, G.location[u])) {
            set_add(L.allowed_units, u)
        }
    })
    if (L.allowed_units.length === 0) {
        return true
    }
    return false
}