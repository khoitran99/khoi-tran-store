"use client";
import { useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { updateProfileSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader } from "lucide-react";
import { updateMyProfile } from "@/lib/actions/user.action";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";

const ProfileForm = () => {
  const { data: session, update } = useSession();

  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });
  const onSubmit: SubmitHandler<z.infer<typeof updateProfileSchema>> = async (
    values: z.infer<typeof updateProfileSchema>
  ) => {
    startTransition(async () => {
      const res = await updateMyProfile(values);
      if (!res.success) {
        toast.error(res.message);
      } else {
        const newSession = {
          ...session,
          user: {
            ...session?.user,
            name: values.name,
            email: values.email,
          },
        };
        await update(newSession);
        toast.success(res.message);
      }
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Email" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Name" {...field} />
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
                Update
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;
