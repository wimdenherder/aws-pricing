#!/bin/bash

DIRNAME=`dirname $0`
BASEDIR=`realpath $DIRNAME`

OUTPUT="$BASEDIR/../help_dialog.html"

set -e

TMP=`mktemp`

marked -o $TMP $BASEDIR/../README.md

FINAL=`mktemp`

cat > $FINAL <<EOF
<link rel="stylesheet" href="https://ssl.gstatic.com/docs/script/css/add-ons1.css">
<style>
.branding-below {
  bottom: 56px;
  top: 0;
}
</style>

<div class="sidebar branding-below">
<h1>
    This version of "AWS Pricing" will be deprecated in the near future. Please download the new version <a href="https://workspace.google.com/marketplace/app/aws_pricing_by_strake/378787760903" target="_blank">HERE</a>.
</h1>
EOF

cat $TMP >> $FINAL
rm $TMP

cat >> $FINAL <<EOF
</div>

<div class="sidebar bottom">
  <span class="gray">
    AWS Pricing by <a href="https://github.com/mheffner" target="_blank">Mike Heffner</a>. Find this document on <a href="https://github.com/mheffner/aws-pricing" target="_blank">GitHub</a>.
  </span>
</div>
EOF

mv $FINAL $OUTPUT