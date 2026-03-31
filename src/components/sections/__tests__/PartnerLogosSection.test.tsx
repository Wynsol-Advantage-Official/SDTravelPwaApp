import { fireEvent, render, screen } from "@testing-library/react";
import { PartnerLogosSection } from "@/components/sections/PartnerLogosSection";
import { homepageContent } from "@/mocks/homepage";
import type { PartnerLogoItem } from "@/types/homepage";

describe("PartnerLogosSection", () => {
  it("renders multiple logos and keeps responsive grid classes", () => {
    const { container } = render(
      <PartnerLogosSection items={homepageContent.partnerLogos} />
    );

    expect(screen.getByText("Trusted by Global Partners")).toBeInTheDocument();
    expect(screen.getByAltText("Aurora Air")).toBeInTheDocument();
    expect(screen.getByText("Vela Collective")).toBeInTheDocument();

    const grid = container.querySelector(
      ".grid.grid-cols-2.sm\\:grid-cols-3.md\\:grid-cols-4.lg\\:grid-cols-6"
    );
    expect(grid).toBeInTheDocument();
  });

  it("falls back to brand-name shell when a logo image fails to load", () => {
    render(<PartnerLogosSection items={homepageContent.partnerLogos} />);

    const logo = screen.getByAltText("Aurora Air");
    fireEvent.error(logo);

    expect(screen.getByText("Aurora Air")).toBeInTheDocument();
  });

  it("filters entries without a valid partner name", () => {
    const items: PartnerLogoItem[] = [
      {
        id: "p-valid",
        name: "Northline",
        logoSrc: "/logos/northline-private-rail.svg",
        alt: "Northline",
      },
      {
        id: "p-empty",
        name: "   ",
        logoSrc: "/logos/aurora-air.svg",
        alt: "Should not render",
      },
    ];

    render(<PartnerLogosSection items={items} />);

    expect(screen.getByAltText("Northline")).toBeInTheDocument();
    expect(screen.queryByAltText("Should not render")).not.toBeInTheDocument();
  });
});
