export type LearningStep = { href: string; title: string; description: string };
export type LearningPath = {
  id: string;
  title: string;
  description: string;
  audience: string;
  steps: LearningStep[];
};

// Routes are the stable identity of a step; the same page can belong to multiple paths.
export const learningPaths: readonly LearningPath[] = [
  {
    id: "learn",
    title: "Learn Zcash",
    audience: "New to Zcash",
    description:
      "Learn the basics of Zcash, financial privacy, and the network.",
    steps: [
      {
        href: "/start-here/what-is-zec-and-zcash",
        title: "What is Zcash?",
        description: "Learn what Zcash and ZEC are.",
      },
      {
        href: "/start-here/new-user-guide",
        title: "New user guide",
        description: "Start with the Zcash user guide.",
      },
      {
        href: "/using-zcash/shielded-pools",
        title: "Shielded pools",
        description: "Learn about shielded and transparent pools.",
      },
      {
        href: "/start-here/network-upgrades",
        title: "Network upgrades",
        description: "See how Zcash has evolved.",
      },
    ],
  },
  {
    id: "use",
    title: "Use Zcash privately",
    audience: "Ready to use ZEC",
    description:
      "Explore wallets, transactions and the choices that affect privacy.",
    steps: [
      {
        href: "/guides/using-zec-privately",
        title: "Using ZEC privately",
        description: "Start with a practical overview of shielded use.",
      },
      {
        href: "/wallets",
        title: "Explore wallets",
        description: "Compare wallets and their features.",
      },
      {
        href: "/using-zcash/buying-zec",
        title: "Buying ZEC",
        description: "Learn about ways to acquire ZEC.",
      },
      {
        href: "/using-zcash/transactions",
        title: "Transactions",
        description: "Learn how Zcash transactions work.",
      },
      {
        href: "/using-zcash/shielded-pools",
        title: "Shielded pools",
        description: "Learn what shielded and transparent activity means.",
      },
    ],
  },
  {
    id: "build",
    title: "Build with Zcash",
    audience: "Developers",
    description: "Find the technical resources and tools to start building.",
    steps: [
      {
        href: "/developers",
        title: "Developer resources",
        description: "Find Zcash development resources.",
      },
      {
        href: "/developers/quick-start",
        title: "Developer quick start",
        description: "Get started with Zcash development tools.",
      },
      {
        href: "/guides/zcash-devtool",
        title: "Zcash Devtool",
        description: "Learn how to use Zcash Devtool.",
      },
      {
        href: "/visualizer",
        title: "Zcash visualizers",
        description: "Explore interactive Zcash visualizations.",
      },
    ],
  },
  {
    id: "contribute",
    title: "Contribute to ZecHub",
    audience: "Community contributors",
    description: "Learn how the community works and where you can help.",
    steps: [
      {
        href: "/start-here/what-is-zechub",
        title: "What is ZecHub?",
        description: "Learn about ZecHub and its mission.",
      },
      {
        href: "/contribute/help-build-zechub",
        title: "Help build ZecHub",
        description: "Explore ways to contribute.",
      },
      {
        href: "/contribute/contributing-guide",
        title: "Contributing guide",
        description: "Understand the contribution workflow.",
      },
      {
        href: "/contribute/style-guide",
        title: "ZecHub style guide",
        description: "Learn the community's content conventions.",
      },
    ],
  },
];

export const findPath = (id: string | null | undefined) =>
  learningPaths.find((path) => path.id === id);
export const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";
