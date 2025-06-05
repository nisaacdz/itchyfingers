import { useState } from "react";
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
import { Navbar } from "../components/Navbar";
import { toast } from "@/hooks/use-toast";
import apiService from "../api/apiService";
import { HttpResponse } from "../types/api";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader } from "lucide-react";

export default function ResetPassword() {
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        if (password !== confirmPassword) {
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
            const response = await apiService.post<HttpResponse<null>>(
                `/auth/reset-password`,
                { password, otp },
            );

            if (response.data.success) {
                setSuccessMessage(
                    response.data.message || "Your password has been reset successfully.",
                );
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

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            Reset Your Password
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter the 6-digit OTP sent to your email and your new password below.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            {successMessage && (
                                <Alert variant="default">
                                    <AlertDescription>{successMessage}</AlertDescription>
                                </Alert>
                            )}
                            {!successMessage && (
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
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            {!successMessage && (
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading || otp.length !== 6 || password !== confirmPassword || !password}
                                >
                                    {isLoading ? <Loader className="animate-spin" /> : "Reset Password"}
                                </Button>
                            )}
                            {successMessage && (
                                <Button onClick={() => navigate("/auth/login")} className="w-full">
                                    Go to Login
                                </Button>
                            )}
                            <div className="text-center text-sm text-muted-foreground">
                                Remembered your password or need help?{" "}
                                <Link to="/auth/login" className="text-primary hover:underline">
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
