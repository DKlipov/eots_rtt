"use strict"

const P_GERMAN = 0

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

function vp_layout_y(vp) {
    if (vp < 0) vp = -vp
    if (vp < 1) vp = 0.5
    if (vp > 37) vp = 37 + (37 - vp)
    if (vp == 37) vp = 36.5
    return 38 + (vp - 1) * 38.2
}

function vp_layout_x(vp) {
    if (vp < 0) vp = -vp
    if (vp < 1) vp = 0.5
    if (vp > 37) vp = 37 + (37 - vp)
    if (vp == 37) vp = 36.5
    return 38 + (vp - 1) * 38.2
}

function on_init() {
    var i

    define_preference_checkbox("volko", false)

    define_board("map", 2244, 1452)

    define_panel("hand", P_GERMAN)

    define_layout_track_v("track-turn", 1, 6, layout.nodes.track_turns, 0)

    for (i = -15; i <= 50; ++i)
        define_layout("track-vp", i, [vp_layout_x(i), vp_layout_y(i), 44, 34])


    define_marker("marker", M_US_ENTRY, ["us", "border"])


    define_space("zone", 79, layout.nodes.g_reserve)


    for (i = 0; i < 60; ++i)
        define_piece("unit", i, "german")
    for (i = 60; i < 120; ++i)
        define_piece("unit", i, "french")

    for (i = 1; i <= 100; ++i) {
        if ((i >= 1 && i <= 22) || (i >= 52 && i <= 68))
            define_card("card", i, ["c" + i, "barrage"])
        else
            define_card("card", i, ["c" + i])
        if (data.cards[i].text)
            register_tooltip("card", i, data.cards[i].name + " \u2013 " + data.cards[i].text)
        else
            register_tooltip("card", i, data.cards[i].name)
    }
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

function on_update() {
    var z, u

    begin_update()

    var volko = get_preference("volko", false)

    populate("track-turn", G.turn, "marker", 5)

    update_keywords("marker", 1, [(G.month & 1) ? "month1" : "month2"])


    populate_generic("zone-markers", 15, "zone-marker french control")

    toggle_keyword("zone", 15, "select", true)

    for (z = 0; z <= 78; ++z) {
        toggle_keyword("zone", z, "select", V.where === z)
    }

    populate_with_list("played", 0, "card", G.played)

    populate_with_list("permanent", P_GERMAN, "card", G.permanent.filter(c => c >= 52))

    update_hand(P_GERMAN, V.hand[P_GERMAN])

    if (V.draw)
        populate_with_list("draw", 0, "card", V.draw)

    // maximum number of rerolls is double barrage with stockpile (10+8+4)
    for (var i = 0; i <= 22; ++i)
        action_button_with_argument("number", i, i)

    action_button("build_trench", "Trench")
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
