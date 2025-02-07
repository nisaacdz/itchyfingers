import { BellDot, Crown, Info, Keyboard, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo & Brand */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            <Link
              href="/"
              className="rounded-lg p-1 hover:bg-gray-800 transition-colors"
              aria-label="Home"
            >
              <Image
                src="./keyboard.svg"
                alt="Itchy Fingers Logo"
                width={48}
                height={48}
                className="h-12 w-12"
                priority
              />
            </Link>
            <span className="text-2xl font-bold text-white hidden md:inline-block">
              Itchy Fingers
            </span>
          </div>

          {/* Center Section - Navigation Icons */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-2xl">
            <div className="flex items-center space-x-6 lg:space-x-8">
              <NavLink
                href="/zone"
                icon={<Keyboard className="size-6" />}
                label="Challenge"
              />
              <NavLink
                href="/info"
                icon={<Info className="size-6" />}
                label="Info"
              />
              <NavLink
                href="/leaderboard"
                icon={<Crown className="size-6" />}
                label="Leaderboard"
              />
              <NavLink
                href="/settings"
                icon={<Settings className="size-6" />}
                label="Settings"
              />
            </div>
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <NavLink
              href="/notifications"
              icon={<BellDot className="size-6" />}
              label="Notifications"
            />
            <NavLink
              href="/login"
              icon={<User className="size-6" />}
              label="Login"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

// Reusable NavLink component for better consistency
const NavLink = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <Link
    href={href}
    className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2"
    aria-label={label}
  >
    {icon}
    <span className="sr-only">{label}</span>
  </Link>
);

export default NavBar;
