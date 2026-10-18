const oklab = require("rally-the-troops/tools/oklab")

console.log(oklab.css_bevel("button.green", "#90ee90"))
console.log(oklab.css_bevel(".marker", "#303030"))

console.log(oklab.css_bevel(".conflict.landing", "#ee82ee"))
console.log(oklab.css_bevel(".conflict.battle", "#90ee90"))
console.log(oklab.css_bevel(".marker.aa_small", "#007dc5"))

var sels = [
    ".big_markers_blue",
    ".big_markers_dkblue",
    ".big_markers_white",
    ".big_markers_yellow",
    ".big_units_beige",
    ".big_units_blue",
    ".big_units_orange",
    ".big_units_white",
    ".small_markers_beige",
    ".small_markers_black",
    ".small_markers_brown",
    ".small_markers_dkblue",
    ".small_markers_green",
    ".small_markers_red",
    ".small_markers_white",
    ".small_markers_yellow",
    ".small_units_beige",
    ".small_units_beige_air",
    ".small_units_black",
    ".small_units_blue",
    ".small_units_brown",
    ".small_units_dkblue",
    ".small_units_green",
    ".small_units_green_air",
    ".small_units_ltblue",
    ".small_units_ltyellow",
    ".small_units_orange",
    ".small_units_red",
    ".small_units_turquoise",
    ".small_units_white",
    ".small_units_yellow",
    ".small_units_yellow_air",
]

var colors = [
    ["white","#f5f5f5"],
    ["yellow","#ffd65c"],
    ["beige","#ceb893"],
    ["blue","#42c8f5"],
    ["orange","#f7941c"],
    ["dkblue","#007dc5"],
    ["green","#96a854"],
    ["red","#f04e3e"],
    ["brown","#aa5d50"],
    ["ltyellow","#fff79a"],
    ["turquoise","#91bea6"],
    ["ltblue","#9fd2f1"],
]

for (var s of sels) {
    for (var [n,color] of colors) {
        if (s.includes("_"+n))
            console.log(oklab.css_bevel(s, color))
    }
}
