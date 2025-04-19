import { formatters } from "../../src/utils/formatters";
import { config } from "../../src/config";

describe("Formatters Utility", () => {
  describe("walletAddress", () => {
    it("should handle null or empty address", () => {
      expect(formatters.walletAddress("")).toBe("");
      expect(formatters.walletAddress(null as unknown as string)).toBe("");
      expect(formatters.walletAddress(undefined as unknown as string)).toBe("");
    });

    it("should return full address if length is 8 or less", () => {
      expect(formatters.walletAddress("abc")).toBe("abc");
      expect(formatters.walletAddress("abcdef")).toBe("abcdef");
      expect(formatters.walletAddress("12345678")).toBe("12345678");
    });

    it("should truncate address correctly if longer than 8 characters", () => {
      expect(formatters.walletAddress("ABCDEFGHIJKLMNOPQRSTUVWXYZabcd")).toBe(
        "ABCD...abcd"
      );
    });
  });

  describe("usdValue", () => {
    it("should format numbers with correct decimal places", () => {
      expect(formatters.usdValue("1234.5678")).toBe("1,234.5678");
      expect(formatters.usdValue(1234.5678)).toBe("1,234.5678");
      expect(formatters.usdValue("1000000.123456")).toBe("1,000,000.1235");
    });

    it("should handle string numbers with commas", () => {
      expect(formatters.usdValue("1,234.5678")).toBe("1,234.5678");
      expect(formatters.usdValue("1,000,000.123456")).toBe("1,000,000.1235");
    });

    it("should handle edge cases", () => {
      expect(formatters.usdValue("0")).toBe("0.0000");
      expect(formatters.usdValue("")).toBe("NaN");
      expect(formatters.usdValue("invalid")).toBe("NaN");
    });
  });

  describe("codeBlock", () => {
    it("should wrap values in backticks", () => {
      expect(formatters.codeBlock("test")).toBe("`test`");
      expect(formatters.codeBlock(123)).toBe("`123`");
      expect(formatters.codeBlock("")).toBe("``");
    });
  });
});
