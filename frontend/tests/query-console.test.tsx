import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HomePage from "@/app/page";
import { QueryConsole } from "@/components/search/query-console";

describe("QueryConsole", () => {
  it("renders both query modes", () => {
    render(<QueryConsole />);

    expect(screen.getByText(/use market id/i)).toBeInTheDocument();
    expect(screen.getByText(/use custom market/i)).toBeInTheDocument();
  });

  it("runs the example custom market interaction and shows ranked output", async () => {
    const user = userEvent.setup();

    render(<QueryConsole />);

    await user.click(screen.getByRole("button", { name: /example custom market/i }));
    await user.click(screen.getByRole("button", { name: /find sources/i }));

    await waitFor(() => {
      expect(screen.getByText(/prototype result generated/i)).toBeInTheDocument();
      expect(screen.getByText("0.84")).toBeInTheDocument();
    });
  });

  it("loads a preset example into the market id field", async () => {
    const user = userEvent.setup();

    render(<QueryConsole />);

    await user.click(screen.getByRole("button", { name: /example market id/i }));

    expect(screen.getByLabelText(/market id/i)).toHaveValue("540816");
  });
});

describe("HomePage", () => {
  it("renders a workbench-first homepage with named panels and faq below the fold", () => {
    render(<HomePage />);

    const main = screen.getByRole("main");
    expect(within(main).getByRole("navigation")).toBeInTheDocument();

    expect(
      within(main).getByRole("heading", {
        name: /signal surface/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", {
        name: /ranked sources/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", {
        name: /discovery flow/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", {
        name: /target contract/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", {
        level: 1,
        name: /find signal before the market moves/i,
      }),
    ).toBeInTheDocument();
    expect(within(main).getByRole("heading", { name: /faq/i })).toBeInTheDocument();
  });
});
