// components/admin/PriceModifiers.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PriceModifiers {
  vendor_percentage: number;
  vat_percentage: number;
  service_charge_percentage: number;
}

export const PriceModifiers = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modifiers, setModifiers] = useState<PriceModifiers>({
    vendor_percentage: 10,
    vat_percentage: 5,
    service_charge_percentage: 5,
  });

  useEffect(() => {
    fetchModifiers();
  }, []);

  const fetchModifiers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('price_modifiers')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setModifiers(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch modifiers',
        variant: 'destructive',
      });
      console.error('Error fetching modifiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Upsert the modifiers (update if exists, insert if not)
      const { error } = await supabase
        .from('price_modifiers')
        .upsert(modifiers, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Price modifiers updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update modifiers',
        variant: 'destructive',
      });
      console.error('Error saving modifiers:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setModifiers(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Price Modifiers</h2>
          <p className="text-gray-500">Configure platform pricing adjustments</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchModifiers}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vendor Percentage */}
            <div className="space-y-2">
              <Label htmlFor="vendor_percentage">Vendor Markup (%)</Label>
              <Input
                id="vendor_percentage"
                name="vendor_percentage"
                type="number"
                value={modifiers.vendor_percentage}
                onChange={handleChange}
                min="0"
                step="0.1"
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Applied directly to vendor quotes before showing to buyers
              </p>
            </div>

            {/* VAT Percentage */}
            <div className="space-y-2">
              <Label htmlFor="vat_percentage">VAT (%)</Label>
              <Input
                id="vat_percentage"
                name="vat_percentage"
                type="number"
                value={modifiers.vat_percentage}
                onChange={handleChange}
                min="0"
                step="0.1"
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Applied to subtotal (parts + delivery) on invoices
              </p>
            </div>

            {/* Service Charge Percentage */}
            <div className="space-y-2">
              <Label htmlFor="service_charge_percentage">Service Charge (%)</Label>
              <Input
                id="service_charge_percentage"
                name="service_charge_percentage"
                type="number"
                value={modifiers.service_charge_percentage}
                onChange={handleChange}
                min="0"
                step="0.1"
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Applied to subtotal (parts + delivery) on invoices
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Vendor Quote:</span>
              <span className="font-medium">100 AED</span>
            </div>
            <div className="flex justify-between">
              <span>After {modifiers.vendor_percentage}% Vendor Markup:</span>
              <span className="font-medium">
                {(100 * (1 + modifiers.vendor_percentage/100)).toFixed(2)} AED
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-medium">25 AED</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Subtotal:</span>
              <span className="font-medium">
                {(100 * (1 + modifiers.vendor_percentage/100) + 25).toFixed(2)} AED
              </span>
            </div>
            <div className="flex justify-between">
              <span>VAT ({modifiers.vat_percentage}%):</span>
              <span className="font-medium">
                {((100 * (1 + modifiers.vendor_percentage/100) + 25) * (modifiers.vat_percentage/100)).toFixed(2)} AED
              </span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge ({modifiers.service_charge_percentage}%):</span>
              <span className="font-medium">
                {((100 * (1 + modifiers.vendor_percentage/100) + 25) * (modifiers.service_charge_percentage/100)).toFixed(2)} AED
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-lg">
              <span>Total:</span>
              <span>
                {(
                  (100 * (1 + modifiers.vendor_percentage/100) + 25) * 
                  (1 + (modifiers.vat_percentage + modifiers.service_charge_percentage)/100)
                ).toFixed(2)} AED
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};