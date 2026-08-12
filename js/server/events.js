
/* EVENTS */

function filter_activation_units(condition, faction) {
    if (G.active !== faction) {
        return
    }
    L.possible_units = L.possible_units.filter(u => condition(u, pieces[u]))
}

function could_play(card) {
    var faction = card.faction
    return get_hand(faction).length && !set_has(G.discard[faction], card.c) && !set_has(G.removed[faction], card.c) && scenario_data().has_card(card.c) && G.active === faction && card.can_play()
}

function trigger_event(stage, arg) {
    var result = null
    if (G.offensive.type === EC && G.offensive.offensive_card > 0 && cards[G.offensive.offensive_card][stage]) {
        result = cards[G.offensive.offensive_card][stage](arg)
    }
    G.offensive.active_cards.forEach(c => {
        if (c !== G.offensive.offensive_card && cards[c][stage]) {
            if (result) {
                result += cards[c][stage](arg)
            } else {
                result = cards[c][stage](arg)
            }

        }
    })
    if (scenario_data()[stage]) {
        if (result) {
            result += scenario_data()[stage](arg)
        } else {
            result = scenario_data()[stage](arg)
        }
    }
    return result
}

function only_one_ground_unit(card) {
    var faction = cards[card].faction
    cards[card].after_unit_activation = function () {
        if (G.active !== faction || G.offensive.active_units[R].filter(u => pieces[u].class === "ground").length <= 0) {
            return
        }
        L.allowed_units = L.allowed_units.filter(u => pieces[u].class !== "ground")
    }
}

cards[find_card(JP, 1)].before_apply_hits = function (faction) {
    if (faction === AP) {
        return
    }
    for (var i = 0; i < L.pool.length; i += 2) {
        L.pool[i + 1] = Math.ceil(L.pool[i + 1] / 2)
    }
}

cards[find_card(JP, 2)].before_unit_activation = function () {
    if (G.active !== JP) {
        return
    }
    var op_z_used = [find_piece("akagi"), find_piece("soryu"), find_piece("shokaku"), find_piece("hiei")]
    L.hq_bonus = 6
    L.possible_units = []
    for_each_unit_on_map((u, piece) => {
        if (piece.faction === JP && !op_z_used.includes(u) && piece.class !== "hq") {
            set_add(L.possible_units, u)
        }
    })
    G.offensive.aa_hexes = []
    for_each_hex_in_range(TOKYO, 16, h => {
        if (get_map_data(h).port && is_space_controlled(h, JP)) {
            mark_hexes_in_move_range(h, 5)
        }
    })
}

cards[find_card(JP, 2)].after_unit_activation = function () {
    L.hq_bonus = 6
}

function mark_hexes_in_move_range(hex, range) {
    const location = hex
    const queue = [location]
    const distance_map = [location, 0]
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
                || distance >= map_get(distance_map, nh, [100])) {
                continue
            }
            if (distance < range) {
                queue.push(nh)
            }
            map_set(distance_map, nh, distance)
            if (get_map_data(nh).terrain > OCEAN) {
                set_add(G.offensive.aa_hexes, nh)
            }
        }
    }
}

cards[find_card(JP, 2)].before_unit_move = function () {
    if (G.active !== JP) {
        return
    }
    if (L.move_data.is_ground_present && !L.move_data.is_naval_present) {
        map_delete(L.allowed_hexes, SINGAPORE)
        map_delete(L.allowed_hexes, MANILA)
    }
    var cache = L.allowed_hexes
    if (L.move_data.is_ground_present) {
        L.allowed_hexes = []
        for (var i = 0; i < cache.length; i += 2) {
            if (!(cache[i + 1][0] & AMPH_MOVE) || set_has(G.offensive.aa_hexes, cache[i])) {
                map_set(L.allowed_hexes, cache[i], cache[i + 1])
            }
        }
    }
}

cards[find_card(JP, 2)].after_unit_move = function () {
    var hex = G.location[L.active[0]]
    if (G.active === JP && (hex === MANILA || hex === SINGAPORE)) {
        call("coastal_artillery")
    }
}

P.coastal_artillery = {
    _begin() {
        L.allowed_units = []
        var ground = []
        L.allowed_units = []
        L.L.active.forEach(u => {
            var piece = pieces[u]
            if (piece.class === "naval") {
                set_add(L.allowed_units, u)
            } else if (piece.class === "ground") {
                ground.push(u)
            }
        })
        if (L.allowed_units.length === 0 || ground.length <= 0) {
            end()
        }
    },
    inactive: "apply coastal artillery damage",
    prompt() {
        prompt(`Coastal artillery and mines. Reduce one naval unit.`)
        L.allowed_units.forEach(u => action_unit(u))
    },
    unit(u) {
        push_undo()
        log(`${piece_get_log_str(u)} hit by coastal defence.`)
        damage_unit(u)
        end()
    }
}

P.conquest_of_se_asia_reaction = {
    _begin() {
        G.active = AP
        L.allowed_units = []
        L.manila_coastal_hexes = []
        G.offensive.active_units[JP].forEach(u => {
            var piece = pieces[u]
            var location = get_map_data(G.location[u])
            if (piece.class === "naval" && location.region === "Malaya") {
                set_add(L.manila_coastal_hexes, G.location[u])
            }
        })
        if (L.manila_coastal_hexes.length > 1 || L.manila_coastal_hexes.length === 1 && L.manila_coastal_hexes[0] !== SINGAPORE) {
            set_add(L.allowed_units, find_piece("forcez"))
        }
        for_each_unit_on_map((u, piece, location) => {
            if (piece.faction === AP && !set_has(G.offensive.battle_hexes, location)
                && piece.br && G.offensive.battle_hexes.filter(bh => get_distance(bh, location) <= piece.br).length > 0) {
                set_add(L.allowed_units, u)
            }
        })
    },
    inactive: "react",
    prompt() {
        if (G.active_stack.length <= 0) {
            prompt(`${offensive_card_header()} Choose unit to reaction.`)
            L.allowed_units.forEach(u => action_unit(u))
            if (L.allowed_units.length <= 0) {
                button("done")
            }
        } else {
            prompt(`${offensive_card_header()} Choose hex to reaction.`)
            L.allowed_hexes.forEach(u => action_hex(u))
        }
    },
    done() {
        push_undo()
        end()
    },
    unit(u) {
        push_undo()
        set_add(G.active_stack, u)
        set_delete(L.allowed_units, u)
        if (u === find_piece("forcez")) {
            L.allowed_hexes = L.manila_coastal_hexes
        } else {
            var location = G.location[u]
            var range = pieces[u].br
            L.allowed_hexes = G.offensive.battle_hexes.filter(bh => get_distance(bh, location) <= range)
        }
    },
    action_hex(h) {
        if (G.active_stack.includes(find_piece("forcez"))) {
            set_location(find_piece("forcez"), h)
            create_battle_hex(h)
        } else {
            commit_to_attack(G.active_stack[0], h)
        }
        G.active_stack = []
    }
}

cards[COL_TSUJI].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class === "ground", JP)
}

cards[JN_25_SPECIAL].can_play = function () {
    return G.offensive.active_cards.filter(c => cards[c].type === INTELLIGENCE && cards[c].faction === JP).length <= 0
}

cards[find_card(JP, 5)].event = function () {
    call("replacement_segment", {replacement_points: [undefined, 2]})
}

cards[find_card(JP, 6)].can_play = function () {
    return set_has(G.removed[AP], DOOLITLE_RAID)
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
        if (piece.service === "br" && piece.class === "naval" || piece.id === "kent") {
            any_com_unit = true
        }
    })
    if (any_com_unit) {
        G.offensive.battle.roll_modifiers += 1
        log(`+1 Operation C.`)
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
    if (G.offensive.battle_hexes.filter(h => !get_map_data(h).island).length) {
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
        log(`+4 JP superior information security.`)
        return 4
    }
}

only_one_ground_unit(find_card(JP, 14))

cards[find_card(JP, 14)].before_apply_hits = function (faction) {
    if (faction === JP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    for (var i = 0; i < L.pool.length; i += 2) {
        var piece = pieces[L.pool[i]]
        if (piece.type === "cv") {
            L.pool[i + 1] += 2
            modifier++
        }
    }
}

cards[find_card(JP, 15)].event = function () {
    degrade_india()
    G.events[events.INDEPENDENCE_CAMPAIGN.id]++
}

cards[find_card(JP, 16)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", JP)
}

cards[find_card(JP, 17)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "ground" && (piece.class !== "naval" || !piece.br), JP)
}

cards[find_card(JP, 17)].after_unit_activation = function (u) {
    if (G.active !== JP) {
        return
    }
    var service = null
    G.offensive.active_units[R].forEach(u => service = pieces[u].class)

    L.allowed_units = L.allowed_units.filter(u => {
        var p_service = pieces[u].class
        return (service === null || p_service === service) && p_service !== "ground"
    })
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
        log(`+${modifier} attack strength (Night Fighting Advantage).`)
    }
}

cards[find_card(JP, 18)].can_play = function () {
    return events.KWAI_RIVER_BRIDGE.keys.filter(h => is_space_controlled(h, JP)).length >= 2
}

cards[find_card(JP, 18)].event = function () {
    check_event(events.KWAI_RIVER_BRIDGE)
}

cards[find_card(JP, 20)].before_commit_offensive = function () {
    if (G.offensive.stage !== ATTACK_STAGE) {
        return
    }
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
        L.allowed_units = L.allowed_units.filter(u => !set_has(ap_bb_hex, G.location[u]) && set_has(jp_bb_hex, G.location[u]))
    },
    inactive: "airfield bombardment",
    prompt() {
        prompt(`Choose airfield bombardment target.`)
        L.allowed_units.forEach(u => action_unit(u))
        if (L.allowed_units.length <= 0) {
            button("skip")
        }
    },
    skip() {
        push_undo()
        log(`No airfield bombardment possible.`)
        end()
    },
    unit(u) {
        push_undo()
        log(`${hex_get_log_str(G.location[u])} airfield bombardment selected.`)
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
    },
    inactive: "apply card effect",
    prompt() {
        prompt(`Worker strikes. Choose unit.${L.allowed_units.length <= 0 ? " (No full strength Indian corps present)." : ""}`)
        if (L.allowed_units.length <= 0) {
            button("skip")
        }
        L.allowed_units.forEach(u => action_unit(u))
    },
    skip() {
        push_undo()
        log(`No full strength Indian corps present.`)
        end()
    },
    unit(u) {
        push_undo()
        log(`Worker strikes: ${piece_get_log_str(u)}.`)
        damage_unit(u)
        end()
    }
}

cards[find_card(JP, 21)].event = function () {
    G.active = AP
    call("worker_strikes_unit")
}


cards[find_card(JP, 23)].before_battle_roll = function (faction) {
    if (faction === AP || !G.offensive.battle.ground_stage) {
        return
    }
    var any_com_unit = 0
    G.offensive.battle.ground[JP].map(u => pieces[u]).forEach(piece => {
        if (unit_on_board(piece.u) && piece.class === "ground" && piece.size === 1) {
            any_com_unit = piece.u
        }
    })
    if (any_com_unit) {
        G.offensive.battle.roll_modifiers += 1
        log(`+1 Operation RE (${piece_get_log_str(any_com_unit)}).`)
    }
}

function has_active_naval_units(faction) {
    return G.offensive.active_units[faction].filter(u => unit_on_board(u) && pieces[u].class === "naval").length
}

cards[find_card(JP, 24)].can_play = () => has_active_naval_units(AP)

cards[find_card(JP, 24)].after_battles = function () {
    call("submarine_attack", {success: 4, card: find_card(JP, 24)})
}

cards[find_card(JP, 25)].before_battle_roll = function (faction) {
    if (faction === JP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    G.offensive.battle.air_naval[AP].filter(u => unit_on_board(u)).map(u => pieces[u]).forEach(piece => {
        if (piece.type === "cv" && is_us_unit(piece)) {
            G.offensive.battle.strength[faction] -= 2
            modifier -= 2
        }
    })
    if (modifier) {
        log(`${modifier} attack strength (AP Tactical Confusion).`)
    }
}

cards[find_card(JP, 27)].can_play = () => has_active_naval_units(AP)

cards[find_card(JP, 27)].after_battles = function () {
    call("submarine_attack", {success: 4, critical: 7, card: find_card(JP, 27)})
}

only_one_ground_unit(find_card(JP, 28))

cards[find_card(JP, 28)].before_activation = function () {
    call("tokyo_express")
}

P.tokyo_express = {
    _begin() {
    },
    inactive: "place Tokyo Express marker",
    prompt() {
        prompt(`Place Tokyo Express marker.`)
        for_each_unit_on_map((u, piece, location) => {
            if (piece.class === "hq" && piece.faction === JP && !set_has(G.oos, u)) {
                for_each_hex_in_range(location, piece.cr, h => {
                    if (get_map_data(h).terrain > OCEAN && !is_faction_units(h, AP)) {
                        action_hex(h)
                    }
                })
            }
        })
    },
    action_hex(h) {
        push_undo()
        log(`Tokyo Express placed: ${hex_get_log_str(h)}.`)
        G.events[events.TOKYO_EXPRESS.id] = h
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
        log(`+${modifier} attack strength (Effective Aerial Torpedo Tactics).`)
    }
}

cards[find_card(JP, 30)].event = function () {
    call("replacement_segment", {replacement_points: [undefined, 3]})
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
    var cv_present = false
    for_each_unit_on_map((u, piece, location) => {
        if (piece.faction === JP && (piece.type === "cv" || piece.type === "cvl") && get_distance(battle, location) <= 6) {
            cv_present = true
        }
    })
    if (cv_present) {
        G.offensive.battle.roll_modifiers += 1
        log(`+1 Air Shuttle.`)
    }
}

cards[find_card(JP, 33)].event = function () {
    call("draw_from_discard")
}

P.draw_from_discard = {
    _begin() {
        L.skip = 0
        L.cards = G.hand[G.active].filter(c => !cards[c].reshuffle)
        if (G.discard[G.active].length === 0 || G.discard[G.active].length === 1 && G.discard[G.active][0] === G.offensive.offensive_card) {
            L.skip = 1
        } else if (L.cards.length === 0) {
            L.skip = 2
        }
    },
    inactive: "choose card to draw from discard",
    prompt() {
        if (L.skip === 1) {
            prompt(`Discard pile is empty, could not replace card.`)
            button("skip")
            return
        } else if (L.skip === 2) {
            prompt(`Have no card to discard, could not replace card.`)
            button("skip")
            return
        }
        if (L.card) {
            prompt(`Choose card to draw.`)
            G.discard[G.active].forEach(c => action_card(c))
        } else {
            prompt(`Choose card to discard.`)
            L.cards.forEach(c => action_card(c))
            button("skip")
        }
    },
    skip() {
        push_undo()
        log(`${side_get_log_str(G.active)} skip replace card option.`)
        end()
    },
    card(c) {
        push_undo()
        if (!L.card) {
            L.card = c
            G.offensive.active_cards = []
            var event = G.offensive.offensive_card
            G.discard[G.active].forEach(c => {
                if (event !== c) {
                    G.offensive.active_cards.push(c)
                }
            })
            log(`${side_get_log_str(G.active)} discard ${card_get_log_str(c)}.`)
            discard_card(c)
            return
        }
        set_delete(G.discard[G.active], c)
        G.hand[G.active].push(c)
        G.offensive.active_cards = []
        log(`${side_get_log_str(G.active)} draw ${card_get_log_str(c)} from discard pile.`)
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
            if (is_faction_units(i, JP) && get_map_data(i).coastal) {
                set_add(L.allowed_hexes, i)
            }
        }
        L.allowed_units = []
        L.stage = 1
    },
    inactive: "apply card effect",
    prompt() {
        if (globalThis.RTT_FUZZER) {
            button("skip")
            return
        }
        if (L.stage === 1) {
            prompt(`Choose coastal hex.`)
            L.allowed_hexes.forEach(c => action_hex(c))
        } else if (L.stage === 2) {
            prompt(`Choose units to evacuation.${G.offensive.active_units[JP].length === 0 && L.allowed_units.length === 0 ? " (No possible units)." : ""}`)
            if (G.offensive.active_units[JP].length) {
                button("done")
            }
            L.allowed_units.forEach(u => action_unit(u))
        } else {
            prompt(`Choose destination port hex.${L.allowed_hexes.length === 0 ? " (No possible hex)." : ""}`)
            L.allowed_hexes.forEach(c => action_hex(c))
        }

    },
    skip() {
        goto("check_overstacking")
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
    if (get_map_data(location).port && is_space_controlled(location, JP)) {
        move_data.naval_move_distance = 30
    }
    const queue = [location]
    const distance_map = [location, 0]
    const result = []
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        const distance = map_get(distance_map, item) + 1
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (distance > move_data.naval_move_distance
                || !(get_map_data(item).edges_int & WATER << 5 * j)
                || distance >= map_get(distance_map, nh, [100])) {
                continue
            }
            if (distance < move_data.naval_move_distance) {
                queue.push(nh)
            }
            map_set(distance_map, nh, distance)
            if (get_map_data(nh).port && is_space_controlled(nh, JP)) {
                set_add(result, nh)
            }
        }
    }
    return result
}

cards[find_card(JP, 36)].can_play = () => has_active_naval_units(AP)

cards[find_card(JP, 36)].before_battles = function () {
    call("submarine_attack", {success: 4, card: find_card(JP, 36)})
}

cards[find_card(JP, 37)].before_activation = function () {
    if (is_event_active(events.SUBMARINE_DOCTRINE)) {
        log(`US Submarine Doctrine suppress JP Escorts.`)
        return
    }
    if (is_event_active(events.JP_ESCORTS)) {
        log(`JP gains +4 escort bonus.`)
        G.events[events.JP_ESCORTS.id] = G.turn + (4 << 4)
    } else {
        log(`JP gains +2 escort bonus.`)
        G.events[events.JP_ESCORTS.id] = G.turn + (2 << 4)
    }
}

cards[find_card(JP, 38)].before_activation = cards[find_card(JP, 37)].before_activation

cards[find_card(JP, 39)].event = function () {
    call("replacement_segment", {replacement_points: [undefined, undefined, 2]})
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
    G.jp_asp = G.asp[JP][1]
    log('JP gain 2 temporary ASPs.')
    G.asp[JP][0] += 2
    if (G.inter_service[JP]) {
        G.asp[JP][0] += 2
    }
    call("tokyo_express")
}

cards[find_card(JP, 44)].before_commit_offensive = function () {
    if (G.offensive.stage !== ATTACK_STAGE) {
        return
    }
    G.asp[JP][0] -= 2
    if (G.inter_service[JP]) {
        G.asp[JP][0] -= 2
    }
    G.asp[JP][1] -= Math.min(G.asp[JP][1] - G.jp_asp, 2)
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
    G.offensive.active_units[AP].forEach(u => {
        if (pieces[u].faction === AP && pieces[u].class === "naval" && unit_on_board(u)) {
            set_add(ap_naval_commited, get_unit_battle_hex(u))
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
        L.stage = 1
    },
    inactive: "launch kamikaze attack",
    prompt() {
        if (L.allowed_units.length <= 0) {
            prompt(`No kamikaze attack possible. No air units.`)
            button("skip")
            return
        }
        if (L.stage === 1) {
            prompt(`Kamikaze attack. Choose air unit.`)
            L.allowed_units.forEach(u => action_unit(u))
        } else {
            prompt(`Kamikaze attack. Choose target. Hits: ${L.hits}.`)
            var has_non_damaged = []
            L.allowed_units.forEach(u => {
                if (!set_has(G.reduced, u)) {
                    set_add(has_non_damaged, get_unit_battle_hex(u))
                }
            })
            if (L.hits > 0) {
                L.allowed_units.forEach(u => {
                    if (!set_has(G.reduced, u) || !set_has(has_non_damaged, get_unit_battle_hex(u))) {
                        action_unit(u)
                    }
                })
            }
            if (G.offensive.counter_offensive_card === SHO_GO && !G.offensive.sho_go && L.stage !== 1) {
                action_card(SHO_GO)
                button("bonus")
            }
        }
        if (L.allowed_units.length <= 0 || L.hits <= 0) {
            button("done")
        }
    },
    skip() {
        push_undo()
        log(`Kamikaze attack skipped.`)
        end()
    },
    done() {
        push_undo()
        end()
    },
    bonus() {
        push_undo()
        G.offensive.sho_go = 1
        L.hits += 1
        log(`+1 Kamikaze hit (Sho-Go).`)
    },
    card(c) {
        this.bonus()
    },
    unit(u) {
        push_undo()
        if (L.stage === 1) {
            var location = G.location[u]
            log(`${piece_get_log_str(u)} launch kamikaze attack.`)
            damage_unit(u)
            L.allowed_units = []
            G.offensive.active_units[AP].forEach(ap => {
                    var bh = get_unit_battle_hex(ap)
                    if (pieces[ap].faction === AP && pieces[ap].class === "naval" && unit_on_board(ap) && set_has(G.offensive.kamikaze, bh)
                        && get_distance(bh, location) <= pieces[u].ebr) {
                        set_add(L.allowed_units, ap)
                    }
                }
            )
            L.stage++
            L.hits = 2
            var kamikaze = G.offensive.active_cards.filter(c => cards[c].kamikaze)
            if (kamikaze.length && G.offensive.counter_offensive_card === SHO_GO && !G.offensive.sho_go) {
                this.bonus()
            }
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
    return map_get(G.offensive.committed, unit, G.location[unit])
}

cards[find_card(JP, 46)].before_apply_hits = function (faction) {
    if (faction === AP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    for (var i = 0; i < L.pool.length; i += 2) {
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
        log(`+${modifier} Attack strength (Float Plane Tactics).`)
    }
}

cards[GENERAL_ADACHI].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", JP)
}

cards[find_card(JP, 50)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", JP)
}

cards[find_card(JP, 58)].before_movement = function () {
    call("paratroopers")
}

cards[find_card(JP, 59)].before_movement = cards[find_card(JP, 58)].before_movement

cards[find_card(JP, 60)].before_movement = cards[find_card(JP, 58)].before_movement

P.paratroopers = {
    _begin() {
        var occupied_hexes = []
        var duth_hexes = []
        for_each_unit_on_map((u, piece, location) => {
            if (piece.faction === JP) {
                return
            } else if (piece.service === "du" && piece.size === 1 && piece.class === "ground" && !set_has(duth_hexes, location)) {
                set_add(duth_hexes, location)
            } else {
                set_add(occupied_hexes, location)
            }
        })
        L.allowed_hexes = []
        G.active_stack = [jp_army(38)]//hack to force ground_move_denied check
        G.offensive.active_units[JP].forEach(u => {
            if (pieces[u].class !== "air") {
                return
            }
            for_each_hex_in_range(G.location[u], pieces[u].ebr, h => {
                if (set_has(occupied_hexes, h) || has_non_n_zoi(h, AP) || is_space_controlled(h, JP) || (!is_controllable_hex(h) && !set_has(duth_hexes, h))
                    || ground_move_denied(h)) {
                    return
                }
                set_add(L.allowed_hexes, h)
            })
        })
        G.active_stack = []

    },
    inactive: "choose paratroopers landing hex",
    prompt() {
        prompt(`Choose paratroopers landing hex.`)
        L.allowed_hexes.forEach(u => action_hex(u))
        button("skip")
    },
    skip() {
        push_undo()
        log("Paratroopers skipped.")
        end()
    },
    action_hex(h) {
        push_undo()
        log(`Paratroopers landing ${hex_get_log_str(h)}.`)
        capture_hex(h)
        for_each_unit_on_map((u, piece, location) => {
            if (location === h) {
                eliminate(u)
            }
        })
        end()
    }
}

cards[find_card(JP, 64)].event = function () {
    call("halsey_typhoon")
}

P.halsey_typhoon = {
    _begin() {
        L.allowed_units = []
        G.offensive.cancelled.active_units[AP].forEach(u => {
            if (unit_on_board(u) && (pieces[u].type === "ca" || pieces[u].type === "dd") && !set_has(G.reduced, u)) {
                set_add(L.allowed_units, u)
            }
        })
        if (L.allowed_units.length <= 0) {
            end()
        }
    },
    inactive: "apply card effect",
    prompt() {
        prompt(`Choose unit to flip.`)
        L.allowed_units.forEach(u => action_unit(u))
    },
    unit(u) {
        push_undo()
        log(`Halsey\`s Typhoon: ${piece_get_log_str(u)}.`)
        damage_unit(u)
        end()
    }
}

cards[find_card(JP, 65)].before_unit_activation = function () {
    G.offensive.logistic = cards[G.offensive.offensive_card].oc + 1
    filter_activation_units((u, piece) => piece.class !== "ground", JP)
}

cards[find_card(JP, 65)].before_commit_offensive = function () {
    if (G.offensive.stage === POST_BATTLE_STAGE && G.active === JP) {
        call("yamato_loss")
    }
}

P.yamato_loss = {
    _begin() {
        if (!unit_on_board(find_piece("yamato"))) {
            end()
        }
    },
    inactive: "apply card effect",
    prompt() {
        prompt(`Yamato run. Reduce one step.`)
        action_unit(find_piece("yamato"))
    },
    unit(u) {
        push_undo()
        damage_unit(u)
        end()
    }
}

cards[find_card(JP, 67)].event = cards[find_card(JP, 33)].event

cards[find_card(JP, 68)].event = cards[find_card(JP, 33)].event

cards[find_card(JP, 71)].event = function () {
    check_event(events.INTERCEPTORS)
    call("replacement_segment", {replacement_points: [undefined, 2]})
}

cards[find_card(JP, 72)].event = function () {
    call("replacement_segment", {replacement_points: [3]})
}

cards[find_card(JP, 73)].before_activation = function () {
    if (!is_event_active(events.PT_BOATS)) {
        log(`JP barges active.`)
        check_event(events.BARGES)
    }
}

cards[find_card(JP, 75)].can_play = () => has_active_naval_units(AP)

cards[find_card(JP, 75)].before_battles = function () {
    call("submarine_attack", {success: 4, card: find_card(JP, 75)})
}

cards[find_card(JP, 76)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "ground" || piece.size === 1, JP)
}

only_one_ground_unit(find_card(JP, 76))

cards[find_card(JP, 76)].before_activation = function () {
    call("attack_b29_base")
}

P.attack_b29_base = {
    _begin() {
        L.allowed_units = []
        var b29 = [B_29_1, B_29_2]
        b29.filter(u => unit_on_board(u) && get_distance(G.location[u], TOKYO) <= 8 || G.location[u] === CHINA_BOX)
            .forEach(u => set_add(L.allowed_units, u))
        if (L.allowed_units.length <= 0) {
            return
        }
        log(`JP attack to B-29 base:`)
        var roll = random(10)
        L.hits = roll <= 4
        log(`${roll} - ${L.hits ? "success" : "No effect"}`)
        clear_undo()
        if (!L.hits) {
            end()
        }
    },
    inactive: "apply card effect",
    prompt() {
        if (L.allowed_units.length <= 0) {
            prompt(`No B-29 base attacked.`)
            button("skip")
            return
        }
        prompt(`Attack to B-29 base. Choose unit.`)
        L.allowed_units.forEach(u => action_unit(u))
    },
    skip() {
        push_undo()
        end()
    },
    unit(u) {
        push_undo()
        damage_unit(u)
        end()
    }
}

cards[find_card(JP, 77)].event = function () {
    call("fuel_shortage")
}

function check_fuel_shortage_data() {
    var result = []
    let location = L.target
    if (G.active_stack.length) {
        location = G.location[G.active_stack[0]]
    }
    if (has_non_n_zoi(location, 1 - R)) {
        return []
    }
    clear_supply_cache(CLEAN_ATTACK_ZONE_MASK)
    G.supply_cache[location] |= HEX_TEMP_FLAG1
    const queue = [location]
    const distance_map = [location, 0]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        const distance = map_get(distance_map, item) + 1
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (has_non_n_zoi(nh, 1 - R)
                || !(get_map_data(item).edges_int & WATER << 5 * j)
                || distance >= map_get(distance_map, nh, [500])) {
                continue
            }
            queue.push(nh)
            map_set(distance_map, nh, distance)
            if (get_map_data(nh).port) {
                G.supply_cache[nh] |= HEX_TEMP_FLAG1
            }
        }
    }
    var over = L.target ? L.overstack[L.target] : 0
    if (L.moved.filter(u => pieces[u].class === "naval").length < 4 &&
        G.active_stack.filter(u => pieces[u].class === "naval").length < (6 - (over >> 7))) {
        var non_selected = !G.active_stack.length
        for_each_unit_on_map((u, piece, loc) => {
            if (G.supply_cache[loc] & HEX_TEMP_FLAG1 && (piece.class === "naval" && piece.faction === JP)
                && (non_selected || loc === location)) {
                set_add(result, u)
            }
        })
    }
    var hq = [HQ_YAMAMOTO, HQ_OZAWA]
    hq.forEach(u => {
        var loc = G.location[u]
        if (G.supply_cache[loc] & HEX_TEMP_FLAG1
            && !set_has(L.moved, u)
            && (over & 1) === 0
            && (non_selected || loc === location)) {
            set_add(result, u)
        }
    })
    L.moved.forEach(u => set_delete(result, u))
    G.active_stack.forEach(u => set_delete(result, u))
    L.allowed_hexes = []
    if (G.active_stack.length && L.target && G.supply_cache[L.target] & HEX_TEMP_FLAG1) {
        L.allowed_hexes = [L.target]
    } else if (G.active_stack.length && !L.target) {
        var hq = (G.active_stack.includes(HQ_YAMAMOTO) || G.active_stack.includes(HQ_OZAWA)) + 0
        var ships_count = G.active_stack.length - hq
        L.ports.forEach(h => {
            var over = L.overstack[h]
            var hex_ship_count = over >> 7
            if (G.supply_cache[h] & HEX_TEMP_FLAG1
                && (!hq || (over & 1) === 0)
                && hex_ship_count + ships_count <= 6) {
                set_add(L.allowed_hexes, h)
            }
        })
    }
    if (G.active_stack.length) {
        set_delete(L.allowed_hexes, location)
    }
    L.allowed_units = result
    if (G.active_stack.length === 0 && L.allowed_units.length === 0 && L.allowed_hexes.length === 0) {
        end()
    }
}

P.fuel_shortage = {
    _begin() {
        check_supply()
        fill_overstack(JP)
        L.move_type = STRAT_MOVE
        L.allowed_units = []
        L.allowed_hexes = []
        L.ports = []
        RESOURCE_HEX.forEach(h => {
            if (get_map_data(h).resource) {
                for_each_hex_in_range(h, 3, rh => {
                    var md = get_map_data(rh)
                    if (md.port && is_space_controlled(rh, JP) && !has_non_n_zoi(rh, AP)) {
                        set_add(L.ports, rh)
                    }
                })
            }
        })
        for_each_unit_on_map((u, piece, location) => {
            if ((piece.class === "naval" && piece.faction === JP || u === HQ_YAMAMOTO || u === HQ_OZAWA)
                && !has_non_n_zoi(location, AP)) {
                set_add(L.allowed_units, u)
            }
        })
        L.moved = []
        L.stage = 0
    },
    inactive: "apply card effect",
    prompt() {
        prompt(`Move units. Units could be selected: ${5 - L.moved.length}.`)
        L.allowed_units.forEach(u => action_unit(u))
        L.allowed_hexes.forEach(h => action_hex(h))
        if (L.moved.length && !G.active_stack.length) {
            button("done")
        }
    },
    done() {
        push_undo()
        end()
    },
    action_hex(hex) {
        push_undo()
        L.target = hex
        G.active_stack.forEach(u => {
            set_location(u, hex)
        })
        G.active_stack = []
        check_supply()
        check_fuel_shortage_data()
    },
    unit(u) {
        if (G.active_stack.length === 0) {
            push_undo()
        }
        L.moved.push(u)
        var piece = pieces[u]
        set_add(G.active_stack, u)
        if (is_cv_unit(piece)) {
            check_supply()
        }
        check_fuel_shortage_data()
    }
}

cards[find_card(JP, 78)].event = function () {
    call("event_unit", {unit: jp_air("t")})
}

P.event_unit = {
    _begin() {
        check_supply()
        mark_supplied_hexes(G.active)
    },
    inactive: "place unit",
    prompt() {
        prompt(`Choose hex to place ${piece_get_log_str(L.unit)}.`)
        get_unit_reinforcement_hexes(L.unit).forEach(h => action_hex(h))
    },
    action_hex(h) {
        push_undo()
        set_location(L.unit, h)
        end()
    }
}

cards[find_card(JP, 79)].before_unit_activation = cards[find_card(JP, 76)].before_unit_activation

cards[find_card(JP, 79)].after_unit_activation = cards[find_card(JP, 76)].after_unit_activation

cards[find_card(JP, 79)].before_activation = cards[find_card(JP, 76)].before_activation

cards[find_card(JP, 80)].event = function () {
    check_event(events.PANAMA_CANAL)
}

cards[find_card(JP, 82)].event = cards[find_card(JP, 15)].event

cards[find_card(JP, 83)].before_battle_roll = function (faction) {
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
        log(`+${modifier} Attack strength (Long Lance Torpedoes).`)
    }
}

cards[find_card(JP, 85)].before_unit_activation = function () {
    G.offensive.logistic = cards[G.offensive.offensive_card].oc
    filter_activation_units((u, piece) => piece.class === "naval", JP)
}

cards[find_card(JP, 86)].can_play = () => has_active_naval_units(AP)

cards[find_card(JP, 86)].after_battles = function () {
    call("submarine_attack", {success: 7, card: find_card(JP, 86)})
}

P.submarine_attack = {
    _begin() {
        clear_undo()
        G.active = cards[L.card].faction
        if (L.card === DARTER_DACE) {
            G.active = JP
        }
        log(`${card_get_log_str(L.card)} played.`)
        var roll = random(10)
        L.hits = 0
        if (roll <= L.success) {
            log(`${dice_get_log_str(roll, 0, cards[L.card].faction)} - Loss one naval step.`)
            L.hits = 1
        } else if (L.critical && roll <= L.critical) {
            log(`${dice_get_log_str(roll, 0, cards[L.card].faction)} - Loss two naval steps.`)
            L.hits = 2
        } else {
            log(`${dice_get_log_str(roll, 0, cards[L.card].faction)} - No effect.`)
        }
        L.allowed_units = []
        G.offensive.active_units[1 - cards[L.card].faction].forEach(u => {
            if (unit_on_board(u) && pieces[u].class === "naval" && (!set_has(G.reduced, u) || L.hits >= 2 || L.card !== DARTER_DACE)) {
                set_add(L.allowed_units, u)
            }
        })
        if (L.pre_allowed_units) {
            L.allowed_units = L.pre_allowed_units
        }
        if (L.allowed_units.length <= 0 || L.hits <= 0) {
            G.active = cards[L.card].faction
            end()
            return
        }
        while (G.async && L.allowed_units.length === 1 && L.hits) {
            this.unit(L.allowed_units[0])
        }
        if (!L.hits || !L.allowed_units.length) {
            this.done()
        }
    },
    inactive: "apply card effect",
    prompt() {
        prompt(`Submarine attack. Apply hits: ${L.hits}.`)
        L.allowed_units.forEach(u => action_unit(u))
        if (L.allowed_units.length === 0 || L.hits <= 0) {
            button("done")
        }
    },
    unit(u) {
        push_undo()
        log(`Submarine attack: ${piece_get_log_str(u)}.`)
        damage_unit(u)
        if (!unit_on_board(u)) {
            set_delete(L.allowed_units, u)
        }
        L.hits -= 1
    },
    done() {
        G.active = cards[L.card].faction
        end()
    }
}


cards[find_card(AP, 1)].can_play = function () {
    return is_space_controlled(hex_to_int(2813), JP)
}

cards[find_card(AP, 3)].event = function () {
    call("replacement_segment", {replacement_points: [undefined, undefined, 2]})
}

cards[find_card(AP, 3)].before_replacement = function () {
    L.replacable_units = L.replacable_units.filter(u => pieces[u].service === "au")
}

cards[find_card(AP, 3)].before_place_replacement = function () {
    L.allowed_hexes = L.allowed_hexes.filter(h => get_map_data(h).region === "Australia")
}

cards[find_card(AP, 4)].event = function () {
    call("place_abda")
}

P.place_abda = {
    _begin() {
        check_supply()
        mark_supplied_hexes(G.active)
        var dei = ["Java", "Borneo", "Sumatra", "Celebes"]
        L.allowed_hexes = get_unit_reinforcement_hexes(HQ_ABDA).filter(h => dei.includes(get_map_data(h).region))

    },
    inactive: "place HQ",
    prompt() {
        if (L.allowed_hexes.length <= 0) {
            button("skip")
            prompt(`ABDA HQ could not be placed.`)
            return
        }
        prompt(`Choose hex to place ${piece_get_log_str(HQ_ABDA)}.`)
        L.allowed_hexes.forEach(h => action_hex(h))
    },
    skip() {
        push_undo()
        log(`ABDA HQ could not be placed.`)
        eliminate_permanently(HQ_ABDA)
        end()
    },
    action_hex(h) {
        push_undo()
        set_location(HQ_ABDA, h)
        end()
    }
}

cards[MATADOR].before_apply_hits = function (faction) {
    if (faction === AP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    for (var i = 0; i < L.pool.length; i += 2) {
        var piece = pieces[L.pool[i]]
        if (piece.br && piece.class === "air") {
            L.pool[i + 1] += 2
            modifier++
        }
    }
}

cards[find_card(AP, 6)].event = function () {
    check_event(events.DOOLITLE)
}

cards[find_card(AP, 7)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", AP)
}

cards[find_card(AP, 7)].before_battle_roll = function (faction) {
    if (faction === JP || !G.offensive.battle.ground_stage) {
        return
    }
    G.offensive.battle.roll_modifiers += 2
    log(`+2 Merrill\`s Marauders.`)
}

cards[find_card(AP, 8)].can_play = function () {
    return G.offensive.active_units[JP].filter(u => pieces[u].class !== "ground").length
}

cards[find_card(AP, 9)].before_activation = function () {
    G.temp_asp = G.asp[AP][1]
    log('AP gain 4 temporary ASPs.')
    G.asp[AP][0] += 4
}

cards[find_card(AP, 9)].before_commit_offensive = function () {
    if (G.offensive.stage !== ATTACK_STAGE) {
        return
    }
    G.asp[AP][0] -= 4
    G.asp[AP][1] -= Math.min(G.asp[AP][1] - G.temp_asp, 4)
    delete G['temp_asp']
    var jp_battles = G.offensive.battle_hexes.filter(h => get_map_data(h).region === "Japan")
    var required_battles = false
    G.offensive.active_units[AP].forEach(u => {
        if (set_has(jp_battles, G.location[u]) && pieces[u].class === "ground" && is_faction_ground_units(G.location[u], JP)) {
            required_battles = true
        }
    })
    if (!required_battles) {
        return "At least one ground battle should be initiated at Japanese home island."
    }
}

cards[find_card(AP, 10)].event = function () {
    call("draw_from_discard")
}

only_one_ground_unit(find_card(AP, 13))

cards[find_card(AP, 15)].event = function () {
    call("replacement_segment", {replacement_points: [2]})
}

cards[find_card(AP, 16)].event = function () {
    call("us_raiders")
}

P.us_raiders = {
    _begin() {
        var hq_map = []
        L.allowed_units = []
        for_each_unit_on_map((u, piece, location) => {
            if (piece.class === "hq" && piece.service === "us") {
                map_set(hq_map, u, location)
            }
        })
        for_each_unit_on_map((u, piece, location) => {
            var range = false
            map_for_each(hq_map, (hq, hq_l) => {
                if (get_distance(location, hq_l) <= pieces[hq].cr) {
                    range = true
                }
            })
            if (range && piece.class === "air" && piece.faction === JP && get_map_data(G.location[u]).region !== "Japan") {
                set_add(L.allowed_units, u)
            }
        })
    },
    inactive: "apply card effect",
    prompt() {
        prompt(`Choose unit to damage.${L.allowed_units.length ? "" : "(Not possible)."}`)
        L.allowed_units.forEach(h => action_unit(h))
    },
    unit(u) {
        push_undo()
        log(`US raiders: ${piece_get_log_str(u)}.`)
        damage_unit(u)
        end()
    }
}

cards[find_card(AP, 17)].event = function () {
    check_event(events.HUMP)
    call("repair_avg")
}

P.repair_avg = {
    _begin() {
        check_supply()
        mark_supplied_hexes(G.active)
        L.allowed_units = []
        var regions = ["NIndia", "Burma"]
        L.allowed_hexes = get_unit_reinforcement_hexes(ap_air(14)).filter(h => regions.includes(get_map_data(h).region))
        var avg_location = G.location[ap_air("avg")]
        if (set_has(G.reduced, ap_air("avg")) && (avg_location === CHINA_BOX || regions.includes(get_map_data(avg_location).region))) {
            set_add(L.allowed_units, ap_air("avg"))
        }
        var location_14 = G.location[ap_air(14)]
        if (set_has(G.reduced, ap_air(14)) && (location_14 === CHINA_BOX || regions.includes(get_map_data(location_14).region))
            || location_14 === ELIMINATED_BOX && L.allowed_hexes.length) {
            set_add(L.allowed_units, ap_air(14))
        }
    },
    inactive: "apply card effect",
    prompt() {
        if (L.allowed_units.length <= 0) {
            button("skip")
            prompt(`Bonus could not be used.`)
            return
        }
        prompt(`Choose unit to repair.`)
        if (G.active_stack.length) {
            L.allowed_hexes.forEach(h => action_hex(h))
        } else {
            L.allowed_units.forEach(h => action_unit(h))
        }
    },
    skip() {
        push_undo()
        log(`Bonus could not be used.`)
        end()
    },
    unit(u) {
        push_undo()
        if (set_has(G.reduced, u)) {
            set_delete(G.reduced, u)
            log(`${piece_get_log_str(u)} repaired.`)
            end()
        } else {
            G.active_stack = [u]
            set_add(G.reduced, u)
        }
    },
    action_hex(h) {
        set_location(G.active_stack[0], h)
        G.active_stack = []
        end()
    }
}

cards[find_card(AP, 18)].event = function () {
    change_asp(AP, 1)
}

cards[find_card(AP, 19)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", AP)
}

cards[find_card(AP, 20)].can_play = function () {
    return true
}

cards[find_card(AP, 20)].before_activation = function () {
    if (unit_on_board(HQ_SOUTH_GHORMLEY)) {
        set_location(HQ_SOUTH_HELSEY, G.location[HQ_SOUTH_GHORMLEY])
        eliminate_permanently(HQ_SOUTH_GHORMLEY)
    } else {
        eliminate_permanently(HQ_SOUTH_GHORMLEY)
        call("event_unit", {unit: HQ_SOUTH_HELSEY})
    }
}

cards[find_card(AP, 22)].can_play = function () {
    var regions = ["Burma", "NIndia"]
    return G.offensive.active_units[JP].filter(u => pieces[u].class === "ground" &&
        regions.includes(get_map_data(map_get(G.offensive.paths, u, [0, 0, 0])[2]).region)).length
}

cards[find_card(AP, 22)].event = function () {
    displace_to_turn(ap_army("77"), 1, true)
    call("wingate")
}

P.wingate = {
    _begin() {
        L.allowed_units = []
        var regions = ["Burma", "NIndia"]
        G.offensive.active_units[JP].forEach(u => {
            var location = map_get(G.offensive.paths, u, [0, 0, 0])[2]
            if (pieces[u].class === "ground" &&
                regions.includes(get_map_data(location).region)) {
                map_set(L.allowed_units, u, location)
            }
        })
    },
    inactive: "apply card effect",
    prompt() {
        prompt(`Choose unit to cancel.`)
        map_for_each(L.allowed_units, k => action_unit(k))
    },
    unit(u) {
        push_undo()
        var loc = G.location[u]
        set_location(u, map_get(L.allowed_units, u))
        set_delete(G.offensive.active_units[JP], u)
        map_delete(G.offensive.paths, u)
        log(`${piece_get_log_str(u)} deactivated.`)
        var committed = []
        map_for_each(G.offensive.committed, (u, h) => {
            if (h === loc) {
                committed.push(u)
            }
        })
        if (!is_faction_units(loc, JP) && !committed.length) {
            set_delete(G.offensive.battle_hexes, loc)
        }
        if (!is_faction_ground_units(loc, JP)) {
            set_delete(G.offensive.landing_hexes, loc)
        }
        end()
    },
}

cards[find_card(AP, 23)].event = function () {
    check_event(events.PT_BOATS)
    G.events[events.BARGES.id] = 0
}

cards[SKIP_BOMBING].event = function () {
    change_asp(JP, -1)
}

cards[SKIP_BOMBING].before_battles = function () {
    call("skip_bombing")
}

function cache_skip_bombing() {
    check_supply()
    clear_supply_cache(CLEAN_ATTACK_ZONE_MASK)
    for_each_unit_on_map((u, piece, location) => {
        if (is_us_unit(piece) && piece.br && piece.class === "air" && piece.type !== "lrb") {
            for_each_hex_in_range(location, piece.parenthetical ? piece.br : piece.ebr, h => {
                G.supply_cache[h] |= HEX_TEMP_FLAG1
            })
        }
    })
    G.offensive.skip_bomb_able = []
    G.offensive.active_units[JP].filter(u => {
        var piece = pieces[u]
        return piece.type === "ca" || piece.type === "cl" || piece.type === "apd"
    }).forEach(u => {
        var path = map_get(G.offensive.paths, u, [0, 0, 0])
        for (var i = 3; i < path.length; i++) {
            var location = path[i]
            if (location !== path[i - 1] && G.supply_cache[location] & HEX_TEMP_FLAG1) {
                set_add(G.offensive.skip_bomb_able, u)
                return
            }
        }
    })
}

P.skip_bombing = {
    _begin() {
        if (G.offensive.skip_bomb_able.length <= 1) {
            G.active = AP
        } else {
            G.active = JP
        }
    },
    inactive: "apply card effect",
    prompt() {
        if (G.offensive.skip_bomb_able.length === 0) {
            button("skip")
            prompt(`${card_get_log_str(SKIP_BOMBING)}. Choose unit to assign hit. (No possible units).`)
            return
        }
        prompt(`${card_get_log_str(SKIP_BOMBING)}. Choose unit to assign hit.`)
        if (L.done) {
            button("done")
        } else {
            map_for_each(G.offensive.skip_bomb_able, k => action_unit(k))
        }
    },
    unit(u) {
        push_undo()
        log("Skip bombing:")
        damage_unit(u)
        L.done = 1
    },
    skip() {
        push_undo()
        G.active = AP
        log("Skip bombing: No unit damaged.")
        end()
    },
    done() {
        push_undo()
        G.active = AP
        end()
    }
}

cards[find_card(AP, 25)].before_unit_activation = function () {
    if (G.active === JP) {
        return
    }
    var hq = G.offensive.active_hq[G.active]
    var supply = pieces[hq].supply
    supply |= BR_SUPPLIED_HEX
    L.possible_units = get_activatable_units(hq, supply)
    filter_activation_units((u, piece) => {
        return piece.class === "air" && (piece.service === "navy" || piece.service === "army") ||
            piece.class === "ground" && (piece.service === "navy" || piece.service === "army" || piece.service === "au")
    }, AP)
}

cards[find_card(AP, 25)].before_battle_roll = function (faction) {
    if (faction === JP || !G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    G.offensive.battle.ground[AP].filter(u => unit_on_board(u)).map(u => pieces[u]).forEach(piece => {
        if (piece.class === "ground" && (piece.service === "navy" || piece.service === "army")) {
            G.offensive.battle.strength[faction] -= 1
            modifier -= 1
        }
    })
    if (modifier) {
        log(`${modifier} Attack strength (US Reservists).`)
    }
}


cards[find_card(AP, 26)].before_battle_roll = function (faction) {
    if (faction === JP || !G.offensive.battle.ground_stage) {
        return
    }
    G.offensive.battle.roll_modifiers += 4
    log(`+4 Broken Army Codes.`)
}

cards[find_card(AP, 27)].event = function () {
    set_location(HQ_OZAWA, G.location[HQ_YAMAMOTO])
    eliminate_permanently(HQ_YAMAMOTO)
}

cards[find_card(AP, 28)].before_activation = function () {
    G.offensive.chronicle = []
    for_each_unit_on_map((u, piece, location) => {
        set_add(G.offensive.chronicle, location)
    })
}

cards[find_card(AP, 28)].before_commit_offensive = function () {
    if (G.offensive.stage !== ATTACK_STAGE) {
        return
    }
    if (!G.offensive.chronicle) {
        //todo: remove
        G.offensive.chronicle = []
    }
    G.offensive.landing_hexes.forEach(l => {
        if (get_map_data(l).island && !set_has(G.offensive.chronicle, l) && !is_faction_units(l, JP)) {
            for_each_hex_in_range(l, 1, h => {
                if (h !== l && get_map_data(h).island && !is_faction_units(h, JP)) {
                    capture_hex(h, AP)
                }
            })
        }
    })
}

cards[find_card(AP, 29)].before_battle_roll = function (faction) {
    if (faction === JP || !G.offensive.battle.ground_stage) {
        return
    }
    G.offensive.battle.roll_modifiers += 1
    log(`+1 Artillery Support.`)
}

cards[SANDCRAB].can_play = function () {
    return events.ALASKA_OCCUPATION.keys.filter(k => is_faction_units(hex_to_int(k), JP)).length
}

cards[SANDCRAB].before_commit_offensive = function () {
    if (G.offensive.stage !== ATTACK_STAGE) {
        return
    }
    if (!G.offensive.battle_hexes.filter(h => get_map_data(h).region === "Alaska").length) {
        return "At least one battle at Aleutian islands should be declared."
    }
}

cards[find_card(AP, 31)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class === "air", AP)
}

cards[find_card(AP, 33)].before_activation = function () {
    set_inter_service(AP, 0)
    call("build_road")
}

P.build_road = {
    inactive: "choose hex to build CBI",
    prompt() {
        if (!get_infrastructure_actions().length) {
            prompt("CBI could not be built.")
            button("skip")
            return
        }
        prompt(`Choose hex to build CBI.`)
        get_infrastructure_actions().map(h => {
            if (h === "jarhat") {
                return JARHAT
            } else if (h === "imphal") {
                return IMPHAL
            } else {
                return LEDO
            }
        }).forEach(h => action_hex(h))
        button("skip")
    },
    action_hex(h) {
        push_undo()
        var event = ROAD_EVENTS.filter(e => e.keys[0] === h)[0]
        check_event(event)
        log(`CBI infrastructure built - ${hex_get_log_str(event.keys[0])}.`)
        end()
    },
    skip() {
        push_undo()
        log("CBI build skipped.")
        end()
    }
}

cards[find_card(AP, 33)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", AP)
}

for (var i = 1; i < cards.length; i++) {
    var always_true = () => true
    const card = cards[i]
    card.c = i
    card.could_play = () => could_play(card)
    if (!card.can_play && card.hq) {
        card.can_play = () => event_hq_check(card)
    } else if (!card.can_play && card.china < 0) {
        card.can_play = () => G.surrender[nations.CHINA.id] > 1
    } else if (!card.can_play && card.china > 0) {
        card.can_play = () => G.surrender[nations.CHINA.id] < 5
    } else if (!card.can_play) {
        card.can_play = always_true
    }
    if (!cards[i].event) {
        cards[i].event = always_true
    }
    if (cards[i].kamikaze) {
        cards[i].before_battles = () => call("kamikaze_attack")
        cards[i].can_play = () => check_kamikaze_playable()
    }
}

cards[find_card(AP, 34)].before_unit_activation = function () {
    filter_activation_units((u, piece) => is_commonwelth(piece), AP)
}

cards[find_card(AP, 35)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "ground" || u === NEW_ZEEL, AP)
}

cards[find_card(AP, 36)].before_battle_roll = function (faction) {
    if (faction === JP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    G.offensive.battle.air_naval[AP].filter(u => unit_on_board(u)).map(u => pieces[u]).forEach(piece => {
        if (piece.type === "ca" && piece.service === "navy") {
            G.offensive.battle.strength[faction] += 2
            modifier += 2
        }
    })
    if (modifier) {
        log(`+${modifier} attack strength (Arleigh Burke).`)
    }
}

only_one_ground_unit(find_card(AP, 37))

cards[find_card(AP, 37)].before_battle_roll = function (faction) {
    if (faction === JP || !G.offensive.battle.ground_stage) {
        return
    }
    if (get_map_data(G.offensive.battle.battle_hex).island) {
        G.offensive.battle.roll_modifiers += 2
        log(`+2 Banzai Charge.`)
    }
}

cards[find_card(AP, 38)].can_play = function () {
    var hqs = []
    HQ_LIST.forEach(hq => {
        var piece = pieces[hq]
        if (G.location[hq] < LAST_BOARD_HEX && piece.faction === AP
            && get_activatable_units(hq, piece.supply).filter(u => pieces[u].service === "ch").length) {
            hqs.push(hq)
        }
    })
    return hqs.length === 0 || hqs.filter(hq => !set_has(G.oos, hq)).length > 0
}

cards[find_card(AP, 38)].before_choose_hq = function () {
    var hqs = []
    HQ_LIST.forEach(hq => {
        var piece = pieces[hq]
        if (G.location[hq] < LAST_BOARD_HEX && piece.faction === AP
            && !set_has(G.oos, hq)
            && get_activatable_units(hq, piece.supply).filter(u => pieces[u].service === "ch").length) {
            G.offensive.tarzan = true
            hqs.push(hq)
        }
    })
    if (hqs.length) {
        L.possible_units = hqs
    }
}

cards[find_card(AP, 38)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", AP)
}

cards[find_card(AP, 38)].before_commit_offensive = function () {
    if (G.offensive.stage !== ATTACK_STAGE || !G.offensive.tarzan) {
        return
    }
    var cn_active = false
    G.offensive.active_units[AP].forEach(u => {
        if (pieces[u].service === "ch") {
            cn_active = true
        }
    })
    if (!cn_active) {
        return "At least one Chinese army should be activated.";
    }
}

cards[find_card(AP, 39)].event = function () {
    set_inter_service(AP, 0)
    call("replacement_segment", {replacement_points: [undefined, 1, undefined, 3]})
    call("build_road")
}

cards[find_card(AP, 39)].before_replacement = function () {
    L.replacable_units = L.replacable_units.filter(u => unit_on_board(u) && !set_has(G.oos, u))
}

cards[find_card(AP, 44)].before_unit_activation = cards[find_card(AP, 35)].before_unit_activation

cards[find_card(AP, 48)].before_activation = function () {
    call("replacement_segment", {replacement_points: [undefined, undefined, undefined, 1]})
}

cards[find_card(AP, 48)].before_replacement = function () {
    L.replacable_units = L.replacable_units.filter(u => unit_on_board(u))
}

cards[find_card(AP, 48)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class !== "naval", AP)
}

cards[find_card(AP, 48)].after_unit_activation = function (u) {
    if (R === JP) {
        return
    }
    L.hq_bonus += G.offensive.active_units[R].filter(u => pieces[u].service === "ch").length
}

cards[find_card(AP, 50)].after_unit_activation = function () {
    if (R === JP || !G.inter_service[AP] || G.offensive.active_hq[AP] !== HQ_SOUTH_WEST) {
        return
    }
    var army = 0
    var naval = 0
    G.offensive.active_units[AP].forEach(au => {
        var au_piece = pieces[au]
        if (au_piece.service === "army") {
            army++
        } else if (au_piece.br || au_piece.class !== "naval") {
            naval += 2
        } else if (au_piece.class === "naval") {
            naval++
        }
    })
    L.allowed_units = L.possible_units.filter(u => {
            var piece = pieces[u]
            return !set_has(G.offensive.active_units[AP], u) &&
                (piece.service === "army" && (army > 0 || naval <= 1)
                    || piece.service === "navy" && (army <= 0 || naval > 1 || naval === 0 && !piece.br && piece.class === "naval")
                )
        }
    )
}

cards[find_card(AP, 46)].after_unit_activation = cards[find_card(AP, 50)].after_unit_activation

cards[find_card(AP, 51)].before_activation = function () {
    if (unit_on_board(ap_air("avg"))) {
        eliminate_permanently(ap_air("avg"))
    }
    call("place_14_air")
}

P.place_14_air = {
    _begin() {
        check_supply()
        mark_supplied_hexes(G.active)
        L.allowed_hexes = get_unit_reinforcement_hexes(AP_AIR_14).filter(h => h === CHINA_BOX || get_map_data(h).region === "NIndia")
        if (!L.allowed_hexes.length) {
            L.allowed_hexes = get_unit_reinforcement_hexes(AP_AIR_14)
        }
        set_delete(G.reduced, AP_AIR_14)
    },
    inactive: "place unit",
    prompt() {
        prompt(`Choose hex to place ${piece_get_log_str(AP_AIR_14)}.`)
        L.allowed_hexes.forEach(h => action_hex(h))
        if (L.allowed_hexes.length === 0) {
            button("eliminate")
        }
    },
    action_hex(h) {
        push_undo()
        set_location(AP_AIR_14, h)
        end()
    },
    eliminate() {
        push_undo()
        log(`No valid hex to place.`)
        eliminate_permanently(AP_AIR_14)
        end()
    }
}

cards[find_card(AP, 51)].before_unit_activation = function () {
    filter_activation_units((u, piece) => piece.class === "air", AP)
}

cards[find_card(AP, 52)].event = function () {
    call("draw_from_discard")
}

cards[find_card(AP, 55)].before_battle_roll = function (faction) {
    if (faction === AP || G.offensive.battle.ground_stage) {
        return
    }
    var modifier = 0
    G.offensive.battle.air_naval[JP].filter(u => unit_on_board(u)).map(u => pieces[u]).forEach(piece => {
        if (piece.class === "naval" && piece.br) {
            G.offensive.battle.strength[faction] -= 2
            modifier -= 2
        }
    })
    if (modifier) {
        log(`${modifier} Attack strength (The Great Marianas Turkey Shoot).`)
    }
}

cards[find_card(AP, 55)].before_pbm = function () {
    call("turkey_shoot")
}

P.turkey_shoot = {
    _begin() {
        L.allowed_units = []
        G.offensive.active_units[JP].forEach(u => {
            if (unit_on_board(u) && pieces[u].class === "air") {
                set_add(L.allowed_units, u)
            }
        })
        for_each_unit_on_map((u, piece, location) => {
            if (piece.faction === JP && piece.class === "air" && set_has(G.offensive.all_bh, location)) {
                set_add(L.allowed_units, u)
            }
        })
        G.active = AP

    },
    inactive: "apply card effect",
    prompt() {
        prompt(`The Great Marianas Turkey Shoot. Choose unit to hit.`)
        if (L.done || L.allowed_units.length === 0) {
            button("done")
        } else {
            L.allowed_units.forEach(u => action_unit(u))
        }

    },
    unit(u) {
        push_undo()
        log("The Great Marianas Turkey Shoot:")
        damage_unit(u)
        L.done = 1
    },
    done() {
        push_undo()
        end()
    }
}

cards[find_card(AP, 57)].before_unit_activation = function () {
    filter_activation_units((u, piece) => (is_commonwelth(piece) || piece.class === "air" || piece.service === "ch") && piece.service !== "du", AP)
}

cards[find_card(AP, 58)].before_unit_activation = cards[find_card(AP, 57)].before_unit_activation

cards[find_card(AP, 60)].can_play = function () {
    return G.location[B_29_1] === CHINA_BOX || G.location[B_29_2] === CHINA_BOX
}

function discard_random_card(faction) {
    if (!G.hand[faction].length) {
        log(`${side_get_log_str(faction)} hand is empty, could not discard random card.`)
        return
    }
    var i = G.hand[faction][random(G.hand[faction].length)]
    discard_card(i)
    log(`${card_get_log_str(i)} discarded.`)
    if (i === TOJO_RESIGNS && G.turn >= 8) {
        cards[i].event()
    }
    clear_undo()
}

cards[find_card(AP, 60)].event = function () {
    discard_random_card(JP)
}

cards[DARTER_DACE].can_play = () => has_active_naval_units(JP)

cards[DARTER_DACE].before_battles = function () {
    call("submarine_attack", {success: 4, critical: 7, card: DARTER_DACE})
}

cards[KING_II].before_commit_offensive = function () {
    if (G.offensive.stage !== ATTACK_STAGE || G.active === JP) {
        return
    }
    if (!G.offensive.battle_hexes.filter(h => get_map_data(h).region === "Philippines").length) {
        return "At least one battle hex should be Philippines"
    }
}

cards[find_card(AP, 65)].before_activation = function () {
    set_inter_service(AP, 0)
}

cards[find_card(AP, 65)].before_commit_offensive = cards[KING_II].before_commit_offensive

cards[find_card(AP, 67)].can_play = function () {
    return get_distance(G.location[B_29_1], TOKYO) <= 8 || get_distance(G.location[B_29_2], TOKYO) <= 8
}

cards[find_card(AP, 67)].event = cards[find_card(AP, 60)].event


cards[find_card(AP, 68)].can_play = () => has_active_naval_units(JP)

cards[find_card(AP, 68)].after_battles = function () {
    call("submarine_attack", {success: 7, card: find_card(AP, 68)})
}

cards[find_card(AP, 69)].before_commit_offensive = function () {
    if (G.offensive.stage !== ATTACK_STAGE || G.active === JP) {
        return
    }
    call("airborne_landing")
}

P.airborne_landing = {
    _begin() {
        L.allowed_hexes = []
        var unit = ap_army("11_d")
        if (G.location[unit] > LAST_BOARD_HEX) {
            end()
            return;
        }
        if (set_has(G.offensive.active_units[AP], unit)) {
            return
        }
        var air_location = G.location[unit]
        var range = 0
        for_each_unit_on_map((u, piece, location) => {
            if (is_us_unit(piece) && piece.class === "air" && location === air_location && !set_has(G.oos, u) && range < piece.ebr) {
                range = piece.ebr
            }
        })
        if (range <= 0) {
            return
        }
        check_supply()
        for_each_hex_in_range(air_location, range, h => {
            if (!has_non_n_zoi(h, JP) && !is_faction_units(h, JP) && !is_faction_units(h, AP) && get_map_data(h).terrain > OCEAN) {
                set_add(L.allowed_hexes, h)
            }
        })
    },
    inactive: "apply card effect",
    prompt() {
        if (L.allowed_hexes.length <= 0) {
            button("skip")
        }
        prompt(`Choose hex to place ${piece_get_log_str(ap_army("11_d"))}.`)
        L.allowed_hexes.forEach(h => action_hex(h))
    },
    skip() {
        push_undo()
        log("Airborne landing skipped.")
        end()
    },
    action_hex(h) {
        push_undo()
        log(`${piece_get_log_str(ap_army("11_d"))} landed at ${hex_get_log_str(h)}.`)
        set_location(ap_army("11_d"), h)
        capture_hex(h, AP)
        end()
    }
}

cards[find_card(AP, 70)].before_activation = function () {
    call("place_armor")
}

P.place_armor = {
    _begin() {
        check_supply()
        mark_supplied_hexes(G.active)
        var regions = ["NIndia", "Burma", "India", "Ceylon"]
        L.allowed_hexes = get_unit_reinforcement_hexes(ARMOR_BRIGADE).filter(h => regions.includes(get_map_data(h).region))
        set_delete(G.reduced, ARMOR_BRIGADE)

    },
    inactive: "place unit",
    prompt() {
        if (L.allowed_hexes.length <= 0) {
            button("eliminate")
            prompt(`Could not place ${piece_get_log_str(ARMOR_BRIGADE)}.`)
            return
        }
        prompt(`Choose hex to place ${piece_get_log_str(ARMOR_BRIGADE)}.`)
        L.allowed_hexes.forEach(h => action_hex(h))
    },
    action_hex(h) {
        push_undo()
        set_location(ARMOR_BRIGADE, h)
        end()
    },
    eliminate() {
        push_undo()
        log(`Could not place ${piece_get_log_str(ARMOR_BRIGADE)}.`)
        eliminate_permanently(ARMOR_BRIGADE)
        end()
    }
}

cards[find_card(AP, 70)].before_unit_activation = cards[find_card(AP, 57)].before_unit_activation

cards[find_card(AP, 72)].before_reaction = function () {
    var condition = false
    G.offensive.active_units[AP].forEach(u => {
        var target = get_unit_battle_hex(u)
        var piece = pieces[u]
        if (is_us_unit(piece) && piece.class === "naval" && piece.br && set_has(G.offensive.battle_hexes, target)
            && get_map_data(target).region === "Japan") {
            condition = true
        }
    })
    if (condition) {
        log(`Carrier raids on Japan:`)
        discard_random_card(JP)
    }
}

cards[find_card(AP, 74)].before_commit_offensive = function () {
    if (G.offensive.stage !== ATTACK_STAGE || G.active === JP) {
        return
    }
    var condition = false
    map_for_each(G.offensive.paths, (u, path) => {
        var target = path[path.length - 1]
        var piece = pieces[u]
        if (piece.class === "ground" && path[0] & AMPH_MOVE
            && get_distance(TOKYO, target) <= 10) {
            condition = true
        }
    })
    if (!condition) {
        return "Allied ground unit must make an amphibious move within 10 hexes from Tokyo."
    }
}

cards[find_card(AP, 75)].before_commit_offensive = cards[find_card(AP, 74)].before_commit_offensive


cards[find_card(AP, 76)].before_unit_activation = function () {
    if (G.active === JP) {
        return
    }
    L.possible_units = get_activatable_units(G.offensive.active_hq[G.active], pieces[HQ_ANZAC].supply)
    filter_activation_units((u, piece) => piece.class !== "ground" || piece.service === "au", AP)
}

function x_craft_targets() {
    var allowed_units = []
    for_each_unit_on_map((u, piece, location) => {
        if (piece.faction === JP && piece.class === "naval"
            && !set_has(G.offensive.active_units[JP], u) && get_map_data(location).region !== "Japan"
        ) {
            set_add(allowed_units, u)
        }
    })
    return allowed_units
}

cards[find_card(AP, 78)].can_play = function () {
    return x_craft_targets().length
}

cards[find_card(AP, 78)].before_battles = function () {
    var allowed_units = x_craft_targets()
    call("submarine_attack", {success: 7, card: find_card(AP, 78), pre_allowed_units: allowed_units})
}

cards[SOVIET_INVADE].can_play = function () {
    return is_event_active(events.TOJO)
}

cards[SOVIET_INVADE].event = function () {
    capture_hex(hex_to_int(3302))
    capture_hex(hex_to_int(3303))
    update_china_status(-2, true)
}

cards[find_card(AP, 80)].event = function () {
    check_event(events.SUBMARINE_DOCTRINE)
    if (is_event_active(events.JP_ESCORTS)) {
        log(`JP lose escort bonus.`)
        G.events[events.JP_ESCORTS.id] = 0
    }
}

cards[CARRIER_RAID].before_unit_activation = function () {
    filter_activation_units((u, piece) => is_us_unit(piece) && piece.class === "naval" && piece.br, AP)
}
