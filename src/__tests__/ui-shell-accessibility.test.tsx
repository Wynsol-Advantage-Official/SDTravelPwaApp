import { render, screen, within } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}));

// useAuth — provide a minimal mock user
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { displayName: "Test User", email: "test@example.com" },
    loading: false,
    isAdmin: false,
    signIn: jest.fn(),
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
  }),
}));

// Framer Motion — replace motion components with plain elements
jest.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        // Return a forwardRef component that renders the HTML element
        const React = require("react");
        return React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
          const {
            initial: _i,
            animate: _a,
            exit: _e,
            variants: _v,
            transition: _t,
            whileHover: _wh,
            whileTap: _wt,
            whileInView: _wiv,
            ...rest
          } = props;
          return React.createElement(prop, { ...rest, ref });
        });
      },
    },
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

import { Sidebar } from "@/components/layout/desktop-shell/Sidebar";
import { TopBar } from "@/components/layout/desktop-shell/TopBar";

// ---------------------------------------------------------------------------
// Sidebar — expanded mode
// ---------------------------------------------------------------------------

describe("Sidebar (expanded)", () => {
  it("renders a navigation landmark with accessible name", () => {
    render(<Sidebar collapsed={false} />);
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it("renders all Discover group nav items including new service items", () => {
    render(<Sidebar collapsed={false} />);
    expect(screen.getByRole("link", { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^destinations$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^saved$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^tours$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^hotels$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^airbnbs$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^taxi$/i })).toBeInTheDocument();
  });

  it("renders the logo link with an accessible label", () => {
    render(<Sidebar collapsed={false} />);
    const logo = screen.getByRole("link", { name: /sand diamonds/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("href", "/");
  });

  it("marks the active nav item with aria-current='page'", () => {
    render(<Sidebar collapsed={false} />);
    const homeLink = screen.getByRole("link", { name: /^home$/i });
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });
});

// ---------------------------------------------------------------------------
// Sidebar — collapsed mode
// ---------------------------------------------------------------------------

describe("Sidebar (collapsed)", () => {
  it("provides aria-label on each nav link for assistive tech", () => {
    render(<Sidebar collapsed={true} />);
    // All nav links should have aria-label when collapsed
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    const links = within(nav).getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("aria-label");
    });
  });

  it("provides title attribute on each nav link for tooltip", () => {
    render(<Sidebar collapsed={true} />);
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    const links = within(nav).getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("title");
    });
  });

  it("has tooltip elements with role='tooltip'", () => {
    render(<Sidebar collapsed={true} />);
    const tooltips = screen.getAllByRole("tooltip");
    expect(tooltips.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// TopBar
// ---------------------------------------------------------------------------

describe("TopBar", () => {
  it("renders a search input with an accessible label", () => {
    render(<TopBar />);
    const searchInput = screen.getByRole("combobox");
    expect(searchInput).toHaveAttribute("aria-label");
    expect(searchInput.getAttribute("aria-label")).toMatch(/search/i);
  });

  it("renders the 'Plan a Trip' CTA with visible text name", () => {
    render(<TopBar />);
    const cta = screen.getByRole("link", { name: /plan a trip/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/tours");
  });

  it("renders a greeting for the user", () => {
    render(<TopBar />);
    expect(screen.getByText(/test user/i)).toBeInTheDocument();
  });

  it("has focus-visible styling classes on interactive elements", () => {
    render(<TopBar />);
    const cta = screen.getByRole("link", { name: /plan a trip/i });
    expect(cta.className).toContain("focus-visible:");
  });
});
