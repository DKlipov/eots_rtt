const LAYOUT = {
    "mainmap" : {
        "box_delayed_reinf": [2363,1503,160,79],
        "box_air_unit_in_china": [852,407,121,75],
        "box_isr_jp": [986,132,45,64],
        "box_isr_us": [1048,132,45,64],
        "box_eliminated": [100,1280,200,50],
        "box_ap_reinf": [2298,544,45,45],
        "box_jp_reinf": [1386,461,45,45],
        "track_chinese_government": [603,130,281,63],
        "track_japanese_divisions_available_china": [671,42,608,55],
        "track_india_status": [396,51,250,55],
        "track_burma_road": [397,141,179,52],
        "track_game_turn": [54,665,65,561],
        "track_political_will": [157,712,64,517],
        "track_wie": [259,707,64,517],
        "track_strat_record": [346,1158,92,468],
    },
    "southpac" : {
        "box_delayed_reinf": [1140,710,116,95],
        "h_5808": [1065,690,45,45],
        "box_air_unit_in_china": [19,602,98,60],
        "box_isr_jp": [127,619,43,43],
        "box_isr_us": [179,619,42,42],
        "track_chinese_government": [519,755,267,50],
        "track_game_turn": [1078,569,180,55],
        "track_political_will": [19,66,41,282],
        "track_wie": [795,756,337,49],
        "track_strat_record": [602,691,313,47],
        "track_strat_record_0_1": [335,687,177,118],
        "track_strat_record_2": [513,691,88,47],
        "box_eliminated": [50,680,200,50],
        "box_ap_reinf": [823,583,45,45],
        "box_jp_reinf": [58,103,45,45],
    },
    "burma" : {
        "box_air_unit_in_china": [757,300,121,75],
        "box_singapore": [70,754,45,45],
        "box_isr_jp": [383,218,45,64],
        "box_isr_us": [435,216,45,64],
        "track_chinese_government": [367,129,281,63],
        "track_japanese_divisions_available_china": [632,44,421,52],
        "track_india_status": [367,42,250,65],
        "track_burma_road": [1078,43,169,55],
        "track_game_turn": [29,249,186,52],
        "track_political_will": [731,732,517,64],
        "track_wie": [871,590,377,45],
        "track_strat_record": [779,672,467,53],
        "box_eliminated": [306,29,200,50],
        "label_singapore": [496,781,64,17],
        "box_ap_reinf": [823,583,45,45],
        "box_jp_reinf": [34,34,45,45],
    },
}

const HEX_X_SIZE = 48.0
const HEX_Y_SIZE = 55.25

const TURN_STACK_PARAMS = {
    // stack parameters:
    dx: 5, dy: 0, // closed offset
    major_dx: 50, major_dy: 0, // open offset (major axis)
    minor_dx: 0, minor_dy: 35, // open offset (minor axis)
    threshold: 1, // threshold to auto-open
    wrap: 8, // wrap limit
    small_dx: 18, small_dy: 0, small_threshold: 3,
    shadow: 8
}

const TRACK_STACK_PARAMS = {
    // stack parameters:
    dx: 10, dy: 0, // closed offset
    major_dx: 50, major_dy: 0, // open offset (major axis)
    minor_dx: 0, minor_dy: 35, // open offset (minor axis)
    threshold: 2, // threshold to auto-open
    wrap: 8, // wrap limit
    small_dx: 18, small_dy: 0, small_threshold: 4,
    shadow: 8
}

const VERTICAL_STACK_PARAMS = {
    // stack parameters:
    dx: -3, dy: -3, // closed offset
    major_dx: 0, major_dy: -54, // open offset (major axis)
    minor_dx: 54, minor_dy: 0, // open offset (minor axis)
    threshold: 1, // threshold to auto-open
    wrap: 8, // wrap limit
    small_dx: -6, small_dy: -9, small_threshold: 4,
    shadow: 8
}

const VERTICAL_TURN_STACK_PARAMS = {
    // stack parameters:
    dx: 0, dy: -3, // closed offset
    major_dx: 0, major_dy: -54, // open offset (major axis)
    minor_dx: 54, minor_dy: 0, // open offset (minor axis)
    threshold: 1, // threshold to auto-open
    wrap: 8, // wrap limit
    small_dx: 0, small_dy: -6, small_threshold: 3,
    shadow: 8
}

const MAIN_BOARD_INFO = {
    "LAST_BOARD_HEX": 1478,
    "COLUMN_HEX_NB": 29,
    "ROW_HEX_NB": 50,
    "grid_x_offset": 0,
    "grid_y_offset": 0,
    "display_x_offset": 76.375,
    "display_y_offset": 53.375,
    "turn_a": 12,
    "turn_b": 1,
    "track_a": 9,
    "track_b": 0,
    "wie_a": 0,
    "wie_b": 10,
    "pw_a": 10,
    "pw_b": 0,
    "TURN_STACK_PARAMS": TURN_STACK_PARAMS,
    "TRACK_STACK_PARAMS": TRACK_STACK_PARAMS,
    "hex_check": (i) => {
        return i != 472 && //Remove the hex exclusive to the burma scenario
            i != 92 // Remove unplayable hex in india not catched by the standard data check (1305)
    }
}

const BURMA_BOARD_INFO = {
    "LAST_BOARD_HEX": 2609,
    "COLUMN_HEX_NB": 13,
    "ROW_HEX_NB": 17,
    "grid_x_offset": 0,
    "grid_y_offset": 0,
    "display_x_offset": 48.375,
    "display_y_offset": 53.375,
    "turn_a": 6,
    "turn_b": 9,
    "track_a": 0,
    "track_b": 9,
    "wie_a": 7,
    "wie_b": 0,
    "pw_a": 10,
    "pw_b": 0,
    "TURN_STACK_PARAMS": VERTICAL_TURN_STACK_PARAMS,
    "TRACK_STACK_PARAMS": VERTICAL_TURN_STACK_PARAMS,
    "hex_check": (i) => {
        var x = Math.floor(i / MAIN_BOARD_INFO.COLUMN_HEX_NB)
        var y = i % MAIN_BOARD_INFO.COLUMN_HEX_NB
        if (x == 15 && y > 9) {
            return false
        } else if (x == 16 && y > 9) {
            return false
        }
        return hex_in_map(x, y) &&
            i != 92 // Remove unplayable hex in india not catched by the standard data check (1305)
    }
}

const SOUTH_PAC_BORDER = []
;(function(){
    for (var i = 0; i < sp_map.length; i++) {
        var hex = hex_to_int(sp_map[i].id)
        let x = Math.floor(hex / 29)
        let y = hex % 29
        if (sp_map[i].top) {
            SOUTH_PAC_BORDER[x] = y
        }
    }
})()

const SOUTH_PAC_BOARD_INFO = {
    "LAST_BOARD_HEX": 5027,
    "COLUMN_HEX_NB": 13,
    "ROW_HEX_NB": 21,
    "grid_x_offset": 20,
    "grid_y_offset": 16,
    "display_x_offset": 89.375,
    "display_y_offset": 9.125,
    "turn_a": 3,
    "turn_b": 6,
    "track_a": 3,
    "track_b": 9,
    "wie_a": 7,
    "wie_b": 0,
    "pw_a": 5,
    "pw_b": 0,
    "TURN_STACK_PARAMS": VERTICAL_TURN_STACK_PARAMS,
    "TRACK_STACK_PARAMS": VERTICAL_TURN_STACK_PARAMS,
    "hex_check": (i) => {
        if (int_to_hex(i) === 4818 || int_to_hex(i) === 4918) {
            return true
        }
        var x = Math.floor(i / MAIN_BOARD_INFO.COLUMN_HEX_NB)
        var y = i % MAIN_BOARD_INFO.COLUMN_HEX_NB
        if (SOUTH_PAC_BORDER[x] && y < SOUTH_PAC_BORDER[x]) {
            return false
        }
        if (i === 1188) {
            return false
        } else if (x == 24 && y == 16) {
            return true
        } else if ((x % 2 == 0) && y == 16) {
            return false
        }
        return hex_in_map(x, y)
    }
}
