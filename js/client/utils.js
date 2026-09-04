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
    var marker = !e.thing || e.thing.my_action !== "unit"
    if (marker && e.classList.contains("top")) {
        return 64000;
    } else if (marker) {
        return 0;
    }
    var value = 0;
    var unit = e.thing.my_id
    var piece = pieces[unit]
    if (piece.garrison) {
        return 0;
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
        value += 1000;
    } else if (piece.class === "ground") {
        value += 7000;
    } else if (piece.class === "hq") {
        value += 8000;
    } else if (piece.class === "air") {
        value += 9000;
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
    return value;
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
            sing_left_coord[0] -= 47;
            return sing_left_coord;
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