import { describe, expect, it } from "vitest";
import { Battery } from "@/modules/battery";

describe("Battery.status integration", () => {
  it("should return the current battery status", async () => {
    const result = await Battery.status();

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      throw result.error;
    }

    expect(result.value).toEqual(
      expect.objectContaining({
        health: expect.any(String),
        percentage: expect.any(Number),
        plugged: expect.any(String),
        status: expect.stringMatching(/^(CHARGING|DISCHARGING)$/),
        temperature: expect.any(Number),
        current: expect.any(Number),
        voltage: expect.any(Number),
        technology: expect.any(String),
      }),
    );
  });

  it("should return a valid BatteryStatus according to the schema", async () => {
    const result = await Battery.status();

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      throw result.error;
    }

    const parsed = Battery.BatteryStatusSchema.safeParse(result.value);

    expect(parsed.success).toBe(true);
  });
});
