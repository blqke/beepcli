# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.6] - 2026-03-23

### Added

- Added `beepctl react <chat-id> <message-id> <reaction-key>` to add emoji, shortcode, or custom emoji reactions to existing messages.
- Added `beepctl react --remove` to remove the authenticated user's reaction for a reaction key.
- Added focused command tests covering add, remove, alias resolution, quiet mode, and shared write-permission errors.
- Updated README and packaged skill docs with reaction command usage and semantics.

### Changed

- Upgraded `@beeper/desktop-api` to `4.7.0` to use the official SDK reaction methods exposed at `client.chats.messages.reactions.*`.


## [0.1.5] - 2026-02-20

### Added

- Added `beepctl messages --json` output for scripting workflows, including attachment `mxcUrl` fields.
- Added MXC URL display in `beepctl messages` text output for attachments when available.
- Added README example showing `messages --json | jq | download` attachment pipeline.

### Fixed

- Improved attachment MXC URL detection to support `srcURL` and `id` fallback fields.
- Fixed `messages --json` attachment typing to keep TypeScript compatibility.

## [0.1.3] - 2025-01-25

### Changed

- Renamed config directory from `~/.config/beepcli/` to `~/.config/beepctl/`
- Auto-migration: existing config is automatically moved to new location on first run
- Updated README with complete documentation for all commands

## [0.1.2] - 2025-01-20

### Changed

- Renamed CLI command from `beep` to `beepctl` for consistency with package name

## [0.1.1] - 2025-01-20

### Changed

- Renamed package from `beepcli` to `beepctl`
- Added npm installation instructions to README
- Updated repository URLs

## [0.1.0] - 2025-01-20

### Added

- Initial release
- Core commands: inbox, chats, chat, send, search, open, mark, alias, status
- Extended commands: reminders, contacts, messages, archive, download, focus
- Alias management for quick chat access
- Reply-to and `@me` shortcut support in send
- Natural language time parsing for reminders
- Search with network type display
- Inbox filtering by network
- MIT License

### Changed

- Migrated to official `@beeper/desktop-api` SDK

[0.1.6]: https://github.com/blqke/beepctl/releases/tag/v0.1.6
[0.1.5]: https://github.com/blqke/beepctl/releases/tag/v0.1.5
[0.1.3]: https://github.com/blqke/beepctl/releases/tag/v0.1.3
[0.1.2]: https://github.com/blqke/beepctl/releases/tag/v0.1.2
[0.1.1]: https://github.com/blqke/beepctl/releases/tag/v0.1.1
[0.1.0]: https://github.com/blqke/beepctl/releases/tag/v0.1.0
