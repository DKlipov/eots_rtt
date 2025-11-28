const cabinet = require("rally-the-troops/tools/cabinet")
const { css_bevel } = require("rally-the-troops/tools/oklab")

var french = "#56b4e9"
var german = "#6c6c6c"

cabinet.enable_logging()

cabinet.draw_cuboid(20, 20, 40, french, null, "pieces/block_french_fresh.svg")
cabinet.draw_cuboid(20, 20, 40, german, null, "pieces/block_german_fresh.svg")
cabinet.outline_cuboid(20, 20, 40, "#ff0", "pieces/block_action_fresh.svg")
cabinet.outline_cuboid(20, 20, 40, "#0ff", "pieces/block_select_fresh.svg")

cabinet.draw_cuboid(40, 20, 20, french, null, "pieces/block_french_volko.svg")
cabinet.draw_cuboid(40, 20, 20, german, null, "pieces/block_german_volko.svg")
cabinet.outline_cuboid(40, 20, 20, "#ff0", "pieces/block_action_volko.svg")
cabinet.outline_cuboid(40, 20, 20, "#0ff", "pieces/block_select_volko.svg")

cabinet.draw_cuboid(20, 40, 20, french, null, "pieces/block_french_exhausted.svg")
cabinet.draw_cuboid(20, 40, 20, german, null, "pieces/block_german_exhausted.svg")
cabinet.outline_cuboid(20, 40, 20, "#ff0", "pieces/block_action_exhausted.svg")
cabinet.outline_cuboid(20, 40, 20, "#0ff", "pieces/block_select_exhausted.svg")

cabinet.draw_cuboid(60+16, 10, 10, french, null, "pieces/trench_french.svg")
cabinet.draw_cuboid(60+16, 10, 10, german, null, "pieces/trench_german.svg")

cabinet.draw_cylinder(28, 40, "#eeeeee", null, "pieces/cylinder.svg")
cabinet.draw_cylinder(28, 40, french, null, "pieces/cylinder_french.svg")
cabinet.draw_cylinder(28, 40, german, null, "pieces/cylinder_german.svg")
cabinet.outline_cylinder(28, 40, "#ff0", "pieces/cylinder_action.svg")

/*
.marker.turn
.marker.us
.marker.control.german
.marker.control.french
.marker.supply1
.marker.supply2
.marker.vp
*/
