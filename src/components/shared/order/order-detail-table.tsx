"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Order } from "@/types";
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
import Link from "next/link";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  approvePaypalOrder,
  createPaypalOrder,
} from "@/lib/actions/order.action";
import { toast } from "sonner";

const OrderDetailTable = ({
  order,
  userId,
  paypalClientId,
}: {
  order: Order;
  userId: string;
  paypalClientId: string;
}) => {
  const {
    shippingAddress,
    orderItem,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    deliveredAt,
    isDelivered,
  } = order;

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    let status = "";
    if (isPending) {
      status = "Loading PayPal...";
    } else if (isRejected) {
      status = "Error loading PayPal";
    }
    return status;
  };

  const handleCreatePayPalOrder = async () => {
    const res = await createPaypalOrder(order.id, userId);
    if (!res.success) {
      toast.error(res.message);
    }
    return res.data;
  };
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePaypalOrder(order.id, userId, data);
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
    }
  };
  return (
    <>
      <h1 className="py-4 text-2xl">#{order.id}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-y-4 overflow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p className="pb-2">{paymentMethod}</p>
              {isPaid ? (
                <Badge variant={"secondary"}>
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant={"destructive"}>Not paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p className="pb-2">
                {shippingAddress.streetAddress}, {shippingAddress.city},{" "}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>

              {isDelivered ? (
                <Badge variant={"secondary"}>
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant={"destructive"}>Not delivered</Badge>
              )}
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
                  {orderItem.map((item) => (
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
                <p className="font-bold">{formatCurrency(itemsPrice)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Shipping</p>
                <p className="font-bold">{formatCurrency(shippingPrice)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Tax</p>
                <p className="font-bold">{formatCurrency(taxPrice)}</p>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <p>Total</p>
                <p className="font-bold">{formatCurrency(totalPrice)}</p>
              </div>
              {!isPaid && paymentMethod === "PayPal" && (
                <div>
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                    }}
                  >
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailTable;
