#!/bin/bash

# Setup Git Hooks with Husky
# The web app lives in web/ inside the repository, so the hooks are installed from the repository root
# and every hook moves into web/ before running.

set -e  # Exit on error

echo "🚀 Setting up Git hooks with Husky..."

CARPETA_WEB="$(cd "$(dirname "$0")" && pwd)"
RAIZ_REPOSITORIO="$(git -C "$CARPETA_WEB" rev-parse --show-toplevel 2>/dev/null || true)"

if [ -z "$RAIZ_REPOSITORIO" ]; then
  echo "❌ Error: web/ is not inside a git repository."
  exit 1
fi

cd "$CARPETA_WEB"

if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies first..."
  pnpm install
fi

echo "⚙️  Configuring Husky..."
(cd "$RAIZ_REPOSITORIO" && "$CARPETA_WEB/node_modules/.bin/husky" web/.husky)

echo "📝 Setting up pre-commit hook..."
cat > .husky/pre-commit << 'EOF'
pnpm --dir web run validate
EOF

echo "📝 Setting up commit-msg hook..."
cat > .husky/commit-msg << 'EOF'
pnpm --dir web exec commitlint --edit "$(realpath "$1")"
EOF

echo "🔐 Setting execute permissions on hooks..."
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

HOOKS_PATH=$(git -C "$RAIZ_REPOSITORIO" config core.hooksPath)
echo "✅ Git hooks path configured: $HOOKS_PATH"

echo ""
echo "📋 Configured hooks:"
echo ""
echo "=== pre-commit ==="
cat .husky/pre-commit
echo ""
echo "=== commit-msg ==="
cat .husky/commit-msg
echo ""

echo "✅ Husky hooks setup complete!"
echo ""
echo "🎯 Hooks configured:"
echo "  • pre-commit: Runs 'pnpm validate' (lint + typecheck) in web/"
echo "  • commit-msg: Validates conventional commit format"
echo ""
echo "💡 Test with: git commit -m \"test: verify hooks\""
