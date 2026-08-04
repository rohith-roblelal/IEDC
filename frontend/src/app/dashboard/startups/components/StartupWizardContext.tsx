'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StartupSchema, StartupFormData, Batch, Technology } from '@/lib/validations/startup';
import { startupsApi } from '@/lib/api/startups';
import { useToast } from '@/components/ui/ToastProvider';
import { useRouter } from 'next/navigation';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useConfirm } from '@/components/ui/ConfirmProvider';

interface StartupWizardContextType {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  form: UseFormReturn<StartupFormData>;
  isSubmitting: boolean;
  submitForm: (data: StartupFormData) => Promise<void>;
  batches: Batch[];
  technologies: Technology[];
  isEditMode: boolean;
  startupId?: string;
}

const StartupWizardContext = createContext<StartupWizardContextType | undefined>(undefined);

export function StartupWizardProvider({ 
  children,
  initialData,
  isEditMode = false,
  startupId,
  batches = [],
  technologies = []
}: { 
  children: ReactNode;
  initialData?: Partial<StartupFormData>;
  isEditMode?: boolean;
  startupId?: string;
  batches?: Batch[];
  technologies?: Technology[];
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const totalSteps = 5;
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  
  const DRAFT_KEY = 'startup_wizard_draft';

  const form = useForm<StartupFormData>({
    // @ts-expect-error - Zod resolver has a known typing issue with default values
    resolver: zodResolver(StartupSchema),
    defaultValues: initialData || {
      name: '',
      slug: '',
      short_description: '',
      full_description: '',
      stage: 'IDEA',
      status: 'ACTIVE',
      is_published: false,
      is_featured: false,
      verification_status: 'PENDING',
      display_order: 0,
      founders: [],
      awards: [],
      funding: [],
      press_links: [],
      technology_ids: [],
    },
    mode: 'onChange'
  });

  // Auto-save draft
  useEffect(() => {
    if (isEditMode) return; // Don't auto-save for edits
    if (!isDraftRestored) return; // Don't save before checking for draft

    const subscription = form.watch((value) => {
      // Debounce the save
      const timeoutId = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
      }, 1000);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form, isEditMode, isDraftRestored]);

  // Restore draft on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkDraft = async () => {
      if (!isEditMode && typeof window !== 'undefined') {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            if (parsed.name || parsed.short_description) {
              const shouldRestore = await confirm("We found an unsaved draft of a startup. Would you like to restore it?");
              if (isMounted) {
                if (shouldRestore) {
                  form.reset(parsed);
                  toast('Draft restored', 'success');
                } else {
                  localStorage.removeItem(DRAFT_KEY);
                }
              }
            }
          } catch (e) {
            localStorage.removeItem(DRAFT_KEY);
          }
        }
      }
      if (isMounted) {
        setIsDraftRestored(true);
      }
    };
    
    checkDraft();
    
    return () => {
      isMounted = false;
    };
  }, [isEditMode, form, toast, confirm]);

  useBeforeUnload(form.formState.isDirty);

  const nextStep = useCallback(async () => {
    // Validate current step fields before moving to next step
    let fieldsToValidate: any[] = [];
    
    switch(currentStep) {
      case 1:
        fieldsToValidate = ['name', 'slug', 'tagline', 'short_description', 'stage', 'industry', 'founded_year'];
        break;
      case 2:
        fieldsToValidate = ['founders', 'team_size'];
        break;
      case 3:
        fieldsToValidate = ['full_description', 'business_model', 'problem_statement', 'solution', 'target_market'];
        break;
      case 4:
        fieldsToValidate = ['awards', 'funding', 'press_links'];
        break;
      case 5:
        fieldsToValidate = ['is_published', 'is_featured', 'status', 'registration_status'];
        break;
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  }, [currentStep, form]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const setStep = useCallback(async (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    } else {
      // Allow jumping ahead only if form is valid (simplified here by triggering full validation)
      const isValid = await form.trigger();
      if (isValid) {
        setCurrentStep(step);
      }
    }
  }, [currentStep, form]);

  const submitForm = async (data: StartupFormData) => {
    try {
      setIsSubmitting(true);
      if (isEditMode && startupId) {
        await startupsApi.updateStartup(startupId, data);
        toast('Startup updated successfully', 'success');
      } else {
        await startupsApi.createStartup(data);
        toast('Startup created successfully', 'success');
      }
      router.push('/dashboard/startups');
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting startup:', error);
      toast(error.response?.data?.detail || 'Failed to save startup', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StartupWizardContext.Provider 
      value={{ 
        currentStep, 
        totalSteps, 
        nextStep, 
        prevStep, 
        setStep,
        form: form as any, 
        isSubmitting, 
        submitForm,
        batches,
        technologies,
        isEditMode,
        startupId
      }}
    >
      {children}
    </StartupWizardContext.Provider>
  );
}

export function useStartupWizard() {
  const context = useContext(StartupWizardContext);
  if (context === undefined) {
    throw new Error('useStartupWizard must be used within a StartupWizardProvider');
  }
  return context;
}
