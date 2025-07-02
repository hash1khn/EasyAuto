import React from 'react';
import { Check, Car, Wrench, FileText } from 'lucide-react';

interface OrderModalHeaderProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Vehicles', icon: Car },
  { id: 2, name: 'Parts', icon: Wrench },
  { id: 3, name: 'Review', icon: FileText },
];

export const OrderModalHeader: React.FC<OrderModalHeaderProps> = ({ currentStep }) => {
  return (
    <div className="p-6 border-b">
        <h2 className="text-2xl font-bold mb-1">Order Car Parts</h2>
        <p className="text-sm text-gray-500 mb-6">Complete the steps below to create your order.</p>
        <div className="flex items-center justify-between">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                        <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center
                            ${currentStep > step.id ? 'bg-green-600 text-white' : ''}
                            ${currentStep === step.id ? 'bg-blue-600 text-white' : ''}
                            ${currentStep < step.id ? 'bg-gray-200 text-gray-500' : ''}
                        `}
                        >
                        {currentStep > step.id ? <Check size={20} /> : <step.icon size={20} />}
                        </div>
                        <p className={`mt-2 text-sm font-semibold ${currentStep >= step.id ? 'text-gray-800' : 'text-gray-500'}`}>{step.name}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-4 rounded
                            ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}
                        `}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    </div>
  );
}; 