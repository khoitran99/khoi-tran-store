import CartTable from "@/components/shared/cart/cart-table";
import { getMyCart } from "@/lib/actions/cart.action";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
};
const CartPage = async () => {
  const cart = await getMyCart();
  return <CartTable cart={cart} />;
};

export default CartPage;
