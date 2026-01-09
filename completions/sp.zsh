#compdef sp

_sp() {
  local -a commands subcommands merchants
  
  commands=(
    'add:Add a new merchant to the database'
    'remove:Remove a merchant from the database'
    'list:List all merchants'
  )
  
  case $words[2] in
    add)
      _message 'add <name> <handle>'
      ;;
    remove)
      # Try to load merchants from the JSON file for completion
      if [[ -f "$HOME/.shopify-partner/stores.json" ]]; then
        merchants=(${(f)"$(cat "$HOME/.shopify-partner/stores.json" | grep -o '"name":"[^"]*"' | sed 's/"name":"\([^"]*\)"/\1/' | head -20)"})
        if [[ -n "$merchants" ]]; then
          _describe 'merchants' merchants
        else
          _message 'remove [name]'
        fi
      else
        _message 'remove [name]'
      fi
      ;;
    list)
      _message 'list'
      ;;
    *)
      if [[ $CURRENT -eq 2 ]]; then
        _describe 'sp commands' commands
      else
        # For default command (search), try to complete with merchant names
        if [[ -f "$HOME/.shopify-partner/stores.json" ]]; then
          merchants=(${(f)"$(cat "$HOME/.shopify-partner/stores.json" | grep -o '"name":"[^"]*"' | sed 's/"name":"\([^"]*\)"/\1/' | head -20)"})
          if [[ -n "$merchants" ]]; then
            _describe 'merchants' merchants
          else
            _files
          fi
        else
          _files
        fi
      fi
      ;;
  esac
}

_sp "$@"
