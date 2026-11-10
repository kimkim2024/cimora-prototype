#!/bin/bash
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  open "start.html"
  exit 0
fi
exec node local-server.cjs 4186 --open
