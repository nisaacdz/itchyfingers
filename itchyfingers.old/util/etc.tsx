import { Keyboard, Crown, Settings, Flame } from "lucide-react";

export const NavMenuItems = [
  {
    href: "/practice",
    icon: <Keyboard className="size-6" />,
    label: "Practice",
  },
  {
    href: "/challenges",
    icon: <Flame className="size-6" />,
    label: "Challenges",
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
