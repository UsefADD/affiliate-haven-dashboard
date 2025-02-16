
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Globe, Trash2 } from "lucide-react";

interface RedirectDomain {
  id: string;
  domain: string;
  is_active: boolean;
  created_at: string;
  append_subdomain: boolean;
  status: string;
  notes?: string;
}

export function RedirectDomainsManager() {
  const [domains, setDomains] = useState<RedirectDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [appendSubdomain, setAppendSubdomain] = useState(true);
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
      // Basic domain validation
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(newDomain)) {
        toast({
          title: "Invalid Domain",
          description: "Please enter a valid domain name",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('redirect_domains')
        .insert({
          domain: newDomain,
          append_subdomain: appendSubdomain,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Domain added successfully",
      });

      setNewDomain("");
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

  const toggleDomainStatus = async (domain: RedirectDomain) => {
    try {
      const { error } = await supabase
        .from('redirect_domains')
        .update({ is_active: !domain.is_active })
        .eq('id', domain.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Domain ${domain.is_active ? 'deactivated' : 'activated'} successfully`,
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

  const deleteDomain = async (id: string) => {
    try {
      const { error } = await supabase
        .from('redirect_domains')
        .delete()
        .eq('id', id);

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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Redirect Domains
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="domain">Add New Domain</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="append-subdomain"
                    checked={appendSubdomain}
                    onCheckedChange={setAppendSubdomain}
                  />
                  <Label htmlFor="append-subdomain">Append Subdomain</Label>
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={addDomain}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Append Subdomain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">{domain.domain}</TableCell>
                  <TableCell>
                    <Switch
                      checked={domain.append_subdomain}
                      disabled
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={domain.is_active}
                      onCheckedChange={() => toggleDomainStatus(domain)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(domain.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDomain(domain.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
