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
}