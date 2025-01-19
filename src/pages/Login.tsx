import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAffiliate, setIsAffiliate] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your login logic here
    if (username && password) {
      // Simulate login success
      localStorage.setItem("isLoggedIn", "true");
      navigate("/");
    } else {
      toast({
        title: "Login Failed",
        description: "Please enter both username and password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600">SoftDigi</h1>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex rounded-md overflow-hidden border">
            <button
              type="button"
              onClick={() => setIsAffiliate(true)}
              className={`flex-1 py-2 text-center ${
                isAffiliate ? "bg-green-600 text-white" : "bg-white"
              }`}
            >
              Affiliate
            </button>
            <button
              type="button"
              onClick={() => setIsAffiliate(false)}
              className={`flex-1 py-2 text-center ${
                !isAffiliate ? "bg-green-600 text-white" : "bg-white"
              }`}
            >
              Advertiser
            </button>
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            Login
          </Button>

          <div className="text-center space-y-2">
            <a href="#" className="text-sm text-green-600 hover:underline block">
              Forgot Password?
            </a>
            <a href="#" className="text-sm text-green-600 hover:underline block">
              Affiliate Application
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
}