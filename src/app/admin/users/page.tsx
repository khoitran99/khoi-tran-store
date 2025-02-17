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
import { getAllUsers } from "@/lib/actions/user.action";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users",
};
const UsersPage = async (props: {
  searchParams: Promise<{
    page?: string;
    size?: string;
    query?: string;
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
  } = await props.searchParams;

  const { data, success } = await getAllUsers({
    page: Number(page),
    size: Number(size),
    query,
  });
  console.log(data);
  if (!success) return <>There is an error!</>;
  return (
    <div className="space-y-2">
      <h2 className="h2-bold">Users</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((user, index) => {
              return (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user._count.order}</TableCell>
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

export default UsersPage;
