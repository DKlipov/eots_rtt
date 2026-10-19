// THIS FILE IS GENERATED! DO NOT EDIT!
"use strict"

const CLIENT_SIDE_SUPPLY = 0

/* dummies for client side supply and move pathing */
function log() {}
function capture_hex() {}

/* {{{ js/common/constants.js */
const ROLES = ["Japan", "Allies"]

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
const NOT_USED = 1488
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

const MANCHURIA_1 = hex_to_int(3302)
const MANCHURIA_2 = hex_to_int(3303)

const NEW_HEBRIDES = [4825, 4826, 4828, 4926].map(h => hex_to_int(h))
const COM_REPLACEMENT_POINTS = [1307, 1308, 2114, 2709, 3727].map(h => hex_to_int(h))
const CHINA_COAST = [2508, 2609, 2709, 2809, 2908, 3007, 3105, 3104, 3305, 3306].map(h => hex_to_int(h))

/* }}} */
/* {{{ js/common/data.js */
/* {{{ js/common/data_pieces.js */
var pieces = [
    {},
    {
        id: "army_jp_g_mainland",
        "faction": JP,
        "name": "Japanese Home Islands garrison",
        "counter": "yellow unit garrison_jp",
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
        "counter": "yellow unit garrison_cn",
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
        "counter": "yellow unit garrison_cn",
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
        "counter": "yellow unit garrison_cn",
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
        "counter": "ltyellow unit small_units_ltyellow unit_ix_2",
        "class": "hq",
        "cr": 13,
        "cm": 3,
        "start": 3407
    },
    {
        id: "hq_jp_ss",
        "faction": JP,
        "name": "South Seas HQ",
        "counter": "ltyellow unit small_units_ltyellow unit_ix_1",
        "class": "hq",
        "cr": 12,
        "cm": 2,
        "start": 4017
    },
    {
        id: "hq_jp_s",
        "faction": JP,
        "name": "South HQ",
        "counter": "ltyellow unit small_units_ltyellow unit_ix_3",
        "class": "hq",
        "cr": 13,
        "cm": 1,
        "start": 2212
    },
    {
        id: "hq_jp_co",
        "faction": JP,
        "name": "Combined Fleet HQ (Ozawa)",
        "counter": "ltyellow unit small_units_ltyellow unit_ix_4",
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
        "counter": "white unit big_units_white big unit_ix_10",
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
        "counter": "white unit big_units_white big unit_ix_12",
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
        "counter": "white unit big_units_white big unit_ix_13",
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
        "counter": "white unit big_units_white big unit_ix_16",
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
        "counter": "white unit big_units_white big unit_ix_4",
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
        "counter": "white unit big_units_white big unit_ix_15",
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
        "counter": "white unit big_units_white big unit_ix_14",
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
        "counter": "white unit big_units_white big unit_ix_19",
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
        "counter": "white unit big_units_white big unit_ix_17",
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
        "counter": "white unit big_units_white big unit_ix_5",
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
        "counter": "white unit big_units_white big unit_ix_1",
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
        "counter": "white unit big_units_white big unit_ix_3",
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
        "counter": "white unit big_units_white big unit_ix_18",
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
        "counter": "white unit big_units_white big unit_ix_2",
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
        "counter": "white unit small_units_white unit_ix_11",
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
        "counter": "white unit small_units_white unit_ix_12",
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
        "counter": "white unit small_units_white unit_ix_13",
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
        "counter": "white unit small_units_white unit_ix_14",
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
        "counter": "white unit small_units_white unit_ix_3",
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
        "counter": "white unit small_units_white unit_ix_4",
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
        "counter": "white unit small_units_white unit_ix_5",
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
        "counter": "white unit small_units_white unit_ix_7",
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
        "counter": "white unit small_units_white unit_ix_6",
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
        "counter": "yellow unit small_units_yellow unit_ix_20",
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
        "counter": "yellow unit small_units_yellow unit_ix_3",
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
        "counter": "yellow unit small_units_yellow unit_ix_18",
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
        "counter": "yellow unit small_units_yellow unit_ix_12",
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
        "counter": "yellow unit small_units_yellow unit_ix_21",
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
        "counter": "yellow unit small_units_yellow unit_ix_16",
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
        "counter": "yellow unit small_units_yellow unit_ix_4",
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
        "counter": "yellow unit small_units_yellow unit_ix_19",
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
        "counter": "yellow unit small_units_yellow unit_ix_14",
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
        "counter": "yellow unit small_units_yellow unit_ix_1",
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
        "counter": "yellow unit small_units_yellow unit_ix_17",
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
        "counter": "yellow unit small_units_yellow unit_ix_2",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_1",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_2",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_3",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_4",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_5",
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
        "counter": "white unit small_units_white unit_ix_15",
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
        "counter": "white unit small_units_white unit_ix_16",
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
        "counter": "white unit small_units_white unit_ix_17",
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
        "counter": "white unit small_units_white unit_ix_18",
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
        "counter": "white unit small_units_white unit_ix_19",
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
        "counter": "white unit small_units_white unit_ix_20",
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
        "counter": "white unit small_units_white unit_ix_1",
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
        "counter": "white unit small_units_white unit_ix_2",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_13",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_6",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_7",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_8",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_9",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_10",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_11",
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
        "counter": "yellow unit small_units_yellow_air unit_ix_12",
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
        "counter": "yellow unit small_units_yellow unit_ix_5",
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
        "counter": "yellow unit small_units_yellow unit_ix_6",
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
        "counter": "yellow unit small_units_yellow unit_ix_7",
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
        "counter": "yellow unit small_units_yellow unit_ix_8",
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
        "counter": "yellow unit small_units_yellow unit_ix_9",
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
        "counter": "yellow unit small_units_yellow unit_ix_10",
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
        "counter": "yellow unit small_units_yellow unit_ix_11",
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
        "counter": "yellow unit small_units_yellow unit_ix_15",
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
        "counter": "yellow unit small_units_yellow unit_ix_13",
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
        "counter": "white unit big_units_white big unit_ix_6",
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
        "counter": "white unit big_units_white big unit_ix_7",
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
        "counter": "white unit big_units_white big unit_ix_8",
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
        "counter": "white unit big_units_white big unit_ix_9",
        "type": "cv",
        "cf": 10,
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
        "counter": "white unit big_units_white big unit_ix_11",
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
        "counter": "turquoise unit small_units_turquoise unit_ix_1",
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
        "counter": "turquoise unit small_units_turquoise unit_ix_2",
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
        "counter": "turquoise unit small_units_turquoise unit_ix_3",
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
        "counter": "turquoise unit small_units_turquoise unit_ix_4",
        "class": "hq",
        "service": "us",
        "cr": 10,
        "cm": 3,
    },
    {
        id: "hq_ap_m",
        "faction": AP,
        "name": "Malaya HQ",
        "counter": "beige unit small_units_beige unit_ix_4",
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
        "counter": "beige unit small_units_beige unit_ix_5",
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
        "counter": "dkblue unit small_units_dkblue unit_ix_1",
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
        "counter": "dkblue unit small_units_dkblue unit_ix_2",
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
        "counter": "blue unit big_units_blue big unit_ix_3",
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
        "counter": "blue unit big_units_blue big unit_ix_4",
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
        "counter": "blue unit big_units_blue big unit_ix_5",
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
        "counter": "blue unit big_units_blue big unit_ix_7",
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
        "counter": "blue unit big_units_blue big unit_ix_2",
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
        "counter": "blue unit big_units_blue big unit_ix_1",
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
        "counter": "beige unit big_units_beige big unit_ix_1",
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
        "counter": "beige unit big_units_beige big unit_ix_3",
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
        "counter": "beige unit big_units_beige big unit_ix_2",
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
        "counter": "orange unit big_units_orange big unit_ix_1",
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
        "counter": "blue unit small_units_blue unit_ix_1",
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
        "counter": "green unit small_units_green_air unit_ix_1",
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
        "counter": "green unit small_units_green_air unit_ix_2",
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
        "counter": "green unit small_units_green_air unit_ix_3",
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
        "counter": "green unit small_units_green_air unit_ix_4",
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
        "counter": "green unit small_units_green_air unit_ix_16",
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
        "counter": "orange unit small_units_orange unit_ix_1",
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
        "counter": "beige unit small_units_beige_air unit_ix_3",
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
        "counter": "beige unit small_units_beige_air unit_ix_4",
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
        "counter": "beige unit small_units_beige_air unit_ix_5",
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
        "counter": "green unit small_units_green_air unit_ix_15",
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
        "counter": "green unit small_units_green_air unit_ix_5",
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
        "counter": "green unit small_units_green_air unit_ix_7",
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
        "counter": "green unit small_units_green_air unit_ix_6",
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
        "counter": "blue unit small_units_blue unit_ix_3",
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
        "counter": "beige unit small_units_beige_air unit_ix_1",
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
        "counter": "beige unit small_units_beige_air unit_ix_2",
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
        "counter": "green unit small_units_green_air unit_ix_9",
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
        "counter": "green unit small_units_green_air unit_ix_8",
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
        "counter": "green unit small_units_green_air unit_ix_11",
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
        "counter": "green unit small_units_green_air unit_ix_10",
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
        "counter": "green unit small_units_green_air unit_ix_12",
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
        "counter": "blue unit small_units_blue unit_ix_4",
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
        "counter": "blue unit small_units_blue unit_ix_5",
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
        "counter": "green unit small_units_green_air unit_ix_13",
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
        "counter": "green unit small_units_green_air unit_ix_14",
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
        "counter": "blue unit big_units_blue big unit_ix_6",
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
        "counter": "blue unit big_units_blue big unit_ix_8",
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
        "counter": "beige unit big_units_beige big unit_ix_6",
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
        "counter": "beige unit big_units_beige big unit_ix_5",
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
        "counter": "beige unit big_units_beige big unit_ix_7",
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
        "counter": "blue unit big_units_blue big unit_ix_10",
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
        "counter": "blue unit big_units_blue big unit_ix_9",
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
        "counter": "blue unit big_units_blue big unit_ix_11",
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
        "counter": "beige unit big_units_beige big unit_ix_8",
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
        "counter": "blue unit big_units_blue big unit_ix_12",
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
        "counter": "blue unit big_units_blue big unit_ix_13",
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
        "counter": "blue unit big_units_blue big unit_ix_14",
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
        "counter": "blue unit big_units_blue big unit_ix_18",
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
        "counter": "blue unit big_units_blue big unit_ix_17",
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
        "counter": "blue unit big_units_blue big unit_ix_15",
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
        "counter": "blue unit big_units_blue big unit_ix_16",
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
        "counter": "blue unit big_units_blue big unit_ix_22",
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
        "counter": "blue unit big_units_blue big unit_ix_21",
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
        "counter": "blue unit big_units_blue big unit_ix_20",
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
        "counter": "blue unit big_units_blue big unit_ix_19",
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
        "counter": "blue unit big_units_blue big unit_ix_24",
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
        "counter": "blue unit big_units_blue big unit_ix_23",
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
        "counter": "blue unit big_units_blue big unit_ix_27",
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
        "counter": "blue unit big_units_blue big unit_ix_26",
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
        "counter": "blue unit big_units_blue big unit_ix_25",
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
        "counter": "blue unit big_units_blue big unit_ix_30",
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
        "counter": "blue unit big_units_blue big unit_ix_29",
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
        "counter": "blue unit big_units_blue big unit_ix_28",
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
        "counter": "blue unit big_units_blue big unit_ix_32",
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
        "counter": "blue unit big_units_blue big unit_ix_31",
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
        "counter": "beige unit big_units_beige big unit_ix_4",
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
        "counter": "beige unit big_units_beige big unit_ix_9",
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
        "counter": "red unit small_units_red unit_ix_2",
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
        "counter": "red unit small_units_red unit_ix_3",
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
        "counter": "red unit small_units_red unit_ix_1",
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
        "counter": "blue unit small_units_blue unit_ix_2",
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
        "counter": "green unit small_units_green unit_ix_1",
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
        "counter": "green unit small_units_green unit_ix_2",
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
        "counter": "green unit small_units_green unit_ix_3",
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
        "counter": "green unit small_units_green unit_ix_4",
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
        "counter": "green unit small_units_green unit_ix_5",
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
        "counter": "green unit small_units_green unit_ix_6",
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
        "counter": "beige unit small_units_beige unit_ix_8",
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
        "counter": "beige unit small_units_beige unit_ix_9",
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
        "counter": "beige unit small_units_beige unit_ix_7",
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
        "counter": "beige unit small_units_beige unit_ix_10",
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
        "counter": "beige unit small_units_beige unit_ix_1",
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
        "counter": "beige unit small_units_beige unit_ix_18",
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
        "counter": "beige unit small_units_beige unit_ix_19",
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
        "counter": "beige unit small_units_beige unit_ix_15",
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
        "counter": "beige unit small_units_beige unit_ix_16",
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
        "counter": "beige unit small_units_beige unit_ix_17",
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
        "counter": "orange unit small_units_orange unit_ix_2",
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
        "counter": "orange unit small_units_orange unit_ix_3",
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
        "counter": "orange unit small_units_orange unit_ix_4",
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
        "counter": "orange unit small_units_orange unit_ix_5",
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
        "counter": "orange unit small_units_orange unit_ix_6",
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
        "counter": "orange unit small_units_orange unit_ix_7",
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
        "counter": "orange unit small_units_orange unit_ix_8",
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
        "counter": "orange unit small_units_orange unit_ix_9",
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
        "counter": "orange unit small_units_orange unit_ix_10",
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
        "counter": "beige unit small_units_beige unit_ix_14",
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
        "counter": "beige unit small_units_beige unit_ix_6",
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
        "counter": "blue unit small_units_blue unit_ix_8",
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
        "counter": "green unit small_units_green unit_ix_9",
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
        "counter": "green unit small_units_green unit_ix_8",
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
        "counter": "green unit small_units_green unit_ix_7",
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
        "counter": "green unit small_units_green unit_ix_10",
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
        "counter": "green unit small_units_green unit_ix_11",
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
        "counter": "green unit small_units_green unit_ix_12",
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
        "counter": "blue unit small_units_blue unit_ix_6",
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
        "counter": "blue unit small_units_blue unit_ix_7",
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
        "counter": "blue unit small_units_blue unit_ix_8",
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
        "counter": "blue unit small_units_blue unit_ix_9",
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
        "counter": "blue unit small_units_blue unit_ix_10",
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
        "counter": "blue unit small_units_blue unit_ix_11",
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
        "counter": "blue unit small_units_blue unit_ix_12",
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
        "counter": "beige unit small_units_beige unit_ix_2",
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
        "counter": "beige unit small_units_beige unit_ix_3",
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
        "counter": "beige unit small_units_beige unit_ix_11",
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
        "counter": "beige unit small_units_beige unit_ix_12",
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
        "counter": "beige unit small_units_beige unit_ix_20",
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
        "counter": "beige unit small_units_beige unit_ix_13",
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

const US_MARINE_UNIT = find_piece("army_ap_1_m")
const US_BB_UNIT = find_piece("washington")
const US_CV_UNIT = find_piece("essex")

//HQ
const HQ_YAMAMOTO = find_piece("hq_jp_cy")
const HQ_OZAWA = find_piece("hq_jp_co")
const HQ_JP_SOUTH = find_piece("hq_jp_s")
const HQ_SOUTH_SEAS = find_piece("hq_jp_ss")
const KOREAN_ARMY = find_piece("army_jp_kor")
const ED_ARMY = find_piece("army_jp_ed")

const HQ_LIST = []

;(function(){

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

})()

function find_piece(id) {
    for (let i = 1; i < pieces.length; i++) {
        if (pieces[i].id === id) {
            return i
        }
    }
    throw new Error("Missed unit " + id)
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

function is_commonwealth(piece) {
    return piece.service === "br" || piece.service === "au" || piece.service === "bu" || piece.service === "ind"
}

function is_us_unit(piece) {
    return (piece.service === "navy" || piece.service === "army") && piece.faction === AP
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

function get_unit_supply_type(piece) {
    if (!piece.faction) {
        return JP_SUPPLIED_HEX
    } else if (piece.service === "ch" || piece.class === "air" && (piece.service === "navy" || piece.service === "army")) {
        return AP_SUPPLIED_HEX
    } else if (is_commonwealth(piece)) {
        return BR_SUPPLIED_HEX | JOINT_SUPPLIED_HEX
    } else if (piece.service === "navy" || piece.service === "army") {
        return US_SUPPLIED_HEX | JOINT_SUPPLIED_HEX
    } else if (piece.service === "du") {
        return JOINT_SUPPLIED_HEX
    }
    throw new Error("Invalid piece supply: " + piece.name)
}

/* }}} */
/* {{{ js/common/data_cards.js */
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "Col. Tsuji",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
        "name": "War in Europe",
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
    throw new Error(`Missed card ${faction} ${num}`)
}

/* }}} */
/* {{{ js/common/data_map.js */
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
    {id: 1103, terrain: OCEAN, edges: [0, 0, 1, 1, 1, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1204, terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1303, terrain: OCEAN, edges: [0, 0, 0, 1, 1, 0], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1304, terrain: OCEAN, edges: [1, 0, 0, 0, 1, 1]},
    {id: 1205, terrain: OCEAN, edges: [1, 1, 0, 1, 1, 1]},
    {id: 1010, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 0]},
    {id: 1110, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1211, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1311, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1412, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1512, terrain: OCEAN, edges: [1, 1, 1, 0, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1613, terrain: OCEAN, edges: [1, 1, 1, 1, 0, 1], supply_source: JOINT_SUPPLIED_HEX},
    {id: 1612, terrain: OCEAN, edges: [1, 17, 17, 1, 1, 1]},
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
    {id: 2108, region: "Burma", terrain: MIXED, edges: [2, 2, 2, 5, 1, 4]},
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
    {id: 2608, region: "IChina", terrain: MIXED, edges: [0, 0, 0, 2, 2, 2]}, //Only playable in the burma scenario
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
    {id: 2312, region: "Indochina", terrain: MIXED, edges: [3, 1, 1, 1, 1, 3]},
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
        edges: [8, 12, 1, 1, 8, 8]
    },
    {id: 3203, region: "Manchuria", terrain: OPEN, edges: [0, 4, 2, 2, 4, 0]},
    {id: 3204, region: "Manchuria", terrain: OPEN, edges: [2, 4, 2, 8, 12, 2]},
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
        edges: [0, 2, 2, 4, 4, 0]
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
        edges: [4, 1, 25, 1, 1, 3]
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
    {id: 3804, region: "Japan", terrain: MIXED, edges: [1, 1, 1, 17, 2, 3]},
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
        edges: [24, 2, 17, 17, 17, 1]
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
    {id: 2913, region: "Philippines", terrain: MIXED, edges: [2, 17, 24, 1, 16, 1]},
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
    {id: 2717, region: "Celebes", terrain: MIXED, edges: [8, 8, 3, 8, 10, 8]},
    {id: 2618, region: "Celebes", terrain: MIXED, edges: [1, 10, 10, 2, 1, 1]},
    {id: 2718, region: "Celebes", terrain: MIXED, edges: [8, 17, 1, 3, 18, 10]},
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
    {id: 2625, region: "Australia", terrain: JUNGLE, edges: [17, 2, 2, 2, 2, 17]},
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
    {id: 2925, region: "Australia", terrain: OPEN, edges: [2, 2, 0, 0, 2, 2], supply_source: JOINT_SUPPLIED_HEX},
    {
        id: 3023,
        name: "Darwin",
        city: CITY,
        airfield: true,
        port: true,
        region: "Australia",
        terrain: JUNGLE,
        edges: [1, 1, 3, 2, 3, 1]
    },
    {id: 3024, region: "Australia", terrain: JUNGLE},
    {id: 3025, region: "Australia", terrain: OPEN, edges: [2, 2, 2, 1, 2, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 3123, region: "Australia", terrain: JUNGLE, edges: [1, 1, 3, 2, 2, 3]},
    {id: 3124, region: "Australia", terrain: JUNGLE},
    {id: 3125, region: "Australia", terrain: OPEN, edges: [2, 2, 2, 0, 8, 2], supply_source: JOINT_SUPPLIED_HEX},
    {id: 3224, region: "Australia", terrain: JUNGLE, edges: [1, 1, 1, 3, 2, 3]},
    {id: 3225, region: "Australia", terrain: JUNGLE, edges: [3, 1, 1, 3, 2, 2]},
    {
        id: 3226,
        airfield: true,
        region: "Australia",
        terrain: JUNGLE,
        edges: [3, 3, 2, 2, 0, 2],
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
    {id: 3320, region: "Guinea", terrain: JUNGLE, edges: [24, 2, 3, 1, 1, 3]},
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
    {id: 3922, name: "Buna", city: CITY, airfield: true, region: "Guinea", terrain: MIXED, edges: [1, 1, 1, 10, 4, 3]},
    {id: 3923, region: "Guinea", terrain: MIXED, edges: [10, 8, 3, 1, 1, 3]},
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
        name: "Noumea",
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
    {id: 3800, region: "Oceania", terrain: OCEAN, edges: [0, 0, 1, 3, 1, 0]},
    {id: 4000, region: "Oceania", terrain: OCEAN, edges: [0, 0, 1, 1, 1, 0]},
    {id: 4400, region: "Oceania", terrain: OCEAN, edges: [0, 0, 1, 1, 1, 0]},
    {id: 5200, region: "Oceania", terrain: OCEAN, edges: [0, 0, 1, 1, 1, 0]},
    {id: 3900, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 8, 1]},
    {id: 4300, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
    {id: 4300, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
    {id: 4500, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
    {id: 4900, region: "Oceania", terrain: OCEAN, edges: [0, 1, 1, 1, 1, 1]},
]

var sp_map = [
    {id: 3017, edges: [0, 1, 1, 1, 0, 0], top: true},
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
    {id: 3018, edges: [1, 1, 1, 25, 0, 0]},
    {id: 3019, edges: [25, 1, 1, 8, 0, 0]},
    {id: 3020, edges: [8, 8, 1, 1, 0, 0]},
    {id: 3021, edges: [1, 1, 1, 1, 0, 0]},
    {id: 3022, edges: [1, 1, 1, 1, 0, 0]},
    {id: 3023, edges: [1, 1, 3, 2, 0, 0]},
    {id: 3024, edges: [2, 2, 2, 2, 0, 0]},
    {id: 3025, edges: [2, 2, 2, 0, 0, 0]},
    {id: 3026, edges: [0, 0, 0, 0, 0, 0]},
    {id: 3125, edges: [2, 2, 2, 0, 0, 2]},
    {id: 4927, edges: [1, 1, 0, 0, 1, 1]},
    {id: 5027, edges: [1, 0, 0, 0, 1, 1]},
    {id: 5028, edges: [0, 0, 0, 0, 0, 0]},
    {id: 3226, edges: [3, 3, 2, 0, 0, 2]},
    {id: 3326, edges: [3, 3, 2, 0, 0, 2]},
    {id: 3427, edges: [2, 2, 2, 0, 0, 2]},
    {id: 3527, edges: [2, 2, 2, 0, 0, 2]},
]

const GARRISONED_CITY = map.filter(h => h.city > CITY).map(h => hex_to_int(h.id))
const RESOURCE_HEX = map.filter(h => h.resource).map(h => hex_to_int(h.id))

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
const TUNNELING = [
    {from: hex_to_int(4825), distance: 21, to: OAHU, map: S_P_MAP_DATA, duplex: true},
    {from: hex_to_int(4826), distance: 22, to: OAHU, map: S_P_MAP_DATA, duplex: true},
    {from: hex_to_int(4828), distance: 24, to: OAHU, map: S_P_MAP_DATA, duplex: true},
    {from: hex_to_int(4926), distance: 22, to: OAHU, map: S_P_MAP_DATA, duplex: true},
    {from: hex_to_int(1912), distance: 2, to: SINGAPORE, map: B_F_W_MAP_DATA, duplex: true},
    {from: SAIGON, distance: 6, to: hex_to_int(1912), map: B_F_W_MAP_DATA, duplex: false},
]

map.forEach(h => MAP_DATA[hex_to_int(h.id)] = h)

var S_P_first_hex = []

;(function(){

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
        var x = Math.floor(i / 29)
        var y = i % 29
        var sw = (x <= 17 && y <= 12) ? 1 : 0
        if (!hex) {
            hex = {id: int_to_hex(i), terrain: OCEAN, region: "Ocean", nh: get_edge_hexes(i), sw}
            MAP_DATA[i] = hex
        }
        hex.sw = sw
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
    B_F_W_MAP_DATA[hex_to_int(2609)].edges_int += GROUND
    B_F_W_MAP_DATA[hex_to_int(2508)].edges_int += GROUND << 5
    B_F_W_MAP_DATA[hex_to_int(1912)].nh.length = 3
    B_F_W_MAP_DATA[hex_to_int(1912)].edges_int = (B_F_W_MAP_DATA[hex_to_int(1912)].edges_int % (1 << 5 * 3))

    var t1 = 1
    for (var i = 0; i < TUNNELING.length; i++) {
        var tunnel = TUNNELING[i]
        create_tunnel(tunnel, t1)
        if (tunnel.duplex) {
            var from = tunnel.from
            tunnel.from = tunnel.to
            tunnel.to = from
            create_tunnel(tunnel, t1)
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

})()

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
    var sp_map_item = sp_map.find(h => h.id === hex.id)
    if (sp_map_item && sp_map_item.edges) {
        hex.edges_int = 0
        for (let j = 0; j < 6; j++) {
            var edge = sp_map_item.edges[j]
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

function create_tunnel(data, t1) {
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
}

/* }}} */

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
        counter: counters.tokyo_express,
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

/* }}} */
/* {{{ js/common/utils.js */
function is_event_active(event) {
    var data = G.events[event.id]
    if (Array.isArray(data)) {
        return data[data.length - 1] === G.turn
    }
    return G.events[event.id]
}

function for_each_card(apply) {
    for (let i = 1; i < cards.length; i++) {
        var card = cards[i]
        var returned = apply(i, card)
        if (returned) {
            return returned
        }

    }
}

function hex_to_int(i) {
    return (Math.floor(i / 100) - 10) * 29 + i % 100
}

function int_to_hex(i) {
    return (Math.floor(i / 29) * 100) + 1000 + i % 29
}

function get_direction(from, to) {
    var x = ((from) % 29)
    var d = ((from - x) / 29) & 1
    switch (from - to + 30 + d * 10) {
    case 31: return 0
    case 2: return 1
    case 1: return 2
    case 29: return 3
    case 59: return 4
    case 60: return 5
    case 41: return 0
    case 11: return 1
    case 10: return 2
    case 39: return 3
    case 68: return 4
    case 69: return 5
    }
    return 0
}

function get_edge_hexes(hex) {
    var y = hex % 29
    var x = (hex - y) / 29
    var y_diff = 1 - (x & 1)
    var y1_diff = 1 - y_diff
    var result = []
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
    const d = x & 1
    var i

    for (var j = -range; j <= range; j++) {
        if (x + j < 0 || x + j > 50) {
            continue
        }
        const d2 = Math.abs(j) & 1
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
    var ry = ys - yf - (rx & 1) * (xf & 1)
    if (ry <= (-rx >> 1)) {
        ry = Math.abs(ry) - (rx & 1)
    } else if (ry < rx >> 1) {
        const c = (rx >> 1) - ry
        ry = (rx >> 1) + ((c + (rx & 2)) >> 1)
        rx -= c
    }
    return rx + ry - (rx >> 1)
}

function in_range_on_map(first_hex, range, hexes, faction = AP) {
    var result = []
    for (var i = 0; i < hexes.length; i++) {
        var hex = hexes[i]
        if (get_map_data(hex).sw) {
            return slow_in_range(first_hex, range, hexes, faction)
        }
        if (get_distance(first_hex, hex) > range) {
            //nothing
        } else if (get_map_data(hex).sw || get_map_data(first_hex).sw) {
            return slow_in_range(first_hex, range, hexes, faction)
        } else {
            set_add(result, hex)
        }
    }
    return result
}

function slow_in_range(first_hex, range, hexes, faction) {
    var queue = [first_hex]
    var distance_map = []
    var result = []
    distance_map[first_hex] = 1
    for (var i = 0; i < queue.length; i++) {
        var item = queue[i]
        var distance = distance_map[item] + 1
        var MD = get_map_data(item)
        var nh_list = get_near_hexes(item)
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
        for (var j = 0; j < nh_list.length; j++) {
            var nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (distance > range + 1 || (distance_map[nh] <= distance) || ((MD.edges_int >> 5 * j) % 32) === 0) {
                continue
            }
            distance_map[nh] = distance
            queue.push(nh)
        }
    }
    hexes.forEach(h => {
        if (distance_map[h] && (faction !== JP || get_map_data(h).region !== "IChina")) {
            set_add(result, h)
        }
    })
    return result
}

function get_jp_resources() {
    return array_count(RESOURCE_HEX, h => is_space_controlled(h, JP) && get_map_data(h).resource)
}

function get_china_offensive_modifiers() {
    var result = {
        log: [],
        burma_road: 0,
        air_support: 0,
        divisions: G.china_divisions
    }
    result.burma_road = (G.sid === SOUTH_PACIFIC_SCENARIO) ? 0 : ((2 - G.burma_road) * 4)
    result.log.push(`Japanese divisions ${G.china_divisions}.`)
    result.log.push(`+${result.burma_road} (Burma road).`)

    if (G.sid === SOUTH_PACIFIC_SCENARIO) {
        result.air_support++
        result.log.push(`+1 ${piece_get_log_str(ap_air("14_lrb"))}.`)
    } else {
        for_each_unit((u, piece, location) => {
            if (location === CHINA_BOX && (piece.type !== "lrb" || u === LRB_14) && !set_has(G.oos, u)) {
                result.log.push(`+1 ${piece_get_log_str(u)}.`)
                result.air_support++
            }
        })
    }
    return result
}

/* log formatting helper functions*/

// below are all functions for pretty formatting (tooltips, hover to piece on click etc) in the log

function hex_get_log_str(h) {
    return `H${h}`
}

function piece_get_log_str(p) {
    return `P${p}`
}

function list_get_log_str(header, items) {
    return `^${header}|${items.join(", ")}^`
}

function units_str(units) {
    return list_get_log_str(`${piece_get_log_str(units[0])} with ${units.length - 1} units`, units.map(u => piece_get_log_str(u)))
}

function scenario_data() {
    return SCENARIO_DATA[G.sid]
}

function solely_occupied_land(hex, faction) {
    return G.supply_cache[hex] & JP_GAH_UNITS << (faction) && !(G.supply_cache[hex] & JP_GAH_UNITS << (1 - faction))
}

/* }}} */
/* {{{ js/common/supply.js */
function check_supplied_hexes(faction) {
    check_supply()
    L.supply = {}
    mark_supply_eligable_ports(faction)
    mark_supplied_hexes(faction)
    if (G.burma_road < 2 && faction === AP) {
        mark_hexes_supplied_kunming()
    }
    L.supply = 0
}

function basic_check_supply() {
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
    for_each_unit_on_map(mark_unit)
    place_virtual_units()
    check_infrastructure()
    for_each_unit_on_map((i, p) => set_zoi(i, p, [G.oos, G.oos]))
    indian_zoi_hack((i, p) => set_zoi(i, p, [G.oos, G.oos]))
    if (G.sid === SOUTH_PACIFIC_SCENARIO && G.turn === 3) {
        var mask = G.supply_cache[TRUK] & JP_UNITS
        G.supply_cache[TRUK] ^= (mask)
    } else if (G.sid === BURMA_SCENARIO) {
        var mask = G.supply_cache[SINGAPORE] & JP_UNITS
        G.supply_cache[SINGAPORE] ^= (mask)
    }
    L.supply = 0
}

function indian_zoi_hack(apply) {
    remove_zoi(hex_to_int(1304))
    if (!(G.supply_cache[hex_to_int(1005)] & AP_ZOI)) {
        remove_zoi(hex_to_int(1205))
    }
    G.offensive.active_units[AP].filter(u => G.location[u] !== MADRAS).forEach(u => apply(u, pieces[u]))
    for_each_hex_in_range(KUNMING, 1, h => {
        if (has_zoi(h, JP)) {
            G.supply_cache[h] -= JP_ZOI
            G.supply_cache[h] -= AP_ZOI_NTRL
        }
    })
}

function remove_zoi(hex) {
    if (G.supply_cache[hex] & AP_ZOI) {
        G.supply_cache[hex] -= AP_ZOI
    }
    if (G.supply_cache[hex] & JP_ZOI_NTRL) {
        G.supply_cache[hex] -= JP_ZOI_NTRL
    }
}

function check_units() {
    clear_supply_cache(CLEAN_ALL_MASK)
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
        return
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
            var distance = get_ground_mp_cost(item, nh, faction)
            if (distance > 1 || map_has(distance_map, nh) || occupied_land) {
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
        return
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
            if (nh === MADRAS || is_supply_source(nh, JOINT_SUPPLIED_HEX, AP)) {
                G.burma_road = 0
                return
            }
        }
    }
    check_hump()
}

function is_supply_source(hex, supply, faction) {
    var md = get_map_data(hex)
    return md.supply_source & supply && (md.region === "Japan" || !has_non_n_zoi(hex, 1 - faction) && md.region !== "Australia"
        || md.region === "Australia" && (md.port && is_space_controlled(hex, faction) || !md.coastal))
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
    if (is_supply_source(location, supply, faction)) {
        return true
    }
    for (var i = 0; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
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
                if (is_supply_source(nh, supply, faction)) {
                    return true
                }
            }
        }
    }
    return false
}

function mark_supply_ports_overland(hq, piece) {
    if (!hq.length) {
        return
    }
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
    })
    for (var i = 0; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let base_distance = map_get(distance_map, item)
        let nh_list = get_near_hexes(item)
        if (faction === JP && get_map_data(item).region === "IChina" || !nh_list) {
            continue
        }
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            const occupied_land = G.supply_cache[nh] & JP_GAH_UNITS << (1 - faction) && !(G.supply_cache[nh] & JP_GAH_UNITS << faction)
            var distance = base_distance + get_ground_mp_cost(item, nh, faction)
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
    if (!hq.length) {
        return
    }
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
    for (var i = 0; i < L.supply.queue.length; i++) {
        let item = L.supply.queue[i]
        let nh_list = get_near_hexes(item)
        if (faction === JP && get_map_data(item).region === "IChina" || !nh_list) {
            continue
        }
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

            var distance = base_distance + get_ground_mp_cost(nh, item, faction)
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
            const distance = distance_base + get_ground_mp_cost(item, nh, AP)
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
        return
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
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
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
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
        if (non_neutral_zoi_s || distance < 0) {
            continue
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
            if (friendly_port && !md1.island && !(overland_set[nh] >= distance)) {
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
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
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
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
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
    indian_zoi_hack((i, p) => both_sides_zoi || p.faction === faction ? set_zoi(i, p, oos_units) : null)
    mark_supply_eligable_ports(faction)
    var size = array_count(oos_units[faction], u => pieces[u].zoi_generator)
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
    return array_count(oos_units[faction], u => pieces[u].zoi_generator) === size && burma === G.burma_road
}

function get_ground_mp_cost(from, to, faction) {
    var direction = get_direction(from, to)
    if (!(get_map_data(from).edges_int & GROUND << 5 * direction)) {
        return 100
    }
    if ((get_map_data(from).edges_int & ROAD << (5 * direction))
        && !(G.supply_cache[to] & TRANSPORT_ROUTE_DISABLED)
        && !(G.supply_cache[from] & TRANSPORT_ROUTE_DISABLED)
        && ((G.supply_cache[to] & (JP_UNITS << faction)) || !(G.supply_cache[to] & (JP_UNITS << 1 - faction)))
        && ((G.supply_cache[from] & (JP_UNITS << faction)) || !(G.supply_cache[from] & (JP_UNITS << 1 - faction)))
    ) {
        return 1
    } else {
        return ((get_map_data(to).terrain >> 1) + 1) * 2
    }
}

function get_ground_move_cost(from, to, faction) {
    var direction = get_direction(from, to)
    if (!(get_map_data(from).edges_int & GROUND << 5 * direction)) {
        return 100
    }
    if ((get_map_data(from).edges_int & ROAD << (5 * direction))
        && !(G.supply_cache[to] & (TRANSPORT_ROUTE_DISABLED | (JP_GA_UNITS << 1 - faction)))
        && !(G.supply_cache[from] & TRANSPORT_ROUTE_DISABLED)
    ) {
        return 1
    } else {
        return ((get_map_data(to).terrain >> 1) + 1) * 2
    }
}

function is_controllable_hex(hex) {
    return G.supply_cache[hex] & HEX_CONTROLLABLE
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
}


function check_japan_resource_trace() {
    check_supply()
    const faction = JP
    let queue = []
    const overland_set = []
    const oversea_set = []
    events.JAPAN_TRACE_RESOURCES.keys.forEach(hh => {
        var h = hex_to_int(hh)
        set_add(queue, h)
        set_add(overland_set, h)
        set_add(oversea_set, h)
    })
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        if (faction === JP && MD.region === "IChina" || !nh_list) {
            continue
        }
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
                if (get_map_data(nh).resource && is_space_controlled(nh, JP)) {
                    return true
                }
                queue.push(nh)
            }
        }
    }
    return false
}

function mark_activation_zone(hq) {
    clear_supply_cache(CLEAN_ATTACK_ZONE_MASK)
    const location = G.location[hq]
    G.supply_cache[location] |= HEX_TEMP_FLAG3
    const range = pieces[hq].cr
    const faction = pieces[hq].faction
    let queue = [location]
    const distance_map = [location, 0]
    for (var i = 0; i < queue.length; i++) {
        let item = queue[i]
        let nh_list = get_near_hexes(item)
        const MD = get_map_data(item)
        if (faction === JP && MD.region === "IChina") {
            continue
        }
        const distance = map_get(distance_map, item) + 1
        const non_neutral_zoi = has_non_n_zoi(item, 1 - faction)
        const occupied_land = solely_occupied_land(item, 1 - faction)
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
                continue
            }
            if (map_get(distance_map, nh, 100) > distance
                && (
                    (MD.edges_int & UNPLAYABLE_LAND << 5 * j && !occupied_land && !solely_occupied_land(nh, 1 - faction)) ||
                    (MD.edges_int & UNPLAYABLE_WATER << 5 * j && !non_neutral_zoi && !has_non_n_zoi(nh, 1 - faction))
                )) {
                map_set(distance_map, nh, distance)
                G.supply_cache[nh] |= HEX_TEMP_FLAG3
                if (distance < range) {
                    queue.push(nh)
                }
            }
        }
    }
}

/* }}} */
/* {{{ js/common/move.js */
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
    } else if (L.move_type & STRAT_MOVE) {
        compute_ground_naval_strat_move()
    } else {
        compute_ground_naval_move_hexes()
    }
}

function get_move_data() {
    var result = {
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
        var piece = pieces[u]
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
    if (result.sm_possible && (result.is_air_present || get_map_data(result.location).coastal)) {
        result.move_type |= STRAT_MOVE
    }
    if (G.offensive.counter_offensive_card === MATADOR) {
        result.asp_points = 0
    }
    if (result.is_ground_present && asp_move && result.asp_points <= asp_total && get_map_data(result.location).coastal) {
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
    if (L.move_type & STRAT_MOVE) {
        move_type |= STRAT_MOVE
    }
    if (L.move_type & AIR_EXTENDED_MOVE) {
        move_type |= AIR_EXTENDED_MOVE
    }
    if (L.move_type === STRAT_MOVE) {
        check_supply()
    }
    var strat_flag = L.move_type & STRAT_MOVE
    if ((L.move_type === STRAT_MOVE) && has_non_n_zoi(location, 1 - R)) {
        return []
    }
    var avoid_zoi_flag = L.avoid_zoi
    if ((avoid_zoi_flag) && has_zoi(location, 1 - R)) {
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
        if (G.active === JP && MD.region === "IChina" || MD.region === "Manchuria") {
            nh_list = []
        }
        for (let j = 0; j < nh_list.length; j++) {
            let nh = nh_list[j]
            if (nh <= 0) {
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
    if (check_china_box_restricted()) {
        map_delete(L.allowed_hexes, CHINA_BOX)
    }
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
    if (L.move_data.move_type & NAVAL_MOVE && !enemy_non_n_zoi && L.move_type !== GROUND_MOVE) {
        var zoi_mask = 0
        if (move_data.is_ground_present && !move_data.is_naval_present) {
            zoi_mask = zoi_mask | JP_NAVAL_UNITS << (1 - R)
        }
        mt = NAVAL_MOVE
        if (L.move_type & BARGES_MOVE) {
            mt |= BARGES_MOVE
        }
        if (L.avoid_zoi) {
            zoi_mask |= JP_ZOI << (1 - G.active)
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
            var m_mt = mt
            var hex = v[v.length - 1]
            if (move_data.is_ground_present
                && G.offensive.stage === ATTACK_STAGE && L.move_type !== AMPH_MOVE
                && get_map_data(hex).port && is_space_controlled(hex, G.active)) {
                m_mt |= STRAT_MOVE
            } else if (move_data.is_ground_present) {
                m_mt |= AMPH_MOVE
            }
            v.unshift(m_mt)
            map_set(L.allowed_hexes, k, v)
        })
        if (G.offensive.offensive_card === OPERATION_NO_1) {
            clear_supply_cache(CLEAN_ATTACK_ZONE_MASK)
            for_each_hex_in_range(TOKYO, 16, h => {
                if (get_map_data(h).port && is_space_controlled(h, JP)) {
                    for_each_hex_in_range(h, 5, h => G.supply_cache[h] |= HEX_TEMP_FLAG1)
                }
            })
            var r = []
            map_for_each(L.allowed_hexes, (k, v) => {
                if (v[0] & AMPH_MOVE && !(G.supply_cache[k] & HEX_TEMP_FLAG1)) {
                    r.push(k)
                }
            })
            r.forEach(h => map_delete(L.allowed_hexes, h))
        }
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
    map_for_each(get_ground_move(), (k, v) => {
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
    if (has_non_n_zoi(location, 1 - R) || L.avoid_zoi && has_zoi(location, 1 - R)) {
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
                || L.avoid_zoi && has_zoi(nh, 1 - R)
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
        return
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
        us_army_unit_active = G.active_stack.map(u => pieces[u]).some(p => p.class === "ground" && p.service === "army") &&
            !G.active_stack.map(u => pieces[u]).some(p => p.class === "ground" && p.type === "marine")
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
        var ground_pbm = G.offensive.stage === POST_BATTLE_STAGE && !move_data.is_naval_present
            && get_map_data(nh).terrain > OCEAN
            && (get_map_data(nh).named && is_space_controlled(nh, R) || is_faction_ground_units(nh, R))
            && (!is_space_controlled(nh, 1 - G.active) || !is_controllable_hex(nh))
        var aa_landing = move_data.move_type & AMPH_MOVE
            && is_hex_asp_capable(nh)
            && (!move_data.is_naval_present || move_data.move_type & ORGANIC_ONLY)
            && !pbm
        var no_enemy_units = !is_faction_units(nh, 1 - R)
        var landing = port_transport && (no_enemy_units || G.offensive.stage === POST_BATTLE_STAGE) || aa_landing && no_enemy_units
        if ((naval_attack || landing && G.offensive.stage !== REACTION_STAGE || ground_pbm) && (!L.move_data.is_ground_present || !ground_move_denied(nh))) {
            map_set(result, nh, v)
        }
    })
    var burma_pbm = G.sid === BURMA_SCENARIO &&
        G.offensive.stage === POST_BATTLE_STAGE &&
        G.active === JP
    var kamikaze_only = burma_pbm && set_has(G.active_stack, KAMIKAZE) &&
        !map_get(G.offensive.paths, KAMIKAZE, [0, 0, 0]).includes(SINGAPORE, 2)
        && array_count(G.active_stack, u => pieces[u].class === "naval") === 1

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
        return array_count(G.active_stack, u => pieces[u].service !== "ch")
    }
    if (faction === JP && region === "India") {
        return array_count(G.active_stack, u => pieces[u].class === "ground")
    }
    if (G.active_stack.some(u => pieces[u].service === "ch")) {
        return !(region === "IChina" || region === "NIndia" || region === "Burma")
    }
    if (G.sid === SOUTH_PACIFIC_SCENARIO && faction === AP && hex === TRUK && G.turn === 3) {
        return true
    }
    if (G.sid === BURMA_SCENARIO && faction === AP && (region === "Siam" || region === "Indochina")) {
        return true
    }
    if (G.sid === BURMA_SCENARIO && hex === SINGAPORE) {
        return true
    }
    if (G.turn === 1 && faction === JP && (hex === SINGAPORE || hex === MANILA) && !L.move_data.is_naval_present) {
        return true
    }
}

function get_ground_move() {
    const location = L.move_data.location
    const move_data = L.move_data
    var max_distance = move_data.ground_move_distance
    var spent_distance = 0
    var path = map_get(G.offensive.paths, G.active_stack[0])
    if (path) {
        spent_distance = path[1]
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
            if (distance > max_distance || distance >= map_get(distance_map, nh, [100])[0]
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
    for (var nh of get_map_data(location).nh) {
        var move_cost = get_ground_move_cost(location, nh, G.active)
        if (move_cost <= max_distance - spent_distance && !ground_move_denied(nh)) {
            map_set(distance_map, nh, [spent_distance + move_cost, location, nh])
        }
    }
    return distance_map
}


function check_china_box_restricted() {
    var count = 0
    for (var i = 0; i < pieces.length; i++) {
        if (G.location[i] === CHINA_BOX) {
            count++
        }
    }
    return !!(count >= 2 || pieces[G.active_stack[0]].b29 && (G.location[B_29_1] === CHINA_BOX || G.location[B_29_2] === CHINA_BOX))

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
    return in_range_on_map(location, range, targets, G.active).length
}

function is_overstack(hex, unit, multip = 1) {
    var piece = pieces[unit]
    fill_overstack(piece.faction)
    var overstack = L.overstack[hex]
    var multiplier = ((G.location[unit] === hex || G.location[piece.pair] === hex) ? 0 : 1) * multip
    if (hex === CHINA_BOX && piece.b29) {
        var count = 0
        count += unit === B_29_1 ? G.location[B_29_2] === CHINA_BOX : 0
        count += unit === B_29_2 ? G.location[B_29_1] === CHINA_BOX : 0
        if (count) {
            return false
        }
    }

    if (piece.class === "hq") {
        return overstack & 1
    } else if (piece.class !== "naval") {
        return ((overstack + 2 * multiplier) % (1 << 7)) > 7
    } else {
        return ((overstack + 128 * multiplier) >> 7) > 6
    }
}

function fill_overstack(faction) {
    if (L.overstack && L.overstack[0] === faction) {
        return
    }
    L.overstack = []
    L.overstack[0] = faction
    for (var i = 0; i <= LAST_BOARD_HEX; i++) {
        L.overstack[i] = 0
    }
    L.overstack[CHINA_BOX] = 2
    for_each_unit((u, piece, location) => {
        if (piece.faction !== faction) {
            return
        }
        var pair_location = G.location[pieces[u].pair]
        if (location <= LAST_BOARD_HEX && piece.class === "hq") {
            L.overstack[location] |= 1
        } else if (location <= LAST_BOARD_HEX && piece.class === "naval") {
            L.overstack[location] += (1 << 7)
        } else if (location === CHINA_BOX || (location <= LAST_BOARD_HEX && (piece.type !== "lrb" || pair_location !== location))) {
            L.overstack[location] += (1 << 1)
        }
    })
}

function get_overstack_size(unit) {
    var piece = pieces[unit]
    if (piece.class === "hq") {
        return 1
    } else if (piece.class !== "naval") {
        return 2
    } else {
        return 1 << 7
    }
}

function init_overstack_check(ignore_movable, faction) {
    var positions = []
    if (ignore_movable) {
        G.offensive.active_units[faction].forEach(u => {
            var path = map_get(G.offensive.paths, u, [0])[0]
            var piece = pieces[u]
            var pbm_impossible = (path & STRAT_MOVE) || piece.class === "ground"
            if (!pbm_impossible) {
                map_set(positions, u, G.location[u])
                G.location[u] = NON_PLACED_BOX
            }
        })
    }
    fill_overstack(faction)
    var result = count_units_stacking(faction)
    map_for_each(positions, (u, l) => G.location[u] = l)
    return result
}


function count_units_stacking(faction) {
    L.allowed_units = []
    L.ground_units = []
    var overstack_naval = []
    var overstack_land = []
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        if ((L.overstack[i] % (1 << 7)) > 7) {
            set_add(overstack_land, i)
        }
        if ((L.overstack[i] >> 7) > 6) {
            set_add(overstack_naval, i)
        }
    }
    if (!overstack_naval.length && !overstack_land.length) {
        return true
    }
    var air_hex = []
    for_each_unit_on_map((u, piece, location) => {
        if (piece.faction !== faction) {
            return false
        }
        if (piece.class === "naval" && set_has(overstack_naval, location)) {
            set_add(L.allowed_units, u)
        } else if (piece.class === "ground" && set_has(overstack_land, location)) {
            set_add(L.ground_units, u)
        } else if (piece.class === "air" && set_has(overstack_land, location)) {
            set_add(L.allowed_units, u)
            set_add(air_hex, location)
        }
    })
    L.ground_units.forEach(u => {
        if (pieces[u].faction !== faction) {
            return false
        }
        if (!set_has(air_hex, G.location[u])) {
            set_add(L.allowed_units, u)
        }
    })
    if (L.allowed_units.length === 0) {
        return true
    }
    return false
}

function append_path(unit, path) {
    const prev_path = map_get(G.offensive.paths, unit)
    var full_path = [path[0], path[1]]
    if (prev_path) {
        full_path.push(...prev_path.slice(2))
    } else {
        full_path.push(G.location[unit])
    }
    full_path.push(...path.slice(3))
    return full_path
}

function move_units(units, path) {
    check_units()
    var full_path = append_path(units[0], path)
    units.forEach(u => {
        map_set(G.offensive.paths, u, full_path.slice())
    })
    var units_list = units_str(units)
    if (path.length === 3) {
        log(`${units_list} skipped move.`)
        return
    }
    var i = 2
    var zoi_cross_denied = path[0] & STRAT_MOVE || path[0] & AMPH_MOVE && !L.move_data.battle_range
    var zoi_cross_declared = path[0] & VIOLATE_ZOI
    var could_zoi_cross = !G.offensive.zoi_intelligence_modifier && G.offensive.stage === ATTACK_STAGE && pieces[units[0]].faction === G.offensive.attacker
    var could_zoi_change = G.active_stack.some(u => pieces[u].zoi_generator)
        || (path[0] & GROUND_MOVE) && G.active_stack.some(u => pieces[u].class === "ground")
    var supply_checked = CLIENT_SIDE_SUPPLY || zoi_cross_declared
    var faction = pieces[units[0]].faction
    var enemy_faction = 1 - pieces[units[0]].faction
    var point_to_point = []
    var last = null
    for (; i < path.length; i++) {
        var hex = path[i]
        if (last !== hex) {
            point_to_point.push(hex_get_log_str(hex))
        } else if (last) {
            point_to_point[point_to_point.length - 1] = "rebase " + hex_get_log_str(hex)
        }
        last = hex
    }
    var distance = 0
    var legs = 1
    i = 2
    var destination = path[path.length - 1]
    log(`${units_list} moved ${list_get_log_str(hex_get_log_str(destination) + ", " + (point_to_point.length - 1), point_to_point)}${get_move_type(path[0])}.`)
    if (could_zoi_cross && zoi_cross_declared) {
        zoi_crossed()
        could_zoi_cross = false
        supply_checked = true
    }
    for (; i < path.length; i++) {
        var hex = path[i]
        if (i > 2 && !(path[0] & GROUND_DISENGAGEMENT) && path[0] & GROUND_MOVE) {
            distance += get_ground_move_cost(path[i - 1], path[i], faction)
        } else if (i > 2 && path[i - 1] !== path[i]) {
            distance++
        }
        if (i > 2 && path[0] & AIR_MOVE && path[i - 1] === path[i]) {
            if (distance > L.move_data.extended_battle_range) {
                throw new Error("Bad move paths")
            }
            legs++
            distance = 0
        }
        if (i > 2 && broken_hex_edge(path[0], path[i - 1], path[i])) {
            throw new Error("Bad move paths")
        }
        if (could_zoi_cross && !supply_checked && (G.supply_cache[hex] & (POSSIBLE_ZOI << enemy_faction))) {
            units.forEach(u => set_location(u, hex, 1))
            check_supply()
            supply_checked = 1
        }
        if (could_zoi_cross && has_zoi(hex, enemy_faction)) {
            if (zoi_cross_denied && has_non_n_zoi(hex, enemy_faction)) {
                throw new Error("Bad move paths")
            }
            zoi_crossed()
            could_zoi_cross = 0
        } else if (supply_checked && could_zoi_change && !CLIENT_SIDE_SUPPLY) {
            supply_checked = 0
        }
        if (path[0] & GROUND_MOVE && !is_faction_units(hex, 1 - R)) {
            capture_hex(hex, faction)
        }
    }
    if (path[0] & AIR_MOVE && (distance > L.move_data.extended_battle_range || legs > L.move_data.air_move_legs)
        || path[0] & GROUND_DISENGAGEMENT && distance > 1
        || path[0] & GROUND_MOVE && !(path[0] & GROUND_DISENGAGEMENT) && distance > L.move_data.ground_move_distance
        || path[0] & NAVAL_MOVE && distance > L.move_data.naval_move_distance
    ) {
        throw new Error("Bad move path")
    }
    units.forEach(u => set_location(u, destination, true))
}

function zoi_crossed() {
    log("#IReaction zoi violated! -2 to reaction intelligence rolls")
    G.offensive.zoi_intelligence_modifier = 1
}

function broken_hex_edge(move_type, from, to) {
    if (from === to || from === CHINA_BOX || to === CHINA_BOX) {
        return false
    }
    var direction = get_map_data(from).nh.indexOf(to)
    if (direction < 0) {
        return 1
    }
    if (move_type & GROUND_MOVE) {
        return !(get_map_data(from).edges_int & GROUND << 5 * direction)
    }
    if (move_type & AIR_MOVE) {
        return !((get_map_data(from).edges_int >> 5 * direction) % 32)
    }
    return !(get_map_data(from).edges_int & WATER << 5 * direction)
}

function get_move_type(type) {
    if (G.offensive.stage !== ATTACK_STAGE) {
        return ""
    }
    if (type & STRAT_MOVE) {
        return " (Strategic move)"
    } else if (type & AIR_EXTENDED_MOVE) {
        return " (Extended range)"
    } else if (type & GROUND_DISENGAGEMENT) {
        return " (Disengagement)"
    } else if (type & BARGES_MOVE) {
        return " (Barges)"
    } else if (type & GROUND_MOVE) {
        return " (Ground move)"
    } else if (type & AMPH_MOVE) {
        return " (Amphibious Assault)"
    }
    return ""
}


function set_location(unit, location, no_logs) {
    var prev_location = G.location[unit]
    var prev_out = prev_location > LAST_BOARD_HEX && prev_location !== CHINA_BOX
    var current_on_map = location <= LAST_BOARD_HEX || location === CHINA_BOX
    if (!no_logs && prev_out && current_on_map) {
        log(`${piece_get_log_str(unit)} placed to ${hex_get_log_str(location)}.`)
    } else if (!no_logs && current_on_map) {
        log(`${piece_get_log_str(unit)} moved to ${hex_get_log_str(location)}.`)
    }
    var pair_location = G.location[pieces[unit].pair]
    var size = get_overstack_size(unit)
    if (L.overstack && (prev_location <= LAST_BOARD_HEX || prev_location === CHINA_BOX) && pair_location !== prev_location) {
        L.overstack[prev_location] -= size
    }
    if (L.overstack && (location <= LAST_BOARD_HEX || location === CHINA_BOX) && pair_location !== location) {
        L.overstack[location] += size
    }
    G.location[unit] = location
}
/* }}} */
/* {{{ js/common/scenario.js */
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
    adjust_vp(result, G.events[events.CHINA_STATUS.id] - 2, "China government status")
    if (G.events[events.CHINA_STATUS.id] > 5) {
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
    var india = array_count(nations.INDIA.keys, i => is_space_controlled(hex_to_int(i), JP))
    adjust_vp(result, india, "JP controlled hexes of Northern India", nations.INDIA.keys.map(i => hex_to_int(i)))
    //G. For India Unrest or Strikes, +1 Victory Point (awarded on the last game turn)
    var india_status = G.events[events.INDIA_STATUS.id]
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

function get_mandate_control() {
    if (is_space_controlled(RABAUL, JP) && is_space_controlled(GUADALCANAL, JP)) {
        return JP
    } else if (is_space_controlled(RABAUL, AP) && is_space_controlled(GUADALCANAL, AP)) {
        return AP
    }
    return G.surrender[nations.AUSTRALIAN_MANDATES.id] ? JP : AP
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
    adjust_vp(result, G.events[events.CHINA_STATUS.id], "China Government Front Status")
    if (G.events[events.CHINA_STATUS.id] > 5) {
        result.vp += 5
        result.text.push(`+5 VP - China surrendered`)
    }
    binary_vp(result, G.burma_road >= 1, 1, "The Burma Road is closed", `The Burma Road is open`)
    binary_vp(result, !check_supply_line(hex_to_int(3727), OAHU, AP), 5, "Townsville isolated from Oahu",
        "Townsville was not isolated", [hex_to_int(3727), OAHU])

    var india = array_count(nations.INDIA.keys, i => is_space_controlled(hex_to_int(i), JP))
    adjust_vp(result, india, "JP controlled hexes of Northern India", nations.INDIA.keys.map(i => hex_to_int(i)))
    var india_status = G.events[events.INDIA_STATUS.id]
    if (india_status > 0 && india_status <= 2) {
        result.vp += 1
        result.text.push(`+1 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else if (india_status > 0) {
        result.vp += 2
        result.text.push(`+2 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else {
        result.text.push(`0 VP - India ${nations.INDIA.statuses[india_status]}.`)
    }
    binary_vp(result, get_mandate_control() === JP, 1, "JP Control of Australian Mandates", `AP Control of Australian Mandates`)
    var new_guinea = 0
    nations.NEW_GUINEA.keys.map(k => hex_to_int(k)).forEach(h => {
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
    binary_vp(result, G.events[events.CHINA_STATUS.id] >= 5, 5, "China surrendered", `China did not surrender`)
    binary_vp(result, G.burma_road >= 1, 1, "The Burma Road is closed", `The Burma Road is open`)
    binary_vp(result, !check_supply_line(hex_to_int(3727), OAHU, AP), 5, "Townsville isolated from Oahu",
        "Townsville was not isolated", [hex_to_int(3727), OAHU])

    var india = array_count(nations.INDIA.keys, i => is_space_controlled(hex_to_int(i), JP))
    adjust_vp(result, india, "JP controlled hexes of Northern India", nations.INDIA.keys.map(i => hex_to_int(i)))
    var india_status = G.events[events.INDIA_STATUS.id]
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
    if (get_mandate_control() === JP) {
        mandate_diff = 3
    } else {
        mandate_diff = -3
    }
    adjust_vp(result, mandate_diff, "Control of Australian Mandates")
    if (mandate_diff >= 3) {
        var mandate_count = 0
        var mandate_hexes = []
        for_each_hex_in_range(RABAUL, 5, h => {
            if (get_map_data(h).region === "AMandates") {
                mandate_hexes.push(h)
            }
            if (is_space_controlled(h, AP) && get_map_data(h).region === "AMandates" && get_map_data(h).named) {
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
        var new_guinea = array_count(nations.NEW_GUINEA.keys.map(k => hex_to_int(k)),
            h => get_map_data(h).port && is_space_controlled(h, AP))
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
    adjust_vp(result, -(14 - get_jp_resources()), "AP controlled resource hexes",
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
    binary_vp(result, G.events[events.CHINA_STATUS.id] >= 5, 5, "China surrendered", `China did not surrender`)
    binary_vp(result, G.burma_road >= 1, 1, "The Burma Road is closed", `The Burma Road is open`)
    binary_vp(result, !check_supply_line(hex_to_int(3727), OAHU, AP), 5, "Townsville isolated from Oahu",
        "Townsville was not isolated", [hex_to_int(3727), OAHU])

    var india = array_count(nations.INDIA.keys, i => is_space_controlled(hex_to_int(i), JP))
    adjust_vp(result, india, "JP controlled hexes of Northern India", nations.INDIA.keys.map(i => hex_to_int(i)))
    var india_status = G.events[events.INDIA_STATUS.id]
    if (india_status > 0 && india_status <= 2) {
        result.vp += 1
        result.text.push(`+1 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else if (india_status > 0) {
        result.vp += 2
        result.text.push(`+2 VP - India ${nations.INDIA.statuses[india_status]}.`)
    } else {
        result.text.push(`0 VP - India ${nations.INDIA.statuses[india_status]}.`)
    }
    binary_vp(result, get_mandate_control() === JP, 1, "JP Control of the Australian Mandates",
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
    var pp = array_count(philipine_ports, h => is_space_controlled(h, AP) && (G.supply_cache[h] & AP_SUPPLIED_HEX))
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
        finish("Allies", "Japan surrenders by strategic bombing campaign.")
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

    if (G.events[events.CHINA_STATUS.id] === 5) {
        result.vp += 5
        result.text.push(`+5 VP - China surrendered.`)
    } else {
        adjust_vp(result, G.events[events.CHINA_STATUS.id] - 2, "China Government Front Status")
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
    if (!nations.AUSTRALIAN_MANDATES.ports.some(h => !is_space_controlled(hex_to_int(h), JP))) {
        result.vp += 3
        result.text.push(`+3 VP - JP control of Australian Mandates.`)
    } else if (!nations.AUSTRALIAN_MANDATES.ports.some(h => !is_space_controlled(hex_to_int(h), AP))) {
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
    var heb = array_count(NEW_HEBRIDES, h => is_space_controlled(h, JP) && get_map_data(h).port)
    binary_vp(result, heb, 1, "JP control of New Hebrides port",
        "No JP control of any New Hebrides port", NEW_HEBRIDES.filter(h => is_space_controlled(h, JP)))
    var aus = array_count(nations.AUSTRALIA.keys.map(k => hex_to_int(k)), h => is_space_controlled(h, JP) && get_map_data(h).port)
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
    basic_check_supply()
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
    } else if (!vp.won_side && vp.vp <= (G.sid !== BURMA_SCENARIO ? 5 : 4)) {
        vp.won_side = "Allies"
        vp.won_text = `Allied Tactical Victory`
    } else if (!vp.won_side && vp.vp <= (G.sid !== BURMA_SCENARIO ? 9 : 8)) {
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
            break
        }
    }
    if (no_capture) {
        change_political_will(-1, "no AP control of any hex originally controlled by the JP")
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
        finish("Japan", "Japanese Victory by Treaty Negotiations.")
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

/* }}} */
/* {{{ js/common/library.js */
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

// Array remove and insert (faster than splice)

function array_count(array, pred) {
    var n = 0
    for (var item of array)
        if (pred(item))
            ++n
    return n
}

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

/* }}} */

/* {{{ js/client/utils.js */
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

/* }}} */
/* {{{ js/client/layout.js */
const LAYOUT = {
    "mainmap" : {
        "box_delayed_reinf": [2363,1503,160,79],
        "box_air_unit_in_china": [852,407,121,75],
        "box_isr_jp": [986,132,45,64],
        "box_isr_us": [1048,132,45,64],
        "box_eliminated": [100,1280,45,45],
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
        "box_eliminated": [50,680,45,45],
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
        "box_eliminated": [306,29,45,45],
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

/* }}} */
/* {{{ js/client/init.js */
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
        tooltip: () => (G.events[events.BARGES.id] > 0) ? "ASP: Barges" : "ASP: No Barges",
        reduced: () => (G.events[events.BARGES.id] > 0),
        gray: () => jp_gray_amp(),
        value: () => G.asp[0][0],
    },
    {
        // TODO: more tooltips
        counter: counters.asp_jp,
        reduced: G => (G.events[events.BARGES.id] > 0),
        value: G => (jp_gray_amp()) ? Math.ceil(G.asp[0][0] / 2) : 0
    },
    {
        counter: counters.asp_ap,
        value: G => G.asp[1][0]
    },
    {
        counter: counters.divisions_china,
        // TODO -- this does nothing? -- always_show: G => 0,
        value: G => (G.sid === SOUTH_PACIFIC_SCENARIO) ? G.china_divisions : 0
    },
    {
        counter: counters.resource_jp,
        value: G => array_count(RESOURCE_HEX, h => is_space_controlled(h, JP))
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
        always_show: G => true,
        value: G => G.asp[0][1]
    },
    {
        counter: counters.aspu_ap,
        always_show: G => true,
        value: G => G.asp[1][1]
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
        tooltip: "-1PW (Progress of the War)",
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

    var mapwrap = document.getElementById("mapwrap")
    switch (scenario) {
        case "South Pacific": {
            nations.AUSTRALIAN_MANDATES.keys = nations.AUSTRALIAN_MANDATES.ports
            BOARD_ID = SOUTH_PACIFIC_SCENARIO
            map_layout = LAYOUT.southpac
            mapwrap.classList.add("southpac")
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
            mapwrap.classList.add("burma")
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
            mapwrap.classList.add("main")
            define_board("#map", 2550, 1650, [12, 12, 12, 12])
            map_info = MAIN_BOARD_INFO
            define_thing("road", events.JARHAT_ROAD.id).layout([578, 286, 60, 60], "jarhat control")
            define_thing("road", events.IMPHAL_ROAD.id).layout([579, 330, 60, 60], "imphal control")
            define_thing("road", events.LEDO_ROAD.id).layout([629, 300, 60, 60], "ledo control")
            define_thing("road", events.KWAI_RIVER_BRIDGE.id).layout([557, 501, 50, 95], "kwai control")
            update_map_size(2550, 1650)
        }
    }

    if (!SCENARIO_DATA[SID].original_control)
        SCENARIO_DATA[SID].original_control = static_view.original_control

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

    define_s_loc(ELIMINATED_BOX, map_layout.box_eliminated)
    define_s_loc(AP_REINF, map_layout.box_ap_reinf)
    define_s_loc(JP_REINF, map_layout.box_jp_reinf)
    if (BOARD_ID !== BURMA_SCENARIO) {
        define_s_loc(DELAYED_BOX, map_layout.box_delayed_reinf)
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
        battle.element.index = i
        battle.element.addEventListener("mousedown", evt => {
            if (event.button === 0) {
                send_query("combat", evt.target.index)
                if (world.focus === (evt.target.parentElement.thing))
                    evt.stopImmediatePropagation()
            }
        })
        battle.stackable()
        var landing = define_thing("landing", i).keyword("marker conflict landing top").animate()
        landing.element.innerText = ALPHABET[i]
        landing.element.index = i
        landing.element.addEventListener("mousedown", evt => {
            if (event.button === 0) {
                send_query("combat", evt.target.index)
                if (world.focus === (evt.target.parentElement.thing))
                    evt.stopImmediatePropagation()
            }
        })
        landing.stackable()
    }

    // Units
    for (let i = 1; i < pieces.length; ++i) {
        let piece = pieces[i]
        piece.element = define_piece("unit", i, (piece.faction ? "ap " : "jp ") + piece.counter)
            .tip_magic(focus_unit, blur_unit)
            .tooltip(format_unit_tooltip)
    }

    // Cards
    for (let i = 1; i < cards.length; ++i) {
        let card = cards[i]
        card.element = define_card("card", i, `${card.faction ? "ap" : "jp"} c${card.num}`)
        card.element.card = i
    }

    define_card("fo-card", JP, "jp c0").tooltip("Future Offensives Card")
    define_card("fo-card", AP, "ap c0").tooltip("Future Offensives Card")

    define_marker("fo-marker", JP, counters.future_offensive_jp).tooltip("Future Offensives Card")
    define_marker("fo-marker", AP, counters.future_offensive_ap).tooltip("Future Offensives Card")
    define_marker("fo-marker", 2, counters.future_offensive_inactive).tooltip("Future Offensives Card")

    for (let key in nations) {
        var nation = nations[key]
        if (nation.counter) {
            define_marker("nation-marker-turn", nation.id, nation.counter)
                .tooltip(nation.name + " Surrender")
            define_marker("nation-marker-map", nation.id, nation.counter)
                .tooltip(nation.name + " Surrender")
        }
    }

    // Markers
    // TODO: dynamic tooltip with current effect of track?

    define_marker("marker-isr", JP, counters.rivalry_jp)
        .tooltip(() => G.inter_service[JP] ? "Inter-Service Rivalry" : "Strategic Agreement")
    define_marker("marker-isr", AP, counters.rivalry_ap)
        .tooltip(() => G.inter_service[AP] ? "Inter-Service Rivalry" : "Strategic Agreement")

    define_marker("marker-pw", 0, counters.pw)
        .tooltip("U.S. Political Will")

    define_marker("marker-wie", 0, counters.wie)
        .tooltip("War in Europe")

    define_marker("marker-india", 0, counters.india_status)
        .tooltip(() => G.events[events.INDIA_STATUS.id] ? "India Surrender" : "India")

    define_marker("marker-burma", 0, counters.burma_road)
        .tooltip(() => G.events[events.HUMP.id] ? "Burma Road Hump" : "Burma Road No Hump")

    define_marker("marker-divisions", 0, counters.divisions_china)
        .tooltip("Japanese Divisions in China")

    define_marker("marker-china", 0, counters.china)
        .tooltip("China")

    TRACK_MARKERS.forEach(function (m, i) {
        define_marker("track-marker", i, m.counter).tooltip(m.tooltip)
    })

    TURN_MARKERS.forEach(function (m, i) {
        define_marker("turn-marker", i, m.counter).tooltip(m.tooltip)
    })

    for (var event of Object.values(events))
        if (event.counter)
            define_marker("event-marker", event.id, event.counter)
                .tooltip(event.name)
}

/* }}} */
/* {{{ js/client/actions.js */
/* LOCAL ACTION OVERRIDE */

var LOCAL_STATUS = 0
var LOCAL_STATE = null
var STORED_STATE = null

var L = {}
const P = {}

var client_original_oos = null
var client_original_br = -1

function measure_init() {
    world.measure = document.getElementById("measure")
}

function measure_update() {
    document.replaceChildren()
}

function check_supply() {
    if (!G.client_supply) {
        client_original_oos = G.oos
        client_original_br = G.burma_road
    }
    basic_check_supply()
    G.client_supply = 1
}

function menu_check_unit_supply() {
    LOCAL_STATUS = "check_unit_supply"
    LOCAL_STATE = {}
    P.check_unit_supply._begin()
    update_header()
    on_update()
}

function menu_check_distance() {
    LOCAL_STATUS = "check_distance"
    LOCAL_STATE = {}
    P.check_distance._begin()
    update_header()
    on_update()
}

function array_equals(a, b) {
    if (a.length !== b.length) {
        return false
    }
    for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false
        }
    }
    return true
}

function on_update_local_actions() {
    document.getElementById("measure").replaceChildren()

    if (G.actions && R >= 0 && !init_overstack_check(true, R)) {
        L.hexes = []
        L.allowed_units.forEach(u => set_add(L.hexes, G.location[u]))
        G.violations = L.hexes
        L.allowed_units = []
    }
    if (G.actions && G.actions.move) {
        L.allowed_hexes = []
        L.move_type = G.move_type
        update_move_hex()
        if (!G.actions.action_hex) {
            G.actions.action_hex = []
        }
        map_for_each(L.allowed_hexes, h => set_add(G.actions.action_hex, h))
        if (L.allowed_hexes) {
            delete G.actions.con_eliminate
        }
    }
    document.body.classList.remove("hex-clickable")
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
    if (G.actions && G.actions["unit"] && array_count(G.actions["unit"], u => G.location[u] === ELIMINATED_BOX)) {
        G.actions["to_unit"] = [G.actions["unit"].find(u => G.location[u] === ELIMINATED_BOX)]
    }
}


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
        var result = with_unmodified_supply(() => supply_query(u))
        this.show_supply(result)
    },
    action_hex(h) {
        if (h !== CHINA_BOX) {
            return
        }
        LOCAL_STATE.unit = 1
        var result = with_unmodified_supply(() => supply_query(h))
        this.show_supply(result)
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
        canvas_show()
        canvas_draw_supply(LOCAL_STATE.supply_data)
        var focused = []
        if (LOCAL_STATE.unit
            && LOCAL_STATE.unit !== CHINA_BOX
            && pieces[LOCAL_STATE.unit].class === "hq" && G.location[LOCAL_STATE.unit] < LAST_BOARD_HEX) {
            for_each_hex_in_range(G.location[LOCAL_STATE.unit], pieces[LOCAL_STATE.unit].cr, hex => set_add(focused, hex))
            focused = in_range_on_map(G.location[LOCAL_STATE.unit], pieces[LOCAL_STATE.unit].cr, focused, pieces[LOCAL_STATE.unit].faction)
        }
        for (var hex of ALL_BOARD_HEXES) {
            update_keyword("zoi_hex", hex, "yellow", set_has(focused, hex))
        }
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
        if (BOARD_ID === SOUTH_PACIFIC_SCENARIO && h === OAHU || BOARD_ID === BURMA_SCENARIO && h === SINGAPORE || h > LAST_BOARD_HEX) {
            return
        }
        while (LOCAL_STATE.points.includes(h)) {
            if (LOCAL_STATE.points.pop() === h) {
                this.redraw()
                return
            }
        }
        if (LOCAL_STATE.points.length) {
            for (var hex of find_shortest_path_as_the_eagle_flies(LOCAL_STATE.points[LOCAL_STATE.points.length - 1], h))
                LOCAL_STATE.points.push(hex)
        } else {
            LOCAL_STATE.points.push(h)
        }
        this.redraw()
    },
    redraw() {
        if (LOCAL_STATE.range && LOCAL_STATE.points.length > 1) {
            focus_hq_range = [LOCAL_STATE.points[0], LOCAL_STATE.points.length - 1]
        } else {
            focus_hq_range = [0, 0]
        }
        on_update()
    },
    on_update() {
        var measure = document.getElementById("measure")
        LOCAL_STATE.points.forEach((hex, index) => {
            var [x, y] = hex_center(hex)
            var e = document.createElement("div")
            e.className = "distance"
            e.style.top = y - 23 + "px"
            e.style.left = x - 23 + "px"
            e.innerHTML = `<big>${index}</big><small>${int_to_hex(hex)}</small>`
            measure.appendChild(e)
        })
    },
}

function find_shortest_path_as_the_eagle_flies(start, end) {
    var seen = [start, -1]
    var queue = [start]
    while (queue.length > 0) {
        var here = queue.shift()
        for (var next of get_edge_hexes(here)) {
            if (!map_has(seen, next) && set_has(ALL_BOARD_HEXES, next)) {
                queue.push(next)
                map_set(seen, next, here)
            }
        }
    }
    var path = []
    var here = end
    while (here !== start) {
        path.unshift(here)
        here = map_get(seen, here, start /* in case we don't find a path... */)
    }
    return path
}

var original_send_action = send_action

var send_action_with_oos = function (a, b, valid = false, extra) {
    var type = 0
    var payload = [0]
    if (client_original_br !== G.burma_road) {
        payload.push(G.burma_road)
        type += 1
    }
    check_supply()
    if (!array_equals(client_original_oos, G.oos)) {
        payload.push(...G.oos)
        type += G.oos.length + 1 << 1
    }
    if (extra) {
        payload.push(...extra)
    }
    payload[0] = type
    if (payload.length === 1 && type === 0) {
        payload = undefined
    }
    return original_send_action(a, b, payload)
}

function try_to_avoid_zoi(hex) {
    if (G.offensive.zoi_intelligence_modifier || G.offensive.stage !== ATTACK_STAGE) {
        return 0
    }
    L.avoid_zoi = true
    L.allowed_hexes = []
    update_move_hex()
    return map_get(L.allowed_hexes, hex)
}

function proxy_send_action(a, b) {
    if (G.actions && G.actions.move && a === "action_hex") {
        var path = map_get(L.allowed_hexes, b)
        if (path) {
            if (G.offensive.stage === ATTACK_STAGE && !G.offensive.zoi_intelligence_modifier) {
                var avoid_path = try_to_avoid_zoi(b)
                if (avoid_path) {
                    path = avoid_path
                }
                move_units(G.active_stack, path)
                if (G.offensive.zoi_intelligence_modifier) {
                    path[0] |= VIOLATE_ZOI
                }
            }
            return send_action_with_oos("move", null, true, path)
        } else if (G.actions.action_hex && set_has(G.actions.action_hex, b)) {
            return send_action_with_oos(a, b)
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
        return true
    }
    if (LOCAL_STATUS) {
        if (!P[LOCAL_STATUS][a]) {
            return true
        }
        var a = P[LOCAL_STATUS][a](b)
        update_header()
        return a
    } else {
        return send_action_with_oos(a, b)
    }
}

var send_action = proxy_send_action

function with_unmodified_supply(R) {
    var cache = object_copy(G.supply_cache)
    var result = R()
    G.supply_cache = cache
    return result
}

function supply_query(unit) {
    L = {supply: {}}

    var result = {unit, path: {}}
    var piece = pieces[unit]
    var location = G.location[unit]
    result.oos = set_has(G.oos, unit)
    if (unit === CHINA_BOX) {
        piece = pieces[ap_army("5_cn")]
        location = KUNMING
        result.oos = G.burma_road === 2
        result.hq = -1
    }
    clear_supply_cache(CLEAN_ALL_MASK)
    if (result.oos) {
        G.oos = []
        for (var i = 1; i < LAST_BOARD_HEX; i++) {
            G.supply_cache[i] = piece.faction ? (G.supply_cache[i] & ~JP_CONTROLLED) : (G.supply_cache[i] | JP_CONTROLLED)
        }
    }
    for_each_unit_on_map((i, p) => (!result.oos || p.faction === piece.faction) ? mark_unit(i, p) : null)
    place_virtual_units()
    check_infrastructure()
    for_each_unit_on_map((i, p) => (!result.oos || p.faction === piece.faction) ? set_zoi(i, p, [G.oos, G.oos]) : null)
    indian_zoi_hack((i, p) => (!result.oos || p.faction === piece.faction) ? set_zoi(i, p, [G.oos, G.oos]) : null)
    var hq = HQ_LIST.filter(hq => {
        return (piece.faction === pieces[hq].faction && G.location[hq] < LAST_BOARD_HEX)
    })
    mark_supply_ports_oversea(hq)
    L.supply_ports = L.supply
    L.supply = {}
    mark_supply_ports_overland(hq)
    L.supply_ports.queue.push(...L.supply.queue)
    L.supply_ports.retracing.push(...L.supply.retracing)
    L.supply = {}
    if (unit === CHINA_BOX) {
        trace_kunming(result)
        return result
    }
    if (piece.class === "hq") {
        result.hq = unit
    }
    HQ_LIST.forEach(hq => {
        var hq_piece = pieces[hq]
        if (result.hq || G.location[hq] >= LAST_BOARD_HEX || !(hq_piece.supply & piece.supply) || get_distance(location, G.location[hq]) > hq_piece.cr
            || set_has(G.oos, hq) || piece.faction !== hq_piece.faction) {
            return
        }
        mark_hexes_supplied_from([hq], l => l === location)
        if (G.supply_cache[location] & piece.supply) {
            result.hq = hq
            L.supply.queue = L.supply.queue.slice(0, L.supply.queue.indexOf(location) + 1)
            result.path.to_hq = retrace_supply_path(location)
            if (L.supply.port_queue) {
                L.supply.queue = L.supply.port_queue
                L.supply.retracing = L.supply.port_retracing
                result.path.to_port = retrace_supply_path(L.supply.queue[L.supply.queue.length - 1])
                result.supply_port = result.path.to_port[0]
                L.supply.queue = L.supply_ports.queue
                L.supply.retracing = L.supply_ports.retracing
                result.path.from_port = retrace_supply_path(result.supply_port)
            }
        }
    })
    L.supply = {}
    if (result.hq) {
        check_hq_in_supply(result.hq, pieces[result.hq], piece.faction === AP ? JOINT_SUPPLIED_HEX : JP_SUPPLIED_HEX)
        result.path.to_source = retrace_supply_path(L.supply.queue[L.supply.queue.length - 1])
    } else if (piece.faction === AP && (G.burma_road < 2 || result.oos)) {
        mark_hexes_supplied_kunming()
        if (G.supply_cache[location] & piece.supply) {
            result.path.to_hq = retrace_supply_path(location)
            trace_kunming(result)
        }
    }
    return result
}

function trace_kunming(result) {
    if (G.burma_road === 0 || result.oos) {
        if (result.oos) {
            var uncontrol = ~JP_CONTROLLED
            clear_supply_cache(uncontrol)
        }
        check_burma_road()
        result.path.to_source = retrace_supply_path(L.supply.queue[L.supply.queue.length - 1])
    } else {
        var airfields = [DACCA, JARHAT].filter(h => G.supply_cache[h] & AP_SUPPLY_AIRFIELD)
        if (airfields.length) {
            L.supply.queue = L.supply_ports.queue
            L.supply.retracing = L.supply_ports.retracing
            result.path.from_port = retrace_supply_path(airfields[0])
            result.path.to_port = [KUNMING, airfields[0]]
        }
    }
}

function retrace_supply_path(location) {
    var queue_i = L.supply.queue.length - 1
    while (L.supply.queue[queue_i] !== location && queue_i > 0 || L.supply.retracing[queue_i] === 0) {
        queue_i -= 1
    }
    var result = [L.supply.queue[queue_i]]
    var parent = L.supply.retracing[queue_i]
    while (queue_i > 0) {
        if (L.supply.queue[queue_i] === parent && L.supply.retracing[queue_i] !== 0) {
            result.push(parent)
            parent = L.supply.retracing[queue_i]
        }
        if (L.supply.retracing[queue_i] === L.supply.queue[queue_i] && parent === L.supply.queue[queue_i]) {
            return result
        }
        queue_i -= 1
    }
    result.push(L.supply.queue[0])
    return result
}

/* }}} */
/* {{{ js/client/dialog.js */
// EVENT CARD WINDOW

function draw_list() {
    var data = scenario_data()
    var hand = [[], []]
    for_each_card((id, card) => {
        var faction = card.faction
        if (data.has_card(id) && !set_has(G.removed[faction], id) && !set_has(G.discard[faction], id)) {
            hand[faction].push(id)
        }
    })
    return hand
}

function update_window_cards_jp() {
    return update_window_cards(JP)
}

function update_window_cards_ap() {
    return update_window_cards(AP)
}

function update_window_cards(R) {
    var text = []
    text.push("<dl>")

    text.push(`<dt>${ROLES[R]} Removed Cards (${G.removed[R].length})`)
    for (var c of G.removed[R])
        text.push("<dd>" + escape_text("C" + c))

    text.push(`<dt>${ROLES[R]} Discard Pile (${G.discard[R].length})`)
    for (var c of G.discard[R])
        text.push("<dd>" + escape_text("C" + c))

    var hand = draw_list()[R]
    text.push(`<dt>${ROLES[R]} Deck and Hand (${hand.length})`)
    for (var c of hand)
        text.push("<dd>" + escape_text("C" + c))

    text.push("</dl>")
    return text.join("")
}

// POLITICAL SITUATION WINDOW

function get_nation_by_id(object, id) {
    for (var key of Object.keys(object)) {
        if (object[key].id === id) {
            return object[key]
        }
    }
}

function get_nation_info(nation) {
    var id = nation.id
    var surrender = G.surrender[id]
    return {id, control: surrender ? JP : AP}
}

function get_china_info() {
    var id = nations.CHINA.id
    var surrender = G.events[events.CHINA_STATUS.id] >= 5
    var offensive = G.events[events.CHINA_OFFENSIVE.id]
    var mods = get_china_offensive_modifiers()
    var info = []
    var draw = draw_list()
    var count_jp = array_count(draw[JP], c => cards[c].china)
    var count_ap = array_count(draw[AP], c => cards[c].china)
    if (!surrender) {
        info.push(`Offensive ${(G.turn - offensive > 1) ? "" : "not "}possible${offensive > 0 ? ". Last launched turn " + offensive : ""}.`)
        mods.log.forEach(l => info.push(l))
        info.push(`Not played JP cards to China Government Front Status: ${count_jp}.`)
        info.push(`Not played AP cards to China Government Front Status: ${count_ap}.`)
    }
    return {
        id, control: surrender ? JP : AP, info,
        status: `(${G.events[events.CHINA_STATUS.id] + 1}/5) ${nations.CHINA.statuses[G.events[events.CHINA_STATUS.id]]}.`
    }
}

function get_india_info() {
    var nation = nations.INDIA
    var id = nation.id
    var name = nation.name
    var surrender = G.events[events.INDIA_STATUS.id] >= 5
    return {
        id, control: surrender ? JP : AP,
        status: `(${Math.min(G.events[events.INDIA_STATUS.id] + 1, 5)}/5) ${nations.INDIA.statuses[G.events[events.INDIA_STATUS.id]]}.`
    }
}

function get_japan_info() {
    var info = get_nation_info(nations.JAPAN)
    info.control = JP
    var resource_trace = check_japan_resource_trace()
    info.info = []
    var resorce_event = is_event_active(events.JAPAN_TRACE_RESOURCES)
    resorce_event = resorce_event > 0 ? G.turn - resorce_event + 1 : 0
    var resorce_info = ` (${resorce_event}/3 turns)`
    if (!resorce_event && resource_trace) {
        resorce_info = ""
    }
    info.info.push(`Could ${resource_trace ? "" : "NOT "}trace path to Resource hex${resorce_info}.`)
    var b29_in_range = get_distance(TOKYO, G.location[B_29_1]) <= 8 || get_distance(TOKYO, G.location[B_29_2]) <= 8
    var resource_count = get_jp_resources()
    var campaign = is_event_active(events.STRAT_BOMBING_CAMPAIGN) ? (G.turn - is_event_active(events.STRAT_BOMBING_CAMPAIGN) + 1) : 0
    if (CAMPAIGN_SCENARIOS.includes(G.sid)) {
        info.info.push(`Strategical Bombing Campaign: ${campaign}/4 turns.`)
        info.info.push(b29_in_range ? "B-29 is in range of Tokyo." : "B-29 is not in range of Tokyo.")
        info.info.push(`JP control ${resource_count} ${resource_count <= 1 ? "<=" : ">"} 1 resource spaces.`)
    }
    return info
}

function print_icon(cn, content = "") {
    return `<div class="dt-icon ${cn}">${content}</div>`
}

function print_flag(faction) {
    return print_icon(faction ? counters.control_us : counters.control_jp)
}

function update_window_pw() {
    var text = []
    text.push("<dl>")

    text.push(`<dt>US Political Will: ${G.political_will}`)
    text.push(print_icon(counters.pw))

    if (BOARD_ID === BURMA_SCENARIO) {
        print_nation_status(text, get_nation_info(nations.BURMA))
        print_nation_status(text, get_china_info())
        print_nation_status(text, get_india_info())
    } else {
        print_pow(text)
        print_naval_situation(text)

        if (G.sid !== SOUTH_PACIFIC_SCENARIO) {
            print_casualties(text)
            print_resources(text)
            print_occupation(text, events.ALASKA_OCCUPATION)
            print_occupation(text, events.HAWAII_OCCUPATION)
        }

        print_nation_status(text, get_china_info())
        print_nation_status(text, get_nation_info(nations.AUSTRALIAN_MANDATES))
        if (G.sid === SOUTH_PACIFIC_SCENARIO) {
            print_nation_status(text, get_nation_info(nations.NEW_GUINEA))
        } else {
            print_nation_status(text, get_india_info())

            // FLOAT SURRENDER
            print_nation_status(text, nations.PHILIPPINES)
            print_nation_status(text, nations.MALAYA)
            print_nation_status(text, nations.DEI)
            print_nation_status(text, nations.BURMA)
            print_nation_status(text, nations.AUSTRALIA)
            print_nation_status(text, nations.NEW_GUINEA)
            print_nation_status(text, nations.MARSHALL)

            print_nation_status(text, get_japan_info())
        }
    }

    text.push("</dl>")
    return text.join("")
}

function print_pow(text) {
    if (G.pow <= 0) {
        text.push(`<dt>No progress of war required for turn ${G.turn}.`)
        text.push(print_icon(counters.pow_target))
        return
    }

    var current_pow = G.capture.filter(h => is_space_controlled(h, AP))
    if (current_pow.length >= G.pow) {
        text.push("<dt>Progress of war (Completed)")
        text.push(print_icon(counters.pow_target))
    } else {
        text.push("<dt>Progress of war (-1 PW)")
        text.push(print_icon("gray " + counters.pow_target))
    }

    text.push(`<dd>(${current_pow.length}/${G.pow}) `)
    text.push(escape_text(current_pow.map(x=>"H"+x).join(", ")))
}

function print_naval_situation(text) {
    var counter = [[], []]
    for (var i = 1; i < pieces.length; i++) {
        var piece = pieces[i]
        if (piece.faction === AP && piece.service === "navy" && piece.class === "naval" && G.location[i] < LAST_BOARD_HEX) {
            counter[0].push(i)
            if (piece.br)
                counter[1].push(i)
        }
    }

    function print_ship_list(list, counter, label) {
        text.push("<dt>" + "Strategic naval situation")
        if (list.length > 0)
            text.push(print_icon(counter))
        else
            text.push(print_icon("gray " + counter))
        if (list.length === 0)
            text.push("<dd>" + label + " eliminated (-1 PW)")
        else {
            text.push(`<dd>${list.length} ${label}`)
            if (list.length <= 3)
                text.push("<dd>" + escape_text(list.map(p=>"P"+p).join(", ")))
        }
    }

    print_ship_list(counter[0], pieces[US_BB_UNIT].counter + " unit piece", "US naval units")
    if (G.sid !== SOUTH_PACIFIC_SCENARIO)
        print_ship_list(counter[1], pieces[US_CV_UNIT].counter + " unit piece", "US carrier units")
}

function print_casualties(text) {
    if (is_event_active(events.US_CASUALTIES)) {
        text.push("<dt>US Casualties triggered (-1PW)")
        text.push(print_icon(pieces[US_MARINE_UNIT].counter + " unit piece"))
    } else {
        text.push("<dt>US Casualties not triggered.")
        text.push(print_icon(pieces[US_MARINE_UNIT].counter + " unit piece gray"))
    }
}

function print_resources(text) {
    if (G.events[events.JAPAN_LACK_OF_RESOURCES.id]) {
        text.push("<dt>JP control 3 or fewer resource hexes -- completed (-3 PW)")
        text.push(print_icon(counters.resource_jp))
    } else {
        var value = array_count(RESOURCE_HEX, h => is_space_controlled(h, JP))
        text.push(`<dt>JP control ${value} > 3 resource hexes.`)
        text.push(print_icon("gray " + counters.resource_jp))
    }
}

function print_occupation(text, response) {
    var nation = get_nation_by_id(events, response.id)
    var status = G.events[response.id]

    text.push("<dt>" + nation.name)
    if (nation.pw)
        text.push(` (${nation.pw} PW)`)
    if (status)
        text.push(print_icon(nation.counter))
    else
        text.push(print_icon("gray " + nation.counter))

    if (status && G.turn - status >= nation.turns_to_control)
        return

    if (status)
        text.push(`<dd>Turns: ${G.turn - status + 1}/${nation.turns_to_control}`)

    if (nation.keys)
        text.push("<dd>Keys: " + escape_text(nation.keys.map(k=>"H"+hex_to_int(k)).join(", ")))

    if (response.info)
        for (var line of response.info)
            text.push("<dd>" + escape_text(line))
}

function print_nation_status(text, response) {
    var nation = get_nation_by_id(nations, response.id)

    text.push("<dt>" + nation.name)
    if (nation.pw) {
        if (response.control === JP)
            text.push(" (-" + nation.pw + " PW)")
        else
            text.push(" (+" + nation.pw + " PW)")
    }

    text.push(print_flag(response.control))

    if (response.status)
        text.push("<dd>" + response.status)

    var control = [[], []]
    if (nation.keys) {
        nation.keys.forEach(k => {
            if (is_space_controlled(hex_to_int(k), JP)) {
                control[JP].push(hex_to_int(k))
            } else {
                control[AP].push(hex_to_int(k))
            }
        })
        text.push("<dd>")
        text.push(`(${control[JP].length}/${control[AP].length})`)
        if (control[JP].length)
            text.push(" JP: " + escape_text(control[JP].map(x=>"H"+x).join(", ")))
        if (control[AP].length && control[JP].length)
            text.push(";")
        if (control[AP].length)
            text.push(" AP: " + escape_text(control[AP].map(x=>"H"+x).join(", ")))
    }

    if (response.info)
        for (var line of response.info)
            text.push("<dd>" + escape_text(line))
}

// VICTORY POINT WINDOW

function update_window_vp() {
    var text = []
    text.push("<dl>")

    var response = get_victory()

    text.push("<dt>" + response.won_text)
    if (response.won_side === "Japan")
        text.push(print_flag(JP))
    else
        text.push(print_flag(AP))
    text.push("<dd>Total VP: " + response.vp)

    for (var line of response.text)
        text.push("<dd>" + escape_text(line))

    text.push("<dt>Summary:")
    if (BOARD_ID == BURMA_SCENARIO) {
        text.push("<dd>2 VP or less - Allied Decisive Victory.")
        text.push("<dd>3-4 VP Allied Tactical Victory.")
        text.push("<dd>5-8 VP Japanese Tactical Victory.")
        text.push("<dd>9 VP Japanese Decisive Victory.")
    } else {
        text.push("<dd>2 VP or less - Allied Decisive Victory.")
        text.push("<dd>3-5 VP Allied Tactical Victory.")
        text.push("<dd>6-9 VP Japanese Tactical Victory.")
        text.push("<dd>10 VP Japanese Decisive Victory.")
    }

    text.push("</dl>")
    return text.join("")
}

// ELIMINATED UNITS WINDOW

function update_window_eliminated() {
    var text = []
    text.push("<dl>")

    var elim = [[], [], [], []]
    for (var i = 1; i < pieces.length; i++) {
        const piece = pieces[i]
        if (G.location[i] === ELIMINATED_BOX || G.location[i] === PERM_ELIMINATED) {
            if (piece.notreplaceable || G.location[i] === PERM_ELIMINATED) {
                elim[piece.faction * 2 + 1].push(i)
            } else {
                elim[piece.faction * 2 + 0].push(i)
            }
        }
    }

    function print_piece(p) {
        var piece = pieces[p]
        var className = "piece unit " + (piece.faction ? "ap " : "jp ") + piece.counter
        return `<div class="${className}"></div>`
    }

    function print_piece_list(label, pp) {
        if (pp.length > 0) {
            text.push("<dt>" + label)
            text.push("<dd class=piece-list>")
            text.push(pp.filter(p => pieces[p].counter.includes("big")).map(print_piece).join(""))
            text.push(pp.filter(p => !pieces[p].counter.includes("big")).map(print_piece).join(""))
        }
    }

    print_piece_list("Allied Replaceable:", elim[AP * 2])
    print_piece_list("Allied Permanently Eliminated:", elim[AP * 2 + 1])
    print_piece_list("Japanese Replaceable:", elim[JP * 2])
    print_piece_list("Japanese Permanently Eliminated:", elim[JP * 2 + 1])

    if (elim.every(a => a.length === 0))
        text.push("<dt>No eliminated units yet.")

    text.push("</dl>")
    return text.join("")
}

// BATTLE BOX

function update_combat_window(response) {
    var text = []

 //   console.log("COMBAT WINDOW", JSON.stringify(response))

    update_window_title("window_combat",
        escape_text(`Combat ${String.fromCharCode(65 + response.battle_name)}: H${response.battle_hex}`)
    )

    var atk = G.offensive.attacker
    var def = 1 - G.offensive.attacker

    var atk_flag = (atk === JP ? counters.control_jp : counters.control_us)
    var def_flag = (def === JP ? counters.control_jp : counters.control_us)

    text.push("<table><thead><tr><th>Attacker<th>Defender")
    text.push("<tr>")
    text.push(`<td><div style="margin:0 auto" class="${atk_flag}"></div>`)
    text.push(`<td><div style="margin:0 auto" class="${def_flag}"></div>`)
    text.push("<tbody>")

    if (response.air_naval[0].length || response.air_naval[1].length) {
        text.push("<tr><th colspan=2>Air / Naval<tr>")
        print_battle_box(text,
            atk,
            response.naval_cf[atk],
            response.naval_rm[atk],
            response.air_naval[atk],
            response.naval_log[atk]
        )
        print_battle_box(text,
            def,
            response.naval_cf[def],
            response.naval_rm[def],
            response.air_naval[def],
            response.naval_log[def]
        )
    }

    if (response.ground[0].length || response.ground[1].length) {
        text.push("<tr><th colspan=2>Ground<tr>")
        text.push("<tr>")
        print_battle_box(text,
            atk,
            response.ground_cf[atk],
            response.ground_rm[atk],
            response.ground[atk],
            response.ground_log[atk]
        )
        print_battle_box(text,
            def,
            response.ground_cf[def],
            response.ground_rm[def],
            response.ground[def],
            response.ground_log[def]
        )
    }

    text.push("</table>")
    update_window_content("window_combat", text.join(""))

    show_window("window_combat")
}

function print_battle_box(text, faction, cf, rm, units, log) {
    text.push("<td>")

    if (cf === 0) {
        text.push("-")
        return
    }

    text.push("<dl>")
    text.push("<dt>CF: " + cf)
    if (rm > 0)
        text.push("+" + rm + " DRM")

    units.sort((a, b) => G.location[a] - G.location[b])
    var prev = null
    for (var i of units) {
        var loc = G.location[i]
        if (loc !== prev) {
            prev = loc
            text.push("<dt>" + escape_text("H" + loc))
            text.push(`<dd class="piece-list">`)
        }
        var piece = pieces[i]
        var className = "piece unit " + piece.counter
        if (set_has(G.reduced, i) && !(piece.notreplaceable && piece.start_reduced))
            className += " reduced"
        text.push(`<div class="${className}"></div>`)
    }

    if (log.length > 0) {
        for (var line of log) {
            line = line.replace(/^[%&>]/g, "") // remove log formatting codes
            text.push("<dt>" + escape_text(line))
        }
    }

    text.push("</dl>")
}

/* }}} */
/* {{{ js/client/update.js */
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

function should_show_hex_control(i, all_control, vassal_control) {
    var hn = HEX_BY_NATION[i]
    var cont = is_space_controlled(i, JP) ? JP : AP
    if ((cont === AP && set_has(G.capture, i) && !all_control) || !(G.supply_cache[i] & HEX_CONTROLLABLE))
        return false
    var default_condition =
        (hn >= 0 && G.surrender[HEX_BY_NATION[i]] > 0 == cont) || (hn === -1 && cont === AP) || (hn < -1 && cont === JP)
    var vassal_condition = set_has(JP_BOUNDARY_HEX, i) + 0 === cont
    if (
        map_info.hex_check(i) &&
        cont !== null &&
        (all_control || (!is_faction_units(i, AP) && !is_faction_units(i, JP))) &&
        (all_control || (!vassal_control && default_condition) || (vassal_control && vassal_condition))
    )
        return true
    return false
}

function update_hand(side) {
    var hand = G.hand[side]
    var fo_card, fo_card_id

    if (G.future_offensive[side] > 0) {
        fo_card = "card"
        fo_card_id = G.future_offensive[side]
        populate("hand", side, "card", G.future_offensive[side])
    } else if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        fo_card = "fo-card"
        fo_card_id = side
        populate("hand", side, "fo-card", side)
    }

    if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] === G.turn) {
        populate(fo_card, fo_card_id, "fo-marker", 2)
    } else if (G.events[events.FUTURE_OFFENSIVE_JP.id + side] > 0) {
        if (side === AP)
            populate(fo_card, fo_card_id, "fo-marker", AP)
        else
            populate(fo_card, fo_card_id, "fo-marker", JP)
    }

    if (Array.isArray(G.hand[side])) {
        if (side === AP)
            populate_with_list("hand", side, "card", G.hand[side], "card ap c0")
        else
            populate_with_list("hand", side, "card", G.hand[side], "card jp c0")
    } else {
        if (side === AP)
            populate_generic("hand", side, "card ap c0", G.hand[side])
        else
            populate_generic("hand", side, "card jp c0", G.hand[side])
    }
}

function update_unit(u, location) {
    var piece = pieces[u]
    var one_step = piece.notreplaceable && piece.start_reduced
    var first_turn = Math.min(map_info.turn_a, map_info.turn_b)
    var last_turn = Math.max(map_info.turn_a, map_info.turn_b)

    if (location > TURN_BOX) {
        var turn = location - TURN_BOX
        if (turn < first_turn || turn > last_turn)
            populate("s-loc", ELIMINATED_BOX, "unit", u)
        else
            populate("turn", turn, "unit", u)

        update_keyword("unit", u, set_has(G.reduced, u) && !one_step)

        return
    }

    if (location === ELIMINATED_BOX && (!pieces[u].notreplaceable || is_action("unit", u)) || (location !== ELIMINATED_BOX && location >= 0 && location <= LAST_BOARD_HEX)) {
        populate("s-loc", location, "unit", u)

        update_keyword("unit", u, "reduced",
            (set_has(G.reduced, u) && !one_step) || location === ELIMINATED_BOX
            || pieces[u].class === "hq" && G.inter_service[pieces[u].faction]
        )

        if (set_has(G.offensive.active_units[piece.faction], u))
            update_keyword("unit", u, "activated")

        if (G.active_stack.includes(u)) {
            update_keyword("unit", u, "selected")
            update_rotation("unit", u, 22.5)
        }

        var battle = map_get(G.offensive.committed, u)
        var battle_ix = battle ? G.offensive.battle_names.indexOf(battle) : 0
        var path = map_get(G.offensive.paths, u)
        if (path) path = path[0]

        if (battle && set_has(G.offensive.battle_hexes, battle)) {
            populate_generic("unit", u, "marker conflict battle alpha" + battle_ix)
        } else if (battle && set_has(G.offensive.landing_hexes, battle)) {
            populate_generic("unit", u, "marker conflict landing alpha" + battle_ix)
        } else if (battle && (piece.parenthetical || piece.class === "ground")) {
            populate_generic("unit", u, "marker conflict battle gray alpha" + battle_ix)
        } else if (piece.organic && !(path & STRAT_MOVE) && G.offensive.organic.includes(u)) {
            populate_generic("unit", u, counters.organic_small)
        } else if (set_has(G.oos, u)) {
            populate_generic("unit", u, counters.oos_small)
        } else {
            for (var m of UNIT_MOVEMENT_MARKERS) {
                if (m.condition(u, piece, path)) {
                    populate_generic("unit", u, m.counter)
                    break // only first one that matches
                }
            }
        }
    }
}

function update_role_info(who) {
    var hand_size = Array.isArray(G.hand[who]) ? G.hand[who].length : G.hand[who]
    var fo = G.events[events.FUTURE_OFFENSIVE_JP.id + who]
    var text = `${hand_size} cards`
    if (fo && fo < G.turn)
        text += " + FO"
    if (G.passes[who])
        text += `, ${G.passes[who]} passes`
    roles[who].stat.textContent = escape_text(text)
}

function on_update() {
    begin_update()

    L = {} // for shared rules/play code and client-side states

    // CLIENT-SIDE SUPPLY CHECK
    check_supply()

    // LOCAL ACTIONS (PART 1)
    on_update_local_actions()

    update_role_info(JP)
    update_role_info(AP)

    // TODO: why are we mutating G here?
    map_for_each(G.offensive.damaged, (u, s) => {
        if (s > 2) {
            G.location[u] = ELIMINATED_BOX
        } else {
            set_add(G.reduced, u)
        }
    })
    if (G.pow <= 0) {
        G.capture = []
    }

    var supplied_hex = []
    for (var i = 1; i < pieces.length; ++i) {
        var loc = G.location[i]
        if (loc > 0) {
            if (!set_has(G.oos, i)) {
                set_add(supplied_hex, G.location[i])
            }
        }
    }
    // ^^^^

    // OVERLAY PATHS
    if (!get_preference("nopath", false) && G.offensive.paths.length > 0) {
        canvas_show()
        canvas_draw_paths()
    } else {
        canvas_hide()
    }

    // CONTROL MARKERS
    var all_control = document.body.classList.contains("hide-pieces")
    var vassal_control = get_preference("fullcontrol", false)
    for (var i = 0; i < LAST_BOARD_HEX; i++) {
        if (should_show_hex_control(i, all_control, vassal_control)) {
            if (vassal_control)
                populate_generic("s-loc", i, get_control_marker(i) + " transparent")
            else
                populate_generic("s-loc", i, get_control_marker(i))
        }
    }

    // ELIMINATED GARRISONS
    for (var h of G.garr_elim)
        if (is_space_controlled(h, JP))
            populate_generic("s-loc", h, counters.no_garrison)

    // GARRISONS
    map_for_each(G.garrison, (h, count) => {
        if (count === 0)
            populate_generic("s-loc", h, "unit " + pieces[JP_GARRISON_JP].counter, 1)
        else
            populate_generic("s-loc", h, "unit " + pieces[JP_GARRISON_CN[0]].counter, count)
    })

    // ROADS
    var base_road_counters = get_preference("noroad", false)
    for (var event of ROAD_EVENTS) {
        if (map_info.hex_check(event.keys[0])) {
            var is_road_event_active = G.events[event.id]
            update_show("road", event.id, !is_road_event_active && !base_road_counters)
            if (event === events.KWAI_RIVER_BRIDGE && is_road_event_active)
                populate("s-loc", event.keys[0], "event-marker", event.id)
            if (event !== events.KWAI_RIVER_BRIDGE && !is_road_event_active && base_road_counters)
                populate("s-loc", event.keys[0], "event-marker", event.id)
        }
    }

    // TOKYO EXPRESS
    if (G.events[events.TOKYO_EXPRESS.id] > 0) {
        populate("s-loc", G.events[events.TOKYO_EXPRESS.id], "event-marker", events.TOKYO_EXPRESS.id)
    }

    // POWs
    if (G.pow > 0) {
        for (var h of G.capture)
            if (is_space_controlled(h, AP))
                populate_generic("s-loc", h, counters.pow)
    }

    // UNITS
    for (var i = 1; i < pieces.length; ++i) {
        var loc = G.location[i]
        if (loc > 0)
            update_unit(i, G.location[i])
    }

    if (G.unselect)
        for (var u of G.unselect)
            update_keyword("unit", u, "unselect")

    // OUT OF SUPPLY MARKERS
    var oos_hex_set = []
    for (i = 0; i < G.oos.length; i++) {
        var hex = G.location[G.oos[i]]
        if (set_has(ALL_BOARD_HEXES, hex) && !set_has(oos_hex_set, hex) && !set_has(supplied_hex, hex)) {
            populate("s-loc", hex, "top", hex)
            if (hex < LAST_BOARD_HEX && HQ_LIST.some(hq =>
                G.location[hq] < LAST_BOARD_HEX &&
                pieces[hq].faction === pieces[G.oos[i]].faction &&
                in_range_on_map(G.location[hq], pieces[hq].cr, [hex], pieces[hq].faction).length
            ))
                update_keyword("top", hex, "oos")
            else
                update_keyword("top", hex, "isolated")
            set_add(oos_hex_set, hex)
        }
    }

    // ZONE OF INFLUENCE
    if (!get_preference("hidezoi", false)) {
        for (var hex of ALL_BOARD_HEXES) {
            const zoi_state = G.supply_cache[hex]
            update_keyword("zoi_hex", hex, "lrb", (zoi_state & 7) === 3)
            update_keyword("zoi_hex", hex, "contested", (zoi_state & 3) === 3)
            update_keyword("zoi_hex", hex, "jp", (zoi_state & 1) === 1)
            update_keyword("zoi_hex", hex, "ap", (zoi_state & 2) === 2)
        }
    }

    // HQ RANGE
    // TODO: focused has invalid hexes, so need to filter by ALL_BOARD_HEXES
    if (focus_hq_range[0] && focus_hq && G.location[focus_hq] < LAST_BOARD_HEX) {
        mark_activation_zone(focus_hq)
        for_each_hex_in_range(G.location[focus_hq], pieces[focus_hq].cr, hex => {
            if (G.supply_cache[hex] & HEX_TEMP_FLAG3)
                if (set_has(ALL_BOARD_HEXES, hex))
                    update_keyword("zoi_hex", hex, "range")
        })
    } else {
        var focused = []
        for_each_hex_in_range(focus_hq_range[0], focus_hq_range[1], hex => set_add(focused, hex))
        focused = in_range_on_map(focus_hq_range[0], focus_hq_range[1], focused, AP)
        for (var hex of focused)
            if (set_has(ALL_BOARD_HEXES, hex))
                update_keyword("zoi_hex", hex, "range")
    }

    // STACKING VIOLATIONS
    if (G.violations.length > 0) {
        for (var h of G.violations)
            update_keyword("action_hex", h, "violation")
        update_text_html("violations", 0, "<b>STACKING VIOLATIONS:</B>\n" + escape_text(G.violations.map(h => "H" + h).join(", ")) + ".")
    }

    // AMPHIBIOUS HEXES
    for (var u of G.offensive.active_units[G.offensive.attacker]) {
        var piece = pieces[u]
        var location = G.location[u]
        if (
            G.offensive.stage !== POST_BATTLE_STAGE &&
            piece.class === "ground" &&
            location < LAST_BOARD_HEX &&
            (!get_map_data(location).port || !is_space_controlled(location, G.offensive.attacker)) &&
            map_get(G.offensive.paths, u, [0])[0] & AMPH_MOVE
        )
            update_keyword("action_hex", location, "amph")
    }

    // CARDS
    update_hand(JP)
    update_hand(AP)
    for (let c of G.offensive.active_cards)
        populate("hand", 2, "card", c)
    if (V.selected_card)
        update_keyword("card", V.selected_card, "selected")

    for (var h of G.offensive.battle_hexes)
        populate("s-loc", h, "battle", G.offensive.battle_names.indexOf(h))

    for (var h of G.offensive.landing_hexes)
        if (get_map_data(h).named && is_space_controlled(h, 1 - G.offensive.attacker) && has_zoi(h, 1 - G.offensive.attacker))
            populate("s-loc", h, "landing", G.offensive.battle_names.indexOf(h))

    // MISC MARKERS

    populate("track-isr", JP, "marker-isr", JP)
    populate("track-isr", AP, "marker-isr", AP)
    update_keyword("marker-isr", JP, "reduced", !G.inter_service[JP])
    update_keyword("marker-isr", AP, "reduced", !G.inter_service[AP])

    populate("track-pw", G.political_will, "marker-pw", 0)
    populate("track-wie", G.wie, "marker-wie", 0)

    populate("track-china", Math.min(5, G.events[events.CHINA_STATUS.id]), "marker-china", 0)
    if (G.sid !== SOUTH_PACIFIC_SCENARIO) {
        populate("track-india", Math.max(0, 4 - G.events[events.INDIA_STATUS.id]), "marker-india", 0)
        update_keyword("marker-india", 0, "reduced", G.events[events.INDIA_STATUS.id] >= 5)
        populate("track-burma", 2 - G.burma_road, "marker-burma", 0)
        update_keyword("marker-burma", 0, "reduced", G.events[events.HUMP.id])
        populate("track-divisions", G.china_divisions + 1, "marker-divisions", 0)
    }

    // TURN MARKERS

    var first_turn = Math.min(map_info.turn_a, map_info.turn_b)
    var last_turn = Math.max(map_info.turn_a, map_info.turn_b)

    for (var key in nations) {
        var nation = nations[key]
        if (nation.counter) {
            var hex = nation.counter_hex
            var value = G.surrender[nation.id]
            if (nation.id === nations.MARSHALL.id)
                value = -value
            if (value >= first_turn && value <= last_turn)
                populate("turn", value, "nation-marker-turn", nation.id)
            if (hex && value && !vassal_control && map_info.hex_check(hex_to_int(hex)))
                populate("s-loc", hex_to_int(hex), "nation-marker-map", nation.id)
        }
    }

    for (i = 0; i < TURN_MARKERS.length; i++) {
        const marker = TURN_MARKERS[i]
        var v = marker.value(G)
        if (v >= first_turn && v <= last_turn) {
            populate("turn", v, "turn-marker", i)
            if (marker.reduced?.(G))
                update_keyword("turn-marker", i, "reduced")
        }
    }

    // TRACK MARKERS

    for (i = 0; i < TRACK_MARKERS.length; i++) {
        const marker = TRACK_MARKERS[i]
        var value = marker.value(G)
        if (value > 0 || marker.always_show?.(G)) {
            populate("track", value % 10, "track-marker", i)
            if (value > 9)
                update_keyword("track-marker", i, "reduced")
            if (marker.gray?.(G))
                update_keyword("track-marker", i, "gray")
        }
    }

    // LOCAL ACTIONS (PART 2)

    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].on_update()
    }

    // BUTTONS

    action_button("play_card", "Choose card")
    action_button("to_unit", "Rebuild unit")
    action_button("roll", "Roll")

    action_button("awaiting", "Prompt")
    action_button("continue", "Continue")
    action_button("bonus", "Use Bonus")
    action_button("event", "Play Event")
    action_button("ops", "Play for Operations")
    action_button("hold", "Hold")
    action_button("advanced_move", "More options")
    action_button("no_move", "No move")
    action_button("eliminate", "Eliminate")
    action_button("con_eliminate", "Eliminate")
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

    action_button("confirm", "Confirm")
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

    // trigger log expansion if snapshot view goes beyond the start
    show_full_log_if_needed()
}

/* }}} */
/* {{{ js/client/canvas.js */
const CANVAS = document.getElementById("canvas")
const CANVAS_CTX = document.getElementById("canvas").getContext("2d")

const SUPPLY_COLORS = {
    to_port: "green",
    from_port: "red",
    to_hq: "blue",
    to_source: "yellow",
}

function canvas_show() {
    CANVAS.hidden = false
}

function canvas_hide() {
    CANVAS.hidden = true
}

function canvas_init(scenario) {
    let sizeX, sizeY
    switch (scenario) {
    case "South Pacific":
    case "Burma: The Forgotten War, 1943-1944":
        sizeX = 1275
        sizeY = 825
        break
    default:
        sizeX = 2550
        sizeY = 1650
        break
    }

    CANVAS.style.width = sizeX + "px"
    CANVAS.style.height = sizeY + "px"

    var scale = window.devicePixelRatio
    CANVAS.width = sizeX * scale
    CANVAS.height = sizeY * scale

    CANVAS_CTX.scale(scale, scale)
}

function canvas_clear_paths() {
    CANVAS_CTX.clearRect(0, 0, CANVAS.width, CANVAS.height)
}

function canvas_draw_paths() {
    canvas_clear_paths()
    map_for_each(G.offensive.paths, (k, v) => {
        if (G.location[k] > LAST_BOARD_HEX && G.location[k] !== CHINA_BOX) {
            return
        }
        var start = hex_center(v[2])
        var finish
        var line_color = pieces[k].faction ? "blue" : "firebrick"
        var spot_color = pieces[k].faction ? "deepskyblue" : "tomato"
        var d = pieces[k].faction ? -2 : 2
        CANVAS_CTX.strokeStyle = line_color
        CANVAS_CTX.fillStyle = spot_color
        CANVAS_CTX.lineWidth = 3
        CANVAS_CTX.lineCap = "round"

        // lines
        for (var j = 3; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            CANVAS_CTX.beginPath()
            if (G.location[k] === v[j - 1] && j === v.length - 1) {
                CANVAS_CTX.setLineDash([5, 3])
            }
            CANVAS_CTX.moveTo(start[0], start[1] + d)
            CANVAS_CTX.lineTo(finish[0], finish[1] + d)
            CANVAS_CTX.stroke()
            CANVAS_CTX.setLineDash([])
        }

        // spots
        for (var j = 3; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            if (v[j - 1] === v[j] || j === 3) {
                CANVAS_CTX.beginPath()
                CANVAS_CTX.arc(start[0], start[1] + d, 6, 0, 2 * Math.PI)
                CANVAS_CTX.fill()
                CANVAS_CTX.stroke()
            }
        }
        if (finish) {
            CANVAS_CTX.beginPath()
            CANVAS_CTX.rect(finish[0] - 6, finish[1] - 6 + d, 12, 12)
            CANVAS_CTX.fill()
            CANVAS_CTX.stroke()
        }
    })
}

function canvas_draw_supply(supply_data) {
    canvas_clear_paths()
    Object.keys(supply_data.path).forEach((type, index) => {
        var v = supply_data.path[type]
        var start = hex_center(v[0])
        var finish
        var color = SUPPLY_COLORS[type]
        var d = index * 2 - 3
        CANVAS_CTX.strokeStyle = color
        CANVAS_CTX.fillStyle = color
        CANVAS_CTX.lineWidth = 3
        for (var j = 1; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            CANVAS_CTX.beginPath()
            if (supply_data.oos) {
                CANVAS_CTX.setLineDash([5, 3])
            }
            CANVAS_CTX.moveTo(start[0], start[1] + d)
            CANVAS_CTX.lineTo(finish[0], finish[1] + d)
            CANVAS_CTX.stroke()
            CANVAS_CTX.setLineDash([])
        }
        if (finish) {
            CANVAS_CTX.beginPath()
            CANVAS_CTX.fillRect(finish[0] - 4, finish[1] - 4 + d, 8, 8)
            CANVAS_CTX.stroke()
        }
    })
}

/* }}} */
/* {{{ js/client/text.js */
/* UNIT TEXT TOOLTIP */

const DIGIT_SUPERSCRIPT = [
    "\u2070",
    "\u2071",
    "\xb2",
    "\xb3",
    "\u2074",
    "\u2075",
    "\u2076",
    "\u2077",
    "\u2078",
    "\u2079",
]

function format_unit_tooltip(u) {
    var p = pieces[u]
    var tip = ""

    switch (p.class) {
    case "hq":
        return `HQ ${p.cr} [${p.cm}] (${p.name.replace(" HQ", "")})`
    case "ground":
        if (p.size === 4) tip += "XXXX"
        else if (p.size === 3) tip += "XXX"
        else if (p.size === 1) tip += "X"
        else tip += "Ground"
        break
    case "air":
        tip += "Air"
        break
    case "naval":
        tip += p.type.toUpperCase()
        break
    }
    tip += ` ${p.cf}`
    if (p.rcf!==p.cf)
        tip += `(${p.rcf})`
    tip += `-${p.lf}`
    if (p.br)
        tip += `-${p.br}`
    if (p.ebr)
        tip += " " + DIGIT_SUPERSCRIPT[p.ebr]

    tip += ` (${p.name})`

    return tip
}

/* HEX TOOLTIP */

const TERRAIN_NAME = [
    "ocean",
    "open",
    "jungle",
    "mixed",
    "mountain",
    "atoll",
]

function format_hex_tooltip(h) {
    var hex = int_to_hex(h)
    var tip = hex + ""
    var info = map.find(e => e.id === hex)
    if (info) {
        if (info.name) tip += " " + info.name
        if (info.region) tip += " (" + info.region + ")"
        var props = []
        if (info.city === CITY) props.push("city")
        if (info.city === JAPANESE_CITY) props.push("Japanese city")
        if (info.city === CHINESE_CITY) props.push("Chinese city")
        if (info.airfield) props.push("airfield")
        if (info.port) props.push("port")
        if (info.island) props.push("island")
        if (info.resource) props.push("resource")
        if (info.terrain) props.push(TERRAIN_NAME[info.terrain])
        if (props.length > 0) tip += " - " + props.join(", ")
    }
    return tip
}

/* UNIT ZOOMED TOOLTIP & HQ RANGE DISPLAY TOGGLE */

var focus_hq = 0
var focus_hq_range = [0, 0]
var focus_want_hq = 0
var focus_want_hq_range = [0, 0]
var focus_timer = 0

function request_range_update() {
    console.log("HQ range trigger", Date.now())
    if (focus_timer) {
        console.log("    delay existing timer")
        clearTimeout(focus_timer)
        focus_timer = 0
    }
    focus_timer = setTimeout(() => {
        focus_timer = 0
        if (focus_hq !== focus_want_hq) {
            focus_hq = focus_want_hq
            focus_hq_range = focus_want_hq_range
            console.log("HQ range set", focus_hq)
            on_update()
        } else {
            console.log("HQ range canceled")
        }
    }, 500)
}

function focus_unit(id) {
    const piece = pieces[id]

    // Show BOTH sides of the marker
    var html = `<div class="unit-tip-list"><div class="piece unit ${piece.counter}"></div>`
    if (piece.class !== "hq" && (!piece.start_reduced || !piece.notreplaceable))
        html += `<div class="piece unit ${piece.counter} reduced"></div>`
    html += "</div>"
    world.tip.className = "unit-tip"
    world.tip.innerHTML = html

    // show HQ range
    if (piece.class === "hq" && G.location[id] < LAST_BOARD_HEX && focus_hq !== id) {
        focus_want_hq = id
        if (id === HQ_CENTRAL_PACIFIC && G.sid === SOUTH_PACIFIC_SCENARIO)
            focus_want_hq_range = [ hex_to_int(5226), 5 ]
        else
            focus_want_hq_range = [ G.location[id], pieces[id].cr ]
        request_range_update()
    }
}

function blur_unit(id) {
    // hide HQ range
    focus_want_hq = 0
    if (focus_want_hq_range[0]) {
        focus_want_hq_range = [0, 0]
        request_range_update()
    }
}

/* LOG & PROMT TEXT FORMATTING */

const CARD_CLASSES = cards.map(c => `card ${c?.faction ? "ap" : "jp"} c${c?.num}`)
const CARD_NAMES = cards.map(c => c?.name)

const UNIT_NAMES = pieces.map(p => p?.name)

const HEX_NAMES = []
;(function(){
    for (let i = 0; i <= TUNNEL_BOX; ++i) {
        if (i === CHINA_BOX) {
            HEX_NAMES[i] = "China Box"
        } else if (i > LAST_BOARD_HEX) {
            HEX_NAMES[i] = "offboard"
        } else {
            let hex = int_to_hex(i)
            let info = map.find(e => e.id === hex)
            if (info && info.name)
                HEX_NAMES[i] = `${info.name} (${hex})`
            else
                HEX_NAMES[i] = String(hex)
        }
    }
})()

const ICONS = {
    B0: '<span class="icon xdice B d0"></span>',
    B1: '<span class="icon xdice B d1"></span>',
    B2: '<span class="icon xdice B d2"></span>',
    B3: '<span class="icon xdice B d3"></span>',
    B4: '<span class="icon xdice B d4"></span>',
    B5: '<span class="icon xdice B d5"></span>',
    B6: '<span class="icon xdice B d6"></span>',
    B7: '<span class="icon xdice B d7"></span>',
    B8: '<span class="icon xdice B d8"></span>',
    B9: '<span class="icon xdice B d9"></span>',
    R0: '<span class="icon xdice R d0"></span>',
    R1: '<span class="icon xdice R d1"></span>',
    R2: '<span class="icon xdice R d2"></span>',
    R3: '<span class="icon xdice R d3"></span>',
    R4: '<span class="icon xdice R d4"></span>',
    R5: '<span class="icon xdice R d5"></span>',
    R6: '<span class="icon xdice R d6"></span>',
    R7: '<span class="icon xdice R d7"></span>',
    R8: '<span class="icon xdice R d8"></span>',
    R9: '<span class="icon xdice R d9"></span>',
    W0: '<span class="dice white d0"></span>',
    W1: '<span class="dice white d1"></span>',
    W2: '<span class="dice white d2"></span>',
    W3: '<span class="dice white d3"></span>',
    W4: '<span class="dice white d4"></span>',
    W5: '<span class="dice white d5"></span>',
    W6: '<span class="dice white d6"></span>',
}

function escape_text(text) {
    text = text.replace(/\^(.*?)\|(.*?)\^/g, escape_list)

    text = escape_icon(text, /\b[BRW]\d\b/g, ICONS)

    text = escape_tip_class(text, /C(\d+)/g, "tip", CARD_CLASSES, CARD_NAMES)
    text = escape_tip_light(text, /H(\d+)/g, "tip", "action_hex", HEX_NAMES)
    text = escape_tip_light(text, /P(\d+)/g, "tip", "unit", UNIT_NAMES)

    text = text.replace(/\b1 passes/g, "1 pass")
    text = text.replace(/\b1 cards/g, "1 card")
    text = text.replace(/\b1 hexes/g, "1 hex")
    text = text.replace(/\b1 units/g, "1 unit")

    return text
}

function escape_list(match, head, body) {
    if (body.split(",").length <= 3)
        return body
    return `<span class="expand-list" onclick="expand_list()">${head}</span><span hidden>${body}</span></span>`
}

function expand_list() {
    event.currentTarget.hidden = true
    event.currentTarget.nextSibling.hidden = false
    event.stopPropagation()
}

function on_prompt(text) {
    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].prompt()
        return escape_text(LOCAL_STATE.prompt)
    } else {
        return escape_text(text)
    }
}

// FIXME: icky log shortening hacks...

var shorten_log_start = 0

function show_full_log() {
    shorten_log_start = 0
    update_log(0, game_log.length)
}

function on_init_log(log) {
    var turns = []
    for (var i = 0; i < log.length; ++i) {
        if (log[i][0] === "!" || log[i][0] === "@" || log[i] === "#AAP Action" || log[i] === "#JJP Action")
            turns.push(i)
    }
    if (turns.length >= 8)
        shorten_log_start = turns[turns.length-4]
}

function show_full_log_if_needed() {
    var current_log_length = document.getElementById("log").children.length
    if (current_log_length < shorten_log_start) {
        console.log("Expanded log during snapshot review")
        shorten_log_start = 0
        update_log(0, current_log_length)
    }
}

function on_log(text, i) {
    var total = game_log.length
    if (Number.isInteger(view.log)) {
        total = view.log
    }

    if (i < shorten_log_start) {
        if (i === 0) {
            var d = document.createElement("div")
            d.classList.add("full_log")
            var b = document.createElement("button")
            b.onclick = () => show_full_log()
            b.textContent = "Show full log"
            d.append(b)
            return d
        }
        var empty = document.createElement("div")
        empty.hidden = true
        return empty
    }

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
        case "#":
            var m = text.substring(2)
            var code = text[1]
            if (code === "J") {
                p.classList.add("h3")
                p.classList.add("jp")
            } else if (code === "A") {
                p.classList.add("h3")
                p.classList.add("ap")
            } else if (code === "I") {
                p.classList.add("h4")
                p.classList.add("int")
            }
            text = m
            break
        case "%":
            var m = text.substring(2)
            p.classList.add("h5")
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
        case ">":
            p.className = "i"
            text = text.substring(1)
            break
    }
    p.innerHTML = escape_text(text)

    return p
}

/* }}} */

//# sourceMappingURL=play.js.map
