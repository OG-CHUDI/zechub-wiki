import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PathProvider, parsePathState, resetPathSessionForTests, useMyPath } from "../PathProvider";

jest.mock("@/context/LanguageContext", () => ({ useLanguage: () => ({ t: {} }) }));

function Controls() {
  const {
    state,
    ready,
    choosePath,
    toggleStep,
    toggleSaved,
    resetPath,
    clearAll,
    requestSaving,
  } = useMyPath();
  return (
    <div>
      <span data-testid="state">
        {ready ? JSON.stringify(state) : "loading"}
      </span>
      <button onClick={() => choosePath("learn")}>Choose</button>
      <button
        onClick={() => toggleStep("learn", "/start-here/what-is-zec-and-zcash")}
      >
        Complete
      </button>
      <button onClick={() => toggleSaved("/wallets", "Wallets")}>Save</button>
      <button onClick={() => resetPath("learn")}>Reset</button>
      <button onClick={clearAll}>Clear</button>
      <button onClick={requestSaving}>Enable saving</button>
    </div>
  );
}

beforeEach(() => { localStorage.clear(); resetPathSessionForTests(); });

it("persists progress and saved pages, and resets them independently", async () => {
  const view = render(
    <PathProvider>
      <Controls />
    </PathProvider>,
  );
  await waitFor(() =>
    expect(screen.getByTestId("state")).not.toHaveTextContent("loading"),
  );
  fireEvent.click(screen.getByText("Choose"));
  expect(localStorage.getItem("zechub-my-path-v1")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Save on this browser" }));
  fireEvent.click(screen.getByText("Complete"));
  fireEvent.click(screen.getByText("Save"));
  view.unmount();
  resetPathSessionForTests();
  render(
    <PathProvider>
      <Controls />
    </PathProvider>,
  );
  await waitFor(() =>
    expect(screen.getByTestId("state")).toHaveTextContent("/wallets"),
  );
  expect(screen.getByTestId("state")).toHaveTextContent(
    "/start-here/what-is-zec-and-zcash",
  );
  fireEvent.click(screen.getByText("Reset"));
  expect(screen.getByTestId("state")).not.toHaveTextContent(
    "/start-here/what-is-zec-and-zcash",
  );
  expect(screen.getByTestId("state")).toHaveTextContent("/wallets");
  fireEvent.click(screen.getByText("Clear"));
  expect(screen.getByTestId("state")).not.toHaveTextContent("/wallets");
  expect(localStorage.getItem("zechub-my-path-v1")).toBeNull();
});

it("ignores malformed or unsafe saved state", () => {
  expect(parsePathState("not json").saved).toEqual([]);
  const parsed = parsePathState(
    JSON.stringify({
      activePath: "unknown",
      completed: { learn: ["/unknown", "/start-here/what-is-zec-and-zcash"] },
      saved: [
        { href: "//example.com", title: "bad" },
        { href: "/wallets", title: "Wallets" },
      ],
    }),
  );
  expect(parsed.activePath).toBeNull();
  expect(parsed.completed.learn).toEqual(["/start-here/what-is-zec-and-zcash"]);
  expect(parsed.saved).toEqual([{ href: "/wallets", title: "Wallets" }]);
});

it("synchronizes progress between two workspaces on the same page", async () => {
  render(
    <>
      <PathProvider>
        <Controls />
      </PathProvider>
      <PathProvider>
        <Controls />
      </PathProvider>
    </>,
  );
  await waitFor(() =>
    expect(screen.getAllByTestId("state")[1]).not.toHaveTextContent("loading"),
  );
  fireEvent.click(screen.getAllByText("Choose")[0]);
  fireEvent.click(screen.getByRole("button", { name: "Save on this browser" }));
  expect(screen.getAllByTestId("state")[1]).toHaveTextContent(
    '"activePath":"learn"',
  );
  fireEvent.click(screen.getAllByText("Clear")[0]);
  expect(localStorage.getItem("zechub-my-path-v1")).toBeNull();
  expect(screen.getAllByTestId("state")[1]).toHaveTextContent('"activePath":null');
});

it("keeps progress in memory when saving is declined", async () => {
  render(<PathProvider><Controls /></PathProvider>);
  await waitFor(() => expect(screen.getByTestId("state")).not.toHaveTextContent("loading"));
  fireEvent.click(screen.getByText("Choose"));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Continue without saving" }));
  fireEvent.click(screen.getByText("Complete"));
  fireEvent.click(screen.getByText("Save"));
  expect(screen.getByTestId("state")).toHaveTextContent("/wallets");
  expect(localStorage.getItem("zechub-my-path-v1")).toBeNull();
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  fireEvent.click(screen.getByText("Enable saving"));
  fireEvent.click(await screen.findByRole("button", { name: "Save on this browser" }));
  expect(JSON.parse(localStorage.getItem("zechub-my-path-v1")!).state.saved[0].href).toBe("/wallets");
});

it("does not start or store a path when the dialog is cancelled", async () => {
  render(<PathProvider><Controls /></PathProvider>);
  await waitFor(() => expect(screen.getByTestId("state")).not.toHaveTextContent("loading"));
  fireEvent.click(screen.getByText("Choose"));
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByTestId("state")).toHaveTextContent('"activePath":null');
  expect(localStorage.getItem("zechub-my-path-v1")).toBeNull();
});

it("asks for the same choice when saving a page before starting a path", async () => {
  render(<PathProvider><Controls /></PathProvider>);
  await waitFor(() => expect(screen.getByTestId("state")).not.toHaveTextContent("loading"));
  fireEvent.click(screen.getByText("Save"));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(localStorage.getItem("zechub-my-path-v1")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Continue without saving" }));
  expect(screen.getByTestId("state")).toHaveTextContent("/wallets");
  expect(localStorage.getItem("zechub-my-path-v1")).toBeNull();
});

it("does not restore legacy data before consent and removes it if declined", async () => {
  localStorage.setItem("zechub-my-path-v1", JSON.stringify({ activePath: "learn", completed: {}, saved: [{ href: "/wallets", title: "Wallets" }] }));
  render(<PathProvider><Controls /></PathProvider>);
  await waitFor(() => expect(screen.getByTestId("state")).not.toHaveTextContent("loading"));
  expect(screen.getByTestId("state")).not.toHaveTextContent("/wallets");
  fireEvent.click(screen.getByText("Choose"));
  fireEvent.click(screen.getByRole("button", { name: "Continue without saving" }));
  expect(localStorage.getItem("zechub-my-path-v1")).toBeNull();
});

it("restores legacy data only when the visitor opts in", async () => {
  localStorage.setItem("zechub-my-path-v1", JSON.stringify({ activePath: "learn", completed: {}, saved: [{ href: "/wallets", title: "Wallets" }] }));
  render(<PathProvider><Controls /></PathProvider>);
  await waitFor(() => expect(screen.getByTestId("state")).not.toHaveTextContent("loading"));
  fireEvent.click(screen.getByText("Choose"));
  fireEvent.click(screen.getByRole("button", { name: "Save on this browser" }));
  expect(screen.getByTestId("state")).toHaveTextContent("/wallets");
  expect(JSON.parse(localStorage.getItem("zechub-my-path-v1")!).consent).toBe(true);
});
