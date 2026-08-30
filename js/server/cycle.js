/** import server/reinforcements.js*/
/** import server/offensive.js*/
/** import server/surrender.js*/

P.strategic_phase = script(`
    log ("!Turn " + G.turn + " - " + get_year_season() + " " + get_year())
    log ("@Turn " + G.turn + ". Strategic phase")
    eval {
        check_jp_resources_event()
    }
    set G.active AP 
    log ("#AAP Reinforcement segment")
    call reinforcement_segment
    log ("#JJP Reinforcement segment")
    set G.active JP 
    call reinforcement_segment
    log ("#AAP Replacement segment")
    set G.active AP 
    call replacement_segment {scheduled_points: 1}
    log ("#JJP Replacement segment")
    set G.active JP
    call replacement_segment {scheduled_points: 1}
    log ("#AStrategic warfare segment")
    call submarine_warfare
    call strategic_bombing
    if (G.turn === 2){
        if (G.options && G.options.historical) {
            eval {
                draw_hist_cards()
                delete G.options['historical']
            }
        }
        call arcadia
    }
    eval {
        scenario_data().deal_cards()
        set_pow()
    }
    goto offensive_phase
`)

function set_pow() {
    G.pow = 0
    if (G.sid === BURMA_SCENARIO) {
        return
    }
    if (G.turn >= 4) {
        G.pow = Math.min(4, G.asp[AP][0])
    }
    if (G.sid === SOUTH_PACIFIC_SCENARIO) {
        G.pow = 2
    }
    if (G.pow) {
        log(`Progress of war target - ${G.pow}.`)
    } else {
        log(`No progress of war required.`)
    }
}

P.submarine_warfare = {
    _begin() {
        G.active = AP
        if (G.async) {
            this.roll()
        }
    },
    inactive: "roll for submarine warfare",
    prompt() {
        prompt("Roll for submarine warfare.")
        button("roll")
    },
    roll() {
        var result = random(10)
        var modifiers = 0
        log(`AP submarine warfare:`)
        if (G.turn <= 4) {
            modifiers += 1
            log(`+1 Defective torpedoes (1942).`)
        }
        var escort = is_event_active(events.JP_ESCORTS) >> 4
        if (escort) {
            modifiers += escort
            log(`+${escort} JP Escort.`)
        }
        var success = (result + modifiers - G.turn) <= 0
        log(`${dice_get_log_str(result, modifiers, AP)} <= ${G.turn} ${success ? "(SUCCESS)" : "(FAILED)"}.`)
        if (success) {
            change_asp(JP, -1)
            G.strategic_warfare++
        }
        if (success && escort === 4) {
            G.events[events.JP_ESCORTS.id] = G.turn + (2 << 4)
            log(`Escort reduced to +2.`)
        } else if (success && escort) {
            G.events[events.JP_ESCORTS.id] = 0
            log(`Escort reduced to 0.`)
        }
        clear_undo()
        end()
    },
}

P.strategic_bombing = {
    _begin() {
        check_supplied_hexes(AP)
        L.allowed_units = []
        var units = [B_29_1, B_29_2]
        units.forEach(u => {
            var piece = pieces[u]
            var check_location = G.location[u] < LAST_BOARD_HEX && get_distance(G.location[u], TOKYO) <= 8 || G.location[u] === CHINA_BOX
            if (check_location && !set_has(G.oos, u) && !(G.b29u & B29_REPLACED << piece.b29)) {
                set_add(L.allowed_units, u)
            }
        })
        G.active = AP
        G.active_stack = []
        if (!L.allowed_units.length) {
            if (G.turn >= 9) {
                log(`Strategic bombing not possible.`)
            }
            G.events[events.STRAT_BOMBING_CAMPAIGN.id] = 0
            end()
            return
        }
        if (G.async) {
            this.all()
        }
    },
    inactive: "roll to strategic bombing",
    prompt() {
        if (L.done) {
            prompt("No strategic bombing this turn.")
            button("done")
            return
        }
        prompt("Choose units that wll conduct strategic bombing.")
        if (G.active_stack.length > 0) {
            button("roll")
        } else {
            button("skip")
        }
        L.allowed_units.forEach(u => action_unit(u))
        button("all")
    },
    unit(u) {
        push_undo()
        set_add(G.active_stack, u)
        set_delete(L.allowed_units, u)
    },
    all() {
        L.allowed_units.forEach(u => set_add(G.active_stack, u))
        this.roll()
    },
    skip() {
        push_undo()
        L.done = 1
    },
    done() {
        log(`No units assigned to strategic bombing.`)
        G.events[events.STRAT_BOMBING_CAMPAIGN.id] = 0
        end()
    },
    roll() {
        var close_air_base = TOKYO_AIR_BASES.filter(h => is_space_controlled(h, AP) && (G.supply_cache[h] & AP_SUPPLY_AIRFIELD)).length > 0
        if (!G.active_stack.map(u => bombing(u, close_air_base)).reduce((a, b) => a || b, false)) {
            G.events[events.STRAT_BOMBING_CAMPAIGN.id] = 0
        }
        G.active_stack = []
        clear_undo()
        end()
    },
}

P.offensive_phase = script(`
    log ("@Turn "+ G.turn+". Offensives phase")
    call initiative_segment
    eval {
        commit_into_turn_draw()
        G.active = G.first_active 
        reset_offensive()
        G.offensive.attacker = G.active
    }
    while (G.hand[AP].length > 0 || G.hand[JP].length > 0) {
        log ("#"+(G.offensive.attacker===JP?"JJP":"AAP")+" Action")
        if (G.hand[G.active].length > 0){
            call offensive_segment
        } else {
            log (side_get_log_str(G.offensive.attacker)+" have no cards in hand.")
        }
        eval {
            end_of_offensive_check()
            G.active = 1 - G.offensive.attacker
            reset_offensive()
            G.offensive.attacker = G.active
        }
    }
    goto political_phase
`)

P.political_phase = script(`
    log ("@Turn "+G.turn+". Political phase")
  
    call national_status_segment
    call india_surrender
    set G.active JP
    call emergency_move
    set G.active AP
    call emergency_move
    call political_will_segment
    goto attrition_phase
`)

P.national_status_segment = function () {
    L.pw = 0
    if (G.sid === BURMA_SCENARIO) {
        check_nation_surrender(nations.BURMA)
        //17.11.27. During the Game turn 9 Political Phase the India status can only
        //shift for India surrender, else do not move the India marker and
        //score any VP based on its location during the last Political Phase.
        var ind_control = check_nation_controlled(nations.INDIA, JP)
        if (ind_control && G.turn < 9 || G.surrender[nations.INDIA.id] === 3) {
            degrade_india(true)
        } else if (!ind_control && G.turn < 9) {
            //17.11.27.
            india_stable()
        }
        change_political_will(L.pw, "National status")
        end()
        return;
    }
    if (check_nation_surrender(nations.NEW_GUINEA)) {
        set_control_over_nation(nations.NEW_GUINEA, false)
    }
    if (G.sid === SOUTH_PACIFIC_SCENARIO) {
        var surr = G.surrender[nations.AUSTRALIAN_MANDATES.id]
        if (nations.AUSTRALIAN_MANDATES.ports
            .filter(h => is_space_controlled(hex_to_int(h), surr ? JP : AP)).length === 0) {
            G.surrender[nations.AUSTRALIAN_MANDATES.id] = (surr) ? 0 : G.turn
            log(`${nations.AUSTRALIAN_MANDATES.name} controlled ${surr ? "AP" : "JP"}.`)
        }
        change_political_will(L.pw, "National status")
        end()
        return;
    }
    if (check_nation_surrender(nations.PHILIPPINES)) {
        if (G.surrender[nations.PHILIPPINES.id]) {
            for_each_unit_on_map((u, piece, location) => {
                if ((piece.class === "ground" || piece.class === "hq" ||
                        (piece.service !== "army" && piece.service !== "navy" && piece.service !== "us"))
                    && piece.faction === AP
                    && nations.PHILIPPINES.regions.includes(get_map_data(location).region)) {
                    eliminate(u)
                }
            })
        }
        set_control_over_nation(nations.PHILIPPINES)
    }
    check_nation_surrender(nations.MALAYA)
    if (check_nation_surrender(nations.DEI)) {
        if (G.surrender[nations.DEI.id]) {
            for_each_unit_on_map((u, piece) => {
                if (piece.service === "du") {
                    eliminate(u)
                }
            })
        }
        set_control_over_nation(nations.DEI)
    }
    if (check_nation_surrender(nations.BURMA) && G.surrender[nations.BURMA.id]) {
        for_each_unit((u, piece) => {
            if (piece.service === "bu") {
                eliminate_permanently(u)
            }
        })
    }
    if (check_nation_controlled(nations.INDIA, JP)) {
        degrade_india(true)
    } else {
        india_stable()
    }

    if (!is_event_active(events.AUSTRALIA_SURRENDER) && check_nation_surrender(nations.AUSTRALIA)) {
        check_event(events.AUSTRALIA_SURRENDER)
        for_each_unit((u, piece, location) => {
            if (piece.service === "au" && location >= LAST_BOARD_HEX) {
                eliminate_permanently(u)
            }
        })
    }
    if (check_nation_surrender(nations.AUSTRALIAN_MANDATES)) {
        set_control_over_nation(nations.AUSTRALIAN_MANDATES)
    }
    if (!is_event_active(events.MARSHALL_CAPTURED) && check_nation_controlled(nations.MARSHALL, AP)) {
        G.surrender[nations.MARSHALL.id] = 0
        set_control_over_nation(nations.MARSHALL)
        check_event(events.MARSHALL_CAPTURED)
        log("AP captured Marshall islands.")
    }
    if (check_nation_controlled(nations.JAPAN, AP)) {
        finish("Allies", "Allies Victory - Japanese mainland islands captured")
        return
    }
    if (check_japan_resource_trace()) {
        if (is_event_active(events.JAPAN_TRACE_RESOURCES)) {
            log(`JP mainland city traced path to resource hex. Capitulation timer reset.`)
        }
        G.events[events.JAPAN_TRACE_RESOURCES.id] = 0
    } else if (is_event_active(events.JAPAN_TRACE_RESOURCES) && is_event_active(events.JAPAN_TRACE_RESOURCES) <= G.turn - 2) {
        finish("Allies", "Allies Victory by blockade")
        return
    } else {
        check_event(events.JAPAN_TRACE_RESOURCES)
        log(`JP mainland city could not trace path to resource hex (${G.turn + 1 - is_event_active(events.JAPAN_TRACE_RESOURCES)}/3).`)
    }
    change_political_will(L.pw, "National status")
    end()
}

function reset_events() {
    Object.keys(events).forEach(k => {
        var event = events[k]
        if (event.once_per_turn) {
            G.events[event.id] = 0
        }
    })
}

P.political_will_segment = function () {
    if (G.sid === BURMA_SCENARIO) {
        end()
        return
    }
    if (!events.ALLIED_NATIONS_SURRENDERS.nations.filter(n => !G.surrender[n]).length &&
        G.surrender[nations.INDIA.id] >= 4 && G.surrender[nations.CHINA.id] >= 5) {
        check_event(events.ALLIED_NATIONS_SURRENDERS)
    }
    check_occupation(events.HAWAII_OCCUPATION, true)
    check_occupation(events.ALASKA_OCCUPATION, true)
    check_jp_resources_event()
    check_naval_situation()
    check_progress_of_war()
    end()
}

function check_progress_of_war() {
    if (G.pow <= 0) {
        log(`Progress of War not checked for turn ${G.turn}.`)
        return
    }
    var pow_count = G.capture.filter(h => is_space_controlled(h, AP)).length
    if (pow_count < G.pow) {
        change_political_will(-1, `current progress of war ${pow_count} < ${G.pow}`)
    } else {
        log(`Progress of War ${pow_count} >= ${G.pow}.`)
    }
}

function check_naval_situation() {
    var us_ship_count = 0
    var us_cv_count = 0
    for_each_unit_on_map((u, piece) => {
        if (piece.faction === AP && piece.service === "navy" && piece.class === "naval") {
            us_ship_count++
            if (piece.br) {
                us_cv_count++
            }
        }
    })
    if (!us_ship_count) {
        change_political_will(-1, "no US naval units")
    }
    if (!us_cv_count && G.sid !== SOUTH_PACIFIC_SCENARIO) {
        change_political_will(-1, "no US CV units")
    }
}


P.attrition_phase = script(`
    if (G.turn ===1) {
        goto end_of_turn_phase
    }
    log ("@Turn "+G.turn+". Attrition phase")
    eval {
       //check_supply()
    }
    set G.active JP
    call attrition
    eval {
        check_supply()
        check_occupation(events.HAWAII_OCCUPATION)
        check_occupation(events.ALASKA_OCCUPATION)
    }
    set G.active AP
    call attrition
    goto end_of_turn_phase
`)

P.end_of_turn_phase = script(`
    log ("@Turn " + G.turn + ". End of turn phase")
    eval {
        victory_check()
        reset_events()
    }
    incr G.turn
    set G.asp[JP][1] 0
    set G.asp[AP][1] 0
    set G.capture []
    set G.b29u 0
    set G.draw_counter [0,0]
    set G.strategic_warfare 0
    set G.passes [0,0]
    eval {
        reshuffle()
    }
    goto strategic_phase
`)


P.attrition = {
    _begin() {
        L.unit_to_attrition = []
        var hq_list = []
        for_each_unit_on_map((u, piece) => {
            if (piece.faction === G.active && piece.class === "hq") {
                set_add(hq_list, u)
            }
        })
        for_each_unit((u, piece, location) => {
            if (location > LAST_BOARD_HEX && location !== CHINA_BOX || piece.faction !== G.active || pieces[u].class === "naval" || pieces[u].class === "hq") {
                return;
            }
            if (set_has(G.oos, u)) {
                if (!set_has(G.reduced, u)) {
                    set_add(L.unit_to_attrition, u)
                } else if (location !== CHINA_BOX) {
                    for (var i = 0; i < hq_list.length; i++) {
                        var hq = hq_list[i]
                        if (in_range_on_map(location, pieces[hq].cr, [G.location[hq]], G.active).length
                            && (G.sid !== SOUTH_PACIFIC_SCENARIO || hq !== HQ_CENTRAL_PACIFIC || get_map_data(location).region === "Hebrides")//hack for cpac in south pacific map
                        ) {
                            return
                        }
                    }
                    set_add(L.unit_to_attrition, u)
                }
            }
        })
        if (!L.unit_to_attrition.length) {
            end()
            return
        }
        while (G.async && L.unit_to_attrition.length) {
            this.unit(L.unit_to_attrition[0])
        }
        if (G.async) {
            this.done()
        }
    },
    inactive: "apply attrition losses",
    prompt() {
        prompt(`Apply attrition for not-supplied units`)
        if (!L.unit_to_attrition.length) {
            button("done")
        }
        L.unit_to_attrition.forEach(u => action_unit(u))
    },
    unit(u) {
        if (set_has(G.reduced, u)) {
            eliminate(u)
        } else {
            reduce_unit(u)
        }
        set_delete(L.unit_to_attrition, u)
    },
    done() {
        end()
    }
}
