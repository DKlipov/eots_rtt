"use strict"


const LAST_BOARD_HEX = 1476
const NON_PLACED_BOX = 1477
const ELIMINATED_BOX = 1478
const DELAYED_BOX = 1479
const CHINA_BOX = 1480
const PERM_ELIMINATED = 1481
const TURN_BOX = 1490

const MANCHURIA_1 = hex_to_int(3302)
const MANCHURIA_2 = hex_to_int(3303)

//status markers
const JP_AGREEMENT = 0
const AP_AGREEMENT = 1


const JP_GARRISON_JP = find_piece("army_jp_g_mainland")
const JP_GARRISON_CN = find_piece("army_jp_g_1")

const CANVAS = document.getElementById("canvas")
const CANVAS_CTX = document.getElementById("canvas").getContext("2d")
const ZOI_HEX = [0]
const RESOURCE_HEX = [...Array(data.map.length).keys()].filter(h => data.map[h].resource).map(h => hex_to_int(data.map[h].id))

const JP_REGIONS = ["JMandates", "Korea", "Manchuria", "China", "Formosa", "Indochina", "Siam", "Caroline", "Marshall", "Japan"]
const JP_BOUNDARIES = [];

[...Array(data.map.length).keys()].map(h => data.map[h]).filter(hex => (hex.airfield || hex.port || hex.port || hex.city) && JP_REGIONS.includes(hex.region))
    .forEach(h => set_add(JP_BOUNDARIES, hex_to_int(h.id)))
set_add(JP_BOUNDARIES, hex_to_int(3606))
set_add(JP_BOUNDARIES, hex_to_int(2109))

const ROAD_EVENTS = Object.keys(data.events).filter(k => data.events[k].road).map(k => {
    var event = data.events[k]
    event.keys = event.keys.map(h => hex_to_int(h))
    return event
})

const CARD_ACTIONS = ["card"]

for (let item of document.getElementById("card_popup").querySelectorAll("li")) {
    let action = item.dataset.action
    if (action) {
        CARD_ACTIONS.push(action)
    }
}

const TRACK_MARKERS = [
    {
        counter: "resource_jp",
        alt_counter: "resource_jp_1",
        value: G => RESOURCE_HEX.filter(h => set_has(G.control, h)).length
    },
    {
        counter: "naval_repl",
        value: G => G.reinforcements.NAVAL
    },
    {
        counter: "air_repl",
        value: G => G.reinforcements.AIR
    },
    {
        counter: () => G.events[data.events.BARGES.id] > 0 ? "asp_b_jp" : "asp_jp",
        value: G => G.asp[0][0]
    },
    {
        counter: "aspu_jp",
        always_show: true,
        value: G => G.asp[0][1]
    },
    {
        counter: "asp_ap",
        alt_counter: "asp_ap_1",
        value: G => G.asp[1][0]
    },
    {
        counter: "aspu_ap",
        alt_counter: "aspu_ap_1",
        always_show: true,
        value: G => G.asp[1][1]
    },
    {
        counter: "drawn_jp",
        value: G => G.draw_counter[0]
    },
    {
        counter: "drawn_ap",
        value: G => G.draw_counter[1]
    },
    {
        counter: "pass_jp",
        value: G => G.passes[0]
    },
    {
        counter: "pass_ap",
        value: G => G.passes[1]
    },
    {
        counter: "pow_target",
        always_show: G => G.turn > 3,
        value: G => (G.turn > 3) ? G.pow : 0
    },
    {
        counter: "pow",
        always_show: G => G.turn > 3,
        value: G => current_pow(G)
    },
]

const TURN_MARKERS = [
    {
        counter: "future_offensive_jp",
        value: G => G.events[data.events.FUTURE_OFFENSIVE_JP.id]
    },
    {
        counter: "future_offensive_ap",
        value: G => G.events[data.events.FUTURE_OFFENSIVE_AP.id]
    },
    {
        counter: "defensive_doctrine",
        value: G => G.events[data.events.NEW_OPERATION_PLAN.id]
    },
    {
        counter: "barges",
        value: G => G.events[data.events.BARGES.id]
    },
    {
        counter: () => (G.events[data.events.JP_ESCORTS.id] >> 4 === 2) ? "escorts2" : "escorts4",
        value: G => G.events[data.events.JP_ESCORTS.id] % (1 << 4)
    },
    {
        counter: "interceptors_jp",
        value: G => G.events[data.events.INTERCEPTORS.id]
    },
    {
        counter: "panama_canal",
        value: G => G.events[data.events.PANAMA_CANAL.id]
    },
    {
        counter: "doolitle",
        value: G => G.events[data.events.DOOLITLE.id]
    },
    {
        counter: "pt_boats",
        value: G => G.events[data.events.PT_BOATS.id]
    },
    {
        counter: "us_sub",
        value: G => G.events[data.events.SUBMARINE_DOCTRINE.id]
    },
    {
        counter: "alaska",
        value: G => G.events[data.events.ALASKA_OCCUPATION.id]
    },
    {
        counter: "hawaii",
        value: G => G.events[data.events.HAWAII_OCCUPATION.id]
    },
    {
        counter: "strat_bombing",
        value: G => G.events[data.events.STRAT_BOMBING_CAMPAIGN.id]
    },
    {
        counter: "china_offensive",
        value: G => G.events[data.events.CHINA_OFFENSIVE.id]
    },
    {
        counter: G => G.events[data.events.TOJO.id] ? "turn_tr" : "turn_pmt",
        value: G => G.turn
    },
]

function current_pow(G) {
    if (G.turn < 4) {
        return 0
    }
    return G.capture.filter(h => !set_has(G.control, h)).length
}

function clear_paths() {
    CANVAS_CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
}

function on_init() {
    init_canvas()
    let map = document.getElementById("map")
    map.onclick = (a) => {
        if (a.target === map && world.focus !== null) {
            world.focus.classList.remove("focus")
            world.focus = null
            on_update()
        }
    }
    var first_hex = []
    var last_hex = []
    for (var i = 0; i < data.map.length; i++) {
        var hex = hex_to_int(data.map[i].id)
        let x = Math.floor(hex / 29)
        let y = hex % 29
        if (map_get(first_hex, x, 100) > y) {
            map_set(first_hex, x, y)
        }
        if (map_get(last_hex, x, 0) < y) {
            map_set(last_hex, x, y)
        }
    }
    for (var i = 1; i < LAST_BOARD_HEX; ++i) {
        var x = Math.floor(i / 29)
        let y = i % 29
        if (map_get(first_hex, x, 0) > y) {
            continue
        }
        // if (map_get(last_hex, x, 0) < i) {
        //     continue
        // }
        let center = hex_center(i)
        define_layout("board_hex", i, [center[0] - 18, center[1] - 14, 45, 45], "stack")
        define_space("action_hex", i, [center[0] - 29, center[1] - 19, 45, 45], "hex")
        ZOI_HEX[i] = (define_space("zoi", i, [center[0] - 33, center[1] - 24, 45, 45], "hex hide"))
    }
    define_layout("board_hex", NON_PLACED_BOX, [10, 10, 45, 45], "stack")
    define_layout("board_hex", ELIMINATED_BOX, [100, 1280, 45, 45], "stack")
    define_layout("board_hex", PERM_ELIMINATED, [100, 1180, 45, 45], "stack")
    define_layout("board_hex", DELAYED_BOX, [2420, 1540, 45, 45], "stack")
    define_layout("board_hex", CHINA_BOX, [890, 420, 45, 45], "stack")
    define_layout("status", JP_AGREEMENT, [990, 143, 35, 35])
    define_layout("status", AP_AGREEMENT, [1054, 143, 35, 35])
    for (i = 0; i < 11; i++) {
        define_layout("pw", i, [167, 1185 - Math.floor((i * 46.9)), 35, 35])
    }
    for (i = 0; i < 11; i++) {
        define_layout("wie", i, [273, 715 + Math.floor((i * 46.9)), 35, 35])
    }
    for (i = 1; i < 13; i++) {
        define_layout("turn", i, [68, 1232 - Math.floor((i * 46.9)), 35, 35], "stack")
        define_space("action_box", i + TURN_BOX, [63, 1110 - Math.floor((i * 42.3)), 35, 35])
    }
    for (i = 0; i < 10; i++) {
        define_layout("track", i, [383, 1585 - Math.floor((i * 46.5)), 35, 35], "stack")
    }
    for (i = 0; i < 5; i++) {
        define_layout("india", i, [603 - Math.floor((i * 50)), 65, 35, 35])
    }
    for (i = 0; i < 3; i++) {
        define_layout("burma", i, [533 - Math.floor((i * 63)), 135, 35, 35])
    }
    for (i = 0; i < 6; i++) {
        define_layout("china", i, [843 - Math.floor((i * 46.9)), 152, 35, 35])
    }
    for (i = 0; i < 13; i++) {
        define_layout("divisions", i, [678 + Math.floor((i * 46.9)), 47, 35, 35])
    }
    define_marker("divisions", 0, "divisions_china")
    for (let i = 1; i < data.pieces.length; ++i) {
        let piece = data.pieces[i]
        piece.element = define_piece("unit", i, piece.counter)
    }
    for (let i = 1; i < data.cards.length; ++i) {
        let card = data.cards[i]
        card.element = define_card("card", i, `action card_${card.faction ? "ap" : "jp"}_${card.num}`)
        card.element.onclick = on_click_card
        card.element.card = i
    }
    define_panel("#jp_hand", "hand", JP)
    define_panel("#ap_hand", "hand", AP)
    define_panel("#active_cards","hand", 2)
}

function push_stack(stk, elt) {
    stk.unshift(elt)
    elt.my_stack = stk
}

function is_active_card(card) {
    for (let a of CARD_ACTIONS) {
        // console.log(G.actions[a])
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
    } else if (G.events[data.events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        fo_card = populate_generic_to_parent(lookup_thing("hand", side).element, side === JP ? "card card_jp_0" : "card card_ap_0")
    }
    if (G.events[data.events.FUTURE_OFFENSIVE_JP.id + side] === G.turn) {
        populate_generic_to_parent(fo_card, "marker future_offensive_inactive")
    } else if (G.events[data.events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        populate_generic_to_parent(fo_card, `marker future_offensive_${side === AP ? "ap" : "jp"}`)
    }

    if (!Array.isArray(G.hand[side])) {
        for (let i = 0; i < G.hand[side]; i++) {
            populate_generic("hand", side, side === JP ? "card card_jp_0" : "card card_ap_0")
        }
    } else {
        for (let i = 0; i < G.hand[side].length; i++) {
            let card = G.hand[side][i]
            populate("hand", side, "card", card)
            //.classList.toggle("action", is_active_card(card))
            // populate("hand", side, "card", card).classList.add("action")
        }
    }
}

function get_near_hexes(hex) {
    let x = Math.floor(hex / 29)
    let y = hex % 29
    let y_diff = x % 2 ? 1 : -1
    let result = []
    if (y > 0) {
        result.push(hex - 1)
    }
    if (y < 28) {
        result.push(hex + 1)
    }
    if (x > 0) {
        result.push(hex - 29)
        result.push(hex - 29 + y_diff)
    }
    if (x < 50) {
        result.push(hex + 29)
        result.push(hex + 29 + y_diff)
    }
    return result
}

function test(hex) {
    return get_near_hexes(hex_to_int(hex)).map(h => int_to_hex(h))
}

function hex_to_int(i) {
    return (Math.floor(i / 100) - 10) * 29 + i % 100
}


function int_to_hex(i) {
    return (Math.floor(i / 29) * 100) + 1000 + i % 29
}

function hex_center(i) {
    let column = (Math.floor(i / 29))
    return [77 + column * 48.0, 50 + (i % 29) * 55.3 + (column % 2) * 25]
}

// for (let i = 1; i < LAST_BOARD_HEX; ++i) {
//     let elt = document.createElement("div")
//     elt.style.borderColor = "red"
//     elt.style.backgroundColor = "red"
//     elt.style.height = "3px"
//     elt.style.width = "3px"
//     elt.style.position = "absolute"
//     elt.style.left = hex_center(i)[0] + "px"
//     elt.style.top = hex_center(i)[1] + "px"
//     document.getElementById("map").appendChild(elt)
// }

function init_canvas() {
    var sizeX = 2550
    var sizeY = 1650
    CANVAS.style.width = sizeX + "px"
    CANVAS.style.height = sizeY + "px"

    var scale = window.devicePixelRatio
    CANVAS.width = sizeX * scale
    CANVAS.height = sizeY * scale

    CANVAS_CTX.scale(scale, scale)
}

function draw_paths() {
    map_for_each(G.offensive.paths, (k, v) => {
        if (G.location[k] > LAST_BOARD_HEX) {
            return
        }
        var start = hex_center(v[2])
        var finish
        var color = data.pieces[k].faction ? "blue" : "red"
        var d = data.pieces[k].faction ? -2 : 2
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
    var unit
    if (location > TURN_BOX && location <= (TURN_BOX + 12)) {
        unit = populate("turn", location - TURN_BOX, "unit", u)
        unit.classList.toggle("reduced", set_has(G.reduced, u))
        unit.classList.remove("oos")
        unit.classList.remove("activated")
        unit.classList.remove("selected")
    } else if (location === ELIMINATED_BOX && !data.pieces[u].notreplaceable || location !== ELIMINATED_BOX) {
        unit = populate("board_hex", location, "unit", u)
        unit.classList.toggle("reduced", set_has(G.reduced, u) || location === ELIMINATED_BOX
            || data.pieces[u].class === "hq" && G.inter_service[data.pieces[u].faction])
        unit.classList.toggle("oos", set_has(G.oos, u))
        unit.classList.toggle("activated", G.offensive.active_units.includes(u))
        unit.classList.toggle("selected", G.active_stack.includes(u))
    }
}

function on_update() {

    begin_update()

    console.log(G)
    map_for_each(G.offensive.damaged, (u, s) => {
        if (s >= 2) {
            G.location[u] = ELIMINATED_BOX
        } else {
            set_add(G.reduced, u)
        }
    })
    clear_paths()
    draw_paths()


    // console.log(V)
    // console.log(R)
    // G.actions={}
    // G.actions.board_hex = []
    // G.actions.board_hex.push(hex_to_int(piece.start))


    G.control.filter(h => !set_has(G.capture, h) && !set_has(JP_BOUNDARIES, h))
        .forEach(h => populate_generic("board_hex", h, "marker control_jp"))
    G.control.filter(h => set_has(G.garr_elim, h))
        .forEach(h => populate_generic("board_hex", h, "marker no_garrison"))
    JP_BOUNDARIES.filter(h => !set_has(G.capture, h) && !set_has(G.control, h) && h !== MANCHURIA_1 && h !== MANCHURIA_2)
        .forEach(h => populate_generic("board_hex", h, "marker control_ap"))
    G.capture.forEach(h => {
        var marker
        if (h === MANCHURIA_1 || h === MANCHURIA_2) {
            marker = "marker capture_sov"
        } else if (set_has(G.control, h)) {
            marker = "marker capture_jp"
        } else {
            marker = "marker capture_ap"
        }
        populate_generic("board_hex", h, marker)
    })
    ROAD_EVENTS.forEach(event => {
        if (!G.events[event.id]) {
            event.keys.forEach(hex => populate_generic("board_hex", hex, "marker road"))
        }
    })
    if (G.events[data.events.TOKYO_EXPRESS.id] > 0) {
        populate_generic("board_hex", G.events[data.events.TOKYO_EXPRESS.id], "marker tokyo_express")
    }
    map_for_each(G.garrison, (h, count) => {
        var marker = JP_GARRISON_CN
        if (count === 0) {
            count = 1
            marker = JP_GARRISON_JP
        }
        for (var i = 0; i < count; i++) {
            populate_generic("board_hex", h, "unit " + data.pieces[marker].counter)
        }
    })
    for (var i = 1; i < data.pieces.length; ++i) {
        if (G.location[i] > 0) {
            place_unit(i, G.location[i])
        }
    }
    if (G.turn > 3) {
        G.capture.filter(h => !set_has(G.control, h))
            .forEach(h => populate_generic("board_hex", h, "marker pow"))
    }
    var oos_hex_set = []
    for (i = 0; i < G.oos.length; i++) {
        let hex = G.location[G.oos[i]]
        if (!set_has(oos_hex_set, hex) && hex <= LAST_BOARD_HEX) {
            populate_generic("board_hex", hex, "marker oos")
            set_add(oos_hex_set, hex)
        }
    }

    // show supply
    // for (i = 1; i < LAST_BOARD_HEX; i++) {
    //     if ((G.supply_cache[i] & (1 << 15)) && G.supply_cache[i] & ((1 << 16) | (1 << 17) | (1 << 18))) {
    //         ZOI_HEX[i].classList.remove("hide")
    //         ZOI_HEX[i].classList.remove("jp_zoi")
    //         ZOI_HEX[i].classList.remove("ap_zoi")
    //     } else if (G.supply_cache[i] & (1 << 15)) {
    //         ZOI_HEX[i].classList.remove("hide")
    //         ZOI_HEX[i].classList.remove("ap_zoi")
    //         ZOI_HEX[i].classList.add("jp_zoi")
    //     } else if (G.supply_cache[i] & ((1 << 16) | (1 << 17) | (1 << 18))) {
    //         ZOI_HEX[i].classList.remove("hide")
    //         ZOI_HEX[i].classList.remove("jp_zoi")
    //         ZOI_HEX[i].classList.add("ap_zoi")
    //     } else {
    //         ZOI_HEX[i].classList.add("hide")
    //     }
    // }

    //show zoi
    for (i = 1; i < LAST_BOARD_HEX; i++) {
        const zoi_state = G.supply_cache[i] & 3
        let hex = ZOI_HEX[i]
        if (!hex) {
            continue
        }else{
            hex = hex.element
        }

        if (zoi_state === 0) {
            hex.classList.add("hide")
        } else if (zoi_state === 1) {
            hex.classList.remove("hide")
            hex.classList.remove("ap_zoi")
            hex.classList.add("jp_zoi")
        } else if (zoi_state === 2) {
            hex.classList.remove("hide")
            hex.classList.remove("jp_zoi")
            hex.classList.add("ap_zoi")
        } else {
            hex.classList.remove("hide")
            hex.classList.remove("jp_zoi")
            hex.classList.remove("ap_zoi")
        }
    }

    // show attack range
    // for (i = 1; i < LAST_BOARD_HEX; i++) {
    //     if ((G.supply_cache[i] & (1 << 19))) {
    //         ZOI_HEX[i].classList.remove("hide")
    //         ZOI_HEX[i].classList.remove("jp_zoi")
    //         ZOI_HEX[i].classList.remove("ap_zoi")
    //     } else {
    //         ZOI_HEX[i].classList.add("hide")
    //     }
    // }


    update_hand(AP)
    update_hand(JP)
    if (G.offensive.active_cards.length > 0) {
        document.getElementById("active_cards").classList.remove("hide")
        for (let i = 0; i < G.offensive.active_cards.length; i++) {
            populate("hand", 2, "card", G.offensive.active_cards[i])
        }
    } else {
        document.getElementById("active_cards").classList.add("hide")
    }

    G.offensive.battle_hexes.forEach(h => populate_generic("board_hex", h, "marker attack"))
    G.offensive.landind_hexes.forEach(h => populate_generic("board_hex", h, "marker landing"))

    G.inter_service.forEach((v, i) => populate_generic("status", i, `marker ${v ? "rivalry" : "agreement"}_${i ? "ap" : "jp"}`))
    populate_generic("pw", G.political_will, "marker pw")
    populate_generic("wie", G.wie, "marker wie")

    populate_generic("india", Math.min(4, G.surrender[data.nations.INDIA.id]),
        `marker ${G.surrender[data.nations.INDIA.id] >= 5 ? "india_status_surrender" : "india_status"}`)

    populate_generic("burma", G.burma_road, `marker burma_road${G.events[data.events.HUMP.id] ? "_hump" : ""}`)
    populate_generic("china", Math.min(5, G.surrender[data.nations.CHINA.id]), `marker china`)
    populate("divisions", G.china_divisions, `divisions`, 0)


    for (i = 0; i < TURN_MARKERS.length; i++) {
        const marker = TURN_MARKERS[i]
        var value = marker.value(G)
        var counter = (typeof marker.counter === 'function') ? marker.counter(G) : marker.counter
        if (value > 0) {
            populate_generic("turn", value, "marker " + counter)
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
            populate_generic("track", track, "marker " + counter)
        }
    }

    action_button("roll", "Roll")

    action_button("move", "Move")
    action_button("done", "Done")
    action_button("eliminate", "Eliminate")
    action_button("stop", "Stop")
    action_button("displace", "Displace")

    action_button("amphibious", "Amphibious")


    action_button("pass", "Pass")
    action_button("skip", "Skip")
    action_button("no_move", "No move")
    action_button("next", "Next")
    action_button("done", "Done")
    action_button("delay", "Delay")
    action_button("all", "Choose all")
    action_button("no_organic", "Disable organic")
    action_button("avoid_zoi", "Avoid ZOI")
    action_button("strat_move", "Strategic move")
    action_button("regular_movement", "Regular movement")
    action_button("extended_air", "Use extended range")
    action_button("barges", "Use barges")
    action_button("no_disen", "Skip ground disengagement")

    //debug
    action_button("isr", "isr(dbg)")
    action_button("deploy_b29", "deploy_b29(dbg)")
    action_button("ns", "end turn(dbg)")
    action_button("control", "change control(dbg)")
    action_button("draw", "draw card(dbg)")
    action_button("auto", "auto(dbg)")

    action_button("undo", "Undo")
    end_update()
}

function on_click_card(evt) {
    console.log(evt)
    let card = evt.target.card
    if (is_action('card', card)) {
        send_action('card', card)
    } else {
        show_popup_menu(evt, "card_popup", card, data.cards[card].name)
    }
}

function show_popup_menu(evt, menu_id, target_id, title, hide = '') {
    let menu = document.getElementById(menu_id)

    let show = false
    for (let item of menu.querySelectorAll("li")) {
        let action = item.dataset.action
        if (action) {
            if (action === hide) {
                item.classList.remove("action")
                item.hidden = true
                item.onclick = null
            } else {
                if (is_action(action, target_id)) {
                    show = true
                    item.classList.add("action")
                    item.classList.remove("disabled")
                    item.hidden = false
                    item.onclick = function () {
                        send_action(action, target_id)
                        hide_popup_menu()
                        evt.stopPropagation()
                    }
                } else {
                    item.classList.remove("action")
                    item.hidden = true
                    item.classList.remove("disabled")
                    item.onclick = null
                }
            }
        }
    }
    if (show) {
        menu.onmouseleave = hide_popup_menu
        menu.hidden = false
        if (title) {
            let item = menu.querySelector("li.title")
            if (item) {
                item.onclick = hide_popup_menu
                item.textContent = title
            }
        }

        let w = menu.clientWidth
        let h = menu.clientHeight
        let x = Math.max(5, Math.min(evt.clientX - w / 2, window.innerWidth - w - 5))
        let y = Math.max(5, Math.min(evt.clientY - 12, window.innerHeight - h - 40))
        menu.style.left = x + "px"
        menu.style.top = y + "px"

        evt.stopPropagation()
    } else {
        menu.hidden = true
    }
}

function hide_popup_menu() {
    document.getElementById("card_popup").hidden = true
}

const ICONS = {
    B0: '<span class="die black d0"></span>',
    B1: '<span class="die black d1"></span>',
    B2: '<span class="die black d2"></span>',
    B3: '<span class="die black d3"></span>',
    B4: '<span class="die black d4"></span>',
    B5: '<span class="die black d5"></span>',
    B6: '<span class="die black d6"></span>',
    W0: '<span class="die white d0"></span>',
    W1: '<span class="die white d1"></span>',
    W2: '<span class="die white d2"></span>',
    W3: '<span class="die white d3"></span>',
    W4: '<span class="die white d4"></span>',
    W5: '<span class="die white d5"></span>',
    W6: '<span class="die white d6"></span>',
    R0: '<span class="die red d0"></span>',
    R1: '<span class="die red d1"></span>',
    R2: '<span class="die red d2"></span>',
    R3: '<span class="die red d3"></span>',
    R4: '<span class="die red d4"></span>',
    R5: '<span class="die red d5"></span>',
    R6: '<span class="die red d6"></span>',
}

function escape_text(text) {
    text = String(text)
    text = text.replace(/---/g, "\u2014")
    text = text.replace(/--/g, "\u2013")
    text = text.replace(/->/g, "\u2192")
    text = text.replace(/-( ?[\d])/g, "\u2212$1")
    text = text.replace(/&/g, "&amp;")
    text = text.replace(/</g, "&lt;")
    text = text.replace(/>/g, "&gt;")
    text = text.replace(/\[/g, "<")
    text = text.replace(/\]/g, ">")
    text = text.replace(/([ +-]1) action points/g, "$1 action point")
    text = text.replace(/([ +-]1) trenches/g, "$1 trench")
    text = text.replace(/([ +-]1) units/g, "$1 unit")
    text = text.replace(/([ +-]1) hits/g, "$1 hit")
    text = text.replace(/[BRW]\d/g, (m) => ICONS[m] ?? m)
    text = text.replace(/C(\d+)/g, sub_card)
    text = text.replace(/P(\d+)/g, sub_piece)
    text = text.replace(/H(\d+)/g, sub_hex)
    return text
}

function on_prompt(text) {
    return escape_text(text)
}

function on_log(text) {
    var p = document.createElement("div")

    switch (text[0]) {
        case "%":
            var m = text.substring(2)
            p.classList.add(text[1] === "F" ? "fm" : "gm")
            if (Number(m) < 4)
                p.classList.add("dark")
            text = m
            break
        case "Q":
            p.className = "q"
            text = data.cards[parseInt(text.substring(1))].text
            break
        case ">":
            p.className = "i"
            text = text.substring(1)
            break
        case "#":
            p.className = "h1"
            text = text.substring(1)
            break
        case "=":
            var round = Number(text.substring(1))
            if (round & 1) {
                p.className = "h2 french"
                text = "French Round " + (round >> 1)
            } else {
                p.className = "h2 german"
                text = "German Round " + (round >> 1)
            }
            break
    }

    p.innerHTML = escape_text(text)

    return p
}

// Below is code imported from Imperial struggle for dialog windows etc
// still not completely integrated. commented out code should be looked at

function on_reply(q, params) {
    if (q === "event_cards") {
        toggle_dialog("event_card_dialog")
    }
}

function toggle_dialog(id) {
    if (document.getElementById(id).classList.contains("show")) {
        hide_dialog(id)
    } else {
        show_card_list(id, null)
    }
}

function show_dialog(id, dialog_generator) {
    document.getElementById(id).classList.add("show")
    let body = document.getElementById(id).querySelector(".dialog_body")
    body.replaceChildren()
    if (dialog_generator) {
        dialog_generator(body)
    }
    if (!is_mobile()) dragElement(document.getElementById(id))
}

function hide_dialog(id) {
    document.getElementById(id).classList.remove("show")
    _tip_blur_mobile_tip()
}

function toggle_dialog_collapse(id) {
    let dialog_body = document.getElementById(id).querySelector(".dialog_body")
    let dialog_x = document.getElementById(id).querySelector(".dialog_x")
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

function show_card_list(id, params) {
    show_dialog(id, (body) => {
        let dl = document.createElement("dl")
        let append_header = (text) => {
            let header = document.createElement("dt")
            header.textContent = text
            dl.appendChild(header)
        }
        let append_card = (c) => {
            let p = document.createElement("dd")
            p.className = "cardtip"
            p.onmouseenter = () => on_focus_card_tip(c)
            p.onmouseleave = () => on_blur_card_tip()
            //p.onmousedown = () => _tip_focus_event_mobile(NONE, c, "card event_card c" + c)
            p.innerHTML = format_card_info(c)
            dl.appendChild(p)
        }

        if (id === "event_card_dialog") {
            append_header(`Japanese Discard Pile (${G.discard[JP].length})`)
            G.discard[JP].forEach(append_card)
            append_header(`Allies Discard Pile (${G.discard[AP].length})`)
            G.discard[AP].forEach(append_card)
            append_header(`Removed Cards (${G.removed.length})`)
            G.removed.forEach(append_card)
            //if (!is_observing()) {
            //	append_header(`Your Hand (${V.hand[R].length})`)
            //	V.hand[R].forEach(append_card)
            //}
        }

        body.appendChild(dl)
    })
}

function is_observing() {
    return (R !== JP) && (R !== AP)
}

function format_card_info(c) {
    let text = "C" + c
    return escape_text(text)
}

function sub_card(match, p1) {
    const c = p1 | 0
    const cn = "card-tip"
    return `<span class="${cn}" onmouseenter="on_focus_card_tip(${c})" onmouseleave="on_blur_card_tip()">${data.cards[c].name}</span>`
}

function on_focus_card_tip(c) {
    let elem = document.getElementById("tooltip")
    const card = data.cards[c]
    elem.classList = `card card_${card.faction ? "ap" : "jp"}_${card.num}`
}

function on_blur_card_tip(c) {
    document.getElementById("tooltip").classList = "hide"
}

function get_piece_elem(p) {
    return data.pieces[p].element
}


function sub_piece(match, p1) {
    const piece_id = p1 | 0
    const name = data.pieces[piece_id].name
    return `<span class="piece-tip" onclick="on_click_piece_tip(${piece_id})" onmouseenter="on_focus_piece_tip(${piece_id})" onmouseleave="on_blur_piece_tip(${piece_id})">${name}</span>`
}

function on_click_piece_tip(z) {
    scroll_into_view(get_piece_elem(z))
}

function on_focus_piece_tip(z) {
    get_piece_elem(z).classList.toggle("tip", true)
}

function on_blur_piece_tip(z) {
    get_piece_elem(z).classList.toggle("tip", false)
}

function get_hex_elem(h){
    //perhaps should cache this somewhere ?
    return lookup_thing("board_hex", h)
}

function get_hex_name(h){
    const hex = int_to_hex(h)
    const hex_id = data.map.findIndex((element) => element.id === hex)
    if(hex_id != -1){
        const hex_data = data.map[hex_id]
        if(hex_data.name){
            return hex_data.name
        }
    }
    
    return `hex ${hex}`
    
}

function sub_hex(match, p1) {
    const hex_id = p1 | 0
    const name = get_hex_name(hex_id)
    return `<span class="hex-tip" onclick="on_click_hex_tip(${hex_id})" onmouseenter="on_focus_hex_tip(${hex_id})" onmouseleave="on_blur_hex_tip(${hex_id})">${name}</span>`
}


function on_click_hex_tip(z) {
    scroll_into_view(get_hex_elem(z))
}

function on_focus_hex_tip(z) {
    get_hex_elem(z).classList.toggle("tip", true)
}

function on_blur_hex_tip(z) {
    get_hex_elem(z).classList.toggle("tip", false)
}
