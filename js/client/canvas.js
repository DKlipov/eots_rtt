const CANVAS = document.getElementById("canvas")
const CANVAS_CTX = document.getElementById("canvas").getContext("2d")

const dash_pattern = [ 6.90625 ]

const supply_stroke = {
    from_port: "dodgerblue",
    to_port: "limegreen",
    to_hq: "gold",
    to_source: "white",
}

const supply_fill = {
    to_port: "lightgreen",
    from_port: "skyblue",
    to_hq: "yellow",
    to_source: "gainsboro",
}

function canvas_show() {
    CANVAS.hidden = false
}

function canvas_hide() {
    CANVAS.hidden = true
}

function canvas_init(scenario) {
    let sizeX, sizeY
    switch (scenario) {
    case "South Pacific":
    case "Burma: The Forgotten War, 1943-1944":
        sizeX = 1275
        sizeY = 825
        break
    default:
        sizeX = 2550
        sizeY = 1650
        break
    }

    CANVAS.style.width = sizeX + "px"
    CANVAS.style.height = sizeY + "px"

    var scale = window.devicePixelRatio
    CANVAS.width = sizeX * scale
    CANVAS.height = sizeY * scale

    CANVAS_CTX.scale(scale, scale)
}

function canvas_clear_paths() {
    CANVAS_CTX.clearRect(0, 0, CANVAS.width, CANVAS.height)
}

const move_stroke = [ "tomato", "deepskyblue" ]
const move_fill = [ "firebrick", "dodgerblue" ]

function canvas_draw_paths() {
    canvas_clear_paths()

    var lines = []
    var dlines = []
    var circles = []
    // var heads = []

    var used_lines = [[],[]]
    var used_dots = [[],[]]

    function mark_line(f, a, b) {
        var c = (a < b) ? (a << 16) + b : (b << 16) + a
        if (set_has(used_lines[f], c))
            return false
        set_add(used_lines[f], c)
        return true
    }

    function mark_dot(f, c) {
        if (set_has(used_dots[f], c))
            return false
        set_add(used_dots[f], c)
        return true
    }

    function my_hex_center(faction, hex) {
        var [ x, y ] = hex_center(hex)
        var d = -4 + faction * 8
        return [ x + d, y ]
    }

    map_for_each(G.offensive.paths, (k, v) => {
        if (G.location[k] > LAST_BOARD_HEX && G.location[k] !== CHINA_BOX) {
            return
        }

        var faction = pieces[k].faction
        for (var j = 3; j < v.length; j++) {
            if (mark_line(faction, v[j-1], v[j])) {
                var [ x1, y1 ] = my_hex_center(faction, v[j - 1])
                var [ x2, y2 ] = my_hex_center(faction, v[j])
                if (G.location[k] === v[j - 1] && j === v.length - 1)
                    dlines.push([ faction, x1, y1, x2, y2 ])
                else
                    lines.push([ faction, x1, y1, x2, y2 ])
            }
        }

        if (v.length >= 4) {
            // var [ x1, y1 ] = my_hex_center(faction, v[v.length-2])
            var [ x2, y2 ] = my_hex_center(faction, v[v.length-1])
            if (mark_dot(faction, v[v.length-1])) {
                // var angle = Math.atan2(y2 - y1, x2 - x1)
                // heads.push([ faction, angle, x2, y2 ])
                circles.push([ faction, x2, y2 ])
            }
        }

        for (var j = 3; j < v.length; j++) {
            if (v[j - 1] === v[j] || j === 3) {
                if (mark_dot(faction, v[j-1])) {
                    var [ x1, y1 ] = my_hex_center(faction, v[j - 1])
                    circles.push([ faction, x1, y1 ])
                }
            }
        }
    })

    CANVAS_CTX.lineWidth = 5
    CANVAS_CTX.strokeStyle = "black"
    CANVAS_CTX.lineCap = "round"
    for (var [ faction, x1, y1, x2, y2 ] of dlines) {
        CANVAS_CTX.setLineDash(dash_pattern)
        CANVAS_CTX.beginPath()
        CANVAS_CTX.moveTo(x1, y1)
        CANVAS_CTX.lineTo(x2, y2)
        CANVAS_CTX.stroke()
    }
    for (var [ faction, x1, y1, x2, y2 ] of lines) {
        CANVAS_CTX.setLineDash([])
        CANVAS_CTX.beginPath()
        CANVAS_CTX.moveTo(x1, y1)
        CANVAS_CTX.lineTo(x2, y2)
        CANVAS_CTX.stroke()
    }
    for (var [ faction, x1, y1 ] of circles) {
        CANVAS_CTX.beginPath()
        CANVAS_CTX.arc(x1, y1, 4, 0, 2 * Math.PI)
        CANVAS_CTX.stroke()
    }
    /*
    for (var [ faction, angle, x1, y1 ] of heads) {
        CANVAS_CTX.beginPath()
        CANVAS_CTX.translate(x1, y1)
        CANVAS_CTX.rotate(angle)
        CANVAS_CTX.beginPath()
        CANVAS_CTX.moveTo(-5, 0)
        CANVAS_CTX.lineTo(-5, 5)
        CANVAS_CTX.lineTo(5,0)
        CANVAS_CTX.lineTo(-5, -5)
        CANVAS_CTX.closePath()
        CANVAS_CTX.setTransform(1, 0, 0, 1, 0, 0)
        CANVAS_CTX.stroke()
    }
    */

    CANVAS_CTX.lineWidth = 3
    for (var [ faction, x1, y1, x2, y2 ] of dlines) {
        CANVAS_CTX.setLineDash(dash_pattern)
        CANVAS_CTX.strokeStyle = move_stroke[faction]
        CANVAS_CTX.beginPath()
        CANVAS_CTX.moveTo(x1, y1)
        CANVAS_CTX.lineTo(x2, y2)
        CANVAS_CTX.stroke()
    }
    for (var [ faction, x1, y1, x2, y2 ] of lines) {
        CANVAS_CTX.setLineDash([])
        CANVAS_CTX.strokeStyle = move_stroke[faction]
        CANVAS_CTX.beginPath()
        CANVAS_CTX.moveTo(x1, y1)
        CANVAS_CTX.lineTo(x2, y2)
        CANVAS_CTX.stroke()
    }
    for (var [ faction, x1, y1 ] of circles) {
        CANVAS_CTX.strokeStyle = move_stroke[faction]
        CANVAS_CTX.fillStyle = move_fill[faction]
        CANVAS_CTX.beginPath()
        CANVAS_CTX.arc(x1, y1, 4, 0, 2 * Math.PI)
        CANVAS_CTX.fill()
        CANVAS_CTX.stroke()
    }
    /*
    for (var [ faction, angle, x1, y1 ] of heads) {
        CANVAS_CTX.strokeStyle = move_stroke[faction]
        CANVAS_CTX.fillStyle = move_fill[faction]
        CANVAS_CTX.translate(x1, y1)
        CANVAS_CTX.rotate(angle)
        CANVAS_CTX.beginPath()
        CANVAS_CTX.moveTo(-5, 0)
        CANVAS_CTX.lineTo(-5, 5)
        CANVAS_CTX.lineTo(5,0)
        CANVAS_CTX.lineTo(-5, -5)
        CANVAS_CTX.closePath()
        CANVAS_CTX.fill()
        CANVAS_CTX.stroke()
        CANVAS_CTX.setTransform(1, 0, 0, 1, 0, 0)
    }
    */
}

const supply_types = [
    "from_port", // from port to hq (last point is hq)
    "to_port", // overland to port (first point is port)
    "to_source", // to off-map or to city (first point in path is source)
    "to_hq", // to in-supply HQ (last point in path is HQ)
]

function canvas_draw_supply(supply_data) {
    canvas_clear_paths()

    supply_types.forEach((type, index) => {
        var lines = []
        var dots = []
        var v = supply_data.path[type]
        if (!v || v.length < 2) return
        var start = hex_center(v[0])
        var finish = null
        var d = (index - 1.5) * 6
        for (var j = 1; j < v.length; j++) {
            if (v[j-1] === v[j]) continue
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            lines.push([ type, supply_data.oos, d + start[0], start[1], d + finish[0], finish[1] ])
        }
        if (v.length >= 2 && v[0] !== v[1]) {
            dots.push([ type, d, ...hex_center(v[0]) ])
            dots.push([ type, d, ...hex_center(v[v.length-1]) ])
        }

        // draw outline shadow
        CANVAS_CTX.lineWidth = 5
        CANVAS_CTX.lineCap = "round"
        CANVAS_CTX.strokeStyle = "black"
        for (var [ type, oos, x1, y1, x2, y2 ] of lines) {
            if (oos)
                CANVAS_CTX.setLineDash(dash_pattern)
            else
                CANVAS_CTX.setLineDash([])
            CANVAS_CTX.beginPath()
            CANVAS_CTX.moveTo(x1, y1)
            CANVAS_CTX.lineTo(x2, y2)
            CANVAS_CTX.stroke()
        }

        CANVAS_CTX.setLineDash([])
        for (var [ type, d, x1, y1 ] of dots) {
            CANVAS_CTX.beginPath()
            CANVAS_CTX.arc(d + x1, y1, 4, 0, 2 * Math.PI)
            CANVAS_CTX.stroke()
        }

        // draw colored lines
        CANVAS_CTX.lineWidth = 3
        CANVAS_CTX.lineCap = "round"
        for (var [ type, oos, x1, y1, x2, y2 ] of lines) {
            CANVAS_CTX.strokeStyle = supply_stroke[type]
            if (oos)
                CANVAS_CTX.setLineDash(dash_pattern)
            else
                CANVAS_CTX.setLineDash([])
            CANVAS_CTX.beginPath()
            CANVAS_CTX.moveTo(x1, y1)
            CANVAS_CTX.lineTo(x2, y2)
            CANVAS_CTX.stroke()
        }

        CANVAS_CTX.setLineDash([])
        for (var [ type, d, x1, y1 ] of dots) {
            CANVAS_CTX.strokeStyle = supply_stroke[type]
            CANVAS_CTX.fillStyle = supply_fill[type]
            CANVAS_CTX.beginPath()
            CANVAS_CTX.arc(d + x1, y1, 4, 0, 2 * Math.PI)
            CANVAS_CTX.fill()
            CANVAS_CTX.stroke()
        }
    })

}
