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
      "Build a foundation in Zcash, financial privacy and the network.",
    steps: [
      {
        href: "/start-here/what-is-zec-and-zcash",
        title: "What is Zcash?",
        description: "Meet Zcash and the ideas behind it.",
      },
      {
        href: "/start-here/new-user-guide",
        title: "New user guide",
        description: "Get oriented with the essentials.",
      },
      {
        href: "/using-zcash/shielded-pools",
        title: "Shielded pools",
        description: "Understand the building blocks of private transactions.",
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
        description: "Explore the developer ecosystem.",
      },
      {
        href: "/developers/quick-start",
        title: "Developer quick start",
        description: "Get familiar with the tools and components.",
      },
      {
        href: "/guides/zcash-devtool",
        title: "Zcash Devtool",
        description: "Explore a practical development tool.",
      },
      {
        href: "/visualizer",
        title: "Zcash visualizers",
        description: "Explore concepts interactively.",
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
        description: "Discover the project and its mission.",
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
