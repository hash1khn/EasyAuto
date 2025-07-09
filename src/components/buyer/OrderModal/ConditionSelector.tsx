// components/dashboard/OrderModal/ConditionSelector.tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PartCondition } from './types';

interface ConditionSelectorProps {
  conditions: PartCondition[];
  onChange: (conditions: PartCondition[]) => void;
}

const conditionOptions = [
  { id: 'used', label: 'Used' },
  { id: 'new_oem', label: 'New OEM' },
  { id: 'new_aftermarket', label: 'New Aftermarket' },
  { id: 'any', label: 'Any Condition Accepted' }
];

export const ConditionSelector: React.FC<ConditionSelectorProps> = ({ conditions, onChange }) => {
  const handleConditionChange = (condition: PartCondition, checked: boolean) => {
    if (condition === 'any') {
      onChange(checked ? conditionOptions.map(opt => opt.id as PartCondition) : []);
    } else {
      const newConditions = checked
        ? [...conditions.filter(c => c !== 'any'), condition]
        : conditions.filter(c => c !== condition);
      onChange(newConditions);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Acceptable Conditions/Origins</Label>
      <div className="grid grid-cols-2 gap-2">
        {conditionOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={conditions.includes(option.id as PartCondition)}
              onCheckedChange={(checked) => 
                handleConditionChange(option.id as PartCondition, checked as boolean)
              }
            />
            <Label htmlFor={option.id}>{option.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};