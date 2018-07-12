mkdir -p $WOOL_PATH/packages/wool/cli/0.0.0/
mkdir -p $WOOL_PATH/packages/wool/cli-args/0.0.0/
mkdir -p $WOOL_PATH/packages/wool/cli-colors/0.0.0/
mkdir -p $WOOL_PATH/packages/wool/cli-questions/0.0.0/
mkdir -p $WOOL_PATH/packages/wool/loader/0.0.0/
mkdir -p $WOOL_PATH/packages/wool/process/0.0.0/
mkdir -p $WOOL_PATH/packages/wool/semver/0.0.0/
mkdir -p $WOOL_PATH/packages/wool/utils/0.0.0/

cp -R workspaces/cli/cli/* $WOOL_PATH/packages/wool/cli/0.0.0/
cp -R workspaces/cli/cli-args/* $WOOL_PATH/packages/wool/cli-args/0.0.0/
cp -R workspaces/cli/cli-colors/* $WOOL_PATH/packages/wool/cli-colors/0.0.0/
cp -R workspaces/cli/cli-questions/* $WOOL_PATH/packages/wool/cli-questions/0.0.0/
cp -R workspaces/loader/* $WOOL_PATH/packages/wool/loader/0.0.0/
cp -R workspaces/process/* $WOOL_PATH/packages/wool/process/0.0.0/
cp -R workspaces/semver/* $WOOL_PATH/packages/wool/semver/0.0.0/
cp -R workspaces/utils/* $WOOL_PATH/packages/wool/utils/0.0.0/

mkdir -p $WOOL_PATH/.bin

cd $WOOL_PATH/.bin
ln -s ../packages/wool/cli/0.0.0/bin/wool .
