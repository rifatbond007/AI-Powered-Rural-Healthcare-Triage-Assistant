import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "@/app/screens/Login";

const mockLogin = vi.fn();

vi.mock("@/app/api", () => ({
  login: (...args: any[]) => mockLogin(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

function renderLogin() {
  const onLogin = vi.fn();
  const onRegister = vi.fn();
  const result = render(<Login lang="en" onLogin={onLogin} onRegister={onRegister} />);
  return { onLogin, onRegister, ...result };
}

describe("Login", () => {
  it("renders login form with email and password inputs and sign in button", () => {
    renderLogin();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("renders validation error for empty fields on submit", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("calls login API on submit with correct credentials", async () => {
    const user = userEvent.setup();
    const { onLogin } = renderLogin();
    mockLogin.mockResolvedValue({ token: "abc", user: { id: "1", name: "Test" } });

    await user.type(screen.getByLabelText("Email"), "chw@clinic.org");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(mockLogin).toHaveBeenCalledWith({ email: "chw@clinic.org", password: "password" });
    expect(localStorage.getItem("token")).toBe("abc");
    expect(onLogin).toHaveBeenCalledWith("abc");
  });

  it("shows error message on failed login", async () => {
    const user = userEvent.setup();
    renderLogin();
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));

    await user.type(screen.getByLabelText("Email"), "chw@clinic.org");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });

  it("shows loading state during login", async () => {
    const user = userEvent.setup();
    renderLogin();
    let resolvePromise: (v: any) => void;
    mockLogin.mockImplementation(() => new Promise((resolve) => { resolvePromise = resolve; }));

    await user.type(screen.getByLabelText("Email"), "chw@clinic.org");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByText("Signing in…")).toBeInTheDocument();
    resolvePromise!({ token: "abc", user: { id: "1" } });
  });

  it("renders link to registration page", () => {
    const { onRegister } = renderLogin();
    const createAccountLink = screen.getByText("Create one");
    expect(createAccountLink).toBeInTheDocument();
    createAccountLink.click();
    expect(onRegister).toHaveBeenCalled();
  });
});
