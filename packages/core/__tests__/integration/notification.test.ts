import { describe, expect, it } from "vitest";
import { Notification } from "@/modules/notification";

describe("Notification integration", () => {
  it("should create a notification", async () => {
    const id = Date.now();
    const title = `Termux Bridge Test ${id}`;
    const content = "Integration test notification";

    const result = await Notification.notification({
      id,
      title,
      content,
    });

    expect(result.isOk()).toBe(true);
  });

  it("should list active notifications", async () => {
    const result = await Notification.list();

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      throw result.error;
    }

    expect(Array.isArray(result.value)).toBe(true);

    for (const notification of result.value) {
      expect(notification).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          tag: expect.any(String),
          key: expect.any(String),
          group: expect.any(String),
          packageName: expect.any(String),
          title: expect.any(String),
          content: expect.any(String),
          when: expect.any(Date),
        }),
      );

      expect(Number.isNaN(notification.when.getTime())).toBe(false);
    }
  });

  it("should create and retrieve a notification", async () => {
    const id = Date.now();
    const title = `Termux Bridge Integration ${id}`;
    const content = "This notification was created by Vitest";

    const createResult = await Notification.notification({
      id,
      title,
      content,
      group: "termux-bridge-test",
    });

    expect(createResult.isOk()).toBe(true);

    const listResult = await Notification.list();

    expect(listResult.isOk()).toBe(true);

    if (listResult.isErr()) {
      throw listResult.error;
    }

    const notification = listResult.value.find(
      (notification) =>
        Number(notification.tag) === id && notification.title === title,
    );

    expect(notification).toBeDefined();
    expect(notification?.content).toBe(content);
    expect(notification?.when).toBeInstanceOf(Date);
  });
});
