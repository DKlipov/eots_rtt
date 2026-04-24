const fs = require("node:fs")

function poly_stroke(file, r, n, a, color) {
	var pts = []
	var da = (2 * Math.PI) / n
	for (var i = 0; i < n; ++i) {
		var x = Math.sin(a) * r + r + 6
		var y = Math.cos(a) * r + r + 6
		pts.push([x.toFixed(1),y.toFixed(1)].join(","))
		a += da
	}
	fs.writeFileSync(file,
`<svg xmlns="http://www.w3.org/2000/svg" width="${r*2+12}" height="${r*2+12}">
<polygon points="${pts.join(" ")}" fill="none" stroke="black" stroke-width="6"/>
<polygon points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="4"/>
</svg>`)
}

function poly_fill(file, r, n, a, color, opacity) {
	var pts = []
	var da = (2 * Math.PI) / n
	for (var i = 0; i < n; ++i) {
		var x = Math.sin(a) * r + r
		var y = Math.cos(a) * r + r
		pts.push([x.toFixed(1),y.toFixed(1)].join(","))
		a += da
	}
	fs.writeFileSync(file,
`<svg xmlns="http://www.w3.org/2000/svg" width="${r*2}" height="${r*2}">
<polygon points="${pts.join(" ")}" fill="${color}" fill-opacity="${opacity}"/>
</svg>`)
}

function make_poly(r, n, a) {
	poly_stroke("images/hex_action.svg", r-3, n, a, "yellow")
	poly_fill("images/hex_zoi_jp.svg", r, n, a, "crimson", 0.2)
	poly_fill("images/hex_zoi_ap.svg", r, n, a, "royalblue", 0.2)
	poly_fill("images/hex_zoi_contested.svg", r, n, a, "royalblue", 0.2)
	poly_fill("images/hex_zoi_lrb.svg", r, n, a, "magenta", 0.2)
}

make_poly(31, 6, (2*Math.PI) * 1/12)
