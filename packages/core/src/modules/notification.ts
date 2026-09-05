import { Result, ResultAsync } from "neverthrow";
import { AppError } from "@termux-bridge/error";
import z from "zod";
import { execFileAsync } from "@/lib/utils";
import {
  NotificationSchema as NotificationSchemaImport,
  NotificationListSchema as NotificationListSchemaImport,
  NotificationPropsSchema as NotificationPropsSchemaImport,
} from "@/schema";

export namespace Notification {
  export const NotificationSchema = NotificationSchemaImport;
  export const NotificationListSchema = NotificationListSchemaImport;

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

  export const NotificationPropsSchema = NotificationPropsSchemaImport;
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
