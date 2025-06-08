import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Optional: wrap in a card for more emphasis

interface ErrorMessageProps {
  title?: string;
  message: string | null;
  className?: string;
  showIcon?: boolean;
}

export const ErrorMessage = ({
  title = "An Error Occurred",
  message,
  className = "",
  showIcon = true,
}: ErrorMessageProps) => {
  if (!message) {
    return null;
  }

  return (
    <Card className={`border-destructive bg-destructive/10 text-destructive ${className}`} role="alert">
      <CardHeader className="flex flex-row items-center space-x-2 pb-2 pt-3">
        {showIcon && <AlertTriangle className="h-5 w-5" />}
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3 text-sm">
        <p>{message}</p>
      </CardContent>
    </Card>
  );
};