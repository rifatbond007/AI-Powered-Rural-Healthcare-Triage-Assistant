import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "@/app/screens/Dashboard";

const mockGetPatients = vi.fn();

vi.mock("@/app/api", () => ({
  getPatients: (...args: any[]) => mockGetPatients(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("user", JSON.stringify({ name: "Amina Khatun", clinicLocation: "Sylhet Rural Health Centre" }));
});

describe("Dashboard", () => {
  it("renders greeting with CHW name from localStorage", () => {
    mockGetPatients.mockRejectedValue(new Error("offline"));
    render(<Dashboard onStart={vi.fn()} lang="en" />);
    expect(screen.getByText("Good morning,")).toBeInTheDocument();
    expect(screen.getByText("Amina Khatun")).toBeInTheDocument();
  });

  it("falls back to translated CHW name when localStorage is empty", () => {
    localStorage.clear();
    mockGetPatients.mockRejectedValue(new Error("offline"));
    render(<Dashboard onStart={vi.fn()} lang="en" />);
    expect(screen.getByText("Amina Khatun")).toBeInTheDocument();
  });

  it("renders Start New Patient Triage button", () => {
    mockGetPatients.mockRejectedValue(new Error("offline"));
    render(<Dashboard onStart={vi.fn()} lang="en" />);
    expect(screen.getByText("Start New Patient Triage")).toBeInTheDocument();
  });

  it("renders Recent Cases heading", () => {
    mockGetPatients.mockRejectedValue(new Error("offline"));
    render(<Dashboard onStart={vi.fn()} lang="en" />);
    expect(screen.getByText("Recent Cases")).toBeInTheDocument();
  });

  it("displays MOCK_CASES when API fails", async () => {
    mockGetPatients.mockRejectedValue(new Error("offline"));
    render(<Dashboard onStart={vi.fn()} lang="en" />);
    expect(await screen.findByText("Md. Abdul Rahman")).toBeInTheDocument();
    expect(screen.getByText("Sita Devi")).toBeInTheDocument();
    expect(screen.getByText("Md. Karim")).toBeInTheDocument();
    expect(screen.getByText("Fatima Begum")).toBeInTheDocument();
  });

  it("patient cases show age and condition", async () => {
    mockGetPatients.mockRejectedValue(new Error("offline"));
    render(<Dashboard onStart={vi.fn()} lang="en" />);
    expect(await screen.findByText("62y · Hypertension")).toBeInTheDocument();
    expect(screen.getByText("28y · Common cold")).toBeInTheDocument();
    expect(screen.getByText("8y · Fever & cough")).toBeInTheDocument();
    expect(screen.getByText("55y · Cardiac event")).toBeInTheDocument();
  });

  it("displays triage level badges for each case", async () => {
    mockGetPatients.mockRejectedValue(new Error("offline"));
    render(<Dashboard onStart={vi.fn()} lang="en" />);
    expect(await screen.findByText("URGENT")).toBeInTheDocument();
    expect(screen.getByText("MINOR")).toBeInTheDocument();
    expect(screen.getByText("MODERATE")).toBeInTheDocument();
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });

  it("clicking start triage triggers onStart callback", async () => {
    mockGetPatients.mockRejectedValue(new Error("offline"));
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<Dashboard onStart={onStart} lang="en" />);
    await user.click(screen.getByText("Start New Patient Triage"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("renders location string from localStorage", () => {
    mockGetPatients.mockRejectedValue(new Error("offline"));
    render(<Dashboard onStart={vi.fn()} lang="en" />);
    expect(screen.getByText("Sylhet Rural Health Centre")).toBeInTheDocument();
  });
});
