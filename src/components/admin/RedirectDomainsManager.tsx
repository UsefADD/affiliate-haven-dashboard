
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Globe, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Temporary interface until Supabase types are generated
interface RedirectDomain {
  id: string;
  domain: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  status: string | null;
  notes: string | null;
}

export function RedirectDomainsManager() {
  const [domains, setDomains] = useState<RedirectDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [notes, setNotes] = useState("");
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const { data, error } = await supabase
        .from('redirect_domains')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDomains(data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast({
        title: "Error",
        description: "Failed to fetch redirect domains",
        variant: "destructive",
      });
    }
  };

  const addDomain = async () => {
    if (!newDomain) return;

    try {
      const { error } = await supabase
        .from('redirect_domains')
        .insert([
          {
            domain: newDomain.toLowerCase(),
            notes,
            is_active: true,
          }
        ] as any); // Temporary type assertion

      if (error) throw error;

      toast({
        title: "Success",
        description: "Domain added successfully",
      });

      setNewDomain("");
      setNotes("");
      setIsAddingDomain(false);
      fetchDomains();
    } catch (error) {
      console.error('Error adding domain:', error);
      toast({
        title: "Error",
        description: "Failed to add domain",
        variant: "destructive",
      });
    }
  };

  const toggleDomainStatus = async (domainId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('redirect_domains')
        .update({ is_active: !currentStatus } as any)
        .eq('id', domainId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Domain ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });

      fetchDomains();
    } catch (error) {
      console.error('Error toggling domain status:', error);
      toast({
        title: "Error",
        description: "Failed to update domain status",
        variant: "destructive",
      });
    }
  };

  const deleteDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('redirect_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Domain deleted successfully",
      });

      fetchDomains();
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Error",
        description: "Failed to delete domain",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Redirect Domains</CardTitle>
        <Dialog open={isAddingDomain} onOpenChange={setIsAddingDomain}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Redirect Domain</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Domain</Label>
                <Input
                  placeholder="Enter domain (e.g., redirect.example.com)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add notes about this domain..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button onClick={addDomain} className="w-full">
                Add Domain
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {domain.domain}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={domain.is_active}
                      onCheckedChange={() => toggleDomainStatus(domain.id, domain.is_active)}
                    />
                  </TableCell>
                  <TableCell>
                    {domain.last_used_at ? new Date(domain.last_used_at).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {domain.notes}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDomain(domain.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
