import { mkdir } from 'node:fs/promises';
import process from 'node:process';

import { chromium, expect } from '@playwright/test';

const url = process.env.CHAT_PREVIEW_URL ?? 'http://127.0.0.1:5173';
const output = 'browser-check.local';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];

async function assertLayout(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  const input = await page.getByRole('textbox').boundingBox();
  expect(input).not.toBeNull();
  expect(input.y + input.height).toBeLessThanOrEqual(
    page.viewportSize().height,
  );
}

try {
  for (const width of [360, 768, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 800 },
      permissions: ['clipboard-read', 'clipboard-write'],
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(url);
    const input = page.getByRole('textbox', { name: 'Message the assistant' });
    await expect(input).toBeVisible();
    await assertLayout(page);
    await page.screenshot({ path: `${output}/empty-${width}.png` });
    await input.fill('How do I prepare');
    await input.press('Shift+Enter');
    await input.pressSequentially('for a doctor visit?');
    await expect(input).toHaveValue('How do I prepare\nfor a doctor visit?');
    await input.press('Enter');
    await page.getByRole('button', { name: 'Stop generating' }).click();
    await expect(
      page.getByRole('button', { name: 'Send message' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Regenerate last reply' }).click();
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('code .token.property').first()).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: 'Copy code' }).click();
    await expect(
      page.getByRole('button', { name: 'Code copied' }),
    ).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      '"symptom"',
    );
    await assertLayout(page);
    await page.screenshot({ path: `${output}/reply-${width}.png` });
    await page.getByRole('button', { name: 'Edit last message' }).click();
    await expect(input).toBeFocused();
    await input.fill('chest pain');
    await input.press('Enter');
    await expect(page.getByRole('alert')).toContainText(
      'Seek emergency help now',
      { timeout: 15_000 },
    );
    await expect(page.getByRole('link', { name: 'nhs.uk' })).toBeVisible();
    await expect(
      page.getByRole('article', { name: 'Your message' }),
    ).toHaveCount(1);
    await assertLayout(page);
    await page.screenshot({ path: `${output}/emergency-${width}.png` });
    await context.setOffline(true);
    await input.fill('Offline question');
    await input.press('Enter');
    await expect(page.getByRole('alert').last()).toContainText(
      'You are offline',
    );
    await expect(input).toHaveValue('Offline question');
    await context.setOffline(false);
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 });
    await assertLayout(page);
    await page.evaluate(async () => {
      const { useChatStore } =
        await import('/src/features/chat/store/chatStore.ts');
      const messages = Array.from({ length: 120 }, (_, index) => ({
        id: `test-${index}`,
        role: index % 2 ? 'assistant' : 'user',
        createdAt: index,
        status: 'complete',
        content:
          index % 2
            ? `## Reply ${index}\n\n${'Longword'.repeat(80)}\n\n\`\`\`json\n{"long":"${'x'.repeat(300)}"}\n\`\`\``
            : `Question ${index}`,
      }));
      useChatStore.setState({ messages, generating: false, error: null });
    });
    await expect(page.locator('[data-index]').first()).toBeVisible();
    expect(await page.locator('article').count()).toBeLessThan(50);
    await assertLayout(page);
    const scroller = page.getByRole('region', {
      name: 'Conversation messages',
    });
    await scroller.evaluate((element) => {
      element.scrollTop = 0;
    });
    await expect(page.locator('[data-index="0"]')).toBeVisible();
    await page.evaluate(async () => {
      const { useChatStore } =
        await import('/src/features/chat/store/chatStore.ts');
      useChatStore.setState((state) => ({
        messages: state.messages.map((message, index) =>
          index === state.messages.length - 1
            ? { ...message, content: `${message.content}\nMore content` }
            : message,
        ),
      }));
    });
    expect(
      await scroller.evaluate((element) => element.scrollTop),
    ).toBeLessThan(100);
    await page.screenshot({ path: `${output}/virtual-${width}.png` });
    await context.close();
    process.stdout.write(`Browser checks passed at ${width}px\n`);
  }
  expect(errors).toEqual([]);
} finally {
  await browser.close();
}
