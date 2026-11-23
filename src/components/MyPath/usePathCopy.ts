"use client";

import { useLanguage } from "@/context/LanguageContext";
import english from "../../../dictionaries/en.json";
import { learningPaths } from "@/lib/learningPaths";

export function usePathCopy() {
  const { t } = useLanguage();
  const copy = { ...english.myPath, ...(t?.myPath ?? {}) } as typeof english.myPath;
  const paths = learningPaths.map((path) => {
    const translated = copy.paths[path.id as keyof typeof copy.paths];
    return { ...path, title: translated?.title ?? path.title, audience: translated?.audience ?? path.audience, description: translated?.description ?? path.description, steps: path.steps.map((step, index) => ({ ...step, title: translated?.steps[index]?.title ?? step.title, description: translated?.steps[index]?.description ?? step.description })) };
  });
  return { copy, paths };
}

export function formatPathText(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}
