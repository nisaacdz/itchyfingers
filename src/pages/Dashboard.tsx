import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Your personal hub for stats, progress, and history.
          </p>
        </div>

        <div className="flex items-center justify-center py-16">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4 text-2xl">
                Dashboard Coming Soon!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                We're currently building a powerful dashboard for you to track
                your typing analytics, view tournament history, and see your
                progress over time. Check back soon!
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
