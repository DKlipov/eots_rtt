function push_stack(stk, elt) {
    stk.unshift(elt)
    elt.my_stack = stk
}

function is_active_card(card) {
    for (let a of CARD_ACTIONS) {
        if (G.actions && G.actions[a] && set_has(G.actions[a], card)) {
            return true
        }
    }
    return false
}

function update_hand(side) {
    var fo_card;
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
        for (let i = 0; i < G.hand[side]; i++) {
            populate_generic("hand", side, side === JP ? "card card_jp_0" : "card card_ap_0").innerHTML = ''
        }
    } else {
        for (let i = 0; i < G.hand[side].length; i++) {
            let card = G.hand[side][i]
            populate("hand", side, "card", card)
        }
    }
}


function draw_paths() {
    map_for_each(G.offensive.paths, (k, v) => {
        if (G.location[k] > LAST_BOARD_HEX && G.location[k] !== CHINA_BOX) {
            return
        }
        var start = hex_center(v[2])
        var finish
        var color = pieces[k].faction ? "blue" : "red"
        var d = pieces[k].faction ? -2 : 2
        CANVAS_CTX.strokeStyle = color
        CANVAS_CTX.fillStyle = color
        CANVAS_CTX.lineWidth = 1;
        for (var j = 3; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            CANVAS_CTX.beginPath();
            if (v[j - 1] === v[j] || j === 3) {
                CANVAS_CTX.arc(start[0], start[1] + d, 4, 0, 2 * Math.PI);
                CANVAS_CTX.fill();
                CANVAS_CTX.stroke();
            }
            CANVAS_CTX.beginPath();
            if (G.location[k] === v[j - 1] && j === v.length - 1) {
                CANVAS_CTX.setLineDash([5, 3]);
            }
            CANVAS_CTX.moveTo(start[0], start[1] + d);
            CANVAS_CTX.lineTo(finish[0], finish[1] + d);
            CANVAS_CTX.stroke();
            CANVAS_CTX.setLineDash([])
        }
        if (finish) {
            CANVAS_CTX.beginPath();
            CANVAS_CTX.fillRect(finish[0] - 4, finish[1] - 4 + d, 8, 8)
            CANVAS_CTX.stroke();
        }
    })
}

function place_unit(u, location) {
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
        unit.classList.toggle("reduced", (set_has(G.reduced, u) && !one_step) || location === ELIMINATED_BOX
            || pieces[u].class === "hq" && G.inter_service[pieces[u].faction])
        unit.classList.toggle("activated", set_has(G.offensive.active_units[piece.faction], u))
        unit.classList.toggle("selected", G.active_stack.includes(u))
        unit.innerHTML = '';
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

function update_role_info() {
    for (let who = JP; who <= AP; who++) {
        var hand_size = Number.isInteger(G.hand[who]) ? G.hand[who] : G.hand[who].length
        var fo = G.events[events.FUTURE_OFFENSIVE_JP.id + who]
        roles[who].stat.innerHTML = `${hand_size} cards${fo && fo < G.turn ? " + FO" : ""}${G.passes[who] ? ", " + G.passes[who] + " passes" : ""}`
        if (!hand_size) {
            roles[who].stat.innerHTML = `Pass`
        }
    }
}


function on_update() {
    begin_update()
    check_supply()
    if (G.actions && !init_overstack_check(true, R)) {
        L.hexes = []
        L.allowed_units.forEach(u => set_add(L.hexes, G.location[u]))
        G.violations = L.hexes
        L.allowed_units = []
    }
    if (G.actions && G.actions.move) {
        L.allowed_hexes = []
        L.move_type = G.move_type
        update_move_hex()
        if (!G.actions.action_hex) {
            G.actions.action_hex = []
        }
        map_for_each(L.allowed_hexes, h => set_add(G.actions.action_hex, h))
    }
    document.body.classList.remove("hex-clickable")
    world.log_boxes = []
    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].prompt()
    }
    if (!G.proxy) {
        STORED_STATE = JSON.parse(JSON.stringify(G))
        G.proxy = 1
    }
    if (LOCAL_STATE) {
        G.actions = LOCAL_STATE.actions
        G.actions.proxy = 1
    }

    if (G.actions && G.actions["card"]) {
        G.actions["play_card"] = 1
    }
    if (G.actions && G.actions["unit"] && G.actions["unit"].filter(u => G.location[u] === ELIMINATED_BOX).length) {
        G.actions["to_unit"] = [G.actions["unit"].filter(u => G.location[u] === ELIMINATED_BOX)[0]]
    }

    update_role_info()
    map_for_each(G.offensive.damaged, (u, s) => {
        if (s > 2) {
            G.location[u] = ELIMINATED_BOX
        } else {
            set_add(G.reduced, u)
        }
    })
    clear_paths()
    if (!get_preference("nopath", false)) {
        draw_paths()
    }

    document.getElementById("vp_check_button").classList.toggle("disabled", CAMPAIGN_SCENARIOS.includes(G.sid))
    document.getElementById("pw_check_button").classList.toggle("disabled", G.sid === BURMA_SCENARIO)
    if (G.pow <= 0) {
        G.capture = []
    }
    var all_control = document.body.classList.contains("hide-pieces")
    var vassal_control = get_preference("fullcontrol", false)
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        var hn = HEX_BY_NATION[i]
        var cont = is_space_controlled(i, JP) ? JP : AP
        if (cont === AP && set_has(G.capture, i) && !all_control || !(G.supply_cache[i] & HEX_CONTROLLABLE)) {
            continue
        }
        var default_condition = (hn >= 0 && (G.surrender[HEX_BY_NATION[i]] > 0) == cont
            || hn === -1 && cont === AP
            || hn < -1 && cont === JP)
        var vassal_condition = (set_has(JP_BOUNDARY_HEX, i) + 0) === cont
        if (map_info.hex_check(i) && cont !== null && (all_control || !is_faction_units(i, AP) && !is_faction_units(i, JP))
            && (all_control || !vassal_control && default_condition || vassal_control && vassal_condition)
        ) {
            populate_generic("s-loc", i, get_control_marker(i) + (vassal_control ? " transparent" : ""))
        }
    }
    G.garr_elim.filter(h => is_space_controlled(h, JP)).forEach(h => populate_generic("s-loc", h, counters.no_garrison))
    var base_road_counters = get_preference("noroad", false)
    ROAD_EVENTS.filter(event => map_info.hex_check(event.keys[0])).forEach(event => {
        var thing = lookup_thing("road", event.id)
        var active = G.events[event.id]
        thing.element.classList.add("hide")
        if (!active && !base_road_counters) {
            thing.element.classList.remove("hide")
        }
        if ((event === events.KWAI_RIVER_BRIDGE && active)
            || (!active && base_road_counters && event !== events.KWAI_RIVER_BRIDGE)) {
            populate_generic("s-loc", event.keys[0], event.counter)
        }
    })
    if (G.events[events.TOKYO_EXPRESS.id] > 0) {
        populate_generic("s-loc", G.events[events.TOKYO_EXPRESS.id], counters.tokyo_express)
    }
    map_for_each(G.garrison, (h, count) => {
        var marker = JP_GARRISON_CN[0]
        if (count === 0) {
            count = 1
            marker = JP_GARRISON_JP
        }
        for (var i = 0; i < count; i++) {
            populate_generic("s-loc", h, "unit " + pieces[marker].counter)
        }
    })
    var supplied_hex = []
    for (var i = 1; i < pieces.length; ++i) {
        var loc = G.location[i]
        if (loc > 0) {
            place_unit(i, G.location[i])
            if (!set_has(G.oos, i)) {
                set_add(supplied_hex, G.location[i])
            }
        }
    }
    for (var thing of world.things["unit"]) {
        if (thing) {
            thing.element.classList.toggle("unselect", !!(G.unselect && set_has(G.unselect, thing.my_id)))
        }
    }

    if (G.pow > 0) {
        G.capture.filter(h => is_space_controlled(h, AP))
            .forEach(h => populate_generic("s-loc", h, counters.pow))
    }
    var oos_hex_set = []
    for (i = 0; i < G.oos.length; i++) {
        let hex = G.location[G.oos[i]]
        if (!set_has(oos_hex_set, hex) && hex <= LAST_BOARD_HEX && !set_has(supplied_hex, hex)) {
            populate_generic("s-loc", hex, counters.oos)
            set_add(oos_hex_set, hex)
        }
    }

    if (!get_preference("hidezoi", false)) {
        for (var hex of ALL_BOARD_HEXES) {
            const zoi_state = G.supply_cache[hex]
            update_keyword("zoi_hex", hex, "lrb", (zoi_state & 7) === 3)
            update_keyword("zoi_hex", hex, "contested", (zoi_state & 3) === 3)
            update_keyword("zoi_hex", hex, "jp", (zoi_state & 1) === 1)
            update_keyword("zoi_hex", hex, "ap", (zoi_state & 2) === 2)
        }
    }

    var focused = []
    if (world.range[0] && world.hq && G.location[world.hq] < LAST_BOARD_HEX) {
        mark_activation_zone(world.hq)
        for_each_hex_in_range(G.location[world.hq], pieces[world.hq].cr, hex => {
            if (G.supply_cache[hex] & HEX_TEMP_FLAG3) {
                set_add(focused, hex)
            }
        })
    } else {
        for_each_hex_in_range(world.range[0], world.range[1], hex => set_add(focused, hex))
        focused = in_range_on_map(world.range[0], world.range[1], focused, AP)
    }
    for (var hex of ALL_BOARD_HEXES) {
        update_keyword("zoi_hex", hex, "yellow", set_has(focused, hex))
    }

    print_violations()
    update_violations()
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
    G.offensive.landing_hexes.filter(h => get_map_data(h).named && is_space_controlled(h, G.offensive.attacker - 1) && has_zoi(h, G.offensive.attacker - 1))
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
        populate_generic("india", Math.max(0, 4 - G.surrender[nations.INDIA.id]),
            (G.surrender[nations.INDIA.id] >= 5) ? counters.india_status_surrender : counters.india_status)
        populate_generic("burma", 2 - G.burma_road, G.events[events.HUMP.id] ? counters.burma_road_hump : counters.burma_road)
        populate("divisions", G.china_divisions + 1, `divisions`, 0)
    }

    populate_generic("china", Math.min(5, G.surrender[nations.CHINA.id]), counters.china)

    var turns = world.things["turn"]
    for (var key of Object.keys(nations)) {
        var nation = nations[key]
        var marker = nation.counter
        var hex = nation.counter_hex
        var value = G.surrender[nation.id]
        if (nation.id === nations.MARSHALL.id) {
            value = !value
        }
        if (marker && turns[value] && value) {
            populate_generic("turn", value, marker)
        }
        if (marker && hex && value) {
            populate_generic("s-loc", hex_to_int(hex), marker)
        }
    }
    for (i = 0; i < TURN_MARKERS.length; i++) {
        const marker = TURN_MARKERS[i]
        var value = marker.value(G)
        var counter = (typeof marker.counter === 'function') ? marker.counter(G) : marker.counter
        if (value > 0 && turns[value]) {
            populate_generic("turn", value, counter)
        }
    }

    for (i = 0; i < TRACK_MARKERS.length; i++) {
        const marker = TRACK_MARKERS[i]
        var value = marker.value(G)
        var counter = (typeof marker.counter === 'function') ? marker.counter(G) : marker.counter
        var track = Math.min(9, value)
        if (value > 9 && marker.alt_counter) {
            counter = marker.alt_counter
            track = Math.min(9, value - 10)
        }
        if (value > 0 || marker.always_show === true || (typeof marker.always_show === 'function' && marker.always_show(G))) {
            populate_generic("track", track, counter)
        }
    }

    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].on_update()
    }

    action_button("play_card", "Play card")
    action_button("to_unit", "Rebuild unit")
    action_button("roll", "Roll")

    action_button("awaiting", "Prompt")
    action_button("continue", "Continue")
    action_button("bonus", "Use Bonus")
    action_button("event", "Play Event")
    action_button("ops", "Play for Operations")
    action_button("hold", "Hold")
    action_button("advanced_move", "Advanced move")
    action_button("no_move", "No move")
    action_button("eliminate", "Eliminate")
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
}

function print_violations() {
    if (world.violations) {
        world.violations.forEach(h => lookup_thing("action_hex", h).element.classList.toggle("violation", false))
        world.violations = []
    }
    G.violations.forEach(h => lookup_thing("action_hex", h).element.classList.toggle("violation", true))
    world.violations = G.violations
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

function update_violations() {
    var ui = document.getElementById("violations")
    var list = G.violations
    if (list.length > 0) {
        ui.replaceChildren()
        let p = document.createElement("div")
        p.innerHTML = `<u><b>Overstack Violations: ${escape_text(list.map(h => hex_get_log_str(h)).join(", "))}</b></u>`
        ui.appendChild(p)
    } else {
        ui.replaceChildren()
    }
}

function apply_conflict_marker(marker, hex) {
    marker.innerText = String.fromCharCode(65 + G.offensive.battle_names.indexOf(hex))
}