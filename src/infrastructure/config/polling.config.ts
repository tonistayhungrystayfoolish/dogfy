

export class PollingConfig {

  static readonly DEFAULT_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  static getPollingInterval(): number {
    const envInterval = process.env.POLLING_INTERVAL_MS;
    if (envInterval) {
      const parsed = parseInt(envInterval, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return PollingConfig.DEFAULT_INTERVAL_MS;
  }


  static formatInterval(intervalMs: number): string {
    const minutes = Math.round(intervalMs / 60000);
    if (minutes < 60) {
      return `${minutes} minute(s)`;
    }
    const hours = Math.round(minutes / 60);
    return `${hours} hour(s)`;
  }
}
