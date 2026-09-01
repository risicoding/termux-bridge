import { describe, expect, it } from "vitest";
import { Sms } from "@/modules/sms";

describe("Sms integration", () => {
  it("should return a valid SMS list", async () => {
    const result = await Sms.list();

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      throw result.error;
    }

    expect(Array.isArray(result.value)).toBe(true);

    for (const sms of result.value) {
      expect(sms).toEqual(
        expect.objectContaining({
          threadid: expect.any(Number),
          type: expect.any(String),
          read: expect.any(Boolean),
          address: expect.any(String),
          number: expect.any(String),
          received: expect.any(Date),
          body: expect.any(String),
          _id: expect.any(Number),
        }),
      );
    }
  });

  it("should transform received into a Date", async () => {
    const result = await Sms.list();

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      throw result.error;
    }

    for (const sms of result.value) {
      expect(sms.received).toBeInstanceOf(Date);
      expect(Number.isNaN(sms.received.getTime())).toBe(false);
    }
  });

  it("should satisfy the SMS schema", async () => {
    const result = await Sms.list();

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      throw result.error;
    }

    const parsed = Sms.SmsListSchema.safeParse(result.value);

    expect(parsed.success).toBe(true);
  });
});
