"use strict"

const JP = 0
const AP = 1

function on_focus_card_tip(c) {
    if (data.cards[c].type === "Barrage")
        document.getElementById("tooltip").classList = "card barrage c" + c
    else
        document.getElementById("tooltip").classList = "card c" + c
}

function on_blur_card_tip(c) {
    document.getElementById("tooltip").classList = "hide"
}

function on_click_zone_tip(z) {
    scroll_into_view(lookup_thing("zone", z))
}

function on_focus_zone_tip(z) {
    lookup_thing("zone", z).classList.toggle("tip", true)
}

function on_blur_zone_tip(z) {
    lookup_thing("zone", z).classList.toggle("tip", false)
}

function on_init() {
    let map = document.getElementById("map")
    map.onclick = (a) => {
        if (a.target === map && world.focus !== null) {
            world.focus.classList.remove("focus")
            world.focus = null
            on_update()
        }
    }
    for (let i = 1; i < 1476; ++i) {
        let center = hex_center(i)
        define_layout("board_hex", i, [center[0] - 15, center[1] - 17, 45, 45], "stack")
    }
    for (let i = 1; i < data.pieces.length; ++i) {
        let piece = data.pieces[i]
        piece.element = define_piece("unit", i, piece.counter)
    }
    for (let i = 1; i < data.cards.length; ++i) {
        let card = data.cards[i]
        card.element = define_card("card", i, "card_" + card.faction + "_" + card.num)
    }
    define_panel("hand", JP, "jp_hand")
    define_panel("hand", AP, "ap_hand")
}

function push_stack(stk, elt) {
    stk.unshift(elt)
    elt.my_stack = stk
}

function update_hand(side, hand) {
    var c
    if (typeof hand === "number") {
        for (c = 0; c < hand; ++c)
            populate_generic("hand", side, side === P_GERMAN ? "card back german" : "card back french")
    } else {
        for (c of hand)
            if (data.cards[c].type !== "Barrage")
                populate("hand", side, "card", c)
    }
}

function hex_to_int(i) {
    return (Math.floor(i / 100) - 10) * 29 + i % 100
}

function hex_center(i) {
    let column = (Math.floor(i / 29))
    return [67 + column * 42.2, 46 + (i % 29) * 48.5 + (column % 2) * 25]
}

// for (let i = 1; i < 1476; ++i) {
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

function on_update() {
    var z, u

    begin_update()

    console.log(G)
    // console.log(V)
    // console.log(R)
    // G.actions={}
    // G.actions.board_hex = []
    // G.actions.board_hex.push(hex_to_int(piece.start))

    for (let i = 1; i < data.pieces.length; ++i) {
        let piece = data.pieces[i]
        // push_stack(HEXES[i].stack, piece.element)
        // piece.element.classList.remove('hide')
        populate("board_hex", hex_to_int(piece.start), "unit", i)

    }


    for (let i = 1; i < data.cards.length; i++) {
        let card = data.cards[i]
        populate("hand", card.faction === "ap" ? AP : JP, "card", i)
    }

    action_button("roll", "Roll")
    action_button("two_zone_barrage", "Two Zone")

    action_button("pass", "Pass")
    action_button("next", "Next")
    action_button("done", "Done")
    action_button("undo", "Undo")

    end_update()
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

function sub_card(match, p1) {
    var c = p1 | 0
    var cn = (c <= 51) ? "card-tip french" : "card-tip german"
    return `<span class="${cn}" onmouseenter="on_focus_card_tip(${c})" onmouseleave="on_blur_card_tip()">${data.cards[c].name}</span>`
}

function sub_zone(match, p1) {
    var z = p1 | 0
    var name = data.zone_name[z]
    return `<span class="zone-tip" onclick="on_click_zone_tip(${z})" onmouseenter="on_focus_zone_tip(${z})" onmouseleave="on_blur_zone_tip(${z})">${name}</span>`
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
    text = text.replace(/Z(\d+)/g, sub_zone)
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
