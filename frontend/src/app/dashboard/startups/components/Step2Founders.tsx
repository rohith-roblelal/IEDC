'use client';

import React from 'react';
import { useStartupWizard } from './StartupWizardContext';
import { useFieldArray } from 'react-hook-form';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Trash2, GraduationCap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function Step2Founders() {
  const { form, prevStep, nextStep } = useStartupWizard();
  const confirm = useConfirm();
  
  const { fields, append, remove } = useFieldArray({
    name: 'founders',
    control: form.control,
  });

  return (
    <div className="space-y-8 pb-10">
      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#374151] pb-6 bg-[#111827] gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
              <Users className="w-6 h-6 text-[#6366F1]" />
              Founders & Team
            </CardTitle>
            <CardDescription className="text-[#9CA3AF] text-base mt-2">
              Add the key people behind the startup.
            </CardDescription>
          </div>
          <Button 
            type="button" 
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg px-6 h-11 text-sm font-medium transition-colors shadow-sm"
            onClick={() => append({ name: '', role: 'Founder', is_alumni: false })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Founder
          </Button>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          
          <div className="max-w-sm">
            <FormField
              control={form.control}
              name="team_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Total Team Size</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 5" 
                      className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription className="text-[#9CA3AF] text-sm mt-1">Total number of employees including founders.</FormDescription>
                  <FormMessage className="text-[#EF4444]" />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-8">
            {fields.map((field, index) => (
              <Card key={field.id} className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden relative">
                <CardContent className="p-6 md:p-8">
                  <div className="absolute top-4 right-4 md:top-6 md:right-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      title="Delete Founder"
                      className="text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg"
                      onClick={async () => {
                        if (await confirm('Are you sure you want to remove this founder?')) {
                          remove(index);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Remove</span>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 md:pt-4">
                    <FormField
                      control={form.control}
                      name={`founders.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#F9FAFB] font-medium">Full Name <span className="text-[#EF4444]">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} />
                          </FormControl>
                          <FormMessage className="text-[#EF4444]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`founders.${index}.role`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#F9FAFB] font-medium">Role</FormLabel>
                          <FormControl>
                            <Input placeholder="CEO, CTO..." className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage className="text-[#EF4444]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`founders.${index}.department`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#F9FAFB] font-medium">Department / Course</FormLabel>
                          <FormControl>
                            <Input placeholder="Computer Science..." className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage className="text-[#EF4444]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`founders.${index}.linkedin_url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#F9FAFB] font-medium">LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage className="text-[#EF4444]" />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-[#1F2937] p-5 rounded-xl border border-[#374151]">
                      <FormField
                        control={form.control}
                        name={`founders.${index}.is_alumni`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg gap-4 space-y-0 min-w-[200px]">
                            <div className="space-y-0.5">
                              <FormLabel className="text-[#F9FAFB] font-medium flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-[#6366F1]" />
                                Is Alumni?
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-[#22C55E]"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch(`founders.${index}.is_alumni`) && (
                        <FormField
                          control={form.control}
                          name={`founders.${index}.graduation_year`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="sr-only">Graduation Year</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Graduation Year (e.g. 2022)" 
                                  className="bg-[#111827] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11 sm:max-w-[240px] w-full" 
                                  {...field} 
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage className="text-[#EF4444]" />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {fields.length === 0 && (
              <div className="text-center py-16 bg-[#111827] border border-[#374151] border-dashed rounded-2xl">
                <Users className="w-12 h-12 text-[#374151] mx-auto mb-4" />
                <h3 className="text-lg text-[#F9FAFB] font-semibold mb-2">No founders added yet</h3>
                <p className="text-base text-[#9CA3AF] mb-6 max-w-sm mx-auto">Add the team members to showcase the people behind the idea.</p>
                <Button 
                  type="button" 
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg px-6 h-11 text-sm font-medium transition-colors shadow-sm"
                  onClick={() => append({ name: '', role: 'Founder', is_alumni: false })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Founder
                </Button>
              </div>
            )}
          </div>
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
