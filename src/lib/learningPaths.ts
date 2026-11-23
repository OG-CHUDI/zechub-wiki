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
        description: "Learn about Zcash transaction privacy.",
      },
      {
        href: "/start-here/network-upgrades",
        title: "Network upgrades",
        description: "See how Zcash has evolved.",
      },
      { href: "/start-here/zcash-monetary-policy", title: "Monetary policy", description: "Understand ZEC supply and issuance." },
      { href: "/start-here/who-can-see-your-zcash-payment", title: "Who can see a payment?", description: "Explore what different people can see." },
      { href: "/start-here/zec-use-cases", title: "Ways to use ZEC", description: "Explore practical uses for Zcash." },
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
        description: "Learn how to use ZEC privately.",
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
        description: "Learn how Zcash protects transaction privacy.",
      },
      { href: "/using-zcash/unified-addresses", title: "Unified addresses", description: "Understand the addresses used to receive Zcash." },
      { href: "/using-zcash/memos", title: "Shielded memos", description: "Learn how memos work in shielded payments." },
      { href: "/using-zcash/recovering-funds", title: "Recovering funds", description: "Learn about wallet recovery and backups." },
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
      { href: "/using-zcash/testnet", title: "Zcash testnet", description: "Explore a network for testing applications." },
      { href: "/guides/zcash-js", title: "Zcash JS", description: "Explore the JavaScript developer guide." },
      { href: "/guides/zcash-node-rpc-and-indexing", title: "Nodes and indexing", description: "Learn about node RPC and blockchain indexing." },
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
      { href: "/contribute/zechub-dao", title: "ZecHub DAO", description: "Explore how the ZecHub community organizes." },
      { href: "/contribute/zecweekly-newsletter", title: "ZecWeekly", description: "Learn about the community newsletter." },
    ],
  },
  {
    id: "privacy", title: "Privacy beyond payments", audience: "Privacy learners",
    description: "Understand transaction visibility and tools that support everyday privacy.",
    steps: [
      { href: "/start-here/who-can-see-your-zcash-payment", title: "Who can see a payment?", description: "Learn what payment information can be visible." },
      { href: "/zcash-tech/what-a-block-explorer-can-see", title: "Block explorer visibility", description: "Understand what public blockchain data can reveal." },
      { href: "/zcash-tech/viewing-keys", title: "Viewing keys", description: "Explore selective sharing of transaction information." },
      { href: "/privacy-tools/secure-messengers", title: "Secure messengers", description: "Explore tools for private communication." },
      { href: "/privacy-tools/web-browsers", title: "Web browsers", description: "Learn about browser privacy choices." },
      { href: "/privacy-tools/vpn-and-dvpn", title: "VPN and dVPN", description: "Explore network privacy tools and their tradeoffs." },
      { href: "/privacy-tools/pgp-encryption", title: "PGP encryption", description: "Learn about encrypting and signing messages." },
    ],
  },
  {
    id: "protocol", title: "How Zcash works", audience: "Technical learners",
    description: "Go deeper into shielded transactions, cryptography, nodes and protocol research.",
    steps: [
      { href: "/research/zcash-foundations-series", title: "Zcash foundations", description: "Study the foundations of shielded transactions." },
      { href: "/zero-to-zero-knowledge/hash-functions", title: "Hash functions", description: "Learn a core cryptographic building block." },
      { href: "/zcash-tech/zk-snarks", title: "Zero-knowledge proofs", description: "Explore the proofs used for shielded transactions." },
      { href: "/zcash-tech/full-nodes", title: "Full nodes", description: "Learn how nodes participate in the network." },
      { href: "/zcash-tech/lightwallet-nodes", title: "Lightwallet nodes", description: "Explore infrastructure used by light wallets." },
      { href: "/research/zcash-formal-verification-series", title: "Formal verification", description: "Explore how protocol security can be verified." },
      { href: "/start-here/network-upgrades", title: "Network upgrades", description: "Follow the history of protocol changes." },
    ],
  },
  {
    id: "real-world", title: "Zcash in the real world", audience: "Everyday uses",
    description: "Explore payments, donations, creators and practical privacy scenarios.",
    steps: [
      { href: "/start-here/zec-use-cases", title: "Zcash use cases", description: "Start with an overview of ways to use ZEC." },
      { href: "/zcash-use-cases/accept-payments-as-a-merchant", title: "Merchant payments", description: "Explore accepting Zcash as a merchant." },
      { href: "/zcash-use-cases/receive-donations-privately", title: "Private donations", description: "Learn about receiving shielded donations." },
      { href: "/zcash-use-cases/freelance-privacy-setup", title: "Freelancer privacy", description: "Explore a privacy setup for freelancers." },
      { href: "/zcash-use-cases/journalist-privacy-setup", title: "Journalist privacy", description: "Explore a privacy setup for journalists." },
      { href: "/using-zcash/creators-and-tips", title: "Creators and tips", description: "Discover tools for creators and supporters." },
      { href: "/using-zcash/payment-request-uris", title: "Payment requests", description: "Learn how payment request links work." },
    ],
  },
  {
    id: "community", title: "Zcash community and governance", audience: "Community learners",
    description: "Explore the organizations, funding and people shaping the ecosystem.",
    steps: [
      { href: "/start-here/how-zcash-is-organized", title: "How Zcash is organized", description: "Meet the groups working on Zcash." },
      { href: "/start-here/development-fund", title: "Development fund", description: "Learn how network development is funded." },
      { href: "/zcash-community/zcash-governance", title: "Funding and governance", description: "Explore governance and funding in the ecosystem." },
      { href: "/zcash-community/zcap", title: "Community advisory panel", description: "Learn about the community advisory panel." },
      { href: "/zcash-community/community-projects", title: "Community projects", description: "Discover projects across the ecosystem." },
      { href: "/zcash-community/arborist-calls", title: "Arborist calls", description: "Find technical community discussions." },
      { href: "/contribute/help-build-zechub", title: "Contribute to ZecHub", description: "Find ways to help the education community." },
    ],
  },
];

export const findPath = (id: string | null | undefined) =>
  learningPaths.find((path) => path.id === id);
export const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";
