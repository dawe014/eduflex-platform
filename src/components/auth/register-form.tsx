"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Social } from "./social";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  ShieldOff,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Updated schema to include the role
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z
    .nativeEnum(UserRole)
    .refine((val) => Object.values(UserRole).includes(val), {
      message: "Please select a role.",
    }),
});

interface RegisterFormProps {
  allowRegistrations: boolean;
}

export const RegisterForm = ({ allowRegistrations }: RegisterFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.STUDENT,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          body: JSON.stringify(values),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(await response.text());
        toast.success("Account created successfully!", {
          description: "You can now sign in to your account.",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
        router.push("/login");
      } catch (error: any) {
        toast.error("Registration failed", {
          description: error.message || "Please check your information.",
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1">
        <div className="bg-white rounded-t-2xl p-8 pb-0">
          <CardHeader className="text-center space-y-4 p-0">
            <div className="mx-auto flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Join EduFlex</h1>
              <p className="text-muted-foreground mt-2">
                Create your account and start learning today
              </p>
            </div>
          </CardHeader>
        </div>
      </div>

      <CardContent className="p-8 pt-6">
        {allowRegistrations ? (
          <>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="John Doe"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="john.doe@example.com"
                            type="email"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="••••••"
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3 pt-2">
                      <FormLabel>I am registering as a...</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem
                                value={UserRole.STUDENT}
                                id="role-student"
                                className="sr-only"
                              />
                            </FormControl>
                            <Label
                              htmlFor="role-student"
                              className={cn(
                                "flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                field.value === UserRole.STUDENT &&
                                  "border-primary bg-accent"
                              )}
                            >
                              <BookOpen className="mb-3 h-6 w-6" />
                              Student
                            </Label>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem
                                value={UserRole.INSTRUCTOR}
                                id="role-instructor"
                                className="sr-only"
                              />
                            </FormControl>
                            <Label
                              htmlFor="role-instructor"
                              className={cn(
                                "flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                field.value === UserRole.INSTRUCTOR &&
                                  "border-primary bg-accent"
                              )}
                            >
                              <GraduationCap className="mb-3 h-6 w-6" />
                              Instructor
                            </Label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium"
                  disabled={isPending}
                >
                  {isPending ? (
                    "Creating Account..."
                  ) : (
                    <>
                      Create Account <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
                Or continue with
              </span>
            </div>
            <Social />
          </>
        ) : (
          <div className="text-center py-8">
            <ShieldOff className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold">Registrations are Closed</h3>
            <p className="text-muted-foreground mt-2">
              We are not accepting new sign-ups at this time.
            </p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign in here
          </Link>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700 text-center">
            By creating an account, you agree to our{" "}
            <Link href="/#" className="font-medium underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/#" className="font-medium underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
