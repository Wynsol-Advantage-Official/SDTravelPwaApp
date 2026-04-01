import { render, screen } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mock all luxury section components as lightweight stubs
// ---------------------------------------------------------------------------

jest.mock("@/components/sections", () => ({
  LuxuryHero: () => <section data-testid="luxury-hero">LuxuryHero</section>,
  LuxuryDestinations: () => (
    <section data-testid="luxury-destinations">LuxuryDestinations</section>
  ),
  LuxuryToursStats: () => (
    <section data-testid="luxury-tours-stats">LuxuryToursStats</section>
  ),
  LuxuryTestimonials: () => (
    <section data-testid="luxury-testimonials">LuxuryTestimonials</section>
  ),
  LuxuryPartnersCta: () => (
    <section data-testid="luxury-partners-cta">LuxuryPartnersCta</section>
  ),
}));

import HomePage from "@/app/page";

// ---------------------------------------------------------------------------
// Homepage luxury section composition
// ---------------------------------------------------------------------------

describe("HomePage luxury layout", () => {
  it("renders the LuxuryHero section", () => {
    render(<HomePage />);
    expect(screen.getByTestId("luxury-hero")).toBeInTheDocument();
  });

  it("renders the LuxuryDestinations section", () => {
    render(<HomePage />);
    expect(screen.getByTestId("luxury-destinations")).toBeInTheDocument();
  });

  it("renders the LuxuryToursStats section", () => {
    render(<HomePage />);
    expect(screen.getByTestId("luxury-tours-stats")).toBeInTheDocument();
  });

  it("renders the LuxuryTestimonials section", () => {
    render(<HomePage />);
    expect(screen.getByTestId("luxury-testimonials")).toBeInTheDocument();
  });

  it("renders the LuxuryPartnersCta section", () => {
    render(<HomePage />);
    expect(screen.getByTestId("luxury-partners-cta")).toBeInTheDocument();
  });

  it("renders all five luxury sections in a main landmark", () => {
    render(<HomePage />);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();

    // All five sections are present
    const sectionIds = [
      "luxury-hero",
      "luxury-destinations",
      "luxury-tours-stats",
      "luxury-testimonials",
      "luxury-partners-cta",
    ];
    sectionIds.forEach((id) => {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
  });

  it("renders sections in the correct order", () => {
    render(<HomePage />);
    const main = screen.getByRole("main");
    const sections = main.querySelectorAll("[data-testid]");
    const ids = Array.from(sections).map((el) => el.getAttribute("data-testid"));

    expect(ids).toEqual([
      "luxury-hero",
      "luxury-destinations",
      "luxury-tours-stats",
      "luxury-testimonials",
      "luxury-partners-cta",
    ]);
  });
});
