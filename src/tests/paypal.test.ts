import { paypal } from "../lib/paypal";

// Test to generate token from Paypal
test("1. Generate token from Paypal", async () => {
  const token = await paypal.generateAccessToken();
  expect(typeof token).toBe("string");
  expect(token.length).toBeGreaterThan(0);
});

// Test to create a Paypal order
test("2. Create a Paypal order", async () => {
  const price = 10.0;

  const orderResponse = await paypal.createOrder(price);

  expect(orderResponse).toHaveProperty("id");
  expect(orderResponse).toHaveProperty("status");
  expect(orderResponse.status).toBe("CREATED");
});

// Test to capture payment with mock order
test("3. Simulate capturing a payment from an order", async () => {
  const orderId = "100";

  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({
      status: "COMPLETED",
    });

  const captureResponse = await paypal.capturePayment(orderId);
  expect(captureResponse).toHaveProperty("status", "COMPLETED");
  mockCapturePayment.mockRestore();
});
