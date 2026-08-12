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
    var result = G.wie > 2 || piece.service === "army" && G.inter_service[AP] || (is_event_active(events.PANAMA_CANAL) === G.turn - 1)
    if (result) {
        set_location(u, DELAYED_BOX)
        if (could_sent_to_europe(u)) {
            set_add(L.europe, u)
        }
    }
    return result
}

function could_sent_to_europe(u) {
    var piece = pieces[u]
    return (piece.faction === AP && G.wie >= 3 && (piece.service === "army" || piece.type === "cve") && !piece.b29)
}

function sent_to_europe(u) {
    var result = false
    if (!could_sent_to_europe(u)) {
        return result
    }
    var modifier = wie_roll_result() + G.inter_service[AP]
    var roll = random(10)
    clear_undo()
    result = roll <= modifier
    log(`${piece_get_log_str(u)}: ${dice_get_log_str(roll, 0, AP)} ${result ? "<=" : ">"} ${modifier}${G.inter_service[AP] ? " (ISR active)" : ""}.`)
    if (result) {
        displace_to_turn(u, 3)
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
    var i = hex_to_int(1308)
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        var map_data = get_map_data(i)
        if ((piece.class === "air" && map_data.airfield || piece.class !== "air" && map_data.port)
            && is_space_controlled(i, faction)
            && check_unit_supply(i, u, piece)
            && !has_non_n_zoi(i, 1 - faction)
            && !is_overstack(i, u)) {
            set_add(result, i)
        }
    }
    if (faction === AP && piece.class === "air" && G.burma_road < 2 && G.surrender[nations.CHINA.id] < 5 && !is_overstack(CHINA_BOX, u)
        && (!piece.b29 || G.location[B_29_1] !== CHINA_BOX && G.location[B_29_2] !== CHINA_BOX)) {
        set_add(result, CHINA_BOX)
    }
    if (globalThis.RTT_FUZZER && result.length === 0) {
        result = HQ_LIST.filter(u => pieces[u].faction === faction && G.location[u] < LAST_BOARD_HEX)
    }
    return result
}

function get_hq_reinforcement_hexes() {
    let result = []
    const faction = G.active
    var supply = G.active === AP ? JOINT_SUPPLIED_HEX : JP_SUPPLIED_HEX
    let queue = []
    const overland_set = []
    const oversea_set = []
    var hqs = []
    HQ_LIST.forEach(u => set_add(hqs, G.location[u]))
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        if (get_map_data(i).supply_source & supply) {
            queue.push(i)
            set_add(overland_set, i)
            set_add(oversea_set, i)
            if (get_map_data(i).port && is_space_controlled(i, faction) && !set_has(hqs, i) && !has_non_n_zoi(i, 1 - faction)) {
                set_add(result, i)
            }
        }
    }
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        const overland = set_has(overland_set, item)
        const non_neutral_zoi_s = has_non_n_zoi(item, 1 - faction)
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
            const non_neutral_zoi = non_neutral_zoi_s || has_non_n_zoi(nh, 1 - faction)
            if (!set_has(oversea_set, nh) && (oversea || (MD.port && !enemy_port)) && MD.edges_int & WATER << 5 * j && !non_neutral_zoi) {
                reachable = true
                set_add(oversea_set, nh)
            }
            if (reachable) {
                queue.push(nh)
            }
            if (reachable && get_map_data(nh).port && is_space_controlled(nh, faction) && !set_has(hqs, nh) && !has_non_n_zoi(nh, 1 - faction)) {
                set_add(result, nh)
            }
        }
    }
    return result
}

function is_reinforcement_denied(piece) {
    return (piece.service === "au" && is_event_active(events.AUSTRALIA_SURRENDER) && !set_has(G.reduced, piece.u))
        || (piece.service === "ind" && G.surrender[nations.INDIA.id] >= 4)
        || (L.INDEPENDENCE_CAMPAIGN && piece.class === "ground" &&
            (piece.service === "ind" || piece.service === "au" || piece.service === "br"));
}

function update_reinf_active() {
    if (L.unit_reinforcement.length) {
        P.reinforcement_segment.unit(L.unit_reinforcement[0])
    } else {
        G.active_stack = []
    }
}

P.reinforcement_segment = {
    _begin() {
        mark_supplied_hexes(G.active)
        if (G.wie <= 7 && G.active === AP && G.sid !== BURMA_SCENARIO) {
            change_asp(AP, 1)
        } else if (G.active === AP && G.wie >= 7) {
            log(`War in europe prevent from AP amphibious shipping reinforcement.`)
        }
        if (G.active === AP && (is_event_active(events.PANAMA_CANAL) === G.turn - 1) && G.wie < 3) {
            log(`AP reinforcements delayed due to Panama canal attack.`)
        }
        L.hq_reinforcement = []
        L.unit_reinforcement = []
        L.europe = []
        L.europe1 = []
        var reinforcement_hex = G.active === AP ? AP_REINF : JP_REINF
        var delayed_units = false
        for_each_unit((u, piece, location) => {
            if (piece.faction !== G.active || !(
                    piece.reinforcement === G.turn
                    || location === DELAYED_BOX
                    || location === TURN_BOX + G.turn
                )
                || location === PERM_ELIMINATED) {
                return
            }
            if (piece.reinforcement === G.turn && piece.start_reduced) {
                set_add(G.reduced, u)
            }
            if (piece.service === "au" && is_event_active(events.AUSTRALIA_SURRENDER)) {
                log(`Unit eliminated due to Australia surrender.`)
                eliminate_permanently(u)
                return;
            } else if (piece.service === "ind" && G.surrender[nations.INDIA.id] >= 4) {
                log(`Unit eliminated due to India surrender.`)
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
            log(`AP reinforcements delayed.`)
        }
        update_reinf_active()
        if (L.hq_reinforcement.length === 0 && L.unit_reinforcement.length === 0) {
            log("No possible reinforcements.")
            end()
            return
        }
    },
    inactive: "place reinforcements",
    prompt() {
        if (L.europe.length) {
            prompt(`Sent to Europe die roll. ${L.europe.length} delayed units eligible.`)
            button("roll")
            return
        }
        if (G.active_stack.length) {
            L.allowed_hexes.forEach(hex => action_hex(hex))
            if (L.allowed_hexes.length === 0) {
                prompt(`It's not possible to place ${piece_get_log_str(G.active_stack[0])} as a reinforcement. Press delay to move on to the next reinforcement.`)
                button("delay")
            } else {
                prompt(`Choose hex to place ${piece_get_log_str(G.active_stack[0])} as a reinforcement.`)
            }
        } else if (L.europe1.length > 0) {
            prompt(`Sent to Europe die roll. ${L.europe1.length} delayed units eligible.`)
            button("roll")
            return
        } else {
            prompt(`Place reinforcements. (Done).`)
        }
        var hq_in_list = false
        L.hq_reinforcement.filter(hq => L.unit_reinforcement.includes(hq)).forEach(hq => {
            hq_in_list = true
            if (G.active_stack.length && G.active_stack[0] !== hq) {
                action_unit(hq)
            }
        })
        if (hq_in_list) {
            return
        }
        L.unit_reinforcement.forEach(u => {
            if (G.active_stack.length && G.active_stack[0] !== u) {
                action_unit(u)
            }
        })
        if (!L.unit_reinforcement.length) {
            button("done")
        }
    },
    roll() {
        log(`Sent to Europe roll:`)
        if (L.europe1.length) {
            L.europe = L.europe1
        }
        L.europe.forEach(u => sent_to_europe(u))
        L.europe = []
        L.europe1 = []
        clear_undo()
    },
    unit(u) {
        G.active_stack = [u]
        if (pieces[u].class !== "hq") {
            L.allowed_hexes = get_unit_reinforcement_hexes(u)
            if (G.sid === BURMA_SCENARIO) {
                // 17.11.17. Turn 8 Japanese reinforcements: 29th Army (reduced) arrives
                //in Rangoon if it is Japanese controlled else it is lost.
                // 17.11.18. Turn 9 Allied reinforcements: US B29. If China has not
                // surrendered and the Allies have an eligible airbase in Northern
                // India the B29 arrives in the Air Units in China Box.
                L.allowed_hexes = L.allowed_hexes.filter(hex => hex === RANGOON || hex === CHINA_BOX)
            }
        } else {
            L.allowed_hexes = get_hq_reinforcement_hexes()
        }
    },
    action_hex(hex) {
        push_undo()
        set_delete(L.unit_reinforcement, G.active_stack[0])
        set_location(G.active_stack[0], hex)
        if (pieces[G.active_stack[0]].class === "hq") {
            set_delete(L.allowed_hexes, hex)
            G.supply_cache[hex] |= pieces[G.active_stack[0]].supply
        }
        update_reinf_active()
    },
    delay() {
        push_undo()
        set_location(G.active_stack[0], DELAYED_BOX)
        log(`${piece_get_log_str(G.active_stack[0])} voluntary delayed to next turn.`)
        if (could_sent_to_europe(G.active_stack[0])) {
            set_add(L.europe1, G.active_stack[0])
        }
        set_delete(L.unit_reinforcement, G.active_stack[0])
        update_reinf_active()
    },
    done() {
        push_undo()
        check_supply()
        end()
    }
}

P.replacement_segment = {
    _begin() {
        if (G.active === JP && L.replacement_points && L.replacement_points[NAVAl_REP]) {
            G.reinforcements[NAVAl_REP] += L.replacement_points[NAVAl_REP]
        }
        if (G.active === JP && L.replacement_points && L.replacement_points[AIR_REP]) {
            G.reinforcements[AIR_REP] += L.replacement_points[AIR_REP]
        }
        check_supply()
        mark_supplied_hexes(G.active)
        if (L.scheduled_points) {
            scenario_data().replacement_points()
        }
        L.divisions_used = 0
        L.replacable_units = []
        L.allowed_hexes = []
        L.returned = []
        for_each_unit((u, piece, location) => {
            if (piece.faction === G.active
                && !piece.notreplaceable
                && !is_reinforcement_denied(piece)
                && !set_has(G.oos, u)
                && (location === ELIMINATED_BOX || set_has(G.reduced, u) && (location === CHINA_BOX || location < LAST_BOARD_HEX))
                && (location !== ELIMINATED_BOX || piece.service !== "ch" || G.burma_road < 2)
            ) {
                set_add(L.replacable_units, u)
            }
        })
        trigger_event("before_replacement")
    },
    inactive: "use replacements",
    prompt() {
        var ru = L.replacable_units.filter(u => L.replacement_points[pieces[u].replacement] > 0)
        var not_used_unground = L.divisions_used <= 0 || L.replacement_points[GROUND_REP] <= 0
        var first_replacable = ru.filter(u => G.location[u] === ELIMINATED_BOX)[0]
        if (G.active_stack.length > 0) {
            prompt(`Choose hex to place ${piece_get_log_str(G.active_stack[0])}${not_used_unground ? "" : "(Ground replacements should be spent)"}.`)
            L.allowed_hexes.forEach(h => action_hex(h))
            ru.filter(u => G.location[u] === ELIMINATED_BOX).forEach(u => action_unit(u))
            L.returned.filter(u => G.active_stack[0] !== u).forEach(u => action_unit(u))
            return
        }
        if (!ru.length) {
            button("done")
        } else if (not_used_unground) {
            button("skip")
        }
        if (L.divisions && L.replacable_units.filter(u => pieces[u].class === "ground").length) {
            action("divisions", 0)
            button("divisions_button")
        }

        prompt(`Choose unit to reinforce ${print_reinforcements()}${ru.length || L.divisions ? "" : " (Done)"}.`)
        ru.forEach(u => action_unit(u))

    },
    divisions_button() {
        this.divisions()
    },
    divisions() {
        push_undo()
        L.divisions -= 1
        G.china_divisions -= 1
        L.divisions_used++
        log(`JP divisions in China reduced to ${G.china_divisions}.`)
        if (L.replacement_points[GROUND_REP]) {
            L.replacement_points[GROUND_REP]++
        } else {
            L.replacement_points[GROUND_REP] = 1
        }
    },
    action_hex(hex) {
        push_undo()
        set_location(G.active_stack[0], hex)
        set_delete(L.returned, G.active_stack[0])
        G.active_stack = []
        if (L.returned.length) {
            G.active_stack = [L.returned[0]]
            L.allowed_hexes = get_unit_reinforcement_hexes(L.returned[0])
            trigger_event("before_place_replacement")
        }
    },
    unit(u) {
        if (G.location[u] === get_service_reinf_hex()) {
            G.active_stack = [u]
            L.allowed_hexes = get_unit_reinforcement_hexes(u)
            trigger_event("before_place_replacement")
            return
        }

        push_undo()
        if (set_has(G.reduced, u)) {
            set_delete(G.reduced, u)
            set_delete(L.replacable_units, u)
            log(`${piece_get_log_str(u)} flipped to full size.`)
        } else {
            set_add(G.reduced, u)
            G.active_stack = [u]
            G.location[u] = get_service_reinf_hex()
            set_add(L.returned, u)
            if (pieces[u].b29) {
                G.b29u |= B29_REPLACED << pieces[u].b29
            }
            L.allowed_hexes = get_unit_reinforcement_hexes(u)
            trigger_event("before_place_replacement")
        }
        L.replacement_points[pieces[u].replacement] -= 1
        if (G.active === JP && (pieces[u].replacement === AIR_REP || pieces[u].replacement === NAVAl_REP)) {
            G.reinforcements[pieces[u].replacement] -= 1
        }
    },
    skip() {
        this.done()
    },
    done() {
        push_undo()
        check_supply()
        end()
    }
}