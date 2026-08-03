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
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Plus, Trash2, Banknote, Newspaper, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function Step4Achievements() {
  const { form, prevStep, nextStep, isEditMode, startupId } = useStartupWizard();
  const confirm = useConfirm();
  
  const awardsArray = useFieldArray({ name: 'awards', control: form.control });
  const fundingArray = useFieldArray({ name: 'funding', control: form.control });
  const pressLinksArray = useFieldArray({ name: 'press_links', control: form.control });

  // Note: Actual file uploads for Logo and Cover will be handled separately 
  // or at the end for new startups since we need the ID, 
  // but for forms we capture the URLs if they already have them.

  return (
    <div className="space-y-8 pb-10">
      
      {/* Achievements / Awards */}
      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#374151] pb-6 bg-[#111827] gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
              <Trophy className="w-6 h-6 text-[#6366F1]" />
              Awards & Recognition
            </CardTitle>
            <CardDescription className="text-[#9CA3AF] text-base mt-2">
              Highlight your key milestones and accolades.
            </CardDescription>
          </div>
          <Button 
            type="button" 
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg px-6 h-11 text-sm font-medium transition-colors shadow-sm"
            onClick={() => awardsArray.append({ title: '' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Award
          </Button>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          {awardsArray.fields.map((field, index) => (
            <Card key={field.id} className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden relative">
              <CardContent className="p-6 md:p-8">
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title="Delete Award"
                    className="text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg"
                    onClick={async () => {
                      if (await confirm('Are you sure you want to remove this award?')) {
                        awardsArray.remove(index);
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
                    name={`awards.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#F9FAFB] font-medium">Award Title <span className="text-[#EF4444]">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Best AI Startup 2024" className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} />
                        </FormControl>
                        <FormMessage className="text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`awards.${index}.awarded_by`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#F9FAFB] font-medium">Awarded By</FormLabel>
                        <FormControl>
                          <Input placeholder="TechCrunch..." className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`awards.${index}.date_received`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#F9FAFB] font-medium">Date Received</FormLabel>
                        <FormControl>
                          <Input type="date" className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`awards.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-[#F9FAFB] font-medium">Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Details about this award..." className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-24 resize-none" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {awardsArray.fields.length === 0 && (
            <div className="text-center py-16 bg-[#111827] border border-[#374151] border-dashed rounded-2xl">
              <Trophy className="w-12 h-12 text-[#374151] mx-auto mb-4" />
              <p className="text-base text-[#9CA3AF]">No awards added.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funding */}
      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#374151] pb-6 bg-[#111827] gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
              <Banknote className="w-6 h-6 text-[#6366F1]" />
              Funding History
            </CardTitle>
            <CardDescription className="text-[#9CA3AF] text-base mt-2">
              Record any funding or grants received.
            </CardDescription>
          </div>
          <Button 
            type="button" 
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg px-6 h-11 text-sm font-medium transition-colors shadow-sm"
            onClick={() => fundingArray.append({ funding_round: '' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Funding
          </Button>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          {fundingArray.fields.map((field, index) => (
            <Card key={field.id} className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden relative">
              <CardContent className="p-6 md:p-8">
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title="Delete Funding"
                    className="text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg"
                    onClick={async () => {
                      if (await confirm('Are you sure you want to remove this funding record?')) {
                        fundingArray.remove(index);
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
                    name={`funding.${index}.funding_round`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#F9FAFB] font-medium">Funding Round <span className="text-[#EF4444]">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Pre-seed, Seed, Series A..." className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} />
                        </FormControl>
                        <FormMessage className="text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`funding.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#F9FAFB] font-medium">Amount</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. $100k, ₹50L" className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`funding.${index}.investors`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#F9FAFB] font-medium">Investors</FormLabel>
                        <FormControl>
                          <Input placeholder="Y Combinator, Angel List..." className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`funding.${index}.date_received`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#F9FAFB] font-medium">Date Received</FormLabel>
                        <FormControl>
                          <Input type="date" className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {fundingArray.fields.length === 0 && (
            <div className="text-center py-16 bg-[#111827] border border-[#374151] border-dashed rounded-2xl">
              <Banknote className="w-12 h-12 text-[#374151] mx-auto mb-4" />
              <p className="text-base text-[#9CA3AF]">No funding history added.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Press Links */}
      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#374151] pb-6 bg-[#111827] gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
              <Newspaper className="w-6 h-6 text-[#6366F1]" />
              Press & Media
            </CardTitle>
            <CardDescription className="text-[#9CA3AF] text-base mt-2">
              Links to articles or media covering your startup.
            </CardDescription>
          </div>
          <Button 
            type="button" 
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg px-6 h-11 text-sm font-medium transition-colors shadow-sm"
            onClick={() => pressLinksArray.append({ title: '', url: '' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Article
          </Button>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          {pressLinksArray.fields.map((field, index) => (
            <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-[#1F2937] p-6 rounded-2xl border border-[#374151]">
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name={`press_links.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#F9FAFB] font-medium">Article Title <span className="text-[#EF4444]">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Acme raises seed round..." className="bg-[#111827] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} />
                        </FormControl>
                        <FormMessage className="text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`press_links.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#F9FAFB] font-medium">URL <span className="text-[#EF4444]">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." className="bg-[#111827] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Delete Link"
                className="text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg shrink-0 self-end md:mb-1"
                onClick={() => pressLinksArray.remove(index)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))}
          {pressLinksArray.fields.length === 0 && (
            <div className="text-center py-16 bg-[#111827] border border-[#374151] border-dashed rounded-2xl">
              <Newspaper className="w-12 h-12 text-[#374151] mx-auto mb-4" />
              <p className="text-base text-[#9CA3AF]">No press links added.</p>
            </div>
          )}
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
