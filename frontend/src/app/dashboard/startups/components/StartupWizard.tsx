'use client';

import React from 'react';
import { Form } from '@/components/ui/form';
import { StartupWizardProvider, useStartupWizard } from './StartupWizardContext';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Founders } from './Step2Founders';
import { Step3Details } from './Step3Details';
import { Step4Achievements } from './Step4Achievements';
import { Step5Admin } from './Step5Admin';
import { StartupFormData, Batch, Technology } from '@/lib/validations/startup';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Founders & Team' },
  { id: 3, name: 'Details' },
  { id: 4, name: 'Achievements' },
  { id: 5, name: 'Admin Settings' }
];

function WizardStepper() {
  const { currentStep, setStep } = useStartupWizard();

  return (
    <div className="w-full">
      {/* Mobile Stepper */}
      <div className="md:hidden flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Step {currentStep} of {steps.length}
            </div>
            <div className="text-lg font-semibold text-[#F9FAFB] mt-1">
              {steps[currentStep - 1].name}
            </div>
          </div>
          <div className="text-sm font-medium text-[#6366F1]">
            {Math.round((currentStep / steps.length) * 100)}%
          </div>
        </div>
        <div className="h-2 w-full bg-[#1F2937] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#6366F1] rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${(currentStep / steps.length) * 100}%` }} 
          />
        </div>
      </div>

      {/* Desktop Stepper */}
      <nav aria-label="Progress" className="hidden md:block">
        <ol role="list" className="flex items-center w-full">
          {steps.map((step, stepIdx) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isUpcoming = step.id > currentStep;
            const isLast = stepIdx === steps.length - 1;

            return (
              <li key={step.name} className={`relative flex items-center ${isLast ? 'flex-none' : 'flex-1 pr-4'}`}>
                <div className="flex items-center w-full">
                  <div className="relative flex flex-col items-center group cursor-pointer" onClick={() => isCompleted && setStep(step.id)}>
                    {isCompleted ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22C55E] text-white ring-4 ring-[#111827] transition-transform group-hover:scale-110 z-10">
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6366F1] shadow-[0_0_12px_rgba(99,102,241,0.5)] ring-4 ring-[#111827] z-10">
                        <span className="text-[#F9FAFB] font-semibold text-sm">{step.id}</span>
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2937] border border-[#374151] ring-4 ring-[#111827] text-[#9CA3AF] transition-colors group-hover:border-[#6B7280] z-10">
                        <span className="text-sm font-medium">{step.id}</span>
                      </div>
                    )}
                    <span className={`absolute -bottom-7 text-xs font-medium whitespace-nowrap ${isCompleted ? 'text-[#A5B4FC]' : isCurrent ? 'text-[#F9FAFB] font-semibold' : 'text-[#6B7280]'}`}>
                      {step.name}
                    </span>
                  </div>
                  
                  {/* Connector Line */}
                  {!isLast && (
                    <div className="flex-1 ml-4 h-0.5 relative">
                      <div className="absolute inset-0 bg-[#374151]" />
                      <div 
                        className="absolute inset-0 bg-[#22C55E] transition-all duration-500 ease-in-out origin-left" 
                        style={{ transform: `scaleX(${isCompleted ? 1 : 0})` }} 
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

function WizardContent() {
  const { currentStep, form } = useStartupWizard();
  
  return (
    <Form {...form}>
      <form className="max-w-7xl w-full mx-auto pb-20 pt-8 space-y-10">
        <div className="sticky top-20 z-10 bg-[#111827] border border-[#374151] rounded-2xl shadow-sm px-8 py-8 md:pb-12 mb-8">
          <WizardStepper />
        </div>
        
        <div className="mt-8 relative overflow-hidden rounded-2xl min-h-[500px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full"
            >
              {currentStep === 1 && <Step1BasicInfo />}
              {currentStep === 2 && <Step2Founders />}
              {currentStep === 3 && <Step3Details />}
              {currentStep === 4 && <Step4Achievements />}
              {currentStep === 5 && <Step5Admin />}
            </motion.div>
          </AnimatePresence>
        </div>
      </form>
    </Form>
  );
}

export function StartupWizard({ 
  initialData, 
  isEditMode = false, 
  startupId,
  batches = [],
  technologies = []
}: { 
  initialData?: Partial<StartupFormData>;
  isEditMode?: boolean;
  startupId?: string;
  batches?: Batch[];
  technologies?: Technology[];
}) {
  return (
    <StartupWizardProvider 
      initialData={initialData} 
      isEditMode={isEditMode} 
      startupId={startupId}
      batches={batches}
      technologies={technologies}
    >
      <WizardContent />
    </StartupWizardProvider>
  );
}
