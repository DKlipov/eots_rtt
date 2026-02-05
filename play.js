"use strict"


const LAST_BOARD_HEX = 1476
const NON_PLACED_BOX = 1477
const ELIMINATED_BOX = 1478
const DELAYED_BOX = 1479
const TURN_BOX = 1480
const CHINA_BOX = 1500

//status markers
const JP_AGREEMENT = 0
const AP_AGREEMENT = 1


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


const TRACK_MARKERS = [
    {
        counter: "resource_jp",
        alt_counter: "resource_jp_1",
        value: G => RESOURCE_HEX.filter(h => set_has(G.control, h)).length
    },
    {
        counter: "asp_jp",
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
        counter: G => "turn_pmt",
        value: G => G.turn
    },
]

function current_pow(G) {
    if (G.turn < 4) {
        return 0
    }
    return G.capture.filter(h => !set_has(G.control, h)).length
}

function on_focus_card_tip(c) {
    if (data.cards[c].type === "Barrage")
        document.getElementById("tooltip").classList = "card barrage c" + c
    else
        document.getElementById("tooltip").classList = "card c" + c
}

function on_blur_card_tip(c) {
    document.getElementById("tooltip").classList = "hide"
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
    for (var i = 1; i < LAST_BOARD_HEX; ++i) {
        let center = hex_center(i)
        define_layout("board_hex", i, [center[0] - 18, center[1] - 14, 45, 45], "stack")
        define_space("action_hex", i, [center[0] - 29, center[1] - 19, 45, 45], "hex")
        ZOI_HEX.push(define_space("zoi", i, [center[0] - 29, center[1] - 19, 45, 45], "hex hide"))
    }
    define_layout("board_hex", NON_PLACED_BOX, [10, 10, 45, 45], "stack")
    define_layout("board_hex", ELIMINATED_BOX, [50, 50, 45, 45], "stack")
    define_layout("board_hex", DELAYED_BOX, [2100, 1350, 45, 45], "stack")
    define_layout("board_hex", CHINA_BOX, [790, 380, 45, 45], "stack")
    define_layout("status", JP_AGREEMENT, [890, 130, 35, 35])
    define_layout("status", AP_AGREEMENT, [945, 130, 35, 35])
    for (i = 0; i < 11; i++) {
        define_layout("pw", i, [147, 1068 - Math.floor((i * 42.3)), 35, 35])
    }
    for (i = 0; i < 11; i++) {
        define_layout("wie", i, [243, 645 + Math.floor((i * 42.3)), 35, 35])
    }
    for (i = 1; i < 13; i++) {
        define_layout("turn", i, [63, 1110 - Math.floor((i * 42.3)), 35, 35], "stack")
    }
    for (i = 0; i < 10; i++) {
        define_layout("track", i, [343, 1430 - Math.floor((i * 42.3)), 35, 35], "stack")
    }
    for (i = 0; i < 5; i++) {
        define_layout("india", i, [540 - Math.floor((i * 45)), 50, 35, 35])
    }
    for (let i = 0; i < data.pieces.length; ++i) {
        let piece = data.pieces[i]
        piece.element = define_piece("unit", i, piece.counter)
    }
    for (let i = 0; i < data.cards.length; ++i) {
        let card = data.cards[i]
        card.element = define_card("card", i, `action card_${card.faction ? "ap" : "jp"}_${card.num}`)
        card.element.onclick = on_click_card
        card.element.card = i
    }
    define_panel("hand", JP, "jp_hand")
    define_panel("hand", AP, "ap_hand")
    define_panel("hand", 2, "active_cards")
}

function push_stack(stk, elt) {
    stk.unshift(elt)
    elt.my_stack = stk
}

function update_hand(side) {
    var fo_card;
    if (G.future_offensive[side] >= 0) {
        fo_card = populate("hand", side, "card", G.future_offensive[side])
    } else if (G.events[data.events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        fo_card = populate_generic("hand", side, side === JP ? "card card_jp_0" : "card card_ap_0")
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
    return [71 + column * 43.0, 43 + (i % 29) * 50 + (column % 2) * 25]
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
    var sizeX = 2290
    var sizeY = 1490
    CANVAS.style.width = sizeX + "px"
    CANVAS.style.height = sizeY + "px"

    var scale = window.devicePixelRatio
    CANVAS.width = sizeX * scale
    CANVAS.height = sizeY * scale

    CANVAS_CTX.scale(scale, scale)
}

function draw_paths() {
    map_for_each(G.offensive.paths, (k, v) => {
        var start = hex_center(v[2])
        var finish
        var color = data.pieces[k].faction ? "blue" : "red"
        var d = data.pieces[k].faction ? -2 : 2
        CANVAS_CTX.strokeStyle = color
        CANVAS_CTX.fillStyle = color
        CANVAS_CTX.lineWidth = 2;
        for (var j = 3; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            CANVAS_CTX.beginPath();
            CANVAS_CTX.arc(start[0], start[1] + d, 4, 0, 2 * Math.PI);
            CANVAS_CTX.fill();
            CANVAS_CTX.stroke();
            CANVAS_CTX.beginPath();
            if (G.location[k] === v[j - 1]) {
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

function on_update() {
    var z, u

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
    let unit_present_hex = []


    G.control.filter(h => !set_has(G.capture, h) && !set_has(JP_BOUNDARIES, h))
        .forEach(h => populate_generic("board_hex", h, "marker control_jp"))
    JP_BOUNDARIES.filter(h => !set_has(G.capture, h) && !set_has(G.control, h))
        .forEach(h => populate_generic("board_hex", h, "marker control_ap"))
    G.capture.forEach(h => populate_generic("board_hex", h, set_has(G.control, h) ? "marker capture_jp" : "marker capture_ap"))
    for (var i = 0; i < data.pieces.length; ++i) {
        let piece = data.pieces[i]
        if (G.location[i] > 0) {
            set_add(unit_present_hex, G.location[i])
            let unit = populate("board_hex", G.location[i], "unit", i)
            unit.classList.toggle("activated", G.offensive.active_units.includes(i))
            unit.classList.toggle("selected", G.active_stack.includes(i))
            unit.classList.toggle("reduced", set_has(G.reduced, i))
            unit.classList.toggle("oos", set_has(G.oos, i))
        }
    }
    if (G.turn > 3) {
        G.capture.filter(h => !set_has(G.control, h))
            .forEach(h => populate_generic("board_hex", h, "marker pow"))
    }
    var oos_hex_set = []
    for (i = 0; i < G.oos.length; i++) {
        let hex = G.location[G.oos[i]]
        if (!set_has(oos_hex_set, hex)) {
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
        if (zoi_state === 0) {
            ZOI_HEX[i].classList.add("hide")
        } else if (zoi_state === 1) {
            ZOI_HEX[i].classList.remove("hide")
            ZOI_HEX[i].classList.remove("ap_zoi")
            ZOI_HEX[i].classList.add("jp_zoi")
        } else if (zoi_state === 2) {
            ZOI_HEX[i].classList.remove("hide")
            ZOI_HEX[i].classList.remove("jp_zoi")
            ZOI_HEX[i].classList.add("ap_zoi")
        } else {
            ZOI_HEX[i].classList.remove("hide")
            ZOI_HEX[i].classList.remove("jp_zoi")
            ZOI_HEX[i].classList.remove("ap_zoi")
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

    populate_generic("india", Math.min(4, G.surrender[data.nations.INDIA.id]), "marker india")

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
        var counter = marker.counter
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
    action_button("strat_move", "Strategic move")
    action_button("amphibious", "Amphibious")


    action_button("pass", "Pass")
    action_button("skip", "Skip")
    action_button("no_move", "No move")
    action_button("next", "Next")
    action_button("done", "Done")
    action_button("undo", "Undo")
    action_button("all", "Choose all")

    //debug
    action_button("isr", "isr")
    action_button("deploy_b29", "deploy_b29")
    action_button("ns", "to political phase")
    action_button("control", "debug_mode")

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
                item.classList.add("hide")
                item.onclick = null
            } else {
                if (is_action(action, target_id)) {
                    show = true
                    item.classList.add("action")
                    item.classList.remove("disabled")
                    item.classList.remove("hide")
                    item.onclick = function () {
                        send_action(action, target_id)
                        hide_popup_menu()
                        evt.stopPropagation()
                    }
                } else {
                    item.classList.remove("action")
                    item.classList.remove("hide")
                    item.classList.add("disabled")
                    item.onclick = null
                }
            }
        }
    }
    console.log(show)
    console.log(view.actions)
    console.log(target_id)
    console.log(is_action("play_ops", target_id))
    if (show) {
        menu.onmouseleave = hide_popup_menu
        menu.style.display = "block"
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
        menu.style.display = "none"
    }
}

function hide_popup_menu() {
    document.getElementById("card_popup").style.display = "none"
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