import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AffiliateApplicationForm } from "@/components/affiliate/AffiliateApplicationForm";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { LoginForm } from "@/components/auth/LoginForm";
import { useSession } from "@/hooks/use-session";

export default function Login() {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (showForgotPassword) {
    return <ForgotPassword />;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600">SoftDigi</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>
          
          <LoginForm />

          <div className="text-center space-y-2 mt-6">
            <Button
              type="button"
              variant="link"
              className="text-sm text-green-600 hover:underline"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm text-green-600 hover:underline block mx-auto"
              onClick={() => setShowApplicationForm(true)}
            >
              Affiliate Application
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Affiliate Application</DialogTitle>
          </DialogHeader>
          <AffiliateApplicationForm
            onSuccess={() => setShowApplicationForm(false)}
            onCancel={() => setShowApplicationForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}