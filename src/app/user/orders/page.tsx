import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyOrders } from "@/lib/actions/user.action";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "My Orders",
};
const UserOrdersPage = async (props: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await props.searchParams;
  const { data: orders } = await getMyOrders({
    page: Number(page) || 1,
  });
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
            {orders?.data?.map((order) => {
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
                    <Link href={`/order/${order.id}`}>
                      <Button>View Detail</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {(orders?.numPages ?? 0) >= 1 && (
          <Pagination
            page={Number(page) || 1}
            numPages={Number(orders?.numPages)}
          />
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;
