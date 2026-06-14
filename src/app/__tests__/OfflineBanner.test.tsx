import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfflineBanner } from "@/app/components/shared/OfflineBanner";

describe("OfflineBanner", () => {
  it("renders offline message in English", () => {
    render(<OfflineBanner lang="en" />);
    expect(screen.getByText("No Internet Connection")).toBeInTheDocument();
  });

  it("renders offline sub-message in English", () => {
    render(<OfflineBanner lang="en" />);
    expect(screen.getByText(/Working in offline mode/)).toBeInTheDocument();
  });

  it("renders offline message in Bengali", () => {
    render(<OfflineBanner lang="bn" />);
    expect(screen.getByText("ইন্টারনেট সংযোগ নেই")).toBeInTheDocument();
  });

  it("renders offline sub-message in Bengali", () => {
    render(<OfflineBanner lang="bn" />);
    expect(screen.getByText(/অফলাইন মোডে কাজ করছে/)).toBeInTheDocument();
  });

  it("has WifiOff icon", () => {
    const { container } = render(<OfflineBanner lang="en" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
