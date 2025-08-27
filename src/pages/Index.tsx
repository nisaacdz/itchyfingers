// src/pages/Index.tsx

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "../components/Navbar";
import { useAuthStore } from "@/stores/authStore";

// --- Aceternity UI Imports ---
import { WavyBackground } from "@/components/ui/wavy-background";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { HoverEffect } from "@/components/ui/card-hover-effect";

// A placeholder for social media icons
const SocialIcon = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-muted-foreground hover:text-primary transition-colors"
  >
    {children}
  </a>
);

export default function Index() {
  const { user } = useAuthStore();

  const typewriterWords = [
    { text: "The" },
    { text: "ultimate" },
    { text: "real-time" },
    { text: "typing" },
    { text: "competition", className: "text-blue-500 dark:text-blue-500" },
    { text: "platform." },
  ];

  const features = [
    {
      title: "Real-time Competition",
      description:
        "Compete against other typists in real-time. See live progress, speeds, and accuracy as you type.",
      link: "#1",
    },
    {
      title: "Detailed Analytics",
      description:
        "Track your WPM, accuracy, and improvement over time. Analyze your performance with comprehensive statistics.",
      link: "#2",
    },
    {
      title: "Global Leaderboards",
      description:
        "Climb the rankings and compete for the top spots. See how you stack up against typists worldwide.",
      link: "#3",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section - Restructured to prevent overflow */}
        <section className="relative w-full h-[40rem] flex items-center justify-center overflow-hidden">
          <WavyBackground className="absolute inset-0" speed="fast" />
          <div className="relative z-10 container mx-auto text-center px-4">
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                ItchyFingers
              </h1>
              <TypewriterEffectSmooth words={typewriterWords} />
              <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
                Challenge friends, compete globally, and improve your typing
                speed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <Link to="/tournaments">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Join Tournament
                  </Button>
                </Link>
                {!user && (
                  <Link to="/auth/register">
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-lg px-8 py-4"
                    >
                      Create Account
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Contained properly */}
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose ItchyFingers?
            </h2>
            <div className="max-w-5xl mx-auto">
              <HoverEffect items={features} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-[#00A9FF] to-[#FF6B6B]">
          <div className="container mx-auto text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Test Your Skills?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of typists competing daily. Improve your speed,
                accuracy, and have fun while doing it.
              </p>
              <Link to="/tournaments">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-4"
                >
                  Start Competing Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-muted/40 border-t">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About & Socials */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">ItchyFingers</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                The ultimate real-time typing competition platform to test and
                improve your typing skills.
              </p>
              <div className="flex space-x-4">
                <SocialIcon href="#">
                  {/* Placeholder for Twitter/X Icon */}
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="#">
                  {/* Placeholder for GitHub Icon */}
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </SocialIcon>
              </div>
            </div>

            {/* Links - Product */}
            <div>
              <h4 className="font-semibold text-lg">Product</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tournaments"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Tournaments
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links - Company */}
            <div>
              <h4 className="font-semibold text-lg">Company</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links - Legal */}
            <div>
              <h4 className="font-semibold text-lg">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} ItchyFingers. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
