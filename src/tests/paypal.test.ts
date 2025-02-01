import { paypal } from "../lib/paypal";

// Test to generate token from Paypal
test("1. Generate token from Paypal", async () => {
  const token = await paypal.generateAccessToken();
  expect(typeof token).toBe("string");
  expect(token.length).toBeGreaterThan(0);
});
