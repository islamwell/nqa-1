import db from "./db";
import categories from "../data/category-strcture";
import { slugify } from "../utils";
import {
    escapeRegex,
    buildSearchRegex,
    getCategoryPathByNames,
    getCategoryByNameAndSubCategoryNames,
    getDescendantCategoryIds,
    getAudioByCategory,
    getSubCategoryIds,
    getSubCategoryNamesByIds,
} from "./services";

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

    describe("parent/child category queries", () => {
        it("should resolve Tafseer Juzz 30 and collect all 31 Surah descendant IDs", () => {
            const details = getCategoryByNameAndSubCategoryNames("Al-Quran", ["Detailed Tafseer", "Tafseer Juzz 30"]);
            expect(details).toBeDefined();
            expect(details.id).toBe(620);

            const chain = getCategoryPathByNames("Al-Quran", ["Detailed-Tafseer", "Tafseer-Juzz-30"]);
            expect(chain.map((c) => c.id)).toEqual([26, 120, 620]);

            const ids = getDescendantCategoryIds(620);
            expect(ids).toHaveLength(32); // 620 + 31 child Surahs (621..651)
            expect(ids[0]).toBe(620);
            expect(ids).toContain(621);
            expect(ids).toContain(651);
        });

        it("should normalize control characters like trailing DEL in Tafseer Juzz 06", () => {
            const details = getCategoryByNameAndSubCategoryNames("Al-Quran", ["Detailed Tafseer", "Tafseer Juzz 06"]);
            expect(details).toBeDefined();
            expect(details.id).toBe(217);
        });

        it("should resolve duplicate sibling DQ17-Juz 19 to populated ID 772 and include both 772 and 773 in descendants", () => {
            const details = getCategoryByNameAndSubCategoryNames("Dawrah-E-Quran", [
                "Dawrah-E-Quran-2017",
                "DQ17-Juz-19",
            ]);
            expect(details).toBeDefined();
            expect(details.id).toBe(772);

            const idsFrom773 = getDescendantCategoryIds(773);
            expect(idsFrom773).toContain(773);
            expect(idsFrom773).toContain(772);

            const idsFrom772 = getDescendantCategoryIds(772);
            expect(idsFrom772).toContain(772);
            expect(idsFrom772).toContain(773);
        });

        it("should round-trip URL segments for all categories in category-strcture.json consistently", () => {
            const walk = (list) => {
                for (const cat of list) {
                    const subIds = [];
                    getSubCategoryIds(cat.id, subIds);
                    const names = getSubCategoryNamesByIds(subIds);
                    const segments = names.filter(Boolean).map((n) => slugify(n));

                    const chain = getCategoryPathByNames(segments[0], segments.slice(1));
                    const resolved = getCategoryByNameAndSubCategoryNames(segments[0], segments.slice(1));

                    expect(chain.length).toBe(segments.length);
                    expect(resolved).toBeDefined();
                    expect(chain[chain.length - 1].id).toBe(resolved.id);

                    // Either exact ID match, or duplicate-named sibling under same parent (773 -> 772)
                    if (cat.id !== 773) {
                        expect(resolved.id).toBe(cat.id);
                    } else {
                        expect(resolved.id).toBe(772);
                    }

                    if (cat.subCategories) walk(cat.subCategories);
                }
            };
            walk(categories);
        });

        it("should return sorted lectures from descendant categories when parent category has 0 direct items", async () => {
            const sampleRows = [
                { id: 3122, name: "Lahab", category_id: 651, order_number: 1 },
                { id: 3086, name: "AnNaba B", category_id: 621, order_number: 2 },
                { id: 3085, name: "AnNaba A", category_id: 621, order_number: 1 },
            ];

            const anyOfMock = jest.fn((keys) => ({
                toArray: jest.fn().mockResolvedValue(
                    sampleRows.filter((row) => keys.includes(row.category_id))
                ),
            }));
            const tableSpy = jest.spyOn(db, "table").mockReturnValue({
                where: jest.fn(() => ({ anyOf: anyOfMock })),
            });

            try {
                const res = await getAudioByCategory(620, 1);
                expect(anyOfMock).toHaveBeenCalled();
                expect(res.data.map((x) => x.id)).toEqual([3085, 3086, 3122]);
                expect(res.allpage).toBe(1);
            } finally {
                tableSpy.mockRestore();
            }
        });
    });
});
