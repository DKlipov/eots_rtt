const CANVAS = document.getElementById("canvas")
const CANVAS_CTX = document.getElementById("canvas").getContext("2d")

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

function canvas_draw_paths() {
    canvas_clear_paths()
    map_for_each(G.offensive.paths, (k, v) => {
        if (G.location[k] > LAST_BOARD_HEX && G.location[k] !== CHINA_BOX) {
            return
        }
        var start = hex_center(v[2])
        var finish
        var line_color = pieces[k].faction ? "blue" : "firebrick"
        var spot_color = pieces[k].faction ? "deepskyblue" : "tomato"
        var d = pieces[k].faction ? -4 : 4
        CANVAS_CTX.strokeStyle = line_color
        CANVAS_CTX.fillStyle = spot_color
        CANVAS_CTX.lineWidth = 3
        CANVAS_CTX.lineCap = "round"

        // lines
        for (var j = 3; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            CANVAS_CTX.beginPath()
            if (G.location[k] === v[j - 1] && j === v.length - 1) {
                CANVAS_CTX.setLineDash([5, 3])
            }
            CANVAS_CTX.moveTo(d + start[0], start[1])
            CANVAS_CTX.lineTo(d + finish[0], finish[1])
            CANVAS_CTX.stroke()
            CANVAS_CTX.setLineDash([])
        }

        // spots
        for (var j = 3; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            if (v[j - 1] === v[j] || j === 3) {
                CANVAS_CTX.beginPath()
                CANVAS_CTX.arc(d + start[0], start[1], 6, 0, 2 * Math.PI)
                CANVAS_CTX.fill()
                CANVAS_CTX.stroke()
            }
        }

        if (finish) {
            CANVAS_CTX.beginPath()
            CANVAS_CTX.rect(d + finish[0] - 6, finish[1] - 6, 12, 12)
            CANVAS_CTX.fill()
            CANVAS_CTX.stroke()
        }
    })
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
        var d = index * 6 - 6
        for (var j = 1; j < v.length; j++) {
            if (v[j-1] === v[j]) continue
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            lines.push([ type, supply_data.oos, d + start[0], start[1], d + finish[0], finish[1] ])
        }
        if (v.length >= 2 && v[0] !== v[1]) {
            if (type === "to_source")
                dots.push([ type, d, ...hex_center(v[0]) ])
            else if (type === "to_port")
                dots.push([ type, d, ...hex_center(v[0]) ])
            else
                dots.push([ type, d, ...hex_center(v[v.length-1]) ])
        }

        // draw outline shadow
        CANVAS_CTX.lineWidth = 5
        CANVAS_CTX.lineCap = "round"
        CANVAS_CTX.strokeStyle = "black"
        for (var [ type, oos, x1, y1, x2, y2 ] of lines) {
            if (oos)
                CANVAS_CTX.setLineDash([5, 3])
            else
                CANVAS_CTX.setLineDash([])
            CANVAS_CTX.beginPath()
            CANVAS_CTX.moveTo(x1, y1)
            CANVAS_CTX.lineTo(x2, y2)
            CANVAS_CTX.stroke()
        }
        for (var [ type, d, x1, y1 ] of dots) {
            CANVAS_CTX.beginPath()
            CANVAS_CTX.arc(d + x1, y1, 6, 0, 2 * Math.PI)
            CANVAS_CTX.stroke()
        }

        // draw colored lines
        CANVAS_CTX.lineWidth = 3
        CANVAS_CTX.lineCap = "round"
        for (var [ type, oos, x1, y1, x2, y2 ] of lines) {
            CANVAS_CTX.strokeStyle = supply_stroke[type]
            if (oos)
                CANVAS_CTX.setLineDash([5, 3])
            else
                CANVAS_CTX.setLineDash([])
            CANVAS_CTX.beginPath()
            CANVAS_CTX.moveTo(x1, y1)
            CANVAS_CTX.lineTo(x2, y2)
            CANVAS_CTX.stroke()
        }
        for (var [ type, d, x1, y1 ] of dots) {
            CANVAS_CTX.strokeStyle = supply_stroke[type]
            CANVAS_CTX.fillStyle = supply_fill[type]
            CANVAS_CTX.beginPath()
            CANVAS_CTX.arc(d + x1, y1, 6, 0, 2 * Math.PI)
            CANVAS_CTX.fill()
            CANVAS_CTX.stroke()
        }
    })

}
