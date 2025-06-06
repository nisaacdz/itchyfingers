// PasswordRecovery.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "../components/Navbar"; // Assuming this path is correct for the new location
import { toast } from "@/hooks/use-toast";
import apiService from "../api/apiService";
import { HttpResponse } from "../types/api"; // Assuming this path is correct
import {
  InputOTP,
  InputOTPGroup,
  // InputOTPSeparator, // Not used in your original ResetPassword
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader } from "lucide-react";

type FormStep = "enterEmail" | "resetPassword";

export default function PasswordRecovery() {
  const navigate = useNavigate();

  // Shared states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // General success message

  // Step-specific states
  const [formStep, setFormStep] = useState<FormStep>("enterEmail");
  const [email, setEmail] = useState(""); // Persists across steps
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // State to indicate final success before navigation
  const [passwordResetComplete, setPasswordResetComplete] = useState(false);

  // Clear errors/messages when step changes, but not email
  useEffect(() => {
    setError("");
    setSuccessMessage("");
    // Don't clear OTP/password if moving to resetPassword step (though they'll be empty initially)
    // but if for some reason we were to switch back, we might want to clear them.
    // For now, this simple clear is fine.
  }, [formStep]);

  const handleForgotPasswordSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await apiService.post<HttpResponse<null>>(
        "/auth/forgot-password",
        { email },
      );

      if (response.data.success) {
        toast({
          title: "Check your email",
          description: response.data.message || "An OTP has been sent to your email.",
        });
        setFormStep("resetPassword"); // Move to the next step
        // Optionally, set a temporary success message for this step if needed
        // setSuccessMessage("An OTP has been sent. Please check your email and enter it below.");
      } else {
        setError(response.data.message || "Failed to send password reset email.");
        toast({
            title: "Error",
            description: response.data.message || "Failed to send password reset email.",
            variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setIsLoading(false);
      return;
    }

    try {
      // IMPORTANT: The backend needs the email for the reset password step too.
      const response = await apiService.post<HttpResponse<null>>(
        `/auth/reset-password`,
        { email, password: newPassword, otp }, // Send email along with otp and newPassword
      );

      if (response.data.success) {
        setSuccessMessage(
          response.data.message || "Your password has been reset successfully.",
        );
        setPasswordResetComplete(true); // Set flag for final success UI
        toast({
          title: "Password Reset Successful",
          description: response.data.message || "You can now log in with your new password.",
        });
        setTimeout(() => navigate("/auth/login"), 3000);
      } else {
        setError(response.data.message || "Failed to reset password. Invalid OTP or other error.");
        toast({
          title: "Reset Failed",
          description: response.data.message || "Failed to reset password. Invalid OTP or other error.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === "enterEmail") {
      await handleForgotPasswordSubmit();
    } else if (formStep === "resetPassword") {
      await handleResetPasswordSubmit();
    }
  };

  const renderEnterEmailStep = () => (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Forgot Your Password?
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you instructions to reset your
          password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {/* No success message display here, toast is enough, or it transitions */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading || !email}>
            {isLoading ? <Loader className="animate-spin" /> : "Send Reset Instructions"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </>
  );

  const renderResetPasswordStep = () => (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Reset Your Password
        </CardTitle>
        <CardDescription className="text-center">
          An OTP has been sent to <strong>{email}</strong>.
          Enter it below along with your new password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && passwordResetComplete && ( // Only show final success message
            <Alert variant="default">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {!passwordResetComplete && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isLoading}
                >
                  <InputOTPGroup className="w-full justify-center">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!passwordResetComplete && (
            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading ||
                otp.length !== 6 ||
                !newPassword ||
                newPassword !== confirmNewPassword
              }
            >
              {isLoading ? <Loader className="animate-spin" /> : "Reset Password"}
            </Button>
          )}
          {passwordResetComplete && (
            <Button onClick={() => navigate("/auth/login")} className="w-full">
              Go to Login
            </Button>
          )}
          <div className="text-center text-sm text-muted-foreground">
            {!passwordResetComplete && (
                 <button
                    type="button"
                    onClick={() => {
                        setFormStep("enterEmail");
                        // Optionally clear email if you want them to re-enter,
                        // or keep it pre-filled. For now, let's keep it.
                        // setEmail(""); 
                        setOtp("");
                        setNewPassword("");
                        setConfirmNewPassword("");
                    }}
                    className="text-primary hover:underline"
                >
                    Entered wrong email? Start Over
                </button>
            )}
            {passwordResetComplete && (
                 <span>Need help?{" "}
                 <Link to="/support" className="text-primary hover:underline">Contact Support</Link>
                 </span>
            )}
          </div>
        </CardFooter>
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          {formStep === "enterEmail" && renderEnterEmailStep()}
          {formStep === "resetPassword" && renderResetPasswordStep()}
        </Card>
      </div>
    </div>
  );
}