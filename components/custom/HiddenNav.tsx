"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { NavMenuItems } from "@/util/etc";
import Link from "next/link";

const NavHiddenMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <div className="flex md:hidden">
      <DropdownMenu open={open} onOpenChange={toggleOpen}>
        <DropdownMenuTrigger className="ring-0">
          <div className="ring-0 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200">
            <Ellipsis className="size-6" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup className="space-y-2 bg-gray-900/50 backdrop-blur-md border border-gray-700 py-3">
            {NavMenuItems.map((v, index) => (
              <DropdownMenuItem key={index} onClick={toggleOpen}>
                <Link
                  href={v.href}
                  className="w-full h-full grid grid-cols-3 gap-2 p-2"
                >
                  <div className="col-span-1 flex items-center justify-center">
                    {v.icon}
                  </div>
                  <span className="col-span-2 font-semibold">{v.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NavHiddenMenu;
