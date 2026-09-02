const SCENARIO_SETUP = [
    {
        id: SOUTH_PACIFIC_SCENARIO,
        setup: setup_scenario_south_pacific,
        deal_cards: S_P_deal_cards,
        replacement_points: get_S_P_replacement_points,
    },
    {
        id: FULL_CAMPAIGN_SCENARIO,
        setup: setup_scenario_1941,
    },
    {
        id: SHORT_CAMPAIGN_SCENARIO,
        setup: setup_scenario_1942,
    },
    {
        id: EVEN_SHORT_CAMPAIGN_SCENARIO,
        setup: setup_scenario_1943,
    },
    {
        id: YEAR_1942_SCENARIO,
        setup: setup_scenario_1942,
    },
    {
        id: YEAR_1943_SCENARIO,
        setup: setup_scenario_1943,
    },
    {
        id: 9,
        setup: setup_scenario_1944,
    },
    {
        id: YEAR_1942_1943_SCENARIO,
        setup: setup_scenario_1942,
    },
    {id: 7, setup: setup_scenario_1943},
    {id: 4, setup: setup_scenario_1942},
    {
        id: BURMA_SCENARIO,
        setup: setup_scenario_burma,
        deal_cards: B_F_W_deal_cards,
        replacement_points: get_B_F_W_replacement_points,
    },
]

SCENARIO_DATA.forEach(s => {
    var setup = SCENARIO_SETUP.filter(ss => ss.id === s.id)[0]
    s.replacement_points = setup.replacement_points ? setup.replacement_points : get_replacement_points
    s.deal_cards = setup.deal_cards ? setup.deal_cards : deal_cards
    s.setup = setup.setup
})

const SCENARIOS = SCENARIO_DATA.map(s => s.name)

function S_P_deck() {
    var ap_draw = [8, 13, 20, 21, 23, 24, 25, 27, 28, 29, 31, 32, 36, 40, 43, 44, 46, 50, 52, 56, 64, 66, 81, 82]
    var jp_draw = [9, 13, 16, 17, 20, 23, 25, 27, 28, 29, 32, 33, 34, 35, 42, 44, 48, 49, 51, 52, 73, 75, 84, 85]
    var deck = []
    jp_draw.map(c => find_card(0, c)).forEach(c => set_add(deck, c))
    ap_draw.map(c => find_card(1, c)).forEach(c => set_add(deck, c))
    return deck
}

function B_F_W_deck() {
    var ap_draw = [2, 7, 18, 19, 22, 26, 33, 34, 38, 39, 41, 42, 48, 49, 52, 57, 58, 59, 60, 77, 78, 81, 82, 83]
    var jp_draw = [3, 4, 5, 6, 7, 8, 15, 16, 21, 22, 26, 33, 39, 40, 41, 42, 48, 49, 25, 50, 53, 54, 67, 82, 86]
    var deck = []
    jp_draw.map(c => find_card(0, c)).forEach(c => set_add(deck, c))
    ap_draw.map(c => find_card(1, c)).forEach(c => set_add(deck, c))
    return deck
}

function setup_scenario_burma() {
    G.draw = [[], []]
    G.removed = [[], []]
    G.discard = [[], []]
    for_each_card((i, card) => {
        if (scenario_data().has_card(i)) {
            G.draw[card.faction].push(i)
        }
    })

    var removed = []
    for (var i = 1; i < cards.length; i++) {
        var faction = cards[i].faction
        if (!set_has(G.draw[faction], i)) {
            set_add(removed, i)
        }
    }

    while (G.hand[AP].length < 3) {
        draw_card(AP)
    }

    while (G.hand[JP].length < 2) {
        draw_card(JP)
    }
    remove_card(DOOLITLE_RAID)

    for_each_unit(u => G.location[u] = NOT_USED)

    //17.11.5. Burma has already surrendered; India and China have not yet surrendered.
    var surrender = [nations.BURMA]
    surrender.forEach(n => {
        G.surrender[n.id] = 1
        set_control_over_nation(n)
    })
    capture_hex(hex_to_int(1912), JP)
    capture_hex(hex_to_int(1809), JP)
    capture_hex(hex_to_int(2112), JP)
    G.reduced = []

    //AP Setup  (same order as the setup table found in the rules p44)
    setup_jp_unit(ap_air("14"), 2104)
    G.location[ap_air("14_lrb")] = CHINA_BOX
    setup_jp_unit(ap_air("10_lrb"), 1805)
    setup_jp_unit(find_piece("indomitable"), 1307)
    setup_jp_unit(find_piece("warspite"), 1307)
    setup_jp_unit(HQ_SEAC, 1805)
    setup_jp_unit(ap_army("33"), 1905)
    setup_jp_unit(ap_air("seac"), 1905)
    setup_jp_unit(ap_air("seac_lrb"), 1905)
    setup_jp_unit(find_piece("london"), 1307)
    setup_jp_unit(ap_army("1_ind"), 2205, true)
    setup_jp_unit(ap_army("7"), 2006)
    setup_jp_unit(ap_army("15"), 2006)
    setup_jp_unit(ap_army("4_ind"), 2105)

    setup_jp_unit(ap_army("5_cn"), 2205)
    setup_jp_unit(ap_army("6_cn"), 2407, true)
    setup_jp_unit(ap_army("66_cn"), 2407, true)

    //jp setup (same order as the setup table found in the rules p44)
    setup_jp_unit(jp_army("28"), 2007)
    setup_jp_unit(jp_air("5"), 2008, true)
    setup_jp_unit(jp_army("37"), 2008, true)
    setup_jp_unit(find_piece("kamikaze"), 2008)
    setup_jp_unit(jp_air("28"), 2012)
    setup_jp_unit(jp_army("15"), 2106)
    setup_jp_unit(jp_air("9"), 2110)
    setup_jp_unit(jp_army("33"), 2206)
    setup_jp_unit(HQ_JP_SOUTH, 2212)
    setup_jp_unit(jp_army("38"), 2305, true)
    setup_jp_unit(jp_air("8"), 2409)
    setup_jp_unit(find_piece("zuiho"), 2015)
    setup_jp_unit(find_piece("junyo"), 2015)
    setup_jp_unit(find_piece("nagato"), 2015)

    //reinforcements
    setup_jp_unit(jp_army("29"), int_to_hex(NON_PLACED_BOX), true)
    setup_jp_unit(ap_air("20_bc"), int_to_hex(NON_PLACED_BOX))

    for (var i = 1; i < pieces.length; i++) {
        if (G.location[i] === NON_PLACED_BOX && pieces[i].reinforcement) {
            G.location[i] = TURN_BOX + pieces[i].reinforcement
        }
    }

    G.turn = 6
    G.political_will = 4
    G.asp[JP] = [1, 0]
    G.asp[AP] = [1, 0]
    G.wie = 3

    //17.11.21. Japanese Replacements: Japanese begin the game with 2 air
    //replacements, 1 Ground taken from China per turn (optional)
    //plus Air steps per event card, no naval replacements
    G.reinforcements = [0, 2]
    G.surrender[nations.CHINA.id] = 2
    G.inter_service = [1, 1]
    G.china_divisions = 8

    //17.11.14. Ledo and Imphal infrastructure have not yet been completed,
    //Jarhat infrastructure is complete and treated as strategic trans-
    //port routes.
    G.events[events.JARHAT_ROAD.id] = 1
    G.events[events.HUMP.id] = 1 //Burma Road: Hump Closed
    cards[find_card(JP, 18)].event()
    G.events[events.KWAI_RIVER_BRIDGE.id] = 2
    G.events[events.DOOLITLE] = 2// 17.11.22. Doolittle Raid has occurred meeting the condition for the Doolittle Reprisal card.

    prepare_game_log()
    log_scenario()
    log(`@Turn ${G.turn} - ${get_year_season()} ${get_year()}`)
    call("burma_choose_offensive")
}

function log_scenario() {
    log(`!Empire of the Sun. ${scenario_data().name}`)
}

function setup_scenario_1941(options) {
    if (options.historical) {
        G.options = {historical: true}
    }
    draw_specific_card(find_card(JP, 1))
    draw_specific_card(find_card(JP, 2))
    prepare_game_log()
    log("!Empire of the Sun. The Pacific War 1941-1945")
    call("scenario_1941")
}

function setup_scenario_1942(options) {
    if (options.historical) {
        G.options = {historical: true}
    }

    for (let i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.reinforcement !== 2) {
            continue
        }
        if (piece.faction) {
            G.location[i] = DELAYED_BOX
        }
        if (piece.start_reduced) {
            set_add(G.reduced, i)
        }
    }
    //ap setup
    G.location[find_piece("mdca")] = NOT_USED
    G.location[M_CORPS] = NOT_USED
    G.location[HK_DIVISION] = NOT_USED
    G.location[find_piece("forcez")] = NOT_USED
    G.location[NL_CORPS] = NOT_USED
    G.location[HQ_SEAC] = hex_to_int(1805)
    G.location[US_FEAF] = hex_to_int(2813)
    set_add(G.reduced, US_FEAF)
    G.location[SL_CORPS] = hex_to_int(2912)
    set_add(G.reduced, SL_CORPS)
    G.location[LRB_19] = hex_to_int(2917)
    set_add(G.reduced, LRB_19)
    G.location[US_ASIA_CA] = hex_to_int(3014)
    set_add(G.reduced, US_ASIA_CA)
    G.location[AF7] = hex_to_int(5108)
    G.location[AF7_LRB] = hex_to_int(5808)
    G.location[find_piece("lexington")] = hex_to_int(5808)
    set_delete(G.reduced, find_piece("lexington"))
    G.location[find_piece("enterprise")] = hex_to_int(5808)
    set_delete(G.reduced, find_piece("enterprise"))
    G.location[N_ORLEANS] = hex_to_int(5808)
    set_add(G.reduced, N_ORLEANS)

    //jp setup
    capture_hex(hex_to_int(1912), JP)
    capture_hex(hex_to_int(2012), JP)
    capture_hex(hex_to_int(2709), JP)
    setup_jp_unit(jp_army(38), 1913)
    setup_jp_unit(jp_army(15), 2109)
    setup_jp_unit(jp_army(28), 2110, true)
    setup_jp_unit(jp_army(25), 2112, true)
    setup_jp_unit(jp_air(22), 2212)
    setup_jp_unit(HQ_JP_SOUTH, 2212)
    setup_jp_unit(find_piece("mogami"), 2311)
    setup_jp_unit(find_piece("kongo"), 2311)
    setup_jp_unit(jp_army("2sn"), 2415)
    setup_jp_unit(jp_army(17), 2709, true)
    setup_jp_unit(jp_army(14), 2812)
    setup_jp_unit(jp_air(5), 2812)
    setup_jp_unit(jp_air(21), 2909)
    setup_jp_unit(find_piece("takao"), 2909)
    setup_jp_unit(jp_army("1sn"), 2911)
    setup_jp_unit(jp_army(19), 2913, true)
    setup_jp_unit(jp_army(16), 2915, true)
    setup_jp_unit(find_piece("ryujo"), 2915)
    setup_jp_unit(find_piece("zuiho"), 2915)
    setup_jp_unit(find_piece("nachi"), 2915)
    setup_jp_unit(jp_air(2), 3004)
    setup_jp_unit(jp_army(35), 3007, true)
    setup_jp_unit(jp_air(23), 3009)
    setup_jp_unit(KOREAN_ARMY, 3305)
    setup_jp_unit(HQ_YAMAMOTO, 3407)
    setup_jp_unit(find_piece("nagato"), 3407)
    setup_jp_unit(find_piece("yamato"), 3407, true)
    setup_jp_unit(jp_air(25), 3407)
    setup_jp_unit(jp_air(3), 3607)
    setup_jp_unit(jp_air(4), 3607)
    setup_jp_unit(jp_army(27), 3704, true)
    setup_jp_unit(ED_ARMY, 3706)
    setup_jp_unit(jp_air(1), 3706)
    setup_jp_unit(jp_army(18), 3706, true)
    setup_jp_unit(find_piece("akagi"), 3706)
    setup_jp_unit(find_piece("soryu"), 3706)
    setup_jp_unit(find_piece("shokaku"), 3706)
    setup_jp_unit(find_piece("hiei"), 3706)
    setup_jp_unit(jp_army("3sn"), 3814)
    setup_jp_unit(HQ_SOUTH_SEAS, 4017)
    setup_jp_unit(find_piece("kamikaze"), 4017)
    setup_jp_unit(find_piece("aoba"), 4021)
    setup_jp_unit(jp_army("ss"), 4021)
    setup_jp_unit(jp_army("4sn"), 4715, true)
    setup_jp_unit(jp_air(24), 4715)
    setup_jp_unit(find_piece("tenyru"), 4715)

    for_each_unit_on_map(u => capture_hex(G.location[u], pieces[u].faction))

    remove_card(find_card(JP, 1))
    remove_card(find_card(JP, 2))

    G.passes[AP] = 2
    G.passes[JP] = 0
    G.turn = 2
    G.asp[1] = [1, 0]
    G.political_will = 8
    G.china_divisions = 11
    prepare_game_log()
    log_scenario()
    log("@Turn " + G.turn + " - " + get_year_season() + " " + get_year())
    call("scenario_1942")
}

function emergency_move_1942() {
    G.active = AP
    var unit_to_retreat = []
    for_each_unit_on_map((u, piece, location) => {
        if (piece.faction === AP && piece.class === "naval" && location !== OAHU) {
            set_add(unit_to_retreat, u)
        }
    })
    call("emergency_move", {unit_to_retreat})
}

function setup_scenario_1943() {
    G.reduced = []
    //ap setup
    for (var i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.faction === AP && (piece.start || piece.reinforcement < 5)) {
            G.location[i] = NOT_USED
        }
    }
    for (let i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.reinforcement !== 5) {
            continue
        }
        if (piece.faction) {
            G.location[i] = DELAYED_BOX
        }
        if (piece.start_reduced) {
            set_add(G.reduced, i)
        }
    }
    G.location[find_piece("wasp")] = ELIMINATED_BOX
    G.location[find_piece("northampton")] = ELIMINATED_BOX
    G.location[find_piece("indomitable")] = hex_to_int(1005)
    G.location[find_piece("warspite")] = hex_to_int(1005)
    G.location[find_piece("london")] = hex_to_int(1005)
    G.location[HQ_SEAC] = hex_to_int(1805)
    G.location[ap_air("seac")] = hex_to_int(1805)
    G.location[ap_army("15")] = hex_to_int(1905)
    G.location[ap_air("10_lrb")] = hex_to_int(1905)
    G.location[ap_air("14_lrb")] = CHINA_BOX
    G.location[ap_army("4_ind")] = hex_to_int(2006)
    G.location[ap_air("14")] = hex_to_int(2104)
    G.location[ap_army("33")] = hex_to_int(2105)
    G.location[ap_army("1_ind")] = hex_to_int(2205)
    set_add(G.reduced, ap_army("1_ind"))
    G.location[ap_army("5_cn")] = hex_to_int(2205)
    G.location[ap_army("6_cn")] = hex_to_int(2407)
    G.location[ap_army("66_cn")] = hex_to_int(2407)
    set_add(G.reduced, ap_army("6_cn"))
    set_add(G.reduced, ap_army("66_cn"))
    G.location[ap_army("1_m")] = hex_to_int(3626)
    G.location[ap_army("1_au")] = hex_to_int(3023)
    G.location[ap_air("5")] = hex_to_int(3626)
    G.location[ap_air("5_lrb")] = hex_to_int(3626)
    G.location[HQ_SOUTH_WEST] = hex_to_int(3727)
    G.location[ap_army("2_au")] = hex_to_int(3727)
    G.location[find_piece("kent")] = hex_to_int(3727)
    G.location[HQ_ANZAC] = hex_to_int(3823)
    G.location[ap_army("pm")] = hex_to_int(3823)
    set_add(G.reduced, ap_army("pm"))
    G.location[ap_army("3_au")] = hex_to_int(3823)
    G.location[ap_air("au")] = hex_to_int(3823)
    G.location[ap_army("11")] = hex_to_int(3922)
    G.location[ap_army("1")] = hex_to_int(4024)
    G.location[ap_army("14")] = hex_to_int(4423)
    G.location[ap_army("2_m")] = hex_to_int(4423)
    G.location[ap_air("1_maw")] = hex_to_int(4423)
    G.location[ap_air("2_maw")] = hex_to_int(4825)
    G.location[ap_air("13")] = hex_to_int(4825)
    G.location[ap_air("13_lrb")] = hex_to_int(4825)
    G.location[ap_army("sf")] = hex_to_int(4825)
    G.location[HQ_SOUTH_HELSEY] = hex_to_int(4828)
    G.location[ap_army("3_nz")] = hex_to_int(4828)
    G.location[find_piece("lexington")] = hex_to_int(4828)
    G.location[find_piece("enterprise")] = hex_to_int(4828)
    G.location[find_piece("washington")] = hex_to_int(4828)
    G.location[find_piece("carolina")] = hex_to_int(4828)
    set_add(G.reduced, find_piece("lexington"))
    set_add(G.reduced, find_piece("enterprise"))
    G.location[ap_air("11")] = hex_to_int(5100)
    G.location[ap_air("11_lrb")] = hex_to_int(5100)
    G.location[ap_air("7_lrb")] = hex_to_int(5108)
    G.location[HQ_CENTRAL_PACIFIC] = hex_to_int(5808)
    G.location[ap_air("7")] = hex_to_int(5808)
    G.location[ap_army("10")] = hex_to_int(5808)
    G.location[ap_army("mb")] = hex_to_int(5808)
    G.location[find_piece("mississippi")] = hex_to_int(5808)


    //jp setup
    G.location[find_piece("kongo")] = NOT_USED
    G.location[find_piece("akagi")] = NOT_USED
    G.location[find_piece("soryu")] = NOT_USED
    G.location[find_piece("ryujo")] = NOT_USED
    G.location[find_piece("tenyru")] = NOT_USED
    G.location[jp_air("t")] = NOT_USED
    setup_jp_unit(jp_air(3), 1916, true)
    setup_jp_unit(jp_army(25), 1916, true)
    setup_jp_unit(jp_army(28), 2008)
    setup_jp_unit(jp_air(5), 2008)
    setup_jp_unit(jp_army(33), 2106)
    setup_jp_unit(jp_army(15), 2206)
    G.location[HQ_JP_SOUTH] = hex_to_int(2212)
    setup_jp_unit(jp_army(38), 2212)
    setup_jp_unit(jp_air(27), 2212)
    setup_jp_unit(jp_air(23), 2220)
    setup_jp_unit(jp_army(16), 2220, true)
    setup_jp_unit(jp_army(37), 2616, true)
    setup_jp_unit(jp_air(28), 2620)
    setup_jp_unit(jp_army(14), 2813)
    setup_jp_unit(jp_air(22), 2909, true)
    setup_jp_unit(jp_air(8), 2915)
    setup_jp_unit(jp_army(35), 2915)
    setup_jp_unit(jp_air(2), 3004)
    setup_jp_unit(jp_air(4), 3004)
    setup_jp_unit(jp_air(7), 3119)
    setup_jp_unit(jp_army("kor"), 3305)
    setup_jp_unit(HQ_YAMAMOTO, 3407)
    setup_jp_unit(find_piece("junyo"), 3407)
    setup_jp_unit(find_piece("nagato"), 3407)
    setup_jp_unit(find_piece("mogami"), 3407, true)
    setup_jp_unit(jp_army("27"), 3704, true)
    setup_jp_unit(jp_army("ed"), 3706)
    setup_jp_unit(jp_air(1), 3706)
    setup_jp_unit(jp_air(6), 3720)
    setup_jp_unit(jp_army(19), 3720)
    setup_jp_unit(jp_army(31), 3813, true)
    setup_jp_unit(jp_army(18), 3822)
    setup_jp_unit(HQ_SOUTH_SEAS, 4017)
    setup_jp_unit(find_piece("yamato"), 4017)
    setup_jp_unit(find_piece("shokaku"), 4017)
    setup_jp_unit(find_piece("zuiho"), 4017)
    setup_jp_unit(find_piece("hiei"), 4017)
    setup_jp_unit(find_piece("nachi"), 4017)
    setup_jp_unit(jp_army(17), 4021)
    setup_jp_unit(jp_air(21), 4021, true)
    setup_jp_unit(find_piece("aoba"), 4021, true)
    setup_jp_unit(find_piece("takao"), 4021)
    setup_jp_unit(find_piece("kamikaze"), 4021)
    setup_jp_unit(jp_air(25), 4222, true)
    setup_jp_unit(jp_army("ss"), 4322)
    setup_jp_unit(jp_air(26), 4415)
    setup_jp_unit(jp_army("2sn"), 4600, true)
    setup_jp_unit(jp_army("4sn"), 4612, true)
    setup_jp_unit(jp_army("3sn"), 4715)
    setup_jp_unit(jp_air(24), 4715, true)
    setup_jp_unit(jp_army("1sn"), 5018)

    var surrender = [nations.MALAYA, nations.PHILIPPINES, nations.DEI, nations.BURMA, nations.AUSTRALIAN_MANDATES]
    surrender.forEach(n => {
        G.surrender[n.id] = 3
        set_control_over_nation(n)
    })

    for_each_unit_on_map(u => capture_hex(G.location[u], pieces[u].faction))
    capture_hex(hex_to_int(1813), JP)
    capture_hex(hex_to_int(2108), JP)
    capture_hex(hex_to_int(2014), JP)
    capture_hex(hex_to_int(2015), JP)
    capture_hex(hex_to_int(2017), JP)
    capture_hex(hex_to_int(2018), JP)
    capture_hex(hex_to_int(2019), JP)
    capture_hex(hex_to_int(2110), JP)
    capture_hex(hex_to_int(2305), JP)
    capture_hex(hex_to_int(2415), JP)
    capture_hex(hex_to_int(2517), JP)
    capture_hex(hex_to_int(2709), JP)
    capture_hex(hex_to_int(3219), JP)
    capture_hex(hex_to_int(3319), JP)
    capture_hex(hex_to_int(3520), JP)
    capture_hex(hex_to_int(3620), JP)
    capture_hex(hex_to_int(3721), JP)
    capture_hex(hex_to_int(3814), JP)
    capture_hex(hex_to_int(4719), JP)

    G.turn = 5
    G.asp[JP] = [7, 0]
    G.asp[AP] = [4, 0]
    G.pow = 4
    G.political_will = 6
    G.china_divisions = 7
    G.burma_road = 1
    G.surrender[nations.CHINA.id] = 2
    G.reinforcements = [1, 2]
    G.wie = 4
    G.inter_service = [1, 1]
    G.events[events.HUMP.id] = 1
    G.events[events.JARHAT_ROAD.id] = 1
    G.events[events.BARGES.id] = 1
    cards[find_card(JP, 18)].event()
    G.events[events.KWAI_RIVER_BRIDGE.id] = 2
    G.events[events.ALASKA_OCCUPATION.id] = 3
    G.events[events.ALASKA_OCCUPATION_HEXES.id] = 3

    future_offencive_card(find_card(AP, 29), 3)
    future_offencive_card(find_card(JP, 26), 3)

    var jr = [1, 2, 5, 6, 13, 15, 18, 39, 55, 73, 78]
    jr.forEach(i => remove_card(find_card(JP, i)))
    var ar = [1, 3, 4, 6, 7, 8, 10, 11, 12, 14, 16, 17, 20, 51]
    ar.forEach(i => remove_card(find_card(AP, i)))
    discard_card(find_card(AP, 13))
    discard_card(find_card(AP, 15))
    var jd = [8, 12, 14, 20, 25, 29, 35]
    jd.forEach(i => discard_card(find_card(JP, i)))

    while (G.hand[JP].length < 7) {
        draw_card(JP)
    }
    while (G.hand[AP].length < 7) {
        draw_card(AP)
    }
    prepare_game_log()
    log_scenario()
    log("@Turn " + G.turn + " - " + get_year_season() + " " + get_year())
    call("offensive_phase")
}

function setup_scenario_1944() {
    G.reduced = []
    //ap setup
    for_each_unit((u, piece) => {
        if (piece.start || piece.reinforcement <= 8) {
            G.location[u] = NOT_USED
        }
    })
    G.location[find_piece("indomitable")] = hex_to_int(1005)
    G.location[find_piece("warspite")] = hex_to_int(1005)
    G.location[find_piece("london")] = hex_to_int(1005)
    G.location[HQ_SEAC] = hex_to_int(1805)
    G.location[ap_air("seac")] = hex_to_int(1805)
    G.location[ap_air("seac_lrb")] = hex_to_int(1805)
    G.location[ap_army("15")] = hex_to_int(1905)
    G.location[ap_air("10_lrb")] = hex_to_int(1905)
    G.location[ap_air("14_lrb")] = CHINA_BOX
    G.location[ap_army("4_ind")] = hex_to_int(2006)
    G.location[ap_air("14")] = hex_to_int(2104)
    G.location[ap_army("33")] = hex_to_int(2105)
    setup_jp_unit(ap_army("5_cn"), 2205, true)
    setup_jp_unit(ap_army("77"), 2205)
    setup_jp_unit(ap_army("6_cn"), 2407, true)
    setup_jp_unit(ap_army("66_cn"), 2407, true)
    setup_jp_unit(ap_army("1_au"), 3023)
    setup_jp_unit(ap_army("11_d"), 3626)
    setup_jp_unit(HQ_SOUTH_WEST, 3727)
    setup_jp_unit(ap_army("2_au"), 3727)
    setup_jp_unit(find_piece("kent"), 3727)
    setup_jp_unit(ap_army("3_au"), 3822)
    setup_jp_unit(ap_army("11"), 3822)
    setup_jp_unit(HQ_ANZAC, 3823)
    setup_jp_unit(ap_army("4_au"), 3823)
    setup_jp_unit(ap_air(5), 3823)
    setup_jp_unit(ap_air("5_lrb"), 3823)
    setup_jp_unit(ap_air("au"), 3823)
    setup_jp_unit(ap_army("1_m"), 3921)
    setup_jp_unit(ap_army("1"), 3922)
    setup_jp_unit(ap_army("pm"), 4024, true)
    setup_jp_unit(ap_army("3_m"), 4222)
    setup_jp_unit(ap_army("14"), 4222)
    setup_jp_unit(ap_air("2_maw"), 4222)
    setup_jp_unit(ap_air("13"), 4322)
    setup_jp_unit(ap_air("13_lrb"), 4322)
    setup_jp_unit(ap_army("3_nz"), 4322)
    setup_jp_unit(ap_army("sf"), 4423)
    setup_jp_unit(ap_army("6_m"), 4826)
    setup_jp_unit(find_piece("cowpens"), 4826)
    setup_jp_unit(find_piece("belleau"), 4826)
    setup_jp_unit(find_piece("sangamon"), 4826)
    setup_jp_unit(find_piece("bataan"), 4826)
    setup_jp_unit(find_piece("casablanca"), 4826)
    setup_jp_unit(find_piece("jersey"), 4826)
    setup_jp_unit(HQ_SOUTH_HELSEY, 4828)
    setup_jp_unit(find_piece("lexington"), 4828)
    setup_jp_unit(find_piece("enterprise"), 4828)
    setup_jp_unit(find_piece("essex"), 4828)
    setup_jp_unit(find_piece("bunker"), 4828)
    setup_jp_unit(find_piece("washington"), 4828)
    setup_jp_unit(find_piece("carolina"), 4828)
    setup_jp_unit(ap_army("9"), 4828)
    setup_jp_unit(ap_army("2_m"), 5018)
    setup_jp_unit(ap_air("7"), 5018)
    setup_jp_unit(ap_air("7_lrb"), 5018)
    setup_jp_unit(ap_air("11_lrb"), 5100)
    setup_jp_unit(ap_air("11"), 5100)
    setup_jp_unit(ap_air("1_maw"), 5108)
    setup_jp_unit(HQ_CENTRAL_PACIFIC, 5808)
    setup_jp_unit(ap_army(10), 5808)
    setup_jp_unit(ap_army(24), 5808)
    setup_jp_unit(ap_army("mb"), 5808)
    setup_jp_unit(find_piece("mississippi"), 5808)
    setup_jp_unit(find_piece("jacinto"), 5808)
    setup_jp_unit(find_piece("mass"), 5808)
    setup_jp_unit(find_piece("franklin"), 5808)
    setup_jp_unit(find_piece("intrepid"), 5808)
    setup_jp_unit(find_piece("hancock"), 5808)

    //jp setup
    setup_jp_unit(jp_air(9), 1916)
    setup_jp_unit(jp_army(25), 1916, true)
    setup_jp_unit(jp_army(28), 2008)
    setup_jp_unit(jp_air(5), 2008, true)
    setup_jp_unit(jp_air(28), 2015, true)
    setup_jp_unit(jp_army(29), 2015, true)
    setup_jp_unit(jp_army(33), 2106)
    setup_jp_unit(jp_army(15), 2206)
    G.location[HQ_JP_SOUTH] = hex_to_int(2212)
    setup_jp_unit(jp_army(38), 2212)
    setup_jp_unit(jp_army(16), 2220, true)
    setup_jp_unit(jp_air(8), 2409)
    setup_jp_unit(jp_army(37), 2616, true)
    setup_jp_unit(jp_army(14), 2813)
    setup_jp_unit(jp_air(23), 2813)
    setup_jp_unit(jp_air(3), 2909, true)
    setup_jp_unit(jp_army(35), 2915)
    setup_jp_unit(jp_air(2), 3004)
    setup_jp_unit(jp_air(4), 3004)
    setup_jp_unit(jp_army("kor"), 3305)
    setup_jp_unit(HQ_OZAWA, 3407)
    setup_jp_unit(find_piece("junyo"), 3407)
    setup_jp_unit(find_piece("nagato"), 3407)
    setup_jp_unit(find_piece("mogami"), 3407, true)
    setup_jp_unit(find_piece("kaiyo"), 3407)
    setup_jp_unit(find_piece("shokaku"), 3407)
    setup_jp_unit(find_piece("taiho"), 3407)
    setup_jp_unit(jp_air("11"), 3407)
    setup_jp_unit(jp_air("26"), 3416, true)
    setup_jp_unit(jp_army("2"), 3520, true)
    setup_jp_unit(find_piece("yamato"), 3615)
    setup_jp_unit(find_piece("zuiho"), 3615)
    setup_jp_unit(find_piece("hiei"), 3615)
    setup_jp_unit(jp_air("27"), 3704, true)
    setup_jp_unit(jp_army("27"), 3704, true)
    setup_jp_unit(jp_air("51"), 3704)
    setup_jp_unit(jp_army("ed"), 3706)
    setup_jp_unit(jp_air(1), 3706)
    setup_jp_unit(jp_air(10), 3706)
    setup_jp_unit(jp_air(6), 3720, true)
    setup_jp_unit(jp_air(7), 3720, true)
    setup_jp_unit(jp_army(19), 3720, true)
    setup_jp_unit(jp_army(18), 3721, true)
    setup_jp_unit(HQ_SOUTH_SEAS, 3813)
    setup_jp_unit(jp_army(31), 3813, true)
    setup_jp_unit(jp_air(61), 3813)
    setup_jp_unit(jp_air(62), 3813)
    setup_jp_unit(jp_air(22), 4017, true)
    setup_jp_unit(find_piece("nachi"), 4017)
    setup_jp_unit(jp_army(17), 4021)
    setup_jp_unit(jp_air(25), 4021, true)
    setup_jp_unit(find_piece("takao"), 4021, true)
    setup_jp_unit(find_piece("kamikaze"), 4021, true)
    setup_jp_unit(jp_army("4sn"), 4612, true)
    setup_jp_unit(jp_army("3sn"), 4715)
    setup_jp_unit(jp_air("24"), 4715, true)
    G.location[jp_air("t")] = NOT_USED

    var surrender = [nations.MALAYA, nations.PHILIPPINES, nations.DEI, nations.BURMA, nations.AUSTRALIAN_MANDATES]
    surrender.forEach(n => {
        G.surrender[n.id] = 3
        set_control_over_nation(n)
    })
    for_each_unit_on_map(u => capture_hex(G.location[u], pieces[u].faction))
    capture_hex(hex_to_int(4122), AP)
    var jp_control = [1813, 2014, 2017, 2018, 2019, 2110, 2305, 2415, 2517, 2709, 3119, 3219, 3319, 3620, 3814]
    jp_control.forEach(h => capture_hex(hex_to_int(h), JP))

    G.turn = 8
    G.asp[JP] = [5, 0]
    G.china_divisions = 5
    G.asp[AP] = [8, 0]
    G.surrender[nations.CHINA.id] = 2
    G.events[events.NEW_OPERATION_PLAN.id] = 4
    G.pow = 4
    G.political_will = 5
    G.inter_service = [1, 1]
    G.wie = 1
    G.burma_road = 1
    G.events[events.PT_BOATS.id] = 5
    G.events[events.HUMP.id] = 1
    G.events[events.JARHAT_ROAD.id] = 1
    cards[find_card(JP, 18)].event()
    G.events[events.KWAI_RIVER_BRIDGE.id] = 2


    var jr = [1, 2, 5, 6, 13, 15, 18, 26, 31, 39, 51, 53, 54, 55, 73, 78]
    jr.forEach(i => remove_card(find_card(JP, i)))
    var ar = [1, 3, 4, 6, 7, 8, 10, 11, 12, 14, 16, 17, 18, 20, 22, 23, 24, 27, 30, 39, 41, 42, 47, 51, 73]
    ar.forEach(i => remove_card(find_card(AP, i)))
    discard_card(find_card(JP, 7))
    discard_card(find_card(AP, 2))
    future_offencive_card(find_card(AP, 45), 7)
    future_offencive_card(find_card(JP, 4), 7)

    G.passes = [1, 0]
    while (G.hand[JP].length < 6) {
        draw_card(JP)
    }
    while (G.hand[AP].length < 7) {
        draw_card(AP)
    }
    prepare_game_log()
    log_scenario()
    log("@Turn " + G.turn + " - " + get_year_season() + " " + get_year())
    call("offensive_phase")
}

function setup_scenario_south_pacific() {
    G.draw = [[], []]
    G.removed = [[], []]
    G.discard = [[], []]
    for_each_card((i, card) => {
        if (scenario_data().has_card(i)) {
            G.draw[card.faction].push(i)
        }
    })

    var removed = []
    for (var i = 1; i < cards.length; i++) {
        var faction = cards[i].faction
        if (!set_has(G.draw[faction], i)) {
            set_add(removed, i)
        }
    }

    future_offencive_card(find_card(AP, 13), 2)
    while (G.hand[AP].length < 2) {
        draw_card(AP)
    }
    draw_specific_card(find_card(JP, 17))
    while (G.hand[JP].length < 3) {
        draw_card(JP)
    }


    var surrender = [nations.AUSTRALIAN_MANDATES, nations.NEW_GUINEA]
    surrender.forEach(n => {
        G.surrender[n.id] = 1
        set_control_over_nation(n)
    })
    G.surrender[nations.NEW_GUINEA.id] = 0
    var ap_controlled = [5808, 3823, 4024, 4828]
    ap_controlled.forEach(h => capture_hex(hex_to_int(h), h))
    capture_hex(hex_to_int(4719), JP)
    capture_hex(hex_to_int(3017), JP)
    G.reduced = []

    for_each_unit(u => G.location[u] = NOT_USED)

    setup_jp_unit(ap_air(5), 3626)
    setup_jp_unit(ap_air("5_lrb"), 3626)
    setup_jp_unit(ap_air("13"), 4825)
    setup_jp_unit(ap_air("13_lrb"), 4825)
    // setup_jp_unit(ap_air("14_lrb"), CHINA_BOX)
    setup_jp_unit(ap_air("1_maw"), 4826)
    setup_jp_unit(ap_air("2_maw"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(ap_army("mb"), 4825)
    setup_jp_unit(ap_army("sf"), 4828)
    setup_jp_unit(ap_army("1_m"), 4828)
    setup_jp_unit(ap_army("2_m"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(ap_army("3_m"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(ap_army("1"), 3727, true)
    setup_jp_unit(ap_army("11"), 5808)
    setup_jp_unit(ap_army("14"), 3626, true)
    setup_jp_unit(ap_army("24"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(HQ_CENTRAL_PACIFIC, 5808)
    setup_jp_unit(HQ_SOUTH_GHORMLEY, 4828)
    setup_jp_unit(HQ_SOUTH_WEST, 3727)
    setup_jp_unit(find_piece("enterprise"), 4828, true)
    setup_jp_unit(find_piece("wasp"), 4828, true)
    setup_jp_unit(find_piece("lexington"), 4828, true)
    setup_jp_unit(find_piece("northampton"), 4828)
    setup_jp_unit(find_piece("carolina"), 4828)
    setup_jp_unit(find_piece("washington"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(find_piece("mass"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(find_piece("jacinto"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(find_piece("bunker"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(find_piece("essex"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(find_piece("belleau"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(find_piece("sangamon"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(find_piece("cowpens"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(ap_air("au"), 3823)
    setup_jp_unit(ap_army("1_au"), 3023)
    setup_jp_unit(ap_army("2_au"), 3727)
    setup_jp_unit(ap_army("3_au"), 3626)
    setup_jp_unit(ap_army("3_nz"), 4828)
    setup_jp_unit(ap_army("pm"), 3823, true)
    setup_jp_unit(HQ_ANZAC, 3823)
    setup_jp_unit(find_piece("kent"), 3727)

    //jp setup
    setup_jp_unit(jp_air("t"), 3922)
    setup_jp_unit(jp_air("6"), 3720)
    setup_jp_unit(jp_air("21"), 4021)
    setup_jp_unit(jp_air("25"), 3822)
    setup_jp_unit(jp_air("26"), 3119)
    setup_jp_unit(jp_air("7"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(jp_air("27"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(jp_air("28"), int_to_hex(NON_PLACED_BOX))
    setup_jp_unit(jp_army("4sn"), 4423, true)
    setup_jp_unit(jp_army("ss"), 3822)
    setup_jp_unit(jp_army("17"), 4021)
    setup_jp_unit(jp_army("18"), 3720)
    setup_jp_unit(jp_army("19"), 4017)
    setup_jp_unit(HQ_YAMAMOTO, 3416)
    setup_jp_unit(HQ_SOUTH_SEAS, 4017)
    setup_jp_unit(find_piece("kongo"), 4017)
    setup_jp_unit(find_piece("hiei"), 4017)
    setup_jp_unit(find_piece("yamato"), 4017, true)
    setup_jp_unit(find_piece("shokaku"), 4017)
    setup_jp_unit(find_piece("zuiho"), 4017)
    setup_jp_unit(find_piece("tenyru"), 4021)
    setup_jp_unit(find_piece("aoba"), 4021)
    setup_jp_unit(find_piece("kamikaze"), 4021)
    setup_jp_unit(find_piece("nachi"), 4021)

    for (var i = 1; i < pieces.length; i++) {
        if (G.location[i] === NON_PLACED_BOX && pieces[i].reinforcement) {
            G.location[i] = TURN_BOX + pieces[i].reinforcement
        }
    }

    G.turn = 3
    G.political_will = 4
    G.asp[JP] = [7, 0]
    G.asp[AP] = [2, 0]
    G.wie = 2
    G.pow = 0
    G.reinforcements = [2, 2]
    G.surrender[nations.CHINA.id] = 2
    G.inter_service = [1, 1]
    G.china_divisions = 9

    prepare_game_log()
    log_scenario()
    log("@Turn " + G.turn + " - " + get_year_season() + " " + get_year())
    call("offensive_phase")
}

function deal_cards() {
    var jp_cards = 7
    if (G.turn > 4) {
        var jp_resources = get_jp_resources()
        jp_cards = Math.max(Math.ceil(jp_resources / 2), 4)
        log(`JP resources - ${jp_resources} (${jp_cards} cards).`)
    } else {
        log(`JP use strategic reserves (${jp_cards} cards).`)
    }
    if (G.strategic_warfare) {
        jp_cards = Math.max(jp_cards - G.strategic_warfare, 4)
        log(`Strategic warfare reduces JP draw to ${jp_cards} (-${G.strategic_warfare}).`)
    }
    G.passes[JP] = 0
    if (jp_cards === 6) {
        G.passes[JP] = 1
    } else if (jp_cards <= 5) {
        G.passes[JP] = 2
    }
    if (G.passes[JP]) {
        log(`JP receives ${G.passes[JP]} passes.`)
    }
    while (G.hand[JP].length < jp_cards) {
        draw_card(JP)
    }

    let ap_cards = 7
    G.passes[AP] = 0
    if (G.turn === 1) {
        ap_cards = 0
    } else if (G.turn === 2) {
        ap_cards = G.hand[AP].length
        G.passes[AP] = 2
    } else if (G.turn === 3) {
        ap_cards = 6
        G.passes[AP] = 1
    }
    if (G.surrender[nations.CHINA.id] >= 5) {
        ap_cards -= 1
        G.passes[AP]++
        log(`AP draw reduced by 1 due to China's surrender.`)
    }
    if (G.surrender[nations.INDIA.id] >= 4) {
        ap_cards -= 1
        G.passes[AP]++
        log(`AP draw reduced by 1 due to India's surrender.`)
    }
    if (G.surrender[nations.AUSTRALIA.id]) {
        ap_cards -= 1
        G.passes[AP]++
        log(`AP draw reduced by 1 due to Australia's surrender.`)
    }
    if (G.wie >= 10) {
        ap_cards -= 1
        G.passes[AP]++
        log(`AP draw reduced by 1 due to War in Europe at Level 4.`)
    }
    ap_cards = Math.max(ap_cards, 4)
    G.passes[AP] = Math.min(G.passes[AP], 2)
    log(`AP draw ${ap_cards} cards.`)
    if (G.passes[AP]) {
        log(`AP receive ${G.passes[AP]} passes.`)
    }
    while (G.hand[AP].length < ap_cards) {
        draw_card(AP)
    }
}

function S_P_deal_cards() {
    var jp_cards = 4
    G.passes[JP] = 0
    if (G.strategic_warfare) {
        jp_cards -= G.strategic_warfare
        log(`Strategic warfare reduces JP draw to ${jp_cards} (-${G.strategic_warfare}).`)
        G.passes[JP] = 1
    }
    log(`JP receive ${jp_cards} cards.`)
    if (G.passes[JP]) {
        log(`JP receive ${G.passes[JP]} passes.`)
    }
    while (G.hand[JP].length < jp_cards) {
        draw_card(JP)
    }

    let ap_cards = 4
    G.passes[AP] = 0
    if (G.surrender[nations.CHINA.id] >= 5) {
        ap_cards -= 1
        G.passes[AP]++
        log(`AP draw reduced by 1 due to China's surrender.`)
    }
    log(`AP draw ${ap_cards} cards.`)
    if (G.passes[AP]) {
        log(`AP receive ${G.passes[AP]} passes.`)
    }
    while (G.hand[AP].length < ap_cards) {
        draw_card(AP)
    }
}

function B_F_W_deal_cards() {
    var jp_cards = 4
    G.passes[JP] = 0
    if (G.strategic_warfare) {
        jp_cards -= G.strategic_warfare
        log(`Strategic warfare reduces JP draw to ${jp_cards} (-${G.strategic_warfare}).`)
        G.passes[JP] = 1
    }
    log(`JP receive ${jp_cards} cards.`)
    if (G.passes[JP]) {
        log(`JP receive ${G.passes[JP]} passes.`)
    }
    while (G.hand[JP].length < jp_cards) {
        draw_card(JP)
    }

    let ap_cards = 4
    G.passes[AP] = 0
    if (G.surrender[nations.CHINA.id] >= 5) {
        ap_cards -= 1
        G.passes[AP]++
        log(`AP draw reduced by 1 due to China's surrender.`)
    }
    if (G.surrender[nations.INDIA.id] >= 4) {
        ap_cards -= 1
        G.passes[AP]++
        log(`AP draw reduced by 1 due to India surrender.`)
    }
    if (ap_cards === 4 && is_space_controlled(hex_to_int(2006), AP) && is_space_controlled(hex_to_int(2105), AP)
        && is_space_controlled(hex_to_int(2205), AP)) {
        log("Diverted Logistics:")
        clear_undo()
        let result = random(10)
        const success = result > 3
        log(`${dice_get_log_str(result, AP)} > 3 (${success ? "SUCCESS" : "FAILED"}).`)
        if (!success) {
            ap_cards -= 1
            G.passes[AP]++
            log(`AP draw reduced by 1 due to Diverted Logistics.`)
        }
    }
    log(`AP draw ${ap_cards} cards.`)
    if (G.passes[AP]) {
        log(`AP receive ${G.passes[AP]} passes.`)
    }
    while (G.hand[AP].length < ap_cards) {
        draw_card(AP)
    }
}

function get_replacement_points() {
    var result = []
    L.replacement_points = result
    if (G.active === JP) {
        G.reinforcements[NAVAl_REP] += ([3, 4, 11].includes(G.turn) ? 1 : 0)
        result[NAVAl_REP] = G.reinforcements[NAVAl_REP]
        result[AIR_REP] = G.reinforcements[AIR_REP]
        L.divisions = Math.min(2, G.china_divisions)
        return result
    }
    L.divisions = undefined
    if (G.turn % 2 === 0) {
        result[NAVAl_REP] = 1
    }
    if (is_space_controlled(OAHU, AP)) {
        if (result[NAVAl_REP]) {
            result[NAVAl_REP]++
        } else {
            result[NAVAl_REP] = 1
        }
        log(`+1 US Naval Replacement Point (AP controlled Oahu).`)
    }
    if ([6, 9, 12].includes(G.turn) && COM_REPLACEMENT_POINTS.filter(h => is_space_controlled(h, AP)).length) {
        result[COMMONWEALTH_REP] = 1
    }
    result[GROUND_REP] = 2
    result[AIR_REP] = 5
    if (G.turn >= 3 && G.turn % 2 === 1) {
        result[CHINESE_REP] = 1
    }
    if (is_event_active(events.INDEPENDENCE_CAMPAIGN)) {
        result[GROUND_REP] = Math.max(0, result[GROUND_REP] - is_event_active(events.INDEPENDENCE_CAMPAIGN))
        log(`-${is_event_active(events.INDEPENDENCE_CAMPAIGN)} AP ground replacement, Indian independence campaign (no commonwealth units could be replaced).`)
        G.events[events.INDEPENDENCE_CAMPAIGN.id] = 0
        L.INDEPENDENCE_CAMPAIGN = 1
    }
    return result
}

function get_S_P_replacement_points() {
    var result = []
    L.replacement_points = result
    if (G.active === JP) {
        result[NAVAl_REP] = G.reinforcements[NAVAl_REP]
        result[AIR_REP] = G.reinforcements[AIR_REP]
        L.divisions = Math.min(1, G.china_divisions)
        return result
    }
    L.divisions = undefined
    result[NAVAl_REP] = 1
    result[GROUND_REP] = 1
    result[AIR_REP] = 4
    return result
}

function get_B_F_W_replacement_points() {
    var result = []

    L.replacement_points = result
    if (G.active === JP) {
        //17.11.21. Japanese Replacements: Japanese begin the game with 2 air
        //replacements, 1 Ground taken from China per turn (optional)
        //plus Air steps per event card, no naval replacements
        result[NAVAl_REP] = 0
        result[AIR_REP] = G.reinforcements[AIR_REP]
        L.divisions = Math.min(1, G.china_divisions)
        return result
    }
    //17.11.20. Allied Replacements: 1 Commonwealth ground step per turn, 1
    //Chinese ground step on Game turns 7 and 9, 1 air step per turn,
    //one Naval on game turn 9
    L.divisions = undefined
    result[AIR_REP] = 1
    result[GROUND_REP] = 1
    if (G.turn === 9) {
        result[COMMONWEALTH_REP] = 1
        result[CHINESE_REP] = 1
    }
    if (is_event_active(events.INDEPENDENCE_CAMPAIGN)) {
        result[GROUND_REP] = Math.max(0, result[GROUND_REP] - is_event_active(events.INDEPENDENCE_CAMPAIGN))
        log(`-${is_event_active(events.INDEPENDENCE_CAMPAIGN)} AP ground replacement, Indian independence campaign (no commonwealth units could be replaced).`)
        G.events[events.INDEPENDENCE_CAMPAIGN.id] = 0
        L.INDEPENDENCE_CAMPAIGN = 1
    }
    return result
}

setup_original_control()

function setup_original_control() {
    SCENARIO_DATA.forEach(s => {
        G = {
            log: []
        }
        on_setup(s.name, {})
        s.original_control = []
        for (var i = 1; i < LAST_BOARD_HEX; i++) {
            if (is_controllable_hex(i)) {
                map_set(s.original_control, i, is_space_controlled(i, JP))
            }
        }
    })
    G = null
}

const BURMA_JAPANESE_OFF = [3, 8, 16, 40, 48, 50]

P.burma_choose_offensive = {
    _begin() {
        G.active = JP
        G.offensive.active_cards = []
        BURMA_JAPANESE_OFF.forEach(c => {
            c = find_card(JP, c)
            G.offensive.active_cards.push(c)
        })
    },
    prompt() {
        if (L.confirm_card) {
            prompt(`Confirm ` + card_get_log_str(L.confirm_card) + ` as Future Offensive?`)
            button("done")
        } else {
            prompt(`Choose Military Event to use as Future Offensive.`)
            BURMA_JAPANESE_OFF.forEach(c => {
                c = find_card(JP, c)
                if (!G.hand[JP].includes(c)) {
                    action_card(c)
                }
            })
        }
    },
    card(c) {
        push_undo()
        future_offencive_card(c, 5) //First turn is 6, card is playable immediatly so turn mark as being designated during turn 5
        L.confirm_card = c
    },
    done() {
        G.offensive.active_cards = []
        goto("offensive_phase")
    }
}

P.scenario_1941 = script(`
    log ("@Turn 1 - December 7, 1941")
    log ("#JJP Action. Operation Z")
    set G.active JP
    call operation_z
    eval {
        G.active = JP
        reset_offensive()
        G.offensive.attacker = JP
    }
    log ("#JJP Action. Operation No. 1")
    set G.offensive.stage ATTACK_STAGE
    call operation_no_1
    call activate_units
    call move_offensive_units
    call commit_offensive
    log ("#GOffensive reaction")
    set G.active AP
    call conquest_of_se_asia_reaction
    set G.offensive.stage BATTLE_STAGE
    set G.offensive.all_bh G.offensive.battle_hexes.slice()
    log ("#GResolve battles")
    log ("#IIntelligence condition: "+get_named_intelligence(G.offensive.intelligence))
    set G.active G.offensive.attacker
    call battle_sequence
    eval {
        capture_landing_hexes()
    }
    set G.offensive.stage POST_BATTLE_STAGE
    log ("#GPost battle movement")
    set G.active G.offensive.attacker
    call move_offensive_units
    set G.offensive.active_units[G.offensive.attacker] []
    call commit_offensive
    eval {
        reset_offensive()
        emergency_move_1942()
    }
    goto political_phase
    `)

P.operation_z = {
    _begin() {
    },
    inactive: "start a war",
    prompt() {
        if (G.hand[JP].length === 2) {
            prompt(`Play Operation Z.`)
            action_card(find_card(JP, 1))
        } else {
            prompt(`Move activated units.`)
            var hexes = [5506, 5507, 5508, 5509]
            hexes.forEach(h => action_hex(hex_to_int(h)))
        }
    },
    card(c) {
        push_undo()
        play_event(c)
        G.offensive.naval_move_distance = 18
        G.offensive.type = EC
        set_add(G.offensive.active_units[JP], find_piece("akagi"))
        set_add(G.offensive.active_units[JP], find_piece("soryu"))
        set_add(G.offensive.active_units[JP], find_piece("shokaku"))
        set_add(G.offensive.active_units[JP], find_piece("hiei"))
        log(`${list_get_log_str("Mobile Strike Force", G.offensive.active_units[JP].map(u => piece_get_log_str(u)))} activated.`)
    },
    action_hex(h) {
        push_undo()
        G.offensive.active_units[JP].forEach(u => {
            set_location(u, h, true)
        })
        log(`${list_get_log_str("Mobile Strike Force", G.offensive.active_units[JP].map(u => piece_get_log_str(u)))} moved to ${hex_get_log_str(h)}.`)
        create_battle_hex(OAHU)
        G.offensive.active_units[JP].forEach(u => commit_to_attack(u, OAHU))
        goto("operation_z_battle")
    },
}

P.operation_z_pbm = {
    _begin() {
        G.active_stack = G.offensive.active_units[JP]
        L.allowed_hexes = []
        update_move_hex()
    },
    inactive: "return units",
    prompt() {
        prompt(`${offensive_card_header()} Choose hex for post battle movement.`)
        L.allowed_hexes.forEach(h => action_hex(h))
    },
    action_hex(h) {
        push_undo()
        G.active_stack.forEach(u => {
            set_location(u, h, true)
            map_set(G.offensive.paths, u, map_get(L.allowed_hexes, h))
        })
        log(`${list_get_log_str("Mobile Strike Force", G.offensive.active_units[JP].map(u => piece_get_log_str(u)))} moved to ${hex_get_log_str(h)}.`)
        G.active_stack = []
        end()
    },
}

P.operation_z_battle = script(`
      call choose_battle
      call prepare_battle
      set G.offensive.battle.ground_stage 0
      call execute_attack {active: JP}
      call assign_hits
      set G.offensive.battle {}
      eval {
        change_political_will(8, "Operation Z")
      }
      log ("#GPost battle movement")
      set G.offensive.stage POST_BATTLE_STAGE
      eval {
        set_location(find_piece("lexington"), OAHU, true)
        set_location(find_piece("enterprise"), OAHU, true)
        log (piece_get_log_str(find_piece("lexington"))+", "+piece_get_log_str(find_piece("enterprise"))+" moved to "+hex_get_log_str(OAHU)+".")
      }
      set G.active JP
      call operation_z_pbm
      set G.offensive.active_units[G.offensive.attacker] []
      call commit_offensive
`)

P.operation_no_1 = {
    _begin() {

    },
    inactive: "start offensive",
    prompt() {
        prompt(`Play Operation No. 1.`)
        action_card(find_card(JP, 2))
    },
    card(c) {
        push_undo()
        play_event(c)
        G.offensive.type = EC
        G.offensive.intelligence = SURPRISE
        G.offensive.logistic = 20
        G.offensive.active_hq = [HQ_YAMAMOTO, HQ_SOUTH_SEAS, HQ_JP_SOUTH]
        end()
    },
}

P.scenario_1942 = script(`
    set G.active AP
    eval {
        emergency_move_1942()
    }
    call arcadia
    set G.active JP
    call japan_init_1942
    call offensive_phase
    `)

P.arcadia = {
    _begin() {
        draw_specific_card(find_card(AP, 4))
    },
    inactive: "apply card effect",
    prompt() {
        if (G.hand[AP].length === 1) {
            prompt(`Hold Arcadia or discard and replace with random card.`)
            action("hold", find_card(AP, 4))
            action("discard", find_card(AP, 4))
        } else {
            prompt(`Play Arcadia or pass.`)
            if (G.hand[AP].includes(find_card(AP, 4))) {
                action("event", find_card(AP, 4))
            }
            button("done")
        }
    },
    hold() {
        clear_undo()
        log(`AP chooses Arcadia +4 random cards.`)
        while (G.hand[AP].length < 5) {
            draw_card(AP)
        }
    },
    discard() {
        G.hand[AP] = []
        G.draw[AP].push(find_card(AP, 4))
        log(`AP chooses 5 random cards.`)
        clear_undo()
        while (G.hand[AP].length < 5) {
            draw_card(AP)
        }
        if (G.hand[AP].indexOf(find_card(AP, 4)) < 0) {
            end()
        }
    },
    event() {
        push_undo()
        G.offensive.offensive_card = find_card(AP, 4)
        play_event(G.offensive.offensive_card)
    },
    done() {
        end()
    }
}

function draw_hist_cards() {
    var hist = [find_card(JP, 3), find_card(JP, 47), find_card(JP, 59)]
    log(`JP draws historical hand ${hist.map(c => card_get_log_str(c)).join(", ")}.`)
    hist.forEach(c => draw_specific_card(c))
}

P.japan_init_1942 = {
    _begin() {
        if (G.options && G.options.historical) {
            draw_hist_cards()
            delete G.options['historical']
        }
        while (G.hand[JP].length < 7) {
            draw_card(JP)
        }
        if (G.hand[JP].filter(c => cards[c].type === MILITARY).length) {
            end()
        }
    },
    inactive: "choose card",
    prompt() {
        prompt(`Discard one card to draw JP 47: VADM Kondo or pass.`)
        if (G.hand[JP].includes(find_card(JP, 47))) {
            button("done")
        } else {
            var has_3_ops = G.hand[JP].filter(c => cards[c].ops >= 3).length
            G.hand[JP].filter(c => cards[c].ops >= 3 || !has_3_ops).forEach(c => action_card(c))
            button("skip")
        }
    },
    card(c) {
        push_undo()
        discard_card(c)
        log(`JP discard ${card_get_log_str(c)} and draw ${card_get_log_str(find_card(JP, 47))}.`)
        draw_specific_card(find_card(JP, 47))
    },
    skip() {
        push_undo()
        end()
    },
    done() {
        push_undo()
        end()
    }
}

SCENARIO_DATA[SOUTH_PACIFIC_SCENARIO].before_commit_offensive = function () {
    if (G.turn === 3 && (set_has(G.offensive.battle_hexes, TRUK) ||
        set_has(G.offensive.landing_hexes, TRUK) || is_faction_units(TRUK, AP))) {
        return "The Allied player cannot declare Truk a battle hex during game turn 3."
    }

}

SCENARIO_DATA[SOUTH_PACIFIC_SCENARIO].before_unit_activation = function () {
    if (G.turn === 3) {
        filter_activation_units((u) => G.location[u] !== TRUK, JP)
    }
    if (G.offensive.active_hq[G.active] === HQ_CENTRAL_PACIFIC) {
        filter_activation_units((u) => G.location[u] === OAHU || get_map_data(G.location[u]).region === "Hebrides", AP)
    }
}

SCENARIO_DATA[SOUTH_PACIFIC_SCENARIO].before_choose_hq = function () {
    if (G.offensive.attacker === JP && G.offensive.battle_hexes.filter(h => get_map_data(h).region === "Hebrides").length <= 0) {
        array_delete_item(L.possible_units, HQ_CENTRAL_PACIFIC)
    }
}

SCENARIO_DATA[BURMA_SCENARIO].before_commit_offensive = function () {
    // 17.11.9
    if (set_has(G.offensive.battle_hexes, SAIGON)) {
        // Saigon should not be able to be attacked due to 17.11.1, but putting a check here just in case
        return "HQs cannot be attacked or removed from play (by either player) for any reason."
    }
}

SCENARIO_DATA[BURMA_SCENARIO].before_unit_activation = function () {
    filter_activation_units((u) => G.location[u] !== SINGAPORE || pieces[u].class !== "naval"
        || G.offensive.stage === ATTACK_STAGE && G.offensive.type === EC && G.offensive.offensive_card === OPERATION_C, JP)
}