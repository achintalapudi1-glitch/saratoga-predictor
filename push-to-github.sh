#!/usr/bin/env bash
# ============================================================
# Saratoga Handicapper — Push to GitHub
# ============================================================
# Usage:
#   chmod +x push-to-github.sh
#   ./push-to-github.sh YOUR_GITHUB_USERNAME
# ============================================================

set -e

REPO_NAME="saratoga-handicapper"
USERNAME="${1:-YOUR_GITHUB_USERNAME}"

if [ "$USERNAME" = "YOUR_GITHUB_USERNAME" ]; then
  echo "❌  Please supply your GitHub username:"
  echo "    ./push-to-github.sh myusername"
  exit 1
fi

echo "🏇  Creating GitHub repo: ${USERNAME}/${REPO_NAME}"
echo ""

# Option A — GitHub CLI (recommended)
if command -v gh &>/dev/null; then
  echo "✅  gh CLI found — using it to create the repo..."
  gh auth login                                           # prompts for browser auth
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
  echo ""
  echo "🎉  Done! Your repo is at: https://github.com/${USERNAME}/${REPO_NAME}"
  exit 0
fi

# Option B — Manual push via HTTPS token
echo "ℹ️   gh CLI not found. Using git + Personal Access Token."
echo ""
echo "1. Create a PAT at: https://github.com/settings/tokens/new"
echo "   Scopes needed: repo"
echo ""
read -rsp "Paste your GitHub Personal Access Token: " TOKEN
echo ""

REMOTE_URL="https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git"

# Create repo via API
echo "📦  Creating repo via GitHub API..."
curl -s -X POST \
  -H "Authorization: token ${TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"${REPO_NAME}\",\"description\":\"🏇 AI-powered Saratoga Race Course Handicapper\",\"public\":true}" \
  | python3 -m json.tool | grep '"full_name"' || echo "(repo may already exist)"

echo ""
echo "🚀  Pushing code..."
git remote add origin "$REMOTE_URL" 2>/dev/null || git remote set-url origin "$REMOTE_URL"
git push -u origin main

echo ""
echo "🎉  Done! Visit: https://github.com/${USERNAME}/${REPO_NAME}"
