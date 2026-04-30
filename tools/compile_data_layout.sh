#!/bin/bash
BASEDIR=$(dirname $0)
pushd ${BASEDIR}
node ./parse-layout.js ./mainmap.svg ./southpac.svg ./burma.svg > ../layout.js
popd