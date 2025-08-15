import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "../components/Navbar";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#00A9FF] to-[#FF6B6B] bg-clip-text text-transparent">
              ItchyFingers
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The ultimate real-time typing competition platform. Challenge
              friends, compete globally, and improve your typing speed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/tournaments">
                <Button size="lg" className="text-lg px-8 py-4">
                  Join Tournament
                </Button>
              </Link>
              {!user && (
                <Link to="/auth/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-4"
                  >
                    Create Account
                  </Button>
                </Link>
              )}
            </div>

            {user && (
              <div className="mt-8 p-4 bg-accent/50 rounded-lg border">
                <p className="text-lg">
                  Welcome back,{" "}
                  <span className="font-semibold">{user.username}</span>! Ready
                  to compete?
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose ItchyFingers?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-[#00A9FF] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">⚡</span>
                </div>
                <CardTitle>Real-time Competition</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Compete against other typists in real-time. See live progress,
                  speeds, and accuracy as you type.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-[#FF6B6B] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <CardTitle>Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Track your WPM, accuracy, and improvement over time. Analyze
                  your performance with comprehensive statistics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-[#28A745] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🏆</span>
                </div>
                <CardTitle>Global Leaderboards</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Climb the rankings and compete for the top spots. See how you
                  stack up against typists worldwide.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <Badge variant="default" className="text-lg px-4 py-2">
                  1
                </Badge>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Join a Tournament
                </h3>
                <p className="text-muted-foreground">
                  Browse available tournaments and join one that interests you.
                  No registration required to participate!
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <Badge variant="default" className="text-lg px-4 py-2">
                  2
                </Badge>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Type Fast & Accurate
                </h3>
                <p className="text-muted-foreground">
                  When the tournament starts, type the given text as quickly and
                  accurately as possible. See your live stats and competitors'
                  progress.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <Badge variant="default" className="text-lg px-4 py-2">
                  3
                </Badge>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Check Your Results
                </h3>
                <p className="text-muted-foreground">
                  View the final leaderboard and see how you performed. Learn
                  from your mistakes and improve for the next tournament.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#00A9FF] to-[#FF6B6B]">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Test Your Skills?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of typists competing daily. Improve your speed,
              accuracy, and have fun while doing it.
            </p>
            <Link to="/tournaments">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-4"
              >
                Start Competing Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
