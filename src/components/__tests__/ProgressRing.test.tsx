import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressRing from "../ProgressRing";

describe("ProgressRing", () => {
  it("renders the percentage text", () => {
    render(<ProgressRing percent={42} />);
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("renders 0% correctly", () => {
    render(<ProgressRing percent={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders 100% correctly", () => {
    render(<ProgressRing percent={100} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    const { container } = render(<ProgressRing percent={50} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies custom size", () => {
    const { container } = render(<ProgressRing percent={50} size={140} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "140");
    expect(svg).toHaveAttribute("height", "140");
  });

  it("renders two circles (track + progress)", () => {
    const { container } = render(<ProgressRing percent={75} />);
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
  });
});
