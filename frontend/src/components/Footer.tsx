import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">PyroAlert</h3>
            <p className="text-gray-400 text-sm">
              Building amazing experiences for our users with cutting-edge
              technology and innovative solutions.
            </p>
            <div className="flex space-x-4">
              <NavLink
                to="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaFacebookF className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </NavLink>
              <NavLink
                to="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTwitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </NavLink>
              <NavLink
                to="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaInstagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </NavLink>
              <NavLink
                to="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaLinkedin className="h-5 w-5" />
                <span className="sr-only">NavLinkedIn</span>
              </NavLink>
            </div>
          </div>

          {/* Quick NavLinks */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <NavLink
                to="/"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Home
              </NavLink>
              <NavLink
                to="/about-us"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Contact
              </NavLink>
              <NavLink
                to="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Services
              </NavLink>
              <NavLink
                to="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </NavLink>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <nav className="flex flex-col space-y-2">
              <NavLink
                to="/contact"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Help Center
              </NavLink>
              <NavLink
                to="/contact"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                FAQ
              </NavLink>
              <NavLink
                to="/contact"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Documentation
              </NavLink>
              <NavLink
                to="/contact"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </NavLink>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Stay Updated</h4>
            <p className="text-gray-400 text-sm">
              Subscribe to our newsletter for the latest updates and news.
            </p>
            <form className="space-y-3">
              <div className="flex flex-col space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} PyroAlert. All rights reserved.
            </p>
           
          </div>
        </div>
      </div>
    </footer>
  );
}
