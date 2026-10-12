# Health Assistant UI

A standalone React UI with fake sample data, no backend, and no API keys.

## Run

```sh
pnpm install && pnpm dev
```

The project records the machine's pnpm 10.29.3. Vite requires
`^20.19.0 || >=22.12.0`; Vitest requires Node 22.12 or newer.
This machine uses Node 22.17.1.

## Architecture

- `src/app`: application shell and global styles.
- `src/features`: chat, conversation history, settings, and PWA features.
- `src/providers`: typed mock and HTTP implementations.
- `src/shared`: accessible controls, lifecycle helpers, and limits.
- `src/test`: test environment setup.
- `docs`: backend contract and memory lifecycle documentation.

Components use `chatService`; only the HTTP provider calls fetch.
The mock streams sample markdown, tables, and code. Messages containing
`chest pain` return emergency metadata and a sample source.

## Backend configuration

Copy `.env.example` to `.env.local`, set the following, then restart Vite:

```dotenv
VITE_CHAT_PROVIDER=http
VITE_AI_API_URL=http://localhost:8000
```

The backend must implement `docs/api-contract.md` and allow the frontend
origin through CORS. `VITE_*` variables are public: never store keys in them.
To add a provider, implement `ChatProvider` from `src/providers/types.ts`
and register it in `src/providers/index.ts`. Preserve AbortSignal support.

## Tooling and compatibility

Scripts: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `format`.
Tailwind uses its Vite plugin and CSS import. ESLint uses flat configuration.
Authored files must stay below 250 lines; the generated lockfile is exempt
with user approval.

Current registry metadata was checked before installation:

- ESLint and @eslint/js 9.39.5 are the newest supported by the latest
  jsx-a11y and import plugins. ESLint 10 exceeds their peer ranges.
  ESLint 9 is deprecated; retaining its warning was explicitly approved.
- TypeScript 6.0.3 is the newest compatible with typescript-eslint's
  requirement of TypeScript below 6.1. Latest TypeScript is 7.0.2.
- jsdom 29.1.1 supports this Node installation; jsdom 30.1.2 requires
  Node 22.22.2 or newer on the Node 22 branch.
- Latest Vite, Tailwind, Vitest, and vite-plugin-pwa have compatible peers.
- Workbox's dependency tree currently includes deprecated glob 11.1.0.
  The latest glob 13.0.6 is outside Workbox's declared major range, so it
  is not overridden. This transitive warning remains visible.

## Delivery status

Phases 1 and 2 deliver foundation, tooling, shared controls, providers,
and chat interactions: streaming, Stop, markdown, code copying, last-message
editing, regeneration, retry, sources, and emergency information.
Type in the message box at the bottom; Enter sends and Shift+Enter adds a line.
Phase 2 messages are held in memory and reset on reload. Active messages are
capped at 200. Phase 3 adds conversations, durable storage, and theme.
Phase 4 delivers PWA icons, replacement instructions, complete tests,
memory documentation, and final version/security audits.

## Browser checks

With Vite running and Microsoft Edge installed, run:

```sh
node scripts/chat-browser-check.mjs
```

Playwright checks 360/768/1280px layouts, send/Stop, editing, regeneration,
copy, emergency metadata, offline retry, and virtualized message scrolling.
Screenshots are written to ignored `browser-check.local/`.
Markdown and highlighter chunks stay lazy in production. Vite prebundles
their dependencies during development to avoid a first-use optimizer reload.
