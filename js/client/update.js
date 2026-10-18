function update_hand(side) {
    var hand = G.hand[side]
    var fo_card, fo_card_id

    if (G.future_offensive[side] > 0) {
        fo_card = "card"
        fo_card_id = G.future_offensive[side]
        populate("hand", side, "card", G.future_offensive[side])
    } else if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        fo_card = "fo-card"
        fo_card_id = side
        populate("hand", side, "fo-card", side)
    }

    if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] === G.turn) {
        populate_generic(fo_card, fo_card_id, counters.future_offensive_inactive)
    } else if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        if (side === AP)
            populate_generic(fo_card, fo_card_id, counters.future_offensive_ap)
        else
            populate_generic(fo_card, fo_card_id, counters.future_offensive_jp)
    }

    if (Array.isArray(G.hand[side])) {
        if (side === AP)
            populate_with_list("hand", side, "card", G.hand[side], "card card_ap_0")
        else
            populate_with_list("hand", side, "card", G.hand[side], "card card_jp_0")
    } else {
        if (side === AP)
            populate_generic("hand", side, "card card_ap_0", G.hand[side])
        else
            populate_generic("hand", side, "card card_jp_0", G.hand[side])
    }
}

function apply_conflict_marker(marker, hex) {
    marker.innerText = String.fromCharCode(65 + G.offensive.battle_names.indexOf(hex))
}

function update_unit(u, location) {
    var piece = pieces[u]
    var one_step = piece.notreplaceable && piece.start_reduced
    var last_turn = Math.max(map_info.turn_a, map_info.turn_b)

    if (location > TURN_BOX) {
        var turn = location - TURN_BOX
        if (turn <= 0 || turn > last_turn)
            populate("s-loc", ELIMINATED_BOX, "unit", u)
        else
            populate("turn", turn, "unit", u)

        update_keyword("unit", u, set_has(G.reduced, u) && !one_step)

        return
    }

    if (location === ELIMINATED_BOX && (!pieces[u].notreplaceable || is_action("unit", u)) || (location !== ELIMINATED_BOX && location >= 0 && location <= LAST_BOARD_HEX)) {
        populate("s-loc", location, "unit", u)

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

        var battle = map_get(G.offensive.committed, u)
        var battle_ix = battle ? G.offensive.battle_names.indexOf(battle) : 0
        var path = map_get(G.offensive.paths, u)
        if (path) path = path[0]

        if (battle && set_has(G.offensive.battle_hexes, battle)) {
            populate_generic("unit", u, "marker conflict battle letter" + battle_ix)
        } else if (battle && set_has(G.offensive.landing_hexes, battle)) {
            populate_generic("unit", u, "marker conflict landing letter" + battle_ix)
        } else if (battle && (piece.parenthetical || piece.class === "ground")) {
            populate_generic("unit", u, "marker conflict battle gray letter" + battle_ix)
        } else if (piece.organic && !(path & STRAT_MOVE) && G.offensive.organic.includes(u)) {
            populate_generic("unit", u, counters.organic_small)
        } else if (set_has(G.oos, u)) {
            populate_generic("unit", u, counters.oos_small)
        } else {
            for (var m of UNIT_MOVEMENT_MARKERS) {
                if (m.condition(u, piece, path)) {
                    populate_generic("unit", u, m.counter)
                    break // only first one that matches
                }
            }
        }
    }
}

function get_isr_marker(v, i) {
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
    if (focus_hq_range[0] && focus_hq && G.location[focus_hq] < LAST_BOARD_HEX) {
        mark_activation_zone(focus_hq)
        for_each_hex_in_range(G.location[focus_hq], pieces[focus_hq].cr, hex => {
            if (G.supply_cache[hex] & HEX_TEMP_FLAG3)
                if (set_has(ALL_BOARD_HEXES, hex))
                    update_keyword("zoi_hex", hex, "yellow")
        })
    } else {
        var focused = []
        for_each_hex_in_range(focus_hq_range[0], focus_hq_range[1], hex => set_add(focused, hex))
        focused = in_range_on_map(focus_hq_range[0], focus_hq_range[1], focused, AP)
        for (var hex of focused)
            if (set_has(ALL_BOARD_HEXES, hex))
                update_keyword("zoi_hex", hex, "yellow")
    }

    // STACKING VIOLATIONS
    if (G.violations.length > 0) {
        for (var h of G.violations)
            update_keyword("action_hex", h, "violation")
        update_text_html("violations", 0, "<b>STACKING VIOLATIONS:</B>\n" + escape_text(G.violations.map(h => "H"+h).join(", ")) + ".")
    }

    // AMPHIBIOUS HEXES
    for (var u of G.offensive.active_units[G.offensive.attacker]) {
        var piece = pieces[u]
        var location = G.location[u]
        if (
            G.offensive.stage !== POST_BATTLE_STAGE &&
            piece.class === "ground" &&
            location < LAST_BOARD_HEX &&
            (!get_map_data(location).port || !is_space_controlled(location, G.offensive.attacker)) &&
            map_get(G.offensive.paths, u, [ 0 ])[0] & AMPH_MOVE
        )
            update_keyword("action_hex", location, "amph")
    }

    // CARDS
    update_hand(JP)
    update_hand(AP)
    for (let c of G.offensive.active_cards)
        populate("hand", 2, "card", c)

    for (var h of G.offensive.battle_hexes)
        populate("s-loc", h, "battle", G.offensive.battle_names.indexOf(h))

    for (var h of G.offensive.landing_hexes)
        if (get_map_data(h).named && is_space_controlled(h, 1 - G.offensive.attacker) && has_zoi(h, 1- G.offensive.attacker))
            populate("s-loc", h, "landing", G.offensive.battle_names.indexOf(h))

    // MISC MARKERS

    populate("track-isr", JP, "marker-isr", JP)
    populate("track-isr", AP, "marker-isr", AP)
    update_keyword("marker-isr", JP, "reduced", !G.inter_service[JP])
    update_keyword("marker-isr", AP, "reduced", !G.inter_service[AP])

    populate("track-pw", G.political_will, "marker-pw", 0)
    populate("track-wie", G.wie, "marker-wie", 0)

    populate("track-china", Math.min(5, G.events[events.CHINA_STATUS.id]), "marker-china", 0)
    if (G.sid !== SOUTH_PACIFIC_SCENARIO) {
        populate("track-india", Math.max(0, 4 - G.events[events.INDIA_STATUS.id]), "marker-india", 0)
        update_keyword("marker-india", 0, "reduced", G.events[events.INDIA_STATUS.id] >= 5)
        populate("track-burma", 2 - G.burma_road, "marker-burma", 0)
        update_keyword("marker-burma", 0, "reduced", G.events[events.HUMP.id])
        populate("track-divisions", G.china_divisions + 1, "marker-divisions", 0)
    }

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
