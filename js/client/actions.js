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
        var focused = []
        if (LOCAL_STATE.unit && pieces[LOCAL_STATE.unit].class === "hq" && G.location[LOCAL_STATE.unit] < LAST_BOARD_HEX) {
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

var send_action_with_oos = function (a, b, valid = false) {
    if (!valid && !validate_action(a, b)) {
        return false
    }
    var payload = {action: b, br: G.burma_road}
    if (!array_equals(world.original_oos, G.oos)) {
        payload.oos = G.oos
    }
    G.actions[a] = [payload]
    return original_send_action(a, payload)
}

function validate_action(verb, noun) {
    if (params.mode === "replay" || params.mode === "debug")
        return false
    // Reset action list here so we don't send more than one action per server prompt!
    if (noun !== undefined) {
        var realnoun = Array.isArray(noun) ? noun[0] : noun
        if (view.actions && view.actions[verb] && view.actions[verb].includes(realnoun)) {
            return true
        }
    } else {
        if (view.actions && view.actions[verb]) {
            return true
        }
    }
    return false
}

function proxy_send_action(a, b) {
    if (G.actions && G.actions.move && a === "action_hex") {
        var path = map_get(L.allowed_hexes, b)
        if (path) {
            if (G.offensive.stage === ATTACK_STAGE && !G.offensive.zoi_intelligence_modifier) {
                move_units(G.active_stack, path)
                if (G.offensive.zoi_intelligence_modifier) {
                    path[0] |= VIOLATE_ZOI
                }
            }
            return send_action_with_oos("move", path, true)
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
    indian_zoi_hack()
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
