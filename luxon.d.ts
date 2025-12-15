declare module "luxon" {
  export class DateTime {
    static fromSeconds(seconds: number): DateTime;
    static fromISO(isoString: string): DateTime;
    setZone(zone: string): DateTime;
    toFormat(fmt: string): string;
  }
}
