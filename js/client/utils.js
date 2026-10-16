/* MISC CLIENT STUFF */

const digit_superscript = [
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

    if (!set_has(G.reduced, u))
        tip += ` ${p.cf}`
    else
        tip += ` (${p.rcf}`
    tip += `-${p.lf}`
    if (p.br)
        tip += `-${p.br}`
    if (p.ebr)
        tip += " " + digit_superscript[p.ebr]
    if (!set_has(G.reduced, u))
        tip += ""
    else
        tip += ")"

    tip += ` (${p.name})`

    return tip
}

const terrain_name = [
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
        if (info.terrain) props.push(terrain_name[info.terrain])
        if (props.length > 0) tip += " - " + props.join(", ")
    }
    return tip
}

function center_rect([x, y], w, h) {
    return [x - w / 2, y - h / 2, w, h]
}

function hex_in_map(x, y) {
    return x >= map_info.grid_x_offset &&
        y >= map_info.grid_y_offset &&
        x < map_info.grid_x_offset + map_info.ROW_HEX_NB &&
        y < map_info.grid_y_offset + map_info.COLUMN_HEX_NB
}

function get_element_weight(e) {
    var is_marker = !e.thing || e.thing.my_action !== "unit"
    if (is_marker)
        return e.classList.contains("top") ? 64000 : 0
    var value = 0
    var unit = e.thing.my_id
    var piece = pieces[unit]
    if (piece.garrison) {
        return 0
    }
    if (piece.faction === G.offensive.attacker) {
        value += 32000
    }
    if (piece.faction === AP) {
        value += 16000
    }
    if (is_action("unit", unit) || set_has(G.active_stack, unit)) {
        value += 4000
    }
    if (piece.class === "naval") {
        value += 1000
    } else if (piece.class === "ground") {
        value += 7000
    } else if (piece.class === "hq") {
        value += 8000
    } else if (piece.class === "air") {
        value += 9000
    }
    // if (set_has(G.offensive.active_units[piece.faction], unit)) {
    //     value += 512
    // }
    if (set_has(G.reduced, unit)) {
        value += 256
    }
    if (piece.service === "army") {
        value += 128
    } else if (piece.service !== "navy") {
        value += 64
    }
    return value
}

function hex_center(i) {
    if (i === CHINA_BOX) {
        var box = map_layout.box_air_unit_in_china
        return center_rect([box[0] + box[2], box[1] + box[3]], box[2], box[3])
    }
    var row = i % MAIN_BOARD_INFO.COLUMN_HEX_NB
    var column = (Math.floor(i / MAIN_BOARD_INFO.COLUMN_HEX_NB))
    if (SID == BURMA_SCENARIO) {
        if (i == SINGAPORE) {
            const box = map_layout.label_singapore
            return center_rect([box[0] + box[2], box[1] + box[3]], box[2], box[3])
        }
        if (i > TUNNEL_BOX) {
            // display TUNNEL_BOX directly to the left of the blue singapore label
            const box = map_layout.label_singapore
            var sing_left_coord = center_rect([box[0] + box[2], box[1] + box[3]], box[2], box[3])
            sing_left_coord[0] -= 47
            return sing_left_coord
        }
    } else if (SID === SOUTH_PACIFIC_SCENARIO && i >= OAHU) {
        const box = map_layout.h_5808
        return center_rect([box[0] + box[2]/2, box[1] + box[3]/2], box[2], box[3])
    }
    return [
        (map_info.display_x_offset) + (column - map_info.grid_x_offset) * HEX_X_SIZE,
        (map_info.display_y_offset) + (row - map_info.grid_y_offset) * HEX_Y_SIZE + (column & 1) * 27.625
    ]
}
