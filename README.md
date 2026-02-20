# beepctl 🐝

[![npm version](https://img.shields.io/npm/v/beepctl.svg)](https://www.npmjs.com/package/beepctl)
[![CI](https://github.com/blqke/beepctl/actions/workflows/ci.yml/badge.svg)](https://github.com/blqke/beepctl/actions/workflows/ci.yml)

CLI for [Beeper Desktop API](https://developers.beeper.com/desktop-api) - unified messaging from your terminal. Give your AI agents the power to chat across all your messaging platforms.

> **Disclaimer:** This is an unofficial project. Not affiliated with, endorsed by, or sponsored by Beeper. The Beeper Desktop API is still in beta — expect breaking changes.

## Requirements

- [Beeper Desktop](https://www.beeper.com/download) v4.1.169+
- Beeper Desktop API enabled (Settings → Developers → Enable)
- Node.js 20+ or Bun

## Installation

```bash
# From npm
npm install -g beepctl

# Or use directly with npx
npx beepctl <command>

# From source
pnpm install
pnpm build
pnpm link --global
```

## Setup

1. Open Beeper Desktop
2. Go to **Settings → Developers**
3. Enable **Beeper Desktop API**
4. Click **"+"** next to "Approved connections" to create a token
5. *(Optional)* Enable **"Allow sensitive actions"** on the token to send messages
6. Configure the CLI:

```bash
beepctl auth set <your-token>
# Or use environment variable
export BEEPER_TOKEN=<your-token>
```

## Configuration

Config stored at `~/.config/beepctl/config.json` with token, base URL, and aliases.

**Precedence:** Environment variables (`BEEPER_TOKEN`, `BEEPER_URL`) override config file.

## Usage

### Auth Management

```bash
beepctl auth show           # Check auth status
beepctl auth set <token>    # Set API token
beepctl auth clear          # Clear stored token
```

### Accounts

```bash
beepctl accounts            # List all connected accounts
```

### Chats

```bash
# List chats
beepctl chats list                            # List inbox (non-archived)
beepctl chats list --limit 50                 # Limit results
beepctl chats list --search "John"            # Filter by name
beepctl chats list --inbox archive            # Archived chats only
beepctl chats list --inbox low-priority       # Low-priority chats
beepctl chats list --inbox all                # All chats (including archived)
beepctl chats list --type group               # Filter by type (single/group/any)
beepctl chats list --unread-only              # Unread chats only
beepctl chats list --activity-after "1d ago"  # Recent activity filter

# Chat details
beepctl chats show <chat-id>                  # Detailed info with participants

# Create chat
beepctl chats create <account-id> <user-ids...>  # Create new single/group chat
```

**Inbox filters:** `primary` (default), `archive`, `low-priority`, `all`

### Messages

Browse messages in a specific chat:

```bash
beepctl messages <chat-id>                    # List recent messages
beepctl messages <chat-id> --limit 20         # Limit results
beepctl messages <chat-id> --after "1d ago"   # Messages after a time
beepctl messages <chat-id> --before "1h ago"  # Messages before a time
beepctl messages <chat-id> --json             # JSON output (includes attachment mxc URLs)
beepctl messages work                         # Use alias
```

Download attachments from recent messages with `jq`:

```bash
beepctl messages <chat-id> --limit 50 --json \
  | jq -r '.[].attachments[]?.mxcUrl | select(startswith("mxc://") or startswith("localmxc://"))' \
  | while read -r url; do beepctl download "$url"; done
```

### Search

Search messages across all chats:

```bash
beepctl search "meeting tomorrow"
beepctl search "deadline" --limit 10
beepctl search "deadline" --chat work --sender me --after "1d ago"
beepctl search "photo" --media image video
beepctl search "discussion" --chat-type group --before "yesterday"
```

#### Search Filters

```bash
# Filter by chat (supports aliases, space or comma-separated)
beepctl search "hello" --chat work family
beepctl search "test" --chat id1,id2,id3

# Filter by time range (relative dates)
beepctl search "meeting" --after "1d ago" --before "1h ago"
beepctl search "report" --after "yesterday"

# Filter by sender
beepctl search "question" --sender me        # Only my messages
beepctl search "update" --sender others      # Messages from others

# Filter by media type
beepctl search "screenshot" --media image
beepctl search "files" --media file link

# Filter by chat type
beepctl search "announcement" --chat-type group
beepctl search "dm" --chat-type single

# Filter by account
beepctl search "slack message" --account <account-id>

# Combine filters
beepctl search "deploy" --chat work --sender others --after "1d ago" --media link

# Include/exclude options
beepctl search "todo" --include-low-priority
beepctl search "important" --exclude-muted
```

**Time formats:** `1h ago`, `2d ago`, `3w ago`, `1mo ago`, `yesterday`, `today`

**Media types:** `any`, `video`, `image`, `link`, `file`

### Send Messages

```bash
beepctl send <chat-id> "Hello!"                      # Send message
beepctl send myself "Quick note"                     # Send to yourself
beepctl send <chat-id> "Thanks!" --reply-to <msg-id> # Reply to message
beepctl send <chat-id> "msg" --quiet                 # No confirmation output
```

### Focus (Bring to Foreground)

Bring Beeper Desktop to foreground and optionally open a chat:

```bash
beepctl focus                             # Bring Beeper to foreground
beepctl focus <chat-id>                   # Open a specific chat
beepctl focus work                        # Use alias
beepctl focus <chat-id> -m <msg-id>       # Jump to specific message
beepctl focus <chat-id> -d "draft text"   # Pre-fill draft text
beepctl focus <chat-id> -a /path/to/file  # Pre-fill draft attachment
```

**Tip:** Use focus with `-a` to send media (images, files) since `send` only supports text:

```bash
beepctl focus <chat-id> -a /path/to/image.png -d "Check this out!"
# Then press Enter in Beeper to send
```

### Archive

```bash
beepctl archive <chat-id>              # Archive a chat
beepctl archive <chat-id> --unarchive  # Unarchive a chat
beepctl archive work                   # Use alias
beepctl archive <chat-id> --quiet      # No confirmation message
```

### Aliases

Create shortcuts for frequently used chat IDs:

```bash
beepctl alias list                    # List all aliases
beepctl alias add work <chat-id>      # Create alias
beepctl alias show work               # Show alias value
beepctl alias remove work             # Remove alias
beepctl send work "Using alias!"      # Use alias in any command
```

### Contacts

```bash
beepctl contacts search <account-id> <query>  # Search contacts on an account
```

### Download Attachments

Download message attachments (mxc:// URLs):

```bash
beepctl download <mxc-url>              # Download to current directory
beepctl download <mxc-url> -o /path     # Save to specific path
```

### Reminders

Set reminders to follow up on chats:

```bash
beepctl reminders set <chat-id> 30m      # Remind in 30 minutes
beepctl reminders set <chat-id> 1h       # Remind in 1 hour
beepctl reminders set <chat-id> 2d       # Remind in 2 days
beepctl reminders set <chat-id> tomorrow # Remind tomorrow
beepctl reminders clear <chat-id>        # Clear reminder
```

## Development

```bash
# Run in dev mode
pnpm dev -- accounts

# Run tests
pnpm test

# Lint
pnpm lint
pnpm lint:fix

# Build
pnpm build

# Create standalone binary
pnpm binary
```

## Project Structure

```
src/
├── cli.ts           # Entry point - command registration
├── index.ts         # Library exports
├── version.ts       # Version info
├── commands/        # CLI commands
│   ├── auth.ts      # Token management
│   ├── accounts.ts  # List accounts
│   ├── alias.ts     # Alias management
│   ├── archive.ts   # Archive/unarchive chats
│   ├── chats.ts     # Browse chats
│   ├── contacts.ts  # Search contacts
│   ├── download.ts  # Download attachments
│   ├── focus.ts     # Bring Beeper to foreground
│   ├── messages.ts  # List messages in a chat
│   ├── reminders.ts # Chat reminders
│   ├── search.ts    # Search messages/chats
│   └── send.ts      # Send messages
└── lib/             # Core logic
    ├── client.ts    # Beeper API client wrapper
    ├── config.ts    # Config file management (~/.config/beepctl/)
    ├── aliases.ts   # Alias resolution utilities
    └── dates.ts     # Relative date parsing
```

## Stack

- **TypeScript** with plain `tsc`
- **Commander** for CLI framework
- **Kleur** for colors/styling
- **Vitest** for testing
- **Biome** + **oxlint** for linting/formatting
- **Bun** for standalone binary compilation
- **@beeper/desktop-api** SDK

## AI Agent Integration

beepctl includes an [Agent Skill](https://agentskills.io) for AI coding assistants.

**Supported agents:** Claude Code, Cursor, VS Code, GitHub Copilot, OpenAI Codex, Gemini CLI, Goose, Amp, and [25+ more](https://agentskills.io).

### Install via npx skills

```bash
npx skills add blqke/beepctl
```

### Manual install (Claude Code)

```bash
cp -r skills/beepctl ~/.claude/skills/
```

### Manual install (Cursor)

```bash
cp -r skills/beepctl ~/.cursor/skills/
```

## Acknowledgments

Inspired by [beeper-cli](https://github.com/krausefx/beeper-cli) by [@krausefx](https://github.com/krausefx).

The author uses beepctl alongside [clawdbot](https://github.com/blqke/clawdbot).

## License

MIT
