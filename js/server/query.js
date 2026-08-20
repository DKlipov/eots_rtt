function on_query(q, params, b) {
    if (q.name === "battle_info") {
        return battle_info_query(q.index)
    }
    if (q === "original_control") {
        return scenario_data().original_control
    }
}

function vp_query() {
    return get_victory()
}
//could corrupt G, run only in safe context
function battle_info_query(battle) {
    if (!set_has(G.offensive.battle, battle)) {
        create_battle_hex(battle)
    }
    G.log = []
    var result = {
        naval_cf: [],
        naval_distant_hits: [],
        naval_rm: [],
        naval_log: [],
        ground_cf: [],
        ground_rm: [],
        ground_log: [],
        battle_hex: G.offensive.battle_names[battle],
        battle_name: battle,
    }
    var battle_hex = G.offensive.battle_names[battle]
    G.offensive.battle = {battle_hex}
    prepare_battle()
    result.air_naval = G.offensive.battle.air_naval
    G.log = []
    prepare_attack(JP)
    get_battle_modifiers(JP)
    result.naval_cf = G.offensive.battle.strength
    result.naval_rm[JP] = G.offensive.battle.roll_modifiers
    result.naval_distant_hits[JP] = G.offensive.battle.distant_hits
    result.naval_log[JP] = G.log
    G.log = []
    prepare_attack(AP)
    get_battle_modifiers(AP)
    result.naval_rm[AP] = G.offensive.battle.roll_modifiers
    result.naval_distant_hits[AP] = G.offensive.battle.distant_hits
    result.naval_log[AP] = G.log
    G.log = []
    prepare_ground_battle()
    result.ground = G.offensive.battle.ground
    G.log = []
    prepare_attack(JP)
    get_battle_modifiers(JP)
    result.ground_cf = G.offensive.battle.strength
    result.ground_rm[JP] = G.offensive.battle.roll_modifiers
    result.ground_log[JP] = G.log
    G.log = []
    prepare_attack(AP)
    get_battle_modifiers(AP)
    result.ground_rm[AP] = G.offensive.battle.roll_modifiers
    result.ground_log[AP] = G.log
    return result
}

function draw_list() {
    var hand = [G.draw[JP].concat(G.hand[JP]), G.draw[AP].concat(G.hand[AP])]
    if (G.future_offensive[AP] > 0) {
        hand[AP].push(G.future_offensive[AP])
    }
    if (G.future_offensive[JP] > 0) {
        hand[JP].push(G.future_offensive[JP])
    }
    hand[AP].sort()
    hand[JP].sort()
    return {hand}
}