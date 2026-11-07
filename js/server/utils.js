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

function card_get_log_str(c) {
    return `C${c}`
}

function dice_get_log_str(p, modifiers, faction = G.active) {
    var str = (faction === AP ? "B" : "R") + p
    if (modifiers) {
        if (modifiers > 0)
            str += "+"
        str += modifiers
    }
    return str
}

function side_get_log_str(side) {
    return side === AP ? "Allies" : "Japan"
}

function is_china_coast_captured() {
    return G.sid !== SOUTH_PACIFIC_SCENARIO && !CHINA_COAST.some(h => is_space_controlled(h, JP))
}
