P.offensive_sequence = script(`
    set G.offensive.stage ATTACK_STAGE
    eval {
        trigger_event("before_activation")
    }
    call choose_hq
    call activate_units
    eval {
        trigger_event("before_movement")
    }
    call move_offensive_units
    call commit_offensive
    set G.active 1-G.offensive.attacker
    call cancel_offensive
    eval {
        trigger_event("before_reaction")
    }
    log ("#GOffensive reaction")

    call special_reaction
    set G.offensive.all_bh G.offensive.battle_hexes.slice()
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
    call broken_organic
    if (G.offensive.active_hq[G.active]) {
        call commit_offensive
    }
    log ("#GResolve battles")
    set G.active G.offensive.attacker
    call battle_sequence
    eval {
        capture_landing_hexes()
    }
    eval {
        trigger_event("before_pbm")
    }
    log ("#GPost battle movement")
    set G.offensive.stage POST_BATTLE_STAGE
    set G.active 1-G.offensive.attacker
    call apply_attack_reaction
    if (G.offensive.intelligence !== SURPRISE) {
        call move_offensive_units
        set G.offensive.active_units[1-G.offensive.attacker] []
        call commit_offensive
    }
    set G.active G.offensive.attacker
    call move_offensive_units
    set G.offensive.active_units[G.offensive.attacker] []
    call commit_offensive
    set G.active 1-G.offensive.attacker
    set G.offensive.stage EMERGENCY_STAGE
    call emergency_move
`)

P.battle_sequence = script(`
    while (G.offensive.battle_hexes.length){
      set G.active G.offensive.attacker
      call choose_battle
      call prepare_battle
      set G.offensive.battle.ground_stage 0
      call broken_aa
      if (G.offensive.intelligence === INTERCEPT) {
        call execute_attack {active: G.offensive.attacker}
        call execute_attack {active: 1 - G.offensive.attacker}
        call assign_hits
      } 
      if (G.offensive.intelligence === AMBUSH) {
        call execute_attack {active: 1 - G.offensive.attacker}
        call assign_hits
        call execute_attack {active: G.offensive.attacker}
        call assign_hits
      } 
      if (G.offensive.intelligence === SURPRISE) {
        call execute_attack {active: G.offensive.attacker}
        call assign_hits
        call execute_attack {active: 1 - G.offensive.attacker}
        call assign_hits
      }
      call apply_naval_winner
      set G.active JP
      call broken_organic
      call prepare_ground_battle
      call execute_attack {active: G.offensive.attacker}
      call execute_attack {active: 1 - G.offensive.attacker}
      call assign_hits
      call apply_ground_winner
      set G.offensive.battle {}
      log ("")
    }
`)

P.choose_hq = {
    _begin() {
        if (G.offensive.active_hq[G.active]) {
            end()
            return
        }
        L.possible_units = []
        var hq_list = []
        if (G.active === G.offensive.attacker && G.offensive.type === EC) {
            L.card = G.offensive.offensive_card
        } else if (G.active !== G.offensive.attacker && G.offensive.counter_offensive_card > 0) {
            L.card = G.offensive.counter_offensive_card
        }
        if (L.card && cards[L.card].hq) {
            hq_list = cards[L.card].hq
        }
        check_supply()
        HQ_LIST.forEach((u) => {
            var piece = pieces[u]
            if (G.location[u] > LAST_BOARD_HEX) {
                return
            }
            if (piece.faction === G.active && piece.class === "hq" &&
                (!set_has(G.oos, u) || L.card === GENERAL_ADACHI)
                && (G.active === G.offensive.attacker
                    || G.offensive.battle_hexes.filter(bh => get_distance(bh, G.location[u]) <= piece.cr).length)
                && (hq_list.length <= 0 || hq_list.includes(u))
            ) {
                L.possible_units.push(u)
            }
        })
        trigger_event("before_choose_hq")
        if (L.possible_units.length === 1) {
            this.choose(L.possible_units[0])
        } else if (!L.possible_units.length) {
            log(`No hq could be selected.`)
        }
    },
    inactive: "choose HQ",
    prompt() {
        prompt(`${offensive_card_header()} Choose HQ.`)
        L.possible_units.forEach(u => action_unit(u))
        if (!L.possible_units.length) {
            button("skip")
        }
    },
    skip() {
        push_undo()
        end()
    },
    choose(u) {
        G.offensive.active_hq[G.active] = u
        if (G.offensive.type === EC && L.card > 0 && cards[L.card].logistic_alt && cards[L.card].logistic_alt[0].includes(u)) {
            G.offensive.logistic = cards[L.card].logistic_alt[1]
        }
        log(`${piece_get_log_str(u)} activated for ${G.active === G.offensive.attacker ? "offensive" : "reaction"}.`)
        end()
    },
    unit(u) {
        push_undo()
        this.choose(u)
    },
}

function apply_inter_service() {
    if (!G.inter_service[R]) {
        return
    }
    var service = null
    G.offensive.active_units[R].forEach(u => {
        var piece = pieces[u]
        if (piece.service === "army" || piece.service === "navy") {
            service = piece.service
        }
    })
    if (!service) {
        return;
    }
    const rival_service = service === "army" ? "navy" : "army"
    L.allowed_units = L.allowed_units.filter(i => pieces[i].service !== rival_service)
}

function solely_occupied_land(hex, faction) {
    return G.supply_cache[hex] & JP_GAH_UNITS << (faction) && !(G.supply_cache[hex] & JP_GAH_UNITS << (1 - faction))
}

function mark_ground_reaction_hexes(location) {
    if (get_map_data(location).island) {
        return
    }
    const queue = [location]
    const distance_map = [location, 0]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_distance = map_get(distance_map, item)
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            var distance = base_distance + get_ground_move_cost(nh, item, R)//to correct distance processing with backward tracing
            if (distance > G.offensive.ground_move_distance
                || distance >= map_get(distance_map, nh, 100)
                || (G.supply_cache[nh] & ((JP_GROUND_UNITS | JP_HQ_UNITS | JP_AIR_UNITS) << G.offensive.attacker))
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
    if (!get_map_data(hex).coastal) {
        return;
    }
    const asp_capable = is_hex_asp_capable(hex)
    const naval_present = is_faction_naval_units(hex, G.offensive.attacker)
    const location = hex
    G.supply_cache[location] |= HEX_TEMP_FLAG1
    const queue = [location]
    const distance_map = [location, 0]
    const range = G.offensive.naval_move_distance
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        const distance = map_get(distance_map, item) + 1
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (distance > range
                || !(get_map_data(item).edges_int & WATER << 5 * j)
                || distance >= map_get(distance_map, nh, 100)) {
                continue
            }
            if (distance < G.offensive.naval_move_distance) {
                queue.push(nh)
            }
            map_set(distance_map, nh, distance)
            G.supply_cache[nh] |= HEX_TEMP_FLAG1
            if (asp_capable && (!naval_present || is_faction_naval_units(nh, 1 - G.offensive.attacker))) {
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
    const has_asp = get_asp_limit(R) && G.offensive.counter_offensive_card !== MATADOR
    for_each_unit_on_map((u, piece) => {
        if (piece.faction === R && piece.class === "ground" && G.supply_cache[G.location[u]] & HEX_TEMP_FLAG3 && !globalThis.RTT_FUZZER) {
            set_add(L.reaction_able_units, u)
        } else if (piece.faction === R && piece.class === "ground" && G.supply_cache[G.location[u]] & HEX_TEMP_FLAG2 && has_asp && !piece.organic && !globalThis.RTT_FUZZER) {
            set_add(L.asp_ground_units, u)
        } else if (piece.faction === R && piece.class === "naval" && G.supply_cache[G.location[u]] & HEX_TEMP_FLAG1) {
            set_add(L.reaction_able_units, u)
        } else if (piece.faction === R && piece.class === "ground" && G.supply_cache[G.location[u]] & HEX_TEMP_FLAG2 && piece.organic && !globalThis.RTT_FUZZER) {
            set_add(L.reaction_able_units, u)
        }
    })
}

function get_activatable_units(hq, hq_supply_type) {
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
        const MD = get_map_data(item)
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
    L.cv_reaction_hex_map = []
    L.air_reaction_hex_map = []
    L.move_data = {}
    G.offensive.battle_hexes.forEach(h => mark_attack_zone(h, R === AP ? 2 : 3))
    var hump = is_event_active(events.HUMP)
    if (faction === AP && (G.supply_cache[KUNMING] & HEX_TEMP_FLAG3
            || hump && (G.supply_cache[JARHAT] & HEX_TEMP_FLAG3)
            || hump && (G.supply_cache[DACCA] & HEX_TEMP_FLAG3))
        || hump && (G.supply_cache[LEDO] & HEX_TEMP_FLAG3)) {
        G.supply_cache[CHINA_BOX] |= HEX_TEMP_FLAG3
    } else {
        G.supply_cache[CHINA_BOX] &= CLEAN_ATTACK_ZONE_MASK
    }
    for (let i = 1; i < pieces.length; i++) {
        let piece = pieces[i]
        var loc = G.location[i]
        if (piece.supply & hq_supply_type
            && G.supply_cache[loc] & HEX_TEMP_FLAG3
            && piece.class !== "hq"
            && (piece.class !== "ground" || !set_has(G.offensive.battle_hexes, loc))
            && !set_has(G.offensive.active_units[R], i)
            && (!set_has(G.oos, i) || L.card === GENERAL_ADACHI)
            && (!reaction_movement || is_unit_reaction_able(i) && (!is_b29_bombed(piece) || is_faction_units(loc, JP)))
        ) {
            set_add(result, i)
        }
    }
    return result
}

function is_b29_bombed(piece) {
    return piece.b29 && (G.b29u & (B29_BOMBED << piece.b29))
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
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (distance > range
                || !(get_map_data(item).edges_int & WATER << 5 * j)
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
    var range = piece.parenthetical ? piece.br : piece.ebr
    const location = G.location[u]
    const cached = map_get(L.air_reaction_hex_map, location)
    if (cached && cached <= range) {
        return true
    } else if (cached === 0) {
        return false
    }
    if (target_in_battle_range(range, location, G.offensive.battle_hexes)) {
        map_set(L.air_reaction_hex_map, location, range)
        return true
    }
    var selected = [location]

    var leg_limit = G.offensive.air_move_distance
    let queue = [location]
    let leg_distance = 1
    let distance_incr_i = 0
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = map_get(AIRFIELD_LINKS, item, [])
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
                map_set(L.air_reaction_hex_map, location, range)
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

function get_kwai_modifier(hq) {
    if (hq.faction === AP) {
        return 0
    }
    if (is_space_controlled(RANGOON, JP) && is_event_active(events.KWAI_RIVER_BRIDGE)) {
        return 1
    } else if (is_space_controlled(RANGOON, AP) && !is_event_active(events.KWAI_RIVER_BRIDGE)) {
        return -1
    }
}

function log_units_activated() {
    var activated = G.offensive.active_units[R].length
    var limit = G.offensive.logistic + L.hq_bonus
    if (activated) {
        log(`Activated ^${activated} units|${G.offensive.active_units[R].map(u => piece_get_log_str(u)).join(", ")}^, ${limit} limit.`)
    } else {
        log(`No units activated.`)
    }
}

P.activate_units = {
    _begin() {
        if (R === G.offensive.attacker && G.offensive.type === EC && cards[G.offensive.offensive_card].hq) {
            L.card = G.offensive.offensive_card
        } else if (R !== G.offensive.attacker && G.offensive.counter_offensive_card > 0 && cards[G.offensive.counter_offensive_card].hq) {
            L.card = G.offensive.counter_offensive_card
        }

        var hq = G.offensive.active_hq[G.active]
        if (!hq) {
            log_units_activated()
            end()
            return
        }
        var piece = pieces[hq]
        if ((piece.service === "joint" || piece.service === "us") && !check_hq_in_supply(hq, piece, US_SUPPLIED_HEX)) {
            L.joint_disadvantage = 1
            log("-1 activation (US Line of Communication).")
        }
        L.possible_units = get_activatable_units(hq, pieces[hq].supply)
        L.kwai = get_kwai_modifier(pieces[hq])
        trigger_event("before_unit_activation")
        if (!L.possible_units.length) {
            log_units_activated()
            end()
        } else {
            this.update_possible_units()
        }
    },
    inactive: "activate units",
    prompt() {
        var too_much = G.offensive.active_units[R].length - (G.offensive.logistic + L.hq_bonus)
        var hint = `${G.offensive.logistic} + ${L.hq_bonus}`
        if (too_much > 0) {
            hint = "Too many units selected"
        }
        if (G.offensive.active_units[R].length === (G.offensive.logistic + L.hq_bonus)) {
            hint = "Done"
        }
        prompt(`${offensive_card_header()} Activate units: ${G.offensive.active_units[R].length} of  ${G.offensive.logistic + L.hq_bonus} (${hint}).`)
        if (!globalThis.RTT_FUZZER || too_much < -1) {
            L.allowed_units.forEach(u => action_unit(u))
        }
        G.offensive.active_units[R].forEach(u => unselect_unit(u))
        if (too_much <= 0) {
            button("done")
        }
    },
    update_possible_units() {
        L.allowed_units = L.possible_units.filter(u => !set_has(G.offensive.active_units[R], u))
        L.hq_bonus = pieces[G.offensive.active_hq[G.active]].cm
        if (L.joint_disadvantage) {
            L.hq_bonus -= 1
        }
        if (L.kwai && G.offensive.active_units[R].filter(u => KWAI_HQ_MOD.includes(get_map_data(G.location[u]).region)).length) {
            L.hq_bonus += L.kwai
        }
        if (G.offensive.stage === REACTION_STAGE && L.asp_ground_units) {
            var asp_used = G.offensive.active_units[R].filter(u => set_has(L.asp_ground_units, u)).length
            if (asp_used) {
                L.allowed_units = L.allowed_units.filter(u => !set_has(L.asp_ground_units, u))
            }
        }
        apply_inter_service()
        trigger_event("after_unit_activation")
    },
    unit(u) {
        if (set_has(G.offensive.active_units[R], u)) {
            set_delete(G.offensive.active_units[R], u)
        } else {
            set_add(G.offensive.active_units[R], u)
        }
        this.update_possible_units()
    },
    done() {
        push_undo()
        if (L.kwai && G.offensive.active_units[R].filter(u => KWAI_HQ_MOD.includes(get_map_data(G.location[u]).region)).length) {
            log(`${L.kwai > 0 ? "+" : ""}${L.kwai} activation (Bridge over the River Kwai).`)
        }
        log_units_activated()
        end()
    },
}

function could_unit_stop_here(u) {
    var piece = pieces[u]
    if (piece.class === "air") {
        return true
    }
    var loc = G.location[u]
    return is_space_controlled(loc, piece.faction) && get_map_data(loc).port
}

function could_stack_stop_here() {
    if (L.move_data.is_air_present || G.active_stack.length <= 0) {
        return true
    }
    if (L.move_data.is_ground_present && G.offensive.stage === POST_BATTLE_STAGE) {
        return false
    }
    if (L.move_data.is_ground_present && !L.move_data.is_naval_present) {
        return true
    }
    var location = G.location[G.active_stack[0]]
    if (!L.move_data.battle_range && G.offensive.stage === REACTION_STAGE) {
        return set_has(G.offensive.battle_hexes, location)
    }
    return set_has(G.offensive.battle_hexes, location) || set_has(G.offensive.landing_hexes, location) || is_space_controlled(location, R) && get_map_data(location).port
}

function could_air_stop_here() {
    if (!L.move_data.is_air_present || G.active_stack.length <= 0) {
        return false
    }
    var location = G.location[G.active_stack[0]]
    return set_has(G.offensive.battle_hexes, location) || is_space_controlled(location, R) && get_map_data(location).airfield
}

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

function create_battle_hex(hex) {
    if (set_has(G.offensive.battle_hexes, hex)) {
        return
    }
    if (!G.offensive.battle_names.includes(hex)) {
        G.offensive.battle_names.push(hex)
    }
    set_delete(G.offensive.landing_hexes, hex)
    set_add(G.offensive.battle_hexes, hex)
    // call("confirm_bh")
}

function get_bh_str(hex) {
    return `${String.fromCharCode(65 + G.offensive.battle_names.indexOf(hex))} (${hex_get_log_str(hex)})`
}

P.confirm_bh = {
    inactive: "declare battle hex",
    prompt() {
        var hex = G.offensive.battle_names[G.offensive.battle_names.length - 1]
        prompt(`New battle hex declared ${get_bh_str(hex)}.`)
        button("done")
    },
    done() {
        push_undo()
        end()
    },
}

function create_landing_hex(hex) {
    if (set_has(G.offensive.landing_hexes, hex) || set_has(G.offensive.battle_hexes, hex)) {
        return
    }
    G.offensive.battle_names.push(hex)
    set_add(G.offensive.landing_hexes, hex)
}

const ALWAYS_SHOW_BUTTONS = ["no_move", "eliminate"]

function get_move_buttons() {
    var result = []
    var eliminate_p = G.offensive.stage === POST_BATTLE_STAGE && L.allowed_hexes.length === 0 && G.active_stack.length === 1
    var no_move_p = could_stack_stop_here() || could_air_stop_here()
    if (G.offensive.stage === ATTACK_STAGE && pieces[G.active_stack[0]].parenthetical && L.move_type === ANY_MOVE) {
        result.push("extended_air")
    }
    if (G.offensive.stage === ATTACK_STAGE && !G.offensive.zoi_intelligence_modifier && L.move_type === ANY_MOVE) {
        result.push("avoid_zoi")
    }
    if (G.offensive.stage === ATTACK_STAGE && L.move_data.sm_possible && L.move_type === ANY_MOVE) {
        result.push("strat_move")
    }
    if (G.offensive.stage === ATTACK_STAGE && (L.move_data.move_type & AMPH_MOVE) && L.move_type === ANY_MOVE) {
        result.push("amphibious")
    }
    if (G.offensive.stage === ATTACK_STAGE && L.move_data.move_type & GROUND_MOVE && L.move_type === ANY_MOVE) {
        result.push("ground_move")
    }
    if ((no_move_p) && (L.move_type === ANY_MOVE && !L.spec_move || L.allowed_hexes.length === 0)) {
        result.push("no_move")
    }
    if (G.offensive.stage === ATTACK_STAGE && G.offensive.barges && L.move_type !== BARGES_MOVE && G.offensive.barges > 1 && G.active_stack.filter(u => pieces[u].class === "ground").length === 1) {
        result.push("barges")
    }

    if (!no_move_p && eliminate_p) {
        result.push("eliminate")
    }
    return result
}

function after_unit_move() {
    var curr_path = map_get(G.offensive.paths, G.active_stack[0], [0, 0, 0])
    var hex = curr_path[curr_path.length - 1]
    if (set_has(G.offensive.battle_hexes, hex) && G.offensive.stage === REACTION_STAGE) {
        G.offensive.active_units[G.offensive.attacker].forEach(u => {
            if (map_has(G.offensive.committed, u) && G.location[u] === hex) {
                map_delete(G.offensive.committed, u)
                log(`${piece_get_log_str(u)} turned back to battle hex ${get_bh_str(hex)}.`)
            }
        })
    }
    if (is_faction_units(hex, 1 - G.active) && G.active === G.offensive.attacker && G.offensive.stage === ATTACK_STAGE) {
        create_battle_hex(hex)
    } else if (!is_space_controlled(hex, R) && curr_path[0] & AMPH_MOVE) {
        create_landing_hex(hex)
    }
}

P.move_to = script(`
      set L.active G.active_stack
      eval {
        after_unit_move()
      }
      call choose_attack_hex {move_hexes: L.L.allowed_hexes}
      call prepare_disengagement
      eval {
        trigger_event("after_unit_move")
      }
      set L.L.allowed_hexes []
      set G.active_stack []
      `)

P.move_offensive_units = {
    _begin() {
        var clear_path = []
        map_for_each(G.offensive.paths, (u, path) => {
            if (pieces[u].faction === G.active && path[0] & GROUND_DISENGAGEMENT) {
                clear_path.push(u)
            }
        })
        clear_path.forEach(u => map_delete(G.offensive.paths, u))
        L.move_data = {}
        L.move_type = ANY_MOVE
        L.movable_units = []
        L.allowed_hexes = []
        if (G.offensive.stage === POST_BATTLE_STAGE) {
            G.offensive.organic = []
        }
        L.move_cache = []
        G.offensive.active_units[G.active].filter(u => {
            if (!unit_on_board(u) && G.location[u] !== CHINA_BOX
                || G.offensive.stage === POST_BATTLE_STAGE && (pieces[u].class === "ground" && !set_has(G.offensive.ground_pbm, u) || map_get(G.offensive.paths, u, [0])[0] & STRAT_MOVE)
                || G.offensive.stage === REACTION_STAGE && set_has(G.offensive.battle_hexes, G.location[u]) && !pieces[u].br) {
                return false
            }
            return true
        }).forEach(u => set_add(L.movable_units, u))
        if (L.movable_units.length <= 0) {
            end()
        }
        if (G.offensive.stage === POST_BATTLE_MOVE && G.active === G.offensive.attacker) {
            call("retreat")
        }
    },
    inactive: "move units",
    prompt() {
        prompt(`${offensive_card_header()} Move units.`)
        if (L.spec_move) {

        } else if (G.offensive.stage === ATTACK_STAGE
            || G.offensive.stage === POST_BATTLE_STAGE && !G.active_stack.length && L.movable_units.filter(u => !could_unit_stop_here(u)).length === 0
            || G.offensive.stage === REACTION_STAGE && !G.active_stack.length && L.movable_units.filter(u => !set_has(G.offensive.battle_hexes, G.location[u])).length === 0
        ) {
            button("done")
        }

        if (G.active_stack.length === 0) {
            L.movable_units.forEach(u => action_unit(u))
        } else {
            var buttons = get_move_buttons()
            if (buttons.length > 3 && !L.spec_move) {
                button("move")
            } else if (buttons.length) {
                buttons.forEach(b => button(b))
            }
            buttons.filter(b => ALWAYS_SHOW_BUTTONS.includes(b)).forEach(b => button(b))
            if (G.offensive.stage === ATTACK_STAGE && pieces[G.active_stack[0]].class === "air") {
                action_box(TURN_BOX + G.turn + 1)
            }
            if (G.offensive.stage === ATTACK_STAGE && G.offensive.organic.length > 0) {
                button("no_organic")
            }
            let loc = G.location[G.active_stack[0]]
            if (L.move_type === ANY_MOVE) {
                L.movable_units.filter(u => loc === G.location[u]
                    && !L.move_data.is_air_present
                    && pieces[u].class !== "air"
                    && L.move_type !== BARGES_MOVE
                    && !set_has(G.active_stack, u))
                    .forEach(u => action_unit(u))
                G.active_stack.forEach(u => unselect_unit(u))
            }
        }
        for (let i = 0; i < L.allowed_hexes.length; i += 2) {
            action_hex(L.allowed_hexes[i])
        }
        if (L.move_data.is_air_present && !set_has(G.offensive.battle_hexes, L.move_data.location)) {
            get_air_attack_hex().forEach(h => {
                action_hex(h)
            })
        }
    },
    move() {
        L.spec_move = 1
    },
    _resume() {
        if (L.movable_units.length <= 0) {
            this.done()
        }
    },
    no_organic() {
        G.offensive.organic.pop()
        G.offensive.organic.pop()
        update_move_hex()
    },
    eliminate() {
        push_undo()
        G.active_stack.forEach(u => eliminate(u))
        G.active_stack = []
    },
    turn_box(h) {
        push_undo()
        G.active_stack.forEach(u => displace_to_turn(u, 1, true))
        G.active_stack = []
        L.allowed_hexes = []
        L.move_data = {}
        L.move_type = ANY_MOVE
        L.spec_move = 0
        if (L.movable_units.length <= 0) {
            end()
        }
    },
    extended_air() {
        set_mt(AIR_EXTENDED_MOVE)
    },
    barges() {
        set_mt(BARGES_MOVE)
    },
    strat_move() {
        set_mt(STRAT_MOVE)
    },
    amphibious() {
        set_mt(AMPH_MOVE)
    },
    ground_move() {
        set_mt(ANY_MOVE)
        L.allowed_hexes = []
        L.spec_move = 0
        call("ground_move")
    },
    avoid_zoi() {
        set_mt(AVOID_ZOI)
    },
    unit(u) {
        var piece = pieces[u]
        if (set_has(G.active_stack, u)) {
            if (piece.organic && G.offensive.organic.includes(u) && G.offensive.stage !== POST_BATTLE_STAGE) {
                var ind = G.offensive.organic.indexOf(u)
                if (piece.class === "ground") {
                    ind -= 1
                }
                array_delete(G.offensive.organic, ind + 1)
                array_delete(G.offensive.organic, ind)
            }
            set_delete(G.active_stack, u)
            set_add(L.movable_units, u)
            update_move_hex()
            return
        }
        if (G.active_stack.length === 0) {
            push_undo()
        }

        if (piece.organic) {
            var pairs = G.active_stack.filter(au => pieces[au].organic && pieces[au].class !== piece.class && !G.offensive.organic.includes(au))
            var a = -1;
            var b;
            if (pairs.length && piece.class === "naval") {
                a = u
                b = pairs[0]

            } else if (pairs.length) {
                b = u
                a = pairs[0]
            }
            if (a >= 0) {
                G.offensive.organic.push(a)
                G.offensive.organic.push(b)
            }
        }
        set_add(G.active_stack, u)
        var path = map_get(G.offensive.paths, u, [ANY_MOVE, 0, G.location[u]])
        if (path[0] & BARGES_MOVE) {
            L.move_type = BARGES_MOVE
        }
        map_set(G.offensive.paths, u, path)
        update_move_hex()
        set_delete(L.movable_units, u)
        trigger_event("before_unit_move", u)
    },
    pass() {
        L.allowed_hexes = []
        G.active_stack = []
        if (L.movable_units.length <= 0) {
            end()
        }
    },
    action_hex(hex) {
        if (L.move_type === BARGES_MOVE) {
            G.offensive.barges = 1
            log(`Barges ability used.`)
        }
        if (G.offensive.organic.length && G.active_stack.filter(u => G.offensive.organic.includes(u)).length) {
            G.active_stack.forEach(u => {
                var index = G.offensive.organic.indexOf(u)
                if (index >= 0 && pieces[u].class === "naval") {
                    log(`Organic transport used. ${piece_get_log_str(G.offensive.organic[index])} carry ${piece_get_log_str(G.offensive.organic[index + 1])}`)
                }
            })
        }
        var curr_path = map_get(L.allowed_hexes, hex)
        if (!curr_path) {
            attack_hex(hex)
            G.active_stack = []
            L.allowed_hexes = []
            L.move_data = {}
            L.move_type = ANY_MOVE
            L.spec_move = 0
            if (L.movable_units.length <= 0) {
                end()
            }
            return
        }
        move_units(G.active_stack, curr_path)
        if (curr_path[0] & AMPH_MOVE && G.offensive.stage === REACTION_STAGE) {
            G.asp[R][1] += 1
            G.offensive.r_asp = 1
        } else if (curr_path[0] & AMPH_MOVE &&
            (!get_map_data(hex).port || !is_space_controlled(hex, R) || is_faction_units(hex, 1 - R) || (L.move_type === AMPH_MOVE))) {
            G.asp[R][1] += L.move_data.asp_points
            log(`${side_get_log_str(G.active)} ASP used ${L.move_data.asp_points} (${G.asp[R][1]}).`)
            if (G.offensive.stage === REACTION_STAGE) {
                G.offensive.r_asp += L.move_data.asp_points
            }
        }
        L.move_type = ANY_MOVE
        L.spec_move = 0
        call("move_to", {hex})
    },
    no_move() {
        call("move_to", {hex: G.location[G.active_stack[0]]})
    },
    done() {
        G.offensive.active_units[R].filter(u => !map_has(G.offensive.paths, u))
            .forEach(u => map_set(G.offensive.paths, u, [ANY_MOVE, 0, G.location[u]]))
        if (G.offensive.stage === POST_BATTLE_STAGE) {
            G.offensive.active_units[R] = []
        }
        G.active_stack = []
        end()
    },
}

P.ground_move = {
    _begin() {
        L.allowed_hexes = []
        L.move_type = ANY_MOVE
        L.move_data = get_move_data()
        //check_supply()
        compute_ground_move_hexes()
        if (map_get(G.offensive.paths, G.active_stack[0])[1] > 0) {
            L.moved = 1
        }
    },
    inactive: "move units",
    prompt() {
        prompt(`${offensive_card_header()} Move activated units.`)
        if (G.offensive.stage !== REACTION_STAGE || set_has(G.offensive.battle_hexes, G.location[G.active_stack[0]])) {
            button("done")
        }
        for (let i = 0; i < L.allowed_hexes.length; i += 2) {
            action_hex(L.allowed_hexes[i])
        }
    },
    action_hex(hex) {
        if (L.moved || should_ground_move_stop(hex, R)) {
            push_undo()
            L.moved = 0
        }
        var curr_path = map_get(L.allowed_hexes, hex)
        move_units(G.active_stack, curr_path)
        L.move_data.location = hex
        L.allowed_hexes = []
        if (!should_ground_move_stop(hex, R)) {
            compute_ground_move_hexes()
        } else {
            this.complete()
        }
    },
    complete() {
        if (is_faction_units(G.location[G.active_stack[0]], 1 - G.active)) {
            create_battle_hex(G.location[G.active_stack[0]])
        }
        var hex = G.location[G.active_stack[0]]
        goto("move_to", {hex})
    },
    done() {
        push_undo()
        this.complete()
    }
}


function set_mt(mt) {
    L.move_type = mt
    update_move_hex()
}

function get_air_attack_hex() {
    var result = []
    if (G.offensive.stage === POST_BATTLE_STAGE || !G.active_stack.length) {
        return result
    }
    L.move_data = get_move_data()
    if (!L.move_data.battle_range) {
        G.offensive.active_units[R].forEach(u => {
            var piece = pieces[u]
            var bh = map_get(G.offensive.committed, u)
            if (G.location[u] === L.move_data.location && piece.br && piece.class === "naval" && bh) {
                set_add(result, bh)
            }
        })
        if (L.move_data.is_ground_present) {
            return []
        }
    } else {
        return compute_air_commit_hexes()
    }
    return result
}

P.choose_attack_hex = {
    _begin() {
        if (!G.active_stack) {
            end()
            return
        }
        var hex = G.location[G.active_stack[0]]
        var escort = G.offensive.active_units[R].filter(u => {
            var piece = pieces[u]
            return G.location[u] === hex && piece.br && piece.class === "naval"
        }).length
        var battle_range = L.L.L.move_data.battle_range
        var path = map_get(G.offensive.paths, G.active_stack[0], [0, 0, 0])
        var moved_to_bh = set_has(G.offensive.battle_hexes, hex) && !set_has(G.offensive.battle_hexes, path[2])
        var distant_attack =
            (battle_range || escort)
            && G.active_stack.length >= 1
            && G.offensive.stage !== POST_BATTLE_STAGE
            && (G.offensive.stage === REACTION_STAGE || !is_b29_bombed(pieces[G.active_stack[0]]))
        if (!distant_attack || moved_to_bh) {
            end()
            return
        }

        L.allowed_hexes = get_air_attack_hex()
        if (G.offensive.stage === REACTION_STAGE && set_has(G.offensive.battle_hexes, path[2])) {
            this.attack_hex(path[2])
        } else if (L.allowed_hexes.length <= 0 && G.offensive.stage !== REACTION_STAGE) {
            G.active_stack = []
            end()
        }
    },
    inactive: "assign units to attack",
    prompt() {
        var could_pass = could_stack_stop_here() && G.offensive.stage === ATTACK_STAGE
        if (!L.move_data.battle_range) {
            prompt(`${offensive_card_header()} Assign units to escort. (They will NOT contribute attack strength to the battle, only their defense strength!).`)
        } else {
            prompt(`${offensive_card_header()} Assign units to battle.${(!could_pass && G.offensive.stage === REACTION_STAGE && L.allowed_hexes.length === 0
            ) ? " (Reaction units must be assigned to battle)." : ""}`)
        }

        if (could_pass || globalThis.RTT_FUZZER) {
            button("pass")
        }
        for (let i = 0; i < L.allowed_hexes.length; i += 1) {
            action_hex(L.allowed_hexes[i])
        }
    },
    pass() {
        L.allowed_hexes = []
        G.active_stack = []
        end()
    },
    attack_hex(hex) {
        attack_hex(hex)
        G.active_stack = []
        end()
    },
    action_hex(hex) {
        this.attack_hex(hex)
    },
}

function attack_hex(hex) {
    if (is_faction_units(hex, 1 - R)) {
        create_battle_hex(hex)
    }
    var path_to_bh = map_get(L.move_hexes ? L.move_hexes : [], hex, 0)
    var non_cv = []
    G.active_stack.forEach(u => {
        if (!path_to_bh || is_cv_unit(pieces[u])) {
            commit_to_attack(u, hex)
        } else {
            set_add(non_cv, u)
        }
    })
    var distant = G.active_stack.slice()
    if (non_cv.length && path_to_bh && non_cv.length < G.active_stack.length) {
        move_units(non_cv, path_to_bh)
        non_cv.forEach(u => set_delete(distant, u))
    }
    log(`${units_str(distant)} assigned to attack to ${hex_get_log_str(hex)}.`)
}

function move_units(units, path) {
    const prev_path = map_get(G.offensive.paths, units[0])
    var full_path = [path[0], path[1]]
    if (prev_path) {
        full_path.push(...prev_path.slice(2))
    } else {
        full_path.push(G.location[units[0]])
    }
    full_path.push(...path.slice(3))
    units.forEach(u => {
        map_set(G.offensive.paths, u, full_path.slice())
    })
    var units_list = units_str(units)
    if (path.length === 3) {
        log(`${units_list} skipped move.`)
        return
    }
    var i = 2
    var zoi_flag = !G.offensive.zoi_intelligence_modifier && G.offensive.stage === ATTACK_STAGE && pieces[units[0]].faction === G.offensive.attacker
    var zoi_generator_flag = G.active_stack.filter(u => pieces[u].zoi_generator).length
        || (path[0] & GROUND_MOVE) && G.active_stack.filter(u => pieces[u].class === "ground").length
    var enemy_faction = 1 - pieces[units[0]].faction
    var point_to_point = []
    var last = null
    for (; i < path.length; i++) {
        var hex = path[i]
        if (last !== hex) {
            point_to_point.push(hex_get_log_str(hex))
        } else if (last) {
            point_to_point[point_to_point.length - 1] = "rebase " + hex_get_log_str(hex)
        }
        last = hex
    }
    i = 3
    var destination = path[path.length - 1]
    log(`${units_list} moved to ${list_get_log_str(hex_get_log_str(destination) + ", " + (point_to_point.length - 1), point_to_point)}${get_move_type(path[0])}.`)
    for (; i < path.length; i++) {
        var hex = path[i]
        if (zoi_flag && zoi_generator_flag && (G.supply_cache[hex] & (POSSIBLE_ZOI << enemy_faction))) {
            units.forEach(u => set_location(u, hex, 1))
        }
        if (zoi_flag && has_zoi(hex, 1 - R)) {
            log("#IReaction zoi violated! -2 to reaction intelligence rolls")
            G.offensive.zoi_intelligence_modifier = 1
            zoi_flag = 0
        }
        if (path[0] & GROUND_MOVE && !is_faction_units(hex, 1 - R)) {
            capture_hex(hex)
        }
    }
    units.forEach(u => set_location(u, destination, true))
}

function get_move_type(type) {
    if (G.offensive.stage !== ATTACK_STAGE) {
        return ""
    }
    if (type & STRAT_MOVE) {
        return " (Strategic move)"
    } else if (type & AIR_EXTENDED_MOVE) {
        return " (Extended range)"
    } else if (type & GROUND_DISENGAGEMENT) {
        return " (Disengagement)"
    } else if (type & BARGES_MOVE) {
        return " (Barges)"
    } else if (type & GROUND_MOVE) {
        return " (Ground move)"
    }
    return ""
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

function init_overstack_check(count_movable) {
    var positions = []
    if (!count_movable) {
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

P.check_overstacking = {
    _begin() {
        L.remove_flag = G.offensive.stage === EVENT_STAGE || G.offensive.stage === EMERGENCY_STAGE || G.offensive.stage === POST_BATTLE_STAGE && G.active === G.offensive.attacker
        if (init_overstack_check(L.remove_flag)) {
            end()
            return
        }
        L.hexes = []
        L.allowed_units.forEach(u => set_add(L.hexes, G.location[u]))
        L.violations = {overstack: L.hexes}
        if (L.remove_flag && L.allowed_units.length) {
            log(`#G${side_get_log_str(G.active)} Check stacking`)
        }
    },
    inactive: "check stacking",
    prompt() {
        if (!L.remove_flag) {
            prompt(`Review overstacked units. Hexes: ${L.hexes.map(h => hex_get_log_str(h)).join(", ")}.`)
            button("done")
            return
        }
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
        if (set_has(G.oos, u)) {
            eliminate(u)
        } else {
            displace_to_turn(u, pieces[u].class === "naval" ? 1 : 2, true)
        }
        set_delete(L.allowed_units, u)
        var still_overstack = is_overstack(location, u, 0)
        if (!still_overstack && pieces[u].class === "naval") {
            L.allowed_units = L.allowed_units.filter(u => G.location[u] !== location || pieces[u].class !== "naval")
        } else if (!still_overstack && pieces[u].class === "ground") {
            L.allowed_units = L.allowed_units.filter(u => G.location[u] !== location || pieces[u].class !== "ground")
        } else if (!still_overstack && pieces[u].class === "air") {
            L.allowed_units = L.allowed_units.filter(u => G.location[u] !== location || pieces[u].class !== "air")
        } else if (still_overstack && pieces[u].class === "air") {
            var air_present = L.allowed_units.filter(u => G.location[u] === location && pieces[u].class === "air").length
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

function set_location(unit, location, no_logs) {
    var prev_location = G.location[unit]
    var prev_out = prev_location > LAST_BOARD_HEX && prev_location !== CHINA_BOX
    var current_on_map = location <= LAST_BOARD_HEX || location === CHINA_BOX
    if (!no_logs && prev_out && current_on_map) {
        log(`${piece_get_log_str(unit)} placed to ${hex_get_log_str(location)}.`)
    } else if (!no_logs && current_on_map) {
        log(`${piece_get_log_str(unit)} moved to ${hex_get_log_str(location)}.`)
    }
    var pair_location = G.location[pieces[unit].pair]
    var size = get_overstack_size(unit)
    if (L.overstack && (prev_location <= LAST_BOARD_HEX || prev_location === CHINA_BOX) && pair_location !== prev_location) {
        L.overstack[prev_location] -= size
    }
    if (L.overstack && (location <= LAST_BOARD_HEX || location === CHINA_BOX) && pair_location !== location) {
        L.overstack[location] += size
    }
    G.location[unit] = location
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

function extended_pbm_possible() {
    var u = G.active_stack[0]
    return !map_has(G.offensive.committed, u) && !set_has(G.offensive.all_bh, G.location[u])
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

function get_asp_limit(faction) {
    var asp_lim = G.asp[faction][0]
    if (faction === JP && G.inter_service[0]) {
        asp_lim = Math.ceil(asp_lim / 2)
    }
    return Math.max(asp_lim - G.asp[faction][1], 0)
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
        var piece = pieces[u]
        var path = map_get(G.offensive.paths, u)
        var range = pieces[u].ebr ? pieces[u].ebr : pieces[u].br
        if (pieces[u].parenthetical) {
            range = pieces[u].br
        }
        var committed = map_get(G.offensive.committed, u, 0)
        if (map_has(G.offensive.committed, u) && (set_has(G.offensive.battle_hexes, committed) || set_has(G.offensive.landing_hexes, committed)) ||
            path[0] & STRAT_MOVE || path[0] & AIR_EXTENDED_MOVE || is_faction_units(location, 1 - pieces[u].faction)
            || is_b29_bombed(piece)) {
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
        if (new_battle_allowed && is_faction_units(h, 1 - R) && get_map_data(h).region !== "IChina"
            || set_has(G.offensive.battle_hexes, h) || set_has(G.offensive.landing_hexes, h)) {
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
    if (is_b29_bombed(pieces[G.active_stack[0]])) {
        return result
    }
    var location = G.location[G.active_stack[0]]
    var parenthetical = pieces[G.active_stack[0]].parenthetical
    var range = parenthetical ? move_data.battle_range : move_data.extended_battle_range
    const path = map_get(G.offensive.paths, G.active_stack[0]).slice()
    if (path[0] & AIR_EXTENDED_MOVE || path[0] & STRAT_MOVE) {
        return result
    }
    for (var i = 0; i < G.active_stack.length; i++) {
        var u = G.active_stack[i]
        if ((map_get(G.offensive.paths, u)[0] & AIR_EXTENDED_MOVE)) {
            return []
        }
    }
    G.offensive.battle_hexes.filter(h => get_distance(h, location) <= range).forEach(h => set_add(result, h))
    if (G.offensive.stage === ATTACK_STAGE) {
        G.offensive.landing_hexes.filter(h => get_distance(h, location) <= range).forEach(h => set_add(result, h))
    }
    if (move_data.is_new_battle_allowed) {
        for (i = 0; i < G.supply_cache.length; i++) {
            if ((G.supply_cache[i] & JP_UNITS << (1 - R)) && get_distance(i, location) <= range
                && get_map_data(i).region !== "IChina") {
                set_add(result, i)
            }
        }
    }
    return result
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

function compute_air_move_hexes() {
    let location = L.move_data.location
    L.allowed_hexes = []
    let move_data = L.move_data
    var move_type = ANY_MOVE
    if (move_data.move_type & STRAT_MOVE) {
        move_type |= STRAT_MOVE
    }
    if (move_data.move_type & AIR_EXTENDED_MOVE) {
        move_type |= AIR_EXTENDED_MOVE
    }
    if (L.move_type === STRAT_MOVE) {
        // check_supply()
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
            // check_supply()
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
        // check_supply()
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
                path_array.unshift(STRAT_MOVE)
                map_set(L.allowed_hexes, nh, path_array)
            }

        }
    }
    map_delete(L.allowed_hexes, location)
}

function get_just_entered() {
    var just_enetered = []
    map_for_each(G.offensive.paths, (u, path) => {
        var piece = pieces[u]
        var location = G.location[u]
        if (piece.faction === G.offensive.attacker && piece.class === "ground" && path[0] & GROUND_MOVE
            && set_has(G.offensive.battle_hexes, location)) {
            set_add(just_enetered, path[path.length - 2])
        }
    })
    return just_enetered
}

function get_disengagement_units(units) {
    if (!(map_get(G.offensive.paths, units[0], [0])[0] & GROUND_MOVE) || G.offensive.stage !== ATTACK_STAGE) {
        return []
    }
    var hex = G.location[units[0]]
    var cf_sum = [0, 0]
    var just_entered = get_just_entered()
    var result = []
    for_each_unit_on_map((u, piece, location) => {
        if (piece.class === "ground" && location === hex) {
            cf_sum[piece.faction] += set_has(G.reduced, u) ? piece.rcf : piece.cf
            if (piece.faction !== G.offensive.attacker && get_disengagement_hexes(location, just_entered).length) {
                set_add(result, u)
            }
        }
    })
    if (cf_sum[1 - G.offensive.attacker] > cf_sum[G.offensive.attacker]) {
        return result
    }
    return []
}

P.prepare_disengagement = {
    _begin() {
        var allowed_units = get_disengagement_units(L.L.active)
        if (allowed_units.length <= 0) {
            end()
            return;
        }
    },
    inactive: "choose disengagement",
    prompt() {
        prompt(`Reaction player could use disengagement ability after this move.`)
        button("awaiting")
        button("continue")
    },
    awaiting() {
        this.prepare_state()
        goto("retro_disengagement")
    },
    continue() {
        this.prepare_state()
        end()
    },
    prepare_state() {
        push_undo()
        if (!G.offensive.disengagement) {
            G.offensive.disengagement = []
        }
        G.offensive.disengagement.push(G.undo.length - 1)
    }
}

P.retro_disengagement = {
    _begin() {
        L.next_d = -1
        this.next_disengagement()
        if (L.next_d >= G.offensive.disengagement.length) {
            end()
            G.offensive.disengagement = []
            return
        }
        G.persisted_undo = G.undo
        G.undo = []
        G.active = 1 - G.offensive.attacker
        L.move_log = []
    },
    next_disengagement() {
        L.allowed_units = []
        L.allowed_hexes = []
        var undo_stack = G.undo
        if (G.persisted_undo) {
            undo_stack = G.persisted_undo
        }
        while (++L.next_d < G.offensive.disengagement.length) {
            var allowed_units = []
            var allowed_hexes = []
            with_state_as_G(undo_stack[G.offensive.disengagement[L.next_d]], () => {
                allowed_units = get_disengagement_units(G.L.L.active)
                if (allowed_units.length > 0) {
                    allowed_hexes = compute_ground_disengagement(allowed_units[0])
                }
            })
            if (!allowed_units.length || !allowed_hexes.length) {
                continue
            }
            L.allowed_units = allowed_units
            L.allowed_hexes = allowed_hexes
            return
        }
    },
    inactive: "choose disengagement",
    prompt() {
        prompt(`Choose hex to move disengaging unit${L.allowed_units.length > 1 ? "s" : ""} or skip.`)
        if (L.conflicted || L.next_d >= G.offensive.disengagement.length) {
            button("done")
            return;
        }
        L.allowed_hexes.forEach(h => action_hex(h))
        button("skip")
    },
    done() {
        if (L.conflicted) {
            var move_log = L.move_log
            this.reset_state()
            for (var i = 0; i < move_log.length - 1; i++) {
                remove_battle_hex_without_def(G.location[move_log[i][0]])
                move_units(move_log[0], move_log[1])
            }
            log("Offensive interrupted due to disengagement.")
        }
        G.active = G.offensive.attacker
        G.undo = []
        G.prepared_undo = G.persisted_undo
        G.persisted_undo = null
        prepare_redo()
        G.offensive.disengagement = []
        end()
        var active_stack = L.active

        if (L.P === "move_to" && !set_has(G.offensive.battle_hexes, G.location[active_stack[0]])) {
            set_mt(ANY_MOVE)
            L.allowed_hexes = []
            L.spec_move = 0
            G.active_stack = active_stack
            call("ground_move")
        }
    },
    skip() {
        push_undo()
        var units = list_get_log_str(L.allowed_units.length + " units", L.allowed_units.map(u => set_has(G.reduced, u) ? `(${piece_get_log_str(u)})` : piece_get_log_str(u)))
        log(`${units} skip disengagement.`)
        this.next_disengagement()
    },
    reset_state() {
        G.persisted_undo.length = G.offensive.disengagement[L.next_d] + 1
        G.undo = G.persisted_undo
        pop_undo()
        L = G.L
        if (globalThis.RTT_FUZZER) {
            G.undo = []
        }
    },
    action_hex(hex) {
        push_undo()
        var path = map_get(L.allowed_hexes, hex)
        var moved = []
        for (var i = 2; i < path.length; i++) {
            set_add(moved, path[i])
        }
        var activated_before = []
        map_for_each(G.persisted_undo[[G.offensive.disengagement[L.next_d]]].offensive.paths, (u, v) => {
            if (pieces[u].faction === G.offensive.attacker) {
                set_add(activated_before, u)
            }
        })
        map_for_each(G.offensive.paths, (u, v) => {
            if (pieces[u].faction === G.offensive.attacker && !set_has(activated_before, u)) {
                var i = 2
                while (i < v.length) {
                    if (set_has(moved, v[i])) {
                        L.conflicted = 1
                    }
                    i++
                }
            }
        })
        remove_battle_hex_without_def(G.location[L.allowed_units[0]])
        if (!set_has(G.offensive.battle_hexes, G.location[L.allowed_units[0]])) {
            capture_hex(G.location[L.allowed_units[0]], G.offensive.attacker)
        }
        L.move_log.push(L.allowed_units, path)
        move_units(L.allowed_units, path)
        if (!L.conflicted) {
            this.next_disengagement()
        }
    },
    on_view() {
        if (R !== G.offensive.attacker && L.next_d < G.offensive.disengagement.length) {
            return with_state_as_G(G.persisted_undo[[G.offensive.disengagement[L.next_d]]], () => {
                create_view()
                var view = V
                if (L.move_log.length) {
                    view.location = object_copy(view.location)
                    map_for_each(L.move_log, (units, path) => {
                        units.forEach(u => view.location[u] = path[path.length - 1])
                    })
                }
                if (L.allowed_units) {
                    view.active_stack = L.allowed_units
                }

            })
        }
        return create_view()
    }
}

function remove_battle_hex_without_def(loc) {
    var defender = 1 - G.offensive.attacker
    var non_ground = JP_UNITS - JP_GROUND_UNITS
    if (set_has(G.offensive.battle_hexes, loc) && !(G.supply_cache[loc] & (non_ground << defender)) && !get_garrison(loc).length) {
        set_delete(G.offensive.battle_hexes, loc)
    }
}

function get_disengagement_hexes(hex, just_entered) {
    var result = []
    var nh_array = get_near_hexes(hex)
    for (var i = 0; i < nh_array.length; i++) {
        var nh = nh_array[i]
        var distance = get_ground_move_cost(hex, nh, R)
        if (nh > 0 && !set_has(just_entered, nh) && !is_faction_units(nh, G.offensive.attacker) && distance < 10) {
            set_add(result, nh)
        }
    }
    return result
}

function compute_ground_disengagement(unit) {
    let location = G.location[unit]
    var allowed_hexes = []
    var just_entered = get_just_entered()
    let nh_list = get_disengagement_hexes(location, just_entered)
    for (let j = 0; j < nh_list.length; j++) {
        let nh = nh_list[j]
        if (nh <= 0) {
            continue
        }
        if (is_faction_units(nh, G.offensive.attacker) || set_has(just_entered, nh)) {
            continue
        }
        map_set(allowed_hexes, nh, [GROUND_DISENGAGEMENT | GROUND_MOVE, 0, location, nh])
    }
    return allowed_hexes
}

function should_ground_move_stop(hex, faction) {
    return G.supply_cache[hex] & JP_GAH_UNITS << (1 - faction) || set_has(G.offensive.battle_hexes, hex)
}

function ground_move_denied(hex) {
    var region = get_map_data(hex).region
    if (region === "Manchuria") {
        return true
    }
    if (region === "IChina") {
        return G.active_stack.filter(u => pieces[u].service !== "ch").length
    }
    if (pieces[G.active_stack[0]].faction === JP && region === "India") {
        return G.active_stack.filter(u => pieces[u].class === "ground").length
    }
    if (G.active_stack.filter(u => pieces[u].service === "ch").length) {
        return !(region === "IChina" || region === "NIndia" || region === "Burma")
    }
    if (G.sid === SOUTH_PACIFIC_SCENARIO && G.active === AP && hex === TRUK) {
        return true;
    }
    if (G.sid === BURMA_SCENARIO && G.active === AP && (region === "Siam" || region === "Indochina")) {
        return true;
    }
    if (G.sid === BURMA_SCENARIO && hex === SINGAPORE) {
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
        us_army_unit_active = G.active_stack.map(u => pieces[u]).filter(p => p.class === "ground" && p.service === "army").length
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

function commit_to_attack(unit, hex) {
    map_set(G.offensive.committed, unit, hex)
}

function check_amph_mod() {
    var faction = 1 - G.active
    G.offensive.battle_hexes.forEach(h => {
        if (G.supply_cache[h] & ((JP_GROUND_UNITS | JP_HQ_UNITS) << faction)) {
            set_add(G.offensive.amp_mod, h)
        }
    })
    G.offensive.landing_hexes.forEach(h => {
        if (G.supply_cache[h] & ((JP_GROUND_UNITS | JP_HQ_UNITS) << faction)) {
            set_add(G.offensive.amp_mod, h)
        }
    })
}

P.declare_battle_hexes = {
    _begin() {
        if (G.offensive.stage !== ATTACK_STAGE) {
            end()
            return
        }
        check_amph_mod()
        G.offensive.battle_names.filter(h => set_has(G.offensive.battle_hexes, h))
            .forEach(h => log(`Battle ${String.fromCharCode(65 + G.offensive.battle_names.indexOf(h))} declared in ${hex_get_log_str(h)}.`))
        compute_possible_battle_hexes()
        if (L.possible_units.length <= 0 && G.offensive.battle_hexes.length <= 0) {
            log("No battle hexes declared.")
            end()
        }
    },
    inactive: "declare battle hexes",
    prompt() {
        if (G.active_stack.length === 0 && L.possible_units.length === 0) {
            prompt(`${offensive_card_header()} Confirm declared battle hexes.`)
        } else {
            prompt(`${offensive_card_header()} Declare battle hexes.`)
        }
        if (G.active_stack.length === 0) {
            L.possible_units.forEach(u => action_unit(u))
            button("done")
        } else {
            const location = G.location[G.active_stack[0]]
            var piece = pieces[G.active_stack[0]]
            var range = piece.parenthetical ? piece.br : piece.ebr
            L.possible_hexes.filter(loc => get_distance(loc, location) <= range).forEach(loc => action_hex(loc))
        }
    },
    action_hex(hex) {
        push_undo()
        commit_to_attack(G.active_stack[0], hex)
        if (!set_has(G.offensive.battle_hexes, hex) && is_faction_units(hex, 1 - G.active)) {
            create_battle_hex(hex)
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
        if (G.offensive.battle_hexes.length <= 0) {
            log("No battle hexes declared.")
        }
        end()
    },
}

P.commit_offensive = script(`
    eval {
        if (get_hand(AP).includes(SKIP_BOMBING)) {
            cache_skip_bombing()
        }
    }
    if ( G.offensive.stage === ATTACK_STAGE && G.offensive.disengagement && G.offensive.disengagement.length ){
        call disengagement_confirm
    }
    call declare_battle_hexes
    set L.verify_error trigger_event("before_commit_offensive")
    call check_overstacking
    call commit_offensive_confirm
    `)

P.disengagement_confirm = {
    inactive: "choose disengagement",
    prompt() {
        prompt(`Reaction player could use disengagement ability with some of his units.`)
        button("awaiting")
    },
    awaiting() {
        goto("retro_disengagement")
    },
}

P.commit_offensive_confirm = {
    inactive() {
        if (G.offensive.stage === ATTACK_STAGE) {
            return "confirm offensive"
        } else if (G.offensive.stage === REACTION_STAGE) {
            return "confirm reaction"
        } else if (G.offensive.stage === POST_BATTLE_MOVE) {
            return "confirm post battle move"
        } else {
            return "confirm action"
        }
    },
    prompt() {
        var action = "offensive"
        if (G.offensive.stage === REACTION_STAGE) {
            action = "reaction"
        } else if (G.offensive.stage === POST_BATTLE_STAGE) {
            action = "post battle move"
        }
        if (!L.L.verify_error || globalThis.RTT_FUZZER) {
            prompt(`${offensive_card_header()} Confirm ${action}.`)
            button("next")
        } else {
            prompt(`${offensive_card_header()} Confirm ${action}. ` + L.L.verify_error)
        }
    },
    next() {
        resolve_into_turn_draw(JP)
        resolve_into_turn_draw(AP)
        end()
    },
}

P.end_action = {
    _begin() {
        G.active = G.offensive.attacker
    },
    inactive: "end action",
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
    }
    var event_modifier = trigger_event("before_intelligence_roll")
    if (event_modifier) {
        modifier += event_modifier
    }
    let result = random(10)
    const success = result !== 9 && result + modifier <= card_value
    log(`${dice_get_log_str(result, modifier, 1 - G.offensive.attacker)} <= ${Math.min(card_value, 8)} (${success ? "SUCCESS" : "FAILED"}).`)
    clear_undo()
    return success
}

P.special_reaction = {
    _begin() {
        G.active = 1 - G.offensive.attacker
        const hq_list = []
        for_each_unit_on_map((u, piece) => {
            if (piece.faction === G.active && piece.class === "hq") {
                hq_list.push(G.location[u], piece.cr)
            }
        })
        if (G.offensive.landing_hexes.filter(h => get_map_data(h).named && is_space_controlled(h, G.active)).length) {
            check_supply()
        } else {
            end()
            return
        }
        L.possible_hexes = G.offensive.landing_hexes.filter(h => {
            if (!get_map_data(h).named || !has_zoi(h, G.active || !is_space_controlled(h, G.active))) {
                return false
            }
            for (var i = 1; i < hq_list.length; i += 2) {
                if (get_distance(h, hq_list[i - 1]) <= hq_list[i]
                    && (G.sid !== SOUTH_PACIFIC_SCENARIO || hq_list[i] !== 25 || get_map_data(h).region === "Hebrides")//hack for cpac in south pacific map
                ) {
                    return true
                }
            }
            return false
        })
        if (L.possible_hexes.length <= 0) {
            end()
            return
        }
        if (G.async) {
            L.possible_hexes.slice().forEach(h => this.action_hex(h))
        }
    },
    inactive: "roll to special reaction",
    prompt() {
        prompt(`${offensive_card_header()} Choose hex to roll for special reaction.`)
        button("pass")
        L.possible_hexes.forEach(h => action_hex(h))
    },
    pass() {
        push_undo()
        end()
    },
    action_hex(hex) {
        log(`Special reaction in ${hex_get_log_str(hex)}:`)
        const success = roll_intelligence_dice()
        set_delete(L.possible_hexes, hex)
        if (success) {
            create_battle_hex(hex)
        }
        clear_undo()
        if (L.possible_hexes.length <= 0) {
            end()
        }
    },
}

P.cancel_offensive = {
    _begin() {
        if (G.offensive.offensive_card === CARRIER_RAID && G.offensive.type === EC) {
            end()
            return
        }
        L.cancel = 0
        for_each_card((c, card) => {
            if (card.type === CANCEL && card.could_play()) {
                L.cancel++
            }
        })
        if (!L.cancel || get_hand(G.active).length === 0) {
            end()
            return
        }
    },
    inactive: "react",
    prompt() {
        prompt(`${offensive_card_header()} Cancel offensive.`)
        if (L.reactions_card > 0) {
            button("done")
            return
        }
        get_hand(G.active).filter(c => cards[c].type === CANCEL && cards[c].can_play()).forEach(c => action_card(c))
        button("skip")
    },
    skip() {
        push_undo()
        end()
    },
    card(c) {
        push_undo()
        log("#GCancel offensive")
        if (G.active === AP) {
            end()
            play_event(c)
            return
        }
        L.reactions_card = c
        G.offensive.active_cards.push(c)
    },
    done() {
        var offensive_card = G.offensive.offensive_card
        var reaction_card = L.reactions_card
        var offensive = G.offensive
        var rollback = G.offensive.weather_rollback
        offensive.weather_rollback = []
        restore_state(rollback)
        discard_card(offensive_card)
        remove_card(L.reactions_card)
        clear_undo()
        end()
        G.offensive.offensive_card = reaction_card
        G.offensive.cancelled = offensive
        G.active = JP
        goto("end_action")
        play_event(reaction_card)
        log(`${card_get_log_str(offensive_card)} discarded.`)
        call("default_event")
    }
}

P.define_intelligence_condition = {
    _begin() {
        var no_reaction = G.offensive.battle_hexes.length <= 0 || G.offensive.offensive_card === CARRIER_RAID && G.offensive.type === EC
        if (no_reaction && G.async) {
            end()
            return
        }
        L.rolled = false
        L.card = false
        G.offensive.logistic = cards[G.offensive.offensive_card].ops
        if (!G.async) {
            return;
        }
        var cancel = 0
        for_each_card((c, card) => {
            if ((card.type === INTELLIGENCE || card.type === COUNTER_OFFENSIVE) && card.could_play()) {
                cancel++
            }
        })
        if (!cancel || get_hand(G.active).length === 0) {
            return (G.offensive.type === EC && cards[G.offensive.offensive_card].intelligence) ? (this.skip()) : (this.roll())
        }
    },
    inactive: "react",
    prompt() {
        prompt(`${offensive_card_header()} Change intelligence condition.`)
        if (!G.offensive.battle_hexes.length) {
            button("done")
            return
        }
        if (G.offensive.type === EC && cards[G.offensive.offensive_card].intelligence && !L.card && !L.rolled) {
            button("skip")
        } else if ((G.offensive.type === OC || !cards[G.offensive.offensive_card].intelligence)
            && G.offensive.intelligence === SURPRISE && !L.rolled) {
            button("roll")
        }
        if (G.offensive.offensive_card === CARRIER_RAID && G.offensive.type === EC) {
            return;
        }
        if (!L.rolled) {
            get_hand(G.active).filter(c => {
                var card = cards[c]
                return (card.type === INTELLIGENCE || card.type === COUNTER_OFFENSIVE && G.offensive.counter_offensive_card <= 0)
                    && card.can_play()
            }).forEach(c => action_card(c))
        } else if (get_hand(R).includes(JN_25_SPECIAL)) {
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
        clear_undo()
        log('Change intelligence condition:')
        var success = roll_intelligence_dice()
        if (success) {
            G.offensive.intelligence = INTERCEPT
            log(`#IIntelligence condition changed to ${get_named_intelligence(G.offensive.intelligence)}`)
        }
        L.rolled = 1
        if (success || !get_hand(R).includes(JN_25_SPECIAL)) {
            end()
        }
    }
}

P.attack_reaction_cards = {
    _begin() {
        if (get_hand(G.active).filter(c => cards[c].type === REACTION && cards[c].can_play()).length <= 0) {
            end()
            return
        }
    },
    inactive: "react",
    prompt() {
        var played_cards = G.offensive.active_cards.filter(c => cards[c].faction === R).length
        prompt(`${offensive_card_header()} Play reaction cards.${played_cards >= 3 ? " (No more than 3 reaction cards allowed)." : ""}`)
        if (played_cards < 3) {
            get_hand(G.active).filter(c => cards[c].type === REACTION && cards[c].can_play()).forEach(c => action_card(c))
        }
        button("done")
    },
    done() {
        push_undo()
        resolve_into_turn_draw(AP)
        resolve_into_turn_draw(JP)
        end()
    },
    card(c) {
        push_undo()
        play_event(c)
    }
}

P.apply_attack_reaction = {
    _begin() {
        if (G.offensive.all_bh.length === 0 && G.offensive.stage !== BATTLE_STAGE) {
            end()
            return
        }
        var stage = G.offensive.stage === POST_BATTLE_STAGE ? AFTER_COMBAT : BEFORE_COMBAT
        L.allowed_cards = []
        G.offensive.active_cards.filter(c =>
            (G.offensive.type === EC || c !== G.offensive.offensive_card)
            && cards[c].faction === G.active
            && (cards[c].stage === stage || G.offensive.all_bh.length === 0 && G.offensive.stage === BATTLE_STAGE && cards[c].stage))
            .forEach(c => set_add(L.allowed_cards, c))
        if (L.allowed_cards.length <= 0) {
            end()
            return
        }
        this._resume()
    },
    _resume() {
        if (G.async) {
            while (L.allowed_cards.length) {
                this.card(L.allowed_cards[0])
                if (L.P !== "apply_attack_reaction") {
                    return
                }
            }
        }
        if (!L.allowed_cards.length) {
            this.done()
        }
    },
    inactive: "apply reaction cards",
    prompt() {
        prompt(`${offensive_card_header()} Apply reaction cards.`)
        L.allowed_cards.forEach(c => action_card(c))
        if (L.allowed_cards.length <= 0) {
            button("done")
        }
    },
    done() {
        push_undo()
        end()
    },
    card(c) {
        push_undo()
        set_delete(L.allowed_cards, c)
        if (cards[c].before_battles) {
            cards[c].before_battles()
        }
        if (cards[c].after_battles) {
            cards[c].after_battles()
        }
    }
}

function sum_combat_factor(units, battle_hex = G.offensive.battle.battle_hex) {
    return units.map(u => {
        var piece = pieces[u]
        if (!unit_on_board(u) || !piece.br && battle_hex !== G.location[u]) {
            return 0
        }
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

function get_reduced_status(u, faction) {
    var on_process = map_get(G.offensive.battle.damaged[faction], u, 0)
    if (on_process === 0) {
        return set_has(G.reduced, u) + 0
    }
    return on_process
}

function fill_hit_able_units(faction) {
    var battle = G.offensive.battle
    var enemy_faction = 1 - faction
    L.pool = []
    var total_lf = 0
    var ground_bomb = !battle.ground_stage && battle.air_naval[enemy_faction].length === 0
    var units = ((battle.ground_stage || battle.air_naval[enemy_faction].length === 0)
        ? battle.ground[enemy_faction] : battle.air_naval[enemy_faction])
    units.forEach(u => {
        if (unit_on_board(u) && get_reduced_status(u, faction) <= 2) {
            var piece = pieces[u]
            map_set(L.pool, u, piece.lf)
        }
    })
    trigger_event("before_apply_hits", faction)
    if (ground_bomb && L.pool.length === 2 && get_reduced_status(L.pool[0], faction) > 0) {
        battle.hit_able_units[faction] = []
        return
    }
    var result = []
    var reduced = []
    var has_full_size = 0
    var critical = battle.critical[faction]
    var lower_lf_unit = [100]
    var hit_limit = battle.hits[faction]
    var distant_hits = battle.distant_hits[faction] - battle.distant_hits_list[faction].length > 0
    for (var i = 0; i < L.pool.length; i += 2) {
        var unit = L.pool[i]
        var piece = pieces[unit]
        var base_lf = L.pool[i + 1]
        var loss_factor = battle.ground_stage && set_has(battle.amph_ground, unit) ? Math.ceil(base_lf / 2) : base_lf
        var reduced_status = get_reduced_status(unit, faction)
        var could_be_damaged = (!piece.br || distant_hits || set_has(battle.distant_hits_list[faction], unit)
            || G.location[unit] === battle.battle_hex)
        if (!piece.garrison) {
            total_lf += loss_factor
        }
        if (reduced_status === 0) {
            total_lf += loss_factor
            has_full_size = 1
        }
        if (!could_be_damaged) {
            continue
        }
        if (loss_factor <= hit_limit && (critical || reduced_status === 0 || piece.one_step && battle.ground_stage)) {
            map_set(result, unit, loss_factor)
        } else if (loss_factor <= hit_limit) {
            map_set(reduced, unit, loss_factor)
        } else if (critical && lower_lf_unit[0] === loss_factor) {
            lower_lf_unit.push(unit)
        } else if (critical && lower_lf_unit[0] > loss_factor) {
            lower_lf_unit = [loss_factor, unit]
        }
    }
    if (!result.length && reduced.length && !has_full_size) {
        result = reduced
    }
    if (ground_bomb && hit_limit >= total_lf) {
        battle.ground_disperced = 1
    } else if (result.length <= 0 && critical && lower_lf_unit[0] >= 0 && !battle.damaged[faction].length) {
        for (var i = 1; i < lower_lf_unit.length; i++) {
            map_set(result, lower_lf_unit[i], hit_limit)
        }
        if (faction === G.offensive.attacker) {
            battle.at_crit_only = 1
        }
    }
    if (get_map_data(battle.battle_hex).city > CITY) {
        var garrisons = []
        map_for_each(result, u => {
            if (pieces[u].garrison) {
                garrisons.push(u)
            }
        })
        if (result.length > garrisons.length * 2) {
            garrisons.forEach(u => map_delete(result, u))
        }
    }

    battle.hit_able_units[faction] = result
    battle.total_lf[faction] = total_lf
}


function get_ground_roll_modifiers(faction) {
    var battle = G.offensive.battle
    var result = 0
    var manila_special = G.turn === 1 && (battle.battle_hex === MANILA || battle.battle_hex === SINGAPORE)
    if (faction === G.offensive.attacker && !manila_special) {
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
        if (air[faction] && !air[1 - faction]) {
            result += 2
            log(`+2 Attacker Air support.`)
        }
        if (naval[faction] && !naval[1 - faction]) {
            result += 2
            log(`+2 Attacker Naval support.`)
        }
    }
    if (faction === G.offensive.attacker) {
        var terrain = get_map_data(battle.battle_hex).terrain
        if (terrain === JUNGLE) {
            result -= 1
            log(`-1 Jungle.`)
        } else if (terrain === MIXED) {
            result -= 2
            log(`-2 Mixed terrain.`)
        }
        if (terrain === MOUNTAIN) {
            result -= 3
            log(`-3 Mountains.`)
        }
    }
    if (faction !== G.offensive.attacker && set_has(G.offensive.amp_mod, battle.battle_hex) && battle.amph_ground.filter(u => unit_on_board(u) && set_has(battle.ground[G.offensive.attacker], u)).length) {
        result += 3
        log(`+3 Amphibious assault.`)
    }
    if (faction === AP && G.location[ARMOR_BRIGADE] === battle.battle_hex) {
        result += 1
        log(`+1 Armor brigade.`)
    }
    if (faction === JP && is_event_active(events.NEW_OPERATION_PLAN) && get_map_data(battle.battle_hex).island) {
        result += 1
        log(`+1 Defensive doctrine.`)
    }
    return result
}

function get_naval_roll_modifiers(faction) {
    var battle = G.offensive.battle
    var result = 0
    if (faction === AP && G.offensive.intelligence === AMBUSH) {
        result += 4
        log(`+4 Ambush.`)
    }
    if (faction === G.offensive.attacker && G.offensive.intelligence === SURPRISE) {
        result += 3
        log(`+3 Surprise attack.`)
    }
    var ap_air_superiority = faction === AP && battle.air_naval[AP].filter(
        u => unit_on_board(u) && pieces[u].br && is_us_unit(pieces[u])
    ).length > 0
    if (ap_air_superiority && G.turn >= 8) {
        result += 3
        log(`+3 AP air superiority (1944-1945).`)
    } else if (ap_air_superiority && G.turn >= 5) {
        result += 1
        log(`+1 AP air superiority (1943).`)
    }
    return result
}

function is_col_tsuji_applied(faction) {
    if (!(faction === JP && G.offensive.offensive_card === COL_TSUJI && G.offensive.type === EC
        && G.offensive.battle.ground_stage)) {
        return false
    }
    var map_data = get_map_data(G.offensive.battle.battle_hex)
    return map_data.terrain === JUNGLE || map_data.terrain === MIXED || map_data.region === "Malaya"
}

function prepare_attack(faction) {
    var battle = G.offensive.battle
    var pool = (battle.ground_stage ? battle.ground : battle.air_naval)[faction].filter(u => unit_on_board(u))
    battle.strength[faction] = sum_combat_factor(pool)
    battle.distant_hits[faction] = pool.filter(u => unit_on_board(u) && pieces[u].br).length
}

function get_battle_modifiers(faction) {
    var battle = G.offensive.battle
    battle.roll_modifiers = 0
    if (battle.ground_stage && is_col_tsuji_applied(faction)) {
        battle.roll_modifiers = 4
        log(`+4 Col.Tsuji.`)
    } else if (battle.ground_stage) {
        battle.roll_modifiers = get_ground_roll_modifiers(faction)
    } else {
        battle.roll_modifiers = get_naval_roll_modifiers(faction)
    }
    trigger_event("before_battle_roll", faction)
}

P.execute_attack = function () {
    var faction = L.active
    var enemy_faction = 1 - faction
    var battle = G.offensive.battle
    prepare_attack(faction)
    if (battle.strength[faction] <= 0 || (battle.ground[enemy_faction].length + battle.air_naval[enemy_faction].length) === 0
        || battle.ground_stage && battle.ground[enemy_faction].length === 0) {
        end()
        return
    }
    log(`${side_get_log_str(faction)} fire (${battle.strength[faction]}).`)
    battle.roll[faction] = random(10)
    clear_undo()
    get_battle_modifiers(faction)
    let roll = battle.roll[faction]
    var modififed_roll = roll + battle.roll_modifiers
    var table = battle.ground_stage ? ground_battle_table : naval_battle_table
    battle.hits[faction] = Math.ceil(battle.strength[faction] * (table(modififed_roll)))
    if ((roll === 9 || battle.roll_modifiers + roll >= 9 && G.offensive.active_cards.includes(ROCHEFORT)) && !battle.ground_stage) {
        battle.critical[faction] = true
    }
    log(`${dice_get_log_str(roll, battle.roll_modifiers, faction)} (${table(modififed_roll)}) x ${battle.strength[faction]} = ${battle.hits[faction]}${battle.critical[faction] ? " (critical!)" : ""}.`)
    fill_hit_able_units(faction)
    end()
}

P.choose_battle = {
    _begin() {
        G.offensive.battle = {}
        G.active = G.offensive.attacker
        if (G.async) {
            this.select_first()
        }
    },
    select_first() {
        for (var i = 0; i < G.offensive.battle_names.length; i++) {
            if (set_has(G.offensive.battle_hexes, G.offensive.battle_names[i])) {
                this.action_hex(G.offensive.battle_names[i])
                return
            }
        }
    },
    inactive: "choose battle hex",
    prompt() {
        prompt(`Choose battle hex.`)
        G.offensive.battle_hexes.forEach(b => {
            action_hex(b)
        })
    },
    action_hex(hex) {
        set_delete(G.offensive.battle_hexes, hex)
        log(`%${G.offensive.attacker === JP ? "J" : "A"}Battle hex ${String.fromCharCode(65 + G.offensive.battle_names.indexOf(hex))} (${hex_get_log_str(hex)})`)
        G.offensive.battle = {
            battle_hex: hex,
        }
        end()
    },
}

P.assign_hits = script(`
      if (G.offensive.battle.ground_disperced) {
        call ground_bombardment
      }
      if (G.offensive.battle.at_crit_only && G.offensive.battle.hit_able_units[G.offensive.attacker].length > 2) {
        call assign_crit
      }
      call apply_hits
      if (G.offensive.battle.jp_cv_damaged){
        call jp_cv_reassign
      }
      `)

function battle_header() {
    return `${G.offensive.battle.ground_stage ? "Ground" : "Air Naval"} combat ${hex_get_log_str(G.offensive.battle.battle_hex)}.`
}

P.apply_hits = {
    _begin() {
        var battle = G.offensive.battle
        if (battle.hit_able_units[0].length && !battle.hit_able_units[1].length) {
            G.active = 0
        } else if (battle.hit_able_units[1].length && !battle.hit_able_units[0].length) {
            G.active = 1
        } else if (battle.hit_able_units[0].length && battle.hit_able_units[1].length) {
            G.active = [0, 1]
        } else {
            end()
            return
        }
        L.dmg_list = [[], []]
        L.done = [!battle.hit_able_units[0].length, !battle.hit_able_units[1].length]
        if (G.async) {
            this.try_to_assign(JP)
            this.try_to_assign(AP)
        }
    },
    try_to_assign(faction) {
        if (!G.offensive.battle.hit_able_units[faction].length) {
            return
        }
        R = faction
        var hits = G.offensive.battle.hits[R]
        var could_eliminate_all = hits >= G.offensive.battle.total_lf[R]
        var battle = G.offensive.battle
        while (battle.hit_able_units[R].length && (could_eliminate_all || battle.hit_able_units[R].length === 1)) {
            this.unit(battle.hit_able_units[R][0])
        }
        if (!battle.hit_able_units[R].length) {
            this.done()
        }
    },
    inactive: "apply hits",
    prompt() {
        map_for_each(G.offensive.battle.hit_able_units[R], u => action_unit(u))
        button("undo", L.dmg_list[R].length)
        if (!G.offensive.battle.hit_able_units[R].length) {
            button("done")
            prompt(`${battle_header()} Assign hits. Remaining: ${Math.max(G.offensive.battle.hits[R], 0)}.`)
        } else {
            prompt(`${battle_header()} Assign hits. ${G.offensive.battle.hits[R]}`)
        }
    },
    undo() {
        var battle = G.offensive.battle
        var lf = L.dmg_list[R].pop()
        var unit = L.dmg_list[R].pop()
        var status = map_get(G.offensive.battle.damaged[R], unit, -1)
        if (status >= 4) {
            map_set(G.offensive.battle.damaged[R], unit, 2)
        } else {
            map_delete(G.offensive.battle.damaged[R], unit)
            set_delete(battle.distant_hits_list[R], unit)
        }
        battle.hits[R] += lf
        fill_hit_able_units(R)
    },
    unit(unit) {
        var piece = pieces[unit]
        var battle = G.offensive.battle
        var status = map_get(battle.damaged[R], unit, -1)
        if (status < 0) {
            status = set_has(G.reduced, unit) ? 1 : 0
        }
        status += 2
        map_set(battle.damaged[R], unit, status)
        var lf = map_get(G.offensive.battle.hit_able_units[R], unit)
        battle.hits[R] -= lf
        L.dmg_list[R].push(unit)
        L.dmg_list[R].push(lf)
        if (G.location[unit] !== battle.battle_hex && piece.br) {
            set_add(battle.distant_hits_list[R], unit)
        }
        fill_hit_able_units(R)
    },
    done() {
        L.done[R] = true
        if (!L.done[1 - R]) {
            G.active = 1 - R
        } else {
            apply_loss()
            end()
        }
    }
}

P.jp_cv_reassign = {
    _begin() {
        L.allowed_hexes = []
        G.offensive.battle.jp_cv_damaged = 0
        L.to_repair = []
        map_for_each(G.offensive.battle.damaged[1 - JP], (u, d) => {
            if (is_cv_unit(pieces[u])) {
                map_set(L.to_repair, u, d)
            }
        })
        L.to_damage = G.offensive.battle.air_naval[JP].filter(u => is_cv_unit(pieces[u]) && unit_on_board(u))
        if (L.to_repair.length === 0 || L.to_damage.length === 0 || G.offensive.battle.critical[AP] ||
            L.to_damage.length === 1 && L.to_repair.length === 2 && L.to_repair[0] === L.to_damage[0]) {
            end()
            return;
        } else {
            log("Japanese naval aircraft range advantage:")
            G.active = JP
            L.stage = 0
            L.hits = 0
        }
    },
    inactive: "use range advantage",
    prompt() {
        if (L.stage === 0) {
            prompt(`Japanese naval aircraft range advantage. Choose units to damage. Chosen: ${L.hits}`)
            L.to_damage.filter(u => L.to_repair.length > 2 || !map_has(L.to_repair, u)).forEach(u => action_unit(u))
            if (L.hits > 0) {
                button("next")
            } else {
                button("skip")
            }

        } else {
            prompt(`Japanese naval aircraft range advantage. Choose units to repair. Chosen: ${L.hits}`)
            if (L.hits === 0) {
                button("done")
            } else {
                for (var i = 0; i < L.to_repair.length; i += 2) {
                    action_unit(L.to_repair[i])
                }
            }
        }
    },
    unit(u) {
        push_undo()
        if (L.stage === 0) {
            L.hits += 1
            map_delete(L.to_repair, u)
            if (set_has(G.reduced, u)) {
                eliminate(u)
                set_delete(L.to_damage, u)
            } else {
                damage_unit(u)
            }
            if (L.hits >= Math.min(get_hits_count(L.to_repair), L.to_damage.map(u => set_has(G.reduced, u) ? 1 : 2).reduce((a, b) => a + b, 0))) {
                L.stage = 1
            }
        } else {
            L.hits -= 1
            if (unit_on_board(u)) {
                set_delete(G.reduced, u)
                map_delete(L.to_repair, u)
                log(`${piece_get_log_str(u)} flipped to full size.`)
            } else {
                var location = G.offensive.battle.battle_hex
                var path = map_get(G.offensive.paths, u)
                if (path) {
                    location = path[path.length - 1]
                }
                set_location(u, location)
                set_add(G.reduced, u)
                G.active_stack = []
                if (map_get(L.to_repair, u, 3) === 3) {
                    map_delete(L.to_repair, u)
                }
            }
        }
    },
    done() {
        push_undo()
        end()
    },
    skip() {
        push_undo()
        end()
    },
    next() {
        push_undo()
        L.stage = 1
    }
}

P.ground_bombardment = {
    _begin() {
        G.active = (1 - G.offensive.attacker)
        var battle = G.offensive.battle
        battle.hit_able_units = [[], []]
        var faction = battle.air_naval[G.offensive.attacker].length ? (1 - G.offensive.attacker) : G.offensive.attacker
        L.allowed_units = battle.ground[faction].filter(u => unit_on_board(u))
        L.garrison_present = L.allowed_units.filter(u => pieces[u].garrison).length
        if (L.allowed_units.length === 1 || L.allowed_units.filter(u => pieces[u].garrison).length) {
            G.active = G.offensive.attacker
        }
        if (L.allowed_units.length === 1 && set_has(G.reduced, L.allowed_units[0])) {
            end()
            return
        }
        while (G.async && (L.garrison_present || L.allowed_units.length === 1)) {
            this.unit(L.allowed_units[0])
        }
        if (!L.allowed_units.length) {
            this.done()
        }
    },
    inactive: "assign hits (the Reaction player chooses which reduced unit will be the last ground step)",
    prompt() {
        var no_gar = L.allowed_units.filter(u => !pieces[u].garrison)
        if (no_gar.length) {
            no_gar.forEach(u => action_unit(u))
        } else {
            L.allowed_units.forEach(u => action_unit(u))
        }

        prompt(`Assign hits. (One step should survive).`)
        if (!L.allowed_units.length) {
            button("done")
        }
    },
    unit(unit) {
        push_undo()
        damage_unit(unit)
        if (!unit_on_board(unit)) {
            set_delete(L.allowed_units, unit)
            L.garrison_present = L.allowed_units.filter(u => pieces[u].garrison).length
        }
        if (L.allowed_units.length === 1 && set_has(G.reduced, L.allowed_units[0])) {
            L.allowed_units = []
        }
    },
    done() {
        push_undo()
        end()
    }
}

P.assign_crit = {
    _begin() {
        G.active = (1 - G.offensive.attacker)
    },
    inactive: "choose unit reduced by critical hit (in case of ties, Reaction players choice)",
    prompt() {
        map_for_each(G.offensive.battle.hit_able_units[G.offensive.attacker], u => action_unit(u))
        prompt(`Choose one step applied by critical hit.`)
        if (!G.offensive.battle.hit_able_units[G.offensive.attacker].length) {
            button("done")
        }
    },
    unit(unit) {
        push_undo()
        damage_unit(unit)
        G.offensive.battle.hit_able_units[G.offensive.attacker] = []
    },
    done() {
        push_undo()
        end()
    }
}

function is_cv_unit(piece) {
    return piece.br && piece.class === "naval"
}

function apply_loss() {
    var battle = G.offensive.battle
    var dmg_map = []
    map_for_each(L.dmg_list[0], (u, l) => map_set(dmg_map, u, l))
    map_for_each(L.dmg_list[1], (u, l) => map_set(dmg_map, u, l))
    var d = []
    if (L.dmg_list[0].length) {
        d = battle.damaged[0]
    }
    if (L.dmg_list[1].length) {
        d = d.concat(battle.damaged[1])
    }
    for (var i = 1; i < d.length; i += 2) {
        var unit = d[i - 1]
        var step = (d[i] === 4) ? 2 : 1
        if (d[i] > 2) {
            eliminate(unit, true)
        } else {
            reduce_unit(unit, true)
        }
        var dmg = map_get(dmg_map, unit, 0)
        log(`${piece_get_log_str(unit)} ${d[i] > 2 ? "eliminated" : "reduced"} (${step}${dmg ? " x " + dmg : " step"}).`)
        var piece = pieces[unit]
        if (piece.faction === JP && is_cv_unit(piece)) {
            battle.jp_cv_damaged = 1
        }
    }
    check_us_casualties()
    if (battle.damaged[0].length && battle.damaged[1].length) {
        clear_undo()
    }
}

P.apply_naval_winner = function () {
    var battle = G.offensive.battle
    var battle_takes_place = battle.air_naval[JP].length && (battle.air_naval[AP].length || battle.ground[AP].length)
        || battle.air_naval[AP].length && (battle.air_naval[JP].length || battle.ground[JP].length)
    if (!battle_takes_place) {
        end()
        return
    }
    var attacker_units = battle.air_naval[G.offensive.attacker].filter(u => unit_on_board(u))
    var defender_units = battle.air_naval[1 - G.offensive.attacker].filter(u => unit_on_board(u))
    var attacker_power = sum_combat_factor(attacker_units)
    var defender_power = sum_combat_factor(defender_units)

    var air_cover = attacker_units.filter(u => pieces[u].br).length || !defender_units.filter(u => pieces[u].br).length
    var attacker_win = attacker_power > defender_power && air_cover || defender_power === 0
    if (battle.amph_ground.length) {
        log(`${attacker_win ? "Attacker" : "Defender"} won battle (${attacker_power} - ${defender_power}) ${!air_cover ? "no attacker CV or air" : ""}.`)
    }
    if (!attacker_win) {
        battle.amph_ground.forEach(u => {
            set_delete(battle.ground[G.offensive.attacker], u)
            set_add(G.offensive.ground_pbm, u)
        })
        if (battle.amph_ground.length) {
            log(`${list_get_log_str(battle.amph_ground.length + " units", battle.amph_ground.map(u => piece_get_log_str(u)))} could not participate ground combat.`)
        }
    }
    end()
}

P.broken_aa = {
    _begin() {
        var battle = G.offensive.battle
        L.allowed_units = battle.amph_ground.filter(u => unit_on_board(u))
        var attacker_navy = []
        var defender_navy = []
        for_each_unit_on_map((u, piece, location) => {
            if (location !== battle.battle_hex || piece.class !== "naval") {
                return
            }
            if (piece.faction === G.offensive.attacker) {
                set_add(attacker_navy, u)
            } else {
                set_add(defender_navy, u)
            }
        })
        if (defender_navy.length <= 0 || attacker_navy.length > 0 || L.allowed_units.length === 0) {
            end()
            return
        }
        L.allowed_units.forEach(u => {
            set_delete(battle.ground[G.offensive.attacker], u)
            set_add(G.offensive.ground_pbm, u)
        })
        log("Amphibious Assault failed due to lack of naval escort.")
        if (G.async) {
            L.allowed_units.forEach(u => this.unit(u))
            this.done()
        }
    },
    inactive: "amphibiously assaulting units are turned back",
    prompt() {
        L.allowed_units.forEach(u => action_unit(u))
        prompt(`Amphibious Assault failed. Apply losses.`)
        if (!L.allowed_units.length) {
            button("done")
        }
    },
    unit(unit) {
        push_undo()
        damage_unit(unit)
        set_delete(L.allowed_units, unit)
    },
    done() {
        push_undo()
        end()
    }
}

P.broken_organic = {
    _begin() {
        L.allowed_units = []
        for (var i = 0; i < G.offensive.organic.length; i += 2) {
            var nav = G.offensive.organic[i]
            var gr = G.offensive.organic[i + 1]
            if (!unit_on_board(nav)) {
                set_add(L.allowed_units, gr)
            }
        }
        if (L.allowed_units.length === 0 || G.offensive.attacker === AP) {
            end()
            return
        }
        log(`Losses due to lost organic transport unit:`)
    },
    inactive: "organic transport units eliminated",
    prompt() {
        L.allowed_units.forEach(u => action_unit(u))
        prompt(`Remove units that lost organic transport.`)
        if (!L.allowed_units.length) {
            button("done")
        }
    },
    unit(unit) {
        push_undo()
        eliminate(unit)
        set_delete(L.allowed_units, unit)
    },
    done() {
        push_undo()
        end()
    }
}

function get_hits_count(d) {
    var result = 0
    for (var i = 0; i < d.length; i += 2) {
        if (d[i + 1] >= 4) {
            result += 2
        } else {
            result++
        }
    }
    return result
}

P.apply_ground_winner = function () {
    if (get_map_data(G.offensive.battle.battle_hex).city > CITY) {
        reset_garrison()
    }
    var battle = G.offensive.battle
    battle.amph_ground.forEach(u => map_get(G.offensive.paths, u, [0])[0] -= AMPH_MOVE)
    if (battle.ground[G.offensive.attacker].length === 0) {
        end()
        return
    }
    var attacker_win = get_hits_count(battle.damaged[G.offensive.attacker]) > get_hits_count(battle.damaged[1 - G.offensive.attacker]) ||
        !battle.ground[1 - G.offensive.attacker].filter(unit_on_board).length
    if (!battle.ground[G.offensive.attacker].filter(unit_on_board).length) {
        attacker_win = 0
    }
    log(`${attacker_win ? "Attacker" : "Defender"} won in ground combat ${hex_get_log_str(battle.battle_hex)}.`)
    battle.winner = (attacker_win == G.offensive.attacker) + 0
    if (attacker_win) {
        capture_hex(battle.battle_hex, G.offensive.attacker)
    }
    battle.ground[attacker_win ? (1 - G.offensive.attacker) : G.offensive.attacker].forEach(u => {
        if (!unit_on_board(u)) {
            return

        }
        if (set_has(G.offensive.battle.amph_ground, u)) {
            set_add(G.offensive.ground_pbm, u)
        } else {
            set_add(G.offensive.retreat, u)
        }
    })
    end()
}

function check_us_casualties() {
    var battle = G.offensive.battle
    if (G.offensive.attacker === JP || !battle.ground_stage) {
        return
    }
    var survived_attacker_ground = battle.ground[AP].filter(u => G.location[u] <= LAST_BOARD_HEX).length
    var div_corp_size_unit = !survived_attacker_ground && battle.ground[AP].filter(u => {
        var piece = pieces[u]
        return piece.faction === AP && piece.class === "ground" && (piece.service === "army" || piece.service === "navy") && piece.size > 1
    }).length
    if (!survived_attacker_ground && div_corp_size_unit) {
        check_event(events.US_CASUALTIES)
        if (G.sid === SOUTH_PACIFIC_SCENARIO) {
            G.events[events.US_CASUALTIES.id] = 0
        }
    }
}

function prepare_battle() {
    var hex = G.offensive.battle.battle_hex
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
        distant_hits: [0, 0],
        distant_hits_list: [[], []],
        critical: [false, false],
        damaged: [[], []],
        total_lf: [],
    }
    var battle = G.offensive.battle
    var attacker = G.offensive.attacker
    for_each_unit_on_map((u, piece) => {
        var location = G.location[u]
        if (location === hex && (piece.class === "air" || piece.class === "naval")) {
            set_add(battle.air_naval[piece.faction], u)
        } else if (location === hex && piece.class === "ground") {
            set_add(battle.ground[piece.faction], u)
            if (attacker === piece.faction && map_get(G.offensive.paths, u)[0] & AMPH_MOVE) {
                set_add(battle.amph_ground, u)
            }
        }
    })
    map_for_each(G.offensive.committed, (u, h) => {
        const piece = pieces[u]
        if (unit_on_board(u) && h === hex) {
            set_add(battle.air_naval[piece.faction], u)
        } else {
            set_delete(battle.air_naval[piece.faction], u)
            set_delete(battle.ground[piece.faction], u)
        }
    })
    get_garrison(hex).forEach(u => {
        G.location[u] = hex
        set_add(G.reduced, u)
        set_add(battle.ground[JP], u)
    })
    log(`Attacker: ${log_in_battle_units(attacker)}.`)
    log(`Defender: ${log_in_battle_units(1 - attacker)}.`)
    if (battle.air_naval[JP].length && (battle.air_naval[AP].length || battle.ground[AP].length)
        || battle.air_naval[AP].length && (battle.air_naval[JP].length || battle.ground[JP].length)) {
        log(`Air Naval combat:`)
    }
}

function log_in_battle_units(faction) {
    var att = [...G.offensive.battle.air_naval[faction], ...G.offensive.battle.ground[faction]]
    if (!att.length) {
        return "no units"
    }
    return list_get_log_str(att.length + " units", att.map(u => set_has(G.reduced, u) ? `(${piece_get_log_str(u)})` : piece_get_log_str(u)))
}

function get_garrison(hex) {
    if (is_space_controlled(hex, JP) && get_map_data(hex).city === JAPANESE_CITY && !set_has(G.garr_elim, hex)) {
        return [JP_GARRISON_JP]
    } else if (is_space_controlled(hex, JP) && get_map_data(hex).city === CHINESE_CITY) {
        var count = get_garrison_count()
        var result = []
        for (var i = 0; i < count; i++) {
            set_add(result, JP_GARRISON_CN[i])
        }
        return result
    }
    return []
}

P.prepare_battle = function () {
    prepare_battle()
    end()
}

function prepare_ground_battle() {
    var battle = G.offensive.battle
    G.offensive.battle = {
        battle_hex: battle.battle_hex,
        ground_stage: true,
        air_naval: battle.air_naval,
        ground: battle.ground,
        amph_ground: battle.amph_ground,
        strength: [0, 0],
        hits: [0, 0],
        roll: [-1, -1],
        hit_able_units: [[], []],
        distant_hits: [0, 0],
        distant_hits_list: [[], []],
        critical: [false, false],
        damaged: [[], []],
        winner: 1 - G.offensive.attacker,
        total_lf: [0, 0],
    }
    battle = G.offensive.battle
    var hex = battle.battle_hex
    if (battle.ground[G.offensive.attacker].filter(u => unit_on_board(u)).length && battle.ground[1 - G.offensive.attacker].filter(u => unit_on_board(u)).length) {
        log(`Ground combat:`)
    }

}

P.prepare_ground_battle = function () {
    prepare_ground_battle()
    end()
}

function reset_garrison() {
    set_delete(G.reduced, JP_GARRISON_JP)
    G.location[JP_GARRISON_JP] = NON_PLACED_BOX
    JP_GARRISON_CN.forEach(u => {
        set_delete(G.reduced, u)
        G.location[u] = NON_PLACED_BOX
    })
}

P.retreat = {
    _begin() {
        G.active = G.offensive.attacker
        L.unit_to_retreat = G.offensive.retreat.slice()
        L.hex_to_retreat = []
        if (!L.unit_to_retreat.length) {
            end()
            return
        }
    },
    inactive: "perform retreats",
    prompt() {
        if (G.active_stack.length) {
            prompt(`${offensive_card_header()} Choose space to retreat.`)
            L.hex_to_retreat.forEach(u => action_hex(u))
            if (!L.hex_to_retreat.length) {
                button("eliminate")
            }
        } else if (L.unit_to_retreat.length) {
            prompt(`${offensive_card_header()} Choose unit to retreat.`)
            L.unit_to_retreat.forEach(u => action_unit(u))
        } else {
            prompt(`${offensive_card_header()} Confirm retreat.`)
            button("done")
        }
    },
    eliminate() {
        push_undo()
        log(`No retreat possible.`)
        eliminate(G.active_stack[0])
        G.active_stack = []
    },
    action_hex(hex) {
        if (ground_move_denied(hex)) {
            log(`${pieces[G.active_stack[0]]} retreat to restricted area`)
            eliminate(G.active_stack[0])
        } else {
            set_location(G.active_stack[0], hex, true)
            log(`${piece_get_log_str(G.active_stack[0])} retreat to ${hex_get_log_str(hex)}.`)
            capture_hex(hex, pieces[G.active_stack[0]].faction)
            if (set_has(G.offensive.battle_hexes, hex)) {
                map_set(G.offensive.committed, G.active_stack[0], G.offensive.battle.battle_hex)
            }
        }
        G.active_stack = []
    },
    unit(u) {
        push_undo()
        G.active_stack = [u]
        set_delete(L.unit_to_retreat, u)
        select_retreat_hex()
    },
    done() {
        push_undo()
        end()
    }
}

function select_retreat_hex() {
    L.hex_to_retreat = []
    var u = G.active_stack[0]
    var location = G.location[u]
    if (pieces[u].faction === G.offensive.attacker) {
        var path = map_get(G.offensive.paths, u)
        L.hex_to_retreat = [path[path.length - 2]]
        if (is_faction_units(L.hex_to_retreat, 1 - G.offensive.attacker)) {
            L.hex_to_retreat = []
        }
        return
    }
    var just_entered = []
    map_for_each(G.offensive.paths, (au, path) => {
        var piece = pieces[au]
        if (piece.faction === G.offensive.attacker && piece.class === "ground" && G.location[au] === location
            && path[0] & GROUND_MOVE) {
            set_add(just_entered, path[path.length - 2])
        }
    })
    var able = []
    var nh = get_near_hexes(location)
    for (var i = 0; i < nh.length; i++) {
        var h = nh[i]
        if (h < 0 || h > LAST_BOARD_HEX || set_has(just_entered, h) || is_overstack(h, G.active_stack[0])
            || is_faction_units(h, G.offensive.attacker) || get_ground_move_cost(location, h, JP) >= 100
            || ground_move_denied(h)) {
            continue
        } else {
            set_add(able, h)
        }
    }
    L.hex_to_retreat = able.filter(h => MAP_DATA[h].named && is_space_controlled(h, 1 - G.offensive.attacker))
    if (L.hex_to_retreat.length === 0) {
        L.hex_to_retreat = able
    }
}

function get_emergency_retreat_hexes(unit) {
    var piece = pieces[unit]
    var range = piece.class === "air" ? piece.ebr : 10
    var result = []
    for_each_hex_in_range(G.location[unit], range, h => {
        if (is_space_controlled(h, piece.faction) && (get_map_data(h).port && piece.class === "naval"
            || get_map_data(h).airfield && piece.class === "air" && h !== AIR_FERRY)) {
            set_add(result, h)
        }
    })
    return result
}

P.emergency_move = {
    _begin() {
        var hq_disp = 0
        L.hex_to_retreat = []
        L.unit_to_retreat = L.unit_to_retreat ? L.unit_to_retreat : []
        for_each_unit_on_map((u, piece, location) => {
            if (piece.faction !== G.active
                || is_space_controlled(location, G.active) && (piece.class === "air" && get_map_data(location).airfield || get_map_data(location).port)
                || piece.class === "ground") {
                return
            }
            if (piece.class === "hq") {
                eliminate(u)
                hq_disp++
            } else {
                set_add(L.unit_to_retreat, u)
            }
        })
        if (scenario_data().id === SOUTH_PACIFIC_SCENARIO && check_sudden_death()) {
            return
        }

        if (!L.unit_to_retreat.length) {
            goto("check_overstacking")
        } else {
            log("#GEmergency move:")
        }
    },
    inactive: "execute emergency move",
    prompt() {
        if (G.active_stack.length) {
            prompt(`Choose space to move.`)
            L.hex_to_retreat.forEach(u => action_hex(u))
            if (!L.hex_to_retreat.length) {
                button("eliminate")
            } else if (set_has(L.hex_to_retreat, G.location[G.active_stack[0]])) {
                button("no_move")
            }
        } else if (L.unit_to_retreat.length) {
            prompt(`Choose unit to emergency move.`)
            L.unit_to_retreat.forEach(u => action_unit(u))
            if (L.unit_to_retreat.filter(u => !is_space_controlled(G.location[u], pieces[u].faction)).length <= 0) {
                button("done")
            }
        } else {
            prompt(`Confirm emergency move.`)
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
        set_location(G.active_stack[0], hex)
        G.active_stack = []
    },
    no_move() {
        push_undo()
        G.active_stack = []
    },
    done() {
        push_undo()
        goto("check_overstacking")
    }
}

function capture_landing_hexes() {
    G.offensive.active_units[G.offensive.attacker].forEach(u => {
        var piece = pieces[u]
        var location = G.location[u]
        if (piece.class === "ground" && !set_has(G.offensive.all_bh, location)) {
            capture_hex(location, G.offensive.attacker)
        }
    })
    map_for_each(G.offensive.paths, (u, path) => {
        if (!set_has(G.offensive.all_bh, G.location[u]) && path[0] & AMPH_MOVE) {
            path[0] -= AMPH_MOVE
        }
    })
    G.offensive.landing_hexes = []
}
