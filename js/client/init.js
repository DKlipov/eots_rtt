var BOARD_ID = FULL_CAMPAIGN_SCENARIO
var SID = FULL_CAMPAIGN_SCENARIO
var map_info = MAIN_BOARD_INFO
const ALL_BOARD_HEXES = []

function on_reply(q, response) {
    if (q === "original_control")
        scenario_data().original_control ??= response
    if (q === "combat")
        update_combat_window(response)
    if (q === "check_unit_supply")
        P.check_unit_supply.show_supply(response)
}

// MARKERS

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

function jp_gray_amp() {
    return (G.inter_service[JP] && G.asp[0][0] > 1)
}

function current_pow(G) {
    return array_count(G.capture, h => is_space_controlled(h, AP))
}

const UNIT_MOVEMENT_MARKERS = [
    {
        name: "BARGES_MOVE",
        condition: (u, piece, path) => path & BARGES_MOVE,
        counter: counters.barges_small,
    },
    {
        name: "STRAT_MOVE",
        condition: (u, piece, path) => path & STRAT_MOVE && piece.class !== "air",
        counter: counters.strat_small,
    },
    {
        name: "STRAT_MOVE",
        condition: (u, piece, path) => path & STRAT_MOVE && piece.class === "air",
        counter: counters.strat_air_small,
    },
    {
        name: "AMPH_MOVE",
        condition: (u, piece, path) => path & AMPH_MOVE && piece.class === "ground",
        counter: counters.aa_small,
    },
    {
        condition: (u, piece, path) => piece.b29 && G.b29u & 2 << piece.b29,
        counter: counters.strat_bombing_small,
    },
]

const TRACK_MARKERS = [
    {
        counter: counters.asp_jp,
        tooltip: () => "Japan ASP" + ((G.events[events.BARGES.id] > 0) ? " (Barges)" : ""),
        reduced: () => (G.events[events.BARGES.id] > 0),
        gray: () => jp_gray_amp(),
        value: () => G.asp[0][0],
    },
    {
        counter: counters.asp_jp,
        tooltip: () => "Japan ASP (allowed with ISR)",
        reduced: () => (G.events[events.BARGES.id] > 0),
        value: () => (jp_gray_amp()) ? Math.ceil(G.asp[0][0] / 2) : 0
    },
    {
        counter: counters.asp_ap,
        tooltip: () => "Allies ASP",
        value: () => G.asp[1][0]
    },
    {
        counter: counters.divisions_china,
        tooltip: () => "Japanese Divisions in China",
        value: () => (G.sid === SOUTH_PACIFIC_SCENARIO) ? G.china_divisions : 0//for SP scenario only
    },
    {
        counter: counters.resource_jp,
        tooltip: () => "Japanese Resource Hex Count",
        value: () => array_count(RESOURCE_HEX, h => is_space_controlled(h, JP))
    },
    {
        counter: counters.naval_repl,
        tooltip: () => "Japanese Naval Replacement Point",
        value: () => G.reinforcements[0]
    },
    {
        counter: counters.air_repl,
        tooltip: () => "Japanese Air Replacement Point",
        value: () => G.reinforcements[1]
    },
    {
        counter: counters.drawn_jp,
        tooltip: () => "Japanese Drawn Cards",
        value: () => G.draw_counter[0]
    },
    {
        counter: counters.drawn_ap,
        tooltip: () => "Allies Drawn Cards",
        value: () => G.draw_counter[1]
    },
    {
        counter: counters.pass_jp,
        tooltip: () => "Japanese Passes",
        value: () => G.passes[0]
    },
    {
        counter: counters.pass_ap,
        tooltip: () => "Allies Passes",
        value: () => G.passes[1]
    },
    {
        counter: counters.pow_target,
        tooltip: () => "Allies Progress of War Target",
        value: () => G.pow
    },
    {
        counter: counters.pow,
        tooltip: () => "Allies Progress of War Value",
        always_show: G => G.pow > 0,
        value: () => (G.pow > 0) ? current_pow(G) : 0
    },
    {
        counter: counters.aspu_jp,
        tooltip: () => "Japan ASP Used",
        always_show: G => true,
        value: () => G.asp[0][1]
    },
    {
        counter: counters.aspu_ap,
        tooltip: () => "Allies ASP Used",
        always_show: G => true,
        value: () => G.asp[1][1]
    },
]

const TURN_MARKERS = [
    {
        tooltip: "Scenario Start",
        counter: counters.scenario_start,
        value: G => SCENARIO_LENGTH[G.sid][0]
    },
    {
        tooltip: "Scenario End",
        counter: counters.scenario_end,
        value: G => SCENARIO_LENGTH[G.sid][1]
    },
    {
        tooltip: "Future Offensives Card (JP)",
        counter: counters.future_offensive_jp,
        value: G => G.events[events.FUTURE_OFFENSIVE_JP.id]
    },
    {
        tooltip: "Future Offensives Card (AP)",
        counter: counters.future_offensive_ap,
        value: G => G.events[events.FUTURE_OFFENSIVE_AP.id]
    },
    {
        tooltip: "Defensive Doctrine",
        counter: counters.defensive_doctrine,
        value: G => G.events[events.NEW_OPERATION_PLAN.id]
    },
    {
        tooltip: "Japanese Barges",
        counter: counters.barges,
        value: G => G.events[events.BARGES.id]
    },
    {
        tooltip: "Bridge over the River Kwai",
        counter: counters.kwai_river,
        value: G => G.events[events.KWAI_RIVER_BRIDGE.id]
    },
    {
        tooltip: () => (G.events[events.JP_ESCORTS.id] >> 4 !== 2) ? "Escorts +4" : "Escorts +2",
        counter: counters.escorts2,
        reduced: G => (G.events[events.JP_ESCORTS.id] >> 4 !== 2),
        value: G => G.events[events.JP_ESCORTS.id] % (1 << 4)
    },
    {
        tooltip: "High All Interceptors",
        counter: counters.interceptors_jp,
        value: G => G.events[events.INTERCEPTORS.id]
    },
    {
        tooltip: "Panama Canal Attacked",
        counter: counters.panama_canal,
        value: G => G.events[events.PANAMA_CANAL.id]
    },
    {
        tooltip: "Doolittle",
        counter: counters.doolitle,
        value: G => G.events[events.DOOLITLE.id]
    },
    {
        tooltip: "PT Boats - No Barges",
        counter: counters.pt_boats,
        value: G => G.events[events.PT_BOATS.id]
    },
    {
        tooltip: "-1 PW (Ground)",
        counter: counters.pw_casualties,
        value: G => G.events[events.US_CASUALTIES.id]
    },
    {
        tooltip: "-1 PW (BB)",
        counter: counters.pw_bb,
        value: G => G.events[events.LACK_US_BB.id]
    },
    {
        tooltip: "-1 PW (CV)",
        counter: counters.pw_cv,
        value: G => G.events[events.LACK_US_CV.id]
    },
    {
        tooltip: "-1 PW (Progress of the War)",
        counter: counters.pw_failed_pow,
        value: G => G.events[events.FAILED_POW.id]
    },
    {
        tooltip: "US Sub - No Escorts",
        counter: counters.us_sub,
        value: G => G.events[events.SUBMARINE_DOCTRINE.id]
    },
    {
        tooltip: "Alaska Occupied",
        counter: counters.alaska,
        value: G => G.events[events.ALASKA_OCCUPATION.id]
    },
    {
        tooltip: "Hawaii Occupied",
        counter: counters.hawaii,
        value: G => G.events[events.HAWAII_OCCUPATION.id]
    },
    {
        tooltip: "Strategic Bombing",
        counter: counters.strat_bombing,
        value: G => G.events[events.STRAT_BOMBING_CAMPAIGN.id]
    },
    {
        tooltip: "China Offensive",
        counter: counters.china_offensive,
        value: G => G.events[events.CHINA_OFFENSIVE.id]
    },
    {
        tooltip: () => G.events[events.TOJO.id] ? "Game Turn (Tojo Resigns)" : "Game Turn (PM Tojo)",
        counter: counters.turn_pmt,
        reduced: G => G.events[events.TOJO.id],
        value: G => G.turn
    },
]

// DEFINE WORLD

function on_init(scenario, game_options, static_view) {
    var map_layout = LAYOUT.mainmap

    canvas_init(scenario)

    function define_s_loc(id, rect) {
        define_stack("s-loc", id, rect, {...VERTICAL_STACK_PARAMS, sort: sort_unit_stack})
    }

    init_preference_checkbox("noroad", false)
    init_preference_checkbox("nopath", false)
    init_preference_checkbox("fullcontrol", false)
    init_preference_checkbox("hidezoi", false)

    create_window("window_cards_jp", "Japanese Event Cards", update_window_cards_jp)
    create_window("window_cards_ap", "Allied Event Cards", update_window_cards_ap)
    create_window("window_pw", "Political Status", update_window_pw)
    create_window("window_vp", "Victory Points", update_window_vp)
    create_window("window_eliminated", "Eliminated Units", update_window_eliminated)
    create_window("window_combat", "Combat X")

    define_panel("#jp_hand", "hand", JP)
    define_panel("#ap_hand", "hand", AP)
    define_panel("#active_cards", "hand", 2)

    define_html_thing("#turn_info", "violations", 0)

    SID = SCENARIO_DATA.find(s => s.name === scenario).id//scenario id

    switch (scenario) {
        case "South Pacific": {
            nations.AUSTRALIAN_MANDATES.keys = nations.AUSTRALIAN_MANDATES.ports
            BOARD_ID = SOUTH_PACIFIC_SCENARIO
            map_layout = LAYOUT.southpac
            document.body.classList.add("southpac_map")
            define_board("#map", 1275, 825, [12, 12, 12, 12])
            map_info = SOUTH_PAC_BOARD_INFO

            define_stack_track_h("track", 0, 1, map_layout.track_strat_record_0_1, 0, VERTICAL_STACK_PARAMS)
            define_stack("track", 2, map_layout.track_strat_record_2, VERTICAL_TURN_STACK_PARAMS)

            define_space("action_hex", 1400, center_rect(map_layout.h_5808, 68, 68))
                .tooltip(format_hex_tooltip)

            define_s_loc(1400, center_rect(map_layout.h_5808, 45, 45))

            update_map_size(1275, 825)
            break
        }
        case "Burma: The Forgotten War, 1943-1944": {
            BOARD_ID = BURMA_SCENARIO
            map_layout = LAYOUT.burma
            document.body.classList.add("burma_map")
            define_board("#map", 1275, 825, [12, 12, 12, 12])
            map_info = BURMA_BOARD_INFO

            define_space("action_hex", SINGAPORE, center_rect(map_layout.box_singapore, 68, 68))
                .tooltip(format_hex_tooltip)
            define_s_loc(SINGAPORE, center_rect(map_layout.box_singapore, 45, 45))

            define_thing("road", events.JARHAT_ROAD.id).layout([549, 286, 60, 60], "jarhat control")
            define_thing("road", events.IMPHAL_ROAD.id).layout([550, 330, 60, 60], "imphal control")
            define_thing("road", events.LEDO_ROAD.id).layout([600, 300, 60, 60], "ledo control")
            define_thing("road", events.KWAI_RIVER_BRIDGE.id).layout([528, 501, 50, 95], "kwai control")
            update_map_size(1275, 825)
            break
        }
        default: {
            BOARD_ID = FULL_CAMPAIGN_SCENARIO
            map_layout = LAYOUT.mainmap
            document.body.classList.add("full_map")
            define_board("#map", 2550, 1650, [12, 12, 12, 12])
            map_info = MAIN_BOARD_INFO
            define_thing("road", events.JARHAT_ROAD.id).layout([578, 286, 60, 60], "jarhat control")
            define_thing("road", events.IMPHAL_ROAD.id).layout([579, 330, 60, 60], "imphal control")
            define_thing("road", events.LEDO_ROAD.id).layout([629, 300, 60, 60], "ledo control")
            define_thing("road", events.KWAI_RIVER_BRIDGE.id).layout([557, 501, 50, 95], "kwai control")
            update_map_size(2550, 1650)
        }
    }

    SCENARIO_DATA[SID].original_control = original_control[SCENARIO_DATA[SID].name]

    document.getElementById("vp_check_button").hidden = CAMPAIGN_SCENARIOS.includes(SID)

    document.getElementById("ap_deck_link").href += `&sid=${BOARD_ID}`
    document.getElementById("jp_deck_link").href += `&sid=${BOARD_ID}`

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
            define_thing("zoi_hex", i).layout(center_rect(xy, 62, 62))
            define_space("action_hex", i, center_rect(xy, 68, 68))
                .tooltip(format_hex_tooltip)
            define_s_loc(i, center_rect(xy, 45, 45))

            define_marker("top", i, "white")
        }
    }

    define_stack_track_auto("eliminated", 0, 3, map_layout.box_eliminated, 0, {
        ...VERTICAL_STACK_PARAMS,
        sort: sort_unit_stack
    })
    define_s_loc(AP_REINF, map_layout.box_ap_reinf)
    define_s_loc(JP_REINF, map_layout.box_jp_reinf)
    if (BOARD_ID !== BURMA_SCENARIO) {
        define_stack_track_auto("delayed", 0, BOARD_ID === SOUTH_PACIFIC_SCENARIO ? 1 : 2, map_layout.box_delayed_reinf, 0, {
            ...VERTICAL_STACK_PARAMS,
            sort: sort_unit_stack
        })
    }
    define_stack("s-loc", CHINA_BOX, map_layout.box_air_unit_in_china, {...TRACK_STACK_PARAMS, sort: sort_unit_stack})

    define_space("action_hex", CHINA_BOX, map_layout.box_air_unit_in_china, "china_box")
        .tooltip("China Box")

    // Tracks

    define_layout("track-isr", JP, map_layout.box_isr_jp)
    define_layout("track-isr", AP, map_layout.box_isr_us)
    define_layout_track_auto("track-pw", map_info.pw_a, map_info.pw_b, map_layout.track_political_will, 0)
    define_layout_track_auto("track-wie", map_info.wie_a, map_info.wie_b, map_layout.track_wie, 0)

    define_stack_track_auto("turn", map_info.turn_a, map_info.turn_b, map_layout.track_game_turn, 0, map_info.TURN_STACK_PARAMS)
    define_space_track_auto("turn_box", map_info.turn_a + TURN_BOX, map_info.turn_b + TURN_BOX, map_layout.track_game_turn, 0)
    define_stack_track_auto("track", map_info.track_a, map_info.track_b, map_layout.track_strat_record, 0, map_info.TRACK_STACK_PARAMS)

    if (map_layout.track_india_status !== undefined) {
        define_layout_track_h("track-india", 0, 4, map_layout.track_india_status, 0)
    }
    if (map_layout.track_burma_road !== undefined) {
        define_layout_track_h("track-burma", 0, 2, map_layout.track_burma_road, 0)
    }

    define_layout_track_h("track-china", 5, 0, map_layout.track_chinese_government, 0)

    if (map_layout.track_japanese_divisions_available_china !== undefined) {
        define_layout_track_h("track-divisions", 1, (BOARD_ID == BURMA_SCENARIO ? 9 : 13), map_layout.track_japanese_divisions_available_china, 0)
    }

    // Battle and Landing markers
    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    for (i = 0; i < 35; i++) {
        var battle = define_thing("battle", i).keyword("marker conflict battle top").animate()
        battle.element.innerText = ALPHABET[i]
        battle.element.battle_index = i
        battle.element.addEventListener("mousedown", evt => {
            if (evt.button === 0 && (world.focus === (evt.target.parentElement.thing) ||
                evt.target.parentElement.thing.element.childElementCount <= 1)) {
                send_query("combat", evt.target.battle_index)
                evt.stopImmediatePropagation()
            }
        })
        battle.stackable()
        var landing = define_thing("landing", i).keyword("marker conflict landing top").animate()
        landing.element.innerText = ALPHABET[i]
        landing.element.landing_index = i
        landing.element.addEventListener("mousedown", evt => {
            if (evt.button === 0 && (world.focus === (evt.target.parentElement.thing) ||
                evt.target.parentElement.thing.element.childElementCount <= 1)) {
                send_query("combat", evt.target.battle_index)
                evt.stopImmediatePropagation()
            }
        })
        landing.stackable()
    }

    // Units
    for (let i = 1; i < pieces.length; ++i) {
        let piece = pieces[i]
        piece.element = define_piece("unit", i, (piece.faction ? "ap " : "jp ") + piece.counter)
            .tip_magic(focus_unit)
            .tooltip(format_unit_tooltip)
    }

    // Cards
    for (let i = 1; i < cards.length; ++i) {
        let card = cards[i]
        define_card("card", i, `${card.faction ? "ap" : "jp"} c${card.num}`)
            .tooltip(card.name)
            .animate()
    }

    define_card("fo-card", JP, "jp c0").tooltip("Future Offensives Card").animate()
    define_card("fo-card", AP, "ap c0").tooltip("Future Offensives Card").animate()

    define_marker("fo-marker", JP, counters.future_offensive_jp).tooltip("Future Offensives Card")
    define_marker("fo-marker", AP, counters.future_offensive_ap).tooltip("Future Offensives Card")
    define_marker("fo-marker", JP + 2, counters.future_offensive_inactive).tooltip("Future Offensives Card")
    define_marker("fo-marker", AP + 2, counters.future_offensive_inactive).tooltip("Future Offensives Card")

    for (let key in nations) {
        var nation = nations[key]
        if (nation.counter) {
            define_marker("nation-marker-turn", nation.id, nation.counter)
                .tooltip(nation.name + " Surrender")
            define_marker("nation-marker-map", nation.id, nation.counter)
                .tooltip(nation.name + " Surrender")
        }
    }

    define_marker("marker-isr", JP, counters.rivalry_jp)
        .tooltip(() => G.inter_service[JP] ? "Japan Inter-Service Rivalry" : "Japan Strategic Agreement")
    define_marker("marker-isr", AP, counters.rivalry_ap)
        .tooltip(() => G.inter_service[AP] ? "Allies Inter-Service Rivalry" : "Allies Strategic Agreement")

    define_marker("marker-pw", 0, counters.pw)
        .tooltip(() => "U.S. Political Will: " + G.political_will)

    define_marker("marker-wie", 0, counters.wie)
        .tooltip(() => `War in Europe (${get_wie_level()}): ${G.wie - 3}`)

    define_marker("marker-india", 0, counters.india_status)
        .tooltip(() => G.surrender[nations.INDIA.id] ? "India Surrender" : "India - " + nations.INDIA.statuses[G.events[events.INDIA_STATUS.id]])

    var burma = [
        "Burma Road - Open",
        "Burma Road - Closed (Hump)",
        "Burma Road - Closed",
    ]

    define_marker("marker-burma", 0, counters.burma_road)
        .tooltip(() => burma[G.burma_road])

    define_marker("marker-divisions", 0, counters.divisions_china)
        .tooltip(() => `Japanese Divisions in China: ${G.china_divisions}`)

    define_marker("marker-china", 0, counters.china)
        .tooltip(() => "China - " + nations.CHINA.statuses[G.events[events.CHINA_STATUS.id]])

    TRACK_MARKERS.forEach(function (m, i) {
        define_marker("track-marker", i, m.counter).tooltip(() => m.tooltip() + ": " + m.value())
    })

    TURN_MARKERS.forEach(function (m, i) {
        define_marker("turn-marker", i, m.counter).tooltip(m.tooltip)
    })

    for (var event of Object.values(events))
        if (event.counter)
            define_marker("event-marker", event.id, event.counter)
                .tooltip(event.name)
}
