/* UNIT ZOOMED TOOLTIP & HQ RANGE DISPLAY TOGGLE */

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
        world.hq = id
        if (id === HQ_CENTRAL_PACIFIC && G.sid === SOUTH_PACIFIC_SCENARIO)
            world.range = [ hex_to_int(5226), 5 ]
        else
            world.range = [ G.location[id], pieces[id].cr ]
        on_update()
    }
}

function blur_unit(id) {
    // hide HQ range
    world.hq = 0
    if (world.range[0]) {
        world.range = [0, 0]
        on_update()
    }
}

/* LOG & PROMT TEXT FORMATTING */

const card_classes = cards.map(c => `card card_${c?.faction ? "ap" : "jp"}_${c?.num}`)
const card_names = cards.map(c => c?.name)

const unit_classes = pieces.map(p => `piece unit ${p?.faction ? "ap" : "jp"} ${p?.counter}`)
const unit_names = pieces.map(p => p?.name)

const hex_names = []
for (let i = 0; i <= TUNNEL_BOX; ++i) {
    if (i === CHINA_BOX) {
        hex_names[i] = "China Box"
    } else if (i > LAST_BOARD_HEX) {
        hex_names[i] = "offboard"
    } else {
        let hex = int_to_hex(i)
        let info = map.find(e => e.id === hex)
        if (info && info.name)
            hex_names[i] = `${info.name} (${hex})`
        else
            hex_names[i] = String(hex)
    }
}

const ICONS = {
    B0: '<span class="xdice B d0"></span>',
    B1: '<span class="xdice B d1"></span>',
    B2: '<span class="xdice B d2"></span>',
    B3: '<span class="xdice B d3"></span>',
    B4: '<span class="xdice B d4"></span>',
    B5: '<span class="xdice B d5"></span>',
    B6: '<span class="xdice B d6"></span>',
    B7: '<span class="xdice B d7"></span>',
    B8: '<span class="xdice B d8"></span>',
    B9: '<span class="xdice B d9"></span>',
    R0: '<span class="xdice R d0"></span>',
    R1: '<span class="xdice R d1"></span>',
    R2: '<span class="xdice R d2"></span>',
    R3: '<span class="xdice R d3"></span>',
    R4: '<span class="xdice R d4"></span>',
    R5: '<span class="xdice R d5"></span>',
    R6: '<span class="xdice R d6"></span>',
    R7: '<span class="xdice R d7"></span>',
    R8: '<span class="xdice R d8"></span>',
    R9: '<span class="xdice R d9"></span>',
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

    text = escape_tip_class(text, /C(\d+)/g, "card-tip", card_classes, card_names)
    text = escape_tip_light(text, /H(\d+)/g, "hex-tip", "action_hex", hex_names)
    text = escape_tip_light(text, /P(\d+)/g, "piece-tip", "unit", unit_names)

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

var SHOW_FULL_LOG = get_preference("full_log", false)

function show_full_log() {
    SHOW_FULL_LOG = !get_preference("full_log", false)
    var len = Number.isInteger(view.log) ? view.log : game_log.length
    update_log(0, len)
}

function on_log(text, i) {
    var total = game_log.length
    if (Number.isInteger(view.log)) {
        total = view.log
    }
    if (!SHOW_FULL_LOG && total > 100 && i === 0) {
        var d = document.createElement("div")
        d.classList.add("full_log")
        var b = document.createElement("button")
        b.onclick = () => show_full_log()
        b.textContent = "Show full log"
        d.append(b)
        return d
    } else if (!SHOW_FULL_LOG && total - i > 100) {
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
        case "$":
            var m = text.substring(1)
            p.classList.add("h3")
            text = m
            break
        case "#":
            var m = text.substring(2)
            p.classList.add("h3")
            var code = text[1]
            var color = null
            if (code === "J") {
                color = "jp"
            } else if (code === "A") {
                color = "ap"
            } else if (code === "I") {
                color = "int"
            }
            if (color) {
                p.classList.add(color)
            }
            text = m
            break
        case "%":
            var m = text.substring(2)
            p.classList.add("h4")
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
        case "Q":
            p.className = "q"
            text = cards[parseInt(text.substring(1))].text
            break
        case ">":
            p.className = "i"
            text = text.substring(1)
            break
    }
    p.innerHTML = escape_text(text)

    return p
}
