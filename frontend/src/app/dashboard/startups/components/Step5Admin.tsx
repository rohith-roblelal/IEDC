'use client';

import React from 'react';
import { useStartupWizard } from './StartupWizardContext';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Settings, CheckCircle2, Shield, Eye, Star, Save, Loader2 } from 'lucide-react';

export function Step5Admin() {
  const { form, prevStep, submitForm, isSubmitting } = useStartupWizard();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = form.getValues();
    submitForm(data);
  };

  const statusValue = form.watch('status');

  return (
    <div className="space-y-8 pb-10">
      
      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="border-b border-[#374151] pb-6 bg-[#111827]">
          <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
            <Eye className="w-6 h-6 text-[#6366F1]" />
            Visibility & Status
          </CardTitle>
          <CardDescription className="text-[#9CA3AF] text-base mt-2">
            Control how this startup appears on the public website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-[#374151] bg-[#1F2937] p-6 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-[#F9FAFB] font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                      Published
                    </FormLabel>
                    <FormDescription className="text-[#9CA3AF] text-sm mt-1">
                      Make this startup visible to the public.
                    </FormDescription>
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
            
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className={`flex flex-row items-center justify-between rounded-2xl border border-[#374151] p-6 shadow-sm ${statusValue === 'CLOSED' ? 'opacity-50 pointer-events-none bg-[#111827]' : 'bg-[#1F2937]'}`}>
                  <div className="space-y-0.5">
                    <FormLabel className="text-[#F9FAFB] font-medium flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#F59E0B]" />
                      Featured
                    </FormLabel>
                    <FormDescription className="text-[#9CA3AF] text-sm mt-1">
                      Highlight this startup on the homepage.
                      {statusValue === 'CLOSED' && (
                        <span className="block text-[#EF4444] mt-1">Closed startups cannot be featured.</span>
                      )}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={statusValue === 'CLOSED'}
                      className="data-[state=checked]:bg-[#22C55E]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Startup Status <span className="text-[#EF4444]">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] focus:ring-[#6366F1] rounded-lg h-11">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]">
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ALUMNI">Alumni</SelectItem>
                      <SelectItem value="INACTIVE">Inactive / Dormant</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[#EF4444]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registration_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Legal Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] focus:ring-[#6366F1] rounded-lg h-11">
                        <SelectValue placeholder="Not Specified" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]">
                      <SelectItem value="UNREGISTERED">Unregistered Idea</SelectItem>
                      <SelectItem value="REGISTERED">Registered with IEDC/KSUM</SelectItem>
                      <SelectItem value="INCORPORATED">Incorporated Company (Pvt Ltd, LLP)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[#EF4444]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Display Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-[#9CA3AF] text-sm mt-1">Lower numbers appear first.</FormDescription>
                  <FormMessage className="text-[#EF4444]" />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="border-b border-[#374151] pb-6 bg-[#111827]">
          <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
            <Shield className="w-6 h-6 text-[#EF4444]" />
            Internal Administration
          </CardTitle>
          <CardDescription className="text-[#9CA3AF] text-base mt-2">
            These details are only visible to administrators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <FormField
            control={form.control}
            name="verification_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#F9FAFB] font-medium">Verification Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] focus:ring-[#6366F1] rounded-lg h-11 max-w-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]">
                    <SelectItem value="PENDING">Pending Review</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-[#EF4444]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="internal_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#F9FAFB] font-medium">Internal Notes (Not public)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add notes for admins, mentors, or evaluators here..." 
                    className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-32 resize-none" 
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
        <Button type="button" onClick={prevStep} className="bg-transparent border border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] hover:text-white rounded-lg px-6 h-11 text-sm font-medium transition-colors" disabled={isSubmitting}>
          &larr; Back
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg px-8 h-11 font-medium transition-colors shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Startup
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
