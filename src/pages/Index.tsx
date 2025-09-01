// src/pages/Index.tsx

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "../components/Navbar";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import { Github, Twitter, BarChart, Trophy, Globe } from "lucide-react";

// --- Aceternity UI Imports ---
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { HoverEffect } from "@/components/ui/hover-effect";

// A reusable component for social media icons
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

  // Updated features with icons for better visual representation
  const features = [
    {
      title: "Real-time Competition",
      description:
        "Compete against other typists in real-time. See live progress, speeds, and accuracy as you type.",
      link: "/tournaments",
      icon: <Trophy className="w-8 h-8 mb-2 text-blue-500" />,
    },
    {
      title: "Detailed Analytics",
      description:
        "Track your WPM, accuracy, and improvement over time. Analyze your performance with comprehensive statistics.",
      link: "/dashboard/history",
      icon: <BarChart className="w-8 h-8 mb-2 text-green-500" />,
    },
    {
      title: "Global Leaderboards",
      description:
        "Climb the rankings and compete for the top spots. See how you stack up against typists worldwide.",
      link: "/leaderboards",
      icon: <Globe className="w-8 h-8 mb-2 text-purple-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section - Revamped for Performance and Clarity */}
        <section className="relative w-full h-[40rem] flex items-center justify-center overflow-hidden">
          {/* Performant Grid Background */}
          <div className="absolute inset-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"></div>
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative z-10 container mx-auto text-center px-4"
          >
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-red-500">
                ItchyFingers
              </h1>
              <TypewriterEffectSmooth words={typewriterWords} />
              <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
                Challenge friends, compete globally, and improve your typing
                speed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <Link to="/tournaments">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Join Tournament
                  </Button>
                </Link>
                {!user && (
                  <Link to="/auth/register">
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-lg px-8 py-6"
                    >
                      Create Account
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-muted">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Why Choose ItchyFingers?
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Everything you need to become a typing pro, all in one place.
            </p>
            <div className="max-w-5xl mx-auto">
              {/* Note: Ensure your HoverEffect component can render the 'icon' prop */}
              <HoverEffect items={features} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-[#00A9FF] to-[#FF6B6B]">
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
                  className="text-lg px-8 py-6"
                >
                  Start Competing Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section - Updated with Lucide Icons */}
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
                  <Twitter className="w-6 h-6" />
                </SocialIcon>
                <SocialIcon href="#">
                  <Github className="w-6 h-6" />
                </SocialIcon>
              </div>
            </div>

            {/* Links - Product */}
            <div>
              <h4 className="font-semibold text-lg">Product</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <Link
                    to="/practice"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Practice
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
                <li>
                  <Link
                    to="/leaderboards"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Leaderboards
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
