import { beforeEach, describe, expect, it, vi } from "vitest";
import { Clipboard } from "@/modules/clipboard";
import { execFileAsync } from "@/lib/utils";

vi.mock("@/lib/utils", () => ({
  execFileAsync: vi.fn(),
}));

const mockedExecFileAsync = vi.mocked(execFileAsync);

describe("Clipboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getClipboard", () => {
    it("returns clipboard contents when execution succeeds", async () => {
      mockedExecFileAsync.mockResolvedValue({
        stdout: "Hello, world!",
        stderr: "",
      });

      const result = await Clipboard.getClipboard();

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBe("Hello, world!");
      }

      expect(mockedExecFileAsync).toHaveBeenCalledOnce();
      expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-clipboard-get");
    });

    it("returns ClipboardError when execution fails", async () => {
      const error = new Error("Command failed");

      mockedExecFileAsync.mockRejectedValue(error);

      const result = await Clipboard.getClipboard();

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Clipboard.ClipboardError);

        expect(result.error.message).toBe("cant get clipboard");
      }

      expect(mockedExecFileAsync).toHaveBeenCalledOnce();
      expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-clipboard-get");
    });

    it("returns an empty string when the clipboard is empty", async () => {
      mockedExecFileAsync.mockResolvedValue({
        stdout: "",
        stderr: "",
      });

      const result = await Clipboard.getClipboard();

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBe("");
      }
    });
  });

  describe("setClipboard", () => {
    it("sets clipboard contents successfully", async () => {
      mockedExecFileAsync.mockResolvedValue({
        stdout: "",
        stderr: "",
      });

      const result = await Clipboard.setClipboard("Hello, world!");

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBe(undefined);
      }

      expect(mockedExecFileAsync).toHaveBeenCalledOnce();
      expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-clipboard-set", [
        "Hello, world!",
      ]);
    });

    it("returns ClipboardError when execution fails", async () => {
      const error = new Error("Command failed");

      mockedExecFileAsync.mockRejectedValue(error);

      const result = await Clipboard.setClipboard("Hello, world!");

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Clipboard.ClipboardError);

        expect(result.error.message).toBe("cant set clipboard");
      }

      expect(mockedExecFileAsync).toHaveBeenCalledOnce();
      expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-clipboard-set", [
        "Hello, world!",
      ]);
    });

    it("passes the supplied text to termux-clipboard-set", async () => {
      mockedExecFileAsync.mockResolvedValue({
        stdout: "",
        stderr: "",
      });

      await Clipboard.setClipboard("some random text 123");

      expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-clipboard-set", [
        "some random text 123",
      ]);
    });
  });
});
