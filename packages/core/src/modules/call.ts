import { execFileAsync } from "@/lib/utils";
import { AppError } from "@termux-bridge/error";
import { Result, ResultAsync } from "neverthrow";
import z from "zod";

export namespace CallLog {
  export const CallLogSchema = z.object({
    name: z.string(),
    phone_number: z.string(),
    type: z.string(),
    date: z.string().transform((value, ctx) => {
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
    duration: z.string(),
    sim_id: z.string(),
  });

  export const CallLogListSchema = z.array(CallLogSchema);

  export type CallLog = z.infer<typeof CallLogSchema>;

  export class CallLogError extends AppError {
    tag = "CallLogError" as const;
  }

  export const log = (): ResultAsync<CallLog[], CallLogError> =>
    ResultAsync.fromPromise(
      execFileAsync("termux-call-log"),
      (error) => new CallLogError("Failed to execute termux-call-log", error),
    ).andThen(({ stdout }) =>
      Result.fromThrowable(
        () => CallLogListSchema.parse(JSON.parse(stdout)) satisfies CallLog[],
        (error) => new CallLogError("Invalid call log response", error),
      )(),
    );
}
