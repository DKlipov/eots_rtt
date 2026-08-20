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
    if (!events.ALLIED_NATIONS_SURRENDERS.nations.filter(n => !G.surrender[n]).length &&
        G.surrender[nations.INDIA.id] >= 4 && G.surrender[nations.CHINA.id] >= 5) {
        check_event(events.ALLIED_NATIONS_SURRENDERS)
    }
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
            var in_india = unit_on_board(u) && nations.INDIA.regions.includes(get_map_data(location).region)
            if (in_india && piece.class === "hq" && piece.service === "br") {
                eliminate(u)
            } else if (piece.service === "ind" && location <= LAST_BOARD_HEX || in_india) {
                set_add(L.unit_to_retreat, u)
            } else if (piece.service === "ind") {
                eliminate_permanently(u)
            }
        })
        G.surrender[nations.INDIA.id] = 5
        if (!L.unit_to_retreat.length) {
            this.update_control()
        }
        if (G.sid === BURMA_SCENARIO) {
            var vp = get_victory()
            log("#GVP Scoring")
            vp.text.forEach(t => log(t))
            log(`#GTotal VP: ${vp.vp}`)
            finish("Japan", "Japanese Victory - India Surrender")
            return;
        }
    },
    inactive: "execute India surrender sequence",
    prompt() {
        if (G.active_stack.length) {
            prompt(`India surrenders. Choose space to move.`)
            L.hex_to_retreat.forEach(u => action_hex(u))

            var piece = pieces[G.active_stack[0]]
            if (piece.service === "army" || piece.service === "navy" || piece.service === "us") {
                button("no_move")
            } else if (!L.hex_to_retreat.length) {
                button("eliminate")
            }
        } else if (L.unit_to_retreat.length) {
            prompt(`India surrenders. Choose unit to emergency move.`)
            L.unit_to_retreat.forEach(u => action_unit(u))
        }
        if (!G.active_stack.length && (!L.unit_to_retreat.length || L.unit_to_retreat.map(u => pieces[u])
            .filter(piece => piece.service === "army" || piece.service === "navy" || piece.service === "us").length === L.unit_to_retreat.length)) {
            prompt(`India surrenders. Confirm emergency move.`)
            button("done")
        }
    },
    eliminate() {
        push_undo()
        eliminate_permanently(G.active_stack[0])
        G.active_stack = []
    },
    no_move() {
        push_undo()
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
        set_location(G.active_stack[0], hex)
        G.active_stack = []
    },
    update_control() {
        G.non_control = []
        if (!is_faction_units(MADRAS, AP)) {
            set_add(G.non_control, MADRAS)
            log(`${hex_get_log_str(MADRAS)} uncontrolled.`)
        }
        if (!is_faction_units(hex_to_int(1805), AP)) {
            set_add(G.non_control, hex_to_int(1805))
            log(`${hex_get_log_str(hex_to_int(1805))} uncontrolled.`)
        }
    },
    done() {
        push_undo()
        this.update_control()
        end()
    }
}

function check_nation_controlled(nation, faction) {
    for (var i = 0; i < nation.keys.length; i++) {
        if (is_space_controlled(hex_to_int(nation.keys[i]), 1 - faction)) {
            return false
        }
    }
    return true
}

function check_nation_surrender(nation) {
    if (!check_nation_controlled(nation, G.surrender[nation.id] ? AP : JP)) {
        return false
    }
    var faction = (G.surrender[nation.id] ? AP : JP)
    G.surrender[nation.id] = (faction === AP) ? 0 : G.turn
    log(`${nation.name} ${faction === JP ? "surrender" : "liberated"}.`)
    if (nation.pw) {
        L.pw += nation.pw * (G.surrender[nation.id] ? -1 : 1)
    }
    return true
}

function set_control_over_nation(nation, only_ground = true) {
    clear_supply_cache(CLEAN_UNITS_MASK)
    for_each_unit_on_map(mark_unit)
    var faction = G.surrender[nation.id] ? JP : AP
    var captured = []
    for (var i = 1; i < LAST_BOARD_HEX; i++) {
        var hex_data = get_map_data(i)
        if (!nation.regions.includes(hex_data.region)) {
            continue
        }
        var no_enemy_units = (only_ground && !is_faction_ground_units(i, 1 - faction)) || !is_faction_units(i, 1 - faction)
        var control_changed = is_controllable_hex(i) && no_enemy_units
        if (control_changed) {
            capture_hex(i, faction, true)
            captured.push(i)
        }
    }
    if (captured.length) {
        log(`${side_get_log_str(faction)} captured: ${list_get_log_str(captured.length + " hexes", captured.map(u => hex_get_log_str(u)))}.`)
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
        log(`China status changed to ${nations.CHINA.statuses[G.surrender[nations.CHINA.id]]}.`)
    }
}

function degrade_india(could_revolt = false) {
    if (G.surrender[nations.INDIA.id] < (could_revolt ? 4 : 3)) {
        G.surrender[nations.INDIA.id] += 1
        log(`India status changed to ${nations.INDIA.statuses[G.surrender[nations.INDIA.id]]}.`)
        if (G.surrender[nations.INDIA.id] === 4) {
            L.pw -= nations.INDIA.pw
        }
    }
}

function india_stable() {
    if (G.surrender[nations.INDIA.id] === 0) {
        return
    } else if (G.surrender[nations.INDIA.id] < 4) {
        log(`India returned to stable.`)
        G.surrender[nations.INDIA.id] = 0
    }
}