const ICONS = {
    B0: '<span class="dice B d0"></span>',
    B1: '<span class="dice B d1"></span>',
    B2: '<span class="dice B d2"></span>',
    B3: '<span class="dice B d3"></span>',
    B4: '<span class="dice B d4"></span>',
    B5: '<span class="dice B d5"></span>',
    B6: '<span class="dice B d6"></span>',
    B7: '<span class="dice B d7"></span>',
    B8: '<span class="dice B d8"></span>',
    B9: '<span class="dice B d9"></span>',
    R0: '<span class="dice R d0"></span>',
    R1: '<span class="dice R d1"></span>',
    R2: '<span class="dice R d2"></span>',
    R3: '<span class="dice R d3"></span>',
    R4: '<span class="dice R d4"></span>',
    R5: '<span class="dice R d5"></span>',
    R6: '<span class="dice R d6"></span>',
    R7: '<span class="dice R d7"></span>',
    R8: '<span class="dice R d8"></span>',
    R9: '<span class="dice R d9"></span>',
    W0: '<span class="die white d0"></span>',
    W1: '<span class="die white d1"></span>',
    W2: '<span class="die white d2"></span>',
    W3: '<span class="die white d3"></span>',
    W4: '<span class="die white d4"></span>',
    W5: '<span class="die white d5"></span>',
    W6: '<span class="die white d6"></span>',
    // R0: '<span class="die red d0"></span>',
    // R1: '<span class="die red d1"></span>',
    // R2: '<span class="die red d2"></span>',
    // R3: '<span class="die red d3"></span>',
    // R4: '<span class="die red d4"></span>',
    // R5: '<span class="die red d5"></span>',
    // R6: '<span class="die red d6"></span>',
}

function escape_text(text) {
    text = String(text)
    text = text.replace(/[BRW]\d/g, (m) => ICONS[m] ?? m)
    text = text.replace(/\^(.*?)\^/g, escaped_list)
    text = text.replace(/C(\d+)/g, sub_card)
    text = text.replace(/P(\d+)/g, sub_piece)
    text = text.replace(/H(\d+)/g, sub_hex)
    return text
}

function on_prompt(text) {
    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].prompt()
        return escape_text(LOCAL_STATE.prompt)
    } else {
        return escape_text(text)
    }
}

function on_log(text) {
    if (!text) {
        return document.createElement("span")
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

function format_card_info(c) {
    let text = "C" + c
    return escape_text(text)
}

function sub_card(match, p1) {
    const c = p1 | 0
    const cn = "card-tip"
    return `<span class="${cn}" onmouseenter="on_focus_card_tip(${c})" onclick="on_focus_card_tip(${c})" onmouseleave="on_blur_tip()">${cards[c].name}</span>`
}


function get_piece_elem(p) {
    return pieces[p].element.element
}


function sub_piece(match, p1) {
    const piece_id = p1 | 0
    const name = pieces[piece_id].name
    return `<span class="piece-tip" onclick="on_click_piece_tip(${piece_id})" onmouseenter="on_focus_piece_tip(${piece_id})" onmouseleave="on_blur_piece_tip(${piece_id})">${name}</span>`
}

function on_click_piece_tip(z) {
    scroll_into_view(get_piece_elem(z))
}

function on_focus_piece_tip(z) {
    get_piece_elem(z).classList.toggle("tip", true)
    on_focus_unit_tip(z)
}

function on_blur_piece_tip(z) {
    get_piece_elem(z).classList.toggle("tip", false)
    on_blur_tip()
}

function get_hex_elem(h) {
    //perhaps should cache this somewhere ?
    return lookup_thing("s-loc", h)
}

function get_hex_name(h) {
    const hex = int_to_hex(h)
    const hex_id = map.findIndex((element) => element.id === hex)
    if (h === CHINA_BOX) {
        return "China Box"
    } else if (h > LAST_BOARD_HEX) {
        return "offboard"
    } else if (hex_id != -1) {
        const hex_data = map[hex_id]
        if (hex_data.name) {
            return `${hex_data.name} (${hex})`
        }
    }
    return `${hex}`
}

function expand_list(parent) {
    parent.children[0].hidden = true
    parent.children[1].hidden = false
    event.stopPropagation()
}

function escaped_list(match, p1) {
    var ind = p1.indexOf("|")
    var header = escape_text(p1.substring(0, ind))
    const text = escape_text(p1.substring(ind + 1))
    var array = text.split(", ").length
    var id = "list" + world.list_id++
    if (array <= 3) {
        return `<span>${text}</span>`
    } else {
        return `<span id="${id}"><span class="list-tip" onclick="expand_list(${id})" onmouseenter="on_focus_list(${id})" onmouseleave="on_blur_list(${id})">&lt;${header}&gt;</span><span hidden>${text}</span></span>`
    }

}

function on_focus_list(parent) {
    for (let el of parent.children[1].children) {
        el.onmouseenter();
    }
    on_blur_tip() //prevent unit tooltip from showing
}

function on_blur_list(parent) {
    for (let el of parent.children[1].children) {
        el.onmouseleave();
    }
}

function sub_hex(match, p1) {
    const hex_id = p1 | 0
    const name = get_hex_name(hex_id)
    if (hex_id > LAST_BOARD_HEX && hex_id !== CHINA_BOX) {
        return "offboard"
    }
    return `<span class="hex-tip" onclick="on_click_hex_tip(${hex_id})" onmouseenter="on_focus_hex_tip(${hex_id})" onmouseleave="on_blur_hex_tip(${hex_id})">${name}</span>`
}


function on_focus_hex_tip(z) {
    lookup_thing("action_hex", z).element.classList.toggle("tip", true)
}

function on_click_hex_tip(z) {
    scroll_into_view(get_hex_elem(z).element)
}

function on_blur_hex_tip(z) {
    lookup_thing("action_hex", z).element.classList.toggle("tip", false)
    get_hex_elem(z).element.classList.toggle("tip", false)
}

/* TOOLTIP ON FOCUS */

function unit_tooltip_image(a, onoff) {
    if (onoff) {
        on_focus_unit_tip(a)
    } else {
        on_blur_tip()
    }
}

function on_focus_unit_tip(a) {
    world.tip.hidden = false//is_mobile()
    const piece = pieces[a]
    // Show BOTH sides of the marker
    world.tip.innerHTML = `<div class="unit-tip piece ${piece.counter}"></div>`
    if (piece.class !== "hq" && (!piece.start_reduced || !piece.notreplaceable)) {
        world.tip.innerHTML += `<div class="unit-tip piece ${piece.counter} reduced"></div>`
    }
    world.tip.classList = "zoomed"
    var prev = world.range[0]
    if (piece.class === "hq" && G.location[a] < LAST_BOARD_HEX) {
        world.range = [G.location[a], pieces[a].cr]
        if (a === HQ_CENTRAL_PACIFIC && G.sid === SOUTH_PACIFIC_SCENARIO) {
            world.range = [hex_to_int(5226), 5]
        }
    } else {
        world.range = [0, 0]
    }
    if (prev !== world.range[0]) {
        on_update()
    }
}

function on_blur_tip() {
    world.tip.hidden = true
    world.tip.innerHTML = ""
    world.tip.classList = ''
    if (world.range[0]) {
        world.range = [0, 0]
        on_update()
    }
}

function on_focus_card_tip(c) {
    world.tip.hidden = false//is_mobile()
    world.tip.innerHTML = ""
    const card = cards[c]
    world.tip.classList = `card card_${card.faction ? "ap" : "jp"}_${card.num}`
}