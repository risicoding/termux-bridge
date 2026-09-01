import { describe, expect, it } from "vitest";
import { CallLog } from "@/modules/call";

describe("CallLog integration", () => {
  it("should return a valid call log list", async () => {
    const result = await CallLog.log();

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      throw result.error;
    }

    expect(Array.isArray(result.value)).toBe(true);

    for (const call of result.value) {
      expect(call).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          phone_number: expect.any(String),
          type: expect.any(String),
          date: expect.any(Date),
          duration: expect.any(String),
          sim_id: expect.any(String),
        }),
      );
    }
  });

  it("should transform date into a valid Date", async () => {
    const result = await CallLog.log();

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      throw result.error;
    }

    for (const call of result.value) {
      expect(call.date).toBeInstanceOf(Date);
      expect(Number.isNaN(call.date.getTime())).toBe(false);
    }
  });

  it("should satisfy the call log schema", async () => {
    const result = await CallLog.log();

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      throw result.error;
    }

    const parsed = CallLog.CallLogListSchema.safeParse(result.value);

    expect(parsed.success).toBe(true);
  });
});
