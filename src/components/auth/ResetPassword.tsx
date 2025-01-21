import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      console.log("Attempting to update password");
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully reset",
      });

      // Redirect to login page after successful password reset
      navigate("/login");
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600">Reset Password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
              placeholder="Enter your new password"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
              placeholder="Confirm your new password"
              required
              minLength={6}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>

          <div className="text-center">
            <a 
              href="/login" 
              className="text-sm text-green-600 hover:underline"
            >
              Back to Login
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
}