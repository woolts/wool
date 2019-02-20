WOOL_ENTRY=$WOOL_PATH/packages/wool/cli/0.0.0/src/cli.mjs pkg \
    $WOOL_PATH/packages/wool/cli/0.0.0/src/cli.mjs \
    --out-path dist \
    --targets node10-macos-x64 \
    --options experimental-modules,loader=$WOOL_PATH/packages/wool/loader/0.0.0/src/loader.mjs