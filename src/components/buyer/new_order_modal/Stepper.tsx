import './Stepper.css';

interface StepperProps {
    currentStep: number;
}

const steps = [
    { number: 1, title: 'Vehicles', subtitle: 'Add your vehicles' },
    { number: 2, title: 'Parts', subtitle: 'Specify needed parts' },
    { number: 3, title: 'Review', subtitle: 'Confirm your order' },
];

export function Stepper({ currentStep }: StepperProps) {
    return (
        <div className="stepper-container">
            {steps.map((step, index) => (
                <div key={step.number} className={`step-item ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
                    <div className="step-circle">
                        {currentStep > step.number ? '✔' : step.number}
                    </div>
                    <div className="step-label">
                        <div className="step-title">{step.title}</div>
                        <div className="step-subtitle">{step.subtitle}</div>
                    </div>
                    {index < steps.length - 1 && <div className="step-connector"></div>}
                </div>
            ))}
        </div>
    );
} 