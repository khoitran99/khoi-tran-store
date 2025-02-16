"use server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "../utils";
import { DEFAULT_PAGE_SIZE, LATEST_PRODUCTS_LIMIT } from "../constants";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });
  return convertToPlainObject(products);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug: slug } });
  return convertToPlainObject(product);
}

export async function getAllProducts({
  page,
  size = DEFAULT_PAGE_SIZE,
  query,
  category,
}: {
  page: number;
  size?: number;
  query?: string;
  category?: string;
}) {
  const whereClause: Prisma.ProductWhereInput | undefined = {
    OR: [
      {
        name: {
          contains: query ?? "",
          mode: "insensitive",
        },
      },
      {
        category: {
          contains: category ?? "",
          mode: "insensitive",
        },
      },
    ],
  };
  try {
    const data = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: size,
      skip: (page - 1) * size,
    });
    const total = await prisma.product.count({ where: whereClause });
    return {
      success: true,
      data: {
        data,
        page,
        size,
        total,
        numPages: Math.ceil(total / size),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    const isExistedProduct = await prisma.product.findUnique({
      where: { id: id },
    });
    if (!isExistedProduct) throw new Error("Product not found");

    await prisma.product.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/admin/products");
    return {
      success: true,
      message: "The product is deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
