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
        send_query({name: "check_unit_supply", u})
    },
    action_hex(h) {
        if (h !== CHINA_BOX) {
            return
        }
        LOCAL_STATE.unit = 1
        send_query({name: "check_unit_supply", u: h})
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
    var payload = {action: b, oos: G.oos, br: G.burma_road}
    G.actions[a] = [payload]
    return original_send_action(a, payload)
}

function validate_action(verb, noun) {
    if (params.mode === "replay" || params.mode === "debug")
        return false
    // Reset action list here so we don't send more than one action per server prompt!
    if (noun !== undefined) {
        let realnoun = Array.isArray(noun) ? noun[0] : noun
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