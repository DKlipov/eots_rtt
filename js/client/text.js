/* UNIT TEXT TOOLTIP */

const DIGIT_SUPERSCRIPT = [
    "\u2070",
    "\u2071",
    "\xb2",
    "\xb3",
    "\u2074",
    "\u2075",
    "\u2076",
    "\u2077",
    "\u2078",
    "\u2079",
]

function format_unit_tooltip(u) {
    var p = pieces[u]
    var tip = ""

    switch (p.class) {
    case "hq":
        return `HQ ${p.cr} [${p.cm}] (${p.name.replace(" HQ", "")})`
    case "ground":
        if (p.size === 4) tip += "XXXX"
        else if (p.size === 3) tip += "XXX"
        else if (p.size === 1) tip += "X"
        else tip += "Ground"
        break
    case "air":
        tip += "Air"
        break
    case "naval":
        tip += p.type.toUpperCase()
        break
    }
    tip += ` ${p.cf}`
    if (p.rcf!==p.cf)
        tip += `(${p.rcf})`
    tip += `-${p.lf}`
    if (p.br)
        tip += `-${p.br}`
    if (p.ebr)
        tip += " " + DIGIT_SUPERSCRIPT[p.ebr]

    tip += ` (${p.name})`

    return tip
}

/* HEX TOOLTIP */

const TERRAIN_NAME = [
    "ocean",
    "open",
    "jungle",
    "mixed",
    "mountain",
    "atoll",
]

function format_hex_tooltip(h) {
    var hex = int_to_hex(h)
    var tip = hex + ""
    var info = map.find(e => e.id === hex)
    if (info) {
        if (info.name) tip += " " + info.name
        if (info.region) tip += " (" + info.region + ")"
        var props = []
        if (info.city === CITY) props.push("city")
        if (info.city === JAPANESE_CITY) props.push("Japanese city")
        if (info.city === CHINESE_CITY) props.push("Chinese city")
        if (info.airfield) props.push("airfield")
        if (info.port) props.push("port")
        if (info.island) props.push("island")
        if (info.resource) props.push("resource")
        if (info.terrain) props.push(TERRAIN_NAME[info.terrain])
        if (props.length > 0) tip += " - " + props.join(", ")
    }
    return tip
}

/* UNIT ZOOMED TOOLTIP & HQ RANGE DISPLAY TOGGLE */

var focus_hq = 0
var focus_hq_range = [0, 0]

function focus_unit(id) {
    const piece = pieces[id]

    // Show BOTH sides of the marker
    var html = `<div class="unit-tip-list"><div class="piece unit ${piece.counter}"></div>`
    if (piece.class !== "hq" && (!piece.start_reduced || !piece.notreplaceable))
        html += `<div class="piece unit ${piece.counter} reduced"></div>`
    html += "</div>"
    world.tip.className = "unit-tip"
    world.tip.innerHTML = html

    // show HQ range
    if (piece.class === "hq" && G.location[id] < LAST_BOARD_HEX) {
        focus_hq = id
        if (id === HQ_CENTRAL_PACIFIC && G.sid === SOUTH_PACIFIC_SCENARIO)
            focus_hq_range = [ hex_to_int(5226), 5 ]
        else
            focus_hq_range = [ G.location[id], pieces[id].cr ]
        on_update()
    }
}

function blur_unit(id) {
    // hide HQ range
    focus_hq = 0
    if (focus_hq_range[0]) {
        focus_hq_range = [0, 0]
        on_update()
    }
}

/* LOG & PROMT TEXT FORMATTING */

const CARD_CLASSES = cards.map(c => `card ${c?.faction ? "ap" : "jp"} c${c?.num}`)
const CARD_NAMES = cards.map(c => c?.name)

const UNIT_NAMES = pieces.map(p => p?.name)

const HEX_NAMES = []
;(function(){
    for (let i = 0; i <= TUNNEL_BOX; ++i) {
        if (i === CHINA_BOX) {
            HEX_NAMES[i] = "China Box"
        } else if (i > LAST_BOARD_HEX) {
            HEX_NAMES[i] = "offboard"
        } else {
            let hex = int_to_hex(i)
            let info = map.find(e => e.id === hex)
            if (info && info.name)
                HEX_NAMES[i] = `${info.name} (${hex})`
            else
                HEX_NAMES[i] = String(hex)
        }
    }
})()

const ICONS = {
    B0: '<span class="icon xdice B d0"></span>',
    B1: '<span class="icon xdice B d1"></span>',
    B2: '<span class="icon xdice B d2"></span>',
    B3: '<span class="icon xdice B d3"></span>',
    B4: '<span class="icon xdice B d4"></span>',
    B5: '<span class="icon xdice B d5"></span>',
    B6: '<span class="icon xdice B d6"></span>',
    B7: '<span class="icon xdice B d7"></span>',
    B8: '<span class="icon xdice B d8"></span>',
    B9: '<span class="icon xdice B d9"></span>',
    R0: '<span class="icon xdice R d0"></span>',
    R1: '<span class="icon xdice R d1"></span>',
    R2: '<span class="icon xdice R d2"></span>',
    R3: '<span class="icon xdice R d3"></span>',
    R4: '<span class="icon xdice R d4"></span>',
    R5: '<span class="icon xdice R d5"></span>',
    R6: '<span class="icon xdice R d6"></span>',
    R7: '<span class="icon xdice R d7"></span>',
    R8: '<span class="icon xdice R d8"></span>',
    R9: '<span class="icon xdice R d9"></span>',
    W0: '<span class="dice white d0"></span>',
    W1: '<span class="dice white d1"></span>',
    W2: '<span class="dice white d2"></span>',
    W3: '<span class="dice white d3"></span>',
    W4: '<span class="dice white d4"></span>',
    W5: '<span class="dice white d5"></span>',
    W6: '<span class="dice white d6"></span>',
}

function escape_text(text) {
    text = text.replace(/\^(.*?)\|(.*?)\^/g, escape_list)

    text = escape_icon(text, /\b[BRW]\d\b/g, ICONS)

    text = escape_tip_class(text, /C(\d+)/g, "tip", CARD_CLASSES, CARD_NAMES)
    text = escape_tip_light(text, /H(\d+)/g, "tip", "action_hex", HEX_NAMES)
    text = escape_tip_light(text, /P(\d+)/g, "tip", "unit", UNIT_NAMES)

    text = text.replace(/\b1 passes/g, "1 pass")
    text = text.replace(/\b1 cards/g, "1 card")
    text = text.replace(/\b1 hexes/g, "1 hex")
    text = text.replace(/\b1 units/g, "1 unit")

    return text
}

function escape_list(match, head, body) {
    if (body.split(",").length <= 3)
        return body
    return `<span class="expand-list" onclick="expand_list()">${head}</span><span hidden>${body}</span></span>`
}

function expand_list() {
    event.currentTarget.hidden = true
    event.currentTarget.nextSibling.hidden = false
    event.stopPropagation()
}

function on_prompt(text) {
    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].prompt()
        return escape_text(LOCAL_STATE.prompt)
    } else {
        return escape_text(text)
    }
}

// FIXME: icky log shortening hacks...

var shorten_log_start = 0

function show_full_log() {
    shorten_log_start = 0
    update_log(0, game_log.length)
}

function on_init_log(log) {
    var turns = []
    for (var i = 0; i < log.length; ++i) {
        if (log[i][0] === "!" || log[i][0] === "@" || log[i] === "#AAP Action" || log[i] === "#JJP Action")
            turns.push(i)
    }
    if (turns.length >= 8)
        shorten_log_start = turns[turns.length-4]
}

function show_full_log_if_needed() {
    var current_log_length = document.getElementById("log").children.length
    if (current_log_length < shorten_log_start) {
        console.log("Expanded log during snapshot review")
        shorten_log_start = 0
        update_log(0, current_log_length)
    }
}

function on_log(text, i) {
    var total = game_log.length
    if (Number.isInteger(view.log)) {
        total = view.log
    }

    if (i < shorten_log_start) {
        if (i === 0) {
            var d = document.createElement("div")
            d.classList.add("full_log")
            var b = document.createElement("button")
            b.onclick = () => show_full_log()
            b.textContent = "Show full log"
            d.append(b)
            return d
        }
        var empty = document.createElement("div")
        empty.hidden = true
        return empty
    }

    var p = document.createElement("div")

    switch (text[0]) {
        case "!":
            var m = text.substring(1)
            p.classList.add("h1")
            text = m
            break
        case "@":
            var m = text.substring(1)
            p.classList.add("h2")
            text = m
            break
        case "#":
            var m = text.substring(2)
            var code = text[1]
            if (code === "J") {
                p.classList.add("h3")
                p.classList.add("jp")
            } else if (code === "A") {
                p.classList.add("h3")
                p.classList.add("ap")
            } else if (code === "I") {
                p.classList.add("h4")
                p.classList.add("int")
            }
            text = m
            break
        case "%":
            var m = text.substring(2)
            p.classList.add("h5")
            p.classList.add("group")
            p.classList.add(text[1] === "J" ? "jp" : "ap")
            text = m
            break
        case "&":
            var m = text.substring(2)
            p.classList.add("group")
            p.classList.add(text[1] === "J" ? "jp" : "ap")
            text = m
            break
        case ">":
            p.className = "i"
            text = text.substring(1)
            break
    }
    p.innerHTML = escape_text(text)

    return p
}
