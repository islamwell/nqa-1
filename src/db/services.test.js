import { escapeRegex, buildSearchRegex } from "./services";

describe("db/services regex and search utilities", () => {
    describe("escapeRegex", () => {
        it("should escape special regex characters safely", () => {
            const raw = "hello (world) [brackets] {braces} *+?^$|\\";
            const escaped = escapeRegex(raw);
            expect(escaped).toBe("hello \\(world\\) \\[brackets\\] \\{braces\\} \\*\\+\\?\\^\\$\\|\\\\");
            // Must compile cleanly into a RegExp without throwing
            expect(() => new RegExp(escaped)).not.toThrow();
        });

        it("should handle null and undefined safely", () => {
            expect(escapeRegex(null)).toBe("");
            expect(escapeRegex(undefined)).toBe("");
            expect(escapeRegex("")).toBe("");
        });
    });

    describe("buildSearchRegex", () => {
        it("should return null for empty queries", () => {
            expect(buildSearchRegex("")).toBeNull();
            expect(buildSearchRegex("   ")).toBeNull();
            expect(buildSearchRegex(null)).toBeNull();
        });

        it("should support exact match phrase when wrapped in quotes", () => {
            const regex = buildSearchRegex('"surah fatihah"');
            expect(regex).not.toBeNull();
            expect(regex.test("Surah Fatihah recitation")).toBe(true);
            expect(regex.test("Surah Baqarah")).toBe(false);
        });

        it("should not throw or cause ReDoS on unclosed regex characters in search phrase", () => {
            expect(() => buildSearchRegex('"(unclosed parenthesis')).not.toThrow();
            expect(() => buildSearchRegex('[unclosed bracket')).not.toThrow();
            expect(() => buildSearchRegex('+++***???')).not.toThrow();
        });

        it("should expand synonyms like quran -> koran", () => {
            const regex = buildSearchRegex("quran");
            expect(regex).not.toBeNull();
            expect(regex.test("The Holy Quran recitation")).toBe(true);
            expect(regex.test("The Holy Koran recitation")).toBe(true);
        });

        it("should expand synonyms like namaz -> salah, salat", () => {
            const regex = buildSearchRegex("namaz");
            expect(regex).not.toBeNull();
            expect(regex.test("Daily Namaz rules")).toBe(true);
            expect(regex.test("Daily Salah rules")).toBe(true);
            expect(regex.test("Daily Salat rules")).toBe(true);
        });
    });
});
