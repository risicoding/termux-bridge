import { describe, expect, it, vi, beforeEach } from "vitest";
import { Battery } from "@/modules/battery";
import { execFileAsync } from "@/lib/utils";

vi.mock("@/lib/utils", () => ({
  execFileAsync: vi.fn(),
}));

const mockedExecFileAsync = vi.mocked(execFileAsync);

describe("Battery.status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns battery status when termux-battery-status succeeds", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify({
        health: "GOOD",
        percentage: 68,
        plugged: "UNPLUGGED",
        status: "DISCHARGING",
        temperature: 34.8,
        current: -929000,
        voltage: 3915,
        technology: "Li-poly",
      }),
      stderr: "",
    });

    const result = await Battery.status();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value).toEqual({
        health: "GOOD",
        percentage: 68,
        plugged: "UNPLUGGED",
        status: "DISCHARGING",
        temperature: 34.8,
        current: -929000,
        voltage: 3915,
        technology: "Li-poly",
      });
    }

    expect(mockedExecFileAsync).toHaveBeenCalledOnce();
    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-battery-status");
  });

  it("returns BatteryError when termux-battery-status fails", async () => {
    const error = new Error("Command not found");

    mockedExecFileAsync.mockRejectedValue(error);

    const result = await Battery.status();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(Battery.BatteryError);
      expect(result.error.message).toBe(
        "Failed to execute termux-battery-status",
      );
    }

    expect(mockedExecFileAsync).toHaveBeenCalledWith("termux-battery-status");
  });

  it("returns BatteryError when command returns invalid JSON", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: "not valid json",
      stderr: "",
    });

    const result = await Battery.status();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(Battery.BatteryError);
      expect(result.error.message).toBe("Invalid battery status response");
    }
  });

  it("returns BatteryError when JSON does not match the schema", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify({
        health: "GOOD",
        percentage: "68",
        plugged: "UNPLUGGED",
        status: "DISCHARGING",
        temperature: 34.8,
        current: -929000,
        voltage: 3915,
        technology: "Li-poly",
      }),
      stderr: "",
    });

    const result = await Battery.status();

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(Battery.BatteryError);
      expect(result.error.message).toBe("Invalid battery status response");
    }
  });

  it("accepts cycle_count when provided", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify({
        health: "GOOD",
        percentage: 68,
        plugged: "UNPLUGGED",
        status: "DISCHARGING",
        temperature: 34.8,
        current: -929000,
        voltage: 3915,
        technology: "Li-poly",
        cycle_count: 142,
      }),
      stderr: "",
    });

    const result = await Battery.status();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value.cycle_count).toBe(142);
    }
  });

  it("accepts a response without cycle_count", async () => {
    mockedExecFileAsync.mockResolvedValue({
      stdout: JSON.stringify({
        health: "GOOD",
        percentage: 68,
        plugged: "UNPLUGGED",
        status: "DISCHARGING",
        temperature: 34.8,
        current: -929000,
        voltage: 3915,
        technology: "Li-poly",
      }),
      stderr: "",
    });

    const result = await Battery.status();

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(result.value.cycle_count).toBeUndefined();
    }
  });
});
