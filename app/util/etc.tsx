import { Keyboard, Info, Crown, Settings } from "lucide-react";

export const NavMenuItems = [
  {
    href: "/zone",
    icon: <Keyboard className="size-6" />,
    label: "Challenge",
  },
  {
    href: "/info",
    icon: <Info className="size-6" />,
    label: "Info",
  },
  {
    href: "/leaderboard",
    icon: <Crown className="size-6" />,
    label: "Leaderboard",
  },
  {
    href: "/settings",
    icon: <Settings className="size-6" />,
    label: "Settings",
  },
];
