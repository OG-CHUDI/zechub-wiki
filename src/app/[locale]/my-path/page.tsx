import type { Metadata } from "next";
import MyPathPage from "@/components/MyPath/MyPathPage";
import { getDictionary } from "@/lib/getDictionary";
import english from "../../../../dictionaries/en.json";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const copy = (dictionary.myPath ?? english.myPath) as typeof english.myPath;
  return { title: `${copy.myPath} | ZecHub Wiki`, description: copy.intro };
}

export default function Page() {
  return <MyPathPage />;
}
