import { renderHook } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import english from "../../../../dictionaries/en.json";
import french from "../../../../dictionaries/fr.json";
import { usePathCopy, formatPathText } from "../usePathCopy";

let mockMessages: Record<string, unknown> = {};
jest.mock("@/context/LanguageContext", () => ({ useLanguage: () => ({ t: mockMessages }) }));

it("localizes path labels while preserving stable routes", () => {
  mockMessages = { myPath: french.myPath };
  const { result } = renderHook(() => usePathCopy());
  expect(result.current.copy.myPath).toBe(french.myPath.myPath);
  expect(result.current.paths[0].title).toBe(french.myPath.paths.learn.title);
  expect(result.current.paths[0].steps[0].href).toBe("/start-here/what-is-zec-and-zcash");
  expect(formatPathText(result.current.copy.completeCount, { done: 1, total: 4 })).toContain("1");
});

it("has the same nonempty keys and placeholders in every routed dictionary", () => {
  const flatten = (value: unknown, prefix = ""): Record<string, string> => {
    if (typeof value === "string") return { [prefix]: value };
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => Object.entries(flatten(child, `${prefix}.${key}`))));
  };
  const source = flatten(english.myPath);
  for (const locale of "it fr es de pt ar zh hi ru ja ko tr uk sw yo ig ak ee id el fa".split(" ")) {
    const dictionary = JSON.parse(readFileSync(join(process.cwd(), "dictionaries", `${locale}.json`), "utf8"));
    const translated = flatten(dictionary.myPath);
    expect(Object.keys(translated).sort()).toEqual(Object.keys(source).sort());
    for (const key of Object.keys(source)) {
      expect(translated[key].trim()).not.toBe("");
      expect((translated[key].match(/\{\w+\}/g) ?? []).sort()).toEqual((source[key].match(/\{\w+\}/g) ?? []).sort());
    }
  }
});
