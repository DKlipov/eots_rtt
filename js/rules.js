"use strict"

const CLIENT_SIDE_SUPPLY = 1

var G, L, R, V, P = {}

function check_supply() {
    if (CLIENT_SIDE_SUPPLY)
        fast_check_supply()
    else
        basic_check_supply()
}


/** import common/constants.js */
/** import common/data.js */
/** import common/utils.js */
/** import common/supply.js */
/** import common/move.js */
/** import common/scenario.js */
/** import common/library.js*/

/** import server/utils.js */
/** import server/game.js */
/** import server/query.js */
/** import server/scenario_setup.js */
/** import server/framework.js */
