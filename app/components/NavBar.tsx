import { BellDot, Crown, Info, Keyboard, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
    return (
        <nav className="w-full h-auto flex items-center justify-center">
            <div className="flex w-auto items-center gap-12 lg:gap-16 mt-6 mb-4 text-white flex-wrap space-x-8">
            <div className="flex items-center space-x-4">
                <Link href="/" title="Home">
                    <Image src="./keyboard.svg" alt="app-logo-nav" width={54} height={54}/>
                </Link>
                <span className="text-2xl font-bold items-center">Itchy Fingers</span>
            </div>
            <div className="flex items-center space-x-8">
                <Link href="/zone" title="Challenge">
                    <Keyboard className="size-6 lg:size-8" />
                </Link>
                <Link href="/info" title="Info">
                    <Info className="size-6 lg:size-8" />
                </Link>
                <Link href="/leaderboard" title="Leaderboard">
                    <Crown className="size-6 lg:size-8" />
                </Link>
                <Link href="/settings" title="Settings">
                    <Settings className="size-6 lg:size-8" />
                </Link>
            </div>

            <div className="flex items-center space-x-4">
                <Link href="/notifications" title="Notifications">
                    <BellDot className="size-6 lg:size-8" />
                </Link>
                <Link href="/login" title="Login">
                    <User className="size-6 lg:size-8" />
                </Link>
            </div>
            </div>
        </nav>
    );
}

export default NavBar;