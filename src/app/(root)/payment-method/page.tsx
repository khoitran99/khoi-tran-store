import CheckoutSteps from "@/components/shared/checkout/checkout-steps";
import PaymentMethodForm from "@/components/shared/payment-method/payment-method-form";
import { auth } from "@/config/auth";
import { getUserById } from "@/lib/actions/user.action";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Method",
};
const PaymenMethodAddress = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("No user id");

  const user = await getUserById(userId);
  return (
    <>
      <CheckoutSteps current={2} />
      <PaymentMethodForm preferedPaymentMethod={user.paymentMethod} />
    </>
  );
};

export default PaymenMethodAddress;
