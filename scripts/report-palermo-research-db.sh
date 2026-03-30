#!/usr/bin/env bash
set -euo pipefail

echo "Legacy Kinelofit research DB reporting is disabled in Chefamo." >&2
echo "Use 'npm run catalog:coverage' or inspect the exported Chefamo seed snapshot instead." >&2
exit 1
