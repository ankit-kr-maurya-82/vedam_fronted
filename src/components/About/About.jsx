import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="max-w-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-4">
          About <span className="text-blue-500">SocialApp</span>
        </h1>

        <p className="text-slate-300 text-center mb-6">
          A modern social media platform to connect, share, and express yourself.
        </p>

        <div className="space-y-4 text-slate-200 leading-relaxed">
          <p>
            🚀 <b>SocialApp</b> is built for creators and communities who want
            a simple, fast, and beautiful way to share their thoughts.
          </p>

          <p>
            💬 Post updates, like and repost content, and engage with people
            across the platform in real time.
          </p>

          <p>
            🔐 Secure authentication, clean UI, and smooth performance are at
            the core of our experience.
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <h3 className="font-semibold mb-1">⚡ Fast</h3>
            <p className="text-sm text-slate-400">
              Optimized for speed and smooth UX
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <h3 className="font-semibold mb-1">🎨 Modern</h3>
            <p className="text-sm text-slate-400">
              Clean UI with dark-mode design
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <h3 className="font-semibold mb-1">🔒 Secure</h3>
            <p className="text-sm text-slate-400">
              JWT & protected routes
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-8">
          Built with ❤️ using React, Tailwind & Express
        </p>
      </div>
    </div>
  );
};

export default About;
