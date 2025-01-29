"use client";

import { Button } from "@/components/ui/button";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { Cart, CartItem } from "@/types";
import { PlusIcon, MinusIcon, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTransition } from "react";

const AddToCart = ({ item, cart }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
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

  const handleRemoveFromCart = async () => {
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

  // Check if item is in cart
  const existingItem =
    cart &&
    cart.items.find((cartItem) => cartItem.productId === item.productId);

  if (existingItem) {
    return (
      <div className="flex justify-between items-center">
        <Button
          disabled={isPending}
          className="w-fit"
          variant={"outline"}
          onClick={handleRemoveFromCart}
        >
          {isPending ? <Loader className="animate-spin" /> : <MinusIcon />}
        </Button>
        <span>{existingItem.quantity}</span>
        <Button
          className="w-fit"
          variant={"outline"}
          onClick={handleAddToCart}
          disabled={isPending}
        >
          {isPending ? <Loader className="animate-spin" /> : <PlusIcon />}
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="w-full"
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
    >
      {isPending ? <Loader className="animate-spin" /> : <PlusIcon />} Add To
      Cart
    </Button>
  );
};

export default AddToCart;
