# AI chat API contract

Base URL: `VITE_AI_API_URL`. Frontend sends no API keys.

## POST /v1/chat

Request:

```json
{
  "conversationId": "string",
  "message": "string (1-4000 chars)",
  "history": [{ "role": "user", "content": "string" }],
  "channel": "webchat"
}
```

History contains at most 20 entries; role is `user` or `assistant`.

Response 200:

```json
{
  "reply": "string",
  "needsHuman": false,
  "emergency": false,
  "sources": ["string"]
}
```

## POST /v1/chat/stream

Same request. Response is `Content-Type: text/event-stream`.
Each event ends with an empty line.

```text
event: delta
data: {"delta":"text"}

event: done
data: {"reply":"...","needsHuman":false,"emergency":false,"sources":[]}

event: error
data: {"message":"..."}

```

The client uses fetch with POST and AbortSignal, not EventSource.
`done` is required for successful completion. Its reply is authoritative.

## GET /health

```json
{ "status": "ok", "model": "...", "provider": "..." }
```

## Errors

Statuses: 401, 422, 429, 503.

```json
{ "error": { "code": "string", "message": "string" } }
```

- 401: Your session is not authorized. Please sign in again.
- 422: Please check your message and try again.
- 429: Too many requests, please wait
- 503: Assistant is unavailable

Allow the frontend origin via CORS. Do not cache `/v1` endpoints.
