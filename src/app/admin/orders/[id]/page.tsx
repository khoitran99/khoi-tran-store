import OrderDetailTable from "@/components/shared/order/order-detail-table";
import { auth } from "@/config/auth";
import { getOrderById } from "@/lib/actions/order.action";
import { ShippingAddress } from "@/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Detail",
};

const OrderDetailPage = async (props: { params: Promise<{ id: string }> }) => {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("User is not authorized");
  }

  const { id } = await props.params;
  const orderDetail = await getOrderById(id);
  if (!orderDetail) return notFound();

  return (
    <>
      <OrderDetailTable
        userId={orderDetail.userId}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
        order={{
          ...orderDetail,
          shippingAddress: orderDetail.shippingAddress as ShippingAddress,
        }}
        isAdmin={true}
      />
    </>
  );
};

export default OrderDetailPage;
