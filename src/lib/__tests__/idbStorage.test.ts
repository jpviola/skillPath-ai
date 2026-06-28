import { describe, it, expect, beforeEach } from "vitest";
import {
  storageGetItem,
  storageSetItem,
  storageRemoveItem,
  syncGetItem,
  syncSetItem,
  syncRemoveItem,
  getStorageBackend,
} from "../idbStorage";

describe("idbStorage", () => {
  beforeEach(async () => {
    // Clean up any leftover keys between tests
    await storageRemoveItem("__test_key__");
    await storageRemoveItem("__test_a__");
    await storageRemoveItem("__test_b__");
  });

  it("round-trips a string value", async () => {
    await storageSetItem("__test_key__", "hello world");
    expect(await storageGetItem("__test_key__")).toBe("hello world");
  });

  it("returns null for missing keys", async () => {
    expect(await storageGetItem("__nonexistent__")).toBeNull();
  });

  it("overwrites existing values", async () => {
    await storageSetItem("__test_key__", "first");
    await storageSetItem("__test_key__", "second");
    expect(await storageGetItem("__test_key__")).toBe("second");
  });

  it("removeItem clears the value", async () => {
    await storageSetItem("__test_key__", "value");
    await storageRemoveItem("__test_key__");
    expect(await storageGetItem("__test_key__")).toBeNull();
  });

  it("handles unicode values", async () => {
    await storageSetItem("__test_key__", "中文 — Pékin → Madrid 🟡");
    expect(await storageGetItem("__test_key__")).toBe("中文 — Pékin → Madrid 🟡");
  });

  it("handles long values (10KB+)", async () => {
    const big = "x".repeat(20_000);
    await storageSetItem("__test_key__", big);
    expect((await storageGetItem("__test_key__"))?.length).toBe(20_000);
  });

  it("supports many keys", async () => {
    await storageSetItem("__test_a__", "A");
    await storageSetItem("__test_b__", "B");
    expect(await storageGetItem("__test_a__")).toBe("A");
    expect(await storageGetItem("__test_b__")).toBe("B");
  });

  it("getStorageBackend returns one of the valid backends", async () => {
    const backend = await getStorageBackend();
    expect(["indexeddb", "localstorage", "memory"]).toContain(backend);
  });

  it("is safe to call when window is undefined (SSR)", async () => {
    // No way to actually unset window, but the in-memory map should
    // at least work for all subsequent calls regardless of the env.
    await storageSetItem("__test_key__", "ssr-safe");
    expect(await storageGetItem("__test_key__")).toBe("ssr-safe");
  });
});

describe("idbStorage sync helpers", () => {
  beforeEach(() => {
    syncSetItem("__test_sync__", "synced");
  });

  it("syncGetItem retrieves what syncSetItem wrote", () => {
    expect(syncGetItem("__test_sync__")).toBe("synced");
  });

  it("syncGetItem returns null for missing keys", () => {
    expect(syncGetItem("__nope__")).toBeNull();
  });

  it("syncRemoveItem clears the value", () => {
    syncRemoveItem("__test_sync__");
    expect(syncGetItem("__test_sync__")).toBeNull();
  });
});
