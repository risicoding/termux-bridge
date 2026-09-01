import { Result, ResultAsync } from "neverthrow";
import { AppError } from "@termux-bridge/error";
import { execFileAsync } from "@/lib/utils";
import z from "zod";

export namespace Battery {
  export const BatteryStatusSchema = z.object({
    health: z.string(),
    percentage: z.number(),
    plugged: z.string(),
    status: z.enum(["CHARGING", "DISCHARGING"]),
    temperature: z.number(),
    current: z.number(),
    voltage: z.number(),
    technology: z.string(),
    cycle_count: z.number().optional(),
  });

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
