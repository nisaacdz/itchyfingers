import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Leaderboards</h1>
          <p className="text-lg text-muted-foreground">
            See how you stack up against the best typists in the world.
          </p>
        </div>

        <div className="flex items-center justify-center py-16">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4 text-2xl">
                Global Leaderboards are on the way!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                The global leaderboards are being polished and will be available
                soon. Get ready to climb the ranks and prove your skills!
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
