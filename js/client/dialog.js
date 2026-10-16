// EVENT CARD WINDOW

function draw_list() {
    var data = scenario_data()
    var hand = [[], []]
    for_each_card((id, card) => {
        var faction = card.faction
        if (data.has_card(id) && !set_has(G.removed[faction], id) && !set_has(G.discard[faction], id)) {
            hand[faction].push(id)
        }
    })
    return hand
}

function update_window_cards_jp() {
    return update_window_cards(JP)
}

function update_window_cards_ap() {
    return update_window_cards(AP)
}

function update_window_cards(R) {
    var text = []
    text.push("<dl>")

    text.push(`<dt>${ROLES[R]} Removed Cards (${G.removed[R].length})`)
    for (var c of G.removed[R])
        text.push("<dd>" + escape_text("C" + c))

    text.push(`<dt>${ROLES[R]} Discard Pile (${G.discard[R].length})`)
    for (var c of G.discard[R])
        text.push("<dd>" + escape_text("C" + c))

    var hand = draw_list()[R]
    text.push(`<dt>${ROLES[R]} Deck and Hand (${hand.length})`)
    for (var c of hand)
        text.push("<dd>" + escape_text("C" + c))

    text.push("</dl>")
    return text.join("")
}

// POLITICAL SITUATION WINDOW

function get_nation_by_id(object, id) {
    for (var key of Object.keys(object)) {
        if (object[key].id === id) {
            return object[key]
        }
    }
}

function get_nation_info(nation) {
    var id = nation.id
    var surrender = G.surrender[id]
    return {id, control: surrender ? JP : AP}
}

function get_china_info() {
    var id = nations.CHINA.id
    var surrender = G.events[events.CHINA_STATUS.id] >= 5
    var offensive = G.events[events.CHINA_OFFENSIVE.id]
    var mods = get_china_offensive_modifiers()
    var info = []
    var draw = draw_list()
    var count_jp = array_count(draw[JP], c => cards[c].china)
    var count_ap = array_count(draw[AP], c => cards[c].china)
    if (!surrender) {
        info.push(`Offensive ${(G.turn - offensive > 1) ? "" : "not "}possible${offensive > 0 ? ". Last launched turn " + offensive : ""}.`)
        mods.log.forEach(l => info.push(l))
        info.push(`Not played JP cards to China Government Front Status: ${count_jp}.`)
        info.push(`Not played AP cards to China Government Front Status: ${count_ap}.`)
    }
    return {
        id, control: surrender ? JP : AP, info,
        status: `(${G.events[events.CHINA_STATUS.id] + 1}/5) ${nations.CHINA.statuses[G.events[events.CHINA_STATUS.id]]}.`
    }
}

function get_india_info() {
    var nation = nations.INDIA
    var id = nation.id
    var name = nation.name
    var surrender = G.events[events.INDIA_STATUS.id] >= 5
    return {
        id, control: surrender ? JP : AP,
        status: `(${Math.min(G.events[events.INDIA_STATUS.id] + 1, 5)}/5) ${nations.INDIA.statuses[G.events[events.INDIA_STATUS.id]]}.`
    }
}

function get_japan_info() {
    var info = get_nation_info(nations.JAPAN)
    info.control = JP
    var resource_trace = check_japan_resource_trace()
    info.info = []
    var resorce_event = is_event_active(events.JAPAN_TRACE_RESOURCES)
    resorce_event = resorce_event > 0 ? G.turn - resorce_event + 1 : 0
    var resorce_info = ` (${resorce_event}/3 turns)`
    if (!resorce_event && resource_trace) {
        resorce_info = ""
    }
    info.info.push(`Could ${resource_trace ? "" : "NOT "}trace path to Resource hex${resorce_info}.`)
    var b29_in_range = get_distance(TOKYO, G.location[B_29_1]) <= 8 || get_distance(TOKYO, G.location[B_29_2]) <= 8
    var resource_count = get_jp_resources()
    var campaign = is_event_active(events.STRAT_BOMBING_CAMPAIGN) ? (G.turn - is_event_active(events.STRAT_BOMBING_CAMPAIGN) + 1) : 0
    if (CAMPAIGN_SCENARIOS.includes(G.sid)) {
        info.info.push(`Strategical Bombing Campaign: ${campaign}/4 turns.`)
        info.info.push(b29_in_range ? "B-29 is in range of Tokyo." : "B-29 is not in range of Tokyo.")
        info.info.push(`JP control ${resource_count} ${resource_count <= 1 ? "<=" : ">"} 1 resource spaces.`)
    }
    return info
}

function print_icon(cn, content = "") {
    return `<div class="dt-icon ${cn}">${content}</div>`
}

function print_flag(faction) {
    return print_icon(faction ? counters.control_us : counters.control_jp)
}

function update_window_pw() {
    var text = []
    text.push("<dl>")

    text.push(`<dt>US Political Will: ${G.political_will}`)
    text.push(print_icon(counters.pw))

    if (SID === BURMA_SCENARIO) {
        print_nation_status(text, get_nation_info(nations.BURMA))
        print_nation_status(text, get_china_info())
        print_nation_status(text, get_india_info())
    } else {
        print_pow(text)
        print_naval_situation(text)

        if (G.sid !== SOUTH_PACIFIC_SCENARIO) {
            print_casualties(text)
            print_resources(text)
            print_occupation(text, events.ALASKA_OCCUPATION)
            print_occupation(text, events.HAWAII_OCCUPATION)
        }

        print_nation_status(text, get_china_info())
        print_nation_status(text, get_nation_info(nations.AUSTRALIAN_MANDATES))
        if (G.sid === SOUTH_PACIFIC_SCENARIO) {
            print_nation_status(text, get_nation_info(nations.NEW_GUINEA))
        } else {
            print_nation_status(text, get_india_info())

            // FLOAT SURRENDER
            print_nation_status(text, nations.PHILIPPINES)
            print_nation_status(text, nations.MALAYA)
            print_nation_status(text, nations.DEI)
            print_nation_status(text, nations.BURMA)
            print_nation_status(text, nations.AUSTRALIA)
            print_nation_status(text, nations.NEW_GUINEA)
            print_nation_status(text, nations.MARSHALL)

            print_nation_status(text, get_japan_info())
        }
    }

    text.push("</dl>")
    return text.join("")
}

function print_pow(text) {
    if (G.pow <= 0) {
        text.push(`<dt>No progress of war required for turn ${G.turn}.`)
        text.push(print_icon(counters.pow_target))
        return
    }

    var current_pow = G.capture.filter(h => is_space_controlled(h, AP))
    if (current_pow.length >= G.pow) {
        text.push("<dt>Progress of war (Completed)")
        text.push(print_icon(counters.pow_target))
    } else {
        text.push("<dt>Progress of war (-1 PW)")
        text.push(print_icon("gray " + counters.pow_target))
    }

    text.push(`<dd>(${current_pow.length}/${G.pow}) `)
    text.push(escape_text(current_pow.map(x=>"H"+x).join(", ")))
}

function print_naval_situation(text) {
    var counter = [[], []]
    for (var i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.faction === AP && piece.service === "navy" && piece.class === "naval" && G.location[i] < LAST_BOARD_HEX) {
            counter[0].push(i)
            if (piece.br)
                counter[1].push(i)
        }
    }

    function print_ship_list(list, counter, label) {
        text.push("<dt>" + "Strategic naval situation")
        if (list.length > 0)
            text.push(print_icon(counter))
        else
            text.push(print_icon("gray " + counter))
        if (list.length === 0)
            text.push("<dd>" + label + " eliminated (-1 PW)")
        else {
            text.push(`<dd>${list.length} ${label}`)
            if (list.length <= 3)
                text.push("<dd>" + escape_text(list.map(p=>"P"+p).join(", ")))
        }
    }

    print_ship_list(counter[0], pieces[US_BB_UNIT].counter + " unit piece", "US naval units")
    if (G.sid !== SOUTH_PACIFIC_SCENARIO)
        print_ship_list(counter[1], pieces[US_CV_UNIT].counter + " unit piece", "US carrier units")
}

function print_casualties(text) {
    if (is_event_active(events.US_CASUALTIES)) {
        text.push("<dt>US Casualties triggered (-1PW)")
        text.push(print_icon(pieces[US_MARINE_UNIT].counter + " unit piece"))
    } else {
        text.push("<dt>US Casualties not triggered.")
        text.push(print_icon(pieces[US_MARINE_UNIT].counter + " unit piece gray"))
    }
}

function print_resources(text) {
    if (G.events[events.JAPAN_LACK_OF_RESOURCES.id]) {
        text.push("<dt>JP control 3 or fewer resource hexes -- completed (-3 PW)")
        text.push(print_icon(counters.resource_jp))
    } else {
        var value = array_count(RESOURCE_HEX, h => is_space_controlled(h, JP))
        text.push(`<dt>JP control ${value} > 3 resource hexes.`)
        text.push(print_icon("gray " + counters.resource_jp))
    }
}

function print_occupation(text, response) {
    var nation = get_nation_by_id(events, response.id)
    var status = G.events[response.id]

    text.push("<dt>" + nation.name)
    if (nation.pw)
        text.push(` (${nation.pw} PW)`)
    if (status)
        text.push(print_icon(nation.counter))
    else
        text.push(print_icon("gray " + nation.counter))

    if (status && G.turn - status >= nation.turns_to_control)
        return

    if (status)
        text.push(`<dd>Turns: ${G.turn - status + 1}/${nation.turns_to_control}`)

    if (nation.keys)
        text.push("<dd>Keys: " + escape_text(nation.keys.map(k=>"H"+hex_to_int(k)).join(", ")))

    if (response.info)
        for (var line of response.info)
            text.push("<dd>" + escape_text(line))
}

function print_nation_status(text, response) {
    var nation = get_nation_by_id(nations, response.id)

    text.push("<dt>" + nation.name)
    if (nation.pw) {
        if (response.control === JP)
            text.push(" (-" + nation.pw + " PW)")
        else
            text.push(" (+" + nation.pw + " PW)")
    }

    text.push(print_flag(response.control))

    if (response.status)
        text.push("<dd>" + response.status)

    var control = [[], []]
    if (nation.keys) {
        nation.keys.forEach(k => {
            if (is_space_controlled(hex_to_int(k), JP)) {
                control[JP].push(hex_to_int(k))
            } else {
                control[AP].push(hex_to_int(k))
            }
        })
        text.push("<dd>")
        text.push(`(${control[JP].length}/${control[AP].length})`)
        if (control[JP].length)
            text.push(" JP: " + escape_text(control[JP].map(x=>"H"+x).join(", ")))
        if (control[AP].length && control[JP].length)
            text.push(";")
        if (control[AP].length)
            text.push(" AP: " + escape_text(control[AP].map(x=>"H"+x).join(", ")))
    }

    if (response.info)
        for (var line of response.info)
            text.push("<dd>" + escape_text(line))
}

// VICTORY POINT WINDOW

function update_window_vp() {
    var text = []
    text.push("<dl>")

    if (!scenario_data().original_control) {
        send_query("original_control")
        return
    }

    var response = get_victory()

    text.push("<dt>" + response.won_text)
    if (response.won_side === "Japan")
        text.push(print_flag(JP))
    else
        text.push(print_flag(AP))
    text.push("<dd>Total VP: " + response.vp)

    for (var line of response.text)
        text.push("<dd>" + escape_text(line))

    text.push("<dt>Summary:")
    if (SID == BURMA_SCENARIO) {
        text.push("<dd>2 VP or less - Allied Decisive Victory.")
        text.push("<dd>3-4 VP Allied Tactical Victory.")
        text.push("<dd>5-8 VP Japanese Tactical Victory.")
        text.push("<dd>9 VP Japanese Decisive Victory.")
    } else {
        text.push("<dd>2 VP or less - Allied Decisive Victory.")
        text.push("<dd>3-5 VP Allied Tactical Victory.")
        text.push("<dd>6-9 VP Japanese Tactical Victory.")
        text.push("<dd>10 VP Japanese Decisive Victory.")
    }

    text.push("</dl>")
    return text.join("")
}

// ELIMINATED UNITS WINDOW

function update_window_eliminated() {
    var text = []
    text.push("<dl>")

    var elim = [[], [], [], []]
    for (var i = 1; i < pieces.length; i++) {
        const piece = pieces[i]
        if (G.location[i] === ELIMINATED_BOX || G.location[i] === PERM_ELIMINATED) {
            if (piece.notreplaceable || G.location[i] === PERM_ELIMINATED) {
                elim[piece.faction * 2 + 1].push(i)
            } else {
                elim[piece.faction * 2 + 0].push(i)
            }
        }
    }

    function print_piece(p) {
        var piece = pieces[p]
        var className = "piece unit " + (piece.faction ? "ap " : "jp ") + piece.counter
        return `<div class="${className}"></div>`
    }

    function print_piece_list(label, pp) {
        if (pp.length > 0) {
            text.push("<dt>" + label)
            text.push("<dd class=piece-list>")
            text.push(pp.filter(p => pieces[p].counter.includes("big")).map(print_piece).join(""))
            text.push(pp.filter(p => !pieces[p].counter.includes("big")).map(print_piece).join(""))
        }
    }

    print_piece_list("Allied Replaceable:", elim[AP * 2])
    print_piece_list("Allied Permanently Eliminated:", elim[AP * 2 + 1])
    print_piece_list("Japanese Replaceable:", elim[JP * 2])
    print_piece_list("Japanese Permanently Eliminated:", elim[JP * 2 + 1])

    if (elim.every(a => a.length === 0))
        text.push("<dt>No eliminated units yet.")

    text.push("</dl>")
    return text.join("")
}

// BATTLE BOX

function update_combat_window(response) {
    var text = []

 //   console.log("COMBAT WINDOW", JSON.stringify(response))

    update_window_title("window_combat",
        escape_text(`Combat ${String.fromCharCode(65 + response.battle_name)}: H${response.battle_hex}`)
    )

    var atk = G.offensive.attacker
    var def = 1 - G.offensive.attacker

    var atk_flag = (atk === JP ? counters.control_jp : counters.control_us)
    var def_flag = (def === JP ? counters.control_jp : counters.control_us)

    text.push("<table><thead><tr><th>Attacker<th>Defender")
    text.push("<tr>")
    text.push(`<td><div style="margin:0 auto" class="${atk_flag}"></div>`)
    text.push(`<td><div style="margin:0 auto" class="${def_flag}"></div>`)
    text.push("<tbody>")

    if (response.air_naval[0].length || response.air_naval[1].length) {
        text.push("<tr><th colspan=2>Air / Naval<tr>")
        print_battle_box(text,
            atk,
            response.naval_cf[atk],
            response.naval_rm[atk],
            response.air_naval[atk],
            response.naval_log[atk]
        )
        print_battle_box(text,
            def,
            response.naval_cf[def],
            response.naval_rm[def],
            response.air_naval[def],
            response.naval_log[def]
        )
    }

    if (response.ground[0].length || response.ground[1].length) {
        text.push("<tr><th colspan=2>Ground<tr>")
        text.push("<tr>")
        print_battle_box(text,
            atk,
            response.ground_cf[atk],
            response.ground_rm[atk],
            response.ground[atk],
            response.ground_log[atk]
        )
        print_battle_box(text,
            def,
            response.ground_cf[def],
            response.ground_rm[def],
            response.ground[def],
            response.ground_log[def]
        )
    }

    text.push("</table>")
    update_window_content("window_combat", text.join(""))

    show_window("window_combat")
}

function print_battle_box(text, faction, cf, rm, units, log) {
    text.push("<td>")

    if (cf === 0) {
        text.push("-")
        return
    }

    text.push("<dl>")
    text.push("<dt>CF: " + cf)
    if (rm > 0)
        text.push("+" + rm + " DRM")

    units.sort((a, b) => G.location[a] - G.location[b])
    var prev = null
    for (var i of units) {
        var loc = G.location[i]
        if (loc !== prev) {
            prev = loc
            text.push("<dt>" + escape_text("H" + loc))
            text.push(`<dd class="piece-list">`)
        }
        var piece = pieces[i]
        var className = "piece unit " + piece.counter
        if (set_has(G.reduced, i) && !(piece.notreplaceable && piece.start_reduced))
            className += " reduced"
        text.push(`<div class="${className}"></div>`)
    }

    if (log.length > 0) {
        for (var line of log) {
            line = line.replace(/^[%&>]/g, "") // remove log formatting codes
            text.push("<dt>" + escape_text(line))
        }
    }

    text.push("</dl>")
}
