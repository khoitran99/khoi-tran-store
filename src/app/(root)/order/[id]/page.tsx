import OrderDetailTable from "@/components/shared/order/order-detail-table";
import { auth } from "@/config/auth";
import { getOrderByIdAndUserId } from "@/lib/actions/order.action";
import { getUserById } from "@/lib/actions/user.action";
import { ShippingAddress } from "@/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Detail",
};

const OrderDetailPage = async (props: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("No user id");

  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const { id } = await props.params;
  const orderDetail = await getOrderByIdAndUserId(id, user.id);
  if (!orderDetail) return notFound();

  return (
    <>
      <OrderDetailTable
        userId={user.id}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
        order={{
          ...orderDetail,
          shippingAddress: orderDetail.shippingAddress as ShippingAddress,
        }}
      />
    </>
  );
};

export default OrderDetailPage;
