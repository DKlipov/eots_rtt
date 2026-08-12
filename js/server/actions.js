function get_china_offensive_modifiers() {
    var result = {
        log: [],
        burma_road: 0,
        air_support: 0,
        divisions: G.china_divisions
    }
    result.burma_road = (2 - G.burma_road) * 4
    result.log.push(`Japanese divisions ${G.china_divisions}.`)
    result.log.push(`+${result.burma_road} (Burma road).`)

    if (scenario_data().id === SOUTH_PACIFIC_SCENARIO) {
        result.air_support++
        result.log.push(`+1 ${piece_get_log_str(ap_air("14_lrb"))}.`)
    } else {
        for_each_unit((u, piece, location) => {
            if (location === CHINA_BOX && (piece.type !== "lrb" || u === LRB_14) && !set_has(G.oos, u)) {
                result.log.push(`+1 ${piece_get_log_str(u)}.`)
                result.air_support++
            }
        })
    }
    return result
}

P.china_offensive = {
    inactive: "confirm China Offensive",
    _begin() {
       check_supply()
    },
    prompt() {
        prompt(`China Offensive Roll.`)
        button("roll")
    },
    roll() {
        log(`JP started China offensive.`)
        let result = random(10)
        G.events[events.CHINA_OFFENSIVE.id] = G.turn
        var mods = get_china_offensive_modifiers()
        mods.log.forEach(l => log(l))
        var success = result <= (mods.divisions - mods.burma_road - mods.air_support)
        log(`${dice_get_log_str(result, mods.burma_road + mods.air_support, JP)} <= ${mods.divisions} (${success ? "SUCCESS" : "FAILED"})`)
        if (success) {
            update_china_status(1)
        } else {
            update_china_status(-1)
        }
        clear_undo()
        goto("end_action")
    },
}

P.displace_hq = {
    inactive: "choose HQ",
    prompt() {
        prompt(`Choose HQ to displace.`)
        HQ_LIST.forEach(u => {
            if (unit_on_board(u) && pieces[u].faction === R && (scenario_data().id !== SOUTH_PACIFIC_SCENARIO || u !== HQ_CENTRAL_PACIFIC)) {
                action_unit(u)
            }
        })
    },
    unit(u) {
        push_undo()
        G.supply_cache[G.location[u]] -= (JP_HQ_UNITS << pieces[u].faction)
        eliminate(u)
        if (!check_sudden_death()) {
            goto("end_action")
        }
    },
}

P.return_hq = {
    inactive: "choose HQ",
    prompt() {
        check_supply()
        mark_supplied_hexes(G.active)
        if (!G.active_stack.length) {
            prompt(`Choose returning HQ.`)
            HQ_LIST.forEach(u => {
                if (G.location[u] > TURN_BOX && pieces[u].faction === R) {
                    action_unit(u)
                }
            })
        } else {
            prompt(`Hex to place ${piece_get_log_str(G.active_stack[0])}.`)
            G.allowed_hexes.forEach(h => action_hex(h))
        }
    },
    unit(u) {
        push_undo()
        G.active_stack = [u]
        var allied_regions = ["Australia", "AMandates", "India", "NIndia", "Ceylon"]
        G.allowed_hexes = get_unit_reinforcement_hexes(u).filter(h => {
            var piece = pieces[u]
            var region = get_map_data(h).region
            if (piece.faction === JP) {
                return region === "Japan"
            } else {
                return h === OAHU || allied_regions.includes(region)
            }
        })
    },
    action_hex(hex) {
        push_undo()
        log(`${piece_get_log_str(G.active_stack[0])} selected for early return.`)
        set_location(G.active_stack[0], hex)
        G.active_stack = []
        goto("end_action")
    }
}

function build_road(card, event) {
    push_undo()
    activate_card(card)
    check_event(event)
    log(`${card_get_log_str(card)} played.`)
    log(`CBI infrastructure built ${event.name}.`)
    goto("end_action")
}

P.offensive_segment = {
    _begin() {
        if (G.active === AP) {
            G.offensive.weather_rollback = copy_state()
        }
    },
    inactive: "select card to play",
    prompt() {
        prompt("Turn " + G.turn + " Select card to play.")
        if (G.passes[R] > 0) {
            button("pass")
        }
        var hand = get_hand(R)
        for (let i = 0; i < hand.length; i++) {
            let card = hand[i]
            action_card(card)
        }
    },
    card(c) {
        push_undo()
        goto("offensive_segment_card_action", {c: c})
    },
    pass() {
        push_undo()
        G.passes[R] -= 1
        log(`Pass used, ${G.passes[R]} remains.`)
        goto("end_action")
    },
}

P.offensive_segment_card_action = {
    inactive: "select action",
    prompt() {
        prompt(`${card_get_log_str(L.c)}: Select action.`)
        // button("discard")
        // return // todo: remove
        get_allowed_actions(L.c).forEach(a => button(a))
    },
    ops() {
        push_undo()
        activate_card(L.c)
        G.offensive.type = OC
        log(`${card_get_log_str(L.c)} played as operation card.`)
        goto("offensive_sequence")
    },
    event() {
        push_undo()
        if (cards[L.c].type === MILITARY) {
            play_event(L.c)
            goto("offensive_sequence")
        } else {
            G.offensive.offensive_card = L.c
            goto("end_action")
            play_event(G.offensive.offensive_card)
            call("default_event")
        }
    },
    discard() {
        push_undo()
        activate_card(L.c)
        log(`${side_get_log_str(R)} discards ${card_get_log_str(L.c)}.`)
        goto("end_action")
    },
    inter_service() {
        push_undo()
        activate_card(L.c)
        log(`${side_get_log_str(R)} played ${card_get_log_str(L.c)} to resolve ISR.`)
        set_inter_service(cards[L.c].faction, 0)
        goto("end_action")
    },
    jarhat() {
        build_road(L.c, events.JARHAT_ROAD)
    },
    imphal() {
        build_road(L.c, events.IMPHAL_ROAD)
    },
    ledo() {
        build_road(L.c, events.LEDO_ROAD)
    },
    china_offensive() {
        push_undo()
        activate_card(L.c)
        log(`${card_get_log_str(L.c)} played for Chinese Offensive.`)
        goto("china_offensive")
    },
    displace_hq() {
        push_undo()
        activate_card(L.c)
        log(`${card_get_log_str(L.c)} played for withdraw HQ.`)
        goto("displace_hq")
    },
    return_hq() {
        push_undo()
        activate_card(L.c)
        log(`${card_get_log_str(L.c)} played for return HQ.`)
        goto("return_hq")
    },
    future_offensive() {
        push_undo()
        log(`${side_get_log_str(R)} played future offensive card.`)
        future_offencive_card(L.c, G.turn)
        goto("end_action")
    }
}


function end_of_offensive_check() {
    commit_into_turn_draw()
    check_occupation(events.HAWAII_OCCUPATION)
    check_occupation(events.ALASKA_OCCUPATION)
}

P.initiative_segment = script(`
    eval {
        if (G.hand[AP].length > G.hand[JP].length) {
            G.active = AP
        } else if (G.hand[JP].length > G.hand[AP].length) {
            G.active = JP
        } else {
            G.active = G.turn <= 4 ? 0 : 1
        }
        G.first_active = G.active
    }
    if (G.hand[JP].length !== G.hand[AP].length) {
        set G.active 1-G.active
        goto future_offensive
    }
`)

P.future_offensive = {
    _begin() {
        L.pass = false
        if (G.future_offensive[G.active] <= 0) {
            end()
            return
        }
        log("#" + (G.active === JP ? "JJP" : "AAP") + " Future Offensive")
        var card = cards[G.future_offensive[G.active] > 0 ? G.future_offensive[G.active] : 0]
        if (card.type !== MILITARY || !event_hq_check(card)) {
            L.pass = true
        }
    },
    inactive: "play future offensive card",
    prompt() {
        prompt("Play future offensive card or pass.")
        if (L.pass) {
            button("done")
        } else {
            button("pass")
            action("event", G.future_offensive[G.active])
        }
    },
    event() {
        push_undo()
        play_event(G.future_offensive[G.active])
        goto("offensive_sequence")
    },
    pass() {
        push_undo()
        log(`${side_get_log_str(G.active)} pass.`)
        L.pass = true
    },
    done() {
        end()
    }
}

function event_hq_check(card) {
    if (!card.hq) {
        return true
    }
    for (var hq of card.hq) {
        if (unit_on_board(hq) && !set_has(G.oos, hq)) {
            return true
        }
    }
    return false
}

function is_imphal_build_enabled() {
    var mandalay = G.supply_cache[MANDALAY]
    var rangoon = G.supply_cache[RANGOON]
    var imphal = G.supply_cache[IMPHAL]
    return is_space_controlled(RANGOON, JP) && is_space_controlled(MANDALAY, JP)
        && (rangoon & JP_SUPPLY_PORT) && !(mandalay & AP_UNITS) && !(rangoon & AP_UNITS)
        && !(imphal & AP_UNITS) && is_space_controlled(IMPHAL, JP)
        && !((hex_to_int(2007) & AP_UNITS) && (hex_to_int(2107) & AP_UNITS))
}

function get_infrastructure_actions() {
    if (G.active === AP && check_nation_controlled(nations.INDIA, AP) && is_space_controlled(AKYAB, AP)) {
        if (!is_event_active(events.JARHAT_ROAD)) {
            return ["jarhat"]
        }
        var result = []
        if (!is_event_active(events.LEDO_ROAD)) {
            result.push("ledo")
        }
        if (!is_event_active(events.IMPHAL_ROAD)) {
            result.push("imphal")
        }
        return result
    }
    if (G.active === JP && !is_event_active(events.IMPHAL_ROAD) && is_imphal_build_enabled()) {
        return ["imphal"]
    }
    return []
}

function get_event_infrastructure_actions() {
    if (!is_event_active(events.JARHAT_ROAD) && is_space_controlled(JARHAT,) && !is_faction_units(JARHAT, JP)) {
        return ["jarhat"]
    } else if (is_faction_units(JARHAT, JP)) {
        return []
    }
    var result = []
    if (!is_event_active(events.LEDO_ROAD) && !is_faction_units(LEDO, JP)) {
        result.push("ledo")
    }
    if (!is_event_active(events.IMPHAL_ROAD) && !is_faction_units(IMPHAL, JP)) {
        result.push("imphal")
    }
    return result
}

function get_allowed_actions(num) {
    let card = cards[num]
    var result = []

    if (!card.reshuffle) {
        result.push("discard")
    }
    if (num === TOJO_RESIGNS && G.turn >= 8 || num === SOVIET_INVADE && card.can_play()) {
        return ["event"]
    }

    if (!(card.pw && scenario_data().one_year)
        && (card.type === MILITARY || card.type === POLITICAL || card.type === RESOURCE) && card.can_play()) {
        result.push("event")
    }
    if (num === SANDCRAB && result.includes("event")) {
        return result
    }
    result.push("ops")
    if (G.sid !== BURMA_SCENARIO) {
        result.push("displace_hq")
    }
    if (HQ_LIST.filter(u => G.location[u] > TURN_BOX && pieces[u].faction === R).length
        && (R !== JP || G.sid !== SOUTH_PACIFIC_SCENARIO) && G.sid !== BURMA_SCENARIO) {
        result.push("return_hq")
    }
    if (card.ops >= 3) {
        if (G.inter_service[card.faction] && scenario_data().one_year) {
            result.push("inter_service")
        }
        get_infrastructure_actions().forEach(a => result.push(a))
        if (R === JP && G.turn - G.events[events.CHINA_OFFENSIVE.id] > 1 && G.surrender[nations.CHINA.id] < 5) {
            result.push("china_offensive")
        }
    }

    if (G.future_offensive[R] <= 0 && !card.reshuffle) {
        result.push("future_offensive")
    }
    return result
}






