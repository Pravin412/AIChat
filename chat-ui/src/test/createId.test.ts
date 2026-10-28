import { afterEach, expect, it, vi } from 'vitest';

import { createId } from '../shared/utils/createId';

afterEach(() => vi.unstubAllGlobals());

it('creates UUIDs when randomUUID is unavailable on an HTTP LAN origin', () => {
  const getRandomValues = crypto.getRandomValues.bind(crypto);
  vi.stubGlobal('crypto', { getRandomValues });

  const id = createId();
  expect(id).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  expect(createId()).not.toBe(id);
});
