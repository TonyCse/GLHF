type LogData = Record<string, unknown>;

function log(level: "info" | "warn" | "error", event: string, data?: LogData) {
  const entry = JSON.stringify({ level, event, ...data, ts: Date.now() });
  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.log(entry);
}

export const logger = {
  info: (event: string, data?: LogData) => log("info", event, data),
  warn: (event: string, data?: LogData) => log("warn", event, data),
  error: (event: string, data?: LogData) => log("error", event, data),
};
