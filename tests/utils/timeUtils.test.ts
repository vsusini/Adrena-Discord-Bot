import {
  getNextStakingRoundStartTime,
  formatMilliseconds,
  ROUND_MIN_DURATION_SECONDS,
} from "../../src/utils/timeUtils";
import { BN } from "@coral-xyz/anchor";

describe("TimeUtils Utility", () => {
  describe("getNextStakingRoundStartTime", () => {
    it("should calculate correct next round time", () => {
      const now = Math.floor(Date.now() / 1000);
      const timestamp = new BN(now);
      const result = getNextStakingRoundStartTime(timestamp);

      expect(result.getTime()).toBe((now + ROUND_MIN_DURATION_SECONDS) * 1000);
    });
  });

  describe("formatMilliseconds", () => {
    it("should format days correctly", () => {
      const oneDayMs = 24 * 60 * 60 * 1000;
      expect(formatMilliseconds(oneDayMs)).toBe("1d 00h 00m 00s");
      expect(formatMilliseconds(2 * oneDayMs)).toBe("2d 00h 00m 00s");
    });

    it("should format hours correctly", () => {
      const oneHourMs = 60 * 60 * 1000;
      expect(formatMilliseconds(oneHourMs)).toBe("01h 00m 00s");
      expect(formatMilliseconds(23 * oneHourMs)).toBe("23h 00m 00s");
    });

    it("should format minutes correctly", () => {
      const oneMinuteMs = 60 * 1000;
      expect(formatMilliseconds(oneMinuteMs)).toBe("01m 00s");
      expect(formatMilliseconds(59 * oneMinuteMs)).toBe("59m 00s");
    });

    it("should format seconds correctly", () => {
      const oneSecondMs = 1000;
      expect(formatMilliseconds(oneSecondMs)).toBe("01s");
      expect(formatMilliseconds(59 * oneSecondMs)).toBe("59s");
    });

    it("should handle combinations of units", () => {
      const day = 24 * 60 * 60 * 1000;
      const hour = 60 * 60 * 1000;
      const minute = 60 * 1000;
      const second = 1000;

      expect(formatMilliseconds(day + hour + minute + second)).toBe(
        "1d 01h 01m 01s"
      );

      expect(
        formatMilliseconds(2 * day + 23 * hour + 59 * minute + 59 * second)
      ).toBe("2d 23h 59m 59s");
    });
  });
});
