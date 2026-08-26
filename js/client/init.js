function clear_paths() {
    CANVAS_CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
}


function sort_unit_stack(a, focus) {
    var map = []
    var index = 0;
    for (var e of a) {
        // if (e.classList.contains("top") && (!e.thing || e.thing.my_action !== "unit") && !focus) {
        // continue
        // }
        map_set(map, get_element_weight(e) + index, e)
        index++
    }
    if (map.length === 0) {
        return a
    }
    return map.filter((a, index) => index % 2 === 1)
}

function define_s_loc(id, rect) {
    define_stack("s-loc", id,
        rect,
        ...VERTICAL_STACK_PARAMS,
        sort_unit_stack
    )
}

const HEX_X_SIZE = 48.0
const HEX_Y_SIZE = 55.25

const TURN_STACK_PARAMS = [
    // stack parameters:
    5, 0, // closed offset
    48, 0, // open offset (major axis)
    0, 35, // open offset (minor axis)
    1, // threshold to auto-open
    8, // wrap limit
    18, 0, 3
]
const TRACK_STACK_PARAMS = [
    // stack parameters:
    10, 0, // closed offset
    48, 0, // open offset (major axis)
    0, 35, // open offset (minor axis)
    2, // threshold to auto-open
    8, // wrap limit
    18, 0, 4
]
const VERTICAL_STACK_PARAMS = [
    // stack parameters:
    -2, -3, // closed offset
    0, -50, // open offset (major axis)
    50, 0, // open offset (minor axis)
    1, // threshold to auto-open
    8, // wrap limit
    -6, -9, 4
]

const VERTICAL_TURN_STACK_PARAMS = [
    // stack parameters:
    0, -3, // closed offset
    0, -50, // open offset (major axis)
    50, 0, // open offset (minor axis)
    1, // threshold to auto-open
    8, // wrap limit
    0, -6, 3
]

const MANCHURIA_1 = hex_to_int(3302)
const MANCHURIA_2 = hex_to_int(3303)

const SUPPLY_TYPES = {
    to_port: {color: "green"},
    from_port: {color: "red"},
    to_hq: {color: "blue"},
    to_source: {color: "yellow"},
}

//status markers
const JP_AGREEMENT = 0
const AP_AGREEMENT = 1

const CANVAS = document.getElementById("canvas")
const CANVAS_CTX = document.getElementById("canvas").getContext("2d")

const BR_REGIONS = ["India", "Ceylon", "NIndia", "Burma", "Siam", "Malaya", "Sumatra", "Indochina", "IChina"]
const JP_REGIONS = ["JMandates", "Korea", "Manchuria", "China", "Formosa", "Indochina", "Caroline", "Japan", "Marshall"]
const JP_BOUNDARY_HEX = []

const REGIONS_BY_NATION = {}
const HEX_BY_NATION = []
const BR_NATIONS = [-3, nations.AUSTRALIA.id, nations.BURMA.id, nations.MALAYA.id]


for (var key of Object.keys(counters)) {
    counters[key] = "marker " + counters[key]
}

for (var key of Object.keys(nations)) {
    if (nations[key].counter) {
        nations[key].counter = "marker " + nations[key].counter
    }
    if (!nations[key].no_full_control && nations[key].regions) {
        for (var reg of nations[key].regions) {
            REGIONS_BY_NATION[reg] = nations[key]
        }
    }
}

for (var key of Object.keys(events)) {
    if (events[key].counter) {
        events[key].counter = "marker " + events[key].counter
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

const CARD_ACTIONS = ["card"]

const SCENARIO_LENGTH = [
    [0, 0],
    [0, 0],
    [2, 4],
    [2, 7],
    [2, 10],
    [2, 0],
    [5, 7],
    [5, 10],
    [5, 0],
    [8, 10],
    [0, 0],
]

const US_MARINE_UNIT = find_piece("army_ap_1_m")
const US_BB_UNIT = find_piece("washington")
const US_CV_UNIT = find_piece("essex")

const UNIT_MOVEMENT_MARKERS = [
    {
        "name": "BARGES_MOVE",
        condition: (u, piece, path) => path & BARGES_MOVE,
        counter: counters.barges_small,
    },
    {
        "name": "STRAT_MOVE",
        condition: (u, piece, path) => path & STRAT_MOVE && piece.class !== "air",
        counter: counters.strat_small,
    },
    {
        "name": "STRAT_MOVE",
        condition: (u, piece, path) => path & STRAT_MOVE && piece.class === "air",
        counter: counters.strat_air_small,
    },
    {
        "name": "AMPH_MOVE",
        condition: (u, piece, path) => path & AMPH_MOVE && piece.class === "ground",
        counter: counters.aa_small,
    },
    {
        condition: (u, piece, path) => piece.b29 && G.b29u & 2 << piece.b29,
        counter: counters.strat_bombing,
    },

]

function jp_gray_amp() {
    return (G.inter_service[JP] && G.asp[0][0] > 1)
}

const TRACK_MARKERS = [
    {
        counter: () => (G.events[events.BARGES.id] > 0 ? counters.asp_b_jp : counters.asp_jp) + (jp_gray_amp() ? " gray" : ""),
        value: G => G.asp[0][0]
    },
    {
        counter: () => (G.events[events.BARGES.id] > 0 ? counters.asp_b_jp : counters.asp_jp),
        value: G => (jp_gray_amp()) ? Math.ceil(G.asp[0][0] / 2) : 0
    },
    {
        counter: counters.asp_ap,
        alt_counter: counters.asp_ap_1,
        value: G => G.asp[1][0]
    },
    {
        counter: counters.divisions_china,
        always_show: G => 0,
        value: G => (G.sid === SOUTH_PACIFIC_SCENARIO) ? G.china_divisions : 0
    },
    {
        counter: counters.resource_jp,
        alt_counter: counters.resource_jp_1,
        value: G => RESOURCE_HEX.filter(h => is_space_controlled(h, JP)).length
    },
    {
        counter: counters.naval_repl,
        value: G => G.reinforcements[0]
    },
    {
        counter: counters.air_repl,
        value: G => G.reinforcements[1]
    },
    {
        counter: counters.drawn_jp,
        value: G => G.draw_counter[0]
    },
    {
        counter: counters.drawn_ap,
        value: G => G.draw_counter[1]
    },
    {
        counter: counters.pass_jp,
        value: G => G.passes[0]
    },
    {
        counter: counters.pass_ap,
        value: G => G.passes[1]
    },
    {
        counter: counters.pow_target,
        value: G => G.pow
    },
    {
        counter: counters.pow,
        always_show: G => G.pow > 0,
        value: G => (G.pow > 0) ? current_pow(G) : 0
    },
    {
        counter: counters.aspu_jp,
        always_show: true,
        value: G => G.asp[0][1]
    },
    {
        counter: counters.aspu_ap,
        alt_counter: counters.aspu_ap_1,
        always_show: true,
        value: G => G.asp[1][1]
    },
]

const TURN_MARKERS = [
    {
        counter: counters.scenario_start,
        value: G => SCENARIO_LENGTH[G.sid][0]
    },
    {
        counter: counters.scenario_end,
        value: G => SCENARIO_LENGTH[G.sid][1]
    },
    {
        counter: counters.future_offensive_jp,
        value: G => G.events[events.FUTURE_OFFENSIVE_JP.id]
    },
    {
        counter: counters.future_offensive_ap,
        value: G => G.events[events.FUTURE_OFFENSIVE_AP.id]
    },
    {
        counter: counters.defensive_doctrine,
        value: G => G.events[events.NEW_OPERATION_PLAN.id]
    },
    {
        counter: counters.barges,
        value: G => G.events[events.BARGES.id]
    },
    {
        counter: counters.kwai_river,
        value: G => G.events[events.KWAI_RIVER_BRIDGE.id]
    },
    {
        counter: () => (G.events[events.JP_ESCORTS.id] >> 4 === 2) ? counters.escorts2 : counters.escorts4,
        value: G => G.events[events.JP_ESCORTS.id] % (1 << 4)
    },
    {
        counter: counters.interceptors_jp,
        value: G => G.events[events.INTERCEPTORS.id]
    },
    {
        counter: counters.panama_canal,
        value: G => G.events[events.PANAMA_CANAL.id]
    },
    {
        counter: counters.doolitle,
        value: G => G.events[events.DOOLITLE.id]
    },
    {
        counter: counters.pt_boats,
        value: G => G.events[events.PT_BOATS.id]
    },
    {
        counter: counters.us_sub,
        value: G => G.events[events.SUBMARINE_DOCTRINE.id]
    },
    {
        counter: counters.alaska,
        value: G => G.events[events.ALASKA_OCCUPATION.id]
    },
    {
        counter: counters.hawaii,
        value: G => G.events[events.HAWAII_OCCUPATION.id]
    },
    {
        counter: counters.strat_bombing,
        value: G => G.events[events.STRAT_BOMBING_CAMPAIGN.id]
    },
    {
        counter: counters.china_offensive,
        value: G => G.events[events.CHINA_OFFENSIVE.id]
    },
    {
        counter: G => G.events[events.TOJO.id] ? counters.turn_tr : counters.turn_pmt,
        value: G => G.turn
    },
]

function current_pow(G) {
    return G.capture.filter(h => is_space_controlled(h, AP)).length
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
        let x = Math.floor(i / MAIN_BOARD_INFO.COLUMN_HEX_NB)
        let y = i % MAIN_BOARD_INFO.COLUMN_HEX_NB


        if (x == 15 && y > 9) {
            return false;
        } else if (x == 16 && y > 9) {
            return false;
        }
        return hex_in_map(x, y) &&
            i != 92 // Remove unplayable hex in india not catched by the standard data check (1305)
    }
}

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
        let x = Math.floor(i / MAIN_BOARD_INFO.COLUMN_HEX_NB)
        let y = i % MAIN_BOARD_INFO.COLUMN_HEX_NB

        if (SP_BORDER[x] && y < SP_BORDER[x]) {
            return false
        }

        if (i === 1188) {
            return false
        } else if (x == 24 && y == 16) {
            return true;
        } else if ((x % 2 == 0) && y == 16) {
            return false;
        }
        return hex_in_map(x, y)
    }
}


let ALL_BOARD_HEXES = []

let SID = FULL_CAMPAIGN_SCENARIO;
let map_layout = layout.mainmap;
let map_info = MAIN_BOARD_INFO;


var SP_BORDER = []
for (var i = 0; i < sp_map.length; i++) {
    var hex = hex_to_int(sp_map[i].id)
    let x = Math.floor(hex / 29)
    let y = hex % 29
    if (sp_map[i].top) {
        SP_BORDER[x] = y
    }
}

function set_map_size(w, h) {
    update_map_size(w, h)
}

function on_init(scenario, game_options, static_view) {
    init_canvas(scenario)

    init_preference_checkbox("noroad", false)
    init_preference_checkbox("nopath", false)
    init_preference_checkbox("fullcontrol", false)
    init_preference_checkbox("hidezoi", false)

    // world.tip.addEventListener("touchstart", function () {
    //     on_blur_tip()
    // })
    let map_elem = document.getElementById("mapwrap")
    switch (scenario) {
        case "South Pacific": {
            nations.AUSTRALIAN_MANDATES.keys = nations.AUSTRALIAN_MANDATES.ports
            SID = SOUTH_PACIFIC_SCENARIO
            map_layout = layout.southpac;
            map_elem.classList.add("southpac");
            define_board("#map", 1275, 825, [12, 12, 12, 12])
            map_info = SOUTH_PAC_BOARD_INFO

            define_track("track", 0, 1, map_layout.track_strat_record_0_1, define_stack, "h", 0,
                ...VERTICAL_STACK_PARAMS
            )
            define_stack("track", 2, map_layout.track_strat_record_2,
                ...VERTICAL_TURN_STACK_PARAMS
            )

            define_s_loc(1400, center_rect(map_layout.h_5808, 45, 45))
            define_space("action_hex", 1400, center_rect(map_layout.h_5808, 68, 68))
            set_map_size(1275, 825)
            break;
        }
        case  "Burma: The Forgotten War, 1943-1944": {
            SID = BURMA_SCENARIO
            map_layout = layout.burma;
            map_elem.classList.add("burma");
            define_board("#map", 1275, 825, [12, 12, 12, 12])
            map_info = BURMA_BOARD_INFO

            define_s_loc(SINGAPORE, center_rect(map_layout.box_singapore, 45, 45))
            define_space("action_hex", SINGAPORE, center_rect(map_layout.box_singapore, 68, 68))
            define_thing("road", events.JARHAT_ROAD.id).layout([549, 286, 60, 60], "road_jarhat hide marker control")
            define_thing("road", events.IMPHAL_ROAD.id).layout([550, 330, 60, 60], "road_imphal hide marker control")
            define_thing("road", events.LEDO_ROAD.id).layout([600, 300, 60, 60], "road_ledo hide marker control")
            define_thing("road", events.KWAI_RIVER_BRIDGE.id).layout([528, 501, 50, 95], "road_kwai hide marker control")
            set_map_size(1275, 825)
            break;
        }
        default: {
            SID = FULL_CAMPAIGN_SCENARIO
            map_layout = layout.mainmap;
            map_elem.classList.add("main");
            define_board("#map", 2550, 1650, [12, 12, 12, 12])
            map_info = MAIN_BOARD_INFO
            define_thing("road", events.JARHAT_ROAD.id).layout([578, 286, 60, 60], "road_jarhat hide marker control")
            define_thing("road", events.IMPHAL_ROAD.id).layout([579, 330, 60, 60], "road_imphal hide marker control")
            define_thing("road", events.LEDO_ROAD.id).layout([629, 300, 60, 60], "road_ledo hide marker control")
            define_thing("road", events.KWAI_RIVER_BRIDGE.id).layout([557, 501, 50, 95], "road_kwai hide marker control")
            set_map_size(2550, 1650)
        }
    }
    var href = document.getElementsByClassName("deck_href")
    for (var i = 0; i < href.length; i++) {
        href[i].href += `&sid=${SID}`
    }

    // used hexes
    var used_hex = []
    for (var i = 0; i < 60; ++i) {
        used_hex[i] = {min: 100, max: -100}
        if (i > 27 && i < 45) {
            used_hex[i].max = 28 - (i & 1)
        }
    }

    for (var i = 0; i < map.length; i++) {
        var hex = hex_to_int(map[i].id)
        let x = Math.floor(hex / MAIN_BOARD_INFO.COLUMN_HEX_NB)
        let y = hex % MAIN_BOARD_INFO.COLUMN_HEX_NB
        used_hex[x].min = Math.min(used_hex[x].min, y)
        used_hex[x].max = Math.max(used_hex[x].max, y)
    }

    for (var i = 1; i < MAIN_BOARD_INFO.LAST_BOARD_HEX; ++i) {
        var x = Math.floor(i / MAIN_BOARD_INFO.COLUMN_HEX_NB)
        let y = i % MAIN_BOARD_INFO.COLUMN_HEX_NB

        if (y < used_hex[x].min) continue
        if (y > used_hex[x].max) continue

        if (map_info.hex_check(i)) {
            ALL_BOARD_HEXES.push(i)
            let xy = hex_center(i)
            define_s_loc(i, center_rect(xy, 45, 45))
            define_thing("zoi_hex", i).layout(center_rect(xy, 62, 62))
            define_space("action_hex", i, center_rect(xy, 68, 68))
        }
    }

    define_s_loc(ELIMINATED_BOX, map_layout.box_eliminated)
    define_s_loc(AP_REINF, map_layout.box_ap_reinf)
    define_s_loc(JP_REINF, map_layout.box_jp_reinf)
    if (SID !== BURMA_SCENARIO) {
        define_s_loc(DELAYED_BOX, map_layout.box_delayed_reinf)
    }
    define_stack("s-loc", CHINA_BOX,
        map_layout.box_air_unit_in_china,
        ...TRACK_STACK_PARAMS,
        sort_unit_stack,
        0.22,
    )

    define_space("action_hex", CHINA_BOX, map_layout.box_air_unit_in_china, "china_box")

    define_layout("status", JP_AGREEMENT, map_layout.box_isr_jp)
    define_layout("status", AP_AGREEMENT, map_layout.box_isr_us)
    define_track("pw", map_info.pw_a, map_info.pw_b, map_layout.track_political_will, define_layout, "auto", 0)
    define_track("wie", map_info.wie_a, map_info.wie_b, map_layout.track_wie, define_layout, "auto", 0)

    define_track("turn", map_info.turn_a, map_info.turn_b, map_layout.track_game_turn, define_stack, "auto", 0,
        ...map_info.TURN_STACK_PARAMS
    )
    define_track("turn_box", map_info.turn_a + TURN_BOX, map_info.turn_b + TURN_BOX, map_layout.track_game_turn, define_space, "auto", 0,)
    define_track("track", map_info.track_a, map_info.track_b, map_layout.track_strat_record, define_stack, "auto", 0,
        ...map_info.TRACK_STACK_PARAMS
    )

    if (map_layout.track_india_status !== undefined) {
        define_layout_track_h("india", 0, 4, map_layout.track_india_status, 0)
    }
    if (map_layout.track_burma_road !== undefined) {
        define_layout_track_h("burma", 0, 2, map_layout.track_burma_road, 0)
    }

    define_layout_track_h("china", 5, 0, map_layout.track_chinese_government, 0)

    if (map_layout.track_japanese_divisions_available_china !== undefined) {
        define_layout_track_h("divisions", 1, (SID == BURMA_SCENARIO ? 9 : 13), map_layout.track_japanese_divisions_available_china, 0)
    }
    for (i = 0; i < 35; i++) {
        var battle = define_marker("battle", i, "conflict battle top")
        battle.element.innerText = String.fromCharCode(65 + i)
        battle.element.index = i
        battle.element.addEventListener("mousedown", evt => {
            if (world.focus !== (evt.target.parentElement.thing)) {
                send_query({name: "battle_info", index: evt.target.index})
            }
        })
        var landing = define_marker("landing", i, "conflict landing top")
        landing.element.innerText = String.fromCharCode(65 + i)
        landing.element.index = i
        landing.element.addEventListener("mousedown", evt => {
            if (world.focus !== (evt.target.parentElement.thing)) {
                send_query({name: "battle_info", index: evt.target.index})
            }
        })
    }
    define_marker("divisions", 0, counters.divisions_china)
    for (let i = 1; i < pieces.length; ++i) {
        let piece = pieces[i]
        piece.element = define_piece("unit", i, (piece.faction ? "ap " : "jp ") + piece.counter).tooltip_image(unit_tooltip_image)
    }
    for (let i = 1; i < cards.length; ++i) {
        let card = cards[i]
        card.element = define_card("card", i, `card_${card.faction ? "ap" : "jp"}_${card.num}`).tooltip_image(on_focus_card_tip)
        card.element.card = i
    }
    define_panel("#jp_hand", "hand", JP)
    define_panel("#ap_hand", "hand", AP)
    define_panel("#active_cards", "hand", 2)
}

function init_canvas(scenario) {
    let sizeX, sizeY;
    switch (scenario) {
        case "South Pacific":
        case  "Burma: The Forgotten War, 1943-1944": {
            sizeX = 1275
            sizeY = 825
            break;
        }
            ;
        default: {
            sizeX = 2550
            sizeY = 1650
        }
    }

    CANVAS.style.width = sizeX + "px"
    CANVAS.style.height = sizeY + "px"

    var scale = window.devicePixelRatio
    CANVAS.width = sizeX * scale
    CANVAS.height = sizeY * scale

    CANVAS_CTX.scale(scale, scale)
}