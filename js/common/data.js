/** import common/data_pieces.js*/
/** import common/data_cards.js*/
/** import common/data_map.js*/

const counters = {
    control_jp: "white marker small_markers_white unit_ix_2 control",
    capture_jp: "white marker small_markers_white unit_ix_2 gray control",
    control_us: "white marker small_markers_white unit_ix_2 reduced control",
    control_br: "white marker small_markers_white unit_ix_1 control",
    capture_us: "white marker small_markers_white unit_ix_2 reduced gray control",
    control_sov: "white marker small_markers_white unit_ix_1 reduced control",
    capture_sov: "white marker small_markers_white unit_ix_1 reduced gray control",
    pow: "dkblue marker small_markers_dkblue unit_ix_2",
    pow_target: "dkblue marker small_markers_dkblue unit_ix_4",
    strat_bombing: "black marker small_markers_black unit_ix_3",
    agreement_jp: "yellow marker small_markers_yellow unit_ix_2 reduced",
    agreement_ap: "green marker small_markers_green unit_ix_3 reduced",
    rivalry_ap: "green marker small_markers_green unit_ix_3",
    rivalry_jp: "yellow marker small_markers_yellow unit_ix_2",
    asp_jp: "yellow marker big_markers_yellow big unit_ix_3",
    asp_b_jp: "yellow marker big_markers_yellow big unit_ix_3 reduced",
    aspu_jp: "yellow marker small_markers_yellow unit_ix_8",
    asp_ap: "dkblue marker big_markers_dkblue big unit_ix_1",
    asp_ap_1: "dkblue marker big_markers_dkblue big unit_ix_1 reduced",
    aspu_ap: "dkblue marker small_markers_dkblue unit_ix_1",
    aspu_ap_1: "dkblue marker small_markers_dkblue unit_ix_1 reduced",
    wie: "black marker small_markers_black unit_ix_6",
    pw: "black marker small_markers_black unit_ix_2",
    turn_pmt: "black marker small_markers_black unit_ix_1",
    turn_tr: "black marker small_markers_black unit_ix_1 reduced",
    resource_jp: "yellow marker small_markers_yellow unit_ix_7",
    resource_jp_1: "yellow marker small_markers_yellow unit_ix_7 reduced",
    pass_jp: "yellow marker small_markers_yellow unit_ix_1",
    pass_ap: "dkblue marker small_markers_dkblue unit_ix_3",
    india_status: "brown marker small_markers_brown unit_ix_1",
    india_status_surrender: "brown marker small_markers_brown unit_ix_1 reduced",
    alaska: "yellow marker small_markers_yellow unit_ix_5",
    hawaii: "yellow marker small_markers_yellow unit_ix_4",
    future_offensive_ap: "white marker big_markers_white big unit_ix_5",
    future_offensive_jp: "white marker big_markers_white big unit_ix_4",
    future_offensive_inactive: "white marker big_markers_white big unit_ix_4 gray",
    kwai_river: "blue marker big_markers_blue big unit_ix_1",
    road_jarhat: "brown marker small_markers_brown unit_ix_2",
    road_ledo: "brown marker small_markers_brown unit_ix_3",
    road_imphal: "brown marker small_markers_brown unit_ix_4",
    china: "red marker small_markers_red unit_ix_1",
    burma_road: "brown marker small_markers_black unit_ix_5", // NOTE: brown!
    burma_road_hump: "black marker small_markers_black unit_ix_5 reduced",
    china_offensive: "red marker small_markers_red unit_ix_2",
    divisions_china: "yellow marker small_markers_yellow unit_ix_6",
    air_repl: "yellow marker small_markers_yellow unit_ix_12",
    naval_repl: "yellow marker small_markers_yellow unit_ix_11",
    drawn_ap: "black marker small_markers_black unit_ix_4",
    drawn_jp: "black marker small_markers_black unit_ix_8",
    tokyo_express: "white marker big_markers_white big unit_ix_1",
    defensive_doctrine: "yellow marker big_markers_yellow big unit_ix_1",
    escorts2: "yellow marker small_markers_yellow unit_ix_3",
    escorts4: "yellow marker small_markers_yellow unit_ix_3 reduced",
    panama_canal: "blue marker big_markers_blue big unit_ix_4",
    interceptors_jp: "yellow marker big_markers_yellow big unit_ix_2",
    barges: "blue marker big_markers_blue big unit_ix_2 reduced",
    doolitle: "blue marker big_markers_blue big unit_ix_3",
    pt_boats: "blue marker big_markers_blue big unit_ix_2",
    us_sub: "blue marker big_markers_blue big unit_ix_5",
    australia_surrender: "white marker big_markers_white big unit_ix_3",
    china_surrender: "white marker big_markers_white big unit_ix_2",
    india_surrender: "white marker big_markers_white big unit_ix_11",
    burma_surrender: "white marker big_markers_white big unit_ix_10",
    dei_surrender: "white marker big_markers_white big unit_ix_9",
    malaya_surrender: "white marker big_markers_white big unit_ix_8",
    phillipines_surrender: "white marker big_markers_white big unit_ix_7",

    oos: "white marker oos top",
    isolated: "white marker isolated top",
    oos_small: "white marker oos_small",
    no_garrison: "yellow marker no_garrison control marker",
    organic_small: "red marker organic_small",
    aa_small: "dkblue marker aa_small",
    strat_small: "black marker strat_small",
    strat_air_small: "black marker strat_air_small",
    strat_bombing_small: "black marker strat_air_small",
    barges_small: "blue marker barges_small",

    mandates_surrender: "white marker big am_surrender",
    guinea_surrender: "white marker big ng_surrender",
    marshall_surrender: "white marker big mi_surrender",

    scenario_start: "black marker scenario_start",
    scenario_end: "black marker scenario_end",
    pw_casualties: "black marker pw_casualties",
    pw_bb: "black marker pw_bb",
    pw_cv: "black marker pw_cv",
    pw_failed_pow: "black marker pw_failed_pow",
}

const nations = {
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
        name: "Dutch East Indies",
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
        counter: counters.india_surrender,
        counter_hex: 1606,
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
        counter_hex: 4320,
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
        counter: counters.china_surrender,
        counter_hex: KUNMING,
        statuses: ["Stable Front", "Unstable Front", "Major Breakthrough", "Threat to Chunking", "Chunking Falls", "Government Collapsed"],
        name: "China",
        no_full_control: true,
    },
}

const events = {
    ALLIED_NATIONS_SURRENDERS: {
        id: 1,
        cause: "allied nations surrendered [16.41]",
        pw: -2,
        nations: [nations.AUSTRALIA, nations.BURMA, nations.DEI, nations.MALAYA, nations.PHILIPPINES, nations.CHINA, nations.INDIA]
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
    },
    STRAT_BOMBING_CAMPAIGN: {
        id: 6,
        cause: "strategic bombing campaign started",
    },
    US_CASUALTIES: {
        id: 7,
        cause: "US Casualties [16.45]",
        counter: counters.pw_casualties,
        pw: -1,
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
        name: "River Kwai",
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
    CHINA_STATUS: {
        id: 31
    },
    INDIA_STATUS: {
        id: 32
    },
    LACK_US_BB: {
        id: 33,
        cause: "no US naval units",
        counter: counters.pw_bb,
        pw: -1,
    },
    LACK_US_CV: {
        id: 34,
        cause: "no US CV units",
        counter: counters.pw_cv,
        pw: -1,
    },
    FAILED_POW: {
        id: 35,
        counter: counters.pw_failed_pow,
    },
}

const ROAD_EVENTS = Object.keys(events).filter(k => events[k].road).map(k => {
    var event = events[k]
    event.keys = event.keys.map(h => hex_to_int(h))
    return event
})
