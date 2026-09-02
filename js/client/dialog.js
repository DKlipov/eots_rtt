// Below is code imported from Imperial struggle for dialog windows etc
// still not completely integrated. commented out code should be looked at

function on_reply(q, response) {
    toggle_dialog(q, response)
}

function toggle_dialog(id, response) {
    var name = id.name ? id.name : id
    // if (document.getElementById(name).classList.contains("show")) {
    //     hide_dialog(name)
    // }
    if (name.startsWith("original_control")) {
        scenario_data().original_control = response
        vp_dialog("vp_check", response)
    } else if (name.startsWith("event_cards")) {
        show_card_list(name, response)
    } else if (name === "vp_check") {
        vp_dialog(name, response)
    } else if (name === "battle_info") {
        battle_info_dialog(name, response)
    } else if (name === "pw_check") {
        pw_dialog(name, response)
    } else if (name === "check_unit_supply") {
        P.check_unit_supply.show_supply(response)
    } else if (name === "elim_check") {
        elim_dialog(name, response)
    }
}

function show_dialog(id, dialog_generator) {
    document.getElementById(id).classList.add("show")
    var body = document.getElementById(id).querySelector(".dialog_body")
    body.replaceChildren()
    if (dialog_generator) {
        dialog_generator(body)
    }
    if (!is_mobile()) dragElement(document.getElementById(id))
}

function hide_dialog(id) {
    document.getElementById(id).classList.remove("show")
    on_blur_tip()
}

function toggle_dialog_collapse(id) {
    var dialog_body = document.getElementById(id).querySelector(".dialog_body")
    var dialog_x = document.getElementById(id).querySelector(".dialog_x")
    if (dialog_body.className.includes("hide")) {
        dialog_body.classList.remove("hide")
        dialog_x.textContent = "A"
    } else {
        dialog_body.classList.add("hide")
        dialog_x.textContent = "V"
    }
}

//BR// Makes an element/dialog draggable by the player
function dragElement(e) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    var the_e = e
    if (document.getElementById(e.id + "header")) {
        document.getElementById(e.id + "header").onmousedown = dragMouseDown  // Drag by the header if it exists
    } else {
        e.onmousedown = dragMouseDown                                                  // Otherwise drag by the whole element
    }

    function dragMouseDown(e) {
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }

    function elementDrag(e) {
        e.preventDefault()

        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY

        // set the element's new position

        the_e.style.position = "absolute";
        the_e.style.top = (the_e.offsetTop - pos2) + "px"
        the_e.style.left = (the_e.offsetLeft - pos1) + "px"
    }

    function closeDragElement() {
        // stop moving when mouse button is released
        document.onmouseup = null
        document.onmousemove = null
    }
}

// Returns true if we're playing this on a mobile platform e.g. phone
function is_mobile() {
    return ("ontouchstart" in window)
}

function show_card_list(id, response) {
    id = response
    show_dialog(id, (body) => {
        var dl = document.createElement("dl")
        var append_header = (text) => {
            var header = document.createElement("dt")
            header.textContent = text
            dl.appendChild(header)
        }
        var append_card = (c) => {
            var p = document.createElement("dd")
            p.className = "cardtip"
            p.onmouseenter = () => on_focus_card_tip(c)
            p.onmouseleave = () => on_blur_tip()
            //p.onmousedown = () => _tip_focus_event_mobile(NONE, c, "card event_card c" + c)
            p.innerHTML = format_card_info(c)
            dl.appendChild(p)
        }
        var faction_name = "Allied"
        var faction = 1

        if (id === "event_cards_jp") {
            faction_name = "Japansese"
            faction = 0
        }

        append_header(`${faction_name} Removed Cards (${G.removed[faction].length})`)
        G.removed[faction].forEach(append_card)
        append_header(`${faction_name} Discard Pile (${G.discard[faction].length})`)
        G.discard[faction].forEach(append_card)
        var hand = draw_list().hand[faction]
        append_header(`${faction_name} Deck and Hand (${hand.length})`)
        hand.forEach(append_card)

        body.appendChild(dl)
    })
}

function pw_dialog(id, response) {
    var response = pw_query()
    show_dialog(id, (body) => {
        var dl = document.createElement("dl")
        var header = document.createElement("dt");
        header.appendChild(create_icon(...counters.pw.split(" ")))
        header.innerHTML += ` Current Political Will: ${G.political_will}.`
        dl.appendChild(header)
        dl.appendChild(print_pow())
        dl.appendChild(print_naval_situation())
        if (G.sid !== SOUTH_PACIFIC_SCENARIO) {
            dl.appendChild(print_casualties())
            dl.appendChild(print_resources())
            dl.appendChild(print_occupation(events.ALASKA_OCCUPATION))
            dl.appendChild(print_occupation(events.HAWAII_OCCUPATION))
        }
        for (var nation of response.nations) {
            dl.appendChild(print_nation_status(nation))
        }
        body.appendChild(dl)
    })
}

function create_unit_display(data_id) {
    const piece = pieces[data_id]
    var p = document.createElement("div")
    p.classList.add(...piece.counter.split(' '))
    p.classList.add("d-piece", "unit", "piece")
    //adapted the world.js tooltip_image to work here,
    //would be better if we had a way to reuse the world framework element
    if (is_mobile()) {
        p.addEventListener("touchstart", function () {
            long_tap(() => unit_tooltip_image(data_id, true))
        })
        p.addEventListener("touchend", function () {
            long_tap_cancel()
        })
    } else {
        p.addEventListener("mouseenter", function () {
            unit_tooltip_image(data_id, true)
        })
    }
    p.addEventListener("mouseleave", function () {
        unit_tooltip_image(data_id, false)
    })
    return p
}

function elim_dialog(name, response) {

    show_dialog(name, (body) => {
        var elim = [[], [], [], []]
        for (var i = 1; i < pieces.length; i++) {
            const piece = pieces[i]
            if (G.location[i] === ELIMINATED_BOX || G.location[i] === PERM_ELIMINATED) {
                if (piece.notreplaceable || G.location[i] === PERM_ELIMINATED) {
                    elim[piece.faction * 2 + 1].push(i)
                } else {
                    elim[piece.faction * 2].push(i)
                }
            }
        }
        var create_sub_container = (parent, text, units) => {
            let small_sub_cont = document.createElement("div")
            let big_sub_cont = document.createElement("div")
            let header = document.createElement("dt")
            header.textContent = text
            parent.appendChild(header)
            small_sub_cont.classList.add("unit-grid")
            parent.appendChild(small_sub_cont)
            big_sub_cont.classList.add("big-unit-grid")
            parent.appendChild(big_sub_cont)
            units.forEach(u => {
                let p = create_unit_display(u)
                var piece = pieces[u]
                if (piece.counter.includes("big")) {
                    big_sub_cont.appendChild(p)
                } else {
                    small_sub_cont.appendChild(p)
                }
            })
            return [big_sub_cont, small_sub_cont]
        }

        let create_player_section = (text, faction) => {
            if (elim[faction * 2].length) {
                create_sub_container(body, text + " Replaceable:", elim[faction * 2])
            }
            if (elim[faction * 2 + 1].length) {
                create_sub_container(body, text + " Permanently Eliminated:", elim[faction * 2 + 1])
            }
        }


        create_player_section("Allied", AP)
        create_player_section("Japanese", JP)
        if (elim.filter(a => a.length > 0).length === 0) {
            append_header("No eliminated units yet.", body)
        }

    })
}

function print_pow() {
    let main = document.createElement("div")
    if (G.pow <= 0) {
        append_header(`No progress of war required for turn ${G.turn}.`, main)
        return main
    }
    var current_pow = G.capture.filter(h => is_space_controlled(h, AP))
    var completed = current_pow.length >= G.pow
    main.appendChild(create_icon(...((completed ? "" : "gray ") + counters.pow_target).split(" ")))
    main.innerHTML += ` Progress of war (${completed ? "Completed" : "-1 PW"}).`
    let keys = document.createElement("div")
    keys.innerHTML += `(${current_pow.length}/${G.pow}) `
    keys.innerHTML += current_pow.map(k => sub_hex(0, k)).join(", ")
    main.appendChild(keys)
    return main
}

function print_resources() {
    let main = document.createElement("div")
    var completed = G.events[events.JAPAN_LACK_OF_RESOURCES.id]
    var value = RESOURCE_HEX.filter(h => is_space_controlled(h, JP)).length
    main.appendChild(create_icon(...((completed ? "" : "gray ") + counters.resource_jp).split(" ")))
    if (completed) {
        main.innerHTML += ` JP control 3 or less resource hexes completed (-3 PW).`
    } else {
        RESOURCE_HEX.filter(h => is_space_controlled(h, JP)).length
        main.innerHTML += ` JP control ${value} > 3 resource hexes.`
    }
    return main
}

function print_casualties() {
    let main = document.createElement("div")
    var completed = G.events[events.US_CASUALTIES.id]
    main.appendChild(create_icon(...((completed ? "gray " : "") + pieces[US_MARINE_UNIT].counter).split(" ")))
    main.innerHTML += ` US Casualties ${completed ? "triggered (-1 PW)." : "not triggered."}`
    return main
}

function print_naval_situation() {
    var counter = [[], []]
    for (var i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.faction === AP && piece.service === "navy" && piece.class === "naval" && G.location[i] < LAST_BOARD_HEX) {
            counter[0].push(i)
            if (piece.br) {
                counter[1].push(i)
            }
        }
    }
    let main = document.createElement("div")

    main.appendChild(print_ship_counter(counter[0], pieces[US_BB_UNIT].counter, "Strategic naval situation - US naval units"))
    if (G.sid !== SOUTH_PACIFIC_SCENARIO) {
        main.appendChild(print_ship_counter(counter[1], pieces[US_CV_UNIT].counter, "Strategic naval situation - US carrier units"))
    }
    return main
}

function print_ship_counter(list, counter, text) {
    var ship = document.createElement("div")
    ship.appendChild(create_icon(...((list.length ? "" : "gray ") + counter).split(" ")))
    var html_text = ` ${text}`
    if (!list.length) {
        html_text += " eliminated (-1 PW)."
    } else if (list.length > 3) {
        html_text += ` (${list.length} units).`
    } else {
        html_text += ` (${list.map(u => sub_piece(0, u)).join(", ")}).`
    }
    ship.innerHTML += html_text
    return ship
}

function get_nation_by_id(object, id) {
    for (var key of Object.keys(object)) {
        if (object[key].id === id) {
            return object[key]
        }
    }
}

function print_nation_status(response) {
    var nation = get_nation_by_id(nations, response.id)
    let main = document.createElement("div")
    main.className = "nation_info"
    main.appendChild(create_flag(response.control))
    var pw_string = ` (${response.control === JP ? "-" : ""}${nation.pw} PW)`
    main.innerHTML += `${nation.name}${nation.pw ? pw_string : ""}.`
    if (response.status) {
        append_header(response.status, main, "div")
    }
    var control = [[], []]
    if (nation.keys) {
        nation.keys.forEach(k => {
            if (is_space_controlled(hex_to_int(k), JP)) {
                control[JP].push(hex_to_int(k))
            } else {
                control[AP].push(hex_to_int(k))
            }
        })
        var key_header = `(${control[JP].length}/${control[AP].length})`
        if (control[JP].length) {
            key_header += " JP: "
            key_header += control[JP].map(k => sub_hex(0, k)).join(", ")
        }
        if (control[AP].length && control[JP].length) {
            key_header += ";   "
        }
        if (control[AP].length) {
            key_header += " AP: "
            key_header += control[AP].map(k => sub_hex(0, k)).join(", ")
        }
        var keys = document.createElement("div")
        keys.innerHTML = key_header
        main.appendChild(keys)
    }
    if (response.info) {
        response.info.forEach(l => append_header(escape_text(l), main))
    }
    return main
}

function print_occupation(response) {
    var nation = get_nation_by_id(events, response.id)
    let main = document.createElement("div")
    main.className = "nation_info"
    var status = G.events[response.id]
    main.appendChild(create_icon(...nation.counter.split(" "), (status ? "marker" : "gray")))
    var pw_string = ` (${nation.pw} PW)`
    main.innerHTML += `${nation.name}${nation.pw ? pw_string : ""}.`
    if (status && G.turn - status >= nation.turns_to_control) {
        return main
    }
    if (status) {
        append_header(`Turns: ${G.turn - status + 1}/${nation.turns_to_control}`, main, "div")
    }
    var control = [[], []]
    if (nation.keys) {
        var key_header = `Keys: `
        key_header += nation.keys.map(k => sub_hex(0, hex_to_int(k))).join(", ")
        var keys = document.createElement("div")
        keys.innerHTML = key_header
        main.appendChild(keys)
    }
    if (response.info) {
        response.info.forEach(l => append_header(escape_text(l), main))
    }
    return main
}

function print_winner(side, text) {
    let main = document.createElement("div")
    main.appendChild(create_flag(side))
    main.innerHTML += " " + text
    return main
}

function vp_dialog(id, response) {
    if (!scenario_data().original_control) {
        send_query('original_control')
        return
    }
    response = get_victory()
    show_dialog(id, (body) => {
        let dl = document.createElement("dl")
        if (response.won_side === "Japan") {
            dl.appendChild(print_winner(JP, `${response.won_text}. Total VP: ${response.vp}.`))
        } else {
            dl.appendChild(print_winner(AP, `${response.won_text}. Total VP: ${response.vp}.`))
        }
        if (response.text.length === 0) {
            response.text.push(response.won_text)
        }
        response.text.forEach(text => {
            let header = document.createElement("div")
            header.innerHTML = text.replace(/H(\d+)/g, sub_hex)
            dl.appendChild(header)
        })
        append_header("", dl, "br")
        append_header("Summary:", dl)
        if (SID == BURMA_SCENARIO) {
            append_header("2 VP or less - Allied Decisive Victory.", dl)
            append_header("3-4 VP Allied Tactical Victory.", dl)
            append_header("5-8 VP Japanese Tactical Victory.", dl)
            append_header("9 VP Japanese Decisive Victory.", dl)
        } else {
            append_header("2 VP or less - Allied Decisive Victory.", dl)
            append_header("3-5 VP Allied Tactical Victory.", dl)
            append_header("6-9 VP Japanese Tactical Victory.", dl)
            append_header("10 VP Japanese Decisive Victory.", dl)
        }

        body.appendChild(dl)
    })
}

function append_header(text, dl, el = "dt") {
    let header = document.createElement(el)
    header.innerHTML = text
    dl.appendChild(header)
}

function create_flag(faction) {
    var result = document.createElement("div")
    if (faction) {
        result.className = counters.control_us
    } else {
        result.className = counters.control_jp
    }
    result.classList.add("icon")
    return result
}

function create_icon(...icon) {
    var result = document.createElement("div")
    result.classList.add("icon")
    icon.forEach(c => result.classList.add(c))
    return result
}

function battle_info_dialog(id, response) {
    show_dialog(id, (body) => {
        let dl = document.createElement("div")
        dl.className = "wrapper"
        let header = document.createElement("dt")
        header.innerHTML = `Combat hex ${String.fromCharCode(65 + response.battle_name)} (${sub_hex(null, response.battle_hex)})`
        body.appendChild(header)
        body.appendChild(dl)
        if (response.air_naval[0].length || response.air_naval[1].length) {
            var at = G.offensive.attacker
            var def = 1 - G.offensive.attacker
            dl.appendChild(create_battle_box(at,
                response.naval_cf[at], response.naval_rm[at], response.air_naval[at], response.naval_log[at]))
            dl.appendChild(create_battle_box(def,
                response.naval_cf[def], response.naval_rm[def], response.air_naval[def], response.naval_log[def]))
            // dl.appendChild(an_box)
        }
        if (response.ground[0].length || response.ground[1].length) {
            var an_box = document.createElement("div")
            var faction = G.offensive.attacker
            dl.appendChild(create_battle_box(faction,
                response.ground_cf[faction], response.ground_rm[faction], response.ground[faction], response.ground_log[faction]))
            faction = 1 - faction
            dl.appendChild(create_battle_box(faction,
                response.ground_cf[faction], response.ground_rm[faction], response.ground[faction], response.ground_log[faction]),)
            // dl.appendChild(an_box)
        }
    })
}

function create_battle_box(faction, cf, rm, units, log) {
    var result = document.createElement("div")
    if (cf === 0) {
        return result
    }
    result.className = "battle_box"
    result.appendChild(create_flag(faction))
    append_header(`CF: ${cf}  ${rm > 0 ? "+" : ""}${rm ? rm + " DRM" : ""}`, result)
    units.sort((a, b) => G.location[a] - G.location[b])
    var prev = null
    for (var i of units) {
        var loc = G.location[i]
        if (loc !== prev) {
            prev = loc
            var text = document.createElement("div")
            text.innerHTML = sub_hex(null, loc)
            result.appendChild(text)
        }
        var piece = pieces[i]
        populate_generic_to_parent(result, "icon piece " + piece.counter + (set_has(G.reduced, i) && !(piece.notreplaceable && piece.start_reduced) ? " reduced" : ""))
    }
    if (log.length) {
        append_header("Modifiers:", result)
    }
    log.forEach(text => {
        result.appendChild(on_log(text))
    })
    return result
}

const FLOAT_SURRENDER = [
    nations.PHILIPPINES, nations.MALAYA, nations.DEI, nations.BURMA,
    nations.AUSTRALIA, nations.NEW_GUINEA, nations.MARSHALL,
]

function pw_query() {
    var result = {
        nations: [],
    }
    result.nations.push(get_china_info())
    result.nations.push(get_nation_info(nations.AUSTRALIAN_MANDATES))
    if (G.sid === SOUTH_PACIFIC_SCENARIO) {
        result.nations.push(get_nation_info(nations.NEW_GUINEA))
    } else {
        result.nations.push(get_india_info())
        FLOAT_SURRENDER.forEach(n => result.nations.push(get_nation_info(n)))
        result.nations.push(get_japan_info())
    }
    return result
}

function get_china_info() {
    var id = nations.CHINA.id
    var surrender = G.surrender[id] >= 5
    var offensive = G.events[events.CHINA_OFFENSIVE.id]
    var mods = get_china_offensive_modifiers()
    var info = []
    var draw = draw_list().hand
    var count = [0, 0]
    draw[JP].forEach(c => {
        if (cards[c].china) {
            count[JP]++
        }
    })
    draw[AP].forEach(c => {
        if (cards[c].china) {
            count[AP]++
        }
    })
    if (!surrender) {
        info.push(`Offensive ${(G.turn - offensive > 1) ? "" : "not "}possible${offensive > 0 ? ". Last launched turn " + offensive : ""}.`)
        mods.log.forEach(l => info.push(l))
        info.push(`Not played JP cards to China Government Front Status: ${count[JP]}.`)
        info.push(`Not played AP cards to China Government Front Status: ${count[AP]}.`)
    }
    return {
        id, control: surrender ? JP : AP, info,
        status: `(${G.surrender[id] + 1}/5) ${nations.CHINA.statuses[G.surrender[id]]}.`
    }
}

function get_india_info() {
    var nation = nations.INDIA
    var id = nation.id
    var name = nation.name
    var surrender = G.surrender[id] >= 5
    return {
        id, control: surrender ? JP : AP,
        status: `(${Math.min(G.surrender[id] + 1, 5)}/5) ${nations.INDIA.statuses[G.surrender[id]]}.`
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

function get_nation_info(nation) {
    var id = nation.id
    var surrender = G.surrender[id]
    return {id, control: surrender ? JP : AP}
}

function draw_list() {
    var data = scenario_data()
    var hand = [[], []]
    for_each_card((id, card) => {
        var faction = card.faction
        if (data.has_card(id) && !set_has(G.removed[faction], id) && !set_has(G.discard[faction], id)) {
            hand[faction].push(id)
        }
    })
    return {hand}
}