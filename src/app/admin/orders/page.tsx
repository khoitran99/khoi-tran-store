import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/ui/delete-dialog";
import Pagination from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/config/auth";
import { deleteAnOrder, getAllOrders } from "@/lib/actions/order.action";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Orders",
};
const OrdersPage = async (props: {
  searchParams: Promise<{ page?: string; size?: string }>;
}) => {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("User is not authorized");
  }
  const { page = "1", size = DEFAULT_PAGE_SIZE.toString() } =
    await props.searchParams;

  const { data, success } = await getAllOrders({
    page: Number(page),
    size: Number(size),
  });
  if (!success) return <>There is an error!</>;
  return (
    <div className="space-y-2">
      <h2 className="h2-bold">Orders</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((order) => {
              return (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    {formatDateTime(order.createdAt).dateTime}
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell>
                    {order.isPaid ? (
                      <Badge variant={"secondary"}>
                        Paid at {formatDateTime(order.paidAt!).dateTime}
                      </Badge>
                    ) : (
                      <Badge variant={"destructive"}>Not paid</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered ? (
                      <Badge variant={"secondary"}>
                        Delivered at{" "}
                        {formatDateTime(order.deliveredAt!).dateTime}
                      </Badge>
                    ) : (
                      <Badge variant={"destructive"}>Not delivered</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/orders/${order.id}`}>
                        View Detail
                      </Link>
                    </Button>
                    <DeleteDialog id={order.id} action={deleteAnOrder} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {(data?.numPages ?? 0) > 1 && (
          <Pagination
            page={Number(page) || 1}
            numPages={Number(data?.numPages)}
          />
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
