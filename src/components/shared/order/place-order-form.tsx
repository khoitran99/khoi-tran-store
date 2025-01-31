"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader } from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/lib/actions/order.action";

const PlaceOrderButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePlaceOrder = async () => {
    startTransition(async () => {
      const res = await createOrder();
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
      }

      if (res.redirectTo) router.push(res.redirectTo);
    });
  };

  return (
    <Button onClick={handlePlaceOrder} disabled={isPending} className="w-full">
      {isPending ? (
        <Loader className="animate-spin" />
      ) : (
        <div className="flex items-center justify-center gap-2">
          <Check /> Place Order
        </div>
      )}
    </Button>
  );
};

export default PlaceOrderButton;
