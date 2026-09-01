import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sms } from "@/modules/sms";
import { execFileAsync } from "@/lib/utils";

vi.mock("@/lib/utils", () => ({
  execFileAsync: vi.fn(),
}));

const mockedExecFileAsync = vi.mocked(execFileAsync);

describe("Sms.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns SMS messages when termux-sms-list succeeds", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify([
        {
          threadid: 73,
          type: "inbox",
          read: false,
          address: "AB-AIRTEL-S",
          number: "AB-AIRTEL-S",
          received: "2026-08-30 15:00:32",
          body: "Alert!! 50%: आपके डेली हाई स्पीड डाटा लिमिट के लिए।",
          _id: 12345,
        },
      ]),
      stderr: "",
    });

    const result = await Sms.list();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toHaveLength(1);

      expect(result.value[0]).toEqual({
        threadid: 73,
        type: "inbox",
        read: false,
        address: "AB-AIRTEL-S",
        number: "AB-AIRTEL-S",
        received: new Date("2026-08-30T15:00:32"),
        body: "Alert!! 50%: आपके डेली हाई स्पीड डाटा लिमिट के लिए।",
        _id: 12345,
      });
    }

    expect(mockedExecFileAsync).toHaveBeenCalledOnce();
    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-sms-list");
  });

  it("returns an empty array when there are no SMS messages", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "[]",
      stderr: "",
    });

    const result = await Sms.list();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toEqual([]);
    }
  });

  it("transforms received into a Date", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify([
        {
          threadid: 73,
          type: "inbox",
          read: false,
          address: "AB-AIRTEL-S",
          number: "AB-AIRTEL-S",
          received: "2026-08-30 15:00:32",
          body: "Test message",
          _id: 12345,
        },
      ]),
      stderr: "",
    });

    const result = await Sms.list();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value[0].received).toBeInstanceOf(Date);
      expect(result.value[0].received.getTime()).not.toBeNaN();
    }
  });

  it("returns SmsError when termux-sms-list fails", async () => {
    const error = new Error("Command failed");

    mockedExecFileAsync.mockRejectedValue(error);

    const result = await Sms.list();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(Sms.SmsError);
      expect(result.error.message).toBe("Failed to execute termux-sms-list");
    }

    expect(mockedExecFileAsync).toHaveBeenCalledOnce();
    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-sms-list");
  });

  it("returns SmsError when the command returns invalid JSON", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "not valid json",
      stderr: "",
    });

    const result = await Sms.list();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(Sms.SmsError);
      expect(result.error.message).toBe("Invalid SMS list response");
    }
  });

  it("returns SmsError when the response does not match the schema", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify([
        {
          threadid: 73,
          type: "inbox",

          // Invalid: read must be a boolean.
          read: "false",

          address: "AB-AIRTEL-S",
          number: "AB-AIRTEL-S",
          received: "2026-08-30 15:00:32",
          body: "Test message",
          _id: 12345,
        },
      ]),
      stderr: "",
    });

    const result = await Sms.list();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(Sms.SmsError);
      expect(result.error.message).toBe("Invalid SMS list response");
    }
  });

  it("returns SmsError for an invalid received date", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify([
        {
          threadid: 73,
          type: "inbox",
          read: false,
          address: "AB-AIRTEL-S",
          number: "AB-AIRTEL-S",
          received: "not-a-date",
          body: "Test message",
          _id: 12345,
        },
      ]),
      stderr: "",
    });

    const result = await Sms.list();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(Sms.SmsError);
      expect(result.error.message).toBe("Invalid SMS list response");
    }
  });

  it("validates every SMS message in the response", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify([
        {
          threadid: 73,
          type: "inbox",
          read: false,
          address: "AB-AIRTEL-S",
          number: "AB-AIRTEL-S",
          received: "2026-08-30 15:00:32",
          body: "First message",
          _id: 12345,
        },
        {
          threadid: 74,
          type: "sent",
          read: true,
          address: "+919876543210",
          number: "+919876543210",
          received: "2026-08-31 10:15:20",
          body: "Second message",
          _id: 12346,
        },
      ]),
      stderr: "",
    });

    const result = await Sms.list();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toHaveLength(2);

      expect(result.value[0].received).toBeInstanceOf(Date);
      expect(result.value[1].received).toBeInstanceOf(Date);

      expect(result.value[0].threadid).toBe(73);
      expect(result.value[1].threadid).toBe(74);
    }
  });
});
