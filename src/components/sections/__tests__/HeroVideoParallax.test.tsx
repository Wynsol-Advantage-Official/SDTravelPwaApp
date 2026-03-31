import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";
import { HeroVideoParallax } from "@/components/sections/HeroVideoParallax";
import type { HeroContent } from "@/types/homepage";

jest.mock("framer-motion", () => ({
  useReducedMotion: jest.fn(),
}));

jest.mock("next/link", () => {
  return function MockLink({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

const mockHeroContent: HeroContent = {
  eyebrow: "Bespoke Concierge Travel",
  headline: "Where Every Journey Becomes a Diamond",
  subhead: "Premium itineraries with concierge precision.",
  primaryCta: {
    label: "Explore Diamonds",
    href: "/tours",
  },
  secondaryCta: {
    label: "Speak to Concierge",
    href: "/dashboard/chat",
  },
  fallbackNote: "Video preview unavailable on this device.",
  video: {
    src: "/media/home-hero.mp4",
    poster: "/media/home-hero-poster.jpg",
  },
};

const mockedUseReducedMotion =
  useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;

describe("HeroVideoParallax", () => {
  beforeEach(() => {
    mockedUseReducedMotion.mockReturnValue(false);
  });

  it("shows fallback copy when autoplay is blocked", async () => {
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: jest.fn().mockRejectedValue(new Error("autoplay blocked")),
    });

    render(<HeroVideoParallax content={mockHeroContent} />);

    await waitFor(() => {
      expect(
        screen.getByText("Video preview unavailable on this device.")
      ).toBeInTheDocument();
    });
  });

  it("shows explicit loading hint when media remains loading past threshold", () => {
    jest.useFakeTimers();

    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: jest.fn().mockReturnValue(new Promise(() => {})),
    });

    render(<HeroVideoParallax content={mockHeroContent} />);

    expect(screen.queryByText("Loading video preview")).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(301);
    });

    expect(screen.getByText("Loading video preview")).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("keeps hero media transform static when reduced motion is enabled", () => {
    mockedUseReducedMotion.mockReturnValue(true);

    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: jest.fn().mockReturnValue(new Promise(() => {})),
    });

    const { container } = render(<HeroVideoParallax content={mockHeroContent} />);

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 5000,
    });

    act(() => {
      fireEvent.scroll(window);
    });

    const mediaLayer = container.querySelector(
      "[data-testid='hero-media-layer']"
    ) as HTMLDivElement;

    expect(mediaLayer.style.transform).toBe("translateY(0px)");
  });

  it("renders primary and secondary CTAs with expected routes", () => {
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: jest.fn().mockReturnValue(Promise.resolve()),
    });

    render(<HeroVideoParallax content={mockHeroContent} />);

    expect(
      screen.getByRole("link", { name: "Explore Diamonds" })
    ).toHaveAttribute("href", "/tours");
    expect(
      screen.getByRole("link", { name: "Speak to Concierge" })
    ).toHaveAttribute("href", "/dashboard/chat");
  });
});
