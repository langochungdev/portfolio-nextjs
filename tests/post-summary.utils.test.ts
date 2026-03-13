import { describe, expect, it } from "vitest";
import {
  buildExcerpt,
  calcReadTime,
  stripHtml,
} from "@/lib/firebase/post-summary";

describe("post summary utils", () => {
  it("strips HTML safely", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world",
    );
  });

  it("builds excerpt with ellipsis for long content", () => {
    const source = `<p>${"word ".repeat(80)}</p>`;
    const excerpt = buildExcerpt(source, 40);

    expect(excerpt.length).toBeLessThanOrEqual(43);
    expect(excerpt.endsWith("...")).toBe(true);
  });

  it("computes minimum read time as 1 minute", () => {
    expect(calcReadTime("<p>short text</p>")).toBe(1);
  });

  it("computes read time based on ~200 words per minute", () => {
    const longText = `<p>${"token ".repeat(401)}</p>`;
    expect(calcReadTime(longText)).toBe(3);
  });
});
