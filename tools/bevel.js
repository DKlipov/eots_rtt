const oklab = require("rally-the-troops/tools/oklab")

console.log(oklab.css_bevel("button.green", "#90ee90"))

console.log(oklab.css_bevel(".marker.conflict.landing", "#ee82ee"))
console.log(oklab.css_bevel(".marker.conflict.battle", "#90ee90"))

console.log(oklab.css_bevel(".marker.black", "#303030"))

var sels = [
    ".marker.white",
    ".marker.yellow",
    ".marker.beige",
    ".marker.blue",
    ".marker.orange",
    ".marker.dkblue",
    ".marker.green",
    ".marker.red",
    ".marker.brown",
    ".marker.ltyellow",
    ".marker.turquoise",
    ".marker.ltblue",
    ".unit.white",
    ".unit.yellow",
    ".unit.beige",
    ".unit.blue",
    ".unit.orange",
    ".unit.dkblue",
    ".unit.green",
    ".unit.red",
    ".unit.brown",
    ".unit.ltyellow",
    ".unit.turquoise",
    ".unit.ltblue",
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
        if (s.includes("."+n))
            console.log(oklab.css_bevel(s, color))
    }
}
