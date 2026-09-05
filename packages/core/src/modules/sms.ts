import { Result, ResultAsync } from "neverthrow";
import z from "zod";
import { AppError } from "@termux-bridge/error";
import { execFileAsync } from "@/lib/utils";
import {
  SmsSchema as SmsSchemaImport,
  SmsListSchema as SmsListSchemaImport,
} from "@/schema";

export namespace Sms {
  export const SmsSchema = SmsSchemaImport;
  export const SmsListSchema = SmsListSchemaImport;

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
