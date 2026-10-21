function on_static_view() {
    return {
        original_control: scenario_data().original_control
    }
}

function on_query(q, params) {
    if (q === "combat") {
        return combat_query(params)
    }
    if (q === "original_control") {
        return {original_control: scenario_data().original_control}
    }
}

function vp_query() {
    return get_victory()
}

function combat_query(battle) {
    // we could corrupt G, so make a copy to work on
    var save_G = G
    G = object_copy(G)

    var battle_hex = G.offensive.battle_names[battle]
    if (!set_has(G.offensive.battle_hexes, battle_hex)) {
        create_battle_hex(battle_hex)
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

    // restore saved G
    G = save_G

    return result
}
