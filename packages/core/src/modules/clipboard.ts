import { execFileAsync } from "@/lib/utils";
import { AppError } from "@termux-bridge/error";
import { ResultAsync } from "neverthrow";
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
    ).map(({ stdout }) => stdout);

  export const setClipboard = (text: string) =>
    ResultAsync.fromPromise(
      execFileAsync(`termux-clipboard-set ${text}`),
      (e) => new ClipboardError("cant set clipboard", e),
    ).map(({ stdout }) => stdout);
}
