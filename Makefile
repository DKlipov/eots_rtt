default: rules.js info/rules.html info/readme.html

JS := $(shell find js -type f -name '*.js')

rules.js play.js &: tools/inline.js $(JS)
	node tools/inline.js

info/%.html: info/%.md
	pandoc -o $@ $^

tags: $(JS)
	ctags $(JS)
