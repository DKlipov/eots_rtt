/** import common/data_pieces.js*/
/** import common/data_cards.js*/
/** import common/data_map.js*/

var counters = {
    oos: "oos top",
    control_jp: "small_markers_white unit_ix_2 control",
    capture_jp: "small_markers_white unit_ix_2 gray control",
    control_us: "small_markers_white unit_ix_2 reduced control",
    control_br: "small_markers_white unit_ix_1 control",
    capture_us: "small_markers_white unit_ix_2 reduced gray control",
    control_sov: "small_markers_white unit_ix_1 reduced control",
    capture_sov: "small_markers_white unit_ix_1 reduced gray control",
    no_garrison: "no_garrison control marker",
    organic_small: "organic_small",
    aa_small: "aa_small",
    strat_small: "strat_small",
    strat_air_small: "strat_air_small",
    barges_small: "barges_small",
    oos_small: "oos_small",
    pow: "small_markers_dkblue unit_ix_2",
    pow_target: "small_markers_dkblue unit_ix_4",
    strat_bombing: "strat_air_small",
    agreement_jp: "small_markers_yellow unit_ix_2 reduced",
    agreement_ap: "small_markers_green unit_ix_3 reduced",
    rivalry_ap: "small_markers_green unit_ix_3",
    rivalry_jp: "small_markers_yellow unit_ix_2",
    asp_jp: "big_markers_yellow big unit_ix_3",
    asp_b_jp: "big_markers_yellow big unit_ix_3 reduced",
    aspu_jp: "small_markers_yellow unit_ix_8",
    asp_ap: "big_markers_dkblue big unit_ix_1",
    asp_ap_1: "big_markers_dkblue big unit_ix_1 reduced",
    aspu_ap: "small_markers_dkblue unit_ix_1",
    aspu_ap_1: "small_markers_dkblue unit_ix_1 reduced",
    wie: "small_markers_black unit_ix_6",
    pw: "small_markers_black unit_ix_2",
    turn_pmt: "small_markers_black unit_ix_1",
    turn_tr: "small_markers_black unit_ix_1 reduced",
    resource_jp: "small_markers_yellow unit_ix_7",
    resource_jp_1: "small_markers_yellow unit_ix_7 reduced",
    pass_jp: "small_markers_yellow unit_ix_1",
    pass_ap: "small_markers_dkblue unit_ix_3",
    india_status: "small_markers_brown unit_ix_1",
    india_status_surrender: "small_markers_brown unit_ix_1 reduced",
    alaska: "small_markers_yellow unit_ix_5",
    hawaii: "small_markers_yellow unit_ix_4",
    future_offensive_ap: "big_markers_white big unit_ix_5",
    future_offensive_jp: "big_markers_white big unit_ix_4",
    future_offensive_inactive: "big_markers_white big unit_ix_4 gray",
    kwai_river: "big_markers_blue big unit_ix_1",
    road_jarhat: "small_markers_brown unit_ix_2",
    road_ledo: "small_markers_brown unit_ix_3",
    road_imphal: "small_markers_brown unit_ix_4",
    china: "small_markers_red unit_ix_1",
    burma_road: "small_markers_black unit_ix_5",
    burma_road_hump: "small_markers_black unit_ix_5 reduced",
    china_offensive: "small_markers_red unit_ix_2",
    divisions_china: "small_markers_yellow unit_ix_6",
    air_repl: "small_markers_yellow unit_ix_12",
    naval_repl: "small_markers_yellow unit_ix_11",
    drawn_ap: "small_markers_black unit_ix_4",
    drawn_jp: "small_markers_black unit_ix_8",
    tokyo_express: "big_markers_white big unit_ix_1",
    defensive_doctrine: "big_markers_yellow big unit_ix_1",
    escorts2: "small_markers_yellow unit_ix_3",
    escorts4: "small_markers_yellow unit_ix_3 reduced",
    panama_canal: "big_markers_blue big unit_ix_4",
    interceptors_jp: "big_markers_yellow big unit_ix_2",
    barges: "big_markers_blue big unit_ix_2 reduced",
    doolitle: "big_markers_blue big unit_ix_3",
    pt_boats: "big_markers_blue big unit_ix_2",
    us_sub: "big_markers_blue big unit_ix_5",
    australia_surrender: "big_markers_white big unit_ix_3",
    burma_surrender: "big_markers_white big unit_ix_10",
    dei_surrender: "big_markers_white big unit_ix_9",
    malaya_surrender: "big_markers_white big unit_ix_8",
    phillipines_surrender: "big_markers_white big unit_ix_7",
    mandates_surrender: "big am_surrender",
    guinea_surrender: "big ng_surrender",
    marshall_surrender: "big mi_surrender",
    scenario_start: "scenario_start",
    scenario_end: "scenario_end",
}

var nations = {
    PHILIPPINES: {
        id: 0,
        name: "Philippines",
        pw: 1,
        counter: counters.phillipines_surrender,
        counter_hex: 2712,
        regions: ["Philippines"],
        keys: [2813, 2915],
    },
    MALAYA: {
        id: 1,
        name: "Malaya",
        pw: 1,
        counter: counters.malaya_surrender,
        counter_hex: 2114,
        regions: ["Malaya"],
        keys: [2014, 2015]
    },
    DEI: {
        id: 2,
        name: "Dutch East India",
        pw: 1,
        counter: counters.dei_surrender,
        counter_hex: 2218,
        regions: ["DEI", "Java", "Sumatra", "Borneo", "Celebes"],
        keys: [2019, 1813, 1916, 2017, 2415, 2616, 2517, 2220]
    },
    BURMA: {
        id: 3,
        name: "Burma",
        pw: 1,
        counter: counters.burma_surrender,
        counter_hex: 1907,
        regions: ["Burma"],
        keys: [2008, 2106, 2206, 2305]
    },
    INDIA: {
        id: 4,
        name: "India",
        regions: ["India"],
        statuses: ["Stable", "Unrest", "Strikes", "Unstable", "Revolts"],
        pw: 2,
        retreat_hexes: [1005, 1307, 1308, 1208],
        keys: [1905, 2005, 2104, 2105, 2205],
        no_full_control: true,
    },
    AUSTRALIA: {
        id: 5,
        name: "Australia",
        pw: 2,
        counter: counters.australia_surrender,
        counter_hex: 3828,
        regions: ["Australia"],
        keys: [3727, 3626, 3624, 3226, 3023, 2825, 2525, 2426]
    },
    AUSTRALIAN_MANDATES: {
        id: 6,
        name: "Australian Mandates",
        counter: counters.mandates_surrender,
        counter_hex: 3920,
        regions: ["AMandates"],
        keys: [4021, 4423],
        ports: [4423, 4222, 4021, 4020, 3820]
    },
    NEW_GUINEA: {
        id: 7,
        name: "New Guinea",
        counter: counters.guinea_surrender,
        counter_hex: 3521,
        regions: ["Guinea"],
        keys: [3219, 3319, 3520, 3720, 3822, 3823, 4024]
    },
    MARSHALL: {
        id: 8,
        name: "Marshall Islands",
        counter_hex: 4515,
        counter: counters.marshall_surrender,
        regions: ["Marshall"],
        keys: [4415, 4715]
    },
    HAWAII: {
        id: 9,
        name: "Hawaii",
        keys: [5708, 5808, 5908],
        no_full_control: true,
    },
    ALASKA: {
        id: 10,
        name: "Alaska",
        keys: [4600, 4700, 4800, 5000, 5100],
        no_full_control: true,
    },
    JAPAN: {
        id: 11,
        name: "Japanese Empire",
        keys: [3407, 3506, 3507, 3607, 3706, 3705, 3606],
        no_full_control: true,
    },
    CHINA: {
        id: 12,
        pw: 2,
        statuses: ["Stable Front", "Unstable Front", "Major Breakthrough", "Threat to Chunking", "Chunking Falls", "Government Collapsed"],
        name: "China",
        no_full_control: true,
    },
}

var events = {
    ALLIED_NATIONS_SURRENDERS: {
        id: 1,
        cause: "allied nations surrendered [16.41]",
        pw: -2,
        nations: [nations.AUSTRALIA, nations.BURMA, nations.DEI, nations.MALAYA, nations.PHILIPPINES]
            .map(n => n.id)
    },
    ALASKA_OCCUPATION: {
        id: 2,
        pw: -1,
        counter: counters.alaska,
        name: "Alaska",
        cause: "Alaska occupation",
        turns_to_control: 3,
        keys: [4600, 4700, 4800, 5000, 5100]
    },
    HAWAII_OCCUPATION: {
        id: 3,
        pw: -1,
        counter: counters.hawaii,
        name: "Hawaii",
        cause: "Hawaii occupation",
        turns_to_control: 2,
        keys: [5708, 5808, 5908, 5108]
    },
    JAPAN_LACK_OF_RESOURCES: {
        id: 4,
        cause: "Japan control less than 3 resource",
        pw: 3,
    },
    STRAT_BOMBING: {
        id: 5,
        pw: 1,
        cause: "successful strategic bombing",
        once_per_turn: true,
    },
    STRAT_BOMBING_CAMPAIGN: {
        id: 6,
        cause: "strategic bombing campaign started",
    },
    US_CASUALTIES: {
        id: 7,
        cause: "US Casualties [16.45]",
        pw: -1,
        once_per_turn: true,
    },
    FUTURE_OFFENSIVE_JP: {
        id: 8,
    },
    FUTURE_OFFENSIVE_AP: {
        id: 9,
    },
    KWAI_RIVER_BRIDGE: {
        id: 10,
        road: true,
        name: "Kwai river",
        counter: counters.kwai_river,
        keys: [2109, 2108],
    },
    JARHAT_ROAD: {
        id: 11,
        road: true,
        name: "Jarhat",
        counter: counters.road_jarhat,
        keys: [2104],
    },
    IMPHAL_ROAD: {
        id: 12,
        road: true,
        name: "Imphal",
        counter: counters.road_imphal,
        keys: [2105],
    },
    LEDO_ROAD: {
        id: 13,
        road: true,
        name: "Ledo",
        counter: counters.road_ledo,
        keys: [2205],
    },
    CHINA_OFFENSIVE: {
        id: 14,
    },
    HUMP: {
        id: 15,
    },
    AUSTRALIA_SURRENDER: {
        id: 16,
    },
    INDEPENDENCE_CAMPAIGN: {
        id: 17,
    },
    TOKYO_EXPRESS: {
        id: 18,
        once_per_turn: true,
    },
    NEW_OPERATION_PLAN: {
        id: 19,
    },
    JP_ESCORTS: {
        id: 20,
    },
    PT_BOATS: {
        id: 21,
    },
    SUBMARINE_DOCTRINE: {
        id: 22,
    },
    BARGES: {
        id: 23,
    },
    PANAMA_CANAL: {
        id: 24,
    },
    INTERCEPTORS: {
        id: 25,
    },
    TOJO: {
        id: 26,
    },
    DOOLITLE: {
        id: 27,
    },
    JAPAN_TRACE_RESOURCES: {
        id: 28,
        name: "Japanese Empire surrenders by lack of resources",
        keys: [3307, 3704, 3407, 3506, 3507, 3607, 3706, 3705]
    },
    MARSHALL_CAPTURED: {
        id: 29,
    },
    ALASKA_OCCUPATION_HEXES: {
        id: 30
    },
}

const ROAD_EVENTS = Object.keys(events).filter(k => events[k].road).map(k => {
    var event = events[k]
    event.keys = event.keys.map(h => hex_to_int(h))
    return event
})


function is_event_active(event) {
    return G.events[event.id]
}