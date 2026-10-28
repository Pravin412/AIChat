# AIChat

AIChat is a React-based health assistant chat UI. The repository currently
contains a standalone frontend app in `chat-ui` with mock chat streaming,
markdown rendering, source display, emergency metadata handling, and optional
HTTP provider support for a backend.

## Project Structure

```text
.
+-- chat-ui/
    +-- docs/              Backend contract and memory notes
    +-- public/            Static assets
    +-- scripts/           Local validation and browser checks
    +-- src/
    |   +-- app/           App shell and global styles
    |   +-- features/      Chat UI, state, hooks, and services
    |   +-- providers/     Mock and HTTP chat providers
    |   +-- shared/        Shared hooks, utilities, and UI components
    |   +-- test/          Test setup
    +-- README.md          Detailed frontend documentation
```

## Requirements

- Node.js `^20.19.0 || >=22.12.0`
- pnpm `10.29.3`

The frontend package records its package manager version in
`chat-ui/package.json`.

## Getting Started

```sh
cd chat-ui
pnpm install
pnpm dev
```

Vite will print the local development URL after startup.

## Available Scripts

Run these from `chat-ui`:

```sh
pnpm dev        # Start the Vite dev server
pnpm build      # Type-check and build for production
pnpm preview    # Preview the production build
pnpm lint       # Run ESLint and local line-length checks
pnpm typecheck  # Run TypeScript checks
pnpm test       # Run the Vitest test suite
pnpm format     # Format files with Prettier
```

## Backend Configuration

The app runs with mock data by default. To use a backend, copy
`chat-ui/.env.example` to `chat-ui/.env.local` and configure:

```dotenv
VITE_CHAT_PROVIDER=http
VITE_AI_API_URL=http://localhost:8000
```

The backend should implement the API described in
`chat-ui/docs/api-contract.md`. Do not store API keys or secrets in `VITE_*`
variables because they are exposed to the browser.

## Testing

Unit and component tests use Vitest:

```sh
cd chat-ui
pnpm test
```

With the Vite dev server running, browser checks can be run with:

```sh
node scripts/chat-browser-check.mjs
```

## Documentation

- `chat-ui/README.md` has the detailed frontend architecture and delivery
  notes.
- `chat-ui/docs/api-contract.md` describes the expected backend API.
- `chat-ui/docs/MEMORY.md` documents memory and lifecycle behavior.
