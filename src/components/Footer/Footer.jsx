import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-100 mt-12 border-t border-amber-700">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Top Section */}
        <div className="grid md:grid-cols-4 gap-10 text-center md:text-left">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-2 tracking-wide">Vedam</h2>
            <p className="text-sm opacity-80 leading-relaxed">
              Share ideas, write articles, and connect with developers worldwide.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white hover:translate-x-1 transition inline-block">Home</a></li>
              <li><a href="/articles" className="hover:text-white hover:translate-x-1 transition inline-block">Articles</a></li>
              <li><a href="/about" className="hover:text-white hover:translate-x-1 transition inline-block">About</a></li>
            </ul>
          </div>

          {/* Developer Section */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Developer</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com/your-username" target="_blank" rel="noreferrer"
                  className="hover:text-white transition flex items-center gap-2">
                  <FaGithub /> GitHub
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noreferrer"
                  className="hover:text-white transition flex items-center gap-2">
                  <FaLinkedin /> LinkedIn
                </a>
              </li>
              <li>
                <a href="https://twitter.com/your-handle" target="_blank" rel="noreferrer"
                  className="hover:text-white transition flex items-center gap-2">
                  <FaTwitter /> Twitter
                </a>
              </li>
            </ul>
          </div>

          {/* Social Icons */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Connect</h3>
            <div className="flex justify-center md:justify-start gap-5 text-xl">
              <a href="#" className="hover:text-white hover:scale-110 transition">
                <FaGithub />
              </a>
              <a href="#" className="hover:text-white hover:scale-110 transition">
                <FaLinkedin />
              </a>
              <a href="#" className="hover:text-white hover:scale-110 transition">
                <FaTwitter />
              </a>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-amber-700 my-6"></div>

        {/* Bottom */}
        <div className="text-center text-xs opacity-70">
          © {new Date().getFullYear()} Vedam. Built with ❤️ by Ankit Maurya.
        </div>

      </div>
    </footer>
  );
};

export default Footer;