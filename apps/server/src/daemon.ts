import { spawn } from "child_process";
import * as path from "path";
import * as process from "process";
import { AppError } from "@termux-bridge/error";
import { err, ok, Result, ResultAsync } from "neverthrow";
import { PORT } from "./constants";

export namespace Daemon {
  export class DaemonError extends AppError {
    public readonly tag = "DaemonError";
  }

  export const status = () =>
    ResultAsync.fromPromise(
      fetch(`http://localhost:${PORT}/api/v0/ping`),
      (e) => new DaemonError("cant connect", e),
    )
      .andThen((res) =>
        res.ok ? ok(res) : err(new DaemonError("cant connect")),
      )
      .andThen((res) =>
        ResultAsync.fromPromise(
          res.json(),
          (e) => new DaemonError("cant parse json", e),
        ),
      )
      .map((data) =>
        data.name === "termux-bridge" && data.status === "running"
          ? true
          : false,
      )
      .unwrapOr(false);

  export const start = () =>
    ResultAsync.fromSafePromise(status()).andThen(
      (isRunning): Result<number, DaemonError> => {
        if (isRunning) {
          return err(new DaemonError("termux-bridge server already running"));
        }

        const daemonPath = path.join(
          path.dirname(process.argv[1]!),
          "server.js",
        );

        const child = spawn(process.execPath, [daemonPath], {
          detached: true,
          stdio: "ignore",
        });

        child.unref();

        if (!child.pid) return err(new DaemonError());

        return ok(child.pid);
      },
    );

  export const stop = () =>
    ResultAsync.fromSafePromise(status())
      .andThen((isRunning) =>
        !isRunning
          ? err(new DaemonError("termux-bridge server not running"))
          : ok(isRunning),
      )
      .andThen((_) =>
        ResultAsync.fromPromise(
          fetch(`http://localhost:${PORT}/api/v0/kill`),
          (e) => new DaemonError("cant kill server", e),
        ),
      );
}
