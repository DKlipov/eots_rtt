default: rules.js info/rules.html

JS := $(shell find js -type f -name '*.js')

rules.js play.js &: tools/inline.js $(JS)
	node tools/inline.js

info/rules.html: info/rules.md
	pandoc -o $@ $^

tags: $(JS)
	ctags $(JS)
