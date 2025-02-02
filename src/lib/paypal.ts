const baseUrl =
  process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString(
    "base64"
  );

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = await handleResponse(response);
  return data.access_token;
}

async function createOrder(price: number) {
  const accessToken = await generateAccessToken();
  const url = `${baseUrl}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: price,
          },
        },
      ],
    }),
  });
  return await handleResponse(response);
}

async function capturePayment(orderId: string) {
  const accessToken = await generateAccessToken();
  const url = `${baseUrl}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(response);
}

async function handleResponse(response: Response) {
  if (response.ok) return await response.json();
  else {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

export const paypal = { generateAccessToken, createOrder, capturePayment };
