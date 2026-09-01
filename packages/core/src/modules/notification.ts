import { Result, ResultAsync } from "neverthrow";
import { AppError } from "@termux-bridge/error";
import { z } from "zod";
import { execFileAsync } from "@/lib/utils";

export namespace Notification {
  export const NotificationSchema = z.object({
    id: z.number(),
    tag: z.string(),
    key: z.string(),
    group: z.string(),
    packageName: z.string(),
    title: z.string(),
    content: z.string(),
    when: z.string().transform((value) => new Date(value.replace(" ", "T"))),
  });

  export const NotificationListSchema = z.array(NotificationSchema);

  export type Notification = z.infer<typeof NotificationSchema>;

  export class NotificationError extends AppError {
    tag = "NotificationError" as const;
  }

  export const list = (): ResultAsync<Notification[], NotificationError> =>
    ResultAsync.fromPromise(
      execFileAsync("termux-notification-list"),
      (error) =>
        new NotificationError(
          "Failed to execute termux-notification-list",
          error,
        ),
    ).andThen(({ stdout }) =>
      Result.fromThrowable(
        () =>
          NotificationListSchema.parse(
            JSON.parse(stdout),
          ) satisfies Notification[],
        (error) =>
          new NotificationError("Invalid notification list response", error),
      )(),
    );

  export const NotificationPropsSchema = z.object({
    action: z.string().optional(),

    alertOnce: z.boolean().optional(),

    button1: z.string().optional(),
    button1Action: z.string().optional(),

    button2: z.string().optional(),
    button2Action: z.string().optional(),

    button3: z.string().optional(),
    button3Action: z.string().optional(),

    content: z.string().optional(),

    channel: z.string().optional(),
    group: z.string().optional(),

    id: z.number().int().optional(),

    icon: z.string().optional(),
    imagePath: z.string().optional(),

    ledColor: z.string().optional(),
    ledOff: z.number().int().nonnegative().optional(),
    ledOn: z.number().int().nonnegative().optional(),

    onDelete: z.string().optional(),

    ongoing: z.boolean().optional(),

    priority: z.enum(["high", "low", "max", "min", "default"]).optional(),

    sound: z.boolean().optional(),

    title: z.string().optional(),

    vibrate: z.string().optional(),

    type: z.enum(["default", "media"]).optional(),

    mediaNext: z.boolean().optional(),
    mediaPause: z.boolean().optional(),
  });

  export type NotificationProps = z.infer<typeof NotificationPropsSchema>;

  export const notification = (
    props: NotificationProps,
  ): ResultAsync<void, NotificationError> => {
    const args: string[] = [];

    const addValue = (flag: string, value: string | number | undefined) => {
      if (value !== undefined) {
        args.push(flag, String(value));
      }
    };

    const addFlag = (flag: string, enabled: boolean | undefined) => {
      if (enabled) {
        args.push(flag);
      }
    };

    addValue("--action", props.action);

    addFlag("--alert-once", props.alertOnce);

    addValue("--button1", props.button1);
    addValue("--button1-action", props.button1Action);

    addValue("--button2", props.button2);
    addValue("--button2-action", props.button2Action);

    addValue("--button3", props.button3);
    addValue("--button3-action", props.button3Action);

    addValue("--content", props.content);

    addValue("--channel", props.channel);
    addValue("--group", props.group);

    addValue("--id", props.id);

    addValue("--icon", props.icon);
    addValue("--image-path", props.imagePath);

    addValue("--led-color", props.ledColor);
    addValue("--led-off", props.ledOff);
    addValue("--led-on", props.ledOn);

    addValue("--on-delete", props.onDelete);

    addFlag("--ongoing", props.ongoing);

    addValue("--priority", props.priority);

    addFlag("--sound", props.sound);

    addValue("--title", props.title);

    addValue("--vibrate", props.vibrate);

    addValue("--type", props.type);

    addFlag("--media-next", props.mediaNext);
    addFlag("--media-pause", props.mediaPause);

    return ResultAsync.fromPromise(
      execFileAsync("termux-notification", args),
      (error) => {
        return new NotificationError(
          "Failed to execute termux-notification",
          error,
        );
      },
    ).map(() => undefined);
  };
}
