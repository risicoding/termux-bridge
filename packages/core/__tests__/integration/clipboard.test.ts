import { describe, expect, it } from "vitest";
import { Clipboard } from "@/modules/clipboard";

describe("Clipboard integration", () => {
  it("should set and get clipboard contents", async () => {
    const text = `termux-bridge-test-${Date.now()}`;

    const setResult = await Clipboard.setClipboard(text);

    expect(setResult.isOk()).toBe(true);

    const getResult = await Clipboard.getClipboard();

    expect(getResult.isOk()).toBe(true);

    if (getResult.isErr()) {
      throw getResult.error;
    }

    expect(getResult.value).toBe(text);
  });

  it("should preserve multiline clipboard contents", async () => {
    const text = `Termux Bridge
integration test
${Date.now()}`;

    const setResult = await Clipboard.setClipboard(text);

    expect(setResult.isOk()).toBe(true);

    const getResult = await Clipboard.getClipboard();

    expect(getResult.isOk()).toBe(true);

    if (getResult.isErr()) {
      throw getResult.error;
    }

    expect(getResult.value).toBe(text);
  });

  it("should handle an empty clipboard value", async () => {
    const text = "";

    const setResult = await Clipboard.setClipboard(text);

    expect(setResult.isOk()).toBe(true);

    const getResult = await Clipboard.getClipboard();

    expect(getResult.isOk()).toBe(true);

    if (getResult.isErr()) {
      throw getResult.error;
    }

    expect(getResult.value).toBe(text);
  });
});
