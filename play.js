/** main*/
"use strict"



/** import common/constants.js*/
const SOUTH_PACIFIC_SCENARIO = 0
const FULL_CAMPAIGN_SCENARIO = 1
const YEAR_1942_SCENARIO = 2
const YEAR_1942_1943_SCENARIO = 3
const YEAR_1942_1944 = 4
const SHORT_CAMPAIGN_SCENARIO = 5
const YEAR_1943_SCENARIO = 6
const EVEN_SHORT_CAMPAIGN_SCENARIO = 8
const BURMA_SCENARIO = 10

const CAMPAIGN_SCENARIOS = [FULL_CAMPAIGN_SCENARIO, SHORT_CAMPAIGN_SCENARIO, EVEN_SHORT_CAMPAIGN_SCENARIO]

const CLIENT_SIDE_SUPPLY = 1

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
const VIOLATE_ZOI = 1 << 15

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

const NEW_HEBRIDES = [4825, 4826, 4828, 4926].map(h => hex_to_int(h))
const COM_REPLACEMENT_POINTS = [1307, 1308, 2114, 2709, 3727].map(h => hex_to_int(h))

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
HEX_DIRECTION[69] = 5/** import common/constants.js*/
/** import common/data.js*/
/** import common/data_pieces.js*/
var pieces = [
    {},
    {
        id: "army_jp_g_mainland",
        "faction": JP,
        "name": "Japanese Home Islands garrison",
        "counter": "piece garrison_jp",
        "class": "ground",
        "service": "army",
        "garrison": true,
        "notreplaceable": true,
        "start_reduced": true,
        "size": 4,
        "cf": 12,
        "lf": 12,
        "rcf": 12,
    },
    {
        id: "army_jp_g_1",
        "faction": JP,
        "name": "Japanese garrison",
        "counter": "piece garrison_cn",
        "class": "ground",
        "service": "army",
        "garrison": true,
        "notreplaceable": true,
        "start_reduced": true,
        "size": 4,
        "cf": 9,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_g_2",
        "faction": JP,
        "name": "Japanese garrison",
        "counter": "piece garrison_cn",
        "class": "ground",
        "service": "army",
        "garrison": true,
        "notreplaceable": true,
        "start_reduced": true,
        "size": 4,
        "cf": 9,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_g_3",
        "faction": JP,
        "name": "Japanese garrison",
        "counter": "piece garrison_cn",
        "class": "ground",
        "service": "army",
        "garrison": true,
        "notreplaceable": true,
        "start_reduced": true,
        "size": 4,
        "cf": 9,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "hq_jp_cy",
        "faction": JP,
        "name": "Combined Fleet HQ (Yamamoto)",
        "counter": "small_units_ltyellow unit_ix_2",
        "class": "hq",
        "cr": 13,
        "cm": 3,
        "start": 3407
    },
    {
        id: "hq_jp_ss",
        "faction": JP,
        "name": "South Seas HQ",
        "counter": "small_units_ltyellow unit_ix_1",
        "class": "hq",
        "cr": 12,
        "cm": 2,
        "start": 4017
    },
    {
        id: "hq_jp_s",
        "faction": JP,
        "name": "South HQ",
        "counter": "small_units_ltyellow unit_ix_3",
        "class": "hq",
        "cr": 13,
        "cm": 1,
        "start": 2212
    },
    {
        id: "hq_jp_co",
        "faction": JP,
        "name": "Combined Fleet HQ (Ozawa)",
        "counter": "small_units_ltyellow unit_ix_4",
        "class": "hq",
        "cr": 12,
        "cm": 2,
    },
    {
        id: "akagi",
        "faction": JP,
        "name": "Akagi",
        "class": "naval",
        "type": "cv",
        "counter": "big_units_white big unit_ix_10",
        "cf": 12,
        "lf": 12,
        "br": 3,
        "rcf": 8,
        "notreplaceable": true,
        "start": 3705
    },
    {
        id: "soryu",
        "faction": JP,
        "name": "Soryu",
        "class": "naval",
        "counter": "big_units_white big unit_ix_12",
        "type": "cv",
        "cf": 10,
        "lf": 12,
        "br": 3,
        "rcf": 7,
        "notreplaceable": true,
        "start": 3705
    },
    {
        id: "shokaku",
        "faction": JP,
        "name": "Shokaku",
        "class": "naval",
        "counter": "big_units_white big unit_ix_13",
        "type": "cv",
        "cf": 14,
        "lf": 12,
        "br": 3,
        "rcf": 9,
        "notreplaceable": true,
        "start": 3705
    },
    {
        id: "zuiho",
        "faction": JP,
        "name": "Zuiho",
        "class": "naval",
        "counter": "big_units_white big unit_ix_16",
        "type": "cvl",
        "cf": 8,
        "lf": 8,
        "br": 3,
        "rcf": 6,
        "notreplaceable": true,
        "start": 3407
    },
    {
        id: "ryujo",
        "faction": JP,
        "name": "Ryujo",
        "class": "naval",
        "counter": "big_units_white big unit_ix_4",
        "type": "cvl",
        "cf": 6,
        "lf": 8,
        "br": 3,
        "rcf": 3,
        "notreplaceable": true,
        "start": 3416
    }, {
        id: "nagato",
        "faction": JP,
        "name": "Nagato",
        "class": "naval",
        "counter": "big_units_white big unit_ix_15",
        "type": "bb",
        "cf": 20,
        "lf": 14,
        "rcf": 10,
        "notreplaceable": true,
        "start": 3407
    }, {
        id: "hiei",
        "faction": JP,
        "name": "Hiei",
        "class": "naval",
        "counter": "big_units_white big unit_ix_14",
        "type": "bb",
        "cf": 17,
        "lf": 14,
        "rcf": 9,
        "notreplaceable": true,
        "start": 3705
    }, {
        id: "kongo",
        "faction": JP,
        "name": "Kongo",
        "class": "naval",
        "counter": "big_units_white big unit_ix_19",
        "type": "bb",
        "cf": 13,
        "lf": 14,
        "rcf": 7,
        "notreplaceable": true,
        "start": 2909
    }, {
        id: "aoba",
        "faction": JP,
        "name": "Aoba",
        "class": "naval",
        "counter": "big_units_white big unit_ix_17",
        "type": "ca",
        "organic": true,
        "cf": 12,
        "lf": 10,
        "rcf": 7,
        "notreplaceable": true,
        "start": 4017
    }, {
        id: "mogami",
        "faction": JP,
        "name": "Mogami",
        "class": "naval",
        "counter": "big_units_white big unit_ix_5",
        "type": "ca",
        "organic": true,
        "cf": 12,
        "lf": 10,
        "rcf": 7,
        "notreplaceable": true,
        "start": 2311
    },
    {
        id: "takao",
        "faction": JP,
        "class": "naval",
        "notreplaceable": true,
        "counter": "big_units_white big unit_ix_1",
        "start": 2909,
        "name": "Takao",
        "type": "ca",
        "organic": true,
        "cf": 12,
        "lf": 10,
        "rcf": 7,
    },
    {
        id: "nachi",
        "faction": JP,
        "class": "naval",
        "notreplaceable": true,
        "counter": "big_units_white big unit_ix_3",
        "start": 3416,
        "name": "Nachi",
        "type": "ca",
        "organic": true,
        "cf": 10,
        "lf": 10,
        "rcf": 6,
    },
    {
        id: "kamikaze",
        "faction": JP,
        "class": "naval",
        "notreplaceable": true,
        "counter": "big_units_white big unit_ix_18",
        "start": 4017,
        "name": "Kamikaze",
        "type": "apd",
        "organic": true,
        "cf": 8,
        "lf": 8,
        "rcf": 4,
    },
    {
        id: "tenyru",
        "faction": JP,
        "class": "naval",
        "notreplaceable": true,
        "counter": "big_units_white big unit_ix_2",
        "start": 4715,
        "name": "Tenyru",
        "type": "cl",
        "organic": true,
        "cf": 4,
        "lf": 8,
        "rcf": 3,
    },
    {
        id: "air_jp_21",
        "faction": JP,
        "name": "21st Air Flotilla",
        "counter": "small_units_white unit_ix_11",
        "class": "air",
        "service": "navy",
        "notreplaceable": true,
        "start": 3009,
        "cf": 16,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 8,
    },
    {
        id: "air_jp_22",
        "faction": JP,
        "name": "22nd Air Flotilla",
        "counter": "small_units_white unit_ix_12",
        "class": "air",
        "service": "navy",
        "notreplaceable": true,
        "start": 2212,
        "cf": 20,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 10,
    },
    {
        id: "air_jp_23",
        "faction": JP,
        "name": "23rd Air Flotilla",
        "counter": "small_units_white unit_ix_13",
        "class": "air",
        "service": "navy",
        "notreplaceable": true,
        "start": 3009,
        "cf": 16,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 8,
    },
    {
        id: "air_jp_24",
        "faction": JP,
        "name": "24th Air Flotilla",
        "counter": "small_units_white unit_ix_14",
        "class": "air",
        "service": "navy",
        "notreplaceable": true,
        "start": 4715,
        "cf": 10,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 5,
    },
    {
        id: "army_jp_1sn",
        "faction": JP,
        "name": "1st SN Brigade",
        "counter": "small_units_white unit_ix_3",
        "class": "ground",
        "service": "navy",
        "notreplaceable": true,
        "start": 2909,
        "size": 1,
        "cf": 4,
        "lf": 6,
        "rcf": 2,
        "organic": true,
    },
    {
        id: "army_jp_2sn",
        "faction": JP,
        "name": "2nd SN Brigade",
        "counter": "small_units_white unit_ix_4",
        "class": "ground",
        "service": "navy",
        "notreplaceable": true,
        "start": 2311,
        "size": 1,
        "cf": 4,
        "lf": 6,
        "rcf": 2,
        "organic": true,
    },
    {
        id: "army_jp_3sn",
        "faction": JP,
        "name": "3rd SN Brigade",
        "counter": "small_units_white unit_ix_5",
        "class": "ground",
        "service": "navy",
        "notreplaceable": true,
        "start": 4017,
        "size": 1,
        "cf": 4,
        "lf": 6,
        "rcf": 2,
        "organic": true,
    },
    {
        id: "army_jp_4sn",
        "faction": JP,
        "name": "4th SN Brigade",
        "counter": "small_units_white unit_ix_7",
        "class": "ground",
        "service": "navy",
        "notreplaceable": true,
        "start": 4715,
        "size": 1,
        "cf": 4,
        "lf": 6,
        "rcf": 2,
        "organic": true,
    },
    {
        id: "army_jp_ss",
        "faction": JP,
        "name": "South Seas Brigade",
        "counter": "small_units_white unit_ix_6",
        "class": "ground",
        "service": "navy",
        "notreplaceable": true,
        "start": 4017,
        "size": 1,
        "cf": 6,
        "lf": 6,
        "rcf": 3,
        "organic": true,
    },
    {
        id: "army_jp_kor",
        "faction": JP,
        "name": "Korean Army",
        "counter": "small_units_yellow unit_ix_20",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "start": 3305,
        "size": 4,
        "cf": 18,
        "lf": 18,
        "rcf": 9,
    },
    {
        id: "army_jp_ed",
        "faction": JP,
        "name": "Eastern District Army",
        "counter": "small_units_yellow unit_ix_3",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "start": 3706,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_14",
        "faction": JP,
        "name": "14th Army",
        "counter": "small_units_yellow unit_ix_18",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "start": 2909,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_15",
        "faction": JP,
        "name": "15th Army",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "counter": "small_units_yellow unit_ix_12",
        "start": 2211,
        "size": 4,
        "cf": 20,
        "lf": 12,
        "rcf": 10,
    },
    {
        id: "army_jp_16",
        "faction": JP,
        "name": "16th Army",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "counter": "small_units_yellow unit_ix_21",
        "start": 3416,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_17",
        "faction": JP,
        "name": "17th Army",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "counter": "small_units_yellow unit_ix_16",
        "start": 2708,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_18",
        "faction": JP,
        "name": "18th Army",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "counter": "small_units_yellow unit_ix_4",
        "start": 3706,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_19",
        "faction": JP,
        "name": "19th Army",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "counter": "small_units_yellow unit_ix_19",
        "start": 3209,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_25",
        "faction": JP,
        "name": "25th Army",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "counter": "small_units_yellow unit_ix_14",
        "start": 2509,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_27",
        "faction": JP,
        "name": "27th Army",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "counter": "small_units_yellow unit_ix_1",
        "start": 3704,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_35",
        "faction": JP,
        "name": "35th Army",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "counter": "small_units_yellow unit_ix_17",
        "start": 3007,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_38",
        "faction": JP,
        "name": "38th Army",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "counter": "small_units_yellow unit_ix_2",
        "start": 2211,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "air_jp_1",
        "faction": JP,
        "name": "1st Air Division",
        "class": "air",
        "service": "army",
        "notreplaceable": true,
        "counter": "small_units_yellow_air unit_ix_1",
        "start": 3706,
        "cf": 20,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 10,
    },
    {
        id: "air_jp_2",
        "faction": JP,
        "name": "2nd Air Division",
        "counter": "small_units_yellow_air unit_ix_2",
        "class": "air",
        "service": "army",
        "notreplaceable": true,
        "start": 3004,
        "cf": 20,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 10,
    },
    {
        id: "air_jp_3",
        "faction": JP,
        "name": "3rd Air Division",
        "counter": "small_units_yellow_air unit_ix_3",
        "class": "air",
        "service": "army",
        "notreplaceable": true,
        "start": 3607,
        "cf": 20,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 10,
    },
    {
        id: "air_jp_4",
        "faction": JP,
        "name": "4th Air Division",
        "counter": "small_units_yellow_air unit_ix_4",
        "class": "air",
        "service": "army",
        "notreplaceable": true,
        "start": 3607,
        "cf": 20,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 10,
    },
    {
        id: "air_jp_5",
        "faction": JP,
        "name": "5th Air Division",
        "counter": "small_units_yellow_air unit_ix_5",
        "class": "air",
        "service": "army",
        "notreplaceable": true,
        "start": 2909,
        "cf": 22,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 11,
    },
    {
        id: "air_jp_25",
        "faction": JP,
        "name": "25th Air Flotilla",
        "counter": "small_units_white unit_ix_15",
        "class": "air",
        "service": "navy",
        "rptype": "jp_air",
        "reinforcement": 2,
        "cf": 10,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 5,
    },
    {
        id: "air_jp_26",
        "faction": JP,
        "name": "26th Air Flotilla",
        "counter": "small_units_white unit_ix_16",
        "class": "air",
        "service": "navy",
        "rptype": "jp_air",
        "reinforcement": 3,
        "cf": 10,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 5,
    },
    {
        id: "air_jp_27",
        "faction": JP,
        "name": "27th Air Flotilla",
        "counter": "small_units_white unit_ix_17",
        "class": "air",
        "service": "navy",
        "rptype": "jp_air",
        "reinforcement": 4,
        "cf": 10,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 5,
    },
    {
        id: "air_jp_28",
        "faction": JP,
        "name": "28th Air Flotilla",
        "counter": "small_units_white unit_ix_18",
        "class": "air",
        "service": "navy",
        "rptype": "jp_air",
        "reinforcement": 5,
        "cf": 10,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 5,
    },
    {
        id: "air_jp_50",
        "faction": JP,
        "name": "50th Air Flotilla",
        "counter": "small_units_white unit_ix_19",
        "class": "air",
        "service": "navy",
        "rptype": "jp_air",
        "reinforcement": 6,
        "cf": 8,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 4,
    },
    {
        id: "air_jp_51",
        "faction": JP,
        "name": "51st Air Flotilla",
        "counter": "small_units_white unit_ix_20",
        "class": "air",
        "service": "navy",
        "rptype": "jp_air",
        "reinforcement": 6,
        "cf": 8,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 4,
    },
    {
        id: "air_jp_61",
        "faction": JP,
        "name": "61st Air Flotilla",
        "counter": "small_units_white unit_ix_1",
        "class": "air",
        "service": "navy",
        "rptype": "jp_air",
        "reinforcement": 8,
        "cf": 8,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 4,
    },
    {
        id: "air_jp_62",
        "faction": JP,
        "name": "62nd Air Flotilla",
        "counter": "small_units_white unit_ix_2",
        "class": "air",
        "service": "navy",
        "rptype": "jp_air",
        "reinforcement": 8,
        "cf": 8,
        "lf": 10,
        "br": 3,
        "ebr": 5,
        "rcf": 4,
    },
    {
        id: "air_jp_t",
        "faction": JP,
        "name": "Tainan Air Unit",
        "counter": "small_units_yellow_air unit_ix_13",
        "class": "air",
        "service": "army",
        "notreplaceable": true,
        "parenthetical": true,
        "cf": 8,
        "lf": 10,
        "br": 4,
        "ebr": 5,
        "rcf": 6,
    },
    {
        id: "air_jp_6",
        "faction": JP,
        "name": "6th Air Division",
        "counter": "small_units_yellow_air unit_ix_6",
        "class": "air",
        "service": "army",
        "rptype": "jp_air",
        "reinforcement": 3,
        "cf": 8,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 4,
    },
    {
        id: "air_jp_7",
        "faction": JP,
        "name": "7th Air Division",
        "counter": "small_units_yellow_air unit_ix_7",
        "class": "air",
        "service": "army",
        "rptype": "jp_air",
        "reinforcement": 4,
        "cf": 8,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 4,
    },
    {
        id: "air_jp_8",
        "faction": JP,
        "name": "8th Air Division",
        "counter": "small_units_yellow_air unit_ix_8",
        "class": "air",
        "service": "army",
        "rptype": "jp_air",
        "reinforcement": 5,
        "cf": 8,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 4,
    },
    {
        id: "air_jp_9",
        "faction": JP,
        "name": "9th Air Division",
        "counter": "small_units_yellow_air unit_ix_9",
        "class": "air",
        "service": "army",
        "rptype": "jp_air",
        "reinforcement": 6,
        "cf": 8,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 4,
    },
    {
        id: "air_jp_10",
        "faction": JP,
        "name": "10th Air Division",
        "counter": "small_units_yellow_air unit_ix_10",
        "class": "air",
        "service": "army",
        "rptype": "jp_air",
        "reinforcement": 7,
        "cf": 8,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 4,
    },
    {
        id: "air_jp_11",
        "faction": JP,
        "name": "11th Air Division",
        "counter": "small_units_yellow_air unit_ix_11",
        "class": "air",
        "service": "army",
        "rptype": "jp_air",
        "reinforcement": 8,
        "cf": 6,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 3,
    },
    {
        id: "air_jp_12",
        "faction": JP,
        "name": "12th Air Division",
        "counter": "small_units_yellow_air unit_ix_12",
        "class": "air",
        "service": "army",
        "rptype": "jp_air",
        "reinforcement": 9,
        "cf": 6,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 3,
    },
    {
        id: "army_jp_28",
        "faction": JP,
        "name": "28th Army",
        "counter": "small_units_yellow unit_ix_5",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "reinforcement": 2,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_31",
        "faction": JP,
        "name": "31st Army",
        "counter": "small_units_yellow unit_ix_6",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "reinforcement": 3,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_37",
        "faction": JP,
        "name": "37th Army",
        "counter": "small_units_yellow unit_ix_7",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "reinforcement": 4,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_33",
        "faction": JP,
        "name": "33rd Army",
        "counter": "small_units_yellow unit_ix_8",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "reinforcement": 5,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_2",
        "faction": JP,
        "name": "2nd Army",
        "counter": "small_units_yellow unit_ix_9",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "reinforcement": 7,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_29",
        "faction": JP,
        "name": "29th Army",
        "counter": "small_units_yellow unit_ix_10",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "reinforcement": 8,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_32",
        "faction": JP,
        "name": "32nd Army",
        "counter": "small_units_yellow unit_ix_11",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "reinforcement": 9,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_36",
        "faction": JP,
        "name": "36th Army",
        "counter": "small_units_yellow unit_ix_15",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "reinforcement": 10,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "army_jp_39",
        "faction": JP,
        "name": "39th Army",
        "counter": "small_units_yellow unit_ix_13",
        "class": "ground",
        "service": "army",
        "rptype": "jp_ground",
        "reinforcement": 10,
        "start_reduced": true,
        "size": 4,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
    },
    {
        id: "yamato",
        "faction": JP,
        "name": "Yamato",
        "class": "naval",
        "counter": "big_units_white big unit_ix_6",
        "type": "bb",
        "cf": 18,
        "lf": 18,
        "rcf": 9,
        "reinforcement": 2,
        "rptype": "jp_navy",
        "start_reduced": true,
    },
    {
        id: "junyo",
        "faction": JP,
        "name": "Junyo",
        "class": "naval",
        "counter": "big_units_white big unit_ix_7",
        "type": "cv",
        "cf": 8,
        "lf": 8,
        "br": 3,
        "rcf": 6,
        "reinforcement": 3,
        "rptype": "jp_navy",
    },
    {
        id: "kaiyo",
        "faction": JP,
        "name": "Kaiyo",
        "class": "naval",
        "counter": "big_units_white big unit_ix_8",
        "type": "cve",
        "cf": 8,
        "lf": 8,
        "br": 3,
        "rcf": 6,
        "reinforcement": 7,
        "start_reduced": true,
        "rptype": "jp_navy",
    },
    {
        id: "taiho",
        "faction": JP,
        "name": "Taiho",
        "class": "naval",
        "counter": "big_units_white big unit_ix_9",
        "type": "cv",
        "cf": 19,
        "lf": 12,
        "br": 3,
        "rcf": 7,
        "reinforcement": 8,
        "rptype": "jp_navy",
    },
    {
        id: "amagi",
        "faction": JP,
        "name": "Amagi",
        "class": "naval",
        "counter": "big_units_white big unit_ix_11",
        "type": "cvl",
        "cf": 8,
        "lf": 8,
        "br": 3,
        "rcf": 6,
        "reinforcement": 9,
        "rptype": "jp_navy",
    },
    {
        id: "hq_ap_c",
        "faction": AP,
        "name": "Central Pacific HQ",
        "counter": "small_units_turquoise unit_ix_1",
        "class": "hq",
        "service": "us",
        "cr": 25,
        "cm": 3,
        "start": 5808
    },
    {
        id: "hq_ap_sw",
        "faction": AP,
        "name": "South West Pacific HQ",
        "counter": "small_units_turquoise unit_ix_2",
        "class": "hq",
        "service": "us",
        "cr": 20,
        "cm": 2,
        "start": 2813
    },
    {
        id: "hq_ap_sg",
        "faction": AP,
        "name": "South Pacific HQ (Ghormley)",
        "counter": "small_units_turquoise unit_ix_3",
        "class": "hq",
        "service": "us",
        "cr": 7,
        "cm": 1,
        "reinforcement": 3,
    },
    {
        id: "hq_ap_sh",
        "faction": AP,
        "name": "South Pacific HQ (Halsey)",
        "counter": "small_units_turquoise unit_ix_4",
        "class": "hq",
        "service": "us",
        "cr": 10,
        "cm": 3,
    },
    {
        id: "hq_ap_m",
        "faction": AP,
        "name": "Malaya HQ",
        "counter": "small_units_beige unit_ix_4",
        "class": "hq",
        "service": "br",
        "cr": 5,
        "cm": 1,
        "start": 2015,
        "notreplaceable": true,
    },
    {
        id: "hq_ap_seac",
        "faction": AP,
        "name": "SEAC HQ",
        "counter": "small_units_beige unit_ix_5",
        "class": "hq",
        "service": "br",
        "cr": 10,
        "cm": 1,
        "reinforcement": 2,
    },
    {
        id: "hq_ap_abda",
        "faction": AP,
        "name": "ABDA HQ",
        "counter": "small_units_dkblue unit_ix_1",
        "class": "hq",
        "service": "joint",
        "cr": 12,
        "cm": 1,
        "notreplaceable": true,
    },
    {
        id: "hq_ap_anzac",
        "faction": AP,
        "name": "ANZAC HQ",
        "counter": "small_units_dkblue unit_ix_2",
        "class": "hq",
        "service": "joint",
        "cr": 10,
        "cm": 1,
        "reinforcement": 3,
    },
    {
        id: "lexington",
        "faction": AP,
        "name": "Lexington",
        "class": "naval",
        "type": "cv",
        "service": "navy",
        "counter": "big_units_blue big unit_ix_3",
        "cf": 12,
        "lf": 12,
        "br": 2,
        "rcf": 8,
        "rptype": "us_navy",
        "start": 5410,
        "start_reduced": true,
    },
    {
        id: "enterprise",
        "faction": AP,
        "name": "Enterprise",
        "counter": "big_units_blue big unit_ix_4",
        "class": "naval",
        "type": "cv",
        "service": "navy",
        "cf": 12,
        "lf": 12,
        "br": 2,
        "rcf": 8,
        "rptype": "us_navy",
        "start": 5809,
        "start_reduced": true,
    },
    {
        id: "mdca",
        "faction": AP,
        "name": "MD/CA",
        "class": "naval",
        "counter": "big_units_blue big unit_ix_5",
        "type": "bb",
        "service": "navy",
        "start": 5808,
        "cf": 15,
        "lf": 10,
        "rcf": 9,
        "notreplaceable": true,
    },
    {
        id: "orleans",
        "faction": AP,
        "name": "New Orleans",
        "class": "naval",
        "counter": "big_units_blue big unit_ix_7",
        "type": "ca",
        "service": "navy",
        "start": 5808,
        "cf": 9,
        "lf": 8,
        "rcf": 6,
        "notreplaceable": true,
    },
    {
        id: "casia",
        "faction": AP,
        "name": "US Asia (Cruiser)",
        "counter": "big_units_blue big unit_ix_2",
        "class": "naval",
        "type": "ca",
        "service": "navy",
        "start": 3014,
        "cf": 4,
        "lf": 6,
        "rcf": 2,
        "notreplaceable": true,
    },
    {
        id: "dasia",
        "faction": AP,
        "name": "Us Asia (Destroyer)",
        "counter": "big_units_blue big unit_ix_1",
        "class": "naval",
        "type": "dd",
        "service": "navy",
        "start": 2616,
        "cf": 2,
        "lf": 4,
        "rcf": 1,
        "notreplaceable": true,
    },
    {
        id: "forcez",
        "faction": AP,
        "name": "Force Z",
        "counter": "big_units_beige big unit_ix_1",
        "class": "naval",
        "service": "br",
        "type": "bb",
        "start": 2015,
        "cf": 8,
        "lf": 10,
        "rcf": 4,
        "notreplaceable": true,
    },
    {
        id: "exeter",
        "faction": AP,
        "name": "Exeter",
        "counter": "big_units_beige big unit_ix_3",
        "class": "naval",
        "service": "br",
        "type": "ca",
        "start": 1307,
        "cf": 5,
        "lf": 8,
        "rcf": 3,
        "notreplaceable": true,
    },
    {
        id: "kent",
        "faction": AP,
        "name": "Kent",
        "class": "naval",
        "counter": "big_units_beige big unit_ix_2",
        "service": "au",
        "type": "ca",
        "start": 3727,
        "cf": 3,
        "lf": 8,
        "rcf": 2,
        "notreplaceable": true,
    },
    {
        id: "dutch",
        "faction": AP,
        "name": "Dutch",
        "class": "naval",
        "counter": "big_units_orange big unit_ix_1",
        "service": "du",
        "type": "cl",
        "start": 2019,
        "cf": 3,
        "lf": 8,
        "rcf": 2,
        "notreplaceable": true,
    },
    {
        id: "air_ap_211",
        "faction": AP,
        "name": "Marine Fighter Attack Squadron 211",
        "counter": "small_units_blue unit_ix_1",
        "class": "air",
        "service": "navy",
        "parenthetical": true,
        "notreplaceable": true,
        "start_reduced": true,
        "start": 4612,
        "cf": 1,
        "lf": 8,
        "rcf": 1,
        "br": 2,
        "ebr": 4,
    },
    {
        id: "air_ap_feaf",
        "faction": AP,
        "name": "Far East Air Force (US)",
        "counter": "small_units_green_air unit_ix_1",
        "class": "air",
        "service": "army",
        "parenthetical": true,
        "notreplaceable": true,
        "start": 2812,
        "cf": 8,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 4,
    },
    {
        id: "air_ap_19_lrb",
        "faction": AP,
        "name": "19th LRB air unit",
        "counter": "small_units_green_air unit_ix_2",
        "class": "air",
        "service": "army",
        "type": "lrb",
        "notreplaceable": true,
        "start": 2812,
        "cf": 2,
        "lf": 9,
        "br": 6,
        "rcf": 1,
    },
    {
        id: "air_ap_7",
        "faction": AP,
        "name": "7th Air Force",
        "class": "air",
        "service": "army",
        "counter": "small_units_green_air unit_ix_3",
        "rptype": "ap_air",
        "start": 5808,
        "cf": 10,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 5,
    },
    {
        id: "air_ap_7_lrb",
        "faction": AP,
        "name": "7th Air Force (LRB)",
        "counter": "small_units_green_air unit_ix_4",
        "class": "air",
        "service": "army",
        "type": "lrb",
        "rptype": "ap_air",
        "start": 5808,
        "cf": 4,
        "lf": 10,
        "br": 6,
        "ebr": 6,
        "rcf": 2,
    },
    {
        id: "air_ap_avg",
        "faction": AP,
        "name": "The American Volunteer Groups",
        "counter": "small_units_green_air unit_ix_16",
        "class": "air",
        "service": "army",
        "parenthetical": true,
        "notreplaceable": true,
        "start": 2008,
        "cf": 6,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 5,
    },
    {
        id: "air_ap_du",
        "faction": AP,
        "name": "Royal Netherlands Air Force",
        "counter": "small_units_orange unit_ix_1",
        "class": "air",
        "service": "du",
        "parenthetical": true,
        "notreplaceable": true,
        "start": 2019,
        "cf": 7,
        "lf": 9,
        "br": 2,
        "ebr": 4,
        "rcf": 4,
    },
    {
        id: "air_ap_fe",
        "faction": AP,
        "name": "Far East Air Force (RAF)",
        "counter": "small_units_beige_air unit_ix_3",
        "class": "air",
        "service": "br",
        "parenthetical": true,
        "notreplaceable": true,
        "start": 1905,
        "cf": 7,
        "lf": 9,
        "br": 2,
        "ebr": 4,
        "rcf": 4,
    },
    {
        id: "air_ap_ma",
        "faction": AP,
        "name": "Malayan Air Force (RAF)",
        "counter": "small_units_beige_air unit_ix_4",
        "class": "air",
        "service": "br",
        "parenthetical": true,
        "notreplaceable": true,
        "start": 2015,
        "cf": 6,
        "lf": 9,
        "br": 2,
        "ebr": 4,
        "rcf": 3,
    },
    {
        id: "air_ap_au",
        "faction": AP,
        "name": "Australian Air Force",
        "counter": "small_units_beige_air unit_ix_5",
        "class": "air",
        "service": "au",
        "parenthetical": true,
        "rptype": "ap_air",
        "start": 3727,
        "cf": 10,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 5,
    },
    {
        id: "air_ap_14",
        "faction": AP,
        "name": "14th Air Force",
        "counter": "small_units_green_air unit_ix_15",
        "class": "air",
        "service": "army",
        "rptype": "ap_air",
        "cf": 9,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 6,
    },
    {
        id: "air_ap_10_lrb",
        "faction": AP,
        "name": "10th Air Force (LRB)",
        "counter": "small_units_green_air unit_ix_5",
        "class": "air",
        "type": "lrb",
        "service": "army",
        "rptype": "ap_air",
        "reinforcement": 2,
        "cf": 4,
        "lf": 10,
        "br": 6,
        "rcf": 2,
    },
    {
        id: "air_ap_5_lrb",
        "faction": AP,
        "name": "5th Air Force (LRB)",
        "counter": "small_units_green_air unit_ix_7",
        "class": "air",
        "type": "lrb",
        "service": "army",
        "rptype": "ap_air",
        "reinforcement": 2,
        "cf": 4,
        "lf": 10,
        "br": 6,
        "rcf": 2,
    },
    {
        id: "air_ap_5",
        "faction": AP,
        "name": "5th Air Force",
        "counter": "small_units_green_air unit_ix_6",
        "class": "air",
        "service": "army",
        "rptype": "ap_air",
        "cf": 10,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 5,
        "reinforcement": 2,
    },
    {
        id: "air_ap_1_maw",
        "faction": AP,
        "name": "1st Marine Aircraft Wing",
        "counter": "small_units_blue unit_ix_3",
        "class": "air",
        "service": "navy",
        "parenthetical": true,
        "rptype": "ap_air",
        "cf": 6,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 3,
        "reinforcement": 2,
    },
    {
        id: "air_ap_seac",
        "faction": AP,
        "name": "SEAC Air Force",
        "counter": "small_units_beige_air unit_ix_1",
        "class": "air",
        "service": "br",
        "rptype": "ap_air",
        "cf": 10,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 5,
        "reinforcement": 2,
    },
    {
        id: "air_ap_seac_lrb",
        "faction": AP,
        "name": "SEAC Air Force (LRB)",
        "counter": "small_units_beige_air unit_ix_2",
        "class": "air",
        "type": "lrb",
        "service": "br",
        "rptype": "ap_air",
        "cf": 4,
        "lf": 10,
        "br": 6,
        "rcf": 2,
        "reinforcement": 5,
    },
    {
        id: "air_ap_13_lrb",
        "faction": AP,
        "name": "13th Air Force (LRB)",
        "counter": "small_units_green_air unit_ix_9",
        "class": "air",
        "type": "lrb",
        "service": "army",
        "rptype": "ap_air",
        "reinforcement": 3,
        "cf": 4,
        "lf": 10,
        "br": 6,
        "rcf": 2,
    },
    {
        id: "air_ap_13",
        "faction": AP,
        "name": "13th Air Force",
        "counter": "small_units_green_air unit_ix_8",
        "class": "air",
        "service": "army",
        "rptype": "ap_air",
        "cf": 10,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 5,
        "reinforcement": 3,
    },
    {
        id: "air_ap_11_lrb",
        "faction": AP,
        "name": "11th Air Force (LRB)",
        "counter": "small_units_green_air unit_ix_11",
        "class": "air",
        "type": "lrb",
        "service": "army",
        "rptype": "ap_air",
        "reinforcement": 3,
        "cf": 4,
        "lf": 10,
        "br": 6,
        "rcf": 2,
    },
    {
        id: "air_ap_11",
        "faction": AP,
        "name": "11th Air Force",
        "counter": "small_units_green_air unit_ix_10",
        "class": "air",
        "service": "army",
        "rptype": "ap_air",
        "cf": 10,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 5,
        "reinforcement": 3,
    },
    {
        id: "air_ap_14_lrb",
        "faction": AP,
        "name": "14th Air Force (LRB)",
        "counter": "small_units_green_air unit_ix_12",
        "class": "air",
        "type": "lrb",
        "service": "army",
        "rptype": "ap_air",
        "reinforcement": 4,
        "cf": 4,
        "lf": 10,
        "br": 6,
        "rcf": 2,
    },
    {
        id: "air_ap_2_maw",
        "faction": AP,
        "name": "2nd Marine Aircraft Wing",
        "counter": "small_units_blue unit_ix_4",
        "class": "air",
        "service": "navy",
        "parenthetical": true,
        "rptype": "ap_air",
        "cf": 8,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 6,
        "reinforcement": 4,
    },
    {
        id: "air_ap_3_maw",
        "faction": AP,
        "name": "3rd Marine Aircraft Wing",
        "counter": "small_units_blue unit_ix_5",
        "class": "air",
        "service": "navy",
        "parenthetical": true,
        "rptype": "ap_air",
        "cf": 10,
        "lf": 10,
        "br": 2,
        "ebr": 4,
        "rcf": 8,
        "reinforcement": 9,
    },
    {
        id: "air_ap_20_bc",
        "faction": AP,
        "name": "XX Bomber Command (B-29)",
        "counter": "small_units_green_air unit_ix_13",
        "class": "air",
        "type": "lrb",
        "service": "army",
        "rptype": "ap_air",
        "cf": 6,
        "lf": 10,
        "br": 8,
        "rcf": 3,
        "reinforcement": 9,
        "b29": 1,
    },
    {
        id: "air_ap_21_bc",
        "faction": AP,
        "name": "XXI Bomber Command (B-29)",
        "counter": "small_units_green_air unit_ix_14",
        "class": "air",
        "type": "lrb",
        "service": "army",
        "rptype": "ap_air",
        "cf": 6,
        "lf": 10,
        "br": 8,
        "rcf": 3,
        "reinforcement": 10,
        "b29": 4,
    },
    {
        id: "mississippi",
        "faction": AP,
        "name": "Mississippi",
        "counter": "big_units_blue big unit_ix_6",
        "class": "naval",
        "type": "bb",
        "service": "navy",
        "reinforcement": 2,
        "cf": 15,
        "lf": 12,
        "rcf": 7,
        "rptype": "us_navy",
    },
    {
        id: "northampton",
        "faction": AP,
        "name": "Northampton",
        "counter": "big_units_blue big unit_ix_8",
        "class": "naval",
        "type": "ca",
        "service": "navy",
        "reinforcement": 2,
        "cf": 9,
        "lf": 8,
        "rcf": 6,
        "rptype": "us_navy",
    },
    {
        id: "warspite",
        "faction": AP,
        "name": "Warspite",
        "counter": "big_units_beige big unit_ix_6",
        "class": "naval",
        "type": "bb",
        "service": "br",
        "reinforcement": 2,
        "cf": 14,
        "lf": 14,
        "rcf": 7,
        "rptype": "com_navy",
    },
    {
        id: "indomitable",
        "faction": AP,
        "name": "Indomitable",
        "counter": "big_units_beige big unit_ix_5",
        "class": "naval",
        "type": "cv",
        "service": "br",
        "reinforcement": 2,
        "cf": 10,
        "lf": 12,
        "br": 2,
        "rcf": 5,
        "rptype": "com_navy",
    },
    {
        id: "hermes",
        "faction": AP,
        "name": "Hermes",
        "class": "naval",
        "counter": "big_units_beige big unit_ix_7",
        "type": "cvl",
        "service": "br",
        "reinforcement": 2,
        "cf": 2,
        "lf": 8,
        "br": 2,
        "rcf": 2,
        "notreplaceable": true,
        "start_reduced": true,
    },
    {
        id: "carolina",
        "faction": AP,
        "name": "North Carolina",
        "counter": "big_units_blue big unit_ix_10",
        "class": "naval",
        "type": "bb",
        "service": "navy",
        "reinforcement": 3,
        "cf": 16,
        "lf": 16,
        "rcf": 8,
        "rptype": "us_navy",
    },
    {
        id: "wasp",
        "faction": AP,
        "name": "Wasp",
        "class": "naval",
        "counter": "big_units_blue big unit_ix_9",
        "type": "cv",
        "service": "navy",
        "cf": 12,
        "lf": 12,
        "br": 2,
        "rcf": 8,
        "rptype": "us_navy",
        "reinforcement": 3,
    },
    {
        id: "washington",
        "faction": AP,
        "name": "Washington",
        "counter": "big_units_blue big unit_ix_11",
        "class": "naval",
        "type": "bb",
        "service": "navy",
        "reinforcement": 4,
        "cf": 16,
        "lf": 16,
        "rcf": 8,
        "rptype": "us_navy",
    },
    {
        id: "london",
        "faction": AP,
        "name": "London",
        "class": "naval",
        "counter": "big_units_beige big unit_ix_8",
        "type": "ca",
        "service": "br",
        "reinforcement": 4,
        "cf": 6,
        "lf": 8,
        "rcf": 3,
        "rptype": "com_navy",
    },
    {
        id: "mass",
        "faction": AP,
        "name": "Massachusetts",
        "counter": "big_units_blue big unit_ix_12",
        "class": "naval",
        "type": "bb",
        "service": "navy",
        "reinforcement": 5,
        "cf": 16,
        "lf": 16,
        "rcf": 8,
        "rptype": "us_navy",
    },
    {
        id: "jacinto",
        "faction": AP,
        "name": "San Jacinto",
        "counter": "big_units_blue big unit_ix_13",
        "class": "naval",
        "type": "cvl",
        "service": "navy",
        "cf": 10,
        "lf": 10,
        "br": 2,
        "rcf": 7,
        "rptype": "us_navy",
        "reinforcement": 5,
    },
    {
        id: "essex",
        "faction": AP,
        "name": "Essex",
        "class": "naval",
        "counter": "big_units_blue big unit_ix_14",
        "type": "cv",
        "service": "navy",
        "cf": 14,
        "lf": 14,
        "br": 2,
        "rcf": 10,
        "rptype": "us_navy",
        "reinforcement": 6,
    },
    {
        id: "bunker",
        "faction": AP,
        "name": "Bunker Hill",
        "counter": "big_units_blue big unit_ix_18",
        "class": "naval",
        "type": "cv",
        "service": "navy",
        "cf": 14,
        "lf": 14,
        "br": 2,
        "rcf": 10,
        "rptype": "us_navy",
        "reinforcement": 6,
    },
    {
        id: "cowpens",
        "faction": AP,
        "name": "Cowpens",
        "counter": "big_units_blue big unit_ix_17",
        "class": "naval",
        "type": "cvl",
        "service": "navy",
        "cf": 10,
        "lf": 10,
        "br": 2,
        "rcf": 7,
        "rptype": "us_navy",
        "reinforcement": 6,
    },
    {
        id: "belleau",
        "faction": AP,
        "name": "Belleau Wood",
        "counter": "big_units_blue big unit_ix_15",
        "class": "naval",
        "type": "cvl",
        "service": "navy",
        "cf": 10,
        "lf": 10,
        "br": 2,
        "rcf": 7,
        "rptype": "us_navy",
        "reinforcement": 6,
    },
    {
        id: "sangamon",
        "faction": AP,
        "name": "Sangamon",
        "counter": "big_units_blue big unit_ix_16",
        "class": "naval",
        "type": "cve",
        "service": "navy",
        "cf": 6,
        "lf": 8,
        "br": 2,
        "rcf": 3,
        "rptype": "us_navy",
        "reinforcement": 6,
    },
    {
        id: "jersey",
        "faction": AP,
        "name": "New Jersey",
        "counter": "big_units_blue big unit_ix_22",
        "class": "naval",
        "type": "bb",
        "service": "navy",
        "reinforcement": 7,
        "cf": 16,
        "lf": 16,
        "rcf": 8,
        "rptype": "us_navy",
    },
    {
        id: "franklin",
        "faction": AP,
        "name": "Franklin",
        "counter": "big_units_blue big unit_ix_21",
        "class": "naval",
        "type": "cv",
        "service": "navy",
        "cf": 14,
        "lf": 14,
        "br": 2,
        "rcf": 10,
        "rptype": "us_navy",
        "reinforcement": 7,
    },
    {
        id: "intrepid",
        "faction": AP,
        "name": "Intrepid",
        "counter": "big_units_blue big unit_ix_20",
        "class": "naval",
        "type": "cv",
        "service": "navy",
        "cf": 14,
        "lf": 14,
        "br": 2,
        "rcf": 10,
        "rptype": "us_navy",
        "reinforcement": 7,
    },
    {
        id: "bataan",
        "faction": AP,
        "name": "Bataan",
        "class": "naval",
        "counter": "big_units_blue big unit_ix_19",
        "type": "cvl",
        "service": "navy",
        "cf": 10,
        "lf": 10,
        "br": 2,
        "rcf": 7,
        "rptype": "us_navy",
        "reinforcement": 7,
    },
    {
        id: "hancock",
        "faction": AP,
        "counter": "big_units_blue big unit_ix_24",
        "name": "Hancock",
        "class": "naval",
        "type": "cv",
        "service": "navy",
        "cf": 14,
        "lf": 14,
        "br": 2,
        "rcf": 10,
        "rptype": "us_navy",
        "reinforcement": 8,
    },
    {
        id: "casablanca",
        "faction": AP,
        "name": "Casablanca",
        "counter": "big_units_blue big unit_ix_23",
        "class": "naval",
        "type": "cve",
        "service": "navy",
        "cf": 6,
        "lf": 8,
        "br": 2,
        "rcf": 3,
        "rptype": "us_navy",
        "reinforcement": 8,
    },
    {
        id: "shangri",
        "faction": AP,
        "name": "Shangri-La",
        "counter": "big_units_blue big unit_ix_27",
        "class": "naval",
        "type": "cv",
        "service": "navy",
        "cf": 14,
        "lf": 14,
        "br": 2,
        "rcf": 10,
        "rptype": "us_navy",
        "reinforcement": 9,
    },
    {
        id: "missouri",
        "faction": AP,
        "name": "Missouri",
        "counter": "big_units_blue big unit_ix_26",
        "class": "naval",
        "type": "bb",
        "service": "navy",
        "reinforcement": 9,
        "cf": 16,
        "lf": 16,
        "rcf": 8,
        "rptype": "us_navy",
    },
    {
        id: "newyork",
        "faction": AP,
        "name": "New York",
        "counter": "big_units_blue big unit_ix_25",
        "class": "naval",
        "type": "bb",
        "service": "navy",
        "reinforcement": 9,
        "cf": 16,
        "lf": 16,
        "rcf": 8,
        "rptype": "us_navy",
    },
    {
        id: "richard",
        "faction": AP,
        "name": "B.H. Richard",
        "counter": "big_units_blue big unit_ix_30",
        "class": "naval",
        "type": "cv",
        "service": "navy",
        "cf": 14,
        "lf": 14,
        "br": 2,
        "rcf": 10,
        "rptype": "us_navy",
        "reinforcement": 10,
    },
    {
        id: "alaska",
        "faction": AP,
        "name": "Alaska",
        "class": "naval",
        "counter": "big_units_blue big unit_ix_29",
        "type": "bc",
        "service": "navy",
        "reinforcement": 10,
        "cf": 10,
        "lf": 12,
        "rcf": 5,
        "rptype": "us_navy",
    },
    {
        id: "stlo",
        "faction": AP,
        "name": "St. Lo",
        "counter": "big_units_blue big unit_ix_28",
        "class": "naval",
        "type": "cve",
        "service": "navy",
        "cf": 6,
        "lf": 8,
        "br": 2,
        "rcf": 3,
        "rptype": "us_navy",
        "reinforcement": 10,
    },
    {
        id: "cbay",
        "faction": AP,
        "name": "Commencement Bay",
        "counter": "big_units_blue big unit_ix_32",
        "class": "naval",
        "type": "cve",
        "service": "navy",
        "cf": 6,
        "lf": 8,
        "br": 2,
        "rcf": 3,
        "rptype": "us_navy",
        "reinforcement": 10,
    },
    {
        id: "baltimore",
        "faction": AP,
        "name": "Baltimore",
        "counter": "big_units_blue big unit_ix_31",
        "class": "naval",
        "type": "ca",
        "service": "navy",
        "cf": 8,
        "lf": 10,
        "rcf": 4,
        "rptype": "us_navy",
        "reinforcement": 11,
    },
    {
        id: "duke",
        "faction": AP,
        "name": "Duke of York",
        "counter": "big_units_beige big unit_ix_4",
        "class": "naval",
        "type": "bb",
        "service": "br",
        "cf": 20,
        "lf": 16,
        "rcf": 10,
        "rptype": "com_navy",
        "reinforcement": 10,
    },
    {
        id: "victorious",
        "faction": AP,
        "name": "Victorious",
        "counter": "big_units_beige big unit_ix_9",
        "class": "naval",
        "type": "cv",
        "service": "br",
        "cf": 12,
        "lf": 14,
        "br": 2,
        "rcf": 6,
        "rptype": "com_navy",
        "reinforcement": 10,
    },
    {
        id: "army_ap_5_cn",
        "faction": AP,
        "name": "Chinese 5th Army",
        "counter": "small_units_red unit_ix_2",
        "class": "ground",
        "service": "ch",
        "rptype": "ch_ground",
        "start": 2407,
        "size": 4,
        "cf": 5,
        "lf": 12,
        "rcf": 3,
        "start_reduced": true,
    },
    {
        id: "army_ap_6_cn",
        "faction": AP,
        "name": "Chinese 6th Army",
        "counter": "small_units_red unit_ix_3",
        "class": "ground",
        "service": "ch",
        "rptype": "ch_ground",
        "start": 2407,
        "size": 4,
        "cf": 5,
        "lf": 12,
        "rcf": 3,
        "start_reduced": true,
    },
    {
        id: "army_ap_66_cn",
        "faction": AP,
        "name": "Chinese 66th Army",
        "counter": "small_units_red unit_ix_1",
        "class": "ground",
        "service": "ch",
        "rptype": "ch_ground",
        "start": 2407,
        "size": 4,
        "cf": 6,
        "lf": 12,
        "rcf": 4,
        "start_reduced": true,
    },
    {
        id: "army_ap_w",
        "faction": AP,
        "name": "Wake Island Brigade",
        "class": "ground",
        "counter": "small_units_blue unit_ix_2",
        "type": "marine",
        "service": "navy",
        "start": 4612,
        "size": 1,
        "cf": 2,
        "lf": 6,
        "rcf": 2,
        "start_reduced": true,
        "notreplaceable": true,
    },
    {
        id: "army_ap_nl",
        "faction": AP,
        "name": "NL Corps",
        "counter": "small_units_green unit_ix_1",
        "class": "ground",
        "service": "army",
        "start": 2812,
        "size": 3,
        "cf": 6,
        "lf": 10,
        "rcf": 3,
        "notreplaceable": true,
    },
    {
        id: "army_ap_r",
        "faction": AP,
        "name": "R Corps",
        "counter": "small_units_green unit_ix_2",
        "class": "ground",
        "service": "army",
        "start": 2813,
        "size": 3,
        "cf": 10,
        "lf": 10,
        "rcf": 5,
        "notreplaceable": true,
    },
    {
        id: "army_ap_sl",
        "faction": AP,
        "name": "SL Corps",
        "counter": "small_units_green unit_ix_3",
        "class": "ground",
        "service": "army",
        "start": 2913,
        "size": 3,
        "cf": 4,
        "lf": 10,
        "rcf": 2,
        "notreplaceable": true,
    },
    {
        id: "army_ap_m",
        "faction": AP,
        "name": "M Corps",
        "class": "ground",
        "counter": "small_units_green unit_ix_4",
        "service": "army",
        "start": 2915,
        "size": 3,
        "cf": 3,
        "lf": 10,
        "rcf": 1,
        "notreplaceable": true,
    },
    {
        id: "army_ap_p",
        "faction": AP,
        "name": "P Brigade",
        "counter": "small_units_green unit_ix_5",
        "class": "ground",
        "service": "army",
        "start": 3014,
        "size": 1,
        "cf": 1,
        "lf": 6,
        "rcf": 1,
        "start_reduced": true,
        "notreplaceable": true,
    },
    {
        id: "army_ap_10",
        "faction": AP,
        "name": "X Corps",
        "counter": "small_units_green unit_ix_6",
        "class": "ground",
        "service": "army",
        "start": 5808,
        "size": 3,
        "cf": 18,
        "lf": 12,
        "rcf": 9,
        "rptype": "ap_ground",
    },
    {
        id: "army_ap_1_au",
        "faction": AP,
        "name": "1st Australian Corps",
        "counter": "small_units_beige unit_ix_8",
        "class": "ground",
        "service": "au",
        "start": 3023,
        "size": 3,
        "cf": 12,
        "lf": 12,
        "rcf": 6,
        "rptype": "ap_ground",
    },
    {
        id: "army_ap_2_au",
        "faction": AP,
        "name": "2nd Australian Corps",
        "counter": "small_units_beige unit_ix_9",
        "class": "ground",
        "service": "au",
        "start": 3727,
        "size": 3,
        "cf": 12,
        "lf": 12,
        "rcf": 6,
        "rptype": "ap_ground",
    },
    {
        id: "army_ap_8_au",
        "faction": AP,
        "name": "8th Australian Division",
        "counter": "small_units_beige unit_ix_7",
        "class": "ground",
        "service": "au",
        "start": 2015,
        "size": 2,
        "cf": 6,
        "lf": 12,
        "rcf": 3,
        "notreplaceable": true,
    },
    {
        id: "army_ap_pm",
        "faction": AP,
        "name": "PM Brigade",
        "counter": "small_units_beige unit_ix_10",
        "class": "ground",
        "service": "au",
        "start": 3823,
        "size": 1,
        "cf": 5,
        "lf": 5,
        "rcf": 3,
        "notreplaceable": true,
    },
    {
        id: "army_ap_hk",
        "faction": AP,
        "name": "Hong Kong Division",
        "counter": "small_units_beige unit_ix_1",
        "class": "ground",
        "service": "br",
        "start": 2709,
        "size": 2,
        "cf": 3,
        "lf": 4,
        "rcf": 1,
        "notreplaceable": true,
    },
    {
        id: "army_ap_3_ind",
        "faction": AP,
        "name": "3rd Indian Corps",
        "counter": "small_units_beige unit_ix_18",
        "class": "ground",
        "service": "ind",
        "start": 2014,
        "size": 3,
        "cf": 9,
        "lf": 9,
        "rcf": 5,
        "notreplaceable": true,
    },
    {
        id: "army_ap_b_ind",
        "faction": AP,
        "name": "Burma Indian Division",
        "counter": "small_units_beige unit_ix_19",
        "class": "ground",
        "service": "bu",
        "start": 2008,
        "size": 2,
        "cf": 3,
        "lf": 5,
        "rcf": 1,
        "notreplaceable": true,
    },
    {
        id: "army_ap_1_bu",
        "faction": AP,
        "name": "1st Burma Division",
        "counter": "small_units_beige unit_ix_15",
        "class": "ground",
        "service": "bu",
        "start": 2108,
        "size": 2,
        "cf": 6,
        "lf": 4,
        "rcf": 3,
        "notreplaceable": true,
    },
    {
        id: "army_ap_1_ind",
        "faction": AP,
        "name": "1st Indian Corps",
        "counter": "small_units_beige unit_ix_16",
        "class": "ground",
        "service": "ind",
        "start": 2105,
        "size": 3,
        "cf": 12,
        "lf": 12,
        "rcf": 8,
        "notreplaceable": true,
    },
    {
        id: "army_ap_2_ind",
        "faction": AP,
        "name": "2nd Indian Corps",
        "counter": "small_units_beige unit_ix_17",
        "class": "ground",
        "service": "ind",
        "start": 1905,
        "size": 3,
        "cf": 12,
        "lf": 12,
        "rcf": 8,
        "notreplaceable": true,
    },
    {
        id: "army_ap_1_du",
        "faction": AP,
        "name": "1st Regiment",
        "counter": "small_units_orange unit_ix_2",
        "class": "ground",
        "service": "du",
        "start": 1916,
        "size": 1,
        "cf": 1,
        "lf": 6,
        "rcf": 1,
        "start_reduced": true,
        "notreplaceable": true,
    },
    {
        id: "army_ap_2_du",
        "faction": AP,
        "name": "2nd Regiment",
        "counter": "small_units_orange unit_ix_3",
        "class": "ground",
        "service": "du",
        "start": 1813,
        "size": 1,
        "cf": 1,
        "lf": 6,
        "rcf": 1,
        "start_reduced": true,
        "notreplaceable": true,
    },
    {
        id: "army_ap_3_du",
        "faction": AP,
        "name": "3rd Regiment",
        "counter": "small_units_orange unit_ix_4",
        "class": "ground",
        "service": "du",
        "start": 2616,
        "size": 1,
        "cf": 1,
        "lf": 6,
        "rcf": 1,
        "start_reduced": true,
        "notreplaceable": true,
    },
    {
        id: "army_ap_4_du",
        "faction": AP,
        "name": "4th Regiment",
        "counter": "small_units_orange unit_ix_5",
        "class": "ground",
        "service": "du",
        "start": 2919,
        "size": 1,
        "cf": 1,
        "lf": 6,
        "rcf": 1,
        "start_reduced": true,
        "notreplaceable": true,
    },
    {
        id: "army_ap_5_du",
        "faction": AP,
        "name": "5th Regiment",
        "counter": "small_units_orange unit_ix_6",
        "class": "ground",
        "service": "du",
        "start": 2517,
        "size": 1,
        "cf": 1,
        "lf": 6,
        "rcf": 1,
        "start_reduced": true,
        "notreplaceable": true,
    },
    {
        id: "army_ap_6_du",
        "faction": AP,
        "name": "6th Regiment",
        "counter": "small_units_orange unit_ix_7",
        "class": "ground",
        "service": "du",
        "start": 2917,
        "size": 1,
        "cf": 1,
        "lf": 6,
        "rcf": 1,
        "start_reduced": true,
        "notreplaceable": true,
    },
    {
        id: "army_ap_7_du",
        "faction": AP,
        "name": "7th Regiment",
        "class": "ground",
        "counter": "small_units_orange unit_ix_8",
        "service": "du",
        "start": 2719,
        "size": 1,
        "cf": 1,
        "lf": 6,
        "rcf": 1,
        "start_reduced": true,
        "notreplaceable": true,
    },
    {
        id: "army_ap_8_du",
        "faction": AP,
        "name": "8th Regiment",
        "counter": "small_units_orange unit_ix_9",
        "class": "ground",
        "service": "du",
        "start": 2721,
        "size": 1,
        "cf": 1,
        "lf": 6,
        "rcf": 1,
        "start_reduced": true,
        "notreplaceable": true,
    },
    {
        id: "army_ap_j",
        "faction": AP,
        "name": "Java Division",
        "counter": "small_units_orange unit_ix_10",
        "class": "ground",
        "service": "du",
        "start": 2019,
        "size": 2,
        "cf": 6,
        "lf": 12,
        "rcf": 3,
        "notreplaceable": true,
    },
    {
        id: "army_ap_7",
        "faction": AP,
        "name": "7th Armored Brigade",
        "class": "ground",
        "counter": "small_units_beige unit_ix_14",
        "service": "br",
        "size": 1,
        "cf": 4,
        "lf": 10,
        "rcf": 2,
        "rptype": "ap_ground"
    },
    {
        id: "army_ap_77",
        "faction": AP,
        "name": "77th Brigade",
        "counter": "small_units_beige unit_ix_6",
        "class": "ground",
        "service": "br",
        "size": 1,
        "cf": 6,
        "lf": 6,
        "rcf": 4,
        "rptype": "ap_ground"
    },
    {
        id: "army_ap_4_m",
        "faction": AP,
        "name": "4th Marine Division",
        "counter": "small_units_blue unit_ix_8",
        "class": "ground",
        "type": "marine",
        "service": "navy",
        "size": 2,
        "cf": 12,
        "lf": 12,
        "rcf": 8,
        "rptype": "ap_ground"
    },
    {
        id: "army_ap_11",
        "faction": AP,
        "name": "XI Corps",
        "class": "ground",
        "counter": "small_units_green unit_ix_9",
        "service": "army",
        "size": 3,
        "cf": 22,
        "lf": 12,
        "rcf": 11,
        "rptype": "ap_ground",
        "reinforcement": 2,
    },
    {
        id: "army_ap_14",
        "faction": AP,
        "name": "XIV Corps",
        "counter": "small_units_green unit_ix_8",
        "class": "ground",
        "service": "army",
        "size": 3,
        "cf": 22,
        "lf": 12,
        "rcf": 11,
        "rptype": "ap_ground",
        "reinforcement": 3,
        "start_reduced": true,
    },
    {
        id: "army_ap_1",
        "faction": AP,
        "name": "I Corps",
        "class": "ground",
        "service": "army",
        "counter": "small_units_green unit_ix_7",
        "size": 3,
        "cf": 22,
        "lf": 12,
        "rcf": 11,
        "rptype": "ap_ground",
        "reinforcement": 3,
        "start_reduced": true,
    },
    {
        id: "army_ap_24",
        "faction": AP,
        "name": "XXIV Corps",
        "counter": "small_units_green unit_ix_10",
        "class": "ground",
        "service": "army",
        "size": 3,
        "cf": 22,
        "lf": 12,
        "rcf": 11,
        "rptype": "ap_ground",
        "reinforcement": 5,
    },
    {
        id: "army_ap_9",
        "faction": AP,
        "name": "IX Corps",
        "counter": "small_units_green unit_ix_11",
        "class": "ground",
        "service": "army",
        "size": 3,
        "cf": 22,
        "lf": 12,
        "rcf": 11,
        "rptype": "ap_ground",
        "reinforcement": 8,
    },
    {
        id: "army_ap_11_d",
        "faction": AP,
        "name": "11th Airborne Division",
        "counter": "small_units_green unit_ix_12",
        "class": "ground",
        "service": "army",
        "size": 2,
        "cf": 9,
        "lf": 12,
        "rcf": 6,
        "rptype": "ap_ground",
        "reinforcement": 8,
    },
    {
        id: "army_ap_mb",
        "faction": AP,
        "name": "Marine Brigade",
        "counter": "small_units_blue unit_ix_6",
        "class": "ground",
        "type": "marine",
        "service": "navy",
        "size": 1,
        "cf": 8,
        "lf": 8,
        "rcf": 4,
        "rptype": "ap_ground",
        "reinforcement": 2,
    },
    {
        id: "army_ap_sf",
        "faction": AP,
        "name": "SF Brigade",
        "counter": "small_units_blue unit_ix_7",
        "class": "ground",
        "service": "navy",
        "size": 1,
        "cf": 4,
        "lf": 6,
        "rcf": 2,
        "rptype": "ap_ground",
        "reinforcement": 2,
    },
    {
        id: "army_ap_1_m",
        "faction": AP,
        "name": "1st Marine Division",
        "counter": "small_units_blue unit_ix_8",
        "class": "ground",
        "type": "marine",
        "service": "navy",
        "size": 2,
        "cf": 12,
        "lf": 12,
        "rcf": 8,
        "rptype": "ap_ground",
        "reinforcement": 3,
    },
    {
        id: "army_ap_2_m",
        "faction": AP,
        "name": "2nd Marine Division",
        "counter": "small_units_blue unit_ix_9",
        "class": "ground",
        "type": "marine",
        "service": "navy",
        "size": 2,
        "cf": 12,
        "lf": 12,
        "rcf": 8,
        "rptype": "ap_ground",
        "reinforcement": 4,
    },
    {
        id: "army_ap_3_m",
        "faction": AP,
        "name": "3rd Marine Division",
        "counter": "small_units_blue unit_ix_10",
        "class": "ground",
        "type": "marine",
        "service": "navy",
        "size": 2,
        "cf": 12,
        "lf": 12,
        "rcf": 8,
        "rptype": "ap_ground",
        "reinforcement": 6,
    },
    {
        id: "army_ap_6_m",
        "faction": AP,
        "name": "6th Marine Division",
        "counter": "small_units_blue unit_ix_11",
        "class": "ground",
        "type": "marine",
        "service": "navy",
        "size": 2,
        "cf": 12,
        "lf": 12,
        "rcf": 8,
        "rptype": "ap_ground",
        "reinforcement": 8,
    },
    {
        id: "army_ap_5_m",
        "faction": AP,
        "name": "5th Marine Division",
        "counter": "small_units_blue unit_ix_12",
        "class": "ground",
        "type": "marine",
        "service": "navy",
        "size": 2,
        "cf": 12,
        "lf": 12,
        "rcf": 8,
        "rptype": "ap_ground",
        "reinforcement": 10,
    },
    {
        id: "army_ap_15",
        "faction": AP,
        "name": "15th Corps",
        "class": "ground",
        "counter": "small_units_beige unit_ix_2",
        "service": "br",
        "size": 3,
        "cf": 16,
        "lf": 12,
        "rcf": 8,
        "rptype": "ap_ground",
        "reinforcement": 3,
    },
    {
        id: "army_ap_33",
        "faction": AP,
        "name": "33rd Corps",
        "counter": "small_units_beige unit_ix_3",
        "class": "ground",
        "service": "br",
        "size": 3,
        "cf": 20,
        "lf": 12,
        "rcf": 10,
        "rptype": "ap_ground",
        "reinforcement": 3,
    },
    {
        id: "army_ap_3_au",
        "faction": AP,
        "name": "3rd Australian Corps",
        "class": "ground",
        "counter": "small_units_beige unit_ix_11",
        "service": "au",
        "size": 3,
        "cf": 22,
        "lf": 12,
        "rcf": 11,
        "rptype": "ap_ground",
        "reinforcement": 3,
    },
    {
        id: "army_ap_3_nz",
        "faction": AP,
        "name": "3rd New Zealand Division",
        "counter": "small_units_beige unit_ix_12",
        "class": "ground",
        "service": "br",
        "size": 2,
        "cf": 9,
        "lf": 12,
        "rcf": 6,
        "rptype": "ap_ground",
        "reinforcement": 3,
    },
    {
        id: "army_ap_4_ind",
        "faction": AP,
        "name": "4th Indian Corps",
        "counter": "small_units_beige unit_ix_20",
        "class": "ground",
        "service": "ind",
        "size": 3,
        "cf": 16,
        "lf": 12,
        "rcf": 8,
        "rptype": "ap_ground",
        "reinforcement": 4,
    },
    {
        id: "army_ap_4_au",
        "faction": AP,
        "name": "4th Australian Corps",
        "counter": "small_units_beige unit_ix_13",
        "class": "ground",
        "service": "au",
        "size": 3,
        "cf": 20,
        "lf": 12,
        "rcf": 10,
        "rptype": "ap_ground",
        "reinforcement": 8,
    },
]


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

const HQ_LIST = []

for (let i = 1; i < pieces.length; i++) {
    if (pieces[i].class === "hq") {
        set_add(HQ_LIST, i)
    }
}

//Fill units data
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

function ap_air(id) {
    return find_piece("air_ap_" + id)
}

function ap_army(id) {
    return find_piece("army_ap_" + id)
}

function jp_air(id) {
    return find_piece("air_jp_" + id)
}

function jp_army(id) {
    return find_piece("army_jp_" + id)
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
}/** import common/data_pieces.js*/
/** import common/data_cards.js*/
var cards = [
    {},
    {
        "num": 1,
        "faction": AP,
        "ops": 1,
        "type": POLITICAL,
        "oc": 1,
        "pw": 1,
        "remove": true,
        "name": "Battan Death March",
    },
    {
        "num": 2,
        "faction": AP,
        "ops": 1,
        "type": POLITICAL,
        "oc": 1,
        "draw": true,
        "isr_rivalry": true,
        "name": "Imperial HQ Debate",
    },
    {
        "num": 3,
        "faction": AP,
        "ops": 1,
        "type": RESOURCE,
        "oc": 1,
        "remove": true,
        "name": "Prime Minister Curtin",
    },
    {
        "num": 4,
        "faction": AP,
        "ops": 1,
        "type": POLITICAL,
        "oc": 1,
        "remove": true,
        "isr_agreement": true,
        "name": "Arcadia Conference",
    },
    {
        "num": 5,
        "faction": AP,
        "ops": 2,
        "type": COUNTER_OFFENSIVE,
        "oc": 2,
        "logistic": 3,
        "intelligence": INTERCEPT,
        "name": "Operation Matador",
    },
    {
        "num": 6,
        "faction": AP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 3,
        "remove": true,
        "pw": 1,
        "name": "Doolittle Raid",
    },
    {
        "num": 7,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "remove": true,
        "logistic": 4,
        "hq": [HQ_SEAC],
        "name": "`Vinegar` Joe Stilwell",
    },
    {
        "num": 8,
        "faction": AP,
        "ops": 1,
        "type": INTELLIGENCE,
        "oc": 1,
        "remove": true,
        "draw": true,
        "intelligence": INTERCEPT,
        "name": "Australian Coast Watchers",
    },
    {
        "num": 9,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 12,
        "hq": [HQ_SOUTH_WEST, HQ_CENTRAL_PACIFIC],
        "name": "Olympic and Coronet",
    },
    {
        "num": 10,
        "faction": AP,
        "ops": 1,
        "type": POLITICAL,
        "oc": 1,
        "remove": true,
        "isr_agreement": true,
        "name": "General Douglas MacArthur",
    },
    {
        "num": 11,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "remove": true,
        "cause": "Minor allied victory",
        "wie": [-1, -1, -2, -3],
        "name": "War in europe",
    },
    {
        "num": 12,
        "faction": AP,
        "ops": 2,
        "type": INTELLIGENCE,
        "oc": 2,
        "remove": true,
        "intelligence": AMBUSH,
        "name": "Commander Rochefort",
    },
    {
        "num": 13,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "intelligence": SURPRISE,
        "logistic": 5,
        "name": "Operation Watchtower",
    },
    {
        "num": 14,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "remove": true,
        "cause": "Minor allied victory",
        "wie": [-1, -1, -2, -3],
        "name": "War in europe",
    },
    {
        "num": 15,
        "faction": AP,
        "ops": 2,
        "type": RESOURCE,
        "oc": 2,
        "name": "Heroic Repair",
    },
    {
        "num": 16,
        "faction": AP,
        "ops": 1,
        "type": RESOURCE,
        "oc": 1,
        "remove": true,
        "name": "Makin Is. Raid",
    },
    {
        "num": 17,
        "faction": AP,
        "ops": 2,
        "type": RESOURCE,
        "oc": 2,
        "remove": true,
        "name": "China Airlift",
    },
    {
        "num": 18,
        "faction": AP,
        "ops": 1,
        "type": RESOURCE,
        "oc": 1,
        "remove": true,
        "name": "Edwin Booz",
    },
    {
        "num": 19,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 3,
        "name": "Anakim Operation",
    },
    {
        "num": 20,
        "faction": AP,
        "ops": 1,
        "type": MILITARY,
        "oc": 1,
        "ec": 3,
        "logistic": 4,
        "hq": [HQ_SOUTH_HELSEY],
        "remove": true,
        "name": "Halsey Replaces Ghormley",
    },
    {
        "num": 21,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 4,
        "logistic_alt": [[HQ_SOUTH_WEST], 6],
        "name": "Operation Cartwheel",
    },
    {
        "num": 22,
        "faction": AP,
        "ops": 2,
        "type": CANCEL,
        "oc": 2,
        "remove": true,
        "name": "Orde Wingate",
    },
    {
        "num": 23,
        "faction": AP,
        "ops": 2,
        "type": RESOURCE,
        "oc": 2,
        "remove": true,
        "draw": true,
        "name": "PT Boats",
    },
    {
        "num": 24,
        "faction": AP,
        "ops": 2,
        "type": REACTION,
        "stage": BEFORE_COMBAT,
        "oc": 2,
        "remove": true,
        "draw": true,
        "name": "Skip Bombing Attack",
    },
    {
        "num": 25,
        "faction": AP,
        "ops": 1,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 3,
        "hq": [HQ_SOUTH_WEST],
        "name": "Operation Lilliput",
    },
    {
        "num": 26,
        "faction": AP,
        "ops": 2,
        "type": INTELLIGENCE,
        "oc": 2,
        "remove": true,
        "intelligence": AMBUSH,
        "name": "US Army Breaks Japanese Army Codes",
    },
    {
        "num": 27,
        "faction": AP,
        "ops": 1,
        "type": RESOURCE,
        "oc": 1,
        "remove": true,
        "name": "Operation Vengeance",
    },
    {
        "num": 28,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 3,
        "name": "Operation Chronicle",
    },
    {
        "num": 29,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 4,
        "name": "Operation Toenails",
    },
    {
        "num": 30,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 4,
        "name": "Operation Sandcrab-Cottage",
    },
    {
        "num": 31,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 6,
        "name": "Black Day",
    },
    {
        "num": 32,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 4,
        "logistic_alt": [[HQ_SOUTH_WEST], 7],
        "name": "Operation Reno II",
    },
    {
        "num": 33,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 3,
        "name": "Quadrant Conference",
    },
    {
        "num": 34,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 4,
        "hq": [HQ_SEAC, HQ_MALAYA, HQ_ANZAC, HQ_ABDA],
        "name": "Operation Culevrin",
    },
    {
        "num": 35,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "logistic": 2,
        "intelligence": SURPRISE,
        "hq": [HQ_ANZAC],
        "name": "Operation Ash",
    },
    {
        "num": 36,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 5,
        "name": "Operation Cherry Blossom",
    },
    {
        "num": 37,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "intelligence": SURPRISE,
        "logistic": 6,
        "name": "Operation Galvanic",
    },
    {
        "num": 38,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 4,
        "name": "Operation Tarzan",
    },
    {
        "num": 39,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "remove": true,
        "name": "Sextant Conference",
    },
    {
        "num": 40,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 3,
        "logistic_alt": [[HQ_SOUTH_WEST], 5],
        "name": "Operation Dexterity",
    },
    {
        "num": 41,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "remove": true,
        "cause": "Minor allied victory",
        "wie": [-1, -1, -2, -3],
        "name": "War in europe",
    },
    {
        "num": 42,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "remove": true,
        "cause": "Minor allied victory",
        "wie": [-1, -1, -2, -3],
        "name": "War in europe",
    },
    {
        "num": 43,
        "faction": AP,
        "ops": 1,
        "type": POLITICAL,
        "oc": 1,
        "draw": true,
        "isr_rivalry": true,
        "name": "Japanese Army/Navy Dispute",
    },
    {
        "num": 44,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "intelligence": SURPRISE,
        "logistic": 2,
        "hq": [HQ_ANZAC],
        "name": "Operation Squarepeg",
    },
    {
        "num": 45,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 4,
        "logistic_alt": [[HQ_CENTRAL_PACIFIC], 8],
        "name": "Operation Flintlock",
    },
    {
        "num": 46,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "intelligence": SURPRISE,
        "logistic": 1,
        "hq": [HQ_SOUTH_WEST],
        "name": "Operation Brewer",
    },
    {
        "num": 47,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "remove": true,
        "cause": "Major allied victory",
        "wie": [-1, -2, -3, -3],
        "name": "War in europe",
    },
    {
        "num": 48,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 3,
        "logistic_alt": [[HQ_SEAC], 4],
        "name": "New China Army",
    },
    {
        "num": 49,
        "faction": AP,
        "ops": 1,
        "type": POLITICAL,
        "oc": 1,
        "remove": true,
        "china": -1,
        "name": "Roosevelt Threatens Chungking",
    },
    {
        "num": 50,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 3,
        "logistic_alt": [[HQ_SOUTH_WEST], 4],
        "name": "Tornado Taskforce",
    },
    {
        "num": 51,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 4,
        "remove": true,
        "name": "Chenault",
    },
    {
        "num": 52,
        "faction": AP,
        "ops": 1,
        "type": POLITICAL,
        "oc": 1,
        "remove": true,
        "isr_agreement": true,
        "name": "Roosevelt-Nimitz-MacArthur",
    },
    {
        "num": 53,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 4,
        "logistic_alt": [[HQ_CENTRAL_PACIFIC], 6],
        "name": "Operation Forager II",
    },
    {
        "num": 54,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 3,
        "logistic_alt": [[HQ_SOUTH_WEST], 4],
        "name": "Hurricane Taskforce",
    },
    {
        "num": 55,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 4,
        "logistic_alt": [[HQ_CENTRAL_PACIFIC], 6],
        "name": "Operation Forager",
    },
    {
        "num": 56,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 3,
        "logistic_alt": [[HQ_SOUTH_WEST], 4],
        "name": "Typhoon Taskforce",
    },
    {
        "num": 57,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 5,
        "hq": [HQ_SEAC, HQ_MALAYA, HQ_ANZAC, HQ_ABDA],
        "name": "Axiom",
    },
    {
        "num": 58,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 4,
        "hq": [HQ_SEAC],
        "name": "Operation Romulus",
    },
    {
        "num": 59,
        "faction": AP,
        "ops": 1,
        "type": INTELLIGENCE,
        "oc": 1,
        "intelligence": INTERCEPT,
        "draw": true,
        "name": "Ultra Information",
    },
    {
        "num": 60,
        "faction": AP,
        "ops": 3,
        "type": RESOURCE,
        "oc": 3,
        "remove": true,
        "name": "20th Bomber Command",
    },
    {
        "num": 61,
        "faction": AP,
        "ops": 1,
        "type": REACTION,
        "oc": 1,
        "draw": true,
        "remove": true,
        "stage": BEFORE_COMBAT,
        "name": "Submarine Attack",
    },
    {
        "num": 62,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 6,
        "logistic_alt": [[HQ_SOUTH_WEST], 8],
        "remove": true,
        "name": "Operation King II",
    },
    {
        "num": 63,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 4,
        "logistic_alt": [[HQ_CENTRAL_PACIFIC], 6],
        "name": "Operation Stalemate",
    },
    {
        "num": 64,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 3,
        "logistic_alt": [[HQ_SOUTH_WEST], 4],
        "name": "Tradewind Taskforce",
    },
    {
        "num": 65,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 6,
        "logistic_alt": [[HQ_SOUTH_WEST], 8],
        "remove": true,
        "name": "MacArthur `moral obligation`",
    },
    {
        "num": 66,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "remove": true,
        "cause": "Major allied victory",
        "wie": [-1, -2, -3, -3],
        "name": "War in europe",
    },
    {
        "num": 67,
        "faction": AP,
        "ops": 3,
        "type": RESOURCE,
        "oc": 3,
        "remove": true,
        "name": "Curtis LeMay",
    },
    {
        "num": 68,
        "faction": AP,
        "ops": 1,
        "type": REACTION,
        "oc": 1,
        "draw": true,
        "remove": true,
        "stage": AFTER_COMBAT,
        "name": "Submarine Attack",
    },
    {
        "num": 69,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 6,
        "logistic_alt": [[HQ_SOUTH_WEST], 8],
        "name": "S-Day",
    },
    {
        "num": 70,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 6,
        "hq": [HQ_SEAC],
        "remove": true,
        "name": "Slim's Burma Offensive",
    },
    {
        "num": 71,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 4,
        "logistic_alt": [[HQ_SOUTH_WEST], 6],
        "name": "Victor Plans",
    },
    {
        "num": 72,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 4,
        "logistic_alt": [[HQ_CENTRAL_PACIFIC], 8],
        "name": "Halsey",
    },
    {
        "num": 73,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "remove": true,
        "cause": "Major allied victory",
        "wie": [-1, -2, -3, -3],
        "name": "War in europe",
    },
    {
        "num": 74,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 4,
        "logistic_alt": [[HQ_CENTRAL_PACIFIC], 8],
        "name": "Operation Iceberg",
    },
    {
        "num": 75,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 4,
        "logistic_alt": [[HQ_CENTRAL_PACIFIC], 8],
        "name": "Operation Detachment",
    },
    {
        "num": 76,
        "faction": AP,
        "ops": 2,
        "type": MILITARY,
        "oc": 2,
        "ec": 4,
        "logistic": 5,
        "name": "Oboe",
    },
    {
        "num": 77,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "remove": true,
        "china": -1,
        "name": "Mao Tse Tung",
    },
    {
        "num": 78,
        "faction": AP,
        "ops": 1,
        "type": REACTION,
        "oc": 1,
        "draw": true,
        "remove": true,
        "stage": BEFORE_COMBAT,
        "name": "Submarine Attack",
    },
    {
        "num": 79,
        "faction": AP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 3,
        "remove": true,
        "reshuffle": true,
        "name": "Soviet Invade Manchuria",
    },
    {
        "num": 80,
        "faction": AP,
        "ops": 1,
        "type": RESOURCE,
        "oc": 1,
        "remove": true,
        "draw": true,
        "name": "New Submarine Doctrine",
    },
    {
        "num": 81,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "china": -1,
        "name": "China Offensive",
    },
    {
        "num": 82,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "china": -1,
        "name": "China Offensive",
    },
    {
        "num": 83,
        "faction": AP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 2,
        "china": -1,
        "name": "China Offensive",
    },
    {
        "num": 84,
        "faction": AP,
        "ops": 3,
        "type": MILITARY,
        "oc": 3,
        "remove": true,
        "logistic": 0,
        "intelligence": SURPRISE,
        "hq": [HQ_CENTRAL_PACIFIC],
        "name": "U.S. Carrier Raids",
    },
    {
        "num": 1,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "remove": true,
        "intelligence": SURPRISE,
        "name": "Operation Z",
    },
    {
        "num": 2,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "remove": true,
        "intelligence": SURPRISE,
        "logistic": 20,
        "name": "IAI - Operation No. 1",
    },
    {
        "num": 3,
        "faction": JP,
        "ops": 2,
        "type": MILITARY,
        "oc": 4,
        "logistic": 3,
        "intelligence": SURPRISE,
        "name": "Col. Tsuji, Unit 82",
    },
    {
        "num": 4,
        "faction": JP,
        "ops": 1,
        "type": INTELLIGENCE,
        "oc": 3,
        "intelligence": INTERCEPT,
        "draw": true,
        "name": "JN25 Code Change",
    },
    {
        "num": 5,
        "faction": JP,
        "ops": 2,
        "type": RESOURCE,
        "oc": 4,
        "remove": true,
        "name": "Japanese Aircraft Production Efficiency",
    },
    {
        "num": 6,
        "faction": JP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 4,
        "remove": true,
        "china": 1,
        "name": "Doolittle Raid Reprisal",
    },
    {
        "num": 7,
        "faction": JP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 4,
        "draw": true,
        "isr_rivalry": true,
        "name": "US Joint Staff Debate",
    },
    {
        "num": 8,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 4,
        "name": "Operation C",
    },
    {
        "num": 9,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 6,
        "name": "Rear Admiral Matami Ugaki",
    },
    {
        "num": 10,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 6,
        "name": "2nd Operational Phase",
    },
    {
        "num": 11,
        "faction": JP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 4,
        "draw": true,
        "isr_rivalry": true,
        "name": "US/British Second Front Conference",
    },
    {
        "num": 12,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 8,
        "logistic": 8,
        "name": "Operation MI",
    },
    {
        "num": 13,
        "faction": JP,
        "ops": 2,
        "type": INTELLIGENCE,
        "oc": 4,
        "intelligence": INTERCEPT,
        "remove": true,
        "name": "JN25 Code Change",
    },
    {
        "num": 14,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 5,
        "name": "Operation MO",
    },
    {
        "num": 15,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "remove": true,
        "name": "Mahatma Gandhi",
    },
    {
        "num": 16,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 4,
        "name": "Operation RI",
    },
    {
        "num": 17,
        "faction": JP,
        "ops": 2,
        "type": COUNTER_OFFENSIVE,
        "oc": 4,
        "logistic": 3,
        "intelligence": INTERCEPT,
        "draw": true,
        "name": "Japanese Counterattack at Savo Island",
    },
    {
        "num": 18,
        "faction": JP,
        "ops": 1,
        "type": POLITICAL,
        "oc": 3,
        "remove": true,
        "name": "Bridge on River Kwai",
    },
    {
        "num": 19,
        "faction": JP,
        "ops": 2,
        "type": CANCEL,
        "oc": 4,
        "remove": true,
        "name": "Weather",
    },
    {
        "num": 20,
        "faction": JP,
        "ops": 2,
        "type": MILITARY,
        "oc": 3,
        "ec": 5,
        "logistic": 5,
        "name": "Naval Battle of Guadalcanal",
    },
    {
        "num": 21,
        "faction": JP,
        "ops": 3,
        "type": CANCEL,
        "oc": 5,
        "remove": true,
        "draw": true,
        "name": "Mahatma Gandhi",
    },
    {
        "num": 22,
        "faction": JP,
        "ops": 2,
        "type": CANCEL,
        "oc": 4,
        "remove": true,
        "name": "Weather",
    },
    {
        "num": 23,
        "faction": JP,
        "ops": 2,
        "type": MILITARY,
        "oc": 4,
        "ec": 6,
        "logistic": 3,
        "name": "Operation RE",
    },
    {
        "num": 24,
        "faction": JP,
        "ops": 1,
        "type": REACTION,
        "oc": 3,
        "draw": true,
        "stage": AFTER_COMBAT,
        "name": "Submarine Attack",
    },
    {
        "num": 25,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 4,
        "name": "Operation KA",
    },
    {
        "num": 26,
        "faction": JP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 4,
        "remove": true,
        "china": 1,
        "name": "Chiang Kai-shek",
    },
    {
        "num": 27,
        "faction": JP,
        "ops": 1,
        "type": REACTION,
        "oc": 3,
        "draw": true,
        "stage": AFTER_COMBAT,
        "name": "Submarine Attack",
    },
    {
        "num": 28,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 4,
        "name": "Big Tokyo Express Operation",
    },
    {
        "num": 29,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 4,
        "name": "Combined Fleet",
    },
    {
        "num": 30,
        "faction": JP,
        "ops": 3,
        "type": RESOURCE,
        "oc": 5,
        "remove": true,
        "name": "Flight Instructors",
    },
    {
        "num": 31,
        "faction": JP,
        "ops": 3,
        "type": RESOURCE,
        "oc": 5,
        "remove": true,
        "name": "New Operation Plan",
    },
    {
        "num": 32,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 4,
        "name": "Operation I-Go",
    },
    {
        "num": 33,
        "faction": JP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 4,
        "isr_agreement": true,
        "name": "Imperial Intervention",
    },
    {
        "num": 34,
        "faction": JP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 4,
        "draw": true,
        "isr_rivalry": true,
        "name": "US Army/Navy Dispute",
    },
    {
        "num": 35,
        "faction": JP,
        "ops": 3,
        "type": RESOURCE,
        "oc": 5,
        "name": "Operation KE",
    },
    {
        "num": 36,
        "faction": JP,
        "ops": 1,
        "type": REACTION,
        "oc": 3,
        "draw": true,
        "stage": BEFORE_COMBAT,
        "name": "Submarine Attack",
    },
    {
        "num": 37,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 2,
        "remove": true,
        "hq": [HQ_YAMAMOTO, HQ_OZAWA],
        "name": "1st Convoy Escort Fleet",
    },
    {
        "num": 38,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 2,
        "remove": true,
        "hq": [HQ_YAMAMOTO, HQ_OZAWA],
        "name": "Grand Escort Command",
    },
    {
        "num": 39,
        "faction": JP,
        "ops": 2,
        "type": RESOURCE,
        "oc": 4,
        "remove": true,
        "name": "Subhas Chandra Bose",
    },
    {
        "num": 40,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 4,
        "name": "Operation U-Go",
    },
    {
        "num": 41,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "remove": true,
        "china": 1,
        "name": "Patrick Hurley",
    },
    {
        "num": 42,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "remove": true,
        "china": 1,
        "name": "Ichi-Go",
    },
    {
        "num": 43,
        "faction": JP,
        "ops": 1,
        "type": POLITICAL,
        "oc": 3,
        "pw": -2,
        "remove": true,
        "reshuffle": true,
        "name": "Tojo Resigns",
    },
    {
        "num": 44,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 4,
        "name": "Tokyo Express",
    },
    {
        "num": 45,
        "faction": JP,
        "ops": 3,
        "type": COUNTER_OFFENSIVE,
        "oc": 5,
        "logistic": 4,
        "logistic_alt": [[HQ_YAMAMOTO, HQ_OZAWA], 5],
        "intelligence": INTERCEPT,
        "remove": true,
        "name": "Operation Sho-Go",
    },
    {
        "num": 46,
        "faction": JP,
        "ops": 3,
        "type": COUNTER_OFFENSIVE,
        "oc": 5,
        "logistic": 4,
        "logistic_alt": [[HQ_YAMAMOTO, HQ_OZAWA], 5],
        "intelligence": INTERCEPT,
        "remove": true,
        "name": "Operation A-Go",
    },
    {
        "num": 47,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 7,
        "hq": [HQ_SOUTH_SEAS, HQ_JP_SOUTH],
        "name": "VADM Kondo",
    },
    {
        "num": 48,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 5,
        "hq": [HQ_SOUTH_SEAS, HQ_JP_SOUTH],
        "name": "General Adachi",
    },
    {
        "num": 49,
        "faction": JP,
        "ops": 1,
        "type": INTELLIGENCE,
        "oc": 3,
        "intelligence": INTERCEPT,
        "draw": true,
        "name": "JN25 Code Change",
    },
    {
        "num": 50,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 6,
        "hq": [HQ_SOUTH_SEAS, HQ_JP_SOUTH],
        "name": "Ha-Go",
    },
    {
        "num": 51,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "remove": true,
        "cause": "Minor axis victory",
        "wie": [2, 1],
        "name": "War in europe",
    },
    {
        "num": 52,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "remove": true,
        "cause": "Minor axis victory",
        "wie": [2, 1],
        "name": "War in europe",
    },
    {
        "num": 53,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "remove": true,
        "cause": "Minor axis victory",
        "wie": [2, 1],
        "name": "War in europe",
    },
    {
        "num": 54,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "remove": true,
        "cause": "Minor axis victory",
        "wie": [2, 1],
        "name": "War in europe",
    },
    {
        "num": 55,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "remove": true,
        "wie": [3, 2, 1],
        "cause": "Major axis victory",
        "name": "War in europe",
    },
    {
        "num": 56,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "remove": true,
        "cause": "Minor axis victory",
        "wie": [2, 1],
        "name": "War in europe",
    },
    {
        "num": 57,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "remove": true,
        "cause": "Minor axis victory",
        "wie": [2, 1],
        "name": "War in europe",
    },
    {
        "num": 58,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 5,
        "hq": [HQ_SOUTH_SEAS, HQ_JP_SOUTH],
        "name": "Western Force",
    },
    {
        "num": 59,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 5,
        "hq": [HQ_SOUTH_SEAS, HQ_JP_SOUTH],
        "name": "Central Force",
    },
    {
        "num": 60,
        "faction": JP,
        "ops": 3,
        "type": MILITARY,
        "oc": 5,
        "ec": 7,
        "logistic": 5,
        "hq": [HQ_SOUTH_SEAS, HQ_JP_SOUTH],
        "name": "East Force",
    },
    {
        "num": 61,
        "faction": JP,
        "ops": 2,
        "type": REACTION,
        "oc": 4,
        "draw": true,
        "stage": BEFORE_COMBAT,
        "kamikaze": true,
        "remove": true,
        "name": "Kamikaze Attack",
    },
    {
        "num": 62,
        "faction": JP,
        "ops": 2,
        "type": REACTION,
        "stage": BEFORE_COMBAT,
        "oc": 4,
        "draw": true,
        "kamikaze": true,
        "remove": true,
        "name": "Kamikaze Attack",
    },
    {
        "num": 63,
        "faction": JP,
        "ops": 2,
        "type": REACTION,
        "stage": BEFORE_COMBAT,
        "oc": 4,
        "draw": true,
        "kamikaze": true,
        "remove": true,
        "name": "Kamikaze Attack",
    },
    {
        "num": 64,
        "faction": JP,
        "ops": 2,
        "type": CANCEL,
        "oc": 4,
        "draw": true,
        "remove": true,
        "name": "Weather",
    },
    {
        "num": 65,
        "faction": JP,
        "ops": 1,
        "type": COUNTER_OFFENSIVE,
        "oc": 4,
        "intelligence": INTERCEPT,
        "remove": true,
        "name": "Yamato Suicide Run",
    },
    {
        "num": 66,
        "faction": JP,
        "ops": 2,
        "type": REACTION,
        "stage": BEFORE_COMBAT,
        "oc": 4,
        "draw": true,
        "remove": true,
        "kamikaze": true,
        "name": "Kamikaze Attack",
    },
    {
        "num": 67,
        "faction": JP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 4,
        "isr_agreement": true,
        "name": "Japanese Army/Navy",
    },
    {
        "num": 68,
        "faction": JP,
        "ops": 2,
        "type": POLITICAL,
        "oc": 4,
        "isr_agreement": true,
        "name": "Japanese Army/Navy",
    },
    {
        "num": 69,
        "faction": JP,
        "ops": 1,
        "type": INTELLIGENCE,
        "oc": 3,
        "intelligence": INTERCEPT,
        "draw": true,
        "name": "JN25 Code Change",
    },
    {
        "num": 70,
        "faction": JP,
        "ops": 1,
        "type": INTELLIGENCE,
        "oc": 3,
        "intelligence": INTERCEPT,
        "draw": true,
        "name": "JN25 Code Change",
    },
    {
        "num": 71,
        "faction": JP,
        "ops": 3,
        "type": RESOURCE,
        "oc": 5,
        "remove": true,
        "name": "High Altitude Interceptors",
    },
    {
        "num": 72,
        "faction": JP,
        "ops": 3,
        "type": RESOURCE,
        "oc": 5,
        "remove": true,
        "name": "Carrier Conversion",
    },
    {
        "num": 73,
        "faction": JP,
        "ops": 2,
        "type": MILITARY,
        "oc": 4,
        "ec": 6,
        "logistic": 3,
        "hq": [HQ_SOUTH_SEAS, HQ_JP_SOUTH],
        "remove": true,
        "name": "Ants",
    },
    {
        "num": 74,
        "faction": JP,
        "ops": 1,
        "type": POLITICAL,
        "oc": 3,
        "remove": true,
        "pw": -1,
        "name": "Tokyo Rose",
    },
    {
        "num": 75,
        "faction": JP,
        "ops": 1,
        "type": REACTION,
        "stage": BEFORE_COMBAT,
        "oc": 1,
        "draw": true,
        "name": "Submarine Attack",
    },
    {
        "num": 76,
        "faction": JP,
        "ops": 2,
        "type": MILITARY,
        "oc": 4,
        "ec": 6,
        "logistic": 1,
        "remove": true,
        "name": "Operation Tsurugi",
    },
    {
        "num": 77,
        "faction": JP,
        "ops": 3,
        "type": RESOURCE,
        "oc": 5,
        "name": "Fuel Shortage",
    },
    {
        "num": 78,
        "faction": JP,
        "ops": 1,
        "type": RESOURCE,
        "oc": 3,
        "remove": true,
        "name": "Tainan Air Unit",
    },
    {
        "num": 79,
        "faction": JP,
        "ops": 2,
        "type": MILITARY,
        "oc": 4,
        "ec": 6,
        "logistic": 1,
        "remove": true,
        "name": "Tinian Raid",
    },
    {
        "num": 80,
        "faction": JP,
        "ops": 2,
        "type": RESOURCE,
        "oc": 4,
        "draw": true,
        "remove": true,
        "name": "Attack on the Panama Canal",
    },
    {
        "num": 81,
        "faction": JP,
        "ops": 2,
        "type": REACTION,
        "stage": BEFORE_COMBAT,
        "oc": 4,
        "draw": true,
        "remove": true,
        "kamikaze": true,
        "name": "Kamikaze Attack",
    },
    {
        "num": 82,
        "faction": JP,
        "ops": 3,
        "type": POLITICAL,
        "oc": 5,
        "name": "Indian Worker's Strike",
    },
    {
        "num": 83,
        "faction": JP,
        "ops": 2,
        "type": MILITARY,
        "oc": 4,
        "ec": 6,
        "logistic": 4,
        "hq": [HQ_JP_SOUTH],
        "name": "Invasion of Java",
    },
    {
        "num": 84,
        "faction": JP,
        "ops": 1,
        "type": INTELLIGENCE,
        "oc": 3,
        "intelligence": INTERCEPT,
        "draw": true,
        "name": "JN25 Code Change",
    },
    {
        "num": 85,
        "faction": JP,
        "ops": 2,
        "type": COUNTER_OFFENSIVE,
        "oc": 4,
        "intelligence": INTERCEPT,
        "remove": true,
        "name": "Battle of Kolombanga",
    },
    {
        "num": 86,
        "faction": JP,
        "ops": 1,
        "type": REACTION,
        "stage": AFTER_COMBAT,
        "oc": 3,
        "draw": true,
        "name": "Submarine Attack",
    },
]

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

function find_card(faction, num) {
    for (let i = 1; i < cards.length; i++) {
        if (cards[i].faction === faction && cards[i].num === num) {
            return i
        }
    }
    throw new Error(`Missed card ${faction} ${num}`);
}

function for_each_card(apply) {
    for (let i = 1; i < cards.length; i++) {
        var card = cards[i]
        var returned = apply(i, card)
        if (returned) {
            return returned
        }

    }
}/** import common/data_cards.js*/
/** import common/data_map.js*/
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
//Hex sides
//N,NE,SE,S,SW,NW
var map = [
    {id: 1004, terrain: OCEAN, edges: [0, 1, 1, 1, 0, 0]},
    {id: 1103, terrain: OCEAN, edges: [0, 0, 1, 1, 1, 0]},
    {id: 1204, terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
    {id: 1303, terrain: OCEAN, edges: [0, 0, 0, 1, 1, 0]},
    {id: 1304, terrain: OCEAN, edges: [1, 0, 0, 0, 1, 1]},
    {id: 1205, terrain: OCEAN, edges: [1, 1, 0, 1, 1, 1]},
    {id: 1010, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 0]},
    {id: 1103, terrain: OCEAN, edges: [0, 0, 1, 1, 1, 0]},
    {id: 1110, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1211, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1311, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1412, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1512, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1613, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1614, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1615, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1616, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1617, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1618, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1619, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1719, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1820, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1920, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1921, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1922, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1923, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1924, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1925, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1926, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 5527, terrain: OCEAN, edges: [1, 1, 0, 0, 1, 1]},
    {id: 5627, terrain: OCEAN, edges: [1, 1, 0, 0, 1, 1]},
    {id: 5726, terrain: OCEAN, edges: [1, 1, 0, 0, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 5826, terrain: OCEAN, edges: [1, 1, 0, 0, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 5925, terrain: OCEAN, edges: [1, 1, 0, 0, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 6025, terrain: OCEAN, edges: [1, 0, 0, 0, 1, 1]},
    {id: 5300, terrain: OCEAN, edges: [0, 0, 0, 1, 1, 1]},
    {id: 5301, terrain: OCEAN, edges: [1, 0, 0, 1, 1, 1]},
    {id: 5302, terrain: OCEAN, edges: [1, 0, 0, 1, 1, 1]},
    {id: 5303, terrain: OCEAN, edges: [1, 0, 1, 1, 1, 1]},
    {id: 5404, terrain: OCEAN, edges: [0, 0, 1, 1, 1, 1]},
    {id: 5408, name: "Air Ferry", terrain: OCEAN, airfield: true, edges: [1, 1, 1, 1, 1, 1]},
    {id: 5504, terrain: OCEAN, edges: [0, 0, 1, 1, 1, 1]},
    {id: 5605, terrain: OCEAN, edges: [0, 0, 1, 1, 1, 1]},
    {id: 5705, terrain: OCEAN, edges: [0, 0, 1, 1, 1, 1]},
    {id: 5806, terrain: OCEAN, edges: [0, 0, 1, 1, 1, 1]},
    {id: 5906, terrain: OCEAN, edges: [0, 0, 1, 1, 1, 1]},
    {id: 6007, terrain: OCEAN, edges: [0, 0, 0, 1, 1, 1]},
    {id: 3503, terrain: OCEAN, edges: [0, 1, 1, 1, 1, 0]},
    {id: 3603, terrain: OCEAN, edges: [0, 1, 1, 1, 1, 0]},
    {id: 3702, terrain: OCEAN, edges: [1, 1, 1, 1, 1, 0]},
    {id: 3701, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 0]},
    {id: 3700, terrain: OCEAN, edges: [0, 1, 1, 1, 0, 0]},
    {id: 1005, name: "Maldive Is.", region: "Ceylon", airfield: true, port: true, terrain: OPEN, island: true},
    {
        id: 1307,
        name: "Colombo",
        region: "Ceylon",
        airfield: true,
        port: true,
        city: CITY,
        terrain: MIXED,
        edges: [1, 1, 1, 3, 3, 1]
    },
    {
        id: 1308,
        name: "Trincomalee",
        region: "Ceylon",
        airfield: true,
        port: true,
        city: CITY,
        terrain: MIXED,
        edges: [3, 1, 1, 1, 1, 3]
    },
    {id: 1208, terrain: MIXED, edges: [1, 3, 3, 1, 1, 1]},
    {id: 1206, region: "India", terrain: OPEN, edges: [1, 0, 3, 1, 1, 1]},
    {id: 1306, region: "India", terrain: OPEN, edges: [0, 3, 1, 1, 1, 3]},
    {
        id: 1406,
        name: "Madras",
        region: "India",
        airfield: true,
        port: true,
        city: CITY,
        terrain: OPEN,
        edges: [0, 4, 1, 1, 3, 0]
    },
    {id: 1505, region: "India", terrain: OPEN, edges: [0, 0, 5, 1, 4, 0]},
    {id: 1606, region: "India", terrain: OPEN, edges: [0, 5, 1, 1, 1, 5]},
    {id: 1705, region: "India", terrain: OPEN, edges: [0, 4, 1, 1, 5, 0]},
    {
        id: 1805,
        name: "Calcutta",
        region: "India",
        city: CITY,
        airfield: true,
        port: true,
        terrain: OPEN,
        edges: [0, 0, 5, 1, 4, 0]
    },
    {id: 1709, name: "Little Andaman", terrain: OPEN, island: true},
    {id: 1809, name: "Andaman", terrain: OPEN, island: true},
    {id: 1710, name: "Nicobar", terrain: OPEN, island: true},
    {
        id: 1905,
        name: "Dacca",
        region: "NIndia",
        airfield: true,
        port: true,
        city: CITY,
        terrain: OPEN,
        edges: [0, 4, 3, 1, 1, 5]
    },
    {id: 2005, name: "Dimasur", region: "NIndia", terrain: OPEN, city: CITY, edges: [2, 4, 2, 2, 4, 0]},
    {id: 2104, name: "Jarhat", region: "NIndia", airfield: true, city: CITY, terrain: OPEN, edges: [2, 2, 4, 4, 4, 2]},
    {id: 2105, name: "Imphal", region: "NIndia", city: CITY, terrain: MIXED, edges: [4, 2, 2, 4, 2, 2]},
    {id: 2205, name: "Ledo", region: "NIndia", city: CITY, airfield: true, terrain: MIXED, edges: [2, 2, 4, 2, 2, 4]},
    {id: 2004, terrain: MOUNTAIN, edges: [0, 2, 2, 2, 0, 0]},
    {id: 2103, terrain: MOUNTAIN, edges: [0, 0, 2, 2, 2, 0]},
    {id: 2204, terrain: MOUNTAIN, edges: [0, 2, 2, 2, 2, 2]},
    {id: 2303, terrain: MOUNTAIN, edges: [0, 0, 0, 2, 2, 0]},
    {id: 2304, terrain: MOUNTAIN, edges: [2, 0, 2, 2, 2, 2]},
    {id: 2405, terrain: MOUNTAIN, edges: [0, 0, 0, 2, 2, 2]},
    {id: 2006, name: "Akyab", city: CITY, region: "Burma", airfield: true, terrain: JUNGLE, edges: [2, 2, 2, 2, 1, 3]},
    {id: 2007, region: "Burma", terrain: JUNGLE, edges: [2, 4, 2, 4, 1, 1]},
    {
        id: 2008,
        name: "Rangoon",
        city: CITY,
        region: "Burma",
        airfield: true,
        port: true,
        resource: true,
        terrain: JUNGLE,
        edges: [4, 4, 4, 17, 24, 8]
    },
    {
        id: 2106,
        name: "Mandalay",
        city: CITY,
        region: "Burma",
        airfield: true,
        terrain: JUNGLE,
        edges: [4, 4, 2, 4, 4, 2]
    },
    {id: 2107, region: "Burma", terrain: JUNGLE, edges: [4, 2, 2, 2, 4, 2]},
    {id: 2108, region: "Burma", terrain: MIXED, edges: [2, 2, 2, 4, 1, 4]},
    {id: 2206, name: "Lashio", airfield: true, city: CITY, region: "Burma", terrain: MIXED, edges: [2, 4, 4, 2, 4, 2]},
    {
        id: 2305,
        name: "Myitkyina",
        airfield: true,
        city: CITY,
        region: "Burma",
        terrain: MIXED,
        edges: [2, 2, 2, 2, 4, 4]
    },
    {id: 2207, region: "Burma", terrain: JUNGLE},
    {id: 2407, name: "Kunming", region: "IChina", city: CHINESE_CITY, terrain: MIXED, edges: [2, 2, 2, 2, 2, 4]},
    {id: 2306, region: "IChina", terrain: MIXED, edges: [2, 2, 4, 2, 2, 4]},
    {id: 2406, region: "IChina", terrain: MIXED, edges: [2, 0, 2, 2, 2, 2]},
    {id: 2506, region: "IChina", terrain: MIXED, edges: [0, 0, 0, 2, 2, 2]},
    {id: 2507, region: "IChina", terrain: MIXED, edges: [2, 0, 0, 2, 2, 2]},
    {id: 2408, region: "IChina", terrain: MIXED},
    {id: 2608, region: "IChina", terrain: MIXED}, //Only playable in the burma scenario
    {id: 2307, region: "IChina", terrain: MIXED},
    {id: 2109, region: "Siam", terrain: JUNGLE, edges: [5, 2, 2, 2, 5, 1]},
    {id: 2210, name: "Udorn", region: "Siam", city: CITY, terrain: OPEN, edges: [2, 2, 2, 2, 4, 2]},
    {id: 2209, region: "Siam", terrain: MIXED},
    {id: 2010, region: "Siam", terrain: MIXED, edges: [1, 5, 4, 2, 1, 1]},
    {
        id: 2110,
        name: "Bangkok",
        region: "Siam",
        city: CITY,
        airfield: true,
        port: true,
        terrain: MIXED,
        edges: [2, 4, 4, 3, 5, 4]
    },
    {id: 2011, region: "Siam", terrain: JUNGLE, edges: [2, 5, 1, 5, 2, 8]},
    {id: 1911, region: "Siam", terrain: JUNGLE, edges: [1, 2, 2, 1, 1, 1]},
    {id: 2012, name: "Singora", region: "Malaya", city: CITY, airfield: true, terrain: OPEN, edges: [5, 1, 5, 2, 4, 2]},
    {
        id: 2112,
        name: "Kota Bharu",
        region: "Malaya",
        city: CITY,
        airfield: true,
        terrain: OPEN,
        edges: [1, 1, 1, 3, 4, 5]
    },
    {id: 1912, name: "Jitra", city: CITY, region: "Malaya", airfield: true, terrain: MIXED, edges: [1, 4, 2, 5, 1, 1]},
    {id: 2013, region: "Malaya", terrain: MOUNTAIN, edges: [2, 4, 2, 4, 2, 2]},
    {id: 2113, region: "Malaya", terrain: MIXED, edges: [3, 1, 1, 1, 3, 2]},
    {
        id: 1913,
        name: "Kuala Lumpur",
        city: CITY,
        region: "Malaya",
        airfield: true,
        terrain: MIXED,
        edges: [5, 2, 4, 1, 1, 1]
    },
    {
        id: 2014,
        name: "Kuantan",
        region: "Malaya",
        city: CITY,
        airfield: true,
        resource: true,
        terrain: MIXED,
        edges: [4, 3, 1, 4, 8, 4]
    },
    {
        id: 2015,
        name: "Singapore",
        region: "Malaya",
        city: CITY,
        airfield: true,
        port: true,
        terrain: MIXED,
        edges: [4, 1, 1, 1, 1, 1]
    },
    {id: 2111, region: "Indochina", airfield: true, terrain: MIXED, edges: [3, 2, 2, 1, 1, 1]},
    {
        id: 2211,
        name: "Phnom Penh",
        city: CITY,
        region: "Indochina",
        airfield: true,
        terrain: MIXED,
        edges: [2, 2, 2, 4, 2, 4]
    },
    {
        id: 2212,
        name: "Saigon",
        city: CITY,
        region: "Indochina",
        airfield: true,
        port: true,
        terrain: MIXED,
        edges: [4, 4, 3, 1, 1, 2]
    },
    {
        id: 2311,
        name: "Cam Ranh",
        city: CITY,
        region: "Indochina",
        airfield: true,
        port: true,
        terrain: MIXED,
        edges: [2, 5, 1, 3, 4, 2]
    },
    {id: 2312, region: "Indochina", terrain: MIXED, edges: [3, 1, 1, 1, 3, 1]},
    {id: 2411, region: "Indochina", terrain: MIXED, edges: [1, 1, 1, 1, 5, 4]},
    {id: 2310, region: "Indochina", terrain: MIXED, edges: [2, 4, 4, 2, 2, 2]},
    {id: 2410, name: "Hue", region: "Indochina", city: CITY, terrain: MIXED, edges: [1, 1, 1, 1, 4, 5]},
    {id: 2309, region: "Indochina", terrain: MIXED, edges: [2, 5, 5, 2, 2, 2]},
    {id: 2308, region: "Indochina", terrain: MIXED},
    {id: 2208, region: "Indochina", terrain: MIXED},
    {
        id: 2409,
        name: "Hanoi",
        airfield: true,
        city: CITY,
        port: true,
        region: "Indochina",
        terrain: OPEN,
        edges: [2, 5, 1, 1, 5, 2]
    },
    {
        id: 2508,
        name: "Yungning",
        airfield: true,
        port: true,
        region: "China",
        city: CHINESE_CITY,
        terrain: OPEN,
        edges: [2, 0, 2, 17, 5, 2]
    },
    {
        id: 2509,
        name: "Hainan",
        port: true,
        city: CITY,
        region: "China",
        island: true,
        terrain: OPEN,
        edges: [17, 1, 8, 8, 1, 1]
    },
    {
        id: 2609,
        name: "Canton",
        airfield: true,
        city: CHINESE_CITY,
        port: true,
        region: "China",
        terrain: MIXED,
        edges: [0, 4, 1, 1, 1, 2]
    },
    {id: 2708, region: "China", terrain: MIXED, edges: [0, 0, 3, 5, 4, 0]},
    {
        id: 2709,
        name: "Hong Kong",
        airfield: true,
        port: true,
        region: "China",
        city: CHINESE_CITY,
        terrain: MIXED,
        edges: [5, 1, 1, 1, 1, 1]
    },
    {
        id: 2809,
        name: "Swatow",
        city: CHINESE_CITY,
        airfield: true,
        port: true,
        region: "China",
        terrain: MIXED,
        edges: [0, 3, 1, 1, 1, 3]
    },
    {
        id: 2908,
        name: "Wenchow",
        city: CHINESE_CITY,
        airfield: true,
        port: true,
        region: "China",
        terrain: OPEN,
        edges: [0, 3, 1, 1, 3, 0]
    },
    {
        id: 2909,
        name: "Tainan",
        city: CITY,
        airfield: true,
        port: true,
        region: "Formosa",
        terrain: MIXED,
        edges: [1, 3, 1, 1, 1, 1]
    },
    {
        id: 3009,
        name: "Taihoku",
        airfield: true,
        region: "Formosa",
        city: CITY,
        terrain: MIXED,
        edges: [1, 1, 1, 1, 3, 1]
    },
    {id: 3008, region: "China", terrain: MIXED, edges: [3, 1, 1, 1, 3, 0]},
    {
        id: 3007,
        name: "Shanghai",
        city: CHINESE_CITY,
        airfield: true,
        port: true,
        region: "China",
        terrain: OPEN,
        edges: [2, 3, 1, 3, 0, 0]
    },
    {id: 3106, region: "China", terrain: OPEN, edges: [1, 1, 1, 1, 3, 3]},
    {id: 3006, region: "China", terrain: OPEN, edges: [2, 3, 3, 2, 0, 0]},
    {
        id: 3105,
        name: "Tsingtao",
        city: CHINESE_CITY,
        airfield: true,
        port: true,
        region: "China",
        terrain: MIXED,
        edges: [1, 1, 1, 1, 3, 4]
    },
    {
        id: 3005,
        name: "Tientsin",
        city: CHINESE_CITY,
        airfield: true,
        region: "China",
        terrain: OPEN,
        edges: [4, 8, 4, 2, 0, 0]
    },
    {
        id: 3004,
        name: "Peiping",
        city: CHINESE_CITY,
        airfield: true,
        region: "China",
        terrain: OPEN,
        edges: [0, 4, 8, 4, 0, 0]
    },
    {id: 3103, region: "China", terrain: MIXED, edges: [0, 4, 2, 8, 4, 0]},
    {
        id: 3104,
        name: "Port Arthur",
        city: CHINESE_CITY,
        airfield: true,
        port: true,
        region: "China",
        terrain: OPEN,
        edges: [8, 4, 1, 1, 8, 8]
    },
    {id: 3203, region: "Manchuria", terrain: OPEN, edges: [0, 4, 2, 2, 4, 0]},
    {id: 3204, region: "Manchuria", terrain: OPEN, edges: [2, 4, 2, 8, 4, 2]},
    {id: 3402, region: "Manchuria", terrain: MIXED, edges: [0, 0, 0, 2, 2, 0]},
    {id: 3403, region: "Manchuria", terrain: MOUNTAIN, edges: [2, 0, 0, 2, 2, 2]},
    {id: 3404, region: "Manchuria", terrain: MOUNTAIN, edges: [2, 1, 1, 1, 3, 2]},
    {
        id: 3302,
        name: "Harbin",
        // airfield: true,
        resource: true,
        city: CHINESE_CITY,
        region: "Manchuria",
        terrain: OPEN,
        edges: [0, 2, 2, 2, 4, 0]
    },
    {
        id: 3303,
        name: "Mukden",
        // airfield: true,
        resource: true,
        city: CHINESE_CITY,
        region: "Manchuria",
        terrain: OPEN,
        edges: [4, 2, 2, 4, 4, 2]
    },
    {id: 3304, region: "Korea", terrain: MOUNTAIN, edges: [4, 3, 1, 4, 2, 2]},
    {id: 3205, region: "Korea", terrain: MIXED, edges: [8, 2, 3, 1, 1, 1]},
    {
        id: 3305,
        name: "Seoul",
        airfield: true,
        city: CITY,
        port: true,
        resource: true,
        region: "Korea",
        terrain: MIXED,
        edges: [4, 8, 8, 4, 3, 3]
    },
    {
        id: 3306,
        name: "Pusan",
        city: CITY,
        airfield: true,
        port: true,
        region: "Korea",
        terrain: MIXED,
        edges: [4, 1, 24, 1, 1, 3]
    },
    {id: 3206, region: "Korea", terrain: MIXED, edges: [1, 3, 3, 1, 1, 1]},
    {id: 3209, name: "Okinawa", airfield: true, port: true, island: true, region: "JMandates", terrain: MIXED},
    {id: 3308, name: "Shima", island: true, region: "JMandates", terrain: MIXED},
    {id: 3309, name: "Rasa", island: true, region: "JMandates", terrain: MIXED},
    {id: 3708, name: "Bonin", island: true, region: "JMandates", terrain: MIXED},
    {id: 3709, name: "Iwo Jima", airfield: true, island: true, region: "JMandates", terrain: MIXED},
    {id: 4110, name: "Marcus", airfield: true, island: true, region: "JMandates", terrain: OPEN},
    {id: 3812, name: "Asuncion", island: true, region: "JMandates", terrain: MIXED},
    {id: 3813, name: "Saipan", airfield: true, port: true, island: true, region: "JMandates", terrain: MIXED},
    {id: 3416, name: "Palau", airfield: true, port: true, island: true, region: "JMandates", terrain: MIXED},
    {id: 3515, name: "Yap", airfield: true, island: true, region: "JMandates", terrain: OPEN},
    {id: 3615, name: "Ulithi", airfield: true, port: true, region: "JMandates", terrain: ATOLL},
    {id: 3716, name: "Woleai", region: "Caroline", terrain: ATOLL},
    {id: 3816, name: "Faraulep", region: "Caroline", terrain: ATOLL},
    {id: 3817, name: "Ifalik", region: "Caroline", terrain: ATOLL},
    {id: 3916, name: "Pulap", region: "Caroline", terrain: ATOLL},
    {id: 4016, name: "Hall", region: "Caroline", terrain: ATOLL},
    {id: 4017, name: "Truk", airfield: true, port: true, region: "Caroline", terrain: ATOLL},
    {id: 4117, name: "Nomoi", region: "Caroline", terrain: ATOLL},
    {id: 4316, name: "Ponape", airfield: true, island: true, region: "Marshall", terrain: OPEN},
    {id: 4517, name: "Kusaie", airfield: true, island: true, region: "Marshall", terrain: OPEN},
    {id: 4713, name: "Taongi", region: "Marshall", island: true, terrain: OPEN},
    {id: 4415, name: "Eniwetok", airfield: true, port: true, region: "Marshall", terrain: ATOLL},
    {id: 4715, name: "Kwajalein", airfield: true, port: true, region: "Marshall", terrain: ATOLL},
    {id: 4615, name: "Rongelap", region: "Marshall", terrain: ATOLL},
    {id: 4616, name: "Ujae", region: "Marshall", terrain: ATOLL},
    {id: 4716, name: "Namu", airfield: true, region: "Marshall", terrain: ATOLL},
    {id: 4815, name: "Wotje", airfield: true, region: "Marshall", terrain: ATOLL},
    {id: 4816, name: "Maloelap", airfield: true, region: "Marshall", terrain: ATOLL},
    {id: 4817, name: "Jaluit", airfield: true, region: "Marshall", terrain: ATOLL},
    {id: 4916, name: "Mili", airfield: true, region: "Marshall", terrain: ATOLL},
    {id: 3800, region: "Sakhalin", terrain: MIXED, edges: [8, 8, 1, 3, 1, 8]},
    {id: 3801, region: "Sakhalin", terrain: MIXED, edges: [3, 8, 8, 3, 1, 1]},
    {id: 3802, region: "Sakhalin", terrain: MIXED, edges: [3, 8, 24, 3, 1, 1]},
    {id: 3803, region: "Sakhalin", terrain: MIXED, edges: [3, 1, 1, 1, 1, 1]},
    {id: 3703, region: "Japan", terrain: MIXED, edges: [1, 1, 3, 3, 1, 1]},
    {id: 3804, region: "Japan", terrain: MIXED, edges: [1, 1, 1, 3, 2, 3]},
    {
        id: 3704,
        name: "Hakodate",
        city: JAPANESE_CITY,
        airfield: true,
        port: true,
        region: "Japan",
        terrain: MIXED,
        edges: [3, 2, 17, 17, 1, 1]
    },
    {
        id: 3705,
        name: "Ominato",
        airfield: true,
        port: true,
        city: JAPANESE_CITY,
        region: "Japan",
        terrain: MIXED,
        edges: [17, 1, 1, 3, 2, 8]
    },
    {
        id: 3706,
        name: "Tokyo",
        airfield: true,
        city: JAPANESE_CITY,
        port: true,
        region: "Japan",
        terrain: OPEN,
        edges: [3, 1, 1, 1, 3, 2]
    },
    {id: 3606, region: "Japan", terrain: MIXED, edges: [1, 2, 2, 2, 3, 1]},
    {
        id: 3607,
        name: "Nagoya",
        airfield: true,
        city: JAPANESE_CITY,
        port: true,
        region: "Japan",
        terrain: MIXED,
        edges: [2, 3, 1, 1, 1, 2]
    },
    {
        id: 3506,
        name: "Kyoto",
        airfield: true,
        city: JAPANESE_CITY,
        region: "Japan",
        terrain: MIXED,
        edges: [1, 3, 2, 2, 2, 1]
    },
    {
        id: 3507,
        name: "Osaka",
        airfield: true,
        city: JAPANESE_CITY,
        port: true,
        region: "Japan",
        terrain: MIXED,
        edges: [2, 1, 1, 1, 1, 17]
    },
    {
        id: 3407,
        name: "Kure",
        airfield: true,
        port: true,
        city: JAPANESE_CITY,
        region: "Japan",
        terrain: MIXED,
        edges: [24, 2, 17, 17, 17, 24]
    },
    {
        id: 3307,
        name: "Kynshu",
        airfield: true,
        city: JAPANESE_CITY,
        port: true,
        region: "Japan",
        terrain: MIXED,
        edges: [1, 17, 8, 1, 1, 1]
    },
    {id: 2910, name: "Batan", region: "Philippines", terrain: MIXED, island: true},
    {id: 2911, airfield: true, region: "Philippines", terrain: MIXED, edges: [1, 1, 1, 3, 3, 1]},
    {id: 2812, airfield: true, region: "Philippines", terrain: OPEN, edges: [1, 3, 2, 3, 1, 1]},
    {id: 2912, region: "Philippines", terrain: MIXED, edges: [3, 1, 1, 2, 2, 2]},
    {id: 2913, region: "Philippines", terrain: MIXED, edges: [2, 17, 24, 17, 16, 1]},
    {id: 2814, name: "Panay", region: "Philippines", terrain: MIXED, island: true, edges: [1, 16, 1, 1, 1, 1]},
    {id: 2914, name: "Cebu", region: "Philippines", terrain: MIXED, island: true, edges: [1, 8, 17, 24, 17, 1]},
    {id: 2713, region: "Philippines", terrain: MIXED, edges: [1, 1, 1, 2, 1, 1]},
    {id: 2714, region: "Philippines", terrain: MIXED, edges: [2, 1, 1, 1, 1, 17]},
    {id: 3015, region: "Philippines", terrain: MIXED, edges: [1, 1, 1, 3, 2, 17]},
    {id: 3016, region: "Philippines", terrain: MIXED, edges: [3, 1, 1, 1, 1, 3]},
    {id: 2815, region: "Philippines", terrain: MIXED, edges: [1, 17, 2, 1, 1, 1]},
    {
        id: 2813,
        name: "Manila",
        airfield: true,
        city: CITY,
        port: true,
        resource: true,
        region: "Philippines",
        terrain: MIXED,
        edges: [3, 2, 1, 1, 1, 1]
    },
    {
        id: 3014,
        name: "Leyte",
        airfield: true,
        port: true,
        region: "Philippines",
        island: true,
        terrain: MIXED,
        edges: [1, 1, 1, 1, 8, 24]
    },
    {
        id: 2915,
        name: "Davao",
        airfield: true,
        city: CITY,
        port: true,
        region: "Philippines",
        terrain: MIXED,
        edges: [24, 2, 3, 17, 8, 2]
    },
    {id: 2715, name: "Jolo", airfield: true, port: true, region: "Philippines", terrain: OPEN, island: true},
    {id: 1712, region: "Sumatra", terrain: MIXED, edges: [24, 8, 2, 3, 1, 17]},
    {id: 1713, region: "Sumatra", terrain: MIXED, edges: [3, 2, 2, 3, 1, 1]},
    {
        id: 1813,
        name: "Medan",
        airfield: true,
        resource: true,
        city: CITY,
        region: "Sumatra",
        terrain: JUNGLE,
        edges: [1, 1, 1, 3, 2, 2]
    },
    {id: 1714, region: "Sumatra", terrain: MIXED, edges: [3, 2, 3, 1, 1, 1]},
    {id: 1814, region: "Sumatra", terrain: JUNGLE, edges: [3, 1, 3, 2, 2, 2]},
    {id: 1914, airfield: true, region: "Sumatra", terrain: JUNGLE, edges: [1, 8, 1, 3, 2, 3]},
    {id: 1815, region: "Sumatra", terrain: MIXED, edges: [2, 2, 2, 3, 1, 3]},
    {id: 1816, region: "Sumatra", terrain: MIXED, edges: [3, 2, 2, 3, 1, 1]},
    {id: 1817, region: "Sumatra", terrain: MIXED, edges: [3, 2, 3, 1, 1, 1]},
    {id: 1915, region: "Sumatra", terrain: JUNGLE, edges: [3, 1, 1, 2, 2, 2]},
    {
        id: 1916,
        name: "Palembang",
        airfield: true,
        resource: true,
        city: CITY,
        region: "Sumatra",
        terrain: JUNGLE,
        edges: [2, 1, 3, 2, 2, 2]
    },
    {id: 2017, name: "Bangka", resource: true, region: "Sumatra", terrain: JUNGLE, edges: [17, 1, 1, 1, 3, 3]},
    {
        id: 1917,
        name: "Teloekbetoeng",
        airfield: true,
        city: CITY,
        port: true,
        region: "Sumatra",
        terrain: JUNGLE,
        edges: [2, 3, 1, 1, 1, 3]
    },
    {id: 2117, name: "Billiton", island: true, region: "DEI", terrain: JUNGLE},
    {
        id: 2216,
        name: "Sinkawang",
        city: CITY,
        airfield: true,
        region: "Borneo",
        terrain: JUNGLE,
        edges: [1, 3, 2, 2, 1, 1]
    },
    {id: 2217, region: "Borneo", terrain: JUNGLE, edges: [2, 2, 2, 3, 1, 1]},
    {id: 2218, region: "Borneo", terrain: JUNGLE, edges: [3, 3, 1, 1, 1, 1]},
    {id: 2317, region: "Borneo", terrain: JUNGLE, edges: [2, 2, 2, 3, 3, 2]},
    {
        id: 2318,
        name: "Bandjermasin",
        city: CITY,
        airfield: true,
        region: "Borneo",
        terrain: JUNGLE,
        edges: [3, 3, 1, 1, 1, 1]
    },
    {id: 2315, region: "Borneo", terrain: MIXED, edges: [1, 3, 2, 2, 3, 1]},
    {id: 2316, region: "Borneo", terrain: MIXED},
    {id: 2417, region: "Borneo", terrain: MIXED},
    {id: 2416, region: "Borneo", terrain: MOUNTAIN},
    {id: 2418, region: "Borneo", terrain: MIXED, edges: [2, 3, 1, 1, 3, 2]},
    {id: 2515, region: "Borneo", terrain: MOUNTAIN, edges: [1, 2, 2, 2, 2, 3]},
    {id: 2615, region: "Borneo", terrain: MIXED, edges: [1, 1, 17, 2, 2, 1]},
    {id: 2516, region: "Borneo", terrain: JUNGLE, edges: [2, 3, 3, 2, 2, 2]},
    {id: 2617, region: "Borneo", terrain: JUNGLE, edges: [1, 1, 8, 1, 3, 3]},
    {
        id: 2415,
        name: "Miri",
        airfield: true,
        city: CITY,
        port: true,
        resource: true,
        region: "Borneo",
        terrain: MIXED,
        edges: [1, 1, 3, 2, 3, 1]
    },
    {
        id: 2616,
        name: "Tarakan",
        airfield: true,
        city: CITY,
        port: true,
        resource: true,
        region: "Borneo",
        terrain: MIXED,
        edges: [2, 17, 1, 1, 3, 2]
    },
    {
        id: 2517,
        name: "Balikpapan",
        airfield: true,
        port: true,
        city: CITY,
        resource: true,
        region: "Borneo",
        terrain: JUNGLE,
        edges: [2, 3, 1, 1, 3, 2]
    },
    {
        id: 2917,
        name: "Menado",
        airfield: true,
        city: CITY,
        region: "Celebes",
        terrain: MIXED,
        edges: [1, 1, 8, 1, 3, 1]
    },
    {id: 2818, region: "Celebes", terrain: MIXED, edges: [8, 3, 1, 1, 17, 3]},
    {id: 2717, region: "Celebes", terrain: MIXED, edges: [8, 1, 3, 8, 2, 8]},
    {id: 2618, region: "Celebes", terrain: MIXED, edges: [1, 2, 2, 2, 1, 1]},
    {id: 2718, region: "Celebes", terrain: MIXED, edges: [8, 17, 1, 3, 18, 2]},
    {id: 2619, region: "Celebes", terrain: MIXED, edges: [2, 18, 17, 3, 8, 8]},
    {
        id: 2719,
        name: "Kendari",
        airfield: true,
        port: true,
        city: CITY,
        region: "Celebes",
        terrain: MIXED,
        edges: [3, 1, 1, 1, 1, 17]
    },
    {
        id: 2620,
        name: "Makassar",
        city: CITY,
        airfield: true,
        region: "Celebes",
        terrain: MIXED,
        edges: [3, 1, 1, 1, 1, 1]
    },
    {
        id: 2018,
        name: "Batavia",
        city: CITY,
        airfield: true,
        port: true,
        region: "Java",
        terrain: MIXED,
        edges: [1, 1, 1, 2, 3, 1]
    },
    {
        id: 2019,
        name: "Tjilatjap",
        airfield: true,
        city: CITY,
        port: true,
        region: "Java",
        terrain: MIXED,
        edges: [2, 8, 3, 1, 1, 3]
    },
    {
        id: 2220,
        name: "Soerabaja",
        airfield: true,
        city: CITY,
        port: true,
        resource: true,
        region: "Java",
        terrain: MIXED,
        edges: [17, 1, 1, 8, 8, 2]
    },
    {id: 1918, region: "Java", terrain: MIXED, edges: [1, 3, 3, 1, 1, 1]},
    {id: 2119, region: "Java", terrain: MIXED, edges: [8, 24, 2, 1, 1, 3]},
    {id: 2320, name: "Bali", airfield: true, region: "DEI", island: true, terrain: MIXED},
    {id: 3017, name: "Motorai", airfield: true, region: "DEI", island: true, terrain: OPEN},
    {id: 2421, name: "Soembawa", region: "DEI", island: true, terrain: MIXED, edges: [8, 17, 1, 1, 1, 1]},
    {id: 2521, name: "Soemba", region: "DEI", island: true, terrain: MIXED},
    {id: 2621, name: "Flores", region: "DEI", island: true, terrain: MIXED, edges: [1, 1, 24, 8, 8, 16]},
    {id: 2622, name: "Roti", region: "DEI", island: true, terrain: MIXED},
    {id: 2821, name: "Wetar", region: "DEI", island: true, terrain: MIXED},
    {
        id: 2721,
        name: "Koepang",
        city: CITY,
        airfield: true,
        port: true,
        region: "DEI",
        terrain: MIXED,
        edges: [17, 17, 2, 8, 1, 24]
    },
    {id: 2822, region: "DEI", island: true, terrain: MIXED, edges: [24, 17, 1, 1, 1, 2]},
    {id: 2921, name: "Moa", region: "DEI", island: true, terrain: MIXED},
    {id: 3021, name: "Babar", region: "DEI", island: true, terrain: MIXED},
    {id: 3121, name: "Tanimbar", region: "DEI", island: true, terrain: MIXED},
    {id: 3221, name: "Aroe", region: "DEI", island: true, terrain: MIXED},
    {id: 3020, name: "Ceram", region: "DEI", island: true, terrain: MIXED, edges: [8, 8, 1, 1, 1, 17]},
    {id: 2919, name: "Amboina", airfield: true, region: "DEI", island: true, terrain: MIXED},
    {id: 2819, name: "Soela", region: "DEI", island: true, terrain: MIXED},
    {id: 2918, name: "Batjan", region: "DEI", island: true, terrain: MIXED},
    {id: 3019, name: "Obi", region: "DEI", island: true, terrain: MIXED},
    {id: 3118, name: "Waigeo", region: "DEI", island: true, terrain: MIXED},
    {id: 3018, name: "Halmahera", region: "DEI", island: true, terrain: MIXED, edges: [1, 1, 1, 17, 8, 8]},
    {id: 2027, region: "Australia", terrain: OPEN, edges: [1, 3, 2, 2, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 2028, region: "Australia", terrain: OPEN, edges: [2, 2, 0, 0, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 2126, region: "Australia", terrain: OPEN, edges: [1, 3, 2, 2, 3, 1]},
    {id: 2127, region: "Australia", terrain: OPEN, edges: [2, 2, 2, 0, 2, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 2226, region: "Australia", terrain: OPEN, edges: [1, 1, 3, 2, 3, 1]},
    {id: 2227, region: "Australia", terrain: OPEN},
    {id: 2228, region: "Australia", terrain: OPEN, edges: [2, 2, 0, 0, 0, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 2326, region: "Australia", terrain: OPEN, edges: [1, 3, 2, 2, 2, 3]},
    {id: 2327, region: "Australia", terrain: OPEN, edges: [2, 2, 0, 0, 2, 2], supply_source: JOINT_SUPPLIED_HEX},
    {
        id: 2426,
        name: "Broome",
        airfield: true,
        city: CITY,
        port: true,
        region: "Australia",
        terrain: OPEN,
        edges: [3, 2, 0, 2, 3, 1],
        supply_source: JOINT_SUPPLIED_HEX
    },
    {id: 2427, region: "Australia", terrain: OPEN, edges: [2, 0, 0, 0, 2, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 2425, region: "Australia", terrain: OPEN, edges: [1, 3, 2, 3, 1, 1]},
    {id: 2524, region: "Australia", terrain: OPEN, edges: [1, 1, 17, 3, 3, 1]},
    {
        id: 2525,
        name: "Derby",
        city: CITY,
        airfield: true,
        port: true,
        region: "Australia",
        terrain: OPEN,
        edges: [3, 2, 2, 0, 2, 2],
        supply_source: JOINT_SUPPLIED_HEX
    },
    {id: 2625, region: "Australia", terrain: JUNGLE, edges: [19, 2, 2, 2, 2, 19]},
    {id: 2626, region: "Australia", terrain: OPEN, edges: [2, 2, 0, 0, 0, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 2724, region: "Australia", terrain: JUNGLE, edges: [17, 2, 2, 2, 2, 17]},
    {id: 2725, region: "Australia", terrain: OPEN, edges: [2, 2, 2, 0, 2, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 2824, region: "Australia", terrain: JUNGLE, edges: [1, 1, 1, 3, 2, 17]},
    {
        id: 2825,
        name: "Wyndham",
        airfield: true,
        city: CITY,
        port: true,
        region: "Australia",
        terrain: MIXED,
        edges: [3, 3, 2, 2, 2, 2]
    },
    {id: 2826, region: "Australia", terrain: OPEN, edges: [2, 2, 0, 0, 0, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 2923, region: "Australia", terrain: JUNGLE, edges: [1, 3, 2, 3, 1, 1]},
    {id: 2924, region: "Australia", terrain: JUNGLE, edges: [3, 2, 2, 2, 3, 1]},
    {id: 2925, region: "Australia", terrain: OPEN, edges: [2, 2, 2, 0, 2, 2], supply_source: JOINT_SUPPLIED_HEX},
    {
        id: 3023,
        name: "Darwin",
        city: CITY,
        airfield: true,
        port: true,
        region: "Australia",
        terrain: JUNGLE,
        edges: [1, 1, 0, 2, 3, 1]
    },
    {id: 3024, region: "Australia", terrain: JUNGLE},
    {id: 3025, region: "Australia", terrain: OPEN, edges: [2, 2, 2, 1, 2, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 3123, region: "Australia", terrain: JUNGLE, edges: [1, 1, 3, 2, 2, 1]},
    {id: 3124, region: "Australia", terrain: JUNGLE},
    {id: 3125, region: "Australia", terrain: OPEN, edges: [2, 2, 2, 0, 8, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 3224, region: "Australia", terrain: JUNGLE, edges: [1, 1, 1, 3, 2, 3]},
    {id: 3225, region: "Australia", terrain: JUNGLE, edges: [3, 1, 1, 3, 2, 2]},
    {
        id: 3226,
        airfield: true,
        region: "Australia",
        terrain: JUNGLE,
        edges: [3, 3, 2, 2, 2, 2],
        supply_source: JOINT_SUPPLIED_HEX
    },
    {id: 3227, region: "Australia", terrain: OPEN, edges: [2, 2, 2, 0, 0, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 3324, region: "Australia", terrain: OPEN, island: true},
    {id: 3325, region: "Australia", terrain: JUNGLE, edges: [1, 1, 1, 3, 3, 1]},
    {id: 3326, region: "Australia", terrain: JUNGLE, edges: [3, 3, 2, 2, 2, 2]},
    {id: 3327, region: "Australia", terrain: OPEN, edges: [2, 2, 2, 0, 0, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 3425, region: "Australia", terrain: JUNGLE, edges: [1, 3, 2, 3, 1, 1]},
    {id: 3426, region: "Australia", terrain: JUNGLE, edges: [3, 2, 2, 2, 3, 1]},
    {id: 3427, region: "Australia", terrain: JUNGLE},
    {id: 3428, region: "Australia", terrain: JUNGLE, edges: [2, 2, 0, 0, 0, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 3524, region: "Australia", terrain: OPEN, edges: [1, 3, 2, 2, 3, 1]},
    {id: 3525, region: "Australia", terrain: MOUNTAIN, edges: [2, 3, 3, 2, 2, 2]},
    {id: 3526, region: "Australia", terrain: MOUNTAIN},
    {id: 3527, region: "Australia", terrain: MOUNTAIN, edges: [2, 2, 2, 0, 2, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 3624, name: "Cape York", airfield: true, region: "Australia", terrain: MIXED, edges: [1, 1, 1, 3, 3, 1]},
    {id: 3625, region: "Australia", terrain: MIXED, edges: [3, 1, 1, 1, 3, 2]},
    {
        id: 3626,
        name: "Cairns",
        city: CITY,
        airfield: true,
        port: true,
        region: "Australia",
        terrain: MIXED,
        edges: [1, 1, 1, 5, 2, 3]
    },
    {id: 3627, region: "Australia", terrain: MOUNTAIN, edges: [5, 1, 5, 2, 2, 2]},
    {id: 3628, region: "Australia", terrain: MOUNTAIN, edges: [2, 2, 0, 0, 0, 2], supply_source: JOINT_SUPPLIED_HEX},
    {
        id: 3727,
        name: "Townsville",
        airfield: true,
        city: CITY,
        port: true,
        region: "Australia",
        terrain: MIXED,
        edges: [1, 1, 1, 0, 2, 5],
        supply_source: JOINT_SUPPLIED_HEX
    },
    {id: 3828, terrain: OCEAN, edges: [1, 1, 0, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 4028, terrain: OCEAN, edges: [1, 1, 0, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 4228, terrain: OCEAN, edges: [1, 1, 0, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 4428, terrain: OCEAN, edges: [1, 1, 0, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 4628, terrain: OCEAN, edges: [1, 1, 0, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 5028, terrain: OCEAN, edges: [1, 1, 0, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 5228, terrain: OCEAN, edges: [1, 1, 0, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 5428, terrain: OCEAN, edges: [1, 1, 0, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 3927, terrain: OCEAN, edges: [1, 1, 1, 0, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 4127, terrain: OCEAN, edges: [1, 1, 1, 0, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 4327, terrain: OCEAN, edges: [1, 1, 1, 0, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 4527, terrain: OCEAN, edges: [1, 1, 1, 0, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 4927, terrain: OCEAN, edges: [1, 1, 1, 0, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 5127, terrain: OCEAN, edges: [1, 1, 1, 0, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 5327, terrain: OCEAN, edges: [1, 1, 1, 0, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 3119, name: "Sarong", airfield: true, region: "Guinea", terrain: JUNGLE, edges: [1, 2, 19, 1, 8, 1]},
    {id: 3219, name: "Vogelkop", resource: true, region: "Guinea", terrain: MIXED, edges: [1, 1, 1, 2, 2, 1]},
    {id: 3220, region: "Guinea", terrain: MIXED, edges: [2, 8, 3, 1, 1, 19]},
    {
        id: 3319,
        name: "Biak",
        airfield: true,
        port: true,
        island: true,
        region: "Guinea",
        terrain: OPEN,
        edges: [1, 1, 17, 24, 8, 1]
    },
    {id: 3320, region: "Guinea", terrain: JUNGLE, edges: [8, 2, 3, 1, 1, 3]},
    {id: 3420, region: "Guinea", terrain: JUNGLE, edges: [1, 3, 2, 2, 2, 17]},
    {id: 3421, region: "Guinea", terrain: MOUNTAIN, edges: [2, 2, 2, 2, 1, 3]},
    {id: 3422, region: "Guinea", terrain: JUNGLE, edges: [2, 2, 3, 1, 17, 8]},
    {id: 3519, region: "Guinea", terrain: MIXED, edges: [1, 1, 1, 3, 3, 1]},
    {
        id: 3520,
        name: "Hollandia",
        airfield: true,
        city: CITY,
        port: true,
        region: "Guinea",
        terrain: JUNGLE,
        edges: [3, 3, 2, 2, 2, 2]
    },
    {id: 3521, region: "Guinea", terrain: MOUNTAIN},
    {id: 3522, region: "Guinea", terrain: JUNGLE, edges: [2, 2, 3, 1, 1, 3]},
    {
        id: 3620,
        name: "Aitape",
        city: CITY,
        airfield: true,
        region: "Guinea",
        terrain: JUNGLE,
        edges: [1, 1, 3, 2, 3, 1]
    },
    {id: 3621, region: "Guinea", terrain: JUNGLE},
    {id: 3622, region: "Guinea", terrain: MOUNTAIN, edges: [2, 2, 3, 3, 2, 2]},
    {id: 3623, region: "Guinea", terrain: JUNGLE, edges: [3, 1, 1, 1, 1, 3]},
    {
        id: 3720,
        name: "Wewak",
        city: CITY,
        airfield: true,
        port: true,
        region: "Guinea",
        terrain: JUNGLE,
        edges: [1, 1, 1, 3, 2, 3]
    },
    {
        id: 3721,
        name: "Madang",
        city: CITY,
        airfield: true,
        region: "Guinea",
        terrain: JUNGLE,
        edges: [3, 1, 2, 2, 2, 2]
    },
    {id: 3722, region: "Guinea", terrain: MOUNTAIN, edges: [2, 2, 3, 1, 1, 3]},
    {
        id: 3822,
        name: "Lae",
        city: CITY,
        airfield: true,
        port: true,
        region: "Guinea",
        terrain: MIXED,
        edges: [1, 1, 3, 2, 2, 2]
    },
    {
        id: 3823,
        name: "Port Moresby",
        airfield: true,
        city: CITY,
        port: true,
        region: "Guinea",
        terrain: MOUNTAIN,
        edges: [2, 4, 3, 1, 1, 3]
    },
    {id: 3922, name: "Buna", city: CITY, airfield: true, region: "Guinea", terrain: MIXED, edges: [1, 1, 1, 2, 4, 3]},
    {id: 3923, region: "Guinea", terrain: MIXED, edges: [2, 8, 3, 1, 1, 3]},
    {
        id: 4024,
        name: "Gili Gili",
        airfield: true,
        city: CITY,
        port: true,
        region: "Guinea",
        terrain: MIXED,
        edges: [1, 1, 1, 1, 1, 3]
    },
    {id: 4023, name: "D`Entrecasteaux", region: "Guinea", terrain: MIXED, island: true},
    {id: 4124, name: "Rossel", region: "Guinea", terrain: MIXED, island: true},
    {id: 3719, name: "Ninigo", region: "AMandates", terrain: MIXED, island: true},
    {
        id: 3820,
        name: "Admiralty Islands",
        airfield: true,
        port: true,
        region: "AMandates",
        terrain: MIXED,
        island: true
    },
    {
        id: 4020,
        name: "Kavieng",
        airfield: true,
        city: CITY,
        port: true,
        region: "AMandates",
        terrain: MIXED,
        edges: [1, 1, 3, 1, 1, 1]
    },
    {id: 4120, region: "AMandates", terrain: MIXED, edges: [1, 1, 1, 17, 8, 3]},
    {
        id: 4021,
        name: "Rabaul",
        airfield: true,
        city: CITY,
        port: true,
        region: "AMandates",
        terrain: MIXED,
        edges: [1, 8, 17, 2, 1, 1]
    },
    {
        id: 3921,
        name: "Gasmata",
        city: CITY,
        airfield: true,
        region: "AMandates",
        terrain: MIXED,
        edges: [1, 1, 3, 1, 1, 1]
    },
    {id: 4022, region: "AMandates", terrain: MIXED, edges: [2, 17, 1, 1, 1, 3]},
    {id: 4121, name: "Green", airfield: true, region: "AMandates", terrain: MIXED, island: true},
    {id: 4221, name: "Baka", airfield: true, region: "AMandates", terrain: MIXED, island: true},
    {id: 4122, name: "Woodlark", airfield: true, region: "AMandates", terrain: MIXED, island: true},
    {
        id: 4222,
        name: "Bougainville",
        city: CITY,
        airfield: true,
        port: true,
        region: "AMandates",
        terrain: MIXED,
        island: true
    },
    {id: 4322, name: "New Georgia", airfield: true, region: "AMandates", terrain: MIXED, island: true},
    {id: 4423, name: "Guadalcanal", airfield: true, port: true, region: "AMandates", terrain: MIXED, island: true},
    {id: 4422, name: "Santa Isabel", region: "AMandates", terrain: MIXED, island: true},
    {id: 4424, name: "Rennell", region: "AMandates", terrain: MIXED, island: true},
    {id: 4522, name: "Malaita", region: "AMandates", terrain: MIXED, island: true},
    {id: 4523, name: "San Cristobal", region: "AMandates", terrain: MIXED, island: true},
    {id: 4627, region: "Oceania", terrain: MIXED, edges: [1, 1, 3, 1, 1, 1]},
    {id: 4727, region: "Hebrides", terrain: MIXED, edges: [1, 1, 3, 8, 1, 3]},
    {
        id: 4828,
        name: "Moumea",
        city: CITY,
        airfield: true,
        port: true,
        region: "Hebrides",
        terrain: MIXED,
        edges: [1, 1, 8, 8, 8, 3]
    },
    {id: 4723, name: "Ndeni", region: "Hebrides", terrain: MIXED, island: true},
    {id: 4824, name: "Tora Vanikoro", region: "Hebrides", terrain: MIXED, island: true},
    {id: 4825, name: "Espiritu Santo", airfield: true, port: true, region: "Hebrides", terrain: MIXED, island: true},
    {id: 4826, name: "Efate", airfield: true, port: true, region: "Hebrides", terrain: MIXED, island: true},
    {id: 4926, name: "Tana", airfield: true, region: "Hebrides", terrain: MIXED, island: true},
    {id: 4925, name: "Pentacost", region: "Hebrides", terrain: MIXED, island: true},
    {id: 4827, name: "Mare", region: "Hebrides", terrain: MIXED, island: true},
    {id: 5325, name: "Viti", airfield: true, port: true, region: "Oceania", terrain: MIXED, island: true},
    {id: 5425, name: "Vanua", region: "Oceania", terrain: MIXED, island: true},
    {id: 5724, name: "Tongatabu", airfield: true, region: "Oceania", terrain: MIXED, island: true},
    {id: 5823, name: "Samoe", airfield: true, port: true, region: "Oceania", terrain: MIXED, island: true},
    {id: 5525, name: "Lau Group", region: "Oceania", terrain: ATOLL},
    {id: 5423, name: "Is. le Horn", airfield: true, region: "Oceania", terrain: ATOLL},
    {id: 5221, name: "Nanumea", airfield: true, region: "Oceania", terrain: ATOLL},
    {id: 5321, name: "Funafuti", airfield: true, port: true, region: "Oceania", terrain: ATOLL},
    {id: 5717, name: "Canton", airfield: true, region: "Oceania", terrain: ATOLL},
    {id: 5719, name: "Gardner", airfield: true, region: "Oceania", terrain: ATOLL},
    {id: 5819, name: "Phoenix", region: "Oceania", terrain: ATOLL},
    {id: 5720, name: "Atafu", region: "Oceania", terrain: ATOLL},
    {id: 5821, name: "Fakaofo", region: "Oceania", terrain: ATOLL},
    {id: 5417, name: "Howland", region: "Oceania", terrain: ATOLL},
    {id: 5418, name: "Baker", region: "Oceania", terrain: ATOLL},
    {id: 5018, name: "Tarawa", airfield: true, region: "Oceania", terrain: ATOLL},
    {id: 5019, name: "Nonouti", region: "Oceania", terrain: ATOLL},
    {id: 5119, name: "Onotoa", region: "Oceania", terrain: ATOLL},
    {id: 4719, name: "Nauru", airfield: true, region: "Oceania", terrain: OPEN, island: true},
    {id: 4819, name: "Ocean", region: "Oceania", terrain: OPEN, island: true},
    {id: 5814, name: "Palmyra", airfield: true, region: "Oceania", terrain: OPEN, island: true},
    {id: 5511, name: "Johnston", airfield: true, region: "Oceania", terrain: ATOLL},
    {id: 3814, name: "Guam", airfield: true, region: "Oceania", terrain: MIXED, island: true},
    {id: 4612, name: "Wake", airfield: true, region: "Oceania", terrain: ATOLL},
    {id: 5108, name: "Midway", airfield: true, region: "Oceania", terrain: ATOLL},
    {id: 5708, name: "Kauai", airfield: true, region: "Oceania", terrain: MIXED, island: true},
    {id: 5808, name: "Oahu", city: CITY, airfield: true, port: true, region: "Oceania", terrain: MIXED, island: true},
    {id: 5908, name: "Hilo", city: CITY, airfield: true, region: "Oceania", terrain: MIXED, island: true},
    {id: 4200, region: "Oceania", terrain: OCEAN, edges: [0, 0, 1, 1, 0, 0]},
    {id: 4100, region: "Oceania", terrain: OCEAN, edges: [0, 0, 1, 1, 1, 1]},
    {id: 4600, name: "Attu/Kiska", region: "Alaska", terrain: MIXED, island: true},
    {id: 4700, name: "Amchitka", region: "Alaska", terrain: MIXED, island: true},
    {id: 4800, name: "Adak", region: "Alaska", terrain: MIXED, island: true},
    {id: 5000, name: "Umnak", region: "Alaska", terrain: MIXED, island: true},
    {
        id: 5100,
        name: "Dutch Harbor",
        city: CITY,
        airfield: true,
        port: true,
        region: "Alaska",
        terrain: MIXED,
        island: true
    },
    {id: 3800, region: "Oceania", terrain: OCEAN, edges: [0, 0, 1, 1, 1, 0]},
    {id: 4000, region: "Oceania", terrain: OCEAN, edges: [0, 0, 1, 1, 1, 0]},
    {id: 4400, region: "Oceania", terrain: OCEAN, edges: [0, 0, 1, 1, 1, 0]},
    {id: 5200, region: "Oceania", terrain: OCEAN, edges: [0, 0, 1, 1, 1, 0]},
    {id: 3900, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
    {id: 3900, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
    {id: 4100, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
    {id: 4300, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
    {id: 4300, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
    {id: 4500, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
    {id: 4900, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
]

var sp_map = [
    {id: 3017, edges: [0, 1, 1, 25, 0, 0], top: true},
    {id: 3116, edges: [0, 0, 1, 1, 1, 0], top: true},
    {id: 3217, edges: [0, 1, 1, 1, 1, 1], top: true},
    {id: 3316, edges: [0, 1, 1, 1, 1, 0], top: true},
    {id: 3416, edges: [0, 0, 1, 1, 1, 0], top: true},
    {id: 3516, edges: [0, 0, 1, 1, 1, 1], top: true},
    {id: 3617, edges: [0, 1, 1, 1, 1, 1], top: true},
    {id: 3716, edges: [0, 0, 1, 1, 1, 0], top: true},
    {id: 3817, edges: [0, 1, 1, 1, 1, 1], top: true},
    {id: 3916, edges: [0, 0, 1, 1, 1, 0], top: true},
    {id: 4017, edges: [0, 1, 1, 1, 1, 1], top: true},
    {id: 4116, edges: [0, 0, 1, 1, 1, 0], top: true},
    {id: 4217, edges: [0, 1, 1, 1, 1, 1], top: true},
    {id: 4316, edges: [0, 0, 1, 1, 1, 0], top: true},
    {id: 4417, edges: [0, 0, 0, 1, 1, 1], top: true},
    {id: 4418, edges: [1, 0, 0, 1, 1, 1]},
    {id: 4419, edges: [1, 0, 1, 1, 1, 1]},
    {id: 4519, edges: [0, 1, 1, 1, 1, 1], top: true},
    {id: 4619, edges: [0, 0, 1, 1, 1, 0], top: true},
    {id: 4719, edges: [0, 1, 1, 1, 1, 1], top: true},
    {id: 4819, edges: [0, 0, 1, 1, 1, 0], top: true},
    {id: 4919, edges: [0, 1, 1, 1, 1, 1], top: true},
    {id: 5019, edges: [0, 0, 0, 1, 1, 0], top: true},
    {id: 5020, edges: [1, 0, 0, 1, 1, 1]},
    {id: 5021, edges: [1, 0, 0, 1, 1, 1]},
    {id: 5022, edges: [1, 0, 0, 1, 1, 1]},
    {id: 5023, edges: [1, 0, 0, 1, 1, 1]},
    {id: 5024, edges: [1, 0, 0, 1, 1, 1]},
    {id: 5025, edges: [1, 0, 0, 1, 1, 1]},
    {id: 5026, edges: [1, 0, 0, 1, 1, 1]},
    {id: 5027, edges: [1, 0, 0, 0, 1, 1]},
    {id: 3018, edges: [1, 1, 1, 1, 0, 0]},
    {id: 3019, edges: [1, 1, 1, 1, 0, 0]},
    {id: 3020, edges: [1, 1, 1, 1, 0, 0]},
    {id: 3021, edges: [1, 1, 1, 1, 0, 0]},
    {id: 3022, edges: [1, 1, 1, 1, 0, 0]},
    {id: 3023, edges: [1, 1, 10, 2, 0, 0]},
    {id: 3024, edges: [2, 2, 2, 2, 0, 0]},
    {id: 3025, edges: [2, 2, 2, 2, 0, 0]},
    {id: 3125, edges: [2, 2, 2, 0, 0, 2]},
    {id: 4927, edges: [1, 1, 0, 0, 1, 1]},
    {id: 5027, edges: [1, 0, 0, 0, 1, 1]},
    {id: 3226, edges: [3, 3, 2, 0, 0, 2]},
    {id: 3326, edges: [3, 3, 2, 0, 0, 2]},
    {id: 3427, edges: [2, 2, 2, 0, 0, 2]},
    {id: 3527, edges: [2, 2, 2, 0, 0, 2]},
]

const GARRISONED_CITY = [...Array(Object.keys(map).length).keys()].map(i => map[i]).filter(h => h.city > CITY).map(h => hex_to_int(h.id))
const RESOURCE_HEX = [...Array(map.length).keys()].filter(h => map[h].resource).map(h => hex_to_int(map[h].id))


function get_map_data(hex) {
    if (G.sid === SOUTH_PACIFIC_SCENARIO) {
        return S_P_MAP_DATA[hex]
    } else if (G.sid === BURMA_SCENARIO) {
        return B_F_W_MAP_DATA[hex]
    }
    return MAP_DATA[hex]
}

//Build map
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
B_F_W_MAP_DATA[SAIGON].nh.length = 3
B_F_W_MAP_DATA[SAIGON].edges_int = B_F_W_MAP_DATA[SAIGON].edges_int % (1 << 5 * 4)
B_F_W_MAP_DATA[hex_to_int(1912)].nh.length = 3
B_F_W_MAP_DATA[hex_to_int(1912)].edges_int = (B_F_W_MAP_DATA[hex_to_int(1912)].edges_int % (1 << 5 * 3))

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
B_F_W_MAP_DATA[hex_to_int(1912)].nh.push(-1)
B_F_W_MAP_DATA[hex_to_int(1912)].nh.push(hex_to_int(1812))
B_F_W_MAP_DATA[hex_to_int(1912)].edges_int |= ((WATER | UNPLAYABLE_WATER) << 5 * 5)

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

function non_playable_hex(id) {
    return {id: id, terrain: OCEAN, region: "Ocean", edges_int: 0, nh: []}
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
    data.map[data.from].edges_int |= (WATER | UNPLAYABLE_WATER) << (5 * data.map[data.from].nh.length)
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

function get_near_hexes(hex) {
    return get_map_data(hex).nh
}/** import common/data_map.js*/

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
}/** import common/data.js*/
/** import common/utils.js*/
/** import common/library.js*/

// Fast deep copy for objects without cycles
function object_copy(original) {
    var copy, i, n, v
    if (Array.isArray(original)) {
        n = original.length
        copy = new Array(n)
        for (i = 0; i < n; ++i) {
            v = original[i]
            if (typeof v === "object" && v !== null)
                copy[i] = object_copy(v)
            else
                copy[i] = v
        }
        return copy
    } else {
        copy = {}
        for (i in original) {
            v = original[i]
            if (typeof v === "object" && v !== null)
                copy[i] = object_copy(v)
            else
                copy[i] = v
        }
        return copy
    }
}

// Fast deep object comparison for objects without cycles
function object_diff(a, b) {
    var i, key
    var a_length
    if (a === b)
        return false
    if (a !== null && b !== null && typeof a === "object" && typeof b === "object") {
        if (Array.isArray(a)) {
            if (!Array.isArray(b))
                return true
            a_length = a.length
            if (b.length !== a_length)
                return true
            for (i = 0; i < a_length; ++i)
                if (object_diff(a[i], b[i]))
                    return true
            return false
        }
        for (key in a)
            if (object_diff(a[key], b[key]))
                return true
        for (key in b)
            if (!(key in a))
                return true
        return false
    }
    return true
}

// Array remove and insert (faster than splice)

function array_delete(array, index) {
    var i, n = array.length
    for (i = index + 1; i < n; ++i)
        array[i - 1] = array[i]
    array.length = n - 1
}

function array_delete_item(array, item) {
    var i, n = array.length
    for (i = 0; i < n; ++i)
        if (array[i] === item)
            return array_delete(array, i)
}

function array_insert(array, index, item) {
    for (var i = array.length; i > index; --i)
        array[i] = array[i - 1]
    array[index] = item
}

function array_delete_pair(array, index) {
    var i, n = array.length
    for (i = index + 2; i < n; ++i)
        array[i - 2] = array[i]
    array.length = n - 2
}

function array_insert_pair(array, index, key, value) {
    for (var i = array.length; i > index; i -= 2) {
        array[i] = array[i - 2]
        array[i + 1] = array[i - 1]
    }
    array[index] = key
    array[index + 1] = value
}

// Set as plain sorted array

function set_clear(set) {
    set.length = 0
}

function set_has(set, item) {
    var a = 0
    var b = set.length - 1
    while (a <= b) {
        var m = (a + b) >> 1
        var x = set[m]
        if (item < x)
            b = m - 1
        else if (item > x)
            a = m + 1
        else
            return true
    }
    return false
}

function set_add(set, item) {
    var a = 0
    var b = set.length - 1
    // optimize fast case of appending items in order
    if (item > set[b]) {
        set[b + 1] = item
        return
    }
    while (a <= b) {
        var m = (a + b) >> 1
        var x = set[m]
        if (item < x)
            b = m - 1
        else if (item > x)
            a = m + 1
        else
            return
    }
    array_insert(set, a, item)
}

function set_delete(set, item) {
    var a = 0
    var b = set.length - 1
    while (a <= b) {
        var m = (a + b) >> 1
        var x = set[m]
        if (item < x)
            b = m - 1
        else if (item > x)
            a = m + 1
        else {
            array_delete(set, m)
            return
        }
    }
}

function set_toggle(set, item) {
    var a = 0
    var b = set.length - 1
    while (a <= b) {
        var m = (a + b) >> 1
        var x = set[m]
        if (item < x)
            b = m - 1
        else if (item > x)
            a = m + 1
        else {
            array_delete(set, m)
            return
        }
    }
    array_insert(set, a, item)
}

// Map as plain sorted array of key/value pairs

function map_clear(map) {
    map.length = 0
}

function map_has(map, key) {
    var a = 0
    var b = (map.length >> 1) - 1
    while (a <= b) {
        var m = (a + b) >> 1
        var x = map[m << 1]
        if (key < x)
            b = m - 1
        else if (key > x)
            a = m + 1
        else
            return true
    }
    return false
}

function map_get(map, key, missing) {
    var a = 0
    var b = (map.length >> 1) - 1
    while (a <= b) {
        var m = (a + b) >> 1
        var x = map[m << 1]
        if (key < x)
            b = m - 1
        else if (key > x)
            a = m + 1
        else
            return map[(m << 1) + 1]
    }
    return missing
}

function map_set(map, key, value) {
    var a = 0
    var b = (map.length >> 1) - 1
    while (a <= b) {
        var m = (a + b) >> 1
        var x = map[m << 1]
        if (key < x)
            b = m - 1
        else if (key > x)
            a = m + 1
        else {
            map[(m << 1) + 1] = value
            return
        }
    }
    array_insert_pair(map, a << 1, key, value)
}

function map_delete(map, key) {
    var a = 0
    var b = (map.length >> 1) - 1
    while (a <= b) {
        var m = (a + b) >> 1
        var x = map[m << 1]
        if (key < x)
            b = m - 1
        else if (key > x)
            a = m + 1
        else {
            array_delete_pair(map, m << 1)
            return
        }
    }
}

function map_get_set(map, key) {
    var set = map_get(map, key, null)
    if (set === null)
        map_set(map, key, (set = []))
    return set
}

function map_for_each(map, f) {
    for (var i = 0; i < map.length; i += 2)
        f(map[i], map[i + 1])
}

// same as Object.groupBy
function object_group_by(items, callback) {
    var item, key
    var groups = {}
    if (typeof callback === "function") {
        for (item of items) {
            key = callback(item)
            if (key in groups)
                groups[key].push(item)
            else
                groups[key] = [item]
        }
    } else {
        for (item of items) {
            key = item[callback]
            if (key in groups)
                groups[key].push(item)
            else
                groups[key] = [item]
        }
    }
    return groups
}

// like Object.groupBy but for plain array maps
function map_group_by(items, callback) {
    var item, key, arr
    var groups = []
    if (typeof callback === "function") {
        for (item of items) {
            key = callback(item)
            arr = map_get(groups, key)
            if (arr)
                arr.push(item)
            else
                map_set(groups, key, [item])
        }
    } else {
        for (item of items) {
            key = item[callback]
            arr = map_get(groups, key)
            if (arr)
                arr.push(item)
            else
                map_set(groups, key, [item])
        }
    }
    return groups
}/** import common/library.js*/

function hex_to_int(i) {
    return (Math.floor(i / 100) - 10) * 29 + i % 100
}


function int_to_hex(i) {
    return (Math.floor(i / 29) * 100) + 1000 + i % 29
}


function with_state_as_G(state, apply) {
    var actual_g = G
    G = state
    G = state
    // G.active = actual_g.active
    var log = G.log
    G.log = []
    var result = apply()
    G.log = log
    G = actual_g
    return result
}

function get_direction(from, to) {
    var x = ((from) % 29)
    var d = ((from - x) / 29) % 2
    var r = HEX_DIRECTION[from - to + 30 + d * 10]
    return r ? r : 0
}

function get_edge_hexes(hex) {
    let y = hex % 29
    let x = (hex - y) / 29

    let y_diff = 1 - (x % 2)
    let y1_diff = 1 - y_diff
    let result = []
    result.push((-y >> 31) * hex * -1 - 1)                                                                          //N or -1
    result.push((-((x - 50 >> 31) & (-y1_diff | -hex % 29 >> 31)) - 1) * (hex + 30 - y_diff) + hex + 29 - y_diff)   //NE or -1
    result.push((-((x - 50 >> 31) & ((-hex - 1) % 29 >> 31)) - 1) * (hex + 30 + y1_diff) + hex + 29 + y1_diff)      //SE or -1
    result.push((-((-hex - 1 - y1_diff) % 29 >> 31) - 1) * (hex + 2) + hex + 1)                                     //S or -1
    result.push((-((-x >> 31) & ((-hex - 1) % 29 >> 31)) - 1) * (hex - 28 + y1_diff) + hex - 29 + y1_diff)      //SW or -1
    result.push((-((-x >> 31) & (-y1_diff | -hex % 29 >> 31)) - 1) * (hex - 28 - y_diff) + hex - 29 - y_diff)   //NW or -1
    return result
}

function for_each_hex_in_range(hex, range, lambda) {
    lambda(hex)
    const y = hex % 29
    const x = (hex - y) / 29
    const d = x % 2
    var i

    for (var j = -range; j <= range; j++) {
        if (x + j < 0 || x + j > 50) {
            continue
        }
        const d2 = Math.abs(j) % 2
        var current = (x + j) * 29 + y
        lambda(current)
        var limit = (range - d2) / 2 + (1 - d) * d2 + Math.floor((range - Math.abs(j)) / 2)
        i = 0
        while (current % 29 > 0 && i < limit) {
            current -= 1
            lambda(current)
            i++
        }
        limit = (range - d2) / 2 + d * d2 + Math.floor((range - Math.abs(j)) / 2)
        current = (x + j) * 29 + y
        i = 0
        while ((current) % 29 < 28 && i < limit) {
            current += 1
            lambda(current)
            i++
        }
    }
}


function get_distance(first_hex, second_hex) {
    if (first_hex > LAST_BOARD_HEX || second_hex > LAST_BOARD_HEX) {
        return 500
    }
    var yf = first_hex % 29
    var ys = second_hex % 29
    var xf = (first_hex - yf) / 29
    var xs = (second_hex - ys) / 29
    var rx = Math.abs(xs - xf)
    var ry = ys - yf - (rx % 2) * (xf % 2)
    if (ry <= (-rx >> 1)) {
        ry = Math.abs(ry) - rx % 2
    } else if (ry < rx >> 1) {
        const c = (rx >> 1) - ry
        ry = (rx >> 1) + ((c + (rx % 2)) >> 1)
        rx -= c
    }
    return rx + ry - (rx >> 1)
}

function offensive_card_header() {
    return `${G.offensive.type === EC ? "EC" : "OC"}: ${cards[G.offensive.active_cards[0]].ops} Ops.`
}/** import common/utils.js*/
/** import supply.js*/
let last = Date.now()
let count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

function check_supplied_hexes(faction) {
    check_supply()
    L.supply = {}
    mark_supplied_hexes(faction)
    mark_supply_eligable_ports(AP)
    mark_supply_eligable_ports(JP)
    L.supply = 0
}

function check_supply() {
    L.supply = {}
    clear_supply_cache(CLEAN_ALL_MASK)
    G.burma_road = 0
    for_each_unit_on_map(mark_unit)
    place_virtual_units()
    check_infrastructure()
    var oos_units = [[], []]
    G.oos = []
    check_faction_supply_not_changed(AP, false, oos_units)
    check_faction_supply_not_changed(JP, true, oos_units)
    for (var i = 1; i < 10; i++) {//limit supply check counts
        const ap = check_faction_supply_not_changed(AP, true, oos_units)
        const jp = check_faction_supply_not_changed(JP, true, oos_units)
        if (ap && jp) {
            break
        }
    }
    G.oos = oos_units[0]
    if (G.turn > 1) {
        oos_units[1].forEach(h => set_add(G.oos, h))
    }
    if (G.sid === SOUTH_PACIFIC_SCENARIO && G.turn === 3) {
        var mask = G.supply_cache[TRUK] & JP_UNITS
        G.supply_cache[TRUK] ^= (mask)
    } else if (G.sid === BURMA_SCENARIO) {
        var mask = G.supply_cache[SINGAPORE] & JP_UNITS
        G.supply_cache[SINGAPORE] ^= (mask)
    }
    mark_supply_eligable_ports(AP)
    mark_supply_eligable_ports(JP)
    L.supply = 0
}

function fast_check_supply() {
    L.supply = {}
    clear_supply_cache(CLEAN_ALL_MASK)
    G.burma_road = 0
    for_each_unit_on_map(mark_unit)
    place_virtual_units()
    check_infrastructure()
    for_each_unit_on_map((i, p) => set_zoi(i, p, [G.oos, G.oos]))

    if (G.sid === SOUTH_PACIFIC_SCENARIO && G.turn === 3) {
        var mask = G.supply_cache[TRUK] & JP_UNITS
        G.supply_cache[TRUK] ^= (mask)
    } else if (G.sid === BURMA_SCENARIO) {
        var mask = G.supply_cache[SINGAPORE] & JP_UNITS
        G.supply_cache[SINGAPORE] ^= (mask)
    }
    L.supply = 0
}

function check_units() {
    clear_supply_cache(CLEAN_ALL_MASK)
    G.burma_road = 0
    for_each_unit_on_map(mark_unit)
    place_virtual_units()
    check_infrastructure()
}

function clear_supply_cache(mask) {
    for (var i = 1; i < LAST_BOARD_HEX; i++) {
        G.supply_cache[i] = G.supply_cache[i] & mask
    }
}

function mark_unit(i, piece) {
    const location = G.location[i]
    if (piece.class === "air") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_AIR_UNITS << piece.faction)
    } else if (piece.class === "hq") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_HQ_UNITS << piece.faction)
    } else if (piece.class === "naval") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_NAVAL_UNITS << piece.faction)
    } else if (piece.class === "ground") {
        G.supply_cache[location] = G.supply_cache[location] | (JP_GROUND_UNITS << piece.faction)
    }
    if (piece.br) {
        for_each_hex_in_range(location, 2, h => G.supply_cache[h] |= JP_ZOI_DISABLED << piece.faction)
    }
}

function place_virtual_units() {
    GARRISONED_CITY.forEach(h => {
        if (is_space_controlled(h, JP) && (get_map_data(h).city === CHINESE_CITY || !set_has(G.garr_elim, h))) {
            G.supply_cache[h] = G.supply_cache[h] | JP_GROUND_UNITS
        }
    })
}

function check_infrastructure() {
    ROAD_EVENTS.filter(e => !is_event_active(e)).forEach(e => e.keys.forEach(h => G.supply_cache[h] |= TRANSPORT_ROUTE_DISABLED))
}

function check_hump() {
    if (is_event_active(events.HUMP)
        && ((G.supply_cache[JARHAT] & AP_SUPPLY_AIRFIELD) || (G.supply_cache[DACCA] & AP_SUPPLY_AIRFIELD))) {
        G.burma_road = Math.min(1, G.burma_road)
        return true
    }
    return false
}

function check_burma_road() {
    G.burma_road = 2
    if (G.sid === SOUTH_PACIFIC_SCENARIO) {
        return;
    }
    const faction = AP
    const location = KUNMING
    L.supply.queue = [location]
    L.supply.retracing = [location]
    var distance_map = [location, 0]
    var rangoon_achived = false
    for (var i = 0; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            var distance = get_ground_mp_cost(item, nh, j, faction)
            if (distance > 1 || map_has(distance_map, nh) || occupied_land || is_space_controlled(nh, JP)) {
                continue
            }
            map_set(distance_map, nh, distance)
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            if (nh === MADRAS) {
                G.burma_road = 0
                return
            } else if (nh === RANGOON) {
                rangoon_achived = true
                i++
            }
        }
    }
    if (!rangoon_achived || has_non_n_zoi(RANGOON, JP) || is_space_controlled(RANGOON, JP)) {
        check_hump()
        return;
    }
    L.supply.queue.push(RANGOON)
    L.supply.retracing.push(0)
    distance_map = [RANGOON, 0]
    for (i = L.supply.queue.length - 1; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        var MD = get_map_data(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (!(MD.edges_int & WATER << 5 * j) || map_has(distance_map, nh) || has_non_n_zoi(nh, JP)) {
                continue
            }
            map_set(distance_map, nh, 1)
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            if (nh === MADRAS || get_map_data(nh).supply_source & JOINT_SUPPLIED_HEX) {
                G.burma_road = 0
                return
            }
        }
    }
    check_hump()
}

function for_each_unit(apply) {
    for (let i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        var location = G.location[i]
        apply(i, piece, location)
    }
}

function for_each_unit_on_map(apply) {
    for (let i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        var location = G.location[i]
        if (location > LAST_BOARD_HEX) {
            continue
        }
        apply(i, piece, location)
    }
}

function set_zoi(i, piece, oos_units) {
    let location = G.location[i]
    var zoi_disabled = L && L.move_type === STRAT_MOVE && set_has(G.active_stack, i)
    var mask = 0
    if (piece.br && set_has(oos_units[piece.faction], i) && !zoi_disabled) {
        mask = (JP_ZOI_DISABLED << piece.faction)
    } else if (piece.br && !zoi_disabled) {
        mask = (JP_ZOI << piece.faction)
        if (piece.br < 6) {
            mask = mask | JP_ZOI_NTRL << 1 - piece.faction
        }
    }
    if (mask > 0) {
        for_each_hex_in_range(location, 2, h => G.supply_cache[h] = G.supply_cache[h] | mask)
    }
}

function check_hq_in_supply(hq, piece, supply) {
    const faction = piece.faction
    const location = G.location[hq]
    L.supply.retracing = [location]
    L.supply.queue = [location]
    var overland_set = []
    overland_set[location] = 3
    if (get_map_data(location).supply_source & supply) {
        return true
    }
    for (var i = 0; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        const overland = overland_set[item] & 1
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const enemy_port_s = (MD.port && is_space_controlled(item, 1 - faction))
        const occupied_land_s = G.supply_cache[item] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[item] & JP_GAH_UNITS << faction)
        const oversea = overland_set[item] & 2
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            var reachable = false
            const enemy_port = enemy_port_s || (MD.port && is_space_controlled(item, 1 - faction))
            const occupied_land = occupied_land_s || G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (!(overland_set[nh] & 1) && (overland || (MD.port && !enemy_port)) && MD.edges_int & GROUND << 5 * j && !occupied_land) {
                reachable = true
                overland_set[nh] |= 1
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!(overland_set[nh] & 2) && (oversea || (MD.port && !enemy_port)) && MD.edges_int & WATER << 5 * j && !non_neutral_zoi) {
                reachable = true
                overland_set[nh] |= 2
            }
            if (reachable) {
                L.supply.queue.push(nh)
                L.supply.retracing.push(item)
                if (get_map_data(nh).supply_source & supply) {
                    return true
                }
            }
        }
    }
    return false
}

function mark_supply_ports_overland(hq, piece) {
    const faction = pieces[hq[0]].faction
    L.supply.queue = []
    L.supply.retracing = []
    var distance_map = []
    hq.forEach(u => {
        var location = G.location[u]
        L.supply.queue.push(location)
        L.supply.retracing.push(location)
        G.supply_cache[location] = G.supply_cache[location] | JP_SUPPLY_PORT << faction
        map_set(distance_map, location, 0)
        distance_map[location] = 1
    })
    for (var i = L.supply.queue.length - 1; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let base_distance = map_get(distance_map, item)
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            var distance = base_distance + get_ground_mp_cost(item, nh, j, faction)
            if (distance > SUPPLY_PORT_RANGE || distance >= map_get(distance_map, nh, 100) || occupied_land) {
                continue
            }
            map_set(distance_map, nh, distance)

            if (distance < SUPPLY_PORT_RANGE) {
                L.supply.queue.push(nh)
                L.supply.retracing.push(item)
            }
            if (get_map_data(nh).port && is_space_controlled(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_PORT << faction
            }
            if (get_map_data(nh).airfield && is_space_controlled(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_AIRFIELD << faction
            }
        }
    }
}

function mark_supply_ports_oversea(hq) {
    const faction = pieces[hq[0]].faction
    L.supply.queue = []
    L.supply.retracing = []
    var distance_map = []
    hq.forEach(u => {
        var location = G.location[u]
        L.supply.queue.push(location)
        L.supply.retracing.push(location)
        G.supply_cache[location] = G.supply_cache[location] | JP_SUPPLY_PORT << faction
        distance_map[location] = 1
    })
    for (var i = L.supply.queue.length - 1; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!distance_map[nh] && get_map_data(item).edges_int & WATER << 5 * j && !non_neutral_zoi) {
                distance_map[nh] = 1
                L.supply.queue.push(nh)
                L.supply.retracing.push(item)
                if (G.supply_cache[nh] & JP_SUPPLY_PORT << faction || nh > LAST_BOARD_HEX) {
                    return
                }
                if (get_map_data(nh).port && is_space_controlled(nh, faction)) {
                    G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_PORT << faction
                }
                if (get_map_data(nh).airfield && is_space_controlled(nh, faction)) {
                    G.supply_cache[nh] = G.supply_cache[nh] | JP_SUPPLY_AIRFIELD << faction
                }
            }
        }
    }
}

function supply_source_in_range(location, faction) {
    L.supply.port_queue = [location]
    L.supply.port_retracing = [location]
    if (G.supply_cache[location] & JP_SUPPLY_PORT << faction) {
        return true
    }
    const distance_map = []
    map_set(distance_map, location, 0)

    for (var i = 0; i < L.supply.port_queue.length; i++) {
        const item = L.supply.port_queue[i]
        const base_distance = map_get(distance_map, item)
        const nh_list = get_near_hexes(item)
        for (var j = 0; j < nh_list.length; j++) {
            const nh = nh_list[j]
            if (nh <= 0) {
                continue
            }

            var distance = base_distance + get_ground_mp_cost(nh, item, (j + 3) % 6, faction)
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (distance > SUPPLY_PORT_RANGE || occupied_land || distance >= map_get(distance_map, nh, [100])) {
                continue
            }
            L.supply.port_queue.push(nh)
            L.supply.port_retracing.push(item)
            if (G.supply_cache[nh] & JP_SUPPLY_PORT << faction) {
                return true
            }
            map_set(distance_map, nh, distance)


        }
    }
    return false
}

function mark_hexes_supplied_kunming() {
    var i = 0
    const location = KUNMING
    L.supply.queue = []
    L.supply.retracing = []
    var overland_set = [KUNMING, 0]
    const supply_type = JOINT_SUPPLIED_HEX
    G.supply_cache[location] = G.supply_cache[location] | supply_type
    L.supply.queue.push(location)
    L.supply.retracing.push(location)
    for (; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const distance_base = map_get(overland_set, item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const distance = distance_base + get_ground_mp_cost(nh, item, (j + 3) % 6, AP)
            if (distance > SUPPLY_PORT_RANGE || map_get(overland_set, nh, 100) <= distance) {
                continue
            }
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            map_set(overland_set, nh, distance)
            G.supply_cache[nh] = G.supply_cache[nh] | supply_type
        }
    }
}

function unit_or_airfield(location, faction) {
    return is_faction_units(location, faction) || get_map_data(location).airfield
}

function mark_hexes_supplied_from(hq_list, is_check_supply_space, pre_cache) {
    if (!hq_list.length) {
        return;
    }
    var i = 0
    const faction = pieces[hq_list[0]].faction
    var second_ports = []
    var overland_ports = []
    const oversea_set = pre_cache ? pre_cache.oversea_set : []
    const overland_set = pre_cache ? pre_cache.overland_set : []
    L.supply.oversea_set = oversea_set
    L.supply.overland_set = overland_set
    overland_set[LAST_BOARD_HEX] = 100
    oversea_set[LAST_BOARD_HEX] = 100
    L.supply.queue = []
    L.supply.retracing = []
    const supply_type = pieces[hq_list[0]].supply
    const extended_supply_type = supply_type | (faction ? JOINT_SUPPLIED_HEX : 0)
    hq_list.forEach(hq => {
        var piece = pieces[hq]
        var location = G.location[hq]
        G.supply_cache[location] = G.supply_cache[location] | supply_type
        oversea_set[location] = piece.cr
        overland_set[location] = piece.cr
        L.supply.queue.push(location)
        L.supply.retracing.push(location)
    })
    for (; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        const distance = overland_set[item] - 1
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = (G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction)) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (!(MD.edges_int & GROUND << 5 * j) || occupied_land || overland_set[nh] >= distance || distance < 0) {
                continue
            }
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            const friendly_port = get_map_data(nh).port && is_space_controlled(nh, faction)
            if (friendly_port && !(oversea_set[nh] >= distance)) {
                oversea_set[nh] = (distance)
                second_ports.push(nh)
            }
            overland_set[nh] = (distance)

            if (!(G.supply_cache[nh] & extended_supply_type) && is_check_supply_space(nh, faction) && supply_source_in_range(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
    hq_list.forEach(hq => {
        var piece = pieces[hq]
        var location = G.location[hq]
        L.supply.queue.push(location)
        L.supply.retracing.push(location)
    })

    for (; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        const MD = get_map_data(item)
        let nh_list = MD.nh
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const distance = oversea_set[item] - 1
        if (non_neutral_zoi_s || distance < 0) {
            continue;
        }
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if ((oversea_set[nh]) >= distance || !(MD.edges_int & WATER << 5 * j) ||
                (G.supply_cache[nh] & JP_ZOI << (1 - faction) & ((G.supply_cache[nh] ^ JP_ZOI_NTRL << (1 - faction)) >> 2)
                )) {
                continue
            }
            var md1 = get_map_data(nh)
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            const friendly_port = (md1.port && (is_space_controlled(nh, faction)))
            if (friendly_port && !md1.island && overland_set[nh] < distance) {
                overland_set[nh] = distance
                overland_ports.push(nh)
            }
            oversea_set[nh] = (distance)
            if (md1.terrain > 0) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
    overland_ports.forEach(k => L.supply.queue.push(k))
    overland_ports.forEach(k => L.supply.retracing.push(0))

    for (; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        const distance = overland_set[item] - 1
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = (G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction)) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            if (!(MD.edges_int & GROUND << 5 * j) || occupied_land || overland_set[nh] >= distance || distance < 0) {
                continue
            }
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            overland_set[nh] = distance
            if (!(G.supply_cache[nh] & extended_supply_type) && is_check_supply_space(nh, faction) && supply_source_in_range(nh, faction)) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
    second_ports.forEach(h => L.supply.queue.push(h))
    second_ports.forEach(h => L.supply.retracing.push(0))
    for (; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        const non_neutral_zoi_s = (G.supply_cache[item] & JP_ZOI << (1 - faction) && !(G.supply_cache[item] & JP_ZOI_NTRL << (1 - faction)))
        const distance = oversea_set[item] - 1
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const non_neutral_zoi = non_neutral_zoi_s || G.supply_cache[nh] & JP_ZOI << (1 - faction) && !(G.supply_cache[nh] & JP_ZOI_NTRL << (1 - faction))
            if (!(MD.edges_int & WATER << 5 * j) || non_neutral_zoi || oversea_set[nh] >= distance || distance < 0) {
                continue
            }
            L.supply.queue.push(nh)
            L.supply.retracing.push(item)
            oversea_set[nh] = (distance)
            if (get_map_data(nh).terrain > 0) {
                G.supply_cache[nh] = G.supply_cache[nh] | supply_type
            }
        }
    }
}

function check_piece_supply(location, i, piece) {
    if (piece.class === "hq") {
        return true
    } else if (G.offensive.active_units[piece.faction] && set_has(G.offensive.active_units[piece.faction], i)) {
        return true
    }
    return G.supply_cache[location] & piece.supply
}

function mark_supplied_hexes(faction) {
    HQ_LIST.forEach(hq => {
        var piece = pieces[hq]
        if (G.location[hq] >= LAST_BOARD_HEX) {
            return
        }
        if (piece.faction === faction && !set_has(G.oos, hq)) {
            mark_hexes_supplied_from([hq], unit_or_airfield)
        }
    })
}


function mark_supply_eligable_ports(faction) {
    var hq = HQ_LIST.filter(hq => {
        var piece = pieces[hq]
        return (piece.faction === faction && G.location[hq] < LAST_BOARD_HEX)
    })
    mark_supply_ports_oversea(hq)
    mark_supply_ports_overland(hq)
}

function check_faction_supply_not_changed(faction, both_sides_zoi, oos_units) {
    clear_supply_cache(NON_SUPPLY_MASK)
    var burma = G.burma_road
    if (G.burma_road < 2) {
        G.supply_cache[KUNMING] |= AP_SUPPLY_PORT
        G.supply_cache[CHINA_BOX] = JOINT_SUPPLIED_HEX
    } else {
        G.supply_cache[CHINA_BOX] = 0
    }
    if (G.turn === 1 && faction === AP) {
        for_each_unit_on_map((u, piece) => {
            if (piece.faction === AP) {
                set_add(oos_units[AP], u)
            }
        })
        return true
    }
    for_each_unit_on_map((i, p) => both_sides_zoi || p.faction === faction ? set_zoi(i, p, oos_units) : null)
    mark_supply_eligable_ports(faction)
    var size = oos_units[faction].filter(u => pieces[u].zoi_generator).length
    oos_units[faction] = []
    var hqs = HQ_LIST.filter(hq => {
        var piece = pieces[hq]
        if (G.location[hq] >= LAST_BOARD_HEX) {
            return false
        }
        if (piece.faction === faction && check_hq_in_supply(hq, piece, piece.faction === AP ? JOINT_SUPPLIED_HEX : JP_SUPPLIED_HEX)) {
            return true
        } else if (piece.faction === faction) {
            set_add(oos_units[faction], hq)
        }
        return false
    })
    if (faction === JP) {
        mark_hexes_supplied_from(hqs, unit_or_airfield)
    } else {
        mark_hexes_supplied_from(hqs.filter(hq => pieces[hq].service === "joint"), unit_or_airfield)
        mark_hexes_supplied_from(hqs.filter(hq => pieces[hq].service === "us"), unit_or_airfield)
        mark_hexes_supplied_from(hqs.filter(hq => pieces[hq].service === "br"), unit_or_airfield)
    }

    if (G.burma_road < 2 && faction === AP) {
        mark_hexes_supplied_kunming()
    }
    var tokyo_express = G.events[events.TOKYO_EXPRESS.id]
    if (tokyo_express > 0) {
        G.supply_cache[tokyo_express] |= JP_SUPPLIED_HEX
    }
    for_each_unit((i, p, location) => {
        if ((location <= LAST_BOARD_HEX || location === CHINA_BOX) &&
            p.class !== "hq" && p.faction === faction && !check_piece_supply(G.location[i], i, p)
        ) {
            set_add(oos_units[faction], i)
        }
    })
    if (faction === AP && G.burma_road < 2) {
        check_burma_road()
    }
    return oos_units[faction].filter(u => pieces[u].zoi_generator).length === size && burma === G.burma_road
}

function get_ground_mp_cost(from, to, direction, faction) {
    if (!(get_map_data(from).edges_int & GROUND << 5 * direction)) {
        return 100;
    }
    if ((get_map_data(from).edges_int & ROAD << (5 * direction))
        && !(G.supply_cache[to] & TRANSPORT_ROUTE_DISABLED)
        && !(G.supply_cache[from] & TRANSPORT_ROUTE_DISABLED)
        && ((G.supply_cache[to] & (JP_UNITS << faction)) || !(G.supply_cache[to] & (JP_UNITS << 1 - faction)))
        && ((G.supply_cache[from] & (JP_UNITS << faction)) || !(G.supply_cache[from] & (JP_UNITS << 1 - faction)))
    ) {
        return 1;
    } else {
        return ((get_map_data(to).terrain >> 1) + 1) * 2
    }
}

function get_ground_move_cost(from, to, faction) {
    var direction = get_direction(from, to)
    if (!(get_map_data(from).edges_int & GROUND << 5 * direction)) {
        return 100;
    }
    if ((get_map_data(from).edges_int & ROAD << (5 * direction))
        && !(G.supply_cache[to] & (TRANSPORT_ROUTE_DISABLED | (JP_GA_UNITS << 1 - faction)))
        && !(G.supply_cache[from] & TRANSPORT_ROUTE_DISABLED)
    ) {
        return 1;
    } else {
        return ((get_map_data(to).terrain >> 1) + 1) * 2
    }
}

function is_space_controlled(hex, faction) {
    if (G.control) {
        var mask = ~(JP_CONTROLLED | HEX_CONTROLLABLE)
        clear_supply_cache(mask)
        G.control.forEach(h => G.supply_cache[h] |= JP_CONTROLLED)
        for (var i = 0; i < LAST_BOARD_HEX; i++) {
            if (create_controllable_hex(i)) {
                G.supply_cache[i] |= HEX_CONTROLLABLE
            }
        }
        G.control = null
    }
    return (!(G.supply_cache[hex] & JP_CONTROLLED) == faction) && (!G.non_control || !set_has(G.non_control, hex))
}


function is_faction_units(hex, faction) {
    return G.supply_cache[hex] & JP_UNITS << faction
}

function is_faction_ground_units(hex, faction) {
    return G.supply_cache[hex] & JP_GROUND_UNITS << faction
}

function is_faction_naval_units(hex, faction) {
    return G.supply_cache[hex] & JP_NAVAL_UNITS << faction
}

function has_non_n_zoi(hex, faction) {
    return (G.supply_cache[hex] & ((JP_ZOI << faction) | (JP_ZOI_NTRL << faction))) === (JP_ZOI << faction)
}

function has_zoi(hex, faction) {
    return (G.supply_cache[hex] & JP_ZOI << faction)
}

function check_unit_supply(location, i, piece) {
    if (piece.class === "hq") {
        return true
    } else if (set_has(G.offensive.active_units[piece.faction], i)) {
        return true
    }
    return G.supply_cache[location] & piece.supply
}/** import supply.js*/
/** import move.js*/
function update_move_hex() {
    if (G.active_stack.length === 0) {
        L.allowed_hexes = []
        return
    }

    L.move_data = get_move_data()

    if (G.offensive.stage === POST_BATTLE_MOVE && L.move_type === BARGES_MOVE) {
        return compute_barges_pbm()
    } else if (L.move_data.is_air_present) {
        compute_air_move_hexes()
    } else if (L.move_data.move_type & STRAT_MOVE) {
        compute_ground_naval_strat_move()
    } else {
        compute_ground_naval_move_hexes()
    }
}


function get_move_data() {
    let result = {
        is_new_battle_allowed: false,
        is_ground_present: false,
        is_air_present: false,
        is_naval_present: false,
        battle_range: 0,
        naval_move_distance: 0,
        ground_move_distance: 0,
        extended_battle_range: 0,
        air_move_legs: 0,
        move_type: 0,
        location: 0,
        moved: false,
        asp_points: 0,
        sm_possible: true,
    }
    var asp_move = true
    var organic_only_ships = true
    if (G.offensive.attacker !== G.active) {
        result.move_type |= REACTION_MOVE
    }
    G.active_stack.forEach(u => {
        let piece = pieces[u]
        if (piece.class === "ground") {
            result.is_ground_present = true
        } else if (piece.class === "naval") {
            result.is_naval_present = true
        } else if (piece.class === "air") {
            result.is_air_present = true
        }
        if (piece.br) {
            result.battle_range = piece.br
            result.extended_battle_range = piece.br
        }
        if (piece.ebr && (!piece.parenthetical || G.offensive.stage === POST_BATTLE_STAGE && extended_pbm_possible() || L.move_type === STRAT_MOVE)) {
            result.extended_battle_range = piece.ebr
        }
        if (piece.ebr && piece.parenthetical && L.move_type === AIR_EXTENDED_MOVE) {
            result.extended_battle_range = piece.ebr
            result.move_type |= AIR_EXTENDED_MOVE
        }
        if (piece.class === "naval" && (!piece.organic || !G.offensive.organic.includes(u))) {
            organic_only_ships = false
        }
        if (piece.class === "ground" && !piece.strat_move) {
            result.sm_possible = false
            asp_move = false
        } else if (piece.class === "ground" && !piece.asp) {
            asp_move = false
        } else if (piece.class === "ground" && !G.offensive.organic.includes(u)) {
            result.asp_points += set_has(G.reduced, u) ? piece.aspr : piece.asp
        }
    })
    result.location = G.location[G.active_stack[0]]
    if (result.sm_possible && !result.is_air_present && get_map_data(result.location).coastal) {
        result.move_type |= NAVAL_MOVE
    }
    result.naval_move_distance = G.offensive.naval_move_distance
    result.air_move_legs = cards[G.offensive.active_cards[0]].ops
    if (L.move_type & STRAT_MOVE) {
        result.air_move_legs = cards[G.offensive.active_cards[0]].ops * 2
    }
    if (L.move_type & STRAT_MOVE && get_map_data(result.location).port) {
        result.naval_move_distance = G.offensive.naval_move_distance * 2
    }
    result.ground_move_distance = G.offensive.ground_move_distance
    if (result.extended_battle_range < result.battle_range) {
        result.extended_battle_range = result.battle_range
    }


    result.is_new_battle_allowed = (G.active === G.offensive.attacker
        && (G.offensive.type === EC || G.offensive.battle_hexes.length === 0)
        && G.offensive.stage !== POST_BATTLE_STAGE) && L.move_type !== STRAT_MOVE
    var asp_total = get_asp_limit(G.active)
    if (G.offensive.stage === REACTION_STAGE) {
        asp_total = Math.min(asp_total, 1 - G.offensive.r_asp)
    }
    if (result.sm_possible && L.move_type & STRAT_MOVE) {
        result.move_type |= STRAT_MOVE
    }
    if (L.move_type & AVOID_ZOI) {
        result.move_type |= AVOID_ZOI
    }
    if (G.offensive.counter_offensive_card === MATADOR) {
        result.asp_points = 0
    }
    if (result.is_ground_present && asp_move && result.asp_points <= asp_total) {
        result.move_type |= AMPH_MOVE
        if (organic_only_ships) {
            result.move_type |= ORGANIC_ONLY
        }
    }
    if (L.move_type & BARGES_MOVE) {
        result.naval_move_distance = 1
        result.move_type |= AMPH_MOVE
        result.move_type |= BARGES_MOVE
        result.asp_points = 0
    }
    if (result.is_ground_present && !result.is_naval_present && !(L.move_type & BARGES_MOVE) && G.offensive.stage !== POST_BATTLE_STAGE) {
        result.move_type |= GROUND_MOVE
    }
    return result
}

function extended_pbm_possible() {
    var u = G.active_stack[0]
    return !map_has(G.offensive.committed, u) && !set_has(G.offensive.all_bh, G.location[u])
}

function get_asp_limit(faction) {
    var asp_lim = G.asp[faction][0]
    if (faction === JP && G.inter_service[0]) {
        asp_lim = Math.ceil(asp_lim / 2)
    }
    return Math.max(asp_lim - G.asp[faction][1], 0)
}

function compute_barges_pbm() {
    var path = []
    var retreat_target = 0
    map_for_each(G.offensive.paths, (u, p) => {
        if (p[0] & BARGES_MOVE) {
            path = p
            retreat_target = path[path.length - 2]
        }
    })
    path.push(retreat_target)
    if (L.move_data.is_naval_present && get_map_data(retreat_target).port || !L.move_data.is_naval_present) {
        L.allowed_hexes = [retreat_target, path]
    } else {
        L.allowed_hexes = []
    }
}

function compute_air_move_hexes() {
    let location = L.move_data.location
    L.allowed_hexes = []
    let move_data = L.move_data
    var move_type = AIR_MOVE
    if (move_data.move_type & STRAT_MOVE) {
        move_type |= STRAT_MOVE
    }
    if (move_data.move_type & AIR_EXTENDED_MOVE) {
        move_type |= AIR_EXTENDED_MOVE
    }
    if (L.move_type === STRAT_MOVE) {
        check_supply()
    }
    var strat_flag = move_data.move_type & STRAT_MOVE
    if ((L.move_type === STRAT_MOVE) && has_non_n_zoi(location, 1 - R)) {
        return []
    }
    var avoid_zoi_flag = L.move_type === AVOID_ZOI
    if ((L.move_type === AVOID_ZOI) && has_zoi(location, 1 - R)) {
        return []
    }
    const distance_map = [move_data.location, [0, 1, move_data.location]]
    let queue = [move_data.location]
    let fields_queue = []
    var i = 0
    var bh = G.offensive.battle_hexes.slice()
    if (set_has(G.offensive.battle_hexes, location) && G.offensive.stage === REACTION_STAGE) {
        bh = [location]
    }
    while (true) {
        if (i >= queue.length) {
            break
        }
        let item = queue[i]
        var MD = get_map_data(item)
        let base_path = map_get(distance_map, item)
        var china_result = process_china_box_move(item, base_path, move_type)
        let nh_list = get_near_hexes(item)
        var distance = base_path[0] + 1
        if (item === CHINA_BOX) {
            nh_list = china_result
            distance = L.move_data.extended_battle_range
        }

        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0 || nh === HARBIN || nh === MUKDEN) {
                continue
            }
            var cached = map_get(distance_map, nh, [9])[0]
            if (strat_flag && has_non_n_zoi(nh, 1 - R)
                || avoid_zoi_flag && has_zoi(nh, 1 - R)
                || distance % 10 > L.move_data.extended_battle_range
                || (distance >= cached && distance % 10 >= cached % 10)
                || G.offensive.stage === REACTION_STAGE && set_has(G.offensive.battle_hexes, nh)
                || ((MD.edges_int >> 5 * j) % 32) <= 0) {
                continue
            }
            if (distance % 10 < L.move_data.extended_battle_range) {
                queue.push(nh)
            }
            var path_array = base_path.slice()
            path_array.push(nh)
            path_array[0] = distance
            map_set(distance_map, nh, path_array)
            if (get_map_data(nh).airfield && is_space_controlled(nh, G.active) && (nh !== AIR_FERRY || !is_faction_units(AIR_FERRY, JP))) {
                fields_queue.push(nh)
                if (nh !== AIR_FERRY && (!set_has(G.offensive.landing_hexes, nh) && !set_has(G.offensive.battle_hexes, nh) || G.offensive.stage === POST_BATTLE_STAGE)
                    && (target_in_battle_range(move_data.extended_battle_range, nh, bh) || G.offensive.stage !== REACTION_STAGE)) {
                    path_array = path_array.slice()
                    path_array[0] = move_type
                    map_set(L.allowed_hexes, nh, path_array)
                }
            }
        }
        i++
        if (i >= queue.length) {
            fields_queue.forEach(h => {
                var f = map_get(distance_map, h)
                if (f[1] < move_data.air_move_legs) {
                    f[1]++
                    f[0] = f[1] * 10
                    f[f.length] = h
                    queue.push(h)
                }
            })
            fields_queue = []
        }
    }
    map_delete(L.allowed_hexes, location)
    check_china_box_restriction()
}

function compute_ground_naval_move_hexes() {
    let location = L.move_data.location
    let move_data = L.move_data
    var enemy_non_n_zoi = move_data.is_ground_present && !move_data.battle_range && has_non_n_zoi(location, 1 - R) && G.offensive.stage !== POST_BATTLE_STAGE

    // when last ground unit depart by sea supply could changed. We persist original state to be able restore it after pathfinding
    var supply = G.supply_cache
    var oos = G.oos
    if (L.move_data.is_ground_present && !L.move_data.battle_range) {
        var ground_unit_stay = 0
        for_each_unit_on_map((u, piece, loc) => {
            if (loc === location && piece.class !== "naval" && piece.faction === G.active && !set_has(G.active_stack, u)) {
                ground_unit_stay++
            }
        })
        if (!ground_unit_stay) {
            G.active_stack.forEach(u => G.location[u] = ELIMINATED_BOX)
            supply = object_copy(G.supply_cache)
            check_supply()
            G.active_stack.forEach(u => G.location[u] = location)
        }
    }


    L.allowed_hexes = []
    var mt = 0
    if (L.move_data.move_type & NAVAL_MOVE && !enemy_non_n_zoi) {
        var zoi_mask = 0
        if (move_data.is_ground_present && !move_data.is_naval_present) {
            zoi_mask = zoi_mask | JP_NAVAL_UNITS << (1 - R)
        }
        mt = NAVAL_MOVE
        if (move_data.move_type & BARGES_MOVE) {
            mt |= BARGES_MOVE
        }
        if (move_data.move_type & AVOID_ZOI) {
            zoi_mask = zoi_mask | JP_ZOI << (1 - R)
            mt |= AVOID_ZOI
        }
        if (G.offensive.stage === POST_BATTLE_STAGE && move_data.is_ground_present) {
            zoi_mask = 0
        }
        clear_supply_cache(CLEAN_ATTACK_ZONE_MASK)
        if (G.offensive.stage !== POST_BATTLE_STAGE) {
            mark_participate_attack_hex()
        }
        map_for_each(get_naval_move(zoi_mask), (k, v) => {
            if (move_data.is_ground_present) {
                v.unshift(mt | AMPH_MOVE)
            } else {
                v.unshift(mt)
            }
            if (!move_data.is_ground_present || L.move_type === AMPH_MOVE || L.move_type === BARGES_MOVE || get_distance(move_data.location, k) > 1 || G.offensive.stage !== ATTACK_STAGE) {
                map_set(L.allowed_hexes, k, v)
            }
        })
    }
    if ((L.move_data.move_type & GROUND_MOVE) && (L.move_type !== AMPH_MOVE)) {
        compute_ground_move_hexes()
    }
    if (G.offensive.stage !== POST_BATTLE_STAGE) {
        map_delete(L.allowed_hexes, location)
    }

    //restore original supply map if it was temporaly changed
    G.supply_cache = supply
    G.oos = oos
}

function compute_ground_move_hexes() {
    var mt = GROUND_MOVE
    if (L.move_data.move_type & AVOID_ZOI) {
        mt |= AVOID_ZOI
    }
    map_for_each(get_ground_move(L.move_data.move_type & AVOID_ZOI), (k, v) => {
        v.unshift(mt)
        if (G.offensive.stage === ATTACK_STAGE && (L.move_data.is_new_battle_allowed || !is_faction_units(k, 1 - G.active))
            || set_has(G.offensive.battle_hexes, k)) {
            map_set(L.allowed_hexes, k, v)
        }
    })
    if (G.offensive.stage !== POST_BATTLE_STAGE) {
        map_delete(L.allowed_hexes, L.move_data.location)
    }
}

function compute_ground_naval_strat_move() {
    let location = L.move_data.location
    let move_data = L.move_data
    L.allowed_hexes = []
    if (has_non_n_zoi(location, 1 - R)) {
        return
    }
    // to check when depart of ground unit could change zoi
    var ground_unit_stay = 0
    for_each_unit_on_map((u, piece, loc) => {
        if (loc === location && piece.class !== "naval" && piece.faction === G.active && !set_has(G.active_stack, u)) {
            ground_unit_stay++
        }
    })
    if (!ground_unit_stay || move_data.battle_range) {
        G.active_stack.forEach(u => G.location[u] = ELIMINATED_BOX)
        check_supply()
        G.active_stack.forEach(u => G.location[u] = location)
    }
    if (move_data.battle_range && has_non_n_zoi(location, 1 - R)) {
        return
    }
    const queue = [location]
    const distance_map = [location, [0, location]]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_path = map_get(distance_map, item)
        const distance = base_path[0] + 1
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (has_non_n_zoi(nh, 1 - R)
                || set_has(nh, G.offensive.battle_hexes)
                || distance > move_data.naval_move_distance
                || !(get_map_data(item).edges_int & WATER << 5 * j)
                || distance >= map_get(distance_map, nh, [100])[0]) {
                continue
            }
            if (distance < move_data.naval_move_distance) {
                queue.push(nh)
            }
            var path_array = base_path.slice()
            path_array.push(nh)
            path_array[0] = distance
            map_set(distance_map, nh, path_array)
            if (get_map_data(nh).port && is_space_controlled(nh, G.active) && !is_faction_units(nh, 1 - G.active)) {
                path_array = path_array.slice()
                path_array.unshift(STRAT_MOVE | NAVAL_MOVE)
                map_set(L.allowed_hexes, nh, path_array)
            }

        }
    }
    map_delete(L.allowed_hexes, location)
}

function mark_attack_zone(location, battle_range) {
    G.supply_cache[location] = G.supply_cache[location] | HEX_TEMP_FLAG2 | HEX_TEMP_FLAG1
    if (!L.move_data.is_ground_present) {
        for_each_hex_in_range(location, battle_range, h => {
            if (G.offensive.stage === REACTION_STAGE || !is_faction_units(h, 1 - G.active)) {
                G.supply_cache[h] = G.supply_cache[h] | HEX_TEMP_FLAG1
            }
        })
    }
}

function mark_participate_attack_hex() {
    var base_location = L.move_data.location
    var base_distance = G.offensive.naval_move_distance + L.move_data.battle_range
    if (G.offensive.stage === REACTION_STAGE && set_has(G.offensive.battle_hexes, base_location)) {
        mark_attack_zone(base_location, L.move_data.battle_range)
        return;
    }
    if (!L.move_data.is_ground_present) {
        map_for_each(G.offensive.paths, (u, path) => {
            var piece = pieces[u]
            if (piece.faction === G.active && piece.class === "naval" && piece.br && !set_has(G.active_stack, u)) {
                var location = G.location[u]
                G.supply_cache[location] = G.supply_cache[location] | HEX_TEMP_FLAG1
            }
        })
    }
    G.offensive.battle_hexes.forEach(h => mark_attack_zone(h, L.move_data.battle_range))
    if (G.offensive.stage === ATTACK_STAGE) {
        G.offensive.landing_hexes.forEach(h => mark_attack_zone(h, L.move_data.battle_range))
    }
    if (!L.move_data.is_new_battle_allowed) {
        return
    }
    for_each_hex_in_range(base_location, base_distance, h => {
        if (is_faction_units(h, 1 - R) && !(G.supply_cache[h] & HEX_TEMP_FLAG2)) {
            mark_attack_zone(h, L.move_data.battle_range)
        }
    })
}

function get_naval_move(zoi_mask) {
    const location = L.move_data.location
    const move_data = L.move_data
    const non_cv_ground_unit = move_data.is_ground_present && !move_data.battle_range
    var pbm = G.offensive.stage === POST_BATTLE_STAGE

    if (G.supply_cache[location] & zoi_mask
        || G.offensive.stage === ATTACK_STAGE && move_data.is_ground_present && move_data.is_naval_present && !(move_data.move_type & AMPH_MOVE)) {
        return []
    }
    const marine_landed_islands = []
    var us_army_unit_active = false
    if (R) {
        G.offensive.active_units[R].forEach(u => {
            const p = pieces[u]
            if (p.class === "ground" && p.type === "marine") {
                set_add(marine_landed_islands, G.location[u])
            }
        })
        us_army_unit_active = G.active_stack.map(u => pieces[u]).filter(p => p.class === "ground" && p.service === "army").length &&
            !G.active_stack.map(u => pieces[u]).filter(p => p.class === "ground" && p.type === "marine").length
    }
    if (G.offensive.type === EC && G.offensive.offensive_card === KING_II) {
        us_army_unit_active = false
    }
    const queue = [location]
    const distance_map = [location, [0, location]]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_path = map_get(distance_map, item)
        const distance = base_path[0] + 1
        let nh_list = get_near_hexes(item)
        var item_non_n_zoi = !non_cv_ground_unit || has_non_n_zoi(item, 1 - R)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (G.supply_cache[nh] & zoi_mask
                || (non_cv_ground_unit && has_non_n_zoi(nh, 1 - R) && !(pbm && item_non_n_zoi))
                || pbm && is_faction_units(nh, 1 - R) && move_data.is_ground_present
                || distance > move_data.naval_move_distance
                || !(get_map_data(item).edges_int & WATER << 5 * j)
                || distance >= map_get(distance_map, nh, [100])[0]) {
                continue
            }
            if (distance < move_data.naval_move_distance) {
                queue.push(nh)
            }
            let path_array = base_path.slice()
            path_array.push(nh)
            path_array[0] = distance
            map_set(distance_map, nh, path_array)
        }
    }
    let result = []
    map_for_each(distance_map, (nh, v) => {
        var naval_attack = is_amph_attack_possible(nh) && (!us_army_unit_active || set_has(marine_landed_islands, nh) || !get_map_data(nh).island || G.offensive.stage === REACTION_STAGE)
        var port_transport = (get_map_data(nh).port && is_space_controlled(nh, R) && (!move_data.is_ground_present || !move_data.is_naval_present || G.offensive.stage === POST_BATTLE_STAGE || (L.move_type === AMPH_MOVE)))
        var aa_landing = move_data.move_type & AMPH_MOVE
            && is_hex_asp_capable(nh)
            && (!move_data.is_naval_present || move_data.move_type & ORGANIC_ONLY)
            && !pbm
        var no_enemy_units = !is_faction_units(nh, 1 - R)
        var landing = port_transport && (no_enemy_units || G.offensive.stage === POST_BATTLE_STAGE) || aa_landing && no_enemy_units
        if ((naval_attack || landing && G.offensive.stage !== REACTION_STAGE) && (!L.move_data.is_ground_present || !ground_move_denied(nh))) {
            map_set(result, nh, v)
        }
    })
    var burma_pbm = G.sid === BURMA_SCENARIO &&
        G.offensive.stage === POST_BATTLE_STAGE &&
        G.active === JP
    var kamikaze_only = burma_pbm && set_has(G.active_stack, KAMIKAZE) &&
        !map_get(G.offensive.paths, KAMIKAZE, [0, 0, 0]).includes(SINGAPORE, 2)
        && G.active_stack.filter(u => pieces[u].class === "naval").length === 1

    if (burma_pbm && move_data.is_naval_present && !kamikaze_only) {
        var s = map_get(result, SINGAPORE)
        if (s) {
            return [SINGAPORE, s]
        } else {
            return []
        }
    }

    return result
}

function is_amph_attack_possible(hex) {
    return (G.supply_cache[hex] & HEX_TEMP_FLAG1 && (L.move_data.move_type & AMPH_MOVE || !L.move_data.is_ground_present))
}

function is_hex_asp_capable(hex) {
    const terrain = get_map_data(hex).terrain
    return hex === MORESBY || (terrain !== OCEAN && terrain !== MOUNTAIN)
}

function should_ground_move_stop(hex, faction) {
    return G.supply_cache[hex] & JP_GAH_UNITS << (1 - faction) || set_has(G.offensive.battle_hexes, hex)
}

function ground_move_denied(hex) {
    var region = get_map_data(hex).region
    var faction = pieces[G.active_stack[0]].faction
    if (region === "Manchuria") {
        return true
    }
    if (region === "IChina") {
        return G.active_stack.filter(u => pieces[u].service !== "ch").length
    }
    if (faction === JP && region === "India") {
        return G.active_stack.filter(u => pieces[u].class === "ground").length
    }
    if (G.active_stack.filter(u => pieces[u].service === "ch").length) {
        return !(region === "IChina" || region === "NIndia" || region === "Burma")
    }
    if (G.sid === SOUTH_PACIFIC_SCENARIO && faction === AP && hex === TRUK && G.turn === 3) {
        return true;
    }
    if (G.sid === BURMA_SCENARIO && faction === AP && (region === "Siam" || region === "Indochina")) {
        return true;
    }
    if (G.sid === BURMA_SCENARIO && hex === SINGAPORE) {
        return true;
    }
    if (G.turn === 1 && faction === JP && (hex === SINGAPORE || hex === MANILA) && !L.move_data.is_naval_present) {
        return true;
    }
}

function get_ground_move(avoid_zoi) {
    const location = L.move_data.location
    const move_data = L.move_data
    var max_distance = move_data.ground_move_distance
    var spent_distance = 0
    var path = map_get(G.offensive.paths, G.active_stack[0])
    if (path) {
        spent_distance = path[1]
    }
    if (avoid_zoi && G.supply_cache[location] & JP_ZOI << (1 - G.active)) {
        return []
    }
    const queue = [location]
    const distance_map = [location, [spent_distance, location]]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let base_distance = map_get(distance_map, item)
        let nh_list = get_near_hexes(item)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            var distance = base_distance[0] + get_ground_move_cost(item, nh, G.active)
            if ((avoid_zoi && G.supply_cache[nh] & JP_ZOI << (1 - G.active)) || distance > max_distance || distance >= map_get(distance_map, nh, [100])[0]
                || ground_move_denied(nh)) {
                continue
            }
            const stop_move = should_ground_move_stop(nh, G.active)

            let path_array = base_distance.slice()
            path_array.push(nh)
            path_array[0] = distance
            map_set(distance_map, nh, path_array)

            if (distance < max_distance && !stop_move) {
                queue.push(nh)
            }
        }
    }
    return distance_map
}


function check_china_box_restriction() {
    var count = 0
    for (var i = 0; i < pieces.length; i++) {
        if (G.location[i] === CHINA_BOX) {
            count++
        }
    }
    if (count >= 2 || pieces[G.active_stack[0]].b29 && (G.location[B_29_1] === CHINA_BOX || G.location[B_29_2] === CHINA_BOX)) {
        map_delete(L.allowed_hexes, CHINA_BOX)
    }
}

function process_china_box_move(hex, base_path, move_type) {
    var faction = pieces[G.active_stack[0]].faction
    var move_data = L.move_data
    var china_rebase = faction === AP && base_path[0] % 10 === 0 && base_path[1] <= move_data.air_move_legs
    if (china_rebase && (hex === DACCA || hex === JARHAT || hex === LEDO) && G.supply_cache[hex] & AP_SUPPLY_AIRFIELD && !map_has(L.allowed_hexes, CHINA_BOX)
        && G.offensive.stage !== REACTION_STAGE) {
        var path_array = base_path.slice()
        path_array.push(CHINA_BOX)
        path_array[0] = move_type
        map_set(L.allowed_hexes, CHINA_BOX, path_array)
    } else if (china_rebase && hex === CHINA_BOX && base_path[1] === 1) {
        var result = []
        if (G.supply_cache[DACCA] & AP_SUPPLY_AIRFIELD) {
            result.push(DACCA)
        }
        if (G.supply_cache[JARHAT] & AP_SUPPLY_AIRFIELD) {
            result.push(JARHAT)
        }
        if (G.supply_cache[LEDO] & AP_SUPPLY_AIRFIELD) {
            result.push(LEDO)
        }
        if (result.length) {
            return result
        }
    }
    return []
}

function target_in_battle_range(range, location, targets) {
    for (var i = 0; i < targets.length; i++) {
        if (get_distance(location, targets[i]) <= range) {
            return true
        }
    }
    return false
}/** import move.js*/

/** import client/init.js*/
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
    if (SID != BURMA_SCENARIO) {
        define_s_loc(DELAYED_BOX, map_layout.box_delayed_reinf)
    }
    define_s_loc(CHINA_BOX, map_layout.box_air_unit_in_china)

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
        piece.element = define_piece("unit", i, piece.counter).tooltip_image(unit_tooltip_image)
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
}/** import client/init.js*/
/** import client/actions.js*/
var LOCAL_STATUS = 0
var LOCAL_STATE = null
var STORED_STATE = null
var L = {}
const P = {}

P.check_unit_supply = {
    _begin() {
    },
    prompt() {
        LOCAL_STATE.actions = {
            "done": 1,
            "undo": LOCAL_STATE.unit ? 1 : 0,

        }
        if (!LOCAL_STATE.unit) {
            LOCAL_STATE.actions.unit = [...Array(pieces.length).keys()].filter(u => G.location[u] <= LAST_BOARD_HEX)
            LOCAL_STATE.actions.action_hex = [CHINA_BOX]
        }
        LOCAL_STATE.prompt = "Select unit to check supply."
    },
    undo() {
        LOCAL_STATE.unit = 0
        LOCAL_STATE.supply_data = null
        on_update()
    },
    unit(u) {
        LOCAL_STATE.unit = u
        send_query({name: "check_unit_supply", u})
    },
    action_hex(h) {
        if (h !== CHINA_BOX) {
            return
        }
        LOCAL_STATE.unit = 1
        send_query({name: "check_unit_supply", u: h})
    },
    show_supply(supply_data) {
        LOCAL_STATE.unit = supply_data.unit
        LOCAL_STATE.supply_data = supply_data
        on_update()
    },
    on_update() {
        if (!LOCAL_STATE.supply_data) {
            return
        }
        clear_paths()
        Object.keys(LOCAL_STATE.supply_data.path).forEach((type, index) => {
            var v = LOCAL_STATE.supply_data.path[type]
            var start = hex_center(v[0])
            var finish
            var color = SUPPLY_TYPES[type].color
            var d = index * 2 - 3
            CANVAS_CTX.strokeStyle = color
            CANVAS_CTX.fillStyle = color
            CANVAS_CTX.lineWidth = 3;
            for (var j = 1; j < v.length; j++) {
                start = hex_center(v[j - 1])
                finish = hex_center(v[j])
                CANVAS_CTX.beginPath();
                if (LOCAL_STATE.supply_data.oos) {
                    CANVAS_CTX.setLineDash([5, 3]);
                }
                CANVAS_CTX.moveTo(start[0], start[1] + d);
                CANVAS_CTX.lineTo(finish[0], finish[1] + d);
                CANVAS_CTX.stroke();
                CANVAS_CTX.setLineDash([])
            }
            if (finish) {
                CANVAS_CTX.beginPath();
                CANVAS_CTX.fillRect(finish[0] - 4, finish[1] - 4 + d, 8, 8)
                CANVAS_CTX.stroke();
            }
        })
    },
}

P.check_distance = {
    _begin() {
        LOCAL_STATE.points = []
        LOCAL_STATE.range = 0
    },
    prompt() {
        document.body.classList.add("hex-clickable")
        LOCAL_STATE.actions = {
            "done": 1,
            "range": LOCAL_STATE.points.length > 1,
            "undo": LOCAL_STATE.points.length ? 1 : 0,
        }
        LOCAL_STATE.prompt = "Click hex to check distance."
    },
    undo() {
        LOCAL_STATE.points = []
        this.redraw()
    },
    unit(u) {
        this.action_hex(G.location[u])
    },
    range() {
        LOCAL_STATE.range = !LOCAL_STATE.range
        this.redraw()
    },
    action_hex(h) {
        if (SID === SOUTH_PACIFIC_SCENARIO && h === OAHU || SID === BURMA_SCENARIO && h === SINGAPORE || h > LAST_BOARD_HEX) {
            return;
        }
        while (LOCAL_STATE.points.includes(h)) {
            if (LOCAL_STATE.points.pop() === h) {
                this.redraw()
                return
            }
        }
        if (LOCAL_STATE.points.length) {
            get_hex_path(LOCAL_STATE.points[LOCAL_STATE.points.length - 1], h).forEach(hex =>
                LOCAL_STATE.points.push(hex))
        } else {
            LOCAL_STATE.points.push(h)
        }
        this.redraw()
    },
    redraw() {
        if (LOCAL_STATE.range && LOCAL_STATE.points.length > 1) {
            world.range = [LOCAL_STATE.points[0], LOCAL_STATE.points.length - 1]
        } else {
            world.range = [0, 0]
        }
        on_update()
    },
    on_update() {
        if (!LOCAL_STATE.points.length) {
            return
        }
        LOCAL_STATE.points.forEach((hex, index) => {
            var marker = populate_generic("s-loc", hex, "marker top distance")
            marker.thing.element.textContent = `${index} ${int_to_hex(hex)}`
        })
    },
}

function get_hex_path(from, to) {
    var result = []
    var current = from
    while (current !== to) {
        var nh = get_edge_hexes(current)
        var d = 500
        var r = -1
        for (var i = 0; i < nh.length; i++) {
            var dist = get_distance(nh[i], to)
            if (dist < d && world.things["s-loc"][nh[i]]) {
                r = nh[i]
                d = dist
            }
        }
        result.push(r)
        current = r
    }
    return result

}

function check_unit_supply() {
    LOCAL_STATUS = "check_unit_supply"
    LOCAL_STATE = {}
    P.check_unit_supply._begin()
    update_header()
    on_update()
}

function check_distance() {
    LOCAL_STATUS = "check_distance"
    LOCAL_STATE = {}
    P.check_distance._begin()
    update_header()
    on_update()
}

var original_send_action = send_action

var send_action_with_oos = function (a, b) {
    var payload = {action: b, oos: G.oos, br: G.burma_road}
    G.actions[a] = [payload]
    original_send_action(a, payload)
}

function proxy_send_action(a, b) {
    if (G.actions && G.actions.move && a === "action_hex") {
        var path = map_get(L.allowed_hexes, b)
        if (path) {
            send_action_with_oos("move", path)
        } else if (G.actions.action_hex && set_has(G.actions.action_hex, b)) {
            send_action_with_oos(a, b)
        }
    } else if (a === "play_card") {
        scroll_into_view(lookup_thing("card", G.actions.card[0]).element)
        return
    } else if (a === "to_unit") {
        var el = lookup_thing("unit", G.actions.to_unit[0]).element
        scroll_into_view(el)
        _focus_stack(el.parentElement.thing)
        return
    }
    if (LOCAL_STATUS && a === "done") {
        LOCAL_STATUS = null
        LOCAL_STATE = null
        view = STORED_STATE
        update_header()
        on_update()
        return
    }
    if (LOCAL_STATUS) {
        if (!P[LOCAL_STATUS][a]) {
            return
        }
        var a = P[LOCAL_STATUS][a](b)
        update_header()
        return a
    } else {
        return send_action_with_oos(a, b)
    }
}

var send_action = proxy_send_action/** import client/actions.js*/
/** import client/dialog.js*/
// Below is code imported from Imperial struggle for dialog windows etc
// still not completely integrated. commented out code should be looked at

function on_reply(q, response) {
    toggle_dialog(q, response)
}

function toggle_dialog(id, response) {
    var name = id.name ? id.name : id
    // if (document.getElementById(name).classList.contains("show")) {
    //     hide_dialog(name)
    // }
    if (name.startsWith("event_cards")) {
        show_card_list(name, response)
    } else if (name === "vp_check") {
        vp_dialog(name, response)
    } else if (name === "battle_info") {
        battle_info_dialog(name, response)
    } else if (name === "pw_check") {
        pw_dialog(name, response)
    } else if (name === "check_unit_supply") {
        P.check_unit_supply.show_supply(response)
    } else if (name === "elim_check") {
        elim_dialog(name, response)
    }
}

function show_dialog(id, dialog_generator) {
    document.getElementById(id).classList.add("show")
    let body = document.getElementById(id).querySelector(".dialog_body")
    body.replaceChildren()
    if (dialog_generator) {
        dialog_generator(body)
    }
    if (!is_mobile()) dragElement(document.getElementById(id))
}

function hide_dialog(id) {
    document.getElementById(id).classList.remove("show")
    on_blur_tip()
}

function toggle_dialog_collapse(id) {
    let dialog_body = document.getElementById(id).querySelector(".dialog_body")
    let dialog_x = document.getElementById(id).querySelector(".dialog_x")
    if (dialog_body.className.includes("hide")) {
        dialog_body.classList.remove("hide")
        dialog_x.textContent = "A"
    } else {
        dialog_body.classList.add("hide")
        dialog_x.textContent = "V"
    }
}

//BR// Makes an element/dialog draggable by the player
function dragElement(e) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    var the_e = e
    if (document.getElementById(e.id + "header")) {
        document.getElementById(e.id + "header").onmousedown = dragMouseDown  // Drag by the header if it exists
    } else {
        e.onmousedown = dragMouseDown                                                  // Otherwise drag by the whole element
    }

    function dragMouseDown(e) {
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }

    function elementDrag(e) {
        e.preventDefault()

        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY

        // set the element's new position

        the_e.style.position = "absolute";
        the_e.style.top = (the_e.offsetTop - pos2) + "px"
        the_e.style.left = (the_e.offsetLeft - pos1) + "px"
    }

    function closeDragElement() {
        // stop moving when mouse button is released
        document.onmouseup = null
        document.onmousemove = null
    }
}

// Returns true if we're playing this on a mobile platform e.g. phone
function is_mobile() {
    return ("ontouchstart" in window)
}

function show_card_list(id, response) {
    show_dialog(id, (body) => {
        let dl = document.createElement("dl")
        let append_header = (text) => {
            let header = document.createElement("dt")
            header.textContent = text
            dl.appendChild(header)
        }
        let append_card = (c) => {
            let p = document.createElement("dd")
            p.className = "cardtip"
            p.onmouseenter = () => on_focus_card_tip(c)
            p.onmouseleave = () => on_blur_tip()
            //p.onmousedown = () => _tip_focus_event_mobile(NONE, c, "card event_card c" + c)
            p.innerHTML = format_card_info(c)
            dl.appendChild(p)
        }
        var faction_name = "Allied"
        var faction = 1

        if (id === "event_cards_jp") {
            faction_name = "Japansese"
            faction = 0
        }

        append_header(`${faction_name} Removed Cards (${G.removed[faction].length})`)
        G.removed[faction].forEach(append_card)
        append_header(`${faction_name} Discard Pile (${G.discard[faction].length})`)
        G.discard[faction].forEach(append_card)
        append_header(`${faction_name} Deck and Hand (${response.hand[faction].length})`)
        response.hand[faction].forEach(append_card)

        body.appendChild(dl)
    })
}

function pw_dialog(id, response) {
    show_dialog(id, (body) => {
        let dl = document.createElement("dl")
        var header = document.createElement("dt");
        header.appendChild(create_icon(...counters.pw.split(" ")))
        header.innerHTML += ` Current Political Will: ${G.political_will}.`
        dl.appendChild(header)
        dl.appendChild(print_pow())
        dl.appendChild(print_naval_situation())
        if (G.sid !== SOUTH_PACIFIC_SCENARIO) {
            dl.appendChild(print_casualties())
            dl.appendChild(print_resources())
            dl.appendChild(print_occupation(events.ALASKA_OCCUPATION))
            dl.appendChild(print_occupation(events.HAWAII_OCCUPATION))
        }
        for (var nation of response.nations) {
            dl.appendChild(print_nation_status(nation))
        }
        body.appendChild(dl)
    })
}

function create_unit_display(data_id) {
    const piece = pieces[data_id]
    let p = document.createElement("div")
    p.classList.add(...piece.counter.split(' '))
    p.classList.add("d-piece", "unit", "piece")
    //adapted the world.js tooltip_image to work here,
    //would be better if we had a way to reuse the world framework element
    if (is_mobile()) {
        p.addEventListener("touchstart", function () {
            long_tap(() => unit_tooltip_image(data_id, true))
        })
        p.addEventListener("touchend", function () {
            long_tap_cancel()
        })
    } else {
        p.addEventListener("mouseenter", function () {
            unit_tooltip_image(data_id, true)
        })
    }
    p.addEventListener("mouseleave", function () {
        unit_tooltip_image(data_id, false)
    })
    return p
}

function elim_dialog(name, response) {

    show_dialog(name, (body) => {
        var elim = [[], [], [], []]
        for (let i = 1; i < pieces.length; i++) {
            const piece = pieces[i]
            if ((G.location[i] === ELIMINATED_BOX || (G.location[i] === PERM_ELIMINATED && (G.sid !== SOUTH_PACIFIC_SCENARIO && G.sid !== BURMA_SCENARIO)))) {
                if (piece.notreplaceable || G.location[i] === PERM_ELIMINATED) {
                    elim[piece.faction * 2 + 1].push(i)
                } else {
                    elim[piece.faction * 2].push(i)
                }
            }
        }
        let create_sub_container = (parent, text, units) => {
            let small_sub_cont = document.createElement("div")
            let big_sub_cont = document.createElement("div")
            let header = document.createElement("dt")
            header.textContent = text
            parent.appendChild(header)
            small_sub_cont.classList.add("unit-grid")
            parent.appendChild(small_sub_cont)
            big_sub_cont.classList.add("big-unit-grid")
            parent.appendChild(big_sub_cont)
            units.forEach(u => {
                let p = create_unit_display(u)
                var piece = pieces[u]
                if (piece.counter.includes("big")) {
                    big_sub_cont.appendChild(p)
                } else {
                    small_sub_cont.appendChild(p)
                }
            })
            return [big_sub_cont, small_sub_cont]
        }

        let create_player_section = (text, faction) => {
            if (elim[faction * 2].length) {
                create_sub_container(body, text + " Replaceable:", elim[faction * 2])
            }
            if (elim[faction * 2 + 1].length) {
                create_sub_container(body, text + " Permanently Eliminated:", elim[faction * 2 + 1])
            }
        }


        create_player_section("Allied", AP)
        create_player_section("Japanese", JP)
        if (elim.filter(a => a.length > 0).length === 0) {
            append_header("No eliminated units yet.", body)
        }

    })
}

function print_pow() {
    let main = document.createElement("div")
    if (G.pow <= 0) {
        append_header(`No progress of war required for turn ${G.turn}.`, main)
        return main
    }
    var current_pow = G.capture.filter(h => is_space_controlled(h, AP))
    var completed = current_pow.length >= G.pow
    main.appendChild(create_icon(...((completed ? "" : "gray ") + counters.pow_target).split(" ")))
    main.innerHTML += ` Progress of war (${completed ? "Completed" : "-1 PW"}).`
    let keys = document.createElement("div")
    keys.innerHTML += `(${current_pow.length}/${G.pow}) `
    keys.innerHTML += current_pow.map(k => sub_hex(0, k)).join(", ")
    main.appendChild(keys)
    return main
}

function print_resources() {
    let main = document.createElement("div")
    var completed = G.events[events.JAPAN_LACK_OF_RESOURCES.id]
    var value = RESOURCE_HEX.filter(h => is_space_controlled(h, JP)).length
    main.appendChild(create_icon(...((completed ? "" : "gray ") + counters.resource_jp).split(" ")))
    if (completed) {
        main.innerHTML += ` JP control 3 or less resource hexes completed (-3 PW).`
    } else {
        RESOURCE_HEX.filter(h => is_space_controlled(h, JP)).length
        main.innerHTML += ` JP control ${value} > 3 resource hexes.`
    }
    return main
}

function print_casualties() {
    let main = document.createElement("div")
    var completed = G.events[events.US_CASUALTIES.id]
    main.appendChild(create_icon(...((completed ? "gray " : "") + pieces[US_MARINE_UNIT].counter).split(" ")))
    main.innerHTML += ` US Casualties ${completed ? "triggered (-1 PW)." : "not triggered."}`
    return main
}

function print_naval_situation() {
    var counter = [[], []]
    for (var i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.faction === AP && piece.service === "navy" && piece.class === "naval" && G.location[i] < LAST_BOARD_HEX) {
            counter[0].push(i)
            if (piece.br) {
                counter[1].push(i)
            }
        }
    }
    let main = document.createElement("div")

    main.appendChild(print_ship_counter(counter[0], pieces[US_BB_UNIT].counter, "Strategic naval situation - US naval units"))
    if (G.sid !== SOUTH_PACIFIC_SCENARIO) {
        main.appendChild(print_ship_counter(counter[1], pieces[US_CV_UNIT].counter, "Strategic naval situation - US carrier units"))
    }
    return main
}

function print_ship_counter(list, counter, text) {
    var ship = document.createElement("div")
    ship.appendChild(create_icon(...((list.length ? "" : "gray ") + counter).split(" ")))
    var html_text = ` ${text}`
    if (!list.length) {
        html_text += " eliminated (-1 PW)."
    } else if (list.length > 3) {
        html_text += ` (${list.length} units).`
    } else {
        html_text += ` (${list.map(u => sub_piece(0, u)).join(", ")}).`
    }
    ship.innerHTML += html_text
    return ship
}

function get_nation_by_id(object, id) {
    for (var key of Object.keys(object)) {
        if (object[key].id === id) {
            return object[key]
        }
    }
}

function print_nation_status(response) {
    var nation = get_nation_by_id(nations, response.id)
    let main = document.createElement("div")
    main.className = "nation_info"
    main.appendChild(create_flag(response.control))
    var pw_string = ` (${response.control === JP ? "-" : ""}${nation.pw} PW)`
    main.innerHTML += `${nation.name}${nation.pw ? pw_string : ""}.`
    if (response.status) {
        append_header(response.status, main, "div")
    }
    var control = [[], []]
    if (nation.keys) {
        nation.keys.forEach(k => {
            if (is_space_controlled(hex_to_int(k), JP)) {
                control[JP].push(hex_to_int(k))
            } else {
                control[AP].push(hex_to_int(k))
            }
        })
        var key_header = `(${control[JP].length}/${control[AP].length})`
        if (control[JP].length) {
            key_header += " JP: "
            key_header += control[JP].map(k => sub_hex(0, k)).join(", ")
        }
        if (control[AP].length && control[JP].length) {
            key_header += ";   "
        }
        if (control[AP].length) {
            key_header += " AP: "
            key_header += control[AP].map(k => sub_hex(0, k)).join(", ")
        }
        var keys = document.createElement("div")
        keys.innerHTML = key_header
        main.appendChild(keys)
    }
    if (response.info) {
        response.info.forEach(l => append_header(escape_text(l), main))
    }
    return main
}

function print_occupation(response) {
    var nation = get_nation_by_id(events, response.id)
    let main = document.createElement("div")
    main.className = "nation_info"
    var status = G.events[response.id]
    main.appendChild(create_icon(...nation.counter.split(" "), (status ? "marker" : "gray")))
    var pw_string = ` (${nation.pw} PW)`
    main.innerHTML += `${nation.name}${nation.pw ? pw_string : ""}.`
    if (status && G.turn - status >= nation.turns_to_control) {
        return main
    }
    if (status) {
        append_header(`Turns: ${G.turn - status + 1}/${nation.turns_to_control}`, main, "div")
    }
    var control = [[], []]
    if (nation.keys) {
        var key_header = `Keys: `
        key_header += nation.keys.map(k => sub_hex(0, hex_to_int(k))).join(", ")
        var keys = document.createElement("div")
        keys.innerHTML = key_header
        main.appendChild(keys)
    }
    if (response.info) {
        response.info.forEach(l => append_header(escape_text(l), main))
    }
    return main
}

function print_winner(side, text) {
    let main = document.createElement("div")
    main.appendChild(create_flag(side))
    main.innerHTML += " " + text
    return main
}

function vp_dialog(id, response) {
    show_dialog(id, (body) => {
        let dl = document.createElement("dl")
        if (response.won_side === "Japan") {
            dl.appendChild(print_winner(JP, `${response.won_text}. Total VP: ${response.vp}.`))
        } else {
            dl.appendChild(print_winner(AP, `${response.won_text}. Total VP: ${response.vp}.`))
        }
        if (response.text.length === 0) {
            response.text.push(response.won_text)
        }
        response.text.forEach(text => {
            let header = document.createElement("div")
            header.innerHTML = text.replace(/H(\d+)/g, sub_hex)
            dl.appendChild(header)
        })
        append_header("", dl, "br")
        append_header("Summary:", dl)
        if (SID == BURMA_SCENARIO) {
            append_header("2 VP or less - Allied Decisive Victory.", dl)
            append_header("3-4 VP Allied Tactical Victory.", dl)
            append_header("5-8 VP Japanese Tactical Victory.", dl)
            append_header("9 VP Japanese Decisive Victory.", dl)
        } else {
            append_header("2 VP or less - Allied Decisive Victory.", dl)
            append_header("3-5 VP Allied Tactical Victory.", dl)
            append_header("6-9 VP Japanese Tactical Victory.", dl)
            append_header("10 VP Japanese Decisive Victory.", dl)
        }

        body.appendChild(dl)
    })
}

function append_header(text, dl, el = "dt") {
    let header = document.createElement(el)
    header.innerHTML = text
    dl.appendChild(header)
}

function create_flag(faction) {
    var result = document.createElement("div")
    if (faction) {
        result.className = counters.control_us
    } else {
        result.className = counters.control_jp
    }
    result.classList.add("icon")
    return result
}

function create_icon(...icon) {
    var result = document.createElement("div")
    result.classList.add("icon")
    icon.forEach(c => result.classList.add(c))
    return result
}

function battle_info_dialog(id, response) {
    show_dialog(id, (body) => {
        let dl = document.createElement("div")
        dl.className = "wrapper"
        let header = document.createElement("dt")
        header.innerHTML = `Combat hex ${String.fromCharCode(65 + response.battle_name)} (${sub_hex(null, response.battle_hex)})`
        body.appendChild(header)
        body.appendChild(dl)
        if (response.air_naval[0].length || response.air_naval[1].length) {
            var at = G.offensive.attacker
            var def = 1 - G.offensive.attacker
            dl.appendChild(create_battle_box(at,
                response.naval_cf[at], response.naval_rm[at], response.air_naval[at], response.naval_log[at]))
            dl.appendChild(create_battle_box(def,
                response.naval_cf[def], response.naval_rm[def], response.air_naval[def], response.naval_log[def]))
            // dl.appendChild(an_box)
        }
        if (response.ground[0].length || response.ground[1].length) {
            var an_box = document.createElement("div")
            var faction = G.offensive.attacker
            dl.appendChild(create_battle_box(faction,
                response.ground_cf[faction], response.ground_rm[faction], response.ground[faction], response.ground_log[faction]))
            faction = 1 - faction
            dl.appendChild(create_battle_box(faction,
                response.ground_cf[faction], response.ground_rm[faction], response.ground[faction], response.ground_log[faction]),)
            // dl.appendChild(an_box)
        }
    })
}

function create_battle_box(faction, cf, rm, units, log) {
    var result = document.createElement("div")
    if (cf === 0) {
        return result
    }
    result.className = "battle_box"
    result.appendChild(create_flag(faction))
    append_header(`CF: ${cf}  ${rm > 0 ? "+" : ""}${rm ? rm + " DRM" : ""}`, result)
    units.sort((a, b) => G.location[a] - G.location[b])
    var prev = null
    for (var i of units) {
        var loc = G.location[i]
        if (loc !== prev) {
            prev = loc
            var text = document.createElement("div")
            text.innerHTML = sub_hex(null, loc)
            result.appendChild(text)
        }
        var piece = pieces[i]
        populate_generic_to_parent(result, "icon piece " + piece.counter + (set_has(G.reduced, i) && !(piece.notreplaceable && piece.start_reduced) ? " reduced" : ""))
    }
    if (log.length) {
        append_header("Modifiers:", result)
    }
    log.forEach(text => {
        result.appendChild(on_log(text))
    })
    return result
}/** import client/dialog.js*/
/** import client/update.js*/
function push_stack(stk, elt) {
    stk.unshift(elt)
    elt.my_stack = stk
}

function is_active_card(card) {
    for (let a of CARD_ACTIONS) {
        if (G.actions && G.actions[a] && set_has(G.actions[a], card)) {
            return true
        }
    }
    return false
}

function update_hand(side) {
    var fo_card;
    if (G.future_offensive[side] > 0) {
        fo_card = populate("hand", side, "card", G.future_offensive[side])
    } else if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        fo_card = populate_generic_to_parent(lookup_thing("hand", side).element, side === JP ? "card card_jp_0" : "card card_ap_0")
    }

    if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] === G.turn) {
        populate_generic_to_parent(fo_card, counters.future_offensive_inactive)
    } else if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        populate_generic_to_parent(fo_card, ((side === AP) ? counters.future_offensive_ap : counters.future_offensive_jp))
    }

    if (!Array.isArray(G.hand[side])) {
        for (let i = 0; i < G.hand[side]; i++) {
            populate_generic("hand", side, side === JP ? "card card_jp_0" : "card card_ap_0").innerHTML = ''
        }
    } else {
        for (let i = 0; i < G.hand[side].length; i++) {
            let card = G.hand[side][i]
            populate("hand", side, "card", card)
        }
    }
}


function draw_paths() {
    map_for_each(G.offensive.paths, (k, v) => {
        if (G.location[k] > LAST_BOARD_HEX && G.location[k] !== CHINA_BOX) {
            return
        }
        var start = hex_center(v[2])
        var finish
        var color = pieces[k].faction ? "blue" : "red"
        var d = pieces[k].faction ? -2 : 2
        CANVAS_CTX.strokeStyle = color
        CANVAS_CTX.fillStyle = color
        CANVAS_CTX.lineWidth = 1;
        for (var j = 3; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            CANVAS_CTX.beginPath();
            if (v[j - 1] === v[j] || j === 3) {
                CANVAS_CTX.arc(start[0], start[1] + d, 4, 0, 2 * Math.PI);
                CANVAS_CTX.fill();
                CANVAS_CTX.stroke();
            }
            CANVAS_CTX.beginPath();
            if (G.location[k] === v[j - 1] && j === v.length - 1) {
                CANVAS_CTX.setLineDash([5, 3]);
            }
            CANVAS_CTX.moveTo(start[0], start[1] + d);
            CANVAS_CTX.lineTo(finish[0], finish[1] + d);
            CANVAS_CTX.stroke();
            CANVAS_CTX.setLineDash([])
        }
        if (finish) {
            CANVAS_CTX.beginPath();
            CANVAS_CTX.fillRect(finish[0] - 4, finish[1] - 4 + d, 8, 8)
            CANVAS_CTX.stroke();
        }
    })
}

function place_unit(u, location) {
    var piece = pieces[u]
    var unit
    var one_step = piece.notreplaceable && piece.start_reduced
    var slocs = world.things["s-loc"]
    var turn = world.things["turn"]
    if (location > TURN_BOX) {
        if (!turn[location - TURN_BOX]) {
            unit = populate("s-loc", ELIMINATED_BOX, "unit", u)
        } else {
            unit = populate("turn", location - TURN_BOX, "unit", u)
        }
        unit.classList.toggle("reduced", (set_has(G.reduced, u) && !one_step))
        unit.classList.remove("activated")
        unit.classList.remove("selected")
    } else if (location === ELIMINATED_BOX && (!pieces[u].notreplaceable || is_action("unit", u))
        || (location !== ELIMINATED_BOX && slocs[location])) {
        unit = populate("s-loc", location, "unit", u)
        unit.classList.toggle("reduced", (set_has(G.reduced, u) && !one_step) || location === ELIMINATED_BOX
            || pieces[u].class === "hq" && G.inter_service[pieces[u].faction])
        unit.classList.toggle(piece.faction ? "activated_blue" : "activated_red", set_has(G.offensive.active_units[piece.faction], u))
        unit.classList.toggle("selected", G.active_stack.includes(u))
        unit.innerHTML = '';
        var battle = map_get(G.offensive.committed, u)
        var path = map_get(G.offensive.paths, u, [0])[0]
        // unit.classList.remove("gray")
        if (battle && set_has(G.offensive.battle_hexes, battle)) {
            apply_conflict_marker(populate_generic_to_parent(unit, "marker conflict battle"), battle)
        } else if (battle && set_has(G.offensive.landing_hexes, battle)) {
            apply_conflict_marker(populate_generic_to_parent(unit, "marker conflict landing"), battle)
        } else if (battle && (piece.parenthetical || piece.class === "ground")) {
            apply_conflict_marker(populate_generic_to_parent(unit, "marker conflict battle gray"), battle)
            // unit.classList.add("gray")
        } else if (piece.organic && !(path & STRAT_MOVE) && G.offensive.organic.includes(u)) {
            populate_generic_to_parent(unit, counters.organic_small)
        } else if (set_has(G.oos, u)) {
            populate_generic_to_parent(unit, counters.oos_small)
        } else {
            for (var i = 0; i < UNIT_MOVEMENT_MARKERS.length; i++) {
                var m = UNIT_MOVEMENT_MARKERS[i]
                if (m.condition(u, piece, path)) {
                    populate_generic_to_parent(unit, m.counter)
                    return
                }
            }
        }
    }
}

function get_control_marker(h) {
    var capture = set_has(G.capture, h)
    if (capture && is_space_controlled(h, JP)) {
        return counters.capture_jp
    } else if (is_space_controlled(h, JP)) {
        return counters.control_jp
    } else if (h === MANCHURIA_1 || h === MANCHURIA_2) {
        return counters.control_sov
    } else if (G.sid === BURMA_SCENARIO || BR_NATIONS.includes(HEX_BY_NATION[h])) {
        return counters.control_br
    } else {
        return counters.control_us
    }
}

function update_role_info() {
    for (let who = JP; who <= AP; who++) {
        var hand_size = Number.isInteger(G.hand[who]) ? G.hand[who] : G.hand[who].length
        var fo = G.events[events.FUTURE_OFFENSIVE_JP.id + who]
        roles[who].stat.innerHTML = `${hand_size} cards${fo && fo < G.turn ? " + FO" : ""}${G.passes[who] ? ", " + G.passes[who] + " passes" : ""}`
        if (!hand_size) {
            roles[who].stat.innerHTML = `Pass`
        }
    }
}


function on_update() {
    begin_update()
    check_supply()
    if (G.actions && G.actions.move) {
        L.allowed_hexes = []
        L.move_type = G.move_type
        update_move_hex()
        if (!G.actions.action_hex) {
            G.actions.action_hex = []
        }
        map_for_each(L.allowed_hexes, h => set_add(G.actions.action_hex, h))
    }
    document.body.classList.remove("hex-clickable")
    world.log_boxes = []
    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].prompt()
    }
    if (!G.proxy) {
        STORED_STATE = JSON.parse(JSON.stringify(G))
        G.proxy = 1
    }
    if (LOCAL_STATE) {
        G.actions = LOCAL_STATE.actions
        G.actions.proxy = 1
    }

    if (G.actions && G.actions["card"]) {
        G.actions["play_card"] = 1
    }
    if (G.actions && G.actions["unit"] && G.actions["unit"].filter(u => G.location[u] === ELIMINATED_BOX).length) {
        G.actions["to_unit"] = [G.actions["unit"].filter(u => G.location[u] === ELIMINATED_BOX)[0]]
    }

    update_role_info()
    map_for_each(G.offensive.damaged, (u, s) => {
        if (s > 2) {
            G.location[u] = ELIMINATED_BOX
        } else {
            set_add(G.reduced, u)
        }
    })
    clear_paths()
    if (!get_preference("nopath", false)) {
        draw_paths()
    }

    document.getElementById("vp_check_button").classList.toggle("disabled", CAMPAIGN_SCENARIOS.includes(G.sid))
    document.getElementById("pw_check_button").classList.toggle("disabled", G.sid === BURMA_SCENARIO)
    if (G.pow <= 0) {
        G.capture = []
    }
    var all_control = document.body.classList.contains("hide-pieces")
    var vassal_control = get_preference("fullcontrol", false)
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        var hn = HEX_BY_NATION[i]
        var cont = is_space_controlled(i, JP) ? JP : AP
        if (cont === AP && set_has(G.capture, i) && !all_control || !(G.supply_cache[i] & HEX_CONTROLLABLE)) {
            continue
        }
        var default_condition = (hn >= 0 && (G.surrender[HEX_BY_NATION[i]] > 0) == cont
            || hn === -1 && cont === AP
            || hn < -1 && cont === JP)
        var vassal_condition = (set_has(JP_BOUNDARY_HEX, i) + 0) === cont
        if (map_info.hex_check(i) && cont !== null && (all_control || !is_faction_units(i, AP) && !is_faction_units(i, JP))
            && (all_control || !vassal_control && default_condition || vassal_control && vassal_condition)
        ) {
            populate_generic("s-loc", i, get_control_marker(i) + (vassal_control ? " transparent" : ""))
        }
    }
    G.garr_elim.filter(h => is_space_controlled(h, JP)).forEach(h => populate_generic("s-loc", h, counters.no_garrison))
    var base_road_counters = get_preference("noroad", false)
    ROAD_EVENTS.filter(event => map_info.hex_check(event.keys[0])).forEach(event => {
        var thing = lookup_thing("road", event.id)
        var active = G.events[event.id]
        thing.element.classList.add("hide")
        if (!active && !base_road_counters) {
            thing.element.classList.remove("hide")
        }
        if ((event === events.KWAI_RIVER_BRIDGE && active)
            || (!active && base_road_counters && event !== events.KWAI_RIVER_BRIDGE)) {
            populate_generic("s-loc", event.keys[0], event.counter)
        }
    })
    if (G.events[events.TOKYO_EXPRESS.id] > 0) {
        populate_generic("s-loc", G.events[events.TOKYO_EXPRESS.id], counters.tokyo_express)
    }
    map_for_each(G.garrison, (h, count) => {
        var marker = JP_GARRISON_CN[0]
        if (count === 0) {
            count = 1
            marker = JP_GARRISON_JP
        }
        for (var i = 0; i < count; i++) {
            populate_generic("s-loc", h, "unit " + pieces[marker].counter)
        }
    })
    var supplied_hex = []
    for (var i = 1; i < pieces.length; ++i) {
        var loc = G.location[i]
        if (loc > 0) {
            place_unit(i, G.location[i])
            if (!set_has(G.oos, i)) {
                set_add(supplied_hex, G.location[i])
            }
        }
    }
    for (var thing of world.things["unit"]) {
        if (thing) {
            thing.element.classList.toggle("unselect", !!(G.unselect && set_has(G.unselect, thing.my_id)))
        }
    }

    if (G.pow > 0) {
        G.capture.filter(h => is_space_controlled(h, AP))
            .forEach(h => populate_generic("s-loc", h, counters.pow))
    }
    var oos_hex_set = []
    for (i = 0; i < G.oos.length; i++) {
        let hex = G.location[G.oos[i]]
        if (!set_has(oos_hex_set, hex) && hex <= LAST_BOARD_HEX && !set_has(supplied_hex, hex)) {
            populate_generic("s-loc", hex, counters.oos)
            set_add(oos_hex_set, hex)
        }
    }

    if (!get_preference("hidezoi", false)) {
        for (var hex of ALL_BOARD_HEXES) {
            const zoi_state = G.supply_cache[hex]
            update_keyword("zoi_hex", hex, "lrb", (zoi_state & 7) === 3)
            update_keyword("zoi_hex", hex, "contested", (zoi_state & 3) === 3)
            update_keyword("zoi_hex", hex, "jp", (zoi_state & 1) === 1)
            update_keyword("zoi_hex", hex, "ap", (zoi_state & 2) === 2)
        }
    }

    var focused = []
    for_each_hex_in_range(world.range[0], world.range[1], hex => set_add(focused, hex))
    for (var hex of ALL_BOARD_HEXES) {
        update_keyword("zoi_hex", hex, "yellow", set_has(focused, hex))
    }

    print_violations()

    world.things["card"].forEach(e => e.element.innerHTML = '')
    if (G.offensive.active_cards.length > 0) {
        document.getElementById("active_cards").classList.remove("hide")
        for (let i = 0; i < G.offensive.active_cards.length; i++) {
            populate("hand", 2, "card", G.offensive.active_cards[i])
        }
    } else {
        document.getElementById("active_cards").classList.add("hide")
    }
    update_hand(AP)
    update_hand(JP)

    G.offensive.battle_hexes.forEach(h => populate("s-loc", h, "battle", G.offensive.battle_names.indexOf(h)))
    G.offensive.landing_hexes.forEach(h => populate("s-loc", h, "landing", G.offensive.battle_names.indexOf(h)))
    var isr_marker = (v, i) => {
        if (v && i === AP) {
            return counters.rivalry_ap
        } else if (v && i === JP) {
            return counters.rivalry_jp
        } else if (i === AP) {
            return counters.agreement_ap
        } else {
            return counters.agreement_jp
        }
    }
    G.inter_service.forEach((v, i) => populate_generic("status", i, isr_marker(v, i)))
    populate_generic("pw", G.political_will, counters.pw)
    populate_generic("wie", G.wie, counters.wie)

    if (G.sid !== SOUTH_PACIFIC_SCENARIO) {
        populate_generic("india", Math.max(0, 4 - G.surrender[nations.INDIA.id]),
            (G.surrender[nations.INDIA.id] >= 5) ? counters.india_status_surrender : counters.india_status)
        populate_generic("burma", 2 - G.burma_road, G.events[events.HUMP.id] ? counters.burma_road_hump : counters.burma_road)
        populate("divisions", G.china_divisions + 1, `divisions`, 0)
    }

    populate_generic("china", Math.min(5, G.surrender[nations.CHINA.id]), counters.china)

    var turns = world.things["turn"]
    for (var key of Object.keys(nations)) {
        var nation = nations[key]
        var marker = nation.counter
        var hex = nation.counter_hex
        var value = G.surrender[nation.id]
        if (nation.id === nations.MARSHALL.id) {
            value = !value
        }
        if (marker && turns[value] && value) {
            populate_generic("turn", value, marker)
        }
        if (marker && hex && value) {
            populate_generic("s-loc", hex_to_int(hex), marker)
        }
    }
    for (i = 0; i < TURN_MARKERS.length; i++) {
        const marker = TURN_MARKERS[i]
        var value = marker.value(G)
        var counter = (typeof marker.counter === 'function') ? marker.counter(G) : marker.counter
        if (value > 0 && turns[value]) {
            populate_generic("turn", value, counter)
        }
    }

    for (i = 0; i < TRACK_MARKERS.length; i++) {
        const marker = TRACK_MARKERS[i]
        var value = marker.value(G)
        var counter = (typeof marker.counter === 'function') ? marker.counter(G) : marker.counter
        var track = Math.min(9, value)
        if (value > 9 && marker.alt_counter) {
            counter = marker.alt_counter
            track = Math.min(9, value - 10)
        }
        if (value > 0 || marker.always_show === true || (typeof marker.always_show === 'function' && marker.always_show(G))) {
            populate_generic("track", track, counter)
        }
    }

    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].on_update()
    }

    action_button("play_card", "Play card")
    action_button("to_unit", "Rebuild unit")
    action_button("roll", "Roll")

    action_button("awaiting", "Prompt")
    action_button("continue", "Continue")
    action_button("bonus", "Use Bonus")
    action_button("event", "Play Event")
    action_button("ops", "Play for Operations")
    action_button("hold", "Hold")
    action_button("advanced_move", "Advanced move")
    action_button("no_move", "No move")
    action_button("eliminate", "Eliminate")
    action_button("stop", "Stop")
    action_button("displace", "Displace")
    action_button("divisions_button", "Reduce divisions track")


    action_button("displace_hq", "HQ Withdrawal")
    action_button("return_hq", "Early HQ Return")
    action_button("inter_service", "Remove Inter-Service Rivalry")
    action_button("china_offensive", "China Offensive")
    action_button("future_offensive", "Future Offensive")
    action_button("jarhat", "Build Jarhat Road")
    action_button("imphal", "Build Imphal Road")
    action_button("ledo", "Build Ledo Road")
    action_button("discard", "Discard")


    action_button("all", "Choose all")
    action_button("pass", "Pass")
    action_button("skip", "Skip")
    action_button("range", "Range")

    action_button("next", "Next")
    action_button("done", "Done")
    action_button("delay", "Delay")
    action_button("no_organic", "Disable organic")
    action_button("avoid_zoi", "Avoid ZOI")
    action_button("strat_move", "Strategic")
    action_button("amphibious", "Amphibious")
    action_button("ground_move", "Ground")
    action_button("extended_air", "Extended range")
    action_button("barges", "Barges")

    action_button("redo", "Redo")
    action_button("undo", "Undo")
    end_update()
}

function print_violations() {
    if (world.violations && world.violations.overstack) {
        world.violations.overstack.forEach(h => lookup_thing("action_hex", h).element.classList.toggle("violation", false))
        world.violations = {}
    }
    if (!G.violations || !G.violations.overstack) {
        return
    }
    G.violations.overstack.forEach(h => lookup_thing("action_hex", h).element.classList.toggle("violation", true))
    world.violations = G.violations
}

function apply_conflict_marker(marker, hex) {
    marker.innerText = String.fromCharCode(65 + G.offensive.battle_names.indexOf(hex))
}/** import client/update.js*/
/** import client/utils.js*/

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
    let row = i % MAIN_BOARD_INFO.COLUMN_HEX_NB
    let column = (Math.floor(i / MAIN_BOARD_INFO.COLUMN_HEX_NB))
    if (SID == BURMA_SCENARIO) {
        if (i == SINGAPORE) {
            const box = map_layout.label_singapore
            return center_rect([box[0] + box[2], box[1] + box[3]], box[2], box[3])
        }
        if (i > TUNNEL_BOX) {
            // display TUNNEL_BOX directly to the left of the blue singapore label
            const box = map_layout.label_singapore
            let sing_left_coord = center_rect([box[0] + box[2], box[1] + box[3]], box[2], box[3])
            sing_left_coord[0] -= 47;
            return sing_left_coord;
        }
    } else if (SID === SOUTH_PACIFIC_SCENARIO && i >= OAHU) {
        const box = map_layout.h_5808
        return center_rect([box[0] + box[2], box[1] + box[3]], box[2], box[3])
    }
    return [
        (map_info.display_x_offset) + (column - map_info.grid_x_offset) * HEX_X_SIZE,
        (map_info.display_y_offset) + (row - map_info.grid_y_offset) * HEX_Y_SIZE + (column & 1) * 27.625
    ]
}/** import client/utils.js*/
/** import client/framework.js*/
const ICONS = {
    B0: '<span class="dice B d0"></span>',
    B1: '<span class="dice B d1"></span>',
    B2: '<span class="dice B d2"></span>',
    B3: '<span class="dice B d3"></span>',
    B4: '<span class="dice B d4"></span>',
    B5: '<span class="dice B d5"></span>',
    B6: '<span class="dice B d6"></span>',
    B7: '<span class="dice B d7"></span>',
    B8: '<span class="dice B d8"></span>',
    B9: '<span class="dice B d9"></span>',
    R0: '<span class="dice R d0"></span>',
    R1: '<span class="dice R d1"></span>',
    R2: '<span class="dice R d2"></span>',
    R3: '<span class="dice R d3"></span>',
    R4: '<span class="dice R d4"></span>',
    R5: '<span class="dice R d5"></span>',
    R6: '<span class="dice R d6"></span>',
    R7: '<span class="dice R d7"></span>',
    R8: '<span class="dice R d8"></span>',
    R9: '<span class="dice R d9"></span>',
    W0: '<span class="die white d0"></span>',
    W1: '<span class="die white d1"></span>',
    W2: '<span class="die white d2"></span>',
    W3: '<span class="die white d3"></span>',
    W4: '<span class="die white d4"></span>',
    W5: '<span class="die white d5"></span>',
    W6: '<span class="die white d6"></span>',
    // R0: '<span class="die red d0"></span>',
    // R1: '<span class="die red d1"></span>',
    // R2: '<span class="die red d2"></span>',
    // R3: '<span class="die red d3"></span>',
    // R4: '<span class="die red d4"></span>',
    // R5: '<span class="die red d5"></span>',
    // R6: '<span class="die red d6"></span>',
}

function escape_text(text) {
    text = String(text)
    text = text.replace(/[BRW]\d/g, (m) => ICONS[m] ?? m)
    text = text.replace(/\^(.*?)\^/g, escaped_list)
    text = text.replace(/C(\d+)/g, sub_card)
    text = text.replace(/P(\d+)/g, sub_piece)
    text = text.replace(/H(\d+)/g, sub_hex)
    return text
}

function on_prompt(text) {
    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].prompt()
        return escape_text(LOCAL_STATE.prompt)
    } else {
        return escape_text(text)
    }
}

function on_log(text) {
    var p = document.createElement("div")

    switch (text[0]) {
        case "!":
            var m = text.substring(1)
            p.classList.add("h1")
            text = m
            break
        case "@":
            var m = text.substring(1)
            p.classList.add("h2")
            text = m
            break
        case "$":
            var m = text.substring(1)
            p.classList.add("h3")
            text = m
            break
        case "#":
            var m = text.substring(2)
            p.classList.add("h3")
            var code = text[1]
            var color = null
            if (code === "J") {
                color = "jp"
            } else if (code === "A") {
                color = "ap"
            } else if (code === "I") {
                color = "int"
            }
            if (color) {
                p.classList.add(color)
            }
            text = m
            break
        case "%":
            var m = text.substring(2)
            p.classList.add("h4")
            p.classList.add("group")
            p.classList.add(text[1] === "J" ? "jp" : "ap")
            text = m
            break
        case "&":
            var m = text.substring(2)
            p.classList.add("group")
            p.classList.add(text[1] === "J" ? "jp" : "ap")
            text = m
            break
        case "Q":
            p.className = "q"
            text = cards[parseInt(text.substring(1))].text
            break
        case ">":
            p.className = "i"
            text = text.substring(1)
            break
    }
    p.innerHTML = escape_text(text)

    return p
}

function format_card_info(c) {
    let text = "C" + c
    return escape_text(text)
}

function sub_card(match, p1) {
    const c = p1 | 0
    const cn = "card-tip"
    return `<span class="${cn}" onmouseenter="on_focus_card_tip(${c})" onclick="on_focus_card_tip(${c})" onmouseleave="on_blur_tip()">${cards[c].name}</span>`
}


function get_piece_elem(p) {
    return pieces[p].element.element
}


function sub_piece(match, p1) {
    const piece_id = p1 | 0
    const name = pieces[piece_id].name
    return `<span class="piece-tip" onclick="on_click_piece_tip(${piece_id})" onmouseenter="on_focus_piece_tip(${piece_id})" onmouseleave="on_blur_piece_tip(${piece_id})">${name}</span>`
}

function on_click_piece_tip(z) {
    scroll_into_view(get_piece_elem(z))
}

function on_focus_piece_tip(z) {
    get_piece_elem(z).classList.toggle("tip", true)
    on_focus_unit_tip(z)
}

function on_blur_piece_tip(z) {
    get_piece_elem(z).classList.toggle("tip", false)
    on_blur_tip()
}

function get_hex_elem(h) {
    //perhaps should cache this somewhere ?
    return lookup_thing("s-loc", h)
}

function get_hex_name(h) {
    const hex = int_to_hex(h)
    const hex_id = map.findIndex((element) => element.id === hex)
    if (h === CHINA_BOX) {
        return "China Box"
    } else if (h > LAST_BOARD_HEX) {
        return "offboard"
    } else if (hex_id != -1) {
        const hex_data = map[hex_id]
        if (hex_data.name) {
            return `${hex_data.name} (${hex})`
        }
    }
    return `${hex}`
}

function expand_list(parent) {
    parent.children[0].hidden = true
    parent.children[1].hidden = false
    event.stopPropagation()
}

function escaped_list(match, p1) {
    var ind = p1.indexOf("|")
    var header = escape_text(p1.substring(0, ind))
    const text = escape_text(p1.substring(ind + 1))
    var array = text.split(", ").length
    var id = "list" + world.list_id++
    if (array <= 3) {
        return `<span>${text}</span>`
    } else {
        return `<span id="${id}"><span class="list-tip" onclick="expand_list(${id})" onmouseenter="on_focus_list(${id})" onmouseleave="on_blur_list(${id})">&lt;${header}&gt;</span><span hidden>${text}</span></span>`
    }

}

function on_focus_list(parent) {
    for (let el of parent.children[1].children) {
        el.onmouseenter();
    }
    on_blur_tip() //prevent unit tooltip from showing
}

function on_blur_list(parent) {
    for (let el of parent.children[1].children) {
        el.onmouseleave();
    }
}

function sub_hex(match, p1) {
    const hex_id = p1 | 0
    const name = get_hex_name(hex_id)
    if (hex_id > LAST_BOARD_HEX && hex_id !== CHINA_BOX) {
        return "offboard"
    }
    return `<span class="hex-tip" onclick="on_click_hex_tip(${hex_id})" onmouseenter="on_focus_hex_tip(${hex_id})" onmouseleave="on_blur_hex_tip(${hex_id})">${name}</span>`
}


function on_focus_hex_tip(z) {
    lookup_thing("action_hex", z).element.classList.toggle("tip", true)
}

function on_click_hex_tip(z) {
    scroll_into_view(get_hex_elem(z).element)
}

function on_blur_hex_tip(z) {
    lookup_thing("action_hex", z).element.classList.toggle("tip", false)
    get_hex_elem(z).element.classList.toggle("tip", false)
}

/* TOOLTIP ON FOCUS */

function unit_tooltip_image(a, onoff) {
    if (onoff) {
        on_focus_unit_tip(a)
    } else {
        on_blur_tip()
    }
}

function on_focus_unit_tip(a) {
    world.tip.hidden = false//is_mobile()
    const piece = pieces[a]
    // Show BOTH sides of the marker
    world.tip.innerHTML = `<div class="unit-tip piece ${piece.counter}"></div>`
    if (piece.class !== "hq" && (!piece.start_reduced || !piece.notreplaceable)) {
        world.tip.innerHTML += `<div class="unit-tip piece ${piece.counter} reduced"></div>`
    }
    world.tip.classList = "zoomed"
    var prev = world.range[0]
    if (piece.class === "hq" && G.location[a] < LAST_BOARD_HEX) {
        world.range = [G.location[a], pieces[a].cr]
        if (a === HQ_CENTRAL_PACIFIC && G.sid === SOUTH_PACIFIC_SCENARIO) {
            world.range = [hex_to_int(5226), 5]
        }
    } else {
        world.range = [0, 0]
    }
    if (prev !== world.range[0]) {
        on_update()
    }
}

function on_blur_tip() {
    world.tip.hidden = true
    world.tip.innerHTML = ""
    world.tip.classList = ''
    if (world.range[0]) {
        world.range = [0, 0]
        on_update()
    }
}

function on_focus_card_tip(c) {
    world.tip.hidden = false//is_mobile()
    world.tip.innerHTML = ""
    const card = cards[c]
    world.tip.classList = `card card_${card.faction ? "ap" : "jp"}_${card.num}`
}/** import client/framework.js*/