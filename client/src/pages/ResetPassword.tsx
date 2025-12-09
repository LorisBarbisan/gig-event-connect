import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Eye, EyeOff, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Extract token from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const resetToken = params.get("token");
    if (resetToken) {
      setToken(resetToken);
      setTokenValid(true); // We'll validate on submit
    } else {
      setTokenValid(false);
    }
  }, [searchString]);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("Must be at least 8 characters long");
    if (!/[A-Z]/.test(pwd)) errors.push("Must contain at least one uppercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("Must contain at least one number");
    return errors;
  };

  const passwordErrors = password ? validatePassword(password) : [];
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    if (!confirmPassword.trim()) {
      toast({
        title: "Error",
        description: "Please confirm your password.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordErrors.length > 0) {
      toast({
        title: "Password Requirements",
        description: passwordErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: password.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      });

      toast({
        title: "Success",
        description: data.message,
      });

      // Redirect to login with success message
      setTimeout(() => {
        setLocation("/auth");
      }, 1500);
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Invalid or missing token
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Invalid Reset Link</CardTitle>
              <CardDescription>
                This link is invalid or expired. Please request a new password reset.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={() => setLocation("/forgot-password")}
                  className="w-full mb-2"
                  data-testid="button-request-new-reset"
                >
                  Request New Reset Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/auth")}
                  className="w-full"
                  data-testid="button-back-to-signin"
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/auth")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Back to Sign In</span>
            </div>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>
              Enter your new password below. Make sure it's strong and secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    data-testid="input-new-password"
                    className={passwordErrors.length > 0 && password ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {password && (
                  <div className="space-y-1">
                    <div
                      className={`text-xs ${passwordErrors.length === 0 ? "text-success" : "text-muted-foreground"}`}
                    >
                      Password requirements:
                    </div>
                    <div className="space-y-1 text-xs">
                      <div
                        className={`flex items-center gap-1 ${password.length >= 8 ? "text-success" : "text-muted-foreground"}`}
                      >
                        <Check
                          className={`w-3 h-3 ${password.length >= 8 ? "text-success" : "text-muted-foreground"}`}
                        />
                        At least 8 characters
                      </div>
                      <div
                        className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-success" : "text-muted-foreground"}`}
                      >
                        <Check
                          className={`w-3 h-3 ${/[A-Z]/.test(password) ? "text-success" : "text-muted-foreground"}`}
                        />
                        One uppercase letter
                      </div>
                      <div
                        className={`flex items-center gap-1 ${/[0-9]/.test(password) ? "text-success" : "text-muted-foreground"}`}
                      >
                        <Check
                          className={`w-3 h-3 ${/[0-9]/.test(password) ? "text-success" : "text-muted-foreground"}`}
                        />
                        One number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    data-testid="input-confirm-password"
                    className={
                      confirmPassword && password && confirmPassword !== password
                        ? "border-destructive"
                        : confirmPassword && password && confirmPassword === password
                          ? "border-success"
                          : ""
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {confirmPassword && password && (
                  <div
                    className={`text-xs ${passwordsMatch ? "text-success" : "text-destructive"}`}
                  >
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-primary-hover"
                disabled={
                  loading ||
                  !password.trim() ||
                  !confirmPassword.trim() ||
                  password !== confirmPassword ||
                  passwordErrors.length > 0
                }
                data-testid="button-reset-password"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
