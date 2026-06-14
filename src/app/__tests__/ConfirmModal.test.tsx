import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmModal } from "@/app/components/shared/ConfirmModal";

describe("ConfirmModal", () => {
  it("renders confirm and cancel buttons", () => {
    render(<ConfirmModal onConfirm={vi.fn()} onCancel={vi.fn()} lang="en" />);
    expect(screen.getByText("Confirm & Submit")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders title and body text in English", () => {
    render(<ConfirmModal onConfirm={vi.fn()} onCancel={vi.fn()} lang="en" />);
    expect(screen.getByText("Submit Triage Assessment?")).toBeInTheDocument();
    expect(screen.getByText("Please verify all patient information before submitting.")).toBeInTheDocument();
  });

  it("renders title and body text in Bengali", () => {
    render(<ConfirmModal onConfirm={vi.fn()} onCancel={vi.fn()} lang="bn" />);
    expect(screen.getByText("ট্রিয়াজ মূল্যায়ন জমা দিতে চান?")).toBeInTheDocument();
    expect(screen.getByText("জমা দেওয়ার আগে সকল তথ্য যাচাই করুন।")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmModal onConfirm={onConfirm} onCancel={vi.fn()} lang="en" />);
    await user.click(screen.getByText("Confirm & Submit"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmModal onConfirm={vi.fn()} onCancel={onCancel} lang="en" />);
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when backdrop overlay clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { container } = render(<ConfirmModal onConfirm={vi.fn()} onCancel={onCancel} lang="en" />);
    const overlay = container.querySelector(".fixed.inset-0")!;
    await user.click(overlay);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not call onCancel when modal content is clicked (stopPropagation)", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmModal onConfirm={vi.fn()} onCancel={onCancel} lang="en" />);
    const modalTitle = screen.getByText("Submit Triage Assessment?");
    await user.click(modalTitle);
    expect(onCancel).not.toHaveBeenCalled();
  });
});
