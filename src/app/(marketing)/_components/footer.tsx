import Link from "next/link";
import { Logo } from "./logo";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-gray-950 text-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="flex flex-col space-y-6">
            <Logo />
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Empowering learners worldwide with flexible, accessible, and
              high-quality education. Join our community of passionate educators
              and students.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-400 transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition-colors duration-300"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-blue-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/courses"
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 group-hover:mr-3 transition-all duration-300"></span>
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/#"
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 group-hover:mr-3 transition-all duration-300"></span>
                  Teach on EduFlex
                </Link>
              </li>
              <li>
                <Link
                  href="/#"
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 group-hover:mr-3 transition-all duration-300"></span>
                  Our Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/#"
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 group-hover:mr-3 transition-all duration-300"></span>
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  href="/#"
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 group-hover:mr-3 transition-all duration-300"></span>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6 relative inline-block">
              Support
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-purple-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1 h-1 bg-purple-500 rounded-full mr-2 group-hover:mr-3 transition-all duration-300"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/#"
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1 h-1 bg-purple-500 rounded-full mr-2 group-hover:mr-3 transition-all duration-300"></span>
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/#"
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1 h-1 bg-purple-500 rounded-full mr-2 group-hover:mr-3 transition-all duration-300"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/#"
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1 h-1 bg-purple-500 rounded-full mr-2 group-hover:mr-3 transition-all duration-300"></span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/#"
                  className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1 h-1 bg-purple-500 rounded-full mr-2 group-hover:mr-3 transition-all duration-300"></span>
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6 relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-green-500"></span>
            </h3>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-400">dawittamiru014@gmail.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+251 (918) 344-686</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Education Street
                  <br />
                  San Francisco, CA 94103
                </span>
              </li>
            </ul>

            {/* Newsletter Subscription */}
            <div>
              <h4 className="text-sm font-medium mb-3">Stay Updated</h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm border-0"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg text-sm font-medium transition-colors duration-300 rounded-l-none">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Subscribe to our newsletter for updates
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0 flex items-center">
            © {new Date().getFullYear()} EduFlex, Inc. All rights reserved.
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            Made with{" "}
            <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" /> by the
            EduFlex team
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/#"
              className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
            >
              Sitemap
            </Link>
            <Link
              href="/#"
              className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
            >
              Accessibility
            </Link>
            <Link
              href="/cookies"
              className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
