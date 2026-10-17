function update_hand(side) {
    var fo_card
    if (G.future_offensive[side] > 0) {
        fo_card = populate("hand", side, "card", G.future_offensive[side])
    } else if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        fo_card = populate_generic_to_parent(lookup_thing("hand", side).element, side === JP ? "card card_jp_0" : "card card_ap_0")
    }

    if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] === G.turn) {
        populate_generic_to_parent(fo_card, counters.future_offensive_inactive)
    } else if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        populate_generic_to_parent(fo_card, ((side === AP) ? counters.future_offensive_ap : counters.future_offensive_jp))
    }

    if (!Array.isArray(G.hand[side])) {
        for (var i = 0; i < G.hand[side]; i++) {
            populate_generic("hand", side, side === JP ? "card card_jp_0" : "card card_ap_0").innerHTML = ''
        }
    } else {
        for (var i = 0; i < G.hand[side].length; i++) {
            if (G.hand[side][i] <= 0) {
                populate_generic("hand", side, side === JP ? "card card_jp_0" : "card card_ap_0").innerHTML = ''
            } else {
                var card = G.hand[side][i]
                populate("hand", side, "card", card)
            }
        }
    }
}


function update_unit(u, location) {
    var piece = pieces[u]
    var unit
    var one_step = piece.notreplaceable && piece.start_reduced
    var slocs = world.things["s-loc"]
    var turn = world.things["turn"]
    if (location > TURN_BOX) {
        if (!turn[location - TURN_BOX]) {
            unit = populate("s-loc", ELIMINATED_BOX, "unit", u)
        } else {
            unit = populate("turn", location - TURN_BOX, "unit", u)
        }
        unit.classList.toggle("reduced", (set_has(G.reduced, u) && !one_step))
        unit.classList.remove("activated")
        unit.classList.remove("selected")
    } else if (location === ELIMINATED_BOX && (!pieces[u].notreplaceable || is_action("unit", u))
        || (location !== ELIMINATED_BOX && slocs[location])) {
        unit = populate("s-loc", location, "unit", u)

        update_keyword("unit", u, "reduced",
            (set_has(G.reduced, u) && !one_step) || location === ELIMINATED_BOX
            || pieces[u].class === "hq" && G.inter_service[pieces[u].faction]
        )

        if (set_has(G.offensive.active_units[piece.faction], u))
            update_keyword("unit", u, "activated")
        if (G.active_stack.includes(u)) {
            update_keyword("unit", u, "selected")
            update_rotation("unit", u, 22.5)
        }

        unit.innerHTML = ''
        var battle = map_get(G.offensive.committed, u)
        var path = map_get(G.offensive.paths, u, [0])[0]
        // unit.classList.remove("gray")
        if (battle && set_has(G.offensive.battle_hexes, battle)) {
            apply_conflict_marker(populate_generic_to_parent(unit, "marker conflict battle"), battle)
        } else if (battle && set_has(G.offensive.landing_hexes, battle)) {
            apply_conflict_marker(populate_generic_to_parent(unit, "marker conflict landing"), battle)
        } else if (battle && (piece.parenthetical || piece.class === "ground")) {
            apply_conflict_marker(populate_generic_to_parent(unit, "marker conflict battle gray"), battle)
            // unit.classList.add("gray")
        } else if (piece.organic && !(path & STRAT_MOVE) && G.offensive.organic.includes(u)) {
            populate_generic_to_parent(unit, counters.organic_small)
        } else if (set_has(G.oos, u)) {
            populate_generic_to_parent(unit, counters.oos_small)
        } else {
            for (var i = 0; i < UNIT_MOVEMENT_MARKERS.length; i++) {
                var m = UNIT_MOVEMENT_MARKERS[i]
                if (m.condition(u, piece, path)) {
                    populate_generic_to_parent(unit, m.counter)
                    return
                }
            }
        }
    }
}

function get_control_marker(h) {
    var capture = set_has(G.capture, h)
    if (capture && is_space_controlled(h, JP)) {
        return counters.capture_jp
    } else if (is_space_controlled(h, JP)) {
        return counters.control_jp
    } else if (h === MANCHURIA_1 || h === MANCHURIA_2) {
        return counters.control_sov
    } else if (G.sid === BURMA_SCENARIO || BR_NATIONS.includes(HEX_BY_NATION[h])) {
        return counters.control_br
    } else {
        return counters.control_us
    }
}

function update_role_info(who) {
    var hand_size = Array.isArray(G.hand[who]) ? G.hand[who].length : G.hand[who]
    var fo = G.events[events.FUTURE_OFFENSIVE_JP.id + who]
    var text = `${hand_size} cards`
    if (fo && fo < G.turn)
        text += " + FO"
    if (G.passes[who])
        text += `, ${G.passes[who]} passes`
    roles[who].stat.textContent = escape_text(text)
}

function should_show_hex_control(i, all_control, vassal_control) {
	var hn = HEX_BY_NATION[i]
	var cont = is_space_controlled(i, JP) ? JP : AP
	if ((cont === AP && set_has(G.capture, i) && !all_control) || !(G.supply_cache[i] & HEX_CONTROLLABLE))
		return false
	var default_condition =
		(hn >= 0 && G.surrender[HEX_BY_NATION[i]] > 0 == cont) || (hn === -1 && cont === AP) || (hn < -1 && cont === JP)
	var vassal_condition = set_has(JP_BOUNDARY_HEX, i) + 0 === cont
	if (
		map_info.hex_check(i) &&
		cont !== null &&
		(all_control || (!is_faction_units(i, AP) && !is_faction_units(i, JP))) &&
		(all_control || (!vassal_control && default_condition) || (vassal_control && vassal_condition))
	)
		return true
	return false
}

function on_update() {
    begin_update()

    L = {} // for shared rules/play code and client-side states

    // CLIENT-SIDE SUPPLY CHECK
    check_supply()

    // LOCAL ACTIONS (PART 1)
    on_update_local_actions()

    update_role_info(JP)
    update_role_info(AP)

    // TODO: why are we mutating G here?
    map_for_each(G.offensive.damaged, (u, s) => {
        if (s > 2) {
            G.location[u] = ELIMINATED_BOX
        } else {
            set_add(G.reduced, u)
        }
    })
    if (G.pow <= 0) {
        G.capture = []
    }

    var supplied_hex = []
    for (var i = 1; i < pieces.length; ++i) {
        var loc = G.location[i]
        if (loc > 0) {
            if (!set_has(G.oos, i)) {
                set_add(supplied_hex, G.location[i])
            }
        }
    }
    // ^^^^

    // OVERLAY PATHS
    if (!get_preference("nopath", false)) {
        canvas_draw_paths()
    } else {
        canvas_clear_paths()
    }

    // CONTROL MARKERS
    var all_control = document.body.classList.contains("hide-pieces")
    var vassal_control = get_preference("fullcontrol", false)
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        if (should_show_hex_control(i, all_control, vassal_control)) {
            if (vassal_control)
                populate_generic("s-loc", i, get_control_marker(i) + " transparent")
            else
                populate_generic("s-loc", i, get_control_marker(i))
        }
    }

    // ELIMINATED GARRISONS
    for (var h of G.garr_elim)
        if (is_space_controlled(h, JP))
            populate_generic("s-loc", h, counters.no_garrison)

    // GARRISONS
    map_for_each(G.garrison, (h, count) => {
        if (count === 0)
            populate_generic("s-loc", h, "unit " + pieces[JP_GARRISON_JP].counter, 1)
        else
            populate_generic("s-loc", h, "unit " + pieces[JP_GARRISON_CN[0]].counter, count)
    })

    // ROADS
    var base_road_counters = get_preference("noroad", false)
    for (var event of ROAD_EVENTS) {
        if (map_info.hex_check(event.keys[0])) {
            var is_road_event_active = G.events[event.id]
            update_show("road", event.id, !is_road_event_active && !base_road_counters)
            if (event === events.KWAI_RIVER_BRIDGE && is_road_event_active)
                populate_generic("s-loc", event.keys[0], event.counter)
            if (event !== events.KWAI_RIVER_BRIDGE && !is_road_event_active && base_road_counters)
                populate_generic("s-loc", event.keys[0], event.counter)
        }
    }

    // TOKYO EXPRESS
    if (G.events[events.TOKYO_EXPRESS.id] > 0) {
        populate_generic("s-loc", G.events[events.TOKYO_EXPRESS.id], counters.tokyo_express)
    }

    // POWs
    if (G.pow > 0) {
        for (var h of G.capture)
            if (is_space_controlled(h, AP))
                populate_generic("s-loc", h, counters.pow)
    }

    // UNITS
    for (var i = 1; i < pieces.length; ++i) {
        var loc = G.location[i]
        if (loc > 0)
            update_unit(i, G.location[i])
    }

    if (G.unselect)
        for (var u of G.unselect)
            update_keyword("unit", u, "unselect")

    // OUT OF SUPPLY MARKERS
    var oos_hex_set = []
    for (i = 0; i < G.oos.length; i++) {
        var hex = G.location[G.oos[i]]
        if (hex <= LAST_BOARD_HEX && !set_has(oos_hex_set, hex) && !set_has(supplied_hex, hex)) {
            var counter = counters.isolated
            if (HQ_LIST.some(hq => G.location[hq] < LAST_BOARD_HEX && hex < LAST_BOARD_HEX
                && pieces[hq].faction === pieces[G.oos[i]].faction
                && in_range_on_map(G.location[hq], pieces[hq].cr, [hex], pieces[hq].faction).length)) {
                counter = counters.oos
            }
            populate_generic("s-loc", hex, counter)
            set_add(oos_hex_set, hex)
        }
    }

    // ZONE OF INFLUENCE
    if (!get_preference("hidezoi", false)) {
        for (var hex of ALL_BOARD_HEXES) {
            const zoi_state = G.supply_cache[hex]
            update_keyword("zoi_hex", hex, "lrb", (zoi_state & 7) === 3)
            update_keyword("zoi_hex", hex, "contested", (zoi_state & 3) === 3)
            update_keyword("zoi_hex", hex, "jp", (zoi_state & 1) === 1)
            update_keyword("zoi_hex", hex, "ap", (zoi_state & 2) === 2)
        }
    }

    // HQ RANGE
    // TODO: focused has invalid hexes, so need to filter by ALL_BOARD_HEXES
    if (world.range[0] && world.hq && G.location[world.hq] < LAST_BOARD_HEX) {
        mark_activation_zone(world.hq)
        for_each_hex_in_range(G.location[world.hq], pieces[world.hq].cr, hex => {
            if (G.supply_cache[hex] & HEX_TEMP_FLAG3)
                if (set_has(ALL_BOARD_HEXES, hex))
                    update_keyword("zoi_hex", hex, "yellow")
        })
    } else {
        var focused = []
        for_each_hex_in_range(world.range[0], world.range[1], hex => set_add(focused, hex))
        focused = in_range_on_map(world.range[0], world.range[1], focused, AP)
        for (var hex of focused)
            if (set_has(ALL_BOARD_HEXES, hex))
                update_keyword("zoi_hex", hex, "yellow")
    }

    // VIOLATIONS
    if (G.violations.length > 0) {
        for (var h of G.violations)
            update_keyword("action_hex", h, "violation")
        update_text_html("violations", 0, "<b>STACKING VIOLATIONS:</B>\n" + escape_text(G.violations.map(h => "H"+h).join(", ")) + ".")
    }






    highlight_aa()

    world.things["card"].forEach(e => e.element.innerHTML = '')
    if (G.offensive.active_cards.length > 0) {
        document.getElementById("active_cards").classList.remove("hide")
        for (let i = 0; i < G.offensive.active_cards.length; i++) {
            populate("hand", 2, "card", G.offensive.active_cards[i])
        }
    } else {
        document.getElementById("active_cards").classList.add("hide")
    }
    update_hand(AP)
    update_hand(JP)

    G.offensive.battle_hexes.forEach(h => populate("s-loc", h, "battle", G.offensive.battle_names.indexOf(h)))
    G.offensive.landing_hexes.filter(h => get_map_data(h).named && is_space_controlled(h, 1 - G.offensive.attacker) && has_zoi(h, 1- G.offensive.attacker))
        .forEach(h => populate("s-loc", h, "landing", G.offensive.battle_names.indexOf(h)))
    var isr_marker = (v, i) => {
        if (v && i === AP) {
            return counters.rivalry_ap
        } else if (v && i === JP) {
            return counters.rivalry_jp
        } else if (i === AP) {
            return counters.agreement_ap
        } else {
            return counters.agreement_jp
        }
    }
    G.inter_service.forEach((v, i) => populate_generic("status", i, isr_marker(v, i)))
    populate_generic("pw", G.political_will, counters.pw)
    populate_generic("wie", G.wie, counters.wie)

    if (G.sid !== SOUTH_PACIFIC_SCENARIO) {
        populate_generic("india", Math.max(0, 4 - G.events[events.INDIA_STATUS.id]),
            (G.events[events.INDIA_STATUS.id] >= 5) ? counters.india_status_surrender : counters.india_status)
        populate_generic("burma", 2 - G.burma_road, G.events[events.HUMP.id] ? counters.burma_road_hump : counters.burma_road)
        populate("divisions", G.china_divisions + 1, `divisions`, 0)
    }

    populate_generic("china", Math.min(5, G.events[events.CHINA_STATUS.id]), counters.china)

    // TURN MARKERS

    var last_turn = Math.max(map_info.turn_a, map_info.turn_b)

    for (var key in nations) {
        var nation = nations[key]
        if (nation.counter) {
            var hex = nation.counter_hex
            var value = G.surrender[nation.id]
            if (nation.id === nations.MARSHALL.id)
                value = !value
            if (value > 0 && value <= last_turn)
                populate("turn", value, "nation-marker-turn", nation.id)
            if (hex && value && !vassal_control && map_info.hex_check(hex_to_int(hex)))
                populate("s-loc", hex_to_int(hex), "nation-marker-map", nation.id)
        }
    }

    for (i = 0; i < TURN_MARKERS.length; i++) {
        const marker = TURN_MARKERS[i]
        var v = marker.value(G)
        if (v > 0 && v <= last_turn) {
            populate("turn", v, "turn-marker", i)
            if (marker.reduced?.(G))
                update_keyword("turn-marker", i, "reduced")
        }
    }

    // TRACK MARKERS

    for (i = 0; i < TRACK_MARKERS.length; i++) {
        const marker = TRACK_MARKERS[i]
        var value = marker.value(G)
        if (value > 0 || marker.always_show?.(G)) {
            populate("track", value % 10, "track-marker", i)
            if (value > 9)
                update_keyword("track-marker", i, "reduced")
            if (marker.gray?.(G))
                update_keyword("track-marker", i, "gray")
        }
    }

    // LOCAL ACTIONS (PART 2)

    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].on_update()
    }

    // BUTTONS

    action_button("play_card", "Choose card")
    action_button("to_unit", "Rebuild unit")
    action_button("roll", "Roll")

    action_button("awaiting", "Prompt")
    action_button("continue", "Continue")
    action_button("bonus", "Use Bonus")
    action_button("event", "Play Event")
    action_button("ops", "Play for Operations")
    action_button("hold", "Hold")
    action_button("advanced_move", "More options")
    action_button("no_move", "No move")
    action_button("eliminate", "Eliminate")
    action_button("con_eliminate", "Eliminate")
    action_button("stop", "Stop")
    action_button("displace", "Displace")
    action_button("divisions_button", "Reduce divisions track")


    action_button("displace_hq", "HQ Withdrawal")
    action_button("return_hq", "Early HQ Return")
    action_button("inter_service", "Remove Inter-Service Rivalry")
    action_button("china_offensive", "China Offensive")
    action_button("future_offensive", "Future Offensive")
    action_button("jarhat", "Build Jarhat Road")
    action_button("imphal", "Build Imphal Road")
    action_button("ledo", "Build Ledo Road")
    action_button("discard", "Discard")


    action_button("all", "Choose all")
    action_button("pass", "Pass")
    action_button("skip", "Skip")
    action_button("range", "Range")

    action_button("confirm", "Confirm")
    action_button("next", "Next")
    action_button("done", "Done")
    action_button("delay", "Delay")
    action_button("no_organic", "Disable organic")
    action_button("avoid_zoi", "Avoid ZOI")
    action_button("strat_move", "Strategic")
    action_button("amphibious", "Amphibious")
    action_button("ground_move", "Ground")
    action_button("extended_air", "Extended range")
    action_button("barges", "Barges")

    action_button("redo", "Redo")
    action_button("undo", "Undo")

    end_update()

    // trigger log expansion if snapshot view goes beyond the start
    show_full_log_if_needed()
}

function highlight_aa() {
    world.amph.forEach(h => lookup_thing("action_hex", h).element.classList.remove("amph"))
    G.offensive.active_units[G.offensive.attacker].forEach(u => {
        var piece = pieces[u]
        var location = G.location[u]
        if (G.offensive.stage !== POST_BATTLE_STAGE && piece.class === "ground" && location < LAST_BOARD_HEX
            && (!get_map_data(location).port || !is_space_controlled(location, G.offensive.attacker))
            && map_get(G.offensive.paths, u, [0])[0] & AMPH_MOVE) {
            set_add(world.amph, location)
            lookup_thing("action_hex", location).element.classList.add("amph")
        }
    })
}

function apply_conflict_marker(marker, hex) {
    marker.innerText = String.fromCharCode(65 + G.offensive.battle_names.indexOf(hex))
}
