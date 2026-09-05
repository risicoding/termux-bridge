import { execFileAsync } from "@/lib/utils";
import { AppError } from "@termux-bridge/error";
import { Result, ResultAsync } from "neverthrow";
import {
  CallLogSchema as CallLogSchemaImport,
  CallLogListSchema as CallLogListSchemaImport,
} from "@/schema";
import z from "zod";

export namespace CallLog {
  export const CallLogSchema = CallLogSchemaImport;
  export const CallLogListSchema = CallLogListSchemaImport;

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
