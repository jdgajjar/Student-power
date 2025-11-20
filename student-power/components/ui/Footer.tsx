'use client';

import { BookOpen, Mail, Phone, Copyright } from 'lucide-react';

export default function Footer() {
  const creatorName = process.env.NEXT_PUBLIC_CREATOR_NAME || 'Jenish';
  const creatorEmail = process.env.NEXT_PUBLIC_CREATOR_EMAIL || 'jenish@example.com';
  const creatorPhone = process.env.NEXT_PUBLIC_CREATOR_PHONE || '+1234567890';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Student Power</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering students with accessible educational resources and AI-powered study tools.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="/" className="hover:text-blue-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/universities" className="hover:text-blue-400 transition-colors">
                  Universities
                </a>
              </li>
              <li>
                <a href="/admin/login" className="hover:text-blue-400 transition-colors">
                  Admin Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Creator</h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">Created by:</span>
                <span>{creatorName}</span>
              </div>
              <a 
                href={`mailto:${creatorEmail}`}
                className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>{creatorEmail}</span>
              </a>
              <a 
                href={`tel:${creatorPhone}`}
                className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>{creatorPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <Copyright className="h-4 w-4" />
              <span>{currentYear} Student Power. All rights reserved.- Serious people keep out — 
    just kidding, I have no money for that</span>
            </div>

            {/* Additional Info */}
            <div className="text-gray-500 text-sm">
              Built with ❤️ by {creatorName}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
