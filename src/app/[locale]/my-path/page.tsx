import type { Metadata } from "next";
import MyPathPage from "@/components/MyPath/MyPathPage";

export const metadata: Metadata = {
  title: "My Path | ZecHub Wiki",
  description:
    "Explore Zcash at your own pace with private, browser-only learning paths.",
};

export default function Page() {
  return <MyPathPage />;
}
