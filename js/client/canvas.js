const CANVAS = document.getElementById("canvas")
const CANVAS_CTX = document.getElementById("canvas").getContext("2d")

const SUPPLY_COLORS = {
    to_port: "green",
    from_port: "red",
    to_hq: "blue",
    to_source: "yellow",
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
        var d = pieces[k].faction ? -2 : 2
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
            CANVAS_CTX.moveTo(start[0], start[1] + d)
            CANVAS_CTX.lineTo(finish[0], finish[1] + d)
            CANVAS_CTX.stroke()
            CANVAS_CTX.setLineDash([])
        }

        // spots
        for (var j = 3; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            if (v[j - 1] === v[j] || j === 3) {
                CANVAS_CTX.beginPath()
                CANVAS_CTX.arc(start[0], start[1] + d, 6, 0, 2 * Math.PI)
                CANVAS_CTX.fill()
                CANVAS_CTX.stroke()
            }
        }
        if (finish) {
            CANVAS_CTX.beginPath()
            CANVAS_CTX.rect(finish[0] - 6, finish[1] - 6 + d, 12, 12)
            CANVAS_CTX.fill()
            CANVAS_CTX.stroke()
        }
    })
}

function canvas_draw_supply(supply_data) {
    canvas_clear_paths()
    Object.keys(supply_data.path).forEach((type, index) => {
        var v = supply_data.path[type]
        var start = hex_center(v[0])
        var finish
        var color = SUPPLY_COLORS[type]
        var d = index * 2 - 3
        CANVAS_CTX.strokeStyle = color
        CANVAS_CTX.fillStyle = color
        CANVAS_CTX.lineWidth = 3
        for (var j = 1; j < v.length; j++) {
            start = hex_center(v[j - 1])
            finish = hex_center(v[j])
            CANVAS_CTX.beginPath()
            if (supply_data.oos) {
                CANVAS_CTX.setLineDash([5, 3])
            }
            CANVAS_CTX.moveTo(start[0], start[1] + d)
            CANVAS_CTX.lineTo(finish[0], finish[1] + d)
            CANVAS_CTX.stroke()
            CANVAS_CTX.setLineDash([])
        }
        if (finish) {
            CANVAS_CTX.beginPath()
            CANVAS_CTX.fillRect(finish[0] - 4, finish[1] - 4 + d, 8, 8)
            CANVAS_CTX.stroke()
        }
    })
}
