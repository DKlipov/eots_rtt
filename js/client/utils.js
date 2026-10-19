/* MISC CLIENT STUFF */

const BR_REGIONS = ["India", "Ceylon", "NIndia", "Burma", "Siam", "Malaya", "Sumatra", "Indochina", "IChina"]
const BR_NATIONS = [-3, nations.AUSTRALIA.id, nations.BURMA.id, nations.MALAYA.id]
const JP_REGIONS = ["JMandates", "Korea", "Manchuria", "China", "Formosa", "Indochina", "Caroline", "Japan", "Marshall"]

const JP_BOUNDARY_HEX = []
const REGIONS_BY_NATION = {}
const HEX_BY_NATION = []

;(function(){

    for (var key of Object.keys(nations)) {
        if (!nations[key].no_full_control && nations[key].regions) {
            for (var reg of nations[key].regions) {
                REGIONS_BY_NATION[reg] = nations[key]
            }
        }
    }

    for (var i = 0; i < map.length; i++) {
        var hex = hex_to_int(map[i].id)
        var region = map[i].region
        var nation = REGIONS_BY_NATION[region]
        if (nation) {
            HEX_BY_NATION[hex] = nation.id
        } else if (JP_REGIONS.includes(region)) {
            HEX_BY_NATION[hex] = -1
        } else if (BR_REGIONS.includes(region)) {
            HEX_BY_NATION[hex] = -3
        } else {
            HEX_BY_NATION[hex] = -2
        }
        if (JP_REGIONS.includes(region)) {
            set_add(JP_BOUNDARY_HEX, hex)
        }
    }
    HEX_BY_NATION[hex_to_int(2709)] = -3

})()

function center_rect([x, y], w, h) {
    return [x - w / 2, y - h / 2, w, h]
}

function hex_in_map(x, y) {
    return x >= map_info.grid_x_offset &&
        y >= map_info.grid_y_offset &&
        x < map_info.grid_x_offset + map_info.ROW_HEX_NB &&
        y < map_info.grid_y_offset + map_info.COLUMN_HEX_NB
}

function sort_unit_stack(a, b) {
    var aw = get_element_weight(a) + (a.thing?.my_id ?? 0)
    var bw = get_element_weight(b) + (b.thing?.my_id ?? 0)
    return aw - bw
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
    var map_layout = LAYOUT.mainmap
    if (BOARD_ID === SOUTH_PACIFIC_SCENARIO)
        map_layout = LAYOUT.southpac
    if (BOARD_ID === BURMA_SCENARIO)
            map_layout = LAYOUT.burma

    if (i === CHINA_BOX) {
        var box = map_layout.box_air_unit_in_china
        return center_rect([box[0] + box[2], box[1] + box[3]], box[2], box[3])
    }
    var row = i % MAIN_BOARD_INFO.COLUMN_HEX_NB
    var column = (Math.floor(i / MAIN_BOARD_INFO.COLUMN_HEX_NB))
    if (BOARD_ID == BURMA_SCENARIO) {
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
    } else if (BOARD_ID === SOUTH_PACIFIC_SCENARIO && i >= OAHU) {
        const box = map_layout.h_5808
        return center_rect([box[0] + box[2]/2, box[1] + box[3]/2], box[2], box[3])
    }
    return [
        (map_info.display_x_offset) + (column - map_info.grid_x_offset) * HEX_X_SIZE,
        (map_info.display_y_offset) + (row - map_info.grid_y_offset) * HEX_Y_SIZE + (column & 1) * 27.625
    ]
}
