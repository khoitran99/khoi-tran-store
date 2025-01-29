"use client";

import { Cart, CartItem } from "@/types";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { ArrowRight, Loader, MinusIcon, PlusIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async (item: CartItem) => {
    startTransition(async () => {
      const res = await addItemToCart(item);
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message, {
          action: {
            label: "Go to cart",
            onClick: () => router.push("/cart"),
          },
        });
      }
    });
  };

  const handleRemoveFromCart = async (item: CartItem) => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message, {
          action: {
            label: "Go to cart",
            onClick: () => router.push("/cart"),
          },
        });
      }
    });
  };
  return (
    <div>
      <h1 className="py-4 h2-bold">Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
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
                    <TableCell>
                      <div className="flex justify-between items-center">
                        <Button
                          disabled={isPending}
                          className="w-fit"
                          variant={"outline"}
                          onClick={() => handleRemoveFromCart(item)}
                        >
                          {isPending ? (
                            <Loader className="animate-spin" />
                          ) : (
                            <MinusIcon />
                          )}
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          className="w-fit"
                          variant={"outline"}
                          onClick={() => handleAddToCart(item)}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader className="animate-spin" />
                          ) : (
                            <PlusIcon />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card>
            <CardContent className="p-4 gap-4">
              <div className="pb-3 text-xl">
                Subtotal (
                {cart.items.reduce((acc, cur) => acc + cur.quantity, 0)}):
                <span className="font-bold">
                  {formatCurrency(cart.itemsPrice)}
                </span>
              </div>
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() => {
                  startTransition(() => router.push("/shipping-address"));
                }}
              >
                {isPending ? (
                  <Loader className="animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    Proceed to Checkout <ArrowRight />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CartTable;
