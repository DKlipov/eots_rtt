default: rules.js

watch:
	$(MAKE)
	@ while ! inotifywait -q -e modify rules.txt tools/compile.js ; do $(MAKE) ; done

gdl-rules.js: gdl-rules.txt tools/compile.js ../common/util.js
	cpp gdl-rules.txt | node tools/compile.js /dev/stdin > $@
