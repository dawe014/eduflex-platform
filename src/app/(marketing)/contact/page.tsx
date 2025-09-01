"use client";

import React, { useTransition, useEffect } from "react"; // Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  ArrowRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { submitContactMessage } from "@/actions/contact-actions";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email("Please enter a valid email address."),
  subject: z
    .string()
    .min(3, { message: "Subject must be at least 3 characters." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." }),
});

const ContactPage = () => {
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", // Start with empty defaults
      email: "",
      subject: "",
      message: "",
    },
  });

  // --- THIS IS THE KEY FIX ---
  // Use useEffect to update form values when the session loads.
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      form.reset({
        name: session.user.name || "",
        email: session.user.email || "",
        subject: "",
        message: "",
      });
    }
  }, [status, session, form]);
  // The dependency array ensures this runs only when session status changes.

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const result = await submitContactMessage(values);
        toast.success(result.message);
        // Reset only the fields the user types in, keeping their info
        form.reset({
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          subject: "",
          message: "",
        });
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Touch
              </span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              We'd love to hear from you. Whether you have a question, feedback,
              or just want to say hello, our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Section (no changes needed) */}
      <section className="py-12 bg-white">{/* ... */}</section>

      {/* Contact Form & FAQ Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Send us a Message
                </h2>
                <p className="text-gray-600 mb-8">
                  Your message will be sent directly to our support team.
                </p>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="name">Full Name *</Label>
                            <FormControl>
                              <Input
                                {...field}
                                id="name"
                                placeholder="John Doe"
                                disabled={!!session}
                              />
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
                            <Label htmlFor="email">Email Address *</Label>
                            <FormControl>
                              <Input
                                {...field}
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                disabled={!!session}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="subject">Subject *</Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="subject"
                              placeholder="Course Feedback"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="message">Message *</Label>
                          <FormControl>
                            <Textarea
                              {...field}
                              id="message"
                              placeholder="How can we help you?"
                              rows={5}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isPending || status === "loading"}
                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 px-8 font-medium"
                      >
                        {isPending ? "Sending..." : "Send Message"}
                        <Send className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="lg:w-1/3">
              <div className="sticky top-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Common Questions
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      q: "How do I reset my password?",
                      a: "Visit the login page and click 'Forgot Password'. We'll send a reset link to your email.",
                    },
                    {
                      q: "Can I get a refund for a course?",
                      a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with your purchase.",
                    },
                    {
                      q: "How do I become an instructor?",
                      a: "Apply through our instructor portal. We'll review your application within 3-5 business days.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-md">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                        {item.q}
                      </h4>
                      <p className="text-gray-600 text-sm">{item.a}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-3">
                    Need Immediate Help?
                  </h3>
                  <p className="text-blue-100 mb-4">
                    Check out our comprehensive help center for quick answers to
                    common questions.
                  </p>
                  <Button
                    variant="outline"
                    className="bg-white text-blue-600 hover:bg-gray-100 border-white w-full"
                  >
                    Visit Help Center
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Map Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Find Us Here
          </h2>
          <div className="rounded-2xl overflow-hidden shadow-xl h-96 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                EduFlex Headquarters
              </h3>
              <p className="text-gray-700 mb-4">
                123 Education Street, San Francisco, CA 94103
              </p>
              <p className="text-gray-600">Open in Google Maps</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
