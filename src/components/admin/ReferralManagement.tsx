import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
// import { ReferralAssignment } from './ReferralAssignment';

import { 
  getReferralAgents,
  createReferralAgent,
  updateReferralAgent,
  deleteReferralAgent,
  getAgentsWithStats,
  ReferralAgent,
  getReferralStats,
  
} from '@/services/referralAgentService';
import { EditReferral } from './EditReferral';

export const ReferralManagement = () => {
  const { toast } = useToast();
  const [agentsWithStats, setAgentsWithStats] = useState<{agent: ReferralAgent, stats: {total: number, vendors: number, buyers: number}}[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editingAgent, setEditingAgent] = useState<ReferralAgent | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await getAgentsWithStats();
      setAgentsWithStats(data);
    } catch (error) {
      toast({
        title: "Error loading agents",
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

  const handleAddAgent = async () => {
    if (!newAgent.name) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const agent = await createReferralAgent(newAgent);
      const stats = await getReferralStats(agent.id);
      
      setAgentsWithStats([{ agent, stats }, ...agentsWithStats]);
      setNewAgent({ name: '', email: '', phone: '' });
      toast({
        title: "Success",
        description: "Agent added successfully",
      });
    } catch (error) {
      toast({
        title: "Error adding agent",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent || !editingAgent.name) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const updatedAgent = await updateReferralAgent(editingAgent.id, editingAgent);
      const stats = await getReferralStats(updatedAgent.id);
      
      setAgentsWithStats(agentsWithStats.map(item => 
        item.agent.id === updatedAgent.id 
          ? { agent: updatedAgent, stats } 
          : item
      ));
      setEditingAgent(null);
      toast({
        title: "Success",
        description: "Agent updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error updating agent",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    setLoading(true);
    try {
      await deleteReferralAgent(id);
      setAgentsWithStats(agentsWithStats.filter(item => item.agent.id !== id));
      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error deleting agent",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentStatus = async (agent: ReferralAgent) => {
    setLoading(true);
    try {
      const updatedAgent = await updateReferralAgent(agent.id, { is_active: !agent.is_active });
      setAgentsWithStats(agentsWithStats.map(item => 
        item.agent.id === updatedAgent.id 
          ? { ...item, agent: updatedAgent } 
          : item
      ));
      toast({
        title: "Success",
        description: `Agent ${updatedAgent.is_active ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error updating agent",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
              {/* <EditReferral />

         <ReferralAssignment /> */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Referral Agents</CardTitle>
            <Button 
              onClick={fetchAgents} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Name *</Label>
              <Input
                id="agent-name"
                value={editingAgent ? editingAgent.name : newAgent.name}
                onChange={(e) => editingAgent 
                  ? setEditingAgent({...editingAgent, name: e.target.value})
                  : setNewAgent({...newAgent, name: e.target.value})
                }
                placeholder="Agent name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-email">Email</Label>
              <Input
                id="agent-email"
                value={editingAgent ? editingAgent.email || '' : newAgent.email}
                onChange={(e) => editingAgent 
                  ? setEditingAgent({...editingAgent, email: e.target.value})
                  : setNewAgent({...newAgent, email: e.target.value})
                }
                placeholder="Agent email"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-phone">Phone</Label>
              <Input
                id="agent-phone"
                value={editingAgent ? editingAgent.phone || '' : newAgent.phone}
                onChange={(e) => editingAgent 
                  ? setEditingAgent({...editingAgent, phone: e.target.value})
                  : setNewAgent({...newAgent, phone: e.target.value})
                }
                placeholder="Agent phone"
              />
            </div>
            <div className="flex items-end space-x-2">
              {editingAgent ? (
                <>
                  <Button onClick={handleUpdateAgent} disabled={loading}>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Agent
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingAgent(null)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleAddAgent} disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent
                </Button>
              )}
            </div>
          </div>

           <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Total Referrals</TableHead>
                  <TableHead className="text-right">Vendors</TableHead>
                  <TableHead className="text-right">Buyers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentsWithStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {loading ? 'Loading agents...' : 'No referral agents found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  agentsWithStats.map(({ agent, stats }) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {agent.email && <div>{agent.email}</div>}
                          {agent.phone && <div>{agent.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{stats.total}</TableCell>
                      <TableCell className="text-right">{stats.vendors}</TableCell>
                      <TableCell className="text-right">{stats.buyers}</TableCell>
                      <TableCell>
                        <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingAgent(agent)}
                            disabled={loading}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAgentStatus(agent)}
                            disabled={loading}
                          >
                            {agent.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAgent(agent.id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};