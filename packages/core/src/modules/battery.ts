import { Result, ResultAsync } from "neverthrow";
import { AppError } from "@termux-bridge/error";
import { execFileAsync } from "@/lib/utils";
import z from "zod";
import { BatteryStatusSchema as Schema } from "@/schema";

export namespace Battery {
  export const BatteryStatusSchema = Schema;
  export type BatteryStatus = z.infer<typeof BatteryStatusSchema>;

  export class BatteryError extends AppError {
    tag = "BatteryError" as const;
  }

  export const status = (): ResultAsync<BatteryStatus, BatteryError> =>
    ResultAsync.fromPromise(
      execFileAsync("termux-battery-status"),
      (error) =>
        new BatteryError("Failed to execute termux-battery-status", error),
    ).andThen(({ stdout }) =>
      Result.fromThrowable(
        () =>
          BatteryStatusSchema.parse(JSON.parse(stdout)) satisfies BatteryStatus,
        (error) => new BatteryError("Invalid battery status response", error),
      )(),
    );
}
