import {
  LOCAL_RUNTIME_ADAPTER_001,
  startLocalRuntimeAdapter,
} from "./local-runtime-adapter.js"

const rawPort = process.env.FOTN_LOCAL_ADAPTER_PORT
const port = rawPort ? Number(rawPort) : LOCAL_RUNTIME_ADAPTER_001.defaultPort

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("FOTN_LOCAL_ADAPTER_PORT must be an integer from 1 to 65535")
}

const running = await startLocalRuntimeAdapter(port)

process.stdout.write(JSON.stringify({
  event: "LOCAL_RUNTIME_ADAPTER_READY",
  adapterId: LOCAL_RUNTIME_ADAPTER_001.adapterId,
  host: running.host,
  port: running.port,
  qualifiedBaseCommit: LOCAL_RUNTIME_ADAPTER_001.qualifiedBaseCommit,
}) + "\n")

const shutdown = (signal: string) => {
  running.server.close(error => {
    if (error) {
      process.stderr.write(JSON.stringify({
        event: "LOCAL_RUNTIME_ADAPTER_STOP_ERROR",
        signal,
        message: error.message,
      }) + "\n")
      process.exitCode = 1
      return
    }
    process.stdout.write(JSON.stringify({
      event: "LOCAL_RUNTIME_ADAPTER_STOPPED",
      signal,
    }) + "\n")
  })
}

process.once("SIGINT", () => shutdown("SIGINT"))
process.once("SIGTERM", () => shutdown("SIGTERM"))
