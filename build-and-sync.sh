#!/usr/bin/env bash
# Constrói os pacotes SDK e sincroniza com os node_modules das apps de teste.
# Uso: ./build-and-sync.sh [core|angular|vue|all]
#
# Este script é apenas para desenvolvimento local.
# Para produção: npm run build && npm publish em cada pacote.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_ANG="$ROOT/apps/test-angular/node_modules"
TEST_VUE="$ROOT/apps/test-vue/node_modules"

sync_core() {
  echo "→ A construir @aria-iam/core..."
  cd "$SCRIPT_DIR/core" && npm run build
  for NM in "$TEST_ANG" "$TEST_VUE"; do
    [ -d "$NM/@aria-iam/core" ] || continue
    rm -rf "$NM/@aria-iam/core/dist"
    cp -r "$SCRIPT_DIR/core/dist"       "$NM/@aria-iam/core/dist"
    cp    "$SCRIPT_DIR/core/package.json" "$NM/@aria-iam/core/package.json"
  done
  echo "  ✓ core sincronizado"
}

sync_angular() {
  echo "→ A construir @aria-iam/angular..."
  cd "$SCRIPT_DIR/angular" && npm run build
  NM="$TEST_ANG"
  [ -d "$NM/@aria-iam/angular" ] || { echo "  ✗ node_modules angular não encontrado"; return; }
  rm -rf "$NM/@aria-iam/angular/dist"
  cp -r "$SCRIPT_DIR/angular/dist"        "$NM/@aria-iam/angular/dist"
  cp    "$SCRIPT_DIR/angular/package.json" "$NM/@aria-iam/angular/package.json"
  echo "  ✓ angular sincronizado"
}

sync_vue() {
  echo "→ A construir @aria-iam/vue..."
  cd "$SCRIPT_DIR/vue" && npm run build
  NM="$TEST_VUE"
  [ -d "$NM/@aria-iam/vue" ] || { echo "  ✗ node_modules vue não encontrado"; return; }
  rm -rf "$NM/@aria-iam/vue/dist"
  cp -r "$SCRIPT_DIR/vue/dist"        "$NM/@aria-iam/vue/dist"
  cp    "$SCRIPT_DIR/vue/package.json" "$NM/@aria-iam/vue/package.json"
  echo "  ✓ vue sincronizado"
}

TARGET="${1:-all}"

case "$TARGET" in
  core)    sync_core ;;
  angular) sync_angular ;;
  vue)     sync_vue ;;
  all)     sync_core && sync_angular && sync_vue ;;
  *)       echo "Uso: $0 [core|angular|vue|all]"; exit 1 ;;
esac

echo ""
echo "✓ Pronto. Execute npm start na app que pretende testar."
