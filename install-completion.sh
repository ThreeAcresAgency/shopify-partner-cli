#!/bin/bash
# Installation script for sp command autocomplete

COMPLETION_DIR="$HOME/.zsh/completions"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create completions directory if it doesn't exist
mkdir -p "$COMPLETION_DIR"

# Copy completion script
cp "$SCRIPT_DIR/completions/sp.zsh" "$COMPLETION_DIR/_sp"

# Add to .zshrc if not already present
if ! grep -q "fpath=(\$HOME/.zsh/completions \$fpath)" "$HOME/.zshrc" 2>/dev/null; then
  echo "" >> "$HOME/.zshrc"
  echo "# sp command autocomplete" >> "$HOME/.zshrc"
  echo "fpath=(\$HOME/.zsh/completions \$fpath)" >> "$HOME/.zshrc"
  echo "autoload -Uz compinit && compinit" >> "$HOME/.zshrc"
fi

echo "✓ Autocomplete installed! Run 'source ~/.zshrc' or restart your terminal."
