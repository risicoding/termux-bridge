import { Result, ResultAsync } from "neverthrow";
import z from "zod";
import { AppError } from "@termux-bridge/error";
import { execFileAsync } from "@/lib/utils";

export namespace Sms {
  export const SmsSchema = z.object({
    threadid: z.number(),
    type: z.string(),
    read: z.boolean(),
    address: z.string(),
    number: z.string(),
    received: z.string().transform((value, ctx) => {
      const date = new Date(value.replace(" ", "T"));

      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid date",
        });

        return z.NEVER;
      }

      return date;
    }),
    body: z.string(),
    _id: z.number(),
  });

  export const SmsListSchema = z.array(SmsSchema);

  export type Sms = z.infer<typeof SmsSchema>;

  export class SmsError extends AppError {
    tag = "SmsError" as const;
  }

  export const list = (): ResultAsync<Sms[], SmsError> =>
    ResultAsync.fromPromise(
      execFileAsync("termux-sms-list"),
      (error) => new SmsError("Failed to execute termux-sms-list", error),
    ).andThen(({ stdout }) =>
      Result.fromThrowable(
        () => SmsListSchema.parse(JSON.parse(stdout)) satisfies Sms[],
        (error) => new SmsError("Invalid SMS list response", error),
      )(),
    );
}
