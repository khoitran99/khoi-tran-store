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

  if (response.ok) {
    const data = await response.json();
    return data.access_token;
  } else {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

export const paypal = { generateAccessToken };
