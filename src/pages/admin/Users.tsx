import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Pencil, UserX, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserForm, UserFormData } from "@/components/users/UserForm";
import { AffiliateLeadsManager } from "@/components/leads/AffiliateLeadsManager";

interface Profile {
  id: string;
  role: "admin" | "affiliate";
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  email: string | null;
  subdomain: string | null;
  created_at: string;
}

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    checkCurrentUserRole();
  }, []);

  const checkCurrentUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session found");
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking user role:', error);
        return;
      }

      console.log('Current user role:', profile?.role);
      setCurrentUserRole(profile?.role);

      if (profile?.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You must be an admin to manage users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in checkCurrentUserRole:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("Fetched users:", profiles);
      setUsers(profiles || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      console.log('Deleting user with ID:', userId);

      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (error) {
        throw error;
      }

      console.log('Delete user response:', data);

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      console.log('Blocking user with ID:', userId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const { data, error } = await supabase.functions.invoke('block-user', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      console.log('Block user response:', data);

      toast({
        title: "Success",
        description: "User blocked successfully",
      });

      setBlockDialogOpen(false);
      setUserToBlock(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to block user",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (data: UserFormData) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only admins can create users",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Creating new user with data:", data);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await fetch(
        'https://ibjnokzepukzuzveseik.supabase.co/functions/v1/create-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });

      setIsAddDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (data: UserFormData) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only admins can edit users",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Updating user:", data);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await fetch(
        'https://ibjnokzepukzuzveseik.supabase.co/functions/v1/create-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ...data,
            mode: 'edit',
            userId: selectedUser?.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update user");
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Users Management</h1>
          {currentUserRole === 'admin' && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <UserForm
                  mode="create"
                  onSubmit={handleAddUser}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <UserForm
              mode="edit"
              initialData={selectedUser || undefined}
              onSubmit={handleEditUser}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user
                {userToDelete && ` ${userToDelete.first_name} ${userToDelete.last_name}`} 
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Block User Sign In</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to block 
                {userToBlock && ` ${userToBlock.first_name} ${userToBlock.last_name}`} 
                from signing in? They will not be able to access their account until you unblock them.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => userToBlock && handleBlockUser(userToBlock.id)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Block Sign In
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.company || 'N/A'}</TableCell>
                  <TableCell className="capitalize">{user.role || 'N/A'}</TableCell>
                  <TableCell>{user.subdomain || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {currentUserRole === 'admin' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-yellow-600"
                          onClick={() => {
                            setUserToBlock(user);
                            setBlockDialogOpen(true);
                          }}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AffiliateLeadsManager />
      </div>
    </DashboardLayout>
  );
}
