import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getUserWithReferral, getReferralAgents, updateUserReferral } from '@/services/referralAgentService';

export const EditReferral = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const userData = await getUserWithReferral(userId);
      setUser(userData);
      setSelectedAgent(userData.referred_by || '');
    } catch (error) {
      toast({
        title: "Error loading user",
        description: error.message,
        variant: "destructive"
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const agentData = await getReferralAgents();
      setAgents(agentData);
    } catch (error) {
      toast({
        title: "Error loading agents",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await updateUserReferral(user.id, selectedAgent || null);
      toast({
        title: "Success",
        description: "Referral updated successfully",
      });
      fetchUser(); // Refresh data
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User Referral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <div className="flex gap-2">
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
            <Button onClick={fetchUser} disabled={loading}>
              {loading ? 'Loading...' : 'Lookup'}
            </Button>
          </div>
        </div>

        {user && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>User</Label>
                <p className="text-sm">{user.full_name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm">{user.users.email}</p>
              </div>
              <div>
                <Label>Current Referral</Label>
                <p className="text-sm">
                  {user.referred_by 
                    ? agents.find(a => a.id === user.referred_by)?.name || 'Unknown' 
                    : 'None'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Referral Agent</Label>
              <Select
                value={selectedAgent}
                onValueChange={setSelectedAgent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleUpdate}
              disabled={loading}
              className="mt-4"
            >
              {loading ? 'Updating...' : 'Update Referral'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};