import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getUnassignedUsers, getReferralAgents, assignReferralToUser } from '@/services/referralAgentService';

export const ReferralAssignment = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [unassignedUsers, referralAgents] = await Promise.all([
        getUnassignedUsers(),
        getReferralAgents()
      ]);
      setUsers(unassignedUsers);
      setAgents(referralAgents);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (userId) => {
    if (!assignments[userId]) {
      toast({
        title: "Select an agent first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await assignReferralToUser(userId, assignments[userId]);
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "Success",
        description: "Referral assigned successfully",
      });
    } catch (error) {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Referrals</CardTitle>
        <CardDescription>Assign referral agents to users who signed up without one</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Signup Date</TableHead>
              <TableHead>Referral Agent</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.users.email}</TableCell>
                <TableCell>{user.user_roles[0]?.role || 'N/A'}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Select 
                    value={assignments[user.id] || ''}
                    onValueChange={(value) => setAssignments({...assignments, [user.id]: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    onClick={() => handleAssign(user.id)}
                    disabled={loading}
                  >
                    Assign
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};