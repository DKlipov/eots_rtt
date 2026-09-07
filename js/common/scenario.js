const S_P_DECK = S_P_deck()
const B_F_W_DECK = B_F_W_deck()

const SCENARIO_DATA = [
    {
        id: SOUTH_PACIFIC_SCENARIO,
        name: "South Pacific",
        victory: victory_south_pacific,
        has_card: c => set_has(S_P_DECK, c),
        last_turn: 6
    },
    {
        id: FULL_CAMPAIGN_SCENARIO,
        name: "1941-1945 (The Full Campaign)",
        victory: victory_1945,
        last_turn: 12
    },
    {
        id: SHORT_CAMPAIGN_SCENARIO,
        name: "1942-1945 (The Shortened Campaign)",
        victory: victory_1945,
        last_turn: 12
    },
    {
        id: EVEN_SHORT_CAMPAIGN_SCENARIO,
        name: "1943-1945 (The Even Shorter Campaign)",
        victory: victory_1945,
        last_turn: 12
    },
    {
        id: YEAR_1942_SCENARIO,
        name: "1942 One Year Scenario",
        victory: victory_1942,
        one_year: true,
        last_turn: 4
    },
    {
        id: YEAR_1943_SCENARIO,
        name: "1943 One Year Scenario",
        victory: victory_1943,
        one_year: true,
        last_turn: 7
    },
    {
        id: 9,
        name: "1944 One Year Scenario",
        victory: victory_1944,
        one_year: true,
        last_turn: 10
    },
    {
        id: YEAR_1942_1943_SCENARIO,
        name: "1942-1943 Two Year Scenario",
        victory: victory_1943,
        last_turn: 7
    },
    {id: 7, name: "1943-1944 Two Year Scenario", victory: victory_1944, last_turn: 10},
    {id: 4, name: "1942-1944 Three Year Scenario", victory: victory_1944, last_turn: 10},
    {
        id: BURMA_SCENARIO,
        name: "Burma: The Forgotten War, 1943-1944",
        has_card: c => set_has(B_F_W_DECK, c),
        victory: victory_burma,
        last_turn: 9
    },
]

SCENARIO_DATA.forEach(s => {
    if (!s.has_card) {
        s.has_card = a => true
    }
    s.removed_cards = []
})

SCENARIO_DATA.sort((a, b) => a.id - b.id)

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

function victory_burma() {
    var result = {
        vp: 0,
        text: [],
        won_side: "",
        won_text: "",
    }

    //A. China track: +1 VP per box left or –1 per box right of the Major
    // Breakthrough Box. If China Surrenders, receive a bonus +3
    // victory points for a total of +5 VP and the China track can no
    // longer be altered for the rest of the game.
    adjust_vp(result, G.surrender[nations.CHINA.id] - 2, "China government status")
    if (G.surrender[nations.CHINA.id] > 5) {
        result.vp += 3
        result.text.push(`+3 VP - China surrendered.`)
    }
    if (G.burma_road >= 1) {
        //B. Burma Road is closed: +3 VP
        result.vp += 3
        result.text.push(`3 VP - Burma Road is closed.`)
    } else {
        //C. Burma Road is open: –1 VP
        result.vp -= 1
        result.text.push(`-1 VP - Burma Road is open.`)
    }
    //D. For each box US Political Will is below 4: +1 per box. Example,
    //a US Political Will of 3 equals +1 VP. Cumulative with Victory
    //Condition E.
    if (G.political_will < 4) {
        result.vp += 4 - G.political_will
        result.text.push(`+${4 - G.political_will} VP - Political will.`)
    } else {
        result.text.push(`0 VP - Political will >= 4.`)
    }
    //E. War in Europe: +1 VP if WiE is a negative number (not zero) or
    //–1 if WiE is a positive number (not zero). If zero, 0 VP.
    if (G.wie <= 2) {
        result.vp -= 1
        result.text.push(`-1 VP - War in Europe > 0`)
    } else if (G.wie > 3) {
        result.vp += 1
        result.text.push(`1 VP - War in Europe < 0`)
    }
    //F. For controlling each hex of Northern India, +1 VP per hex
    var india = nations.INDIA.keys.map(i => hex_to_int(i)).filter(i => is_space_controlled(i, JP)).length
    adjust_vp(result, india, "JP controlled hexes of Northern India", nations.INDIA.keys.map(i => hex_to_int(i)))
    //G. For India Unrest or Strikes, +1 Victory Point (awarded on the last game turn)
    var india_status = G.surrender[nations.INDIA.id]
    if (india_status > 0 && india_status <= 2) {
        result.vp += 1
        result.text.push(`+1 VP - India ${nations.INDIA.statuses[india_status]}.`)
        //H. For India Unstable, Revolts, or Surrender; +2 VPs (awarded on the last game turn).
    } else if (india_status > 0) {
        result.vp += 2
        result.text.push(`+2 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else {
        result.text.push(`0 VP - India ${nations.INDIA.statuses[india_status]}.`)
    }
    //I. Rangoon is Allied Control: –2 VP (no additional VPs for theResource hex).
    if (is_space_controlled(RANGOON, AP)) {
        result.vp -= 2
        result.text.push(`-2 VP - Rangoon is AP Control.`)
        //J. Rangoon is Japanese Control: +2 VP
    } else {
        result.vp += 2
        result.text.push(`2 VP - Rangoon is JP Control.`)
    }
    //K. If the Allies are under ISR at the end of the game +1 VP.
    if (G.inter_service[AP]) {
        result.vp += 1
        result.text.push(`1 VP - AP are under ISR.`)
    }
    //L. If the Japanese are under ISR at the end of the game –1 VP
    if (G.inter_service[JP]) {
        result.vp -= 1
        result.text.push(`-1 VP - JP are under ISR.`)
    }

    return result
}

function victory_1942() {
    var hawaii = [hex_to_int(5708), hex_to_int(5808), hex_to_int(5908)]
    hawaii.forEach(h => {
        if (is_faction_units(h, JP)) {
            set_add(G.captured_once, h)
        }
    })
    var result = {
        vp: 0,
        text: [],
        won_side: "",
        won_text: "",
    }
    adjust_vp(result, G.surrender[nations.CHINA.id], "China Government Front Status")
    if (G.surrender[nations.CHINA.id] > 5) {
        result.vp += 5
        result.text.push(`+5 VP - China surrendered`)
    }
    binary_vp(result, G.burma_road >= 1, 1, "The Burma Road is closed", `The Burma Road is open`)
    binary_vp(result, !check_supply_line(hex_to_int(3727), OAHU, AP), 5, "Townsville isolated from Oahu",
        "Townsville was not isolated", [hex_to_int(3727), OAHU])

    var india = nations.INDIA.keys.map(i => hex_to_int(i)).filter(i => is_space_controlled(i, JP)).length
    adjust_vp(result, india, "JP controlled hexes of Northern India", nations.INDIA.keys.map(i => hex_to_int(i)))
    var india_status = G.surrender[nations.INDIA.id]
    if (india_status > 0 && india_status <= 2) {
        result.vp += 1
        result.text.push(`+1 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else if (india_status > 0) {
        result.vp += 2
        result.text.push(`+2 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else {
        result.text.push(`0 VP - India ${nations.INDIA.statuses[india_status]}.`)
    }
    binary_vp(result, G.surrender[nations.AUSTRALIAN_MANDATES.id], 1, "JP Control of Australian Mandates", `AP Control of Australian Mandates`)
    var new_guinea = 0
    nations.NEW_GUINEA.keys.map(k=>hex_to_int(k)).forEach(h => {
        if (is_space_controlled(h, JP) && get_map_data(h).port && get_map_data(h).region === "Guinea") {
            new_guinea++
        }
    })
    binary_vp(result, new_guinea >= 4, 2, `JP Control of ${new_guinea} >= 4 New Guinea ports`,
        `JP Control of ${new_guinea} < 4 New Guinea ports`, nations.NEW_GUINEA.keys.map(h => hex_to_int(h)).filter(h => h !== VOGELKOP))
    if (G.political_will <= 5) {
        result.vp += 6 - G.political_will
        result.text.push(`+${6 - G.political_will} VP - Political will`)
    } else if (G.political_will >= 6) {
        result.vp -= G.political_will - 5
        result.text.push(`-${G.political_will - 5} VP - Political will`)
    }

    binary_vp(result, set_has(G.captured_once, OAHU), 3, `Oahu was captured`,
        "Oahu was not captured")
    binary_vp(result, set_has(G.captured_once, hex_to_int(5708)), 1, `Kauai was captured`,
        "Kauai was not captured")
    binary_vp(result, set_has(G.captured_once, hex_to_int(5908)), 1, `Hawaii was captured`,
        "Hawaii was not captured")
    binary_vp(result, is_space_controlled(hex_to_int(5108), JP) && is_faction_units(hex_to_int(5108), JP), 1,
        `Midway was captured`,
        "Midway was not captured", [hex_to_int(5108)])
    binary_vp(result, is_space_controlled(hex_to_int(4612), JP) && is_faction_units(hex_to_int(4612), JP), 1,
        `Wake island was captured`,
        "Wake island was not captured", [hex_to_int(4612)])
    binary_vp(result, is_space_controlled(ATTU, JP), 1,
        `Attu/Kiska was captured`,
        "Attu/Kiska was not captured", [ATTU])
    binary_vp(result, is_space_controlled(hex_to_int(5100), JP), 1,
        `Dutch Harbor was captured`,
        "Dutch Harbor was not captured", [hex_to_int(5100)])
    binary_vp(result, get_jp_resources() <= 12, -3,
        `Japan control 12 resource hexes or less`,
        "Japan control more than 12 resource hexes", RESOURCE_HEX)
    if (get_jp_resources() < 12) {
        result.won_side = "Allies"
        result.won_text = "Japan captured less than 12 resource hexes"
    }
    return result
}

function check_supply_line(hex1, hex2, faction) {
    var queue = [hex1]
    const overland_set = []
    const oversea_set = []
    if (!is_space_controlled(hex1, faction) || !is_space_controlled(hex2, faction)) {
        return false
    }
    if (get_map_data(hex1).terrain > OCEAN) {
        overland_set.push(hex1)
    }
    if (get_map_data(hex1).coastal) {
        oversea_set.push(hex1)
    }
    for (var i = 0; i < queue.length; i++) {
        var item = queue[i]
        var nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        const overland = set_has(overland_set, item)
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const enemy_port_s = (MD.port && is_space_controlled(item, 1 - faction))
        const occupied_land_s = G.supply_cache[item] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[item] & JP_GAH_UNITS << faction)
        const oversea = set_has(oversea_set, item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            var reachable = false
            const enemy_port = enemy_port_s || (MD.port && is_space_controlled(nh, 1 - faction))
            const occupied_land = occupied_land_s || G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (!set_has(overland_set, nh) && (overland || (MD.port && !enemy_port)) && MD.edges_int & GROUND << 5 * j && !occupied_land) {
                reachable = true
                set_add(overland_set, nh)
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!set_has(oversea_set, nh) && (oversea || (MD.port && !enemy_port)) && MD.edges_int & WATER << 5 * j && !non_neutral_zoi) {
                reachable = true
                set_add(oversea_set, nh)
            }
            if (reachable) {
                if (nh === hex2) {
                    return true
                }
                queue.push(nh)
            }
        }
    }
    return false
}

function victory_1943() {
    var hawaii = [hex_to_int(5708), hex_to_int(5808), hex_to_int(5908)]
    hawaii.forEach(h => {
        if (is_faction_units(h, JP)) {
            set_add(G.captured_once, h)
        }
    })
    var result = {
        vp: 0,
        text: [],
        won_side: "",
        won_text: "",
    }
    binary_vp(result, G.surrender[nations.CHINA.id] >= 5, 5, "China surrendered", `China did not surrender`)
    binary_vp(result, G.burma_road >= 1, 1, "The Burma Road is closed", `The Burma Road is open`)
    binary_vp(result, !check_supply_line(hex_to_int(3727), OAHU, AP), 5, "Townsville isolated from Oahu",
        "Townsville was not isolated", [hex_to_int(3727), OAHU])

    var india = nations.INDIA.keys.map(i => hex_to_int(i)).filter(i => is_space_controlled(i, JP)).length
    adjust_vp(result, india, "JP controlled hexes of Northern India", nations.INDIA.keys.map(i => hex_to_int(i)))
    var india_status = G.surrender[nations.INDIA.id]
    if (india_status > 0 && india_status <= 2) {
        result.vp += 1
        result.text.push(`+1 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else if (india_status > 0) {
        result.vp += 2
        result.text.push(`+2 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else {
        result.text.push(`0 VP - India ${nations.INDIA.statuses[india_status]}.`)
    }
    var mandate_diff = 0
    if (G.surrender[nations.AUSTRALIAN_MANDATES.id]) {
        mandate_diff = 3
    } else {
        mandate_diff = -3
    }
    adjust_vp(result, mandate_diff, "JP Control of Australian Mandates")
    if (!G.surrender[nations.AUSTRALIAN_MANDATES.id]) {
        var mandate_count = 0
        var mandate_hexes = []
        for_each_hex_in_range(RABAUL, 5, h => {
            if (get_map_data(h).region === "AMandates") {
                mandate_hexes.push(h)
            }
            if (is_space_controlled(h, AP) && get_map_data(h).region === "AMandates") {
                mandate_count++
            }
        })
        binary_vp(result, mandate_count >= 4,
            -1, "AP control more than 3 Australian Mandate hexes", `AP do not control 4 Australian Mandate hexes`,
            mandate_hexes
        )
    }
    if (G.political_will <= 5) {
        result.vp += 6 - G.political_will
        result.text.push(`+${6 - G.political_will} VP - Political will`)
    } else if (G.political_will >= 6) {
        result.vp -= G.political_will - 5
        result.text.push(`-${G.political_will - 5} VP - Political will`)
    }
    binary_vp(result, set_has(G.captured_once, OAHU), 3, `Oahu was captured`,
        "Oahu was not captured")
    binary_vp(result, set_has(G.captured_once, hex_to_int(5708)), 1, `Kauai was captured`,
        "Kauai was not captured")
    binary_vp(result, set_has(G.captured_once, hex_to_int(5908)), 1, `Hawaii was captured`,
        "Hawaii was not captured")
    binary_vp(result, check_nation_controlled(nations.MARSHALL, AP),
        -3, "AP control Marshall Islands", `AP do not control Marshall Islands`,
        nations.MARSHALL.keys.map(h => hex_to_int(h))
    )
    var ng_ap = check_nation_controlled(nations.NEW_GUINEA, AP)
    binary_vp(result, ng_ap,
        -3, "AP control New Guinea", `AP do not control New Guinea`,
        nations.NEW_GUINEA.keys.map(h => hex_to_int(h))
    )
    if (!ng_ap) {
        var new_guinea =
            nations.NEW_GUINEA.keys.map(k => hex_to_int(k)).filter(h => get_map_data(h).port && is_space_controlled(h, AP)).length
        binary_vp(result, new_guinea >= 4, -1, `AP Control of ${new_guinea} >= 4 New Guinea ports`,
            `AP Control of ${new_guinea} < 4 New Guinea ports`, nations.NEW_GUINEA.keys.map(h => hex_to_int(h)).filter(h => h !== VOGELKOP))
    }
    var tokyo_ports = 0
    var tokyo_ports_list = []
    for_each_hex_in_range(TOKYO, 11, h => {
        if (!get_map_data(h).port) {
            return
        }
        tokyo_ports_list.push(h)
        if ((is_space_controlled(h, AP))) {
            tokyo_ports++
        }
    })
    binary_vp(result, tokyo_ports, -3, `AP control a port that is 11 or less hexes from Tokyo`,
        `AP do not control a port that is 11 or less hexes from Tokyo`,
        tokyo_ports_list)
    adjust_vp(result, 14 - get_jp_resources(), "AP controlled resource hexes",
        RESOURCE_HEX)
    return result
}

function victory_1944() {
    var hawaii = [hex_to_int(5708), hex_to_int(5808), hex_to_int(5908)]
    hawaii.forEach(h => {
        if (is_faction_units(h, JP)) {
            set_add(G.captured_once, h)
        }
    })
    var result = {
        vp: 0,
        text: [],
        won_side: "",
        won_text: "",
    }
    binary_vp(result, G.surrender[nations.CHINA.id] >= 5, 5, "China surrendered", `China did not surrender`)
    binary_vp(result, G.burma_road >= 1, 1, "The Burma Road is closed", `The Burma Road is open`)
    binary_vp(result, !check_supply_line(hex_to_int(3727), OAHU, AP), 5, "Townsville isolated from Oahu",
        "Townsville was not isolated", [hex_to_int(3727), OAHU])

    var india = nations.INDIA.keys.map(i => hex_to_int(i)).filter(i => is_space_controlled(i, JP)).length
    adjust_vp(result, india, "JP controlled hexes of Northern India", nations.INDIA.keys.map(i => hex_to_int(i)))
    var india_status = G.surrender[nations.INDIA.id]
    if (india_status > 0 && india_status <= 2) {
        result.vp += 1
        result.text.push(`+1 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else if (india_status > 0) {
        result.vp += 2
        result.text.push(`+2 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else {
        result.text.push(`0 VP - India ${nations.INDIA.statuses[india_status]}.`)
    }
    binary_vp(result, G.surrender[nations.AUSTRALIAN_MANDATES.id], 1, "JP Control of the Australian Mandates",
        "JP don't control the Australian Mandates")
    if (G.political_will <= 5) {
        result.vp += 6 - G.political_will
        result.text.push(`+${6 - G.political_will} VP - Political will`)
    } else if (G.political_will >= 6) {
        result.vp -= G.political_will - 5
        result.text.push(`-${G.political_will - 5} VP - Political will`)
    }
    binary_vp(result, set_has(G.captured_once, OAHU), 3, `Oahu was captured`,
        "Oahu was not captured")
    var ng_diff = 0
    if (check_nation_controlled(nations.NEW_GUINEA, JP)) {
        ng_diff = 5
    } else if (!check_nation_controlled(nations.NEW_GUINEA, AP)) {
        ng_diff = 3
    }
    adjust_vp(result, ng_diff, "Control of New Guinea (JP: +5 / Neither: +3 / AP: 0)",
        nations.NEW_GUINEA.keys.map(h => hex_to_int(h)))
    binary_vp(result, is_space_controlled(RABAUL, JP) && (G.supply_cache[RABAUL] & JP_SUPPLIED_HEX), 3,
        "Rabaul is JP controlled and supplied",
        `Rabaul is ${is_space_controlled(RABAUL, AP) ? "AP controlled" : "out of supply"}`)

    var philipine_ports = [MANILA, hex_to_int(3014), hex_to_int(2915), hex_to_int(2715)]
    var pp = philipine_ports.filter(h => is_space_controlled(h, AP) && (G.supply_cache[h] & AP_SUPPLIED_HEX)).length
    var phillipine_diff = 0
    if (pp === 0) {
        phillipine_diff = 5
    } else if (pp === 1) {
        phillipine_diff = 3
    } else if (pp >= 2) {
        phillipine_diff = 0
    }
    adjust_vp(result, phillipine_diff, "AP Control of Philippines ports (0: +5 / 1: +3 / 2+: 0) ",
        philipine_ports)

    var tokyo_ports = 0
    var tokyo_ports_list = []
    for_each_hex_in_range(TOKYO, 8, h => {
        if (!get_map_data(h).port) {
            return
        }
        tokyo_ports_list.push(h)
        if ((is_space_controlled(h, AP))) {
            tokyo_ports++
        }
    })
    binary_vp(result, tokyo_ports <= 0, 5, `AP do not control a port that is 8 or less hexes from Tokyo`,
        `AP control a port that is 8 or less hexes from Tokyo`,
        tokyo_ports_list)
    return result
}

// 伊拉斯谟图表 09「原子弹战略标准」。
// Erasmus chart 09 "Atomic Bomb Strategy" standard.
// STRAT_BOMBING_CAMPAIGN 保存当前连续成功轰炸序列的起始回合：从第 9 回合到当前回合
// 每回合至少成功一次时，其值恒为 9；任一回合失败/未轰炸会清零，之后再成功则会以更晚
// 回合重新起算。
// STRAT_BOMBING_CAMPAIGN records the start turn of the current streak of successful
// strategic bombing runs: if every turn from 9 through the current turn succeeds, it
// stays 9; any failure/absence resets it, and a later success restarts from a later turn.
//
// 此函数是引擎和机器人共用的唯一判据，避免 bot 缓存与存档/回放结算发生分歧。
// This is the single criterion shared by the engine and the bot, so the bot's cached
// judgment never diverges from save/replay settlement.
function atomic_bomb_strategy_status() {
    var campaign_start = is_event_active(events.STRAT_BOMBING_CAMPAIGN) || 0
    var bombing_required = G.turn >= 9
    var no_strategic_bombing_failure = !bombing_required || campaign_start === 9
    var soviet_occurred = !!(G.removed && G.removed[AP] && set_has(G.removed[AP], SOVIET_INVADE))
    var soviet_in_hand = !!(G.hand && G.hand[AP] && set_has(G.hand[AP], SOVIET_INVADE))
    var soviet_playable = false
    if (!soviet_occurred && soviet_in_hand) {
        try { soviet_playable = !!cards[SOVIET_INVADE].can_play() } catch (e) { /* false */ }
    }
    // get_victory() 会临时按补给重算控制。原子弹图表使用棋盘上实际控制权，因此结算期间
    // 必须读取重算前保存在 G.original_control 的状态，才能与回合内 AI 谓词完全一致。
    // get_victory() temporarily recomputes control by supply. The atomic-bomb chart uses
    // actual board control, so during settlement we must read the pre-recompute state saved
    // in G.original_control to stay consistent with the in-turn AI predicates.
    var jp_controls = h => G.original_control ? is_space_controlled_originally(h, JP) : is_space_controlled(h, JP)
    var jp_resource_hexes = RESOURCE_HEX.filter(h => jp_controls(h) && get_map_data(h).resource)
    var jp_resources = jp_resource_hexes.length
    var resource_limit = soviet_occurred ? 3 : 5
    var soviet_ready = soviet_occurred || soviet_playable
    return {
        met: no_strategic_bombing_failure && soviet_ready && jp_resources <= resource_limit,
        turn: G.turn,
        noStrategicBombingFailure: no_strategic_bombing_failure,
        bombingCampaignStart: campaign_start,
        bombingRequiredFromTurn: 9,
        sovietOccurred: soviet_occurred,
        sovietCardId: SOVIET_INVADE,
        sovietInHand: soviet_in_hand,
        sovietPlayable: soviet_playable,
        sovietReady: soviet_ready,
        jpResources: jp_resources,
        jpResourceHexes: jp_resource_hexes,
        resourceLimit: resource_limit,
        resourcesSatisfied: jp_resources <= resource_limit,
    }
}

function victory_1945() {
    var japan_surrenders = is_event_active(events.STRAT_BOMBING_CAMPAIGN) > 0 && is_event_active(events.STRAT_BOMBING_CAMPAIGN) <= 9
        && get_jp_resources() <= 1 && (get_distance(G.location[B_29_1], TOKYO) <= 6 || G.location[B_29_1] === CHINA_BOX
            || get_distance(G.location[B_29_2], TOKYO) <= 6 || G.location[B_29_2] === CHINA_BOX)
    var result = {
        vp: 0,
        text: [],
        won_side: "",
        won_text: "",
    }
    if (japan_surrenders) {
        result.won_side = "Allies"
        result.won_text = `Japan surrenders by strategic bombing campaign`
        finish("Allies", "Japan surrenders by strategic bombing campaign")
    } else {
        result.won_side = "Japan"
        result.won_text = `Japan did not surrender`
    }
    return result
}

function adjust_vp(result, diff, message, hex_control) {
    result.text.push(`${diff > 0 ? "+" : ""}${diff} VP - ${message}${get_hex_control_log(hex_control)}.`)
    result.vp += diff
}

function get_hex_control_log(hex_control) {
    var ap = []
    var jp = []
    if (!hex_control) {
        return ""
    }
    hex_control.forEach(h => {
        var or = is_space_controlled_originally(h, JP)
        var curr = is_space_controlled(h, JP)
        if ((or !== curr) && or) {
            ap.push(h)
        } else if (or !== curr) {
            jp.push(h)
        }

    })
    var hex_log = " (Unsupplied hexes count as "
    if (ap.length > 0) {
        hex_log += "AP control: " + ap.map(h => hex_get_log_str(h)).join(", ")
        if (jp.length > 0) {
            hex_log += ", "
        }
    }
    if (jp.length > 0) {
        hex_log += "JP control: " + jp.map(h => hex_get_log_str(h)).join(", ")
    }
    hex_log += ")"
    if (ap.length === 0 && jp.length === 0) {
        return ""
    }
    return hex_log
}

function binary_vp(result, condition, diff, message_true, message_false, hex_control) {
    if (condition) {
        result.text.push(`${diff > 0 ? "+" : ""}${diff} VP - ${message_true}${get_hex_control_log(hex_control)}.`)
        result.vp += diff
    } else {
        result.text.push(`0 VP - ${message_false}${get_hex_control_log(hex_control)}.`)
    }

}

function victory_south_pacific() {
    var result = {
        vp: 0,
        text: [],
        won_side: "",
        won_text: "",
    }

    if (G.surrender[nations.CHINA.id] === 5) {
        result.vp += 5
        result.text.push(`+5 VP - China surrendered.`)
    } else {
        adjust_vp(result, G.surrender[nations.CHINA.id] - 2, "China Government Front Status")
    }
    binary_vp(result, !check_supply_line(hex_to_int(3727), OAHU, AP), 5, "Townsville isolated from Oahu",
        "Townsville was not isolated", [hex_to_int(3727), OAHU])

    if (G.political_will < 4) {
        result.vp += 4 - G.political_will
        result.text.push(`+${4 - G.political_will} VP - Political will.`)
    } else {
        result.text.push(`0 VP - Political will >= 4.`)
    }
    var amh = 0
    nations.AUSTRALIAN_MANDATES.ports.forEach(hex => {
        var h = hex_to_int(hex)
        if (is_space_controlled(h, JP) && get_map_data(h).port) {
            amh++
        }
    })
    adjust_vp(result, amh, "JP control of Australian Mandates ports", nations.AUSTRALIAN_MANDATES.ports.map(h => hex_to_int(h)))
    if (nations.AUSTRALIAN_MANDATES.ports.filter(h => !is_space_controlled(hex_to_int(h), JP)).length === 0) {
        result.vp += 3
        result.text.push(`+3 VP - JP control of Australian Mandates.`)
    } else if (nations.AUSTRALIAN_MANDATES.ports.filter(h => !is_space_controlled(hex_to_int(h), AP)).length === 0) {
        result.vp -= 3
        result.text.push(`-3 VP - AP control of Australian Mandates.`)
    } else {
        result.text.push(`0 VP -  No one controls the Australian Mandates.`)
    }
    var new_guinea = 0
    nations.NEW_GUINEA.keys.forEach(hex => {
        var h = hex_to_int(hex)
        if (is_space_controlled(h, JP) && get_map_data(h).port) {
            new_guinea++
        }
    })
    adjust_vp(result, new_guinea, "JP control of New Guinea ports", nations.NEW_GUINEA.keys.map(h => hex_to_int(h)).filter(h => h !== VOGELKOP))
    binary_vp(result, is_space_controlled(VOGELKOP, AP), -1, "AP control of Vogelkop",
        "JP control of Vogelkop", [VOGELKOP])
    if (check_nation_controlled(nations.NEW_GUINEA, JP)) {
        result.vp += 3
        result.text.push(`+3 VP - JP control of New Guinea.`)
    } else if (check_nation_controlled(nations.NEW_GUINEA, AP)) {
        result.vp -= 3
        result.text.push(`-3 VP - AP control of New Guinea.`)
    } else {
        result.text.push(`0 VP - No one controls New Guinea.`)
    }
    var heb = NEW_HEBRIDES.filter(h => is_space_controlled(h, JP) && get_map_data(h).port).length
    binary_vp(result, heb, 1, "JP control of New Hebrides port",
        "No JP control of any New Hebrides port", NEW_HEBRIDES.filter(h => is_space_controlled(h, JP)))
    var aus = nations.AUSTRALIA.keys.map(k => hex_to_int(k)).filter(h => is_space_controlled(h, JP) && get_map_data(h).port).length
    binary_vp(result, aus, 1, "JP control of Australia mainland port",
        "No JP control of any Australia mainland port", nations.AUSTRALIA.keys.map(k => hex_to_int(k)).filter(h => is_space_controlled(h, JP)))
    return result
}

function is_space_controlled_originally(hex, faction) {
    return (!(G.original_control[hex] & JP_CONTROLLED) == faction) && (!G.non_control || !set_has(G.non_control, hex))
}

function set_supply_control() {
    var data = scenario_data()
    G.original_control = G.supply_cache
    G.supply_cache = object_copy(G.supply_cache)
    check_supply()
    L.supply = {}
    HQ_LIST.forEach(hq => {
        if (G.location[hq] >= LAST_BOARD_HEX) {
            return
        }
        if (!set_has(G.oos, hq)) {
            mark_hexes_supplied_from([hq], is_controllable_hex)
        }
    })
    if (G.burma_road < 2) {
        mark_hexes_supplied_kunming()
    }
    for (var i = 0; i < data.original_control.length; i += 2) {
        var hex = data.original_control[i]
        var orig = data.original_control[i + 1]
        var supply = is_space_controlled(hex, JP) ? JP_SUPPLIED_HEX : AP_SUPPLIED_HEX
        if (!(G.supply_cache[hex] & supply)) {
            G.supply_cache[hex] &= ~JP_CONTROLLED
            if (orig) {
                G.supply_cache[hex] |= JP_CONTROLLED
            }
        }
    }
    L.supply = 0
}

function restore_original_control() {
    G.supply_cache = G.original_control
    delete G.original_control
}

function get_victory() {
    var data = scenario_data()
    set_supply_control()
    var vp = data.victory()
    if (!vp.won_side && vp.vp <= 2) {
        vp.won_side = "Allies"
        vp.won_text = `Allied Decisive Victory`
    } else if (!vp.won_side && vp.vp <= (G.sid != BURMA_SCENARIO ? 5 : 4)) {
        vp.won_side = "Allies"
        vp.won_text = `Allied Tactical Victory`
    } else if (!vp.won_side && vp.vp <= (G.sid != BURMA_SCENARIO ? 9 : 8)) {
        vp.won_side = "Japan"
        vp.won_text = `Japanese Tactical Victory`
    } else if (!vp.won_side) {
        vp.won_side = "Japan"
        vp.won_text = `Japanese Decisive Victory`
    }
    restore_original_control()
    return vp
}

function before_victory_check() {
    // 17.11.23. Progress of the War (PoW): Ignore the normal PoW rules. IfExpand commentComment on line R7494Resolved
    //   the Allies do not capture at least one hex at the conclusion of
    //   the game that began the game controlled by the Japanese, minus
    //   1 US Political Will.

    let no_capture = true
    for (var i = 1; i < LAST_BOARD_HEX; i++) {
        var hex_data = get_map_data(i)
        // only hex 2006 begins with allied control
        // we only check for burma as this is the only region the AP player can potentially take hexes from the JP player
        // due to 17.11.1
        if (!nations.BURMA.regions.includes(hex_data.region) || hex_data.id === 2006) {
            continue
        }
        if (is_space_controlled(hex_to_int(hex_data.id), AP)) {
            no_capture = false
            break;
        }
    }
    if (no_capture) {
        change_political_will(-1, "no AP control of any hex originally controlled by the JP");
    }
    //17.11.26. At the end of the game if the War in Europe is in a box with a
    //negative number the US PW is reduced by one prior to scoring.
    //If positive, the US PW is increased by one. If zero, no effect
    if (G.wie <= 2) {
        change_political_will(1, "War in Europe positive")
    } else if (G.wie > 3) {
        change_political_will(-1, "War in Europe negative")
    }
}

function victory_check() {
    if (G.political_will <= 0) {
        finish("Japan", "Japanese Victory by Treaty Negotiations")
    }
    if (G.sid == BURMA_SCENARIO && scenario_data().last_turn <= G.turn) {
        before_victory_check()
    }
    var vp = get_victory()
    if (scenario_data().last_turn <= G.turn && G.turn < 12) {
        log("#GVP Scoring")
        vp.text.forEach(t => log(t))
        log(`#GTotal VP: ${vp.vp}`)
    }
    if (scenario_data().last_turn <= G.turn) {
        finish(vp.won_side, vp.won_text)
    }
}

function check_nation_controlled(nation, faction) {
    for (var i = 0; i < nation.keys.length; i++) {
        if (is_space_controlled(hex_to_int(nation.keys[i]), 1 - faction)) {
            return false
        }
    }
    return true
}