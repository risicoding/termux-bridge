import { beforeEach, describe, expect, it, vi } from "vitest";
import { Notification } from "@/modules/notification";
import { execFileAsync } from "@/lib/utils";

vi.mock("@/lib/utils", () => ({
  execFileAsync: vi.fn(),
}));

const mockedExecFileAsync = vi.mocked(execFileAsync);

describe("Notification.notification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("executes termux-notification with the correct arguments", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "",
      stderr: "",
    });

    const result = await Notification.notification({
      title: "Hello",
      content: "World",
    });

    expect(result.isOk()).toBe(true);

    expect(mockedExecFileAsync).toHaveBeenCalledOnce();
    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-notification", [
      "--content",
      "World",
      "--title",
      "Hello",
    ]);
  });

  it("adds boolean flags only when true", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "",
      stderr: "",
    });

    const result = await Notification.notification({
      alertOnce: true,
      ongoing: true,
      sound: true,
      mediaNext: true,
      mediaPause: true,
      title: "Test",
    });

    expect(result.isOk()).toBe(true);

    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-notification", [
      "--alert-once",
      "--ongoing",
      "--sound",
      "--title",
      "Test",
      "--media-next",
      "--media-pause",
    ]);
  });

  it("does not add boolean flags when false", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "",
      stderr: "",
    });

    const result = await Notification.notification({
      alertOnce: false,
      ongoing: false,
      sound: false,
      mediaNext: false,
      mediaPause: false,
      title: "Test",
    });

    expect(result.isOk()).toBe(true);

    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-notification", [
      "--title",
      "Test",
    ]);
  });

  it("converts numeric values to strings", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "",
      stderr: "",
    });

    const result = await Notification.notification({
      id: 123,
      ledOff: 100,
      ledOn: 200,
    });

    expect(result.isOk()).toBe(true);

    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-notification", [
      "--id",
      "123",
      "--led-off",
      "100",
      "--led-on",
      "200",
    ]);
  });

  it("includes all supplied values", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "",
      stderr: "",
    });

    const result = await Notification.notification({
      action: "open-app",
      alertOnce: true,

      button1: "Open",
      button1Action: "open-action",

      button2: "Close",
      button2Action: "close-action",

      button3: "Later",
      button3Action: "later-action",

      content: "Notification body",

      channel: "general",
      group: "notifications",

      id: 42,

      icon: "my-icon",
      imagePath: "/tmp/image.png",

      ledColor: "#ff0000",
      ledOff: 100,
      ledOn: 200,

      onDelete: "delete-action",

      ongoing: true,

      priority: "high",

      sound: true,

      title: "Test notification",

      vibrate: "100,200,100",

      type: "default",

      mediaNext: true,
      mediaPause: true,
    });

    expect(result.isOk()).toBe(true);

    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-notification", [
      "--action",
      "open-app",

      "--alert-once",

      "--button1",
      "Open",
      "--button1-action",
      "open-action",

      "--button2",
      "Close",
      "--button2-action",
      "close-action",

      "--button3",
      "Later",
      "--button3-action",
      "later-action",

      "--content",
      "Notification body",

      "--channel",
      "general",
      "--group",
      "notifications",

      "--id",
      "42",

      "--icon",
      "my-icon",
      "--image-path",
      "/tmp/image.png",

      "--led-color",
      "#ff0000",
      "--led-off",
      "100",
      "--led-on",
      "200",

      "--on-delete",
      "delete-action",

      "--ongoing",

      "--priority",
      "high",

      "--sound",

      "--title",
      "Test notification",

      "--vibrate",
      "100,200,100",

      "--type",
      "default",

      "--media-next",
      "--media-pause",
    ]);
  });

  it("returns Ok(undefined) when execution succeeds", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "anything",
      stderr: "",
    });

    const result = await Notification.notification({
      title: "Test",
    });

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toBeUndefined();
    }
  });

  it("returns NotificationError when execution fails", async () => {
    const error = new Error("Command failed");

    mockedExecFileAsync.mockRejectedValue(error);

    const result = await Notification.notification({
      title: "Test",
    });

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(Notification.NotificationError);

      expect(result.error.message).toBe(
        "Failed to execute termux-notification",
      );
    }
  });
});
