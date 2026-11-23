import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DesktopInterfaceHost from "@/components/DesktopInterfaceHost";
import { INTERFACE_KEY, applyInterface } from "@/lib/interfaces";

const mockSetTheme = jest.fn();

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark", setTheme: mockSetTheme }),
}));
jest.mock("@/context/LanguageContext", () => ({ useLanguage: () => ({ t: {} }) }));
jest.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Desktop interface host", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-interface");
    document.body.style.overflow = "";
    mockSetTheme.mockClear();
  });

  it("renders the desktop only when its interface is active", async () => {
    render(<DesktopInterfaceHost locale="en" />);
    expect(screen.queryByTitle("ZecHub Desktop")).toBeNull();

    applyInterface("desktop");

    const frame = await screen.findByTitle("ZecHub Desktop");
    const src = frame.getAttribute("src") ?? "";
    expect(src).toMatch(/^https:\/\/[^/]+\/\?/);
    expect(src).toContain("theme=vault");
    expect(src).toContain("parentOrigin=");
  });

  it("keeps the locale and switches back to Classic when the app asks", async () => {
    applyInterface("desktop");
    render(<DesktopInterfaceHost locale="fr" />);

    const frame = (await screen.findByTitle(
      "ZecHub Desktop",
    )) as HTMLIFrameElement;
    const src = frame.getAttribute("src") ?? "";
    expect(src).toMatch(/^https:\/\/[^/]+\/fr\?/);
    expect(src).toContain("theme=vault");

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: new URL(src).origin,
        source: frame.contentWindow,
        data: { type: "zechub:switch-interface", interface: "classic" },
      }),
    );

    await waitFor(() => {
      expect(screen.queryByTitle("ZecHub Desktop")).toBeNull();
    });
    expect(document.documentElement.hasAttribute("data-interface")).toBe(false);
    expect(localStorage.getItem(INTERFACE_KEY)).toBe("classic");
  });

  it("switches to Reader when the app asks", async () => {
    applyInterface("desktop");
    render(<DesktopInterfaceHost locale="en" />);

    const frame = (await screen.findByTitle(
      "ZecHub Desktop",
    )) as HTMLIFrameElement;
    const src = frame.getAttribute("src") ?? "";

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: new URL(src).origin,
        source: frame.contentWindow,
        data: { type: "zechub:switch-interface", interface: "reader" },
      }),
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-interface")).toBe(
        "reader",
      );
    });
    expect(localStorage.getItem(INTERFACE_KEY)).toBe("reader");
    expect(screen.queryByTitle("ZecHub Desktop")).toBeNull();
  });

  it("adopts the app theme from a message", async () => {
    applyInterface("desktop");
    render(<DesktopInterfaceHost locale="en" />);

    const frame = (await screen.findByTitle(
      "ZecHub Desktop",
    )) as HTMLIFrameElement;
    const appOrigin = new URL(frame.src).origin;

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: appOrigin,
        source: frame.contentWindow,
        data: { type: "zechub:theme", theme: "paper" },
      }),
    );

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("opens My Path without leaving Desktop, and opens path pages in the desktop frame", async () => {
    applyInterface("desktop");
    render(<DesktopInterfaceHost locale="en" />);
    const frame = (await screen.findByTitle(
      "ZecHub Desktop",
    )) as HTMLIFrameElement;
    fireEvent.click(screen.getByRole("button", { name: "My Path" }));
    fireEvent.click(
      await screen
        .findAllByRole("button", { name: "Start this path" })
        .then((buttons) => buttons[0]),
    );
    fireEvent.click(
      await screen.findByRole("link", { name: /Continue: What is Zcash/ }),
    );
    await waitFor(() =>
      expect(frame.src).toContain("/start-here/what-is-zec-and-zcash"),
    );
    expect(document.documentElement.getAttribute("data-interface")).toBe(
      "desktop",
    );
    expect(screen.queryByRole("complementary", { name: "My Path" })).toBeNull();
    expect(
      JSON.parse(localStorage.getItem("zechub-my-path-v1") ?? "{}").activePath,
    ).toBe("learn");
  });

  it("returns focus to the My Path button when its panel closes", async () => {
    applyInterface("desktop");
    render(<DesktopInterfaceHost locale="en" />);
    const button = await screen.findByRole("button", { name: "My Path" });
    fireEvent.click(button);
    expect(
      await screen.findByRole("complementary", { name: "My Path" }),
    ).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Close My Path" }));
    expect(button).toHaveFocus();
  });

  it("accepts dock messages only from the embedded desktop", async () => {
    applyInterface("desktop");
    render(<DesktopInterfaceHost locale="en" />);
    const frame = await screen.findByTitle("ZecHub Desktop") as HTMLIFrameElement;
    const origin = new URL(frame.src).origin;
    window.dispatchEvent(new MessageEvent("message", { origin: "https://example.com", source: frame.contentWindow, data: { type: "zechub:open-my-path" } }));
    expect(screen.queryByRole("complementary", { name: "My Path" })).toBeNull();
    window.dispatchEvent(new MessageEvent("message", { origin, source: frame.contentWindow, data: { type: "zechub:my-path-ready" } }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "My Path" })).toBeNull());
    window.dispatchEvent(new MessageEvent("message", { origin, source: frame.contentWindow, data: { type: "zechub:open-my-path" } }));
    expect(await screen.findByRole("complementary", { name: "My Path" })).toBeVisible();
  });
});
