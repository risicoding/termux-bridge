import { beforeEach, describe, expect, it, vi } from "vitest";
import { CallLog } from "@/modules/call";
import { execFileAsync } from "@/lib/utils";

vi.mock("@/lib/utils", () => ({
  execFileAsync: vi.fn(),
}));

const mockedExecFileAsync = vi.mocked(execFileAsync);

describe("CallLog.log", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns call logs when termux-call-log succeeds", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify([
        {
          name: "[Maa...]",
          phone_number: "+919801431688",
          type: "MISSED",
          date: "2026-08-28 16:43:26",
          duration: "00:00",
          sim_id: "8991000924118535262F",
        },
      ]),
      stderr: "",
    });

    const result = await CallLog.log();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toHaveLength(1);

      expect(result.value[0]).toEqual({
        name: "[Maa...]",
        phone_number: "+919801431688",
        type: "MISSED",
        date: new Date("2026-08-28T16:43:26"),
        duration: "00:00",
        sim_id: "8991000924118535262F",
      });
    }

    expect(mockedExecFileAsync).toHaveBeenCalledOnce();
    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-call-log");
  });

  it("returns an empty array when there are no call logs", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "[]",
      stderr: "",
    });

    const result = await CallLog.log();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toEqual([]);
    }
  });

  it("transforms the call log date into a Date", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify([
        {
          name: "John",
          phone_number: "+919876543210",
          type: "INCOMING",
          date: "2026-08-28 16:43:26",
          duration: "01:23",
          sim_id: "123456",
        },
      ]),
      stderr: "",
    });

    const result = await CallLog.log();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value[0].date).toBeInstanceOf(Date);
      expect(result.value[0].date.getTime()).not.toBeNaN();

      expect(result.value[0].date.getHours()).toBe(16);
      expect(result.value[0].date.getMinutes()).toBe(43);
      expect(result.value[0].date.getSeconds()).toBe(26);
    }
  });

  it("returns CallLogError when termux-call-log fails", async () => {
    const error = new Error("Command failed");

    mockedExecFileAsync.mockRejectedValue(error);

    const result = await CallLog.log();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(CallLog.CallLogError);
      expect(result.error.message).toBe("Failed to execute termux-call-log");
    }

    expect(mockedExecFileAsync).toHaveBeenCalledOnce();
    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-call-log");
  });

  it("returns CallLogError when the command returns invalid JSON", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "not valid json",
      stderr: "",
    });

    const result = await CallLog.log();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(CallLog.CallLogError);
      expect(result.error.message).toBe("Invalid call log response");
    }
  });

  it("returns CallLogError when the response does not match the schema", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify([
        {
          name: "John",
          phone_number: "+919876543210",
          type: "INCOMING",
          date: "2026-08-28 16:43:26",

          // Invalid: duration should be a string.
          duration: 83,

          sim_id: "123456",
        },
      ]),
      stderr: "",
    });

    const result = await CallLog.log();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(CallLog.CallLogError);
      expect(result.error.message).toBe("Invalid call log response");
    }
  });

  it("returns CallLogError for an invalid date", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify([
        {
          name: "John",
          phone_number: "+919876543210",
          type: "MISSED",
          date: "not-a-date",
          duration: "00:00",
          sim_id: "123456",
        },
      ]),
      stderr: "",
    });

    const result = await CallLog.log();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(CallLog.CallLogError);
      expect(result.error.message).toBe("Invalid call log response");
    }
  });

  it("validates every call log in the response", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify([
        {
          name: "John",
          phone_number: "+919876543210",
          type: "INCOMING",
          date: "2026-08-28 16:43:26",
          duration: "00:42",
          sim_id: "123456",
        },
        {
          name: "Jane",
          phone_number: "+919812345678",
          type: "OUTGOING",
          date: "2026-08-29 10:12:05",
          duration: "02:31",
          sim_id: "654321",
        },
      ]),
      stderr: "",
    });

    const result = await CallLog.log();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toHaveLength(2);

      expect(result.value[0].date).toBeInstanceOf(Date);
      expect(result.value[1].date).toBeInstanceOf(Date);

      expect(result.value[0].phone_number).toBe("+919876543210");
      expect(result.value[1].phone_number).toBe("+919812345678");
    }
  });
});
