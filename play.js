"use strict"

const JP = 0
const AP = 1

const LAST_BOARD_HEX = 1476
const ELIMINATED_BOX = 1478
const DELAYED_BOX = 1479
const TURN_BOX = 1480

const CANVAS = document.getElementById("canvas")
const CANVAS_CTX = document.getElementById("canvas").getContext("2d")

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
    for (let i = 1; i < LAST_BOARD_HEX; ++i) {
        let center = hex_center(i)
        define_layout("board_hex", i, [center[0] - 18, center[1] - 14, 45, 45], "stack")
        define_space("action_hex", i, [center[0] - 29, center[1] - 19, 45, 45])
    }
    for (let i = 1; i <= 12; ++i) {
        define_layout("board_hex", TURN_BOX + i, [80, 1050 - (i - 1) * 40, 45, 45], "stack")
        define_space("action_hex", TURN_BOX + i, [80, 1050 - (i - 1) * 40, 45, 45], "stack")
    }
    define_layout("board_hex", ELIMINATED_BOX, [50, 50, 45, 45], "stack")
    define_layout("board_hex", DELAYED_BOX, [2100, 1350, 45, 45], "stack")
    for (let i = 0; i < data.pieces.length; ++i) {
        let piece = data.pieces[i]
        piece.element = define_piece("unit", i, piece.counter)
    }
    for (let i = 0; i < data.cards.length; ++i) {
        let card = data.cards[i]
        card.element = define_card("card", i, "action card_" + card.faction + "_" + card.num)
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
    console.log(`foo ${G.future_offensive[side]}`)
    if (G.future_offensive[side][0] > 0) {
        let card = G.future_offensive[side][1]
        console.log(`foo ${card}`)
        if (card <= 0) {
            populate_generic("hand", side, side === JP ? "card card_jp_0" : "card card_ap_0")
        } else {
            populate("hand", side, "card", card)
        }
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
        var start = hex_center(v[1])
        var finish
        CANVAS_CTX.strokeStyle = "red"
        CANVAS_CTX.fillStyle = "red"
        CANVAS_CTX.lineWidth = 2;
        for (var j = 2; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            CANVAS_CTX.beginPath();
            CANVAS_CTX.arc(start[0], start[1], 4, 0, 2 * Math.PI);
            CANVAS_CTX.fill();
            CANVAS_CTX.stroke();
            CANVAS_CTX.beginPath();
            if (G.location[k] === v[j - 1]) {
                CANVAS_CTX.setLineDash([5, 3]);
            }
            CANVAS_CTX.moveTo(start[0], start[1]);
            CANVAS_CTX.lineTo(finish[0], finish[1]);
            CANVAS_CTX.stroke();
            CANVAS_CTX.setLineDash([])
        }
        if (finish) {
            CANVAS_CTX.beginPath();
            CANVAS_CTX.fillRect(finish[0] - 4, finish[1] - 4, 8, 8)
            CANVAS_CTX.stroke();
        }
    })
}

function on_update() {
    var z, u

    begin_update()

    console.log(G)
    clear_paths()
    draw_paths()


    // console.log(V)
    // console.log(R)
    // G.actions={}
    // G.actions.board_hex = []
    // G.actions.board_hex.push(hex_to_int(piece.start))
    let unit_present_hex = []

    for (let i = 0; i < data.pieces.length; ++i) {
        let piece = data.pieces[i]
        if (G.location[i] > 0) {
            set_add(unit_present_hex, G.location[i])
            let unit = populate("board_hex", G.location[i], "unit", i)
            unit.classList.toggle("activated", G.offensive.active_units.includes(i))
            unit.classList.toggle("selected", G.active_stack.includes(i))
            unit.classList.toggle("reduced", set_has(G.reduced, i))
        }
    }
    G.control.filter(h => !set_has(unit_present_hex, h)).forEach(h => populate_generic("board_hex", h, "marker control_jp"))

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

    action_button("roll", "Roll")

    action_button("move", "Move")
    action_button("done", "Done")
    action_button("stop", "Stop")
    action_button("displace", "Displace")
    action_button("strat_move", "Strategic move")
    action_button("amphibious", "Amphibious")


    action_button("pass", "Pass")
    action_button("no_move", "No move")
    action_button("next", "Next")
    action_button("done", "Done")
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
