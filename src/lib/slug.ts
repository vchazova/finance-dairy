const CYRILLIC_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
  ъ: "",
  ь: "",
};

const FALLBACK_SLUG = "workspace";

export function slugifyWorkspaceName(input: string): string {
  const lower = input.normalize("NFKD").toLowerCase();
  let buffer = "";
  for (const char of lower) {
    if (CYRILLIC_MAP[char] !== undefined) {
      buffer += CYRILLIC_MAP[char];
      continue;
    }
    if (char >= "a" && char <= "z") {
      buffer += char;
      continue;
    }
    if (char >= "0" && char <= "9") {
      buffer += char;
      continue;
    }
    if (char === " " || char === "-" || char === "_" || char === ".") {
      buffer += "-";
    }
  }

  const collapsed = buffer
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return collapsed || FALLBACK_SLUG;
}
