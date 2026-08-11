const JP = 0
const AP = 1

const SEASONS = ["Jan-Apr", "May-Aug", "Sep-Dec"]

//cards
const EC = 0 //Event card
const OC = 1 //Offensive card

//replacements
const NAVAl_REP = 0
const AIR_REP = 1
const GROUND_REP = 2
const CHINESE_REP = 3
const COMMONWEALTH_REP = 4

//card types
const POLITICAL = 1
const RESOURCE = 2
const COUNTER_OFFENSIVE = 3
const MILITARY = 4
const INTELLIGENCE = 5
const REACTION = 6
const CANCEL = 7

//reaction types
const BEFORE_COMBAT = 1
const AFTER_COMBAT = 2

//Move types
const ANY_MOVE = 0
const STRAT_MOVE = 1 << 0
const NAVAL_MOVE = 1 << 1
const GROUND_MOVE = 1 << 2
const AMPH_MOVE = 1 << 3
const AIR_STRAT_MOVE = 1 << 4
const AIR_MOVE = 1 << 5
const BARGES_MOVE = 1 << 6
const POST_BATTLE_MOVE = 1 << 7
const REACTION_MOVE = 1 << 8
const AIR_EXTENDED_MOVE = 1 << 9
const AVOID_ZOI = 1 << 11
const ORGANIC_ONLY = 1 << 12
const GROUND_DISENGAGEMENT = 1 << 13
const MANUAL_MOVEMENT = 1 << 14

//Offensive stages
const EVENT_STAGE = 13
const ATTACK_STAGE = 1 << 10
const REACTION_STAGE = REACTION_MOVE
const BATTLE_STAGE = 2
const POST_BATTLE_STAGE = POST_BATTLE_MOVE
const EMERGENCY_STAGE = 14

//Intelligence
const SURPRISE = 1
const INTERCEPT = 2
const AMBUSH = 3

//hex data
const CITY = 1
const JAPANESE_CITY = 2
const CHINESE_CITY = 3

//Terrain
const OCEAN = 0
const OPEN = 1
const JUNGLE = 2
const MIXED = 3
const MOUNTAIN = 4
const ATOLL = 5

// Hex sides
const MAP_BORDER = 0
const WATER = 1
const GROUND = 2
const ROAD = 4
const UNPLAYABLE_WATER = 8
const UNPLAYABLE_LAND = 16

//B29 status
const B29_REPLACED = 1
const B29_BOMBED = 2


const SUPPLY_PORT_RANGE = 4 * 2 //ground movement points count with multiplier

// Hex supply status flags
const JP_ZOI = 1 << 0
const AP_ZOI = 1 << 1
const JP_ZOI_NTRL = 1 << 2
const AP_ZOI_NTRL = 1 << 3
const JP_ZOI_DISABLED = 1 << 4
const AP_ZOI_DISABLED = 1 << 5
const JP_AIR_UNITS = 1 << 6
const AP_AIR_UNITS = 1 << 7
const JP_GROUND_UNITS = 1 << 8
const AP_GROUND_UNITS = 1 << 9
const JP_NAVAL_UNITS = 1 << 10
const AP_NAVAL_UNITS = 1 << 11
const JP_HQ_UNITS = 1 << 12
const AP_HQ_UNITS = 1 << 13
const TRANSPORT_ROUTE_DISABLED = 1 << 14
const JP_SUPPLY_PORT = 1 << 15
const AP_SUPPLY_PORT = 1 << 16
const JP_SUPPLIED_HEX = 1 << 17
const BR_SUPPLIED_HEX = 1 << 18
const JOINT_SUPPLIED_HEX = 1 << 19
const US_SUPPLIED_HEX = 1 << 20
const JP_SUPPLY_AIRFIELD = 1 << 21
const AP_SUPPLY_AIRFIELD = 1 << 22
const JP_CONTROLLED = 1 << 23
const HEX_CONTROLLABLE = 1 << 24
const HEX_TEMP_FLAG1 = 1 << 25
const HEX_TEMP_FLAG2 = 1 << 26
const HEX_TEMP_FLAG3 = 1 << 27

const POSSIBLE_ZOI = JP_ZOI | JP_ZOI_DISABLED
const JP_UNITS = JP_AIR_UNITS | JP_GROUND_UNITS | JP_NAVAL_UNITS | JP_HQ_UNITS
const AP_UNITS = JP_UNITS << 1
const JP_GA_UNITS = JP_AIR_UNITS | JP_GROUND_UNITS
const JP_GAH_UNITS = JP_AIR_UNITS | JP_GROUND_UNITS | JP_HQ_UNITS
const NON_SUPPLY_MASK = [...Array(9).keys()].reduce((a, b) => a + Math.pow(2, b + 6), 0) | JP_CONTROLLED | HEX_CONTROLLABLE
const CLEAN_UNITS_MASK = [...Array(26).keys()].filter(a => a < 6 || a > 13).reduce((a, b) => a + Math.pow(2, b), 0) | JP_CONTROLLED | HEX_CONTROLLABLE
const CLEAN_ATTACK_ZONE_MASK = [...Array(26).keys()].reduce((a, b) => a + Math.pow(2, b - 1), 0) | JP_CONTROLLED | HEX_CONTROLLABLE
const AP_SUPPLIED_HEX = (BR_SUPPLIED_HEX | JOINT_SUPPLIED_HEX | US_SUPPLIED_HEX)
const CLEAN_ALL_MASK = JP_CONTROLLED | HEX_CONTROLLABLE

const LAST_BOARD_HEX = 1478
const NON_PLACED_BOX = 1481
const ELIMINATED_BOX = 1482
const DELAYED_BOX = 1483
const CHINA_BOX = 1484
const PERM_ELIMINATED = 1485
const AP_REINF = 1486
const JP_REINF = 1487
const TURN_BOX = 1490
const TUNNEL_BOX = 1600

const ROAD_EVENTS = Object.keys(events).filter(k => events[k].road).map(k => {
    var event = events[k]
    event.keys = event.keys.map(h => hex_to_int(h))
    return event
})

const GARRISONED_CITY = [...Array(Object.keys(map).length).keys()].map(i => map[i]).filter(h => h.city > CITY).map(h => hex_to_int(h.id))

//cards
const OPERATION_NO_1 = find_card(JP, 2)
const OPERATION_C = find_card(JP, 8)
const COL_TSUJI = find_card(JP, 3)
const JN_25_SPECIAL = find_card(JP, 13)
const TOJO_RESIGNS = find_card(JP, 43)
const SHO_GO = find_card(JP, 45)
const GENERAL_ADACHI = find_card(JP, 48)
const MATADOR = find_card(AP, 5)
const DOOLITLE_RAID = find_card(AP, 6)
const ROCHEFORT = find_card(AP, 12)
const SKIP_BOMBING = find_card(AP, 24)
const SANDCRAB = find_card(AP, 30)
const DARTER_DACE = find_card(AP, 61)
const KING_II = find_card(AP, 62)
const SOVIET_INVADE = find_card(AP, 79)
const CARRIER_RAID = find_card(AP, 84)

// PIECES
const HQ_CENTRAL_PACIFIC = find_piece("hq_ap_c")
const HQ_SOUTH_WEST = find_piece("hq_ap_sw")
const HQ_SOUTH_GHORMLEY = find_piece("hq_ap_sg")
const HQ_SOUTH_HELSEY = find_piece("hq_ap_sh")
const HQ_MALAYA = find_piece("hq_ap_m")
const HQ_SEAC = find_piece("hq_ap_seac")
const HQ_ABDA = find_piece("hq_ap_abda")
const HQ_ANZAC = find_piece("hq_ap_anzac")

const NEW_ZEEL = find_piece("army_ap_3_nz")
const M_CORPS = find_piece("army_ap_m")
const NL_CORPS = find_piece("army_ap_nl")
const SL_CORPS = find_piece("army_ap_sl")
const HK_DIVISION = find_piece("army_ap_hk")
const US_FEAF = find_piece("air_ap_feaf")
const LRB_19 = find_piece("air_ap_19_lrb")
const LRB_10 = find_piece("air_ap_10_lrb")
const AP_AIR_14 = find_piece("air_ap_14")
const LRB_14 = find_piece("air_ap_14_lrb")
const AF7 = find_piece("air_ap_7")
const AF7_LRB = find_piece("air_ap_7_lrb")
const US_ASIA_CA = find_piece("casia")
const N_ORLEANS = find_piece("orleans")
const B_29_1 = ap_air("20_bc")
const B_29_2 = ap_air("21_bc")
const ARMOR_BRIGADE = ap_army("7")
const JP_GARRISON_JP = jp_army("g_mainland")
const JP_GARRISON_CN = [jp_army("g_1"), jp_army("g_2"), jp_army("g_3")]
const KAMIKAZE = find_piece("kamikaze")

//HQ
const HQ_YAMAMOTO = find_piece("hq_jp_cy")
const HQ_OZAWA = find_piece("hq_jp_co")
const HQ_JP_SOUTH = find_piece("hq_jp_s")
const HQ_SOUTH_SEAS = find_piece("hq_jp_ss")
const KOREAN_ARMY = find_piece("army_jp_kor")
const ED_ARMY = find_piece("army_jp_ed")

//Regions
const KWAI_HQ_MOD = ["NIndia", "Burma", "Ceylon"]

//hexes
const AIR_FERRY = hex_to_int(5408)
const FRENCH_FRIGATE_SHOALS = hex_to_int(5508)
const MORESBY = hex_to_int(3823)
const WEST_HONSHU = hex_to_int(3606)
const KWAI_BRIDGE = hex_to_int(2108)
const KWAI_BRIDGE_1 = hex_to_int(2109)
const AKYAB = hex_to_int(2006)
const MANDALAY = hex_to_int(2106)
const IMPHAL = hex_to_int(2105)
const LEDO = hex_to_int(2205)
const RANGOON = hex_to_int(2008)
const JARHAT = hex_to_int(2104)
const DACCA = hex_to_int(1905)
const MADRAS = hex_to_int(1406)
const KUNMING = hex_to_int(2407)
const TOKYO = hex_to_int(3706)
const VOGELKOP = hex_to_int(3219)
const GUADALCANAL = hex_to_int(4423)
const RABAUL = hex_to_int(4021)
const TRUK = hex_to_int(4017)
const SINGAPORE = hex_to_int(2015)
const MANILA = hex_to_int(2813)
const PALAU = hex_to_int(3416)
const ATTU = hex_to_int(4600)
const OAHU = hex_to_int(5808)
const HARBIN = hex_to_int(3302)
const MUKDEN = hex_to_int(3303)
const TOKYO_AIR_BASES = [3307, 3704, 3407, 3506, 3507, 3607, 3706, 3705, 3305, 3306, 3303, 3209, 3709].map(h => hex_to_int(h))
const SAIGON = hex_to_int(2212)
const CALCUTTA = hex_to_int(1805)

const NEW_HEBRIDES = []//todo: remove
const RESOURCE_HEX = [...Array(map.length).keys()].filter(h => map[h].resource).map(h => hex_to_int(map[h].id))
const COM_REPLACEMENT_POINTS = [1307, 1308, 2114, 2709, 3727].map(h => hex_to_int(h))
const HQ_LIST = []
const HEX_DIRECTION = []
HEX_DIRECTION[31] = 0
HEX_DIRECTION[2] = 1
HEX_DIRECTION[1] = 2
HEX_DIRECTION[29] = 3
HEX_DIRECTION[59] = 4
HEX_DIRECTION[60] = 5
HEX_DIRECTION[41] = 0
HEX_DIRECTION[11] = 1
HEX_DIRECTION[10] = 2
HEX_DIRECTION[39] = 3
HEX_DIRECTION[68] = 4
HEX_DIRECTION[69] = 5

const MAP_DATA = []
const S_P_MAP_DATA = []
const B_F_W_MAP_DATA = []
const AIRFIELD_LINKS = []
const TONNELING = [
    {from: hex_to_int(4825), distance: 21, to: OAHU, map: S_P_MAP_DATA, duplex: true},
    {from: hex_to_int(4826), distance: 22, to: OAHU, map: S_P_MAP_DATA, duplex: true},
    {from: hex_to_int(4828), distance: 24, to: OAHU, map: S_P_MAP_DATA, duplex: true},
    {from: hex_to_int(4926), distance: 22, to: OAHU, map: S_P_MAP_DATA, duplex: true},
    {from: hex_to_int(1912), distance: 2, to: SINGAPORE, map: B_F_W_MAP_DATA, duplex: true},
    {from: SAIGON, distance: 6, to: hex_to_int(1912), map: B_F_W_MAP_DATA, duplex: false},
]

map.forEach(h => MAP_DATA[hex_to_int(h.id)] = h)

var S_P_first_hex = []

for (let i = 1; i < pieces.length; i++) {
    if (pieces[i].class === "hq") {
        set_add(HQ_LIST, i)
    }
}

for (var i = 0; i < sp_map.length; i++) {
    var hex = hex_to_int(sp_map[i].id)
    let x = Math.floor(hex / 29)
    let y = hex % 29
    if (sp_map[i].top) {
        map_set(S_P_first_hex, x, y)
    }
}

for (let i = 0; i <= LAST_BOARD_HEX; ++i) {
    let hex = MAP_DATA[i]
    if (!hex) {
        hex = {id: int_to_hex(i), terrain: OCEAN, region: "Ocean", nh: get_edge_hexes(i)}
        MAP_DATA[i] = hex
    }

    hex.edges_int = 0
    hex.coastal = false
    let nh = get_edge_hexes(i)
    for (let j = 0; j < nh.length; j++) {
        let near_hex = MAP_DATA[nh[j]]
        let nh_index = (j + 3) % 6
        let border = GROUND
        if (nh[j] < 0) {
            border = MAP_BORDER
        } else if (hex.edges) {
            border = hex.edges[j] | (hex.edges[j] & ROAD ? GROUND : 0)
        } else if (near_hex && near_hex.edges) {
            border = near_hex.edges[nh_index]
        } else if (hex.island || hex.terrain === ATOLL || hex.terrain === OCEAN) {
            border = 1
        }
        if (border & GROUND) {
            border |= UNPLAYABLE_LAND
        }
        if (border & WATER) {
            border |= UNPLAYABLE_WATER
        }
        hex.coastal = hex.coastal || (border & WATER)
        hex.edges_int = hex.edges_int | (border << 5 * j)
    }
    if (hex.terrain === ATOLL) {
        hex.island = true
    }
    if (hex.airfield || hex.port || hex.port || hex.city || hex.resource) {
        hex.named = true
    }
    if (hex.city === JAPANESE_CITY) {
        hex.supply_source |= JP_SUPPLIED_HEX
    } else if (i < 29) {
        hex.supply_source |= JOINT_SUPPLIED_HEX
    } else if (i > (LAST_BOARD_HEX - 29)) {
        hex.supply_source |= US_SUPPLIED_HEX
        hex.supply_source |= JOINT_SUPPLIED_HEX
    }
    hex.nh = get_edge_hexes(i)
    if (i === 472) {
        // remove hex only found in the burma scenario (2608)
        MAP_DATA[i] = non_playable_hex(i)
    }
    apply_south_pacific(Object.assign({}, hex))
    apply_burma(Object.assign({}, hex))
}
MAP_DATA[CHINA_BOX] = {
    id: int_to_hex(CHINA_BOX),
    terrain: OCEAN,
    region: "Ocean",
    airfield: true,
    edges_int: MAP_DATA[OAHU].edges_int
}
B_F_W_MAP_DATA[CHINA_BOX] = MAP_DATA[CHINA_BOX]
S_P_MAP_DATA[CHINA_BOX] = MAP_DATA[CHINA_BOX]
S_P_MAP_DATA[OAHU] = Object.assign({}, MAP_DATA[OAHU])
S_P_MAP_DATA[OAHU].supply_source = JOINT_SUPPLIED_HEX | US_SUPPLIED_HEX
S_P_MAP_DATA[OAHU].nh = []
S_P_MAP_DATA[OAHU].edges_int = 0
S_P_MAP_DATA[hex_to_int(4819)].terrain = OCEAN

B_F_W_MAP_DATA[SINGAPORE] = Object.assign({}, MAP_DATA[SINGAPORE])
B_F_W_MAP_DATA[SINGAPORE].edges_int = 0
B_F_W_MAP_DATA[SINGAPORE].nh = []
B_F_W_MAP_DATA[SINGAPORE].airfield = false

var t1 = 1
for (var i = 0; i < TONNELING.length; i++) {
    var tonnel = TONNELING[i]
    create_tonnel(tonnel)
    if (tonnel.duplex) {
        var from = tonnel.from
        tonnel.from = tonnel.to
        tonnel.to = from
        create_tonnel(tonnel)
    }
}

for (var i = 0; i < map.length; i++) {
    if (!map[i].airfield) {
        continue
    }
    var links = []
    var hex_i = hex_to_int(map[i].id)
    for (var j = 0; j < map.length; j++) {
        if (!map[j].airfield || i === j) {
            continue
        }
        var hex_j = hex_to_int(map[j].id)
        let distance = get_distance(hex_i, hex_j)
        if (distance <= 8) {
            links.push([hex_j, distance])
        }
    }
    if (hex_i === JARHAT || hex_i === DACCA || hex_i === LEDO) {
        links.push([CHINA_BOX, 1])
    }
    map_set(AIRFIELD_LINKS, hex_i, links.sort((a, b) => a[1] - b[1]).flatMap(a => a))
}

map_set(AIRFIELD_LINKS, CHINA_BOX, [JARHAT, 1, DACCA, 1, LEDO, 1])

for (var i = 1; i < pieces.length; i++) {
    const piece = pieces[i]
    piece.u = i
    const supply = piece.class === "hq" ? get_hq_supply_type(piece) : get_unit_supply_type(piece)
    piece.supply = supply
    piece.replacement = get_unit_replacement_type(piece)
    if (piece.class === "naval" && !piece.faction) {
        piece.service = "navy"
    }

    if (piece.class === "air" || piece.class === "naval" && piece.br) {
        piece.zoi_generator = 1
    }

    if (piece.start_reduced && pieces.notreplaceable) {
        piece.one_step = 1
    }
    if (!piece.ebr && piece.br) {
        piece.ebr = piece.br
    }

    if (piece.type === "lrb" && i !== LRB_19 && i !== LRB_10) {
        var pair = find_piece(piece.id.replace("_lrb", ""))
        if (pair !== i) {
            pieces[pair].pair = i
            piece.pair = pair
        }
    }

    if (i === jp_army("kor")) {
        piece.asp = 4
        piece.aspr = 2
        piece.strat_move = true
    } else if (i === ARMOR_BRIGADE) {
        piece.strat_move = true
    } else if (piece.class === "ground" && ["du", "ind", "ch", "bu"].includes(piece.service)) {
        piece.strat_move = false
    } else if (piece.class === "ground" && piece.size < 3) {
        piece.asp = 1
        piece.aspr = 1
        piece.strat_move = true
    } else if (piece.class === "ground") {
        piece.asp = 2
        piece.aspr = 1
        piece.strat_move = true
    }
}

function find_piece(id) {
    for (let i = 1; i < pieces.length; i++) {
        if (pieces[i].id === id) {
            return i
        }
    }
    throw new Error("Missed unit " + id);
}

function find_card(faction, num) {
    for (let i = 1; i < cards.length; i++) {
        if (cards[i].faction === faction && cards[i].num === num) {
            return i
        }
    }
    throw new Error(`Missed card ${faction} ${num}`);
}
function non_playable_hex(id) {
    return {id: id, terrain: OCEAN, region: "Ocean", edges_int: 0, nh: []}
}

function get_hq_supply_type(piece) {
    if (!piece.faction) {
        return JP_SUPPLIED_HEX
    } else if (piece.service === "us") {
        return US_SUPPLIED_HEX
    } else if (piece.service === "br") {
        return BR_SUPPLIED_HEX
    } else {
        return JOINT_SUPPLIED_HEX
    }
}

function get_unit_replacement_type(piece) {
    if (piece.notreplaceable || piece.class === "hq") {
        return null
    }
    if (piece.service === "ch") {
        return CHINESE_REP
    } else if (piece.class === "naval" && (piece.service === "au" || piece.service === "br")) {
        return COMMONWEALTH_REP
    } else if (piece.class === "air") {
        return AIR_REP
    } else if (piece.class === "ground") {
        return GROUND_REP
    }
    return NAVAl_REP
}

function is_commonwelth(piece) {
    return piece.service === "br" || piece.service === "au" || piece.service === "bu" || piece.service === "ind"
}

function is_us_unit(piece) {
    return (piece.service === "navy" || piece.service === "army") && piece.faction === AP
}

function get_unit_supply_type(piece) {
    if (!piece.faction) {
        return JP_SUPPLIED_HEX
    } else if (piece.service === "ch" || piece.class === "air" && (piece.service === "navy" || piece.service === "army")) {
        return AP_SUPPLIED_HEX
    } else if (is_commonwelth(piece)) {
        return BR_SUPPLIED_HEX | JOINT_SUPPLIED_HEX
    } else if (piece.service === "navy" || piece.service === "army") {
        return US_SUPPLIED_HEX | JOINT_SUPPLIED_HEX
    } else if (piece.service === "du") {
        return JOINT_SUPPLIED_HEX
    }
    throw new Error("Invalid piece supply: " + piece.name)
}

function apply_south_pacific(hex) {
    var id = hex_to_int(hex.id)
    var x = Math.floor(id / 29)
    let y = id % 29
    if (map_get(S_P_first_hex, x, 0) > y || x < 20 || x > 40) {
        S_P_MAP_DATA[id] = non_playable_hex(id)
        return
    }
    var sp_map_item = sp_map.filter(h => h.id === hex.id)[0]
    if (sp_map_item && sp_map_item.edges) {
        hex.edges_int = 0
        for (let j = 0; j < 6; j++) {
            var edge = sp_map_item.edges[j];
            if (edge & GROUND) {
                edge |= UNPLAYABLE_LAND
            }
            if (edge & WATER) {
                edge |= UNPLAYABLE_WATER
            }
            hex.edges_int = hex.edges_int | (edge << 5 * j)
        }
    }
    if (x === 20) {
        hex.supply_source |= JOINT_SUPPLIED_HEX
    }
    if (x === 40) {
        hex.supply_source |= JOINT_SUPPLIED_HEX
        hex.supply_source |= US_SUPPLIED_HEX
    }
    if (sp_map_item && sp_map_item.top) {
        hex.supply_source |= JP_SUPPLIED_HEX
    }
    hex.nh = get_edge_hexes(id)
    S_P_MAP_DATA[id] = hex
}

function apply_burma(hex) {
    var id = hex_to_int(hex.id)
    var x = Math.floor(id / 29)
    let y = id % 29

    if (x === 15 && y > 9 || x === 16 && y > 9 || x >= 17 || y >= 13) {
        B_F_W_MAP_DATA[id] = non_playable_hex(id)
        return
    }
    //17.11.16. Andaman Islands
    if (hex.id === 1809) {
        hex.airfield = true
        hex.named = true
    }
    // 17.11.6 Allies trace to an ultimate supply source off the Western Map
    // edge (Maldives edge). Japanese trace to an ultimate supply source
    // supply overland to Saigon or via hex 1912
    if (hex.id === 1912 || hex.id === 2212) {
        hex.supply_source |= JP_SUPPLIED_HEX
    }
    hex.nh = get_edge_hexes(id)
    B_F_W_MAP_DATA[id] = hex
}

function create_tonnel(data) {
    data.map[data.from].edges_int += (WATER | UNPLAYABLE_WATER) << (5 * data.map[data.from].nh.length)
    data.map[data.from].nh.push(TUNNEL_BOX + t1)
    for (var i = 0; i < data.distance; i++) {
        var hex = {
            id: TUNNEL_BOX + t1,
            terrain: OCEAN,
            region: "Ocean",
            edges_int: WATER | UNPLAYABLE_WATER,
            nh: [TUNNEL_BOX + t1 + 1]
        }
        data.map[TUNNEL_BOX + t1] = hex
        t1++
    }
    data.map[TUNNEL_BOX + t1 - 1].nh[0] = data.to
}