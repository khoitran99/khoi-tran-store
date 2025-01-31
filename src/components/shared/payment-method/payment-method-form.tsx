"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { paymentMethodSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updatePaymentMethod } from "@/lib/actions/user.action";

const PaymentMethodForm = ({
  preferedPaymentMethod,
}: {
  preferedPaymentMethod?: string | null;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: preferedPaymentMethod || DEFAULT_PAYMENT_METHOD,
    },
  });
  const onSubmit: SubmitHandler<z.infer<typeof paymentMethodSchema>> = async (
    values: z.infer<typeof paymentMethodSchema>
  ) => {
    startTransition(async () => {
      const res = await updatePaymentMethod(values);
      if (!res.success) {
        toast.error(res.message);
      } else {
        router.push("/place-order");
      }
    });
  };
  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Payment Method</h1>
        <p className="text-sm text-muted-foreground">
          Please choose you payment method
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        className="flex flex-col space-y-2"
                      >
                        {PAYMENT_METHODS.map((method) => {
                          return (
                            <FormItem
                              key={method}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem
                                  checked={field.value === method}
                                  value={method}
                                />
                              </FormControl>
                              <FormLabel className="font-medium">
                                {method}
                              </FormLabel>
                            </FormItem>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <Loader className="animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Continue <ArrowRight />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default PaymentMethodForm;
