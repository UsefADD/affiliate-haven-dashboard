import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
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
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async (formData: any) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          company: formData.company,
        })
        .eq('id', user.id);

      if (error) throw error;

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

  const updatePassword = async (formData: any) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: formData.new_password
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    updateProfile({
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      company: formData.get('company'),
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newPassword = formData.get('new_password');
    const confirmPassword = formData.get('confirm_password');

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    updatePassword({ new_password: newPassword });
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Account Details</h1>
        
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input 
                        id="last_name" 
                        name="last_name"
                        defaultValue={profile?.last_name || ''}
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
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        defaultValue={profile?.phone || ''}
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
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      name="website"
                      defaultValue={profile?.website || ''}
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
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input id="website_url" name="website_url" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_category">Site Category</Label>
                    <Input id="site_category" name="site_category" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketing_strategy">How do you market your site?</Label>
                    <Textarea id="marketing_strategy" name="marketing_strategy" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comments">Comments</Label>
                    <Textarea id="comments" name="comments" />
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
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input 
                      id="new_password" 
                      name="new_password" 
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input 
                      id="confirm_password" 
                      name="confirm_password" 
                      type="password"
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
}
