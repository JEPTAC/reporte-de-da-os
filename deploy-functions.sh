#!/usr/bin/env bash
set -euo pipefail
firebase use rendicion-de-cuentas-6aceb
firebase deploy --only functions
