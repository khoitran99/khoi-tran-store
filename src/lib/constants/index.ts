export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Khoi Store";

export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "E-Commerce Course with Nextjs 15 and React 19";

export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVICE_URL || "http://localhost:3000";

export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 8;

export const signInDefaultValues = {
  email: "",
  password: "",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};
