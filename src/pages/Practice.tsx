import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Keyboard } from "lucide-react";

export default function Practice() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Practice Mode</h1>
          <p className="text-lg text-muted-foreground">
            Hone your skills and warm up for your next competition.
          </p>
        </div>

        <div className="flex items-center justify-center py-16">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full">
                <Keyboard className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4 text-2xl">
                Practice Mode is Gearing Up!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                A dedicated space for you to practice and improve your typing
                speed and accuracy is coming soon. Stay tuned!
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
