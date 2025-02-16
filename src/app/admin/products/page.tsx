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
import { deleteProduct, getAllProducts } from "@/lib/actions/product.actions";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Products",
};
const ProductsPage = async (props: {
  searchParams: Promise<{
    page?: string;
    size?: string;
    query?: string;
    category?: string;
  }>;
}) => {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("User is not authorized");
  }
  const {
    page = "1",
    size = DEFAULT_PAGE_SIZE.toString(),
    query,
    category,
  } = await props.searchParams;

  const { data, success } = await getAllProducts({
    page: Number(page),
    size: Number(size),
    query,
    category,
  });

  console.log(data);

  if (!success) return <>There is an error!</>;
  return (
    <div className="space-y-2">
      <div className="flex-between">
        <h2 className="h2-bold">Products</h2>
        <Button asChild variant={"default"}>
          <Link href={"/admin/products/create"}>Create Product</Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((product, index) => {
              return (
                <TableRow key={product.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.rating}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/product/${product.slug}`}>View Detail</Link>
                    </Button>
                    <DeleteDialog id={product.id} action={deleteProduct} />
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

export default ProductsPage;
