"use client";

import React, { useTransition } from "react";
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
import { createContactTicket } from "@/actions/contact-actions";
import { useSession } from "next-auth/react";
import Link from "next/link";

const formSchema = z.object({
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
    defaultValues: { subject: "", message: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const result = await createContactTicket(values);
        toast.success(result.message);
        form.reset();
      } catch (error: any) {
        toast.error(error.message || "Something went wrong.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ✅ Hero Section */}
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

      {/* ✅ Contact Info Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <CardHeader className="pb-3">
                <div className="mx-auto p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="mt-4 text-lg">Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">support@eduflex.com</p>
                <p className="text-muted-foreground text-sm mt-1">
                  info@eduflex.com
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <CardHeader className="pb-3">
                <div className="mx-auto p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors duration-300">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="mt-4 text-lg">Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Mon-Fri, 9am-5pm PST
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <CardHeader className="pb-3">
                <div className="mx-auto p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors duration-300">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="mt-4 text-lg">Visit Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">123 Education Street</p>
                <p className="text-muted-foreground text-sm mt-1">
                  San Francisco, CA 94103
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
              <CardHeader className="pb-3">
                <div className="mx-auto p-3 bg-amber-100 rounded-full group-hover:bg-amber-200 transition-colors duration-300">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="mt-4 text-lg">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Within 24 hours</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Usually faster
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ✅ Contact Form & FAQ Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Form */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Send us a Message
                </h2>
                <p className="text-gray-600 mb-8">
                  {session
                    ? "Fill out the form to create a support ticket."
                    : "Please log in to contact our support team."}
                </p>

                {status === "loading" && (
                  <div className="text-center p-8">Loading session...</div>
                )}

                {status === "unauthenticated" && (
                  <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <h3 className="font-semibold text-lg">Login Required</h3>
                    <p className="text-muted-foreground mt-2 mb-4">
                      You need to be signed in to submit a ticket.
                    </p>
                    <Button asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                )}

                {status === "authenticated" && (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-gray-700">
                          Subject *
                        </Label>
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="subject"
                                  placeholder="e.g., Issue with a course video"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-gray-700">
                          Message *
                        </Label>
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
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
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isPending}
                          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 px-8 font-medium"
                        >
                          {isPending ? "Submitting..." : "Submit Ticket"}
                          <Send className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            </div>

            {/* ✅ FAQ */}
            <div className="lg:w-1/3">
              <div className="sticky top-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Common Questions
                </h3>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-5 shadow-md">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                      How do I reset my password?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Visit the login page and click "Forgot Password". We'll
                      send a reset link to your email.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                      Can I get a refund for a course?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Yes, we offer a 30-day money-back guarantee if you're not
                      satisfied with your purchase.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                      How do I become an instructor?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Apply through our instructor portal. We'll review your
                      application within 3-5 business days.
                    </p>
                  </div>
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
