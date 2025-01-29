import AddToCart from "@/components/shared/product/add-to-cart";
import ProductImages from "@/components/shared/product/product-images";
import ProductPrice from "@/components/shared/product/product-price";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMyCart } from "@/lib/actions/cart.action";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// This function only runs on the server at build time or on-demand
// (if using dynamic routes with revalidate).
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Fetch the product using your slug
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);

  // If no product found, you could handle it by returning a fallback title or throwing notFound()
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  // Return metadata object with dynamic title
  return {
    title: product.name ? product.name + " | E-Commerce" : "Product Detail",
    // You can add more fields dynamically if desired:
    // description: product?.description?.slice(0, 160),
    // openGraph: { ... },
    // ...
  };
}

const ProductDetailPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cart = await getMyCart();

  return (
    <section>
      <div className="grid grid-cols-1 gap-x-4 md:grid-cols-5">
        {/* Image Column */}
        <div className="col-span-2">
          <ProductImages images={product.images} />
        </div>
        {/* Details Column */}
        <div className="col-span-2">
          {/* Details Content */}
          <div className="flex flex-col gap-6">
            <p className="">
              {product.brand} {product.category}
            </p>
            <h1 className="h3-bold">{product.name}</h1>
            <p>
              {product.rating} of {product.numReviews} Reviews
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ProductPrice
                value={Number(product.price)}
                className="w-24 rounded-full bg-green-100 text-green-700 px-5 py-2"
              />
            </div>
          </div>
          <div className="mt-10">
            <p className="font-semibold">Description</p>
            <p>{product.description}</p>
          </div>
        </div>
        {/* Price Column */}
        <div className="col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex justify-between">
                <div>Price</div>
                <div>
                  <ProductPrice value={Number(product.price)} />
                </div>
              </div>
              <div className="mb-2 flex justify-between">
                <div>Status</div>
                {product.stock > 0 ? (
                  <Badge variant={"outline"}>In Stock</Badge>
                ) : (
                  <Badge variant={"destructive"}>Out of Stock</Badge>
                )}
              </div>
              {product.stock > 0 && (
                <AddToCart
                  cart={cart}
                  item={{
                    slug: product.slug,
                    price: product.price,
                    name: product.name,
                    productId: product.id,
                    quantity: 1,
                    image: product.images[0],
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;
