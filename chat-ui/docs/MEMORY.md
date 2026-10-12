# Memory and resource lifecycle

## Phase 1

- `abortableDelay` clears its timer and removes its abort listener on
  cancellation, and removes the listener on normal completion.
- Mock requests check AbortSignal before and after every awaited delay.
- HTTP requests pass AbortSignal directly to fetch and check cancellation
  after asynchronous work. Providers do not own React state.
- The SSE parser cancels its reader when aborted or when iteration ends,
  releases the reader lock in `finally`, and removes the abort listener.
  Buffered event data is limited to approximately one million characters.
- `useDialog` removes click and cancel listeners on cleanup, closes the
  native dialog, and restores focus to the previously focused element.
  Native modal dialogs provide focus containment and Escape events.
- Shared visual primitives have no timers or subscriptions.

## Phase 2

- `useChatStream` owns one AbortController in a ref. Stop, unmount, and
  starting a new request abort it. Async continuations check mount status,
  controller identity, and cancellation before updating the store.
- Deltas are batched for approximately 40ms. Stop flushes already received
  text, preserves the partial reply, and clears the timer. Completion uses
  the provider's authoritative final reply. Tests prove late results cannot
  overwrite a stopped stream and unmount leaves no pending updates.
- Completed messages preserve their object identity. MessageBubble and the
  lazy markdown renderer are memoized; only the active message changes.
- Active messages are capped at 200. History sent to the backend is capped
  at 20 completed entries. Phase 2 state is transient; durable storage and
  archival of older messages belong to Phase 3.
- `useAutoScroll` removes its passive scroll listener, disconnects its
  ResizeObserver, and cancels its animation frame on unmount. It follows
  content only when the user is within 100px of the bottom.
- Above 100 messages, TanStack Virtual owns measurement observers and
  their cleanup. Its mutable virtualizer remains outside compiler memoization.
- `useAutoResizeTextarea` removes its resize listener on cleanup.
- Syntax highlighting uses a cancellation flag around dynamic imports.
  Highlighted content is rendered as text tokens, without injected HTML.
- Clipboard work checks mount status after awaiting the browser API and
  clears the feedback timer on unmount. No object URLs are created.

## Planned verification in later phases

Phase 3 will document bounded conversation state, durable message archival,
debounced persistence, and matchMedia cleanup.
Phase 4 will document online/offline listeners, PWA subscriptions, and
install prompt cleanup. These features are not implemented yet.
