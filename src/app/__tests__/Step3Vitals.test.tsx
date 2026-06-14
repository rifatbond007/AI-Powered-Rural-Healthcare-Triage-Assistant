import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Step3Vitals } from "@/app/screens/Step3Vitals";
import type { Vitals } from "@/app/types";

const emptyVitals: Vitals = { bp: "", hr: "", temp: "", spo2: "", glucose: "" };
const normalVitals: Vitals = { bp: "120/80", hr: "75", temp: "36.5", spo2: "98", glucose: "100" };
const criticalVitals: Vitals = { bp: "150/100", hr: "40", temp: "39", spo2: "85", glucose: "250" };

function renderVitals(vitals: Vitals = emptyVitals) {
  const onChange = vi.fn();
  const onNext = vi.fn();
  const onBack = vi.fn();
  const result = render(
    <Step3Vitals vitals={vitals} onChange={onChange} onNext={onNext} onBack={onBack} lang="en" />,
  );
  return { onChange, onNext, onBack, ...result };
}

describe("Step3Vitals", () => {
  it("renders vitals entry heading", () => {
    renderVitals();
    expect(screen.getByText("Vitals Entry")).toBeInTheDocument();
  });

  it("renders all 5 vital input fields", () => {
    renderVitals();
    expect(screen.getByPlaceholderText("e.g. 120/80")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 78")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 37.2")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 98")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 110")).toBeInTheDocument();
  });

  it("renders unit labels for all fields", () => {
    renderVitals();
    expect(screen.getByText("mmHg")).toBeInTheDocument();
    expect(screen.getByText("bpm")).toBeInTheDocument();
    expect(screen.getByText("°C")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
    expect(screen.getByText("mg/dL")).toBeInTheDocument();
  });

  it("shows colored dot for normal vitals", () => {
    const { container } = renderVitals(normalVitals);
    const dots = container.querySelectorAll(".bg-green-500");
    expect(dots.length).toBe(5);
  });

  it("shows colored dot for critical vitals", () => {
    const { container } = renderVitals(criticalVitals);
    const dots = container.querySelectorAll(".bg-red-500");
    expect(dots.length).toBe(5);
  });

  it("shows grey dot for empty vitals", () => {
    const { container } = renderVitals();
    const dots = container.querySelectorAll(".bg-gray-300");
    expect(dots.length).toBe(5);
  });

  it("shows warning text for critical HR value", () => {
    renderVitals({ ...emptyVitals, hr: "40" });
    expect(screen.getByText("Heart rate dangerously abnormal")).toBeInTheDocument();
  });

  it("shows warning text for critical temp value", () => {
    renderVitals({ ...emptyVitals, temp: "39" });
    expect(screen.getByText("High fever detected")).toBeInTheDocument();
  });

  it("shows warning text for critical SpO2 value", () => {
    renderVitals({ ...emptyVitals, spo2: "85" });
    expect(screen.getByText("Critical hypoxia — act immediately")).toBeInTheDocument();
  });

  it("shows warning text for critical glucose value", () => {
    renderVitals({ ...emptyVitals, glucose: "50" });
    expect(screen.getByText("Severe hypoglycemia")).toBeInTheDocument();
  });

  it("calls onNext with vitals on form submit", async () => {
    const user = userEvent.setup();
    const { onNext } = renderVitals(normalVitals);
    await user.click(screen.getByText("Analyze & Triage"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("disables submit when no vitals entered", () => {
    renderVitals();
    expect(screen.getByText("Analyze & Triage")).toBeDisabled();
  });

  it("calls onBack when back button clicked", async () => {
    const user = userEvent.setup();
    const { onBack } = renderVitals(normalVitals);
    await user.click(screen.getByText("Back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onChange when BP input changes", async () => {
    const user = userEvent.setup();
    const { onChange } = renderVitals();
    const bpInput = screen.getByPlaceholderText("e.g. 120/80");
    await user.type(bpInput, "130");
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith({ bp: "0" });
  });
});
