import CheckoutSteps from "@/components/shared/checkout/checkout-steps";
import ShippingAddressForm from "@/components/shared/shipping-address/shipping-address-form";
import { auth } from "@/config/auth";
import { getMyCart } from "@/lib/actions/cart.action";
import { getUserById } from "@/lib/actions/user.action";
import { ShippingAddress } from "@/types";
import { redirect } from "next/navigation";

const ShippingAddressPage = async () => {
  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("No user id");

  const user = await getUserById(userId);

  return (
    <>
      <CheckoutSteps current={1} />
      <ShippingAddressForm address={user?.address as ShippingAddress} />
    </>
  );
};

export default ShippingAddressPage;
