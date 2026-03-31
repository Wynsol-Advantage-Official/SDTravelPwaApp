import { render, screen } from "@testing-library/react";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { homepageContent } from "@/mocks/homepage";
import type { TestimonialItem } from "@/types/homepage";

describe("TestimonialsSection", () => {
  it("renders at least three testimonials with required fields", () => {
    render(<TestimonialsSection items={homepageContent.testimonials} />);

    expect(screen.getByText("Client Stories")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);

    homepageContent.testimonials.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(
        screen.getAllByText((_, element) =>
          Boolean(element?.textContent?.includes(item.quote.slice(0, 20)))
        ).length
      ).toBeGreaterThan(0);
    });
  });

  it("hides optional fields when not provided", () => {
    const minimalItems: TestimonialItem[] = [
      {
        id: "t-minimal",
        quote: "Minimal testimonial copy.",
        name: "Alyssa Stone",
      },
    ];

    render(<TestimonialsSection items={minimalItems} />);

    expect(screen.getByText("Alyssa Stone")).toBeInTheDocument();
    expect(screen.queryByText("Family Retreat")).not.toBeInTheDocument();
  });

  it("renders empty-state helper when testimonials are unavailable", () => {
    render(<TestimonialsSection items={[]} />);

    expect(
      screen.getByText("Client stories are being refreshed.")
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });
});
