'use client';

import React from 'react';
import { useStartupWizard } from './StartupWizardContext';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Lightbulb, Target, Settings, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Step3Details() {
  const { form, prevStep, nextStep, technologies } = useStartupWizard();

  return (
    <div className="space-y-8 pb-10">
      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="border-b border-[#374151] pb-6 bg-[#111827]">
          <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
            <FileText className="w-6 h-6 text-[#6366F1]" />
            Full Description
          </CardTitle>
          <CardDescription className="text-[#9CA3AF] text-base mt-2">
            Provide an in-depth explanation of your startup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <FormField
            control={form.control}
            name="full_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Full Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell the complete story of your startup, your vision, and what you're building..." 
                    className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg min-h-[200px] resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-[#EF4444]" />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="border-b border-[#374151] pb-6 bg-[#111827]">
          <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
            <Lightbulb className="w-6 h-6 text-[#6366F1]" />
            Problem & Solution
          </CardTitle>
          <CardDescription className="text-[#9CA3AF] text-base mt-2">
            What are you solving and how?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <FormField
            control={form.control}
            name="problem_statement"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center mb-1">
                  <FormLabel className="text-[#F9FAFB] font-medium mb-0">Problem Statement</FormLabel>
                  <span className="text-xs text-[#6B7280]">
                    {field.value?.length || 0}/1000
                  </span>
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the pain point or problem you are addressing..." 
                    className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-24 resize-none" 
                    maxLength={1000}
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage className="text-[#EF4444]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="solution"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center mb-1">
                  <FormLabel className="text-[#F9FAFB] font-medium mb-0">Your Solution</FormLabel>
                  <span className="text-xs text-[#6B7280]">
                    {field.value?.length || 0}/1000
                  </span>
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="How does your startup solve this problem? What is the core value proposition?" 
                    className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-24 resize-none" 
                    maxLength={1000}
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage className="text-[#EF4444]" />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>


      


      <div className="flex justify-between pt-6 border-t border-[#374151] mt-8">
        <Button type="button" onClick={prevStep} className="bg-transparent border border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] hover:text-white rounded-lg px-6 h-11 text-sm font-medium transition-colors">
          &larr; Back
        </Button>
        <Button type="button" onClick={nextStep} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg px-6 h-11 text-sm font-medium transition-colors shadow-sm">
          Next Step &rarr;
        </Button>
      </div>
    </div>
  );
}
