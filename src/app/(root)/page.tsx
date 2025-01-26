import { Metadata } from "next";
import sampleData from "@/db/sample-data";
import ProductList from "@/components/shared/product/product-list";
export const metadata: Metadata = {
  title: "Home Page",
};

const HomePage = async () => {
  return (
    <>
      <ProductList data={sampleData.products} title="Newest Arrivals" />
    </>
  );
};

export default HomePage;
