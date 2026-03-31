import { act, fireEvent, render } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";
import { ParallaxBand } from "@/components/sections/ParallaxBand";

jest.mock("framer-motion", () => ({
  useReducedMotion: jest.fn(),
}));

const mockedUseReducedMotion =
  useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;

describe("ParallaxBand", () => {
  beforeEach(() => {
    mockedUseReducedMotion.mockReturnValue(false);
  });

  it("clamps translation under long-scroll input", () => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 50000,
    });

    const { container } = render(<ParallaxBand />);

    act(() => {
      fireEvent.scroll(window);
    });

    const layer = container.querySelector(
      "[data-testid='parallax-band-layer']"
    ) as HTMLDivElement;

    expect(layer.style.transform).toBe("translateY(140px)");
  });

  it("disables transform updates when reduced motion is enabled", () => {
    mockedUseReducedMotion.mockReturnValue(true);

    const { container } = render(<ParallaxBand />);

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 3000,
    });

    act(() => {
      fireEvent.scroll(window);
    });

    const layer = container.querySelector(
      "[data-testid='parallax-band-layer']"
    ) as HTMLDivElement;

    expect(layer.style.transform).toBe("translateY(0px)");
  });
});
