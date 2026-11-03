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

function offensive_card_header() {
    return `${G.offensive.type === EC ? "EC" : "OC"}: ${cards[G.offensive.active_cards[0]].ops} Ops.`
}

function card_get_log_str(c) {
    return `C${c}`
}

function dice_get_log_str(p, modifiers, faction = G.active) {
    return `${faction === AP ? "B" : "R"}${p} ${modifiers > 0 ? "+" : ""}${modifiers ? modifiers : ""}`
}

function side_get_log_str(side) {
    return `${side === AP ? "AP" : "JP"}`
}

