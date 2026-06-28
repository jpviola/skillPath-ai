import { describe, it, expect } from "vitest";
import { rateLimit } from "../rateLimit";

describe("rateLimit", () => {
  it("allows requests within the limit", async () => {
    // Default: 10 requests per 60s window.
    // Use a unique key so the module's internal map is fresh for this test.
    const key = `allow-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      const result = await rateLimit(key);
      expect(result.ok).toBe(true);
      expect(result.retryAfter).toBe(0);
    }
  });

  it("blocks requests exceeding the limit", async () => {
    const key = `block-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      await rateLimit(key);
    }
    const result = await rateLimit(key);
    expect(result.ok).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("tracks different keys independently", async () => {
    const keyA = `independent-a-${Date.now()}`;
    const keyB = `independent-b-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      await rateLimit(keyA);
    }
    // keyA should be blocked
    expect((await rateLimit(keyA)).ok).toBe(false);
    // keyB should still be allowed
    expect((await rateLimit(keyB)).ok).toBe(true);
  });

  it("returns ok and retryAfter properties", async () => {
    const key = `props-${Date.now()}`;
    const result = await rateLimit(key);
    expect(result).toHaveProperty("ok");
    expect(result).toHaveProperty("retryAfter");
    expect(typeof result.ok).toBe("boolean");
    expect(typeof result.retryAfter).toBe("number");
  });
});
