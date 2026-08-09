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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building2, Calendar, FileText, Link as LinkIcon, Mail, Phone } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

export function Step1BasicInfo() {
  const { form, nextStep, batches } = useStartupWizard();

  const handleSlugGeneration = () => {
    const name = form.getValues('name');
    if (name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      form.setValue('slug', slug, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="border-b border-[#374151] pb-6 bg-[#111827]">
          <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
            <Building2 className="w-6 h-6 text-[#6366F1]" />
            Core Identity
          </CardTitle>
          <CardDescription className="text-[#9CA3AF] text-base mt-2">
            The fundamental details that define your startup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Startup Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between items-center text-[#F9FAFB] font-medium">
                    <span>URL Slug *</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 text-xs text-[#6366F1] hover:text-[#4F46E5] hover:bg-transparent"
                      onClick={handleSlugGeneration}
                    >
                      Auto-generate
                    </Button>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="acme-corp" className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11 font-mono text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#F9FAFB] font-medium">Startup Logo</FormLabel>
                <FormControl>
                  <div className="w-full">
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="startups/logos"
                    />
                  </div>
                </FormControl>
                <p className="text-[0.8rem] text-[#9CA3AF]">
                  Recommended size: 512×512 PNG or SVG.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Tagline (One-liner)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Revolutionizing the way we..." 
                      className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" 
                      {...field} 
                      value={field.value || ''}
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="short_description"
            render={({ field }) => (
              <FormItem>
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel className="text-[#F9FAFB] font-medium mb-0">Short Description *</FormLabel>
                    <span className="text-xs text-[#6B7280]">
                      {field.value?.length || 0}/200
                    </span>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="A brief overview of what your startup does..." 
                      className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg min-h-[120px] resize-none" 
                      maxLength={200}
                      {...field} 
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="border-b border-[#374151] pb-6 bg-[#111827]">
          <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
            <Briefcase className="w-6 h-6 text-[#6366F1]" />
            Classification
          </CardTitle>
          <CardDescription className="text-[#9CA3AF] text-base mt-2">
            Categorize your startup for better discoverability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Current Stage *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] focus:ring-[#6366F1] rounded-lg h-11">
                        <SelectValue placeholder="Select a stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]">
                      <SelectItem value="IDEA">Idea</SelectItem>
                      <SelectItem value="PROTOTYPE">Prototype</SelectItem>
                      <SelectItem value="MVP">MVP (Minimum Viable Product)</SelectItem>
                      <SelectItem value="EARLY_REVENUE">Early Revenue</SelectItem>
                      <SelectItem value="SCALING">Scaling</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Industry / Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="FinTech, EdTech, AI..." className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="founded_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Founded Year</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 2023" 
                      className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#111827] border-[#374151] rounded-2xl shadow-none overflow-hidden">
        <CardHeader className="border-b border-[#374151] pb-6 bg-[#111827]">
          <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-[#F9FAFB]">
            <LinkIcon className="w-6 h-6 text-[#6366F1]" />
            Contact & Links
          </CardTitle>
          <CardDescription className="text-[#9CA3AF] text-base mt-2">
            How people can reach and find your startup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@acme.com" className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 890" className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedin_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F9FAFB] font-medium">LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/company/..." className="bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280] focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1] rounded-lg h-11" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button type="button" onClick={nextStep} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg px-6 h-11 text-sm font-medium transition-colors">
          Next Step &rarr;
        </Button>
      </div>
    </div>
  );
}
