import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { ApiResponse, LoginSchema, UserSchema } from "../types/api";
import { useAuthStore } from "@/store/authStore";

const validateToken = async (token: string | null, ifValid: (user: UserSchema) => void, ifInvalid: () => void) => {
    if (!token) {
        toast({
            title: "Invalid Token",
            description: "No token provided. Please check the link or request a new password reset.",
            variant: "destructive",
        });
        return ifInvalid();
    }
    try {
        const response = await apiService.post<ApiResponse<LoginSchema>>(`/auth/verifications/use/${token}`);
        if (response.data.success) {
            const user = response.data.data.user;
            ifValid(user);
            toast({
                title: "Token Validated",
                description: "You can now reset your password.",
            });
        } else {
            ifInvalid();
            toast({
                title: "Invalid Token",
                description: response.data.message || "The provided token is invalid or has expired.",
                variant: "destructive",
            });
        }
    } catch (err: any) {
        ifInvalid();
        const errorMessage = err.response?.data?.message || "An error occurred while validating the token.";
        toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
        });
    }
};

export default function ResetPassword() {
    const { setUser, isAuthenticated } = useAuthStore();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isPageLoading, setIsPageLoading] = useState(true);

    // Basic token validation (you might want to do more)
    useEffect(() => {
        setIsPageLoading(true);
        validateToken(token, (user) => {
            setUser(user);
            setIsPageLoading(false);
        }, () => {
            console.error("Invalid or expired token");
            setError("Invalid or expired token. Please request a new password reset.");
            setIsPageLoading(false);
        });
    }, [token, navigate, setUser]);

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

        if (!token) {
            setError("Invalid or missing reset token."); // Should be caught by useEffect too
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiService.post<ApiResponse<null>>(
                `/auth/reset-password/${token}`,
                { password },
            );

            if (response.data.success) {
                setSuccessMessage(
                    response.data.message || "Your password has been reset successfully.",
                );
                toast({
                    title: "Password Reset Successful",
                    description: response.data.message || "You can now log in with your new password.",
                });
                // Redirect to login page after a short delay or on button click
                setTimeout(() => navigate("/auth/login"), 3000);
            } else {
                setError(response.data.message || "Failed to reset password.");
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
                            Enter your new password below.
                        </CardDescription>
                    </CardHeader>
                    {isPageLoading ? (
                        <CardContent className="space-y-4 text-center">
                            <span>Loading...</span>
                        </CardContent>
                    ) : !isAuthenticated ? (
                        <CardContent className="space-y-4 text-center">
                            <Alert variant="destructive">
                                <AlertDescription>{error || "You are not authorized to reset the password."}</AlertDescription>
                            </Alert>
                        </CardContent>
                    ) : (
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
                                            <Label htmlFor="password">New Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Enter your new password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={isLoading || !token}
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
                                                disabled={isLoading || !token}
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
                                        disabled={isLoading || !token || password !== confirmPassword}
                                    >
                                        {isLoading ? "Resetting..." : "Reset Password"}
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
                    )}
                </Card>
            </div>
        </div>
    );
}
