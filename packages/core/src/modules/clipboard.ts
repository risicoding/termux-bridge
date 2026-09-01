import { execFileAsync } from "@/lib/utils";
import { AppError } from "@termux-bridge/error";
import { Result, ResultAsync } from "neverthrow";
import z from "zod";

export namespace Clipboard {
  export const ClipboardSchema = z.string();
  export type Clipboard = z.infer<typeof ClipboardSchema>;

  export class ClipboardError extends AppError {
    tag = "ClipboardError" as const;
  }

  export const getClipboard = () =>
    ResultAsync.fromPromise(
      execFileAsync("termux-clipboard-get"),
      (e) => new ClipboardError("cant get clipboard", e),
    ).andThen(({ stdout }) =>
      Result.fromThrowable(
        () => ClipboardSchema.parse(stdout) satisfies Clipboard,
        (error) => new ClipboardError("Invalid clipboard response", error),
      )(),
    );

  export const setClipboard = (text: string) =>
    ResultAsync.fromPromise(
      execFileAsync(`termux-clipboard-set`, [text]),
      (e) => new ClipboardError("cant set clipboard", e),
    ).map(() => {});
}
