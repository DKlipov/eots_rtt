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
    if(!G.supply_cache){
        G.supply_cache = []
        for (var i = 0; i < CHINA_BOX; i++) {
            G.supply_cache[i] = 0
        }
    }
    basic_check_supply()
    G.client_supply = 1
}

function menu_show_unit_supply() {
    LOCAL_STATUS = "check_unit_supply"
    LOCAL_STATE = {}
    P.check_unit_supply._begin()
    update_header()
    on_update()
}

function menu_show_hq_range() {
    LOCAL_STATUS = "check_hq_range"
    LOCAL_STATE = {}
    P.check_hq_range._begin()
    update_header()
    on_update()
}

function menu_measure_distance() {
    LOCAL_STATUS = "measure_distance"
    LOCAL_STATE = {}
    P.measure_distance._begin()
    update_header()
    on_update()
}

function menu_measure_range() {
    LOCAL_STATUS = "measure_range"
    LOCAL_STATE = {}
    P.measure_range._begin()
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

function end_local_status() {
    if (LOCAL_STATUS) {
        LOCAL_STATUS = null
        LOCAL_STATE = null
        view = STORED_STATE
        update_header()
        on_update()
    }
}

function light_pbm_supply_check(hex) {
    var place = G.location[G.active_stack[0]]
    G.active_stack.forEach(u => G.location[u] = hex)
    var result = !G.active_stack.find(u => !check_unit_supply(hex, u, pieces[u]))
    G.active_stack.forEach(u => G.location[u] = place)
    return result
}


function pbm_supply_check(hex) {
    return with_unmodified_supply(() => {
        var place = G.location[G.active_stack[0]]
        G.active_stack.forEach(u => G.location[u] = hex)
        check_supplied_hexes(pieces[G.active_stack[0]].faction)
        var result = !G.active_stack.find(u => !check_unit_supply(hex, u, pieces[u]))
        G.active_stack.forEach(u => G.location[u] = place)
        return result
    })
}

function apply_pbm_restrictions() {
    if (G.offensive.stage !== POST_BATTLE_STAGE || G.active_stack.length === 0 || L.allowed_hexes.length === 0) {
        return
    }
    check_supplied_hexes(pieces[G.active_stack[0]].faction)
    G.active_stack.forEach(u => set_delete(G.offensive.active_units[pieces[u].faction], u))
    var zoi_unit = G.active_stack.find(u => pieces[u].br)
    var ground_unit = G.active_stack.find(u => pieces[u].class === "ground")
    var supply = pieces[G.active_stack[0]].supply
    var result = []
    map_for_each(L.allowed_hexes, (h, path) => {
        var flag
        if (zoi_unit) {
            flag = pbm_supply_check(h)
        } else {
            flag = light_pbm_supply_check(h) || ground_unit && pbm_supply_check(h)
        }
        if (flag) {
            map_set(result, h, path)
        }
    })
    G.active_stack.forEach(u => set_add(G.offensive.active_units[pieces[u].faction], u))
    if (result.length || G.active_stack.find(u => pieces[u].supply !== supply))
        L.allowed_hexes = result
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
        if (L.allowed_hexes) {
            delete G.actions.con_eliminate
        }
        apply_pbm_restrictions()
        if (G.active_stack.length
            && G.actions
            && G.actions["no_move"]
            && !map_has(L.allowed_hexes, G.location[G.active_stack[0]])) {
            // G.actions["no_move"] = 0
        } else if (G.active_stack.length
            && G.actions
            && G.actions["no_move"]
            && map_has(L.allowed_hexes, G.location[G.active_stack[0]])) {
            map_delete(L.allowed_hexes, G.location[G.active_stack[0]])
        }
        map_for_each(L.allowed_hexes, h => set_add(G.actions.action_hex, h))
    }

    document.body.classList.remove("hex-clickable")

    if (LOCAL_STATUS) {
        P[LOCAL_STATUS].prompt()
        document.querySelector("header").classList.add("local-status")
    } else {
        document.querySelector("header").classList.remove("local-status")
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
        }
        if (LOCAL_STATE.unit) {
            LOCAL_STATE.prompt = "Showing P" + LOCAL_STATE.unit + " supply lines."
        } else {
            LOCAL_STATE.prompt = "Select a unit to show supply lines."
        }
    },
    undo() {
        LOCAL_STATE.unit = 0
        on_update()
    },
    unit(u) {
        if (LOCAL_STATE.unit === u)
            return end_local_status()
        LOCAL_STATE.unit = u
        on_update()
    },
    action_hex(h) {
        if (h !== CHINA_BOX) {
            return
        }
        LOCAL_STATE.unit = 0
        on_update()
    },
    on_update() {
        if (!LOCAL_STATE.unit || G.location[LOCAL_STATE.unit] > LAST_BOARD_HEX && G.location[LOCAL_STATE.unit] !== CHINA_BOX) {
            canvas_hide()
            return
        }
        var result = with_unmodified_supply(() => supply_query(LOCAL_STATE.unit))
        canvas_show()
        canvas_draw_supply(result)
        if (LOCAL_STATE.unit && LOCAL_STATE.unit !== CHINA_BOX) {
            update_keyword("unit", LOCAL_STATE.unit, "highlight")
        }
    },
}

P.measure_range = {
    _begin() {
        LOCAL_STATE.points = []
    },
    prompt() {
        document.body.classList.add("hex-clickable")
        LOCAL_STATE.actions = {
            "done": 1,
        }
        if (LOCAL_STATE.points.length === 0)
            LOCAL_STATE.prompt = "Select a hex to measure range from."
        else if (LOCAL_STATE.points.length === 1)
            LOCAL_STATE.prompt = "Select a hex to measure range from H" + LOCAL_STATE.points[0] + "."
        else
            LOCAL_STATE.prompt = "Showing range from H" + LOCAL_STATE.points[0] +
                " to H" + LOCAL_STATE.points[LOCAL_STATE.points.length - 1] + "."
    },
    unit(u) {
        this.action_hex(G.location[u])
    },
    action_hex(h) {
        if (BOARD_ID === SOUTH_PACIFIC_SCENARIO && h === OAHU || BOARD_ID === BURMA_SCENARIO && h === SINGAPORE || h > LAST_BOARD_HEX) {
            return
        }
        if (LOCAL_STATE.points.length === 0) {
            LOCAL_STATE.points.push(h)
        } else {
            if (h == LOCAL_STATE.points[0])
                return end_local_status()
            LOCAL_STATE.points.length = 1
            for (var hex of find_shortest_path_as_the_eagle_flies(LOCAL_STATE.points[0], h)) {
                LOCAL_STATE.points.push(hex)
            }
        }
        this.redraw()
    },
    redraw() {
        on_update()
    },
    on_update() {
        canvas_hide()
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
        if (LOCAL_STATE.points.length > 1) {
            var focused = []
            for_each_hex_in_range(LOCAL_STATE.points[0], LOCAL_STATE.points.length - 1, hex => set_add(focused, hex))
            focused = in_range_on_map(LOCAL_STATE.points[0], LOCAL_STATE.points.length - 1, focused, AP)
            draw_range(focused)
        }
    },
}

P.measure_distance = {
    _begin() {
        LOCAL_STATE.points = []
    },
    prompt() {
        document.body.classList.add("hex-clickable")
        LOCAL_STATE.actions = {
            "done": 1,
        }
        if (LOCAL_STATE.points.length === 0)
            LOCAL_STATE.prompt = "Select a hex to measure distance from."
        else if (LOCAL_STATE.points.length === 1)
            LOCAL_STATE.prompt = "Select a hex to measure distance from H" + LOCAL_STATE.points[0] + "."
        else
            LOCAL_STATE.prompt = "Showing distance from H" + LOCAL_STATE.points[0] +
                " to H" + LOCAL_STATE.points[LOCAL_STATE.points.length - 1] + "."
    },
    unit(u) {
        this.action_hex(G.location[u])
    },
    action_hex(h) {
        if (BOARD_ID === SOUTH_PACIFIC_SCENARIO && h === OAHU || BOARD_ID === BURMA_SCENARIO && h === SINGAPORE || h > LAST_BOARD_HEX) {
            return
        }
        var ix = LOCAL_STATE.points.indexOf(h)
        if (ix >= 0) {
            LOCAL_STATE.points.length = ix
        } else {
            if (LOCAL_STATE.points.length > 0) {
                for (var hex of find_shortest_path_as_the_eagle_flies(LOCAL_STATE.points[LOCAL_STATE.points.length - 1], h)) {
                    LOCAL_STATE.points.push(hex)
                }
            } else {
                LOCAL_STATE.points.push(h)
            }
        }
        if (LOCAL_STATE.points.length === 0)
            end_local_status()
        else
            this.redraw()
    },
    redraw() {
        on_update()
    },
    on_update() {
        canvas_hide()
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

P.check_hq_range = {
    _begin() {
        LOCAL_STATE.unit = 0
        LOCAL_STATE.mode = "activation"
    },
    prompt() {
        LOCAL_STATE.actions = {
            "done": 1,
            "unit": HQ_LIST.filter(u => G.location[u] <= LAST_BOARD_HEX),
        }
        if (!LOCAL_STATE.unit) {
            LOCAL_STATE.prompt = "Select HQ to show range."
        } else {
            LOCAL_STATE.prompt = `P${LOCAL_STATE.unit} ${LOCAL_STATE.mode} range.`
            LOCAL_STATE.actions.hqr_supply = +(LOCAL_STATE.mode !== "supply")
            LOCAL_STATE.actions.hqr_activation = +(LOCAL_STATE.mode !== "activation")
            LOCAL_STATE.actions.hqr_isolation = +(LOCAL_STATE.mode !== "isolation")
        }
    },
    hqr_supply() {
        LOCAL_STATE.mode = "supply"
        on_update()
    },
    hqr_activation() {
        LOCAL_STATE.mode = "activation"
        on_update()
    },
    hqr_isolation() {
        LOCAL_STATE.mode = "isolation"
        on_update()
    },
    unit(u) {
        if (u === LOCAL_STATE.unit)
            return end_local_status()
        if (pieces[u].class === "hq" && G.location[u] < LAST_BOARD_HEX) {
            LOCAL_STATE.unit = u
            on_update()
        }
    },
    on_update() {
        canvas_hide()
        if (!LOCAL_STATE.unit || G.location[LOCAL_STATE.unit] > LAST_BOARD_HEX)
            return
        var focused = []
        var piece = pieces[LOCAL_STATE.unit]
        if (LOCAL_STATE.mode === "isolation") {
            if (G.sid === SOUTH_PACIFIC_SCENARIO && LOCAL_STATE.unit === HQ_CENTRAL_PACIFIC) {
                for_each_hex_in_range(hex_to_int(4825), 3, hex => set_add(focused, hex))
            } else {
                for_each_hex_in_range(G.location[LOCAL_STATE.unit], piece.cr, hex => set_add(focused, hex))
            }
            focused = in_range_on_map(G.location[LOCAL_STATE.unit], piece.cr, focused, piece.faction)
        } else if (LOCAL_STATE.mode === "activation") {
            mark_activation_zone(LOCAL_STATE.unit)
            for_each_hex_in_range(G.location[LOCAL_STATE.unit], pieces[LOCAL_STATE.unit].cr, hex => {
                if (G.supply_cache[hex] & HEX_TEMP_FLAG3)
                    set_add(focused, hex)
            })
        } else if (LOCAL_STATE.mode === "supply") {
            focused = with_unmodified_supply(() => hq_supply_zone(LOCAL_STATE.unit))
        }
        if (piece.faction === JP) {
            for_each_hex_in_range(KUNMING, 1, h => set_delete(focused, h))
        }
        draw_range(focused)
        update_keyword("unit", LOCAL_STATE.unit, "highlight")
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
        end_local_status()
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
    L.supply = {queue: []}
    mark_supply_ports_overland(hq)
    L.supply_ports.queue.push(...L.supply.queue)
    L.supply_ports.retracing.push(...L.supply.retracing)
    L.supply = {queue: []}
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
    L.supply = {queue: []}
    if (result.hq) {
        var sh = G.offensive.active_hq
        G.offensive.active_hq = []
        check_hq_in_supply(result.hq, pieces[result.hq], piece.faction === AP ? JOINT_SUPPLIED_HEX : JP_SUPPLIED_HEX)
        G.offensive.active_hq = sh
        if (L.supply.queue.length) {
            result.path.to_source = retrace_supply_path(L.supply.queue[L.supply.queue.length - 1])
        }
    } else if (piece.faction === AP && (G.burma_road < 2 || result.oos)) {
        mark_hexes_supplied_kunming()
        if (G.supply_cache[location] & piece.supply) {
            result.path.to_hq = retrace_supply_path(location)
            trace_kunming(result)
        }
    }
    return result
}

function hq_supply_zone(unit) {
    L = {supply: {}}

    var result = []
    var piece = pieces[unit]
    var location = G.location[unit]
    clear_supply_cache(CLEAN_ALL_MASK)
    for_each_unit_on_map((i, p) => (!set_has(G.oos, i)) ? mark_unit(i, p) : null)
    place_virtual_units()
    check_infrastructure()
    for_each_unit_on_map((i, p) => (!set_has(G.oos, i)) ? set_zoi(i, p, [G.oos, G.oos]) : null)
    indian_zoi_hack((i, p) => (!set_has(G.oos, i)) ? set_zoi(i, p, [G.oos, G.oos]) : null)
    var hq = HQ_LIST.filter(hq => {
        return (piece.faction === pieces[hq].faction && G.location[hq] < LAST_BOARD_HEX)
    })
    mark_supply_ports_oversea(hq)
    L.supply = {}
    mark_supply_ports_overland(hq)
    L.supply = {}
    mark_hexes_supplied_from([unit], l => true)
    L.supply = {}
    for_each_hex_in_range(G.location[unit], piece.cr, h => {
        if (G.supply_cache[h] & piece.supply) {
            set_add(result, h)
        }
    })
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
        var airfields = [DACCA, JARHAT].find(h => G.supply_cache[h] & AP_SUPPLY_AIRFIELD)
        if (airfields) {
            L.supply.queue = L.supply_ports.queue
            L.supply.retracing = L.supply_ports.retracing
            result.path.from_port = retrace_supply_path(airfields)
            result.path.to_port = [KUNMING, airfields]
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
