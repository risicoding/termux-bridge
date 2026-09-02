#!/bin/env node
import { program as p } from "commander";
import { logger } from "@termux-bridge/logger";
import { Daemon } from "@/daemon";

const main = async () => {
  const program = p
    .name("termux-bridge")
    .description("convert termux-api command")
    .version("v0.1.0");

  const daemon = program.command("daemon").description("commands for daemon");

  daemon
    .command("start")
    .description("start the server")
    .action(async () => {
      await Daemon.start().match(
        (pid) => logger.info("daemon started", { pid }),
        (e) => {
          logger.error(e.log());
          logger.debug(e);
        },
      );
    });

  daemon
    .command("stop")
    .description("stop the daemon")
    .action(async () => {
      await Daemon.stop().match(
        () => logger.info("daemon stopped"),
        (e) => {
          logger.error(e.log());
          console.log(e);
          logger.debug(e);
        },
      );
    });

  daemon
    .command("status")
    .description("check status of the daemon")
    .action(async () => {
      const isRunning = await Daemon.status();
      if (isRunning) {
        logger.info("daemon running");
      } else {
        logger.warn("daemon not running");
      }
    });

  program.parse(process.argv);
};

main().then();
