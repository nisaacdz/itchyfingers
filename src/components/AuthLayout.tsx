import { Link, Outlet } from "react-router-dom";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

const AuthLayout = () => {
  const handleSuccess = (response: CredentialResponse) => {
    console.log("Google login success", response);
    // TODO: send token to backend for authentication
  };

  const handleError = () => {
    console.error("Google login failed");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="flex justify-center text-center">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00A9FF] to-[#FF6B6B] flex items-center justify-center">
            <span className="text-white font-bold text-sm">IF</span>
          </div>
        </Link>
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
