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
HEX_DIRECTION[69] = 5