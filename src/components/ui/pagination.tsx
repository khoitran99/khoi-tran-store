"use client";

import { formUrlQuery } from "@/lib/utils";
import { Button } from "./button";
import { useRouter, useSearchParams } from "next/navigation";

const Pagination = ({
  page,
  numPages,
  urlParamName,
}: {
  page: number | string;
  numPages: number;
  urlParamName?: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onNext = () => {
    const pageValue = Number(page) + 1;
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: pageValue.toString(),
    });
    router.push(newUrl);
  };
  const onPrevious = () => {
    const pageValue = Number(page) - 1;
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: pageValue.toString(),
    });
    router.push(newUrl);
  };
  return (
    <div className="flex gap-2">
      <Button
        onClick={onPrevious}
        size="lg"
        variant="outline"
        className="w-28"
        disabled={Number(page) <= 1}
      >
        Previous
      </Button>
      <Button
        onClick={onNext}
        size="lg"
        variant="outline"
        className="w-28"
        disabled={Number(page) >= numPages}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
