import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaymentWalletsStepCard } from ".";

describe("PaymentWalletsStepCard", () => {
  const defaultProps = {
    step: "Step 1",
    headline: "Test headline",
    description: "Test description",
    children: <div data-testid="test-element" />,
  };

  it("shows a card with the passed properties", () => {
    const props = { ...defaultProps };

    render(<PaymentWalletsStepCard {...props} />);

    expect(screen.getByTestId("apple-pay-web-card")).toBeInTheDocument();
    expect(screen.getByTestId("card-title")).toBeInTheDocument();
    expect(screen.getByTestId("card-description")).toBeInTheDocument();
    expect(screen.getByTestId("test-element")).toBeInTheDocument();
  });
});
