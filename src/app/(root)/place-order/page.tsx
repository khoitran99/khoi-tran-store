import CheckoutSteps from "@/components/shared/checkout/checkout-steps";
import { auth } from "@/config/auth";
import { getMyCart } from "@/lib/actions/cart.action";
import { getUserById } from "@/lib/actions/user.action";
import { ShippingAddress } from "@/types";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import PlaceOrderButton from "@/components/shared/order/place-order-form";

export const metadata: Metadata = {
  title: "Place Order",
};
const PlaceOrderPage = async () => {
  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("No user id");
  const user = await getUserById(userId);
  if (!user.paymentMethod) redirect("/payment-method");
  if (!user.address) redirect("shipping-address");

  const address = user.address as ShippingAddress;

  return (
    <>
      <CheckoutSteps current={3} />
      <h1 className="py-4 text-2xl font-semibold">Place Order</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="md:col-span-2 overflow-x-auto space-y-4">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p className="">{address.fullName}</p>
              <p className="">
                {address.streetAddress}, {address.city}, {address.postalCode},{" "}
                {address.country}
              </p>
              <div className="mt-4">
                <Link href={"/shipping-address"}>
                  <Button variant={"outline"}>Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p className="">{user.paymentMethod}</p>

              <div className="mt-4">
                <Link href={"/payment-method"}>
                  <Button variant={"outline"}>Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableCaption>A list of your recent cart items</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.image}
                            width={50}
                            height={50}
                          />
                          <p className="px-2">{item.name}</p>
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between items-center">
                <p>Items</p>
                <p className="font-bold">{formatCurrency(cart.itemsPrice)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Shipping</p>
                <p className="font-bold">
                  {formatCurrency(cart.shippingPrice)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p>Tax</p>
                <p className="font-bold">{formatCurrency(cart.taxPrice)}</p>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <p>Total</p>
                <p className="font-bold">{formatCurrency(cart.totalPrice)}</p>
              </div>
              <PlaceOrderButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderPage;
