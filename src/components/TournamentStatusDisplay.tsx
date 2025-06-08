import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

interface TournamentStatusDisplayProps {
  loading?: boolean;
  error?: string | null;
  notFound?: boolean;
  message?: string;
}

export default function TournamentStatusDisplay({
  loading,
  error,
  notFound,
  message,
}: TournamentStatusDisplayProps) {
  let title = "";
  let content = "";

  if (loading) {
    title = "Loading";
    content = "Loading tournament details...";
  } else if (error) {
    title = "Error";
    content = error;
  } else if (notFound) {
    title = "Not Found";
    content =
      message ||
      "The tournament you're looking for doesn't exist or could not be loaded.";
  } else {
    return null; // Should not happen if used correctly
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 text-center">
        {loading ? (
          <p>{content}</p>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className={error ? "text-red-500" : ""}>
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{content}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
