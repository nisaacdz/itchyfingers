import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-lg text-muted-foreground">
            Manage your account, profile, and preferences.
          </p>
        </div>

        <div className="flex items-center justify-center py-16">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full">
                <SettingsIcon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4 text-2xl">
                Settings Page Under Construction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Soon, you'll be able to manage your account details, change your
                username, toggle anonymous mode, and customize your preferences
                right here.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
