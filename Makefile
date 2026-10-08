default: rules.js

JS := $(shell find js -type f -name '*.js')

rules.js play.js &: tools/inline.js $(JS)
	node tools/inline.js
