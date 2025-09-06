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
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  LogIn,
  Key,
  Loader2,
} from "lucide-react";

const formSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          ...values,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Login failed", {
            description: result.error,
          });
        } else {
          toast.success("Welcome back!");

          router.push("/");
        }
      } catch (error) {
        console.error("Login submission error:", error);
        toast.error("Connection error", {
          description:
            "Could not connect to the server. Please try again later.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1">
          <div className="bg-white rounded-t-2xl p-8 pb-0">
            <CardHeader className="text-center space-y-4 p-0">
              <div className="mx-auto flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full">
                <LogIn className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome Back
                </h1>
                <p className="text-muted-foreground mt-2">
                  Sign in to continue your learning journey
                </p>
              </div>
            </CardHeader>
          </div>
        </div>

        <CardContent className="p-8 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    <div className="flex justify-end mt-1">
                      <Link
                        href="/forgot-password"
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
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
          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign up now
            </Link>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <Key className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                <span className="font-medium">Demo credentials:</span>{" "}
                demo@eduflex.com / demo123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
