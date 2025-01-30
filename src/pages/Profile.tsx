import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log("Fetching profile data...");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }
        console.log("Fetched profile data:", data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (formData: any) => {
    try {
      setLoading(true);
      console.log("Updating profile with data:", formData);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          company: formData.company,
          subdomain: formData.subdomain,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log("Profile updated successfully");
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("Attempting password update...");

      if (newPassword !== confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords do not match",
          variant: "destructive",
        });
        return;
      }

      // First verify the current password
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No user email found');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        console.error('Current password verification failed:', signInError);
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        });
        return;
      }

      // If current password is correct, update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      console.log("Password updated successfully");
      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      company: formData.get('company'),
      subdomain: formData.get('subdomain'),
    };
    console.log("Submitting profile update with data:", data);
    updateProfile(data);
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        <Tabs defaultValue="contact">
          <TabsList className="mb-4">
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="company">Company Info</TabsTrigger>
            <TabsTrigger value="marketing">Marketing Info</TabsTrigger>
            <TabsTrigger value="login">Login Info</TabsTrigger>
          </TabsList>

          <TabsContent value="contact">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input 
                        id="first_name" 
                        name="first_name"
                        defaultValue={profile?.first_name || ''}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input 
                        id="last_name" 
                        name="last_name"
                        defaultValue={profile?.last_name || ''}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={profile?.email || ''}
                        disabled
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input 
                      id="company" 
                      name="company"
                      defaultValue={profile?.company || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <Input 
                      id="subdomain" 
                      name="subdomain"
                      defaultValue={profile?.subdomain || ''}
                      placeholder="e.g., yourcompany"
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input 
                      id="website_url" 
                      name="website_url"
                      defaultValue={profile?.website_url || ''}
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketing_strategy">How do you market your site?</Label>
                    <Textarea 
                      id="marketing_strategy" 
                      name="marketing_strategy"
                      defaultValue={profile?.marketing_strategy || ''}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={updatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input 
                      id="current_password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input 
                      id="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input 
                      id="confirm_password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
