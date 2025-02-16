import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Globe, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RedirectDomain, InsertRedirectDomain } from "@/lib/types/database";

export function RedirectDomainsManager() {
  const [domains, setDomains] = useState<RedirectDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [appendSubdomain, setAppendSubdomain] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
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

  const checkDomainHealth = async () => {
    try {
      setIsChecking(true);
      const { data, error } = await supabase.functions.invoke('check-domains');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Checked ${data.checked} domains, updated ${data.updated} records`,
      });
      
      fetchDomains();
    } catch (error) {
      console.error('Error checking domains:', error);
      toast({
        title: "Error",
        description: "Failed to check domain health",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
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

      const newDomainData: InsertRedirectDomain = {
        domain: newDomain,
        append_subdomain: appendSubdomain,
        is_active: true,
        status: 'active'
      };

      const { error } = await supabase
        .from('redirect_domains')
        .insert(newDomainData);

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

  const getHealthBadgeVariant = (score?: number | null) => {
    if (score === null || score === undefined) return "secondary";
    if (score > 80) return "success";
    if (score > 50) return "default";
    return "destructive";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Redirect Domains
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={checkDomainHealth}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Check Health
          </Button>
        </div>
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
                <TableHead>Health</TableHead>
                <TableHead>Last Check</TableHead>
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
                    <Badge variant={getHealthBadgeVariant(domain.cf_health_score)}>
                      {domain.cf_health_score ?? 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {domain.cf_last_check 
                      ? new Date(domain.cf_last_check).toLocaleString()
                      : 'Never'}
                  </TableCell>
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
