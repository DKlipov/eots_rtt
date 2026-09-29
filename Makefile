default: rules.js

JS := $(shell find js -type f -name '*.js')

rules.js: tools/inline.js $(JS)
	node tools/inline.js
