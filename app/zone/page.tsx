'use client'
import { useEffect, useState } from "react";
import { ZoneData } from "../types/request";
import StatsBoard from "../components/StatsBoard";
import ProgressBoard from "../components/ProgressBoard";
import TypingArea from "../components/TypingArea2";
import { getTypingText, getEverything, initialize, getZoneData } from "../dummy_api";
import { redirect } from "next/navigation";
import { DoorOpen } from "lucide-react";

export default function Page() {
    const [zoneData, setZoneData] = useState<ZoneData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [typingText, setTypingText] = useState("");

    useEffect(() => {
        initialize(() => {
            setZoneData(getZoneData())
        });
        setTypingText(getTypingText());
        let { zoneData, loading, error } = getEverything();
        setLoading(loading);
        setError(error);
        setZoneData(zoneData);
    }, []);


    const handleExit = () => {
        if (confirm("Are you sure you want to exit?")) {
            redirect("/");
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error</div>
    }

    if (!zoneData) {
        return <div>Zone not found</div>
    }

    return (
        <main className="relative w-full h-full p-4">
            <div className="flex absolute -top-14 right-8">
                <button onClick={handleExit} className="text-red-600 cursor-pointer bg-white" title="Exit">
                    <DoorOpen size={32} />
                </button>
            </div>
            <div className="grid md:grid-cols-5 grid-cols-1 gap-4 md:gap-6">
                <div className="col-span-1 w-full h-full items-center justify-center">
                    <StatsBoard userProgress={zoneData.userProgress} length={typingText.length}/>
                </div>
                <div className="col-span-4 w-full h-full">
                    <ProgressBoard participants={zoneData.participants} textLength={typingText.length}/>
                    <TypingArea text={typingText} participants={zoneData.participants} userProgress={zoneData.userProgress}/>
                </div>
            </div>
        </main>
    );
}