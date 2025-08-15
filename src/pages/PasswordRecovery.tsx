import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import httpService from "../api/httpService";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader, Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";

type FormStep = "enterEmail" | "resetPassword";

export default function PasswordRecovery() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formStep, setFormStep] = useState<FormStep>("enterEmail");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordResetComplete, setPasswordResetComplete] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setError("");
    setSuccessMessage("");
  }, [formStep]);

  const handleForgotPasswordSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await httpService.post<null>("/auth/forgot-password", {
        email,
      });

      if (response.data.success) {
        toast({
          title: "Check your email",
          description:
            response.data.message || "An OTP has been sent to your email.",
        });
        setFormStep("resetPassword");
      } else {
        setError(
          response.data.message || "Failed to send password reset email."
        );
        toast({
          title: "Error",
          description:
            response.data.message || "Failed to send password reset email.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage =
        (err instanceof AxiosError && err?.response?.data?.message) ||
        "An error occurred. Please try again.";
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
      const response = await httpService.post<null>(`/auth/reset-password`, {
        email,
        password: newPassword,
        otp,
      });

      if (response.data.success) {
        setSuccessMessage(
          response.data.message || "Your password has been reset successfully."
        );
        setPasswordResetComplete(true);
        toast({
          title: "Password Reset Successful",
          description:
            response.data.message ||
            "You can now log in with your new password.",
        });
        setTimeout(() => navigate("/auth/login"), 3000);
      } else {
        setError(
          response.data.message ||
            "Failed to reset password. Invalid OTP or other error."
        );
        toast({
          title: "Reset Failed",
          description:
            response.data.message ||
            "Failed to reset password. Invalid OTP or other error.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage =
        (err instanceof AxiosError && err?.response?.data?.message) ||
        "An error occurred. Please try again.";
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
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          Forgot Your Password?
        </CardTitle>
        <CardDescription>
          Enter your email and we'll send you a recovery code.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !email}
          >
            {isLoading ? <Loader className="animate-spin" /> : "Send Code"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              to="/auth/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </>
  );

  const renderResetPasswordStep = () => (
    <>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          Reset Your Password
        </CardTitle>
        <CardDescription>
          A 6-digit code was sent to <strong>{email}</strong>. Enter it below to
          reset your password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && passwordResetComplete && (
            <Alert variant="default">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {!passwordResetComplete && (
            <>
              <div className="space-y-2 text-center">
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isLoading}
                >
                  <InputOTPGroup className="w-full justify-center">
                    <InputOTPSlot index={0} /> <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} /> <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} /> <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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
              {isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                "Reset Password"
              )}
            </Button>
          )}
          {passwordResetComplete && (
            <Button onClick={() => navigate("/auth/login")} className="w-full">
              Back to Login
            </Button>
          )}
          <div className="text-center text-sm text-muted-foreground">
            {!passwordResetComplete && (
              <button
                type="button"
                onClick={() => setFormStep("enterEmail")}
                className="font-semibold text-primary hover:underline"
              >
                Use a different email
              </button>
            )}
          </div>
        </CardFooter>
      </form>
    </>
  );

  return (
    <>
      {formStep === "enterEmail" && renderEnterEmailStep()}
      {formStep === "resetPassword" && renderResetPasswordStep()}
    </>
  );
}
