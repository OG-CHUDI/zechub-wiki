import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PathProvider, parsePathState, useMyPath } from "../PathProvider";

function Controls() {
  const {
    state,
    ready,
    choosePath,
    toggleStep,
    toggleSaved,
    resetPath,
    clearAll,
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
    </div>
  );
}

beforeEach(() => localStorage.clear());

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
  fireEvent.click(screen.getByText("Complete"));
  fireEvent.click(screen.getByText("Save"));
  view.unmount();
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
  expect(screen.getAllByTestId("state")[1]).toHaveTextContent(
    '"activePath":"learn"',
  );
  fireEvent.click(screen.getAllByText("Clear")[0]);
  expect(localStorage.getItem("zechub-my-path-v1")).toBeNull();
  expect(screen.getAllByTestId("state")[1]).toHaveTextContent('"activePath":null');
});
