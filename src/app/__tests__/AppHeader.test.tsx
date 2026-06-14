import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "@/app/components/shared/AppHeader";

describe("AppHeader", () => {
  it("renders app name", () => {
    render(<AppHeader lang="en" setLang={vi.fn()} />);
    expect(screen.getByText("RuralCare AI")).toBeInTheDocument();
  });

  it("renders location string", () => {
    render(<AppHeader lang="en" setLang={vi.fn()} />);
    expect(screen.getByText("Sylhet Rural Health Centre")).toBeInTheDocument();
  });

  it("shows Bengali toggle when lang is en", () => {
    render(<AppHeader lang="en" setLang={vi.fn()} />);
    expect(screen.getByText("বাংলা")).toBeInTheDocument();
  });

  it("shows English toggle when lang is bn", () => {
    render(<AppHeader lang="bn" setLang={vi.fn()} />);
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("calls setLang with bn when clicking language toggle in English mode", async () => {
    const user = userEvent.setup();
    const setLang = vi.fn();
    render(<AppHeader lang="en" setLang={setLang} />);
    await user.click(screen.getByText("বাংলা"));
    expect(setLang).toHaveBeenCalledWith("bn");
  });

  it("calls setLang with en when clicking language toggle in Bengali mode", async () => {
    const user = userEvent.setup();
    const setLang = vi.fn();
    render(<AppHeader lang="bn" setLang={setLang} />);
    await user.click(screen.getByText("English"));
    expect(setLang).toHaveBeenCalledWith("en");
  });

  it("calls onHome when the home button is clicked", async () => {
    const user = userEvent.setup();
    const onHome = vi.fn();
    render(<AppHeader lang="en" setLang={vi.fn()} onHome={onHome} />);
    await user.click(screen.getByText("RuralCare AI"));
    expect(onHome).toHaveBeenCalledTimes(1);
  });

  it("renders Bengali app name when lang is bn", () => {
    render(<AppHeader lang="bn" setLang={vi.fn()} />);
    expect(screen.getByText("গ্রামীণ স্বাস্থ্য AI")).toBeInTheDocument();
  });
});
