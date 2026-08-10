'use client';

import React, { useEffect, useState } from 'react';
import { StartupWizard } from '../../components/StartupWizard';
import { startupsApi } from '@/lib/api/startups';
import { Batch, Technology, StartupFormData, StartupResponse } from '@/lib/validations/startup';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useParams, useRouter } from 'next/navigation';

export default function EditStartupPage() {
  const { toast } = useToast();
  const { id } = useParams();
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [initialData, setInitialData] = useState<Partial<StartupFormData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id || typeof id !== 'string') return;
      
      try {
        const [startupRes, batchesRes, techRes] = await Promise.all([
          startupsApi.getAdminStartup(id),
          startupsApi.getBatches(),
          startupsApi.getTechnologies()
        ]);
        
        const startup = startupRes.data;
        
        // Map startup response to form data
        const formData: Partial<StartupFormData> = {
          name: startup.name,
          slug: startup.slug,
          tagline: startup.tagline,
          logo_url: startup.logo_url,
          cover_image_url: startup.cover_image_url,
          short_description: startup.short_description,
          full_description: startup.full_description,
          stage: startup.stage,
          status: startup.status,
          registration_status: startup.registration_status,
          industry: startup.industry,
          founded_year: startup.founded_year,
          team_size: startup.team_size,
          email: startup.email,
          phone: startup.phone,
          website_url: startup.website_url,
          github_url: startup.github_url,
          linkedin_url: startup.linkedin_url,
          instagram_url: startup.instagram_url,
          demo_video_url: startup.demo_video_url,
          pitch_deck_url: startup.pitch_deck_url,
          youtube_demo_url: startup.youtube_demo_url,
          business_model: startup.business_model,
          problem_statement: startup.problem_statement,
          solution: startup.solution,
          target_market: startup.target_market,
          incubator: startup.incubator,
          clients: startup.clients,
          patents: startup.patents,
          is_published: startup.is_published,
          is_featured: startup.is_featured,
          verification_status: startup.verification_status,
          display_order: startup.display_order,
          internal_notes: (startup as Record<string, unknown>).internal_notes as string | undefined, // admin only field
          batch_id: startup.batch?.id || undefined,
          assigned_mentor_id: (startup as Record<string, unknown>).assigned_mentor_id as string | undefined,
          founders: startup.founders || [],
          awards: startup.awards || [],
          funding: startup.funding || [],
          press_links: startup.press_links || [],
          technology_ids: (startup.technologies || []).map((t: Technology) => t.id),
        };
        
        setInitialData(formData);
        setBatches(batchesRes.data);
        setTechnologies(techRes.data);
      } catch (error: unknown) {
        console.error("Failed to fetch startup data", error);
        toast("Failed to load startup for editing", "error");
        router.push('/dashboard/startups');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  if (loading || !initialData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Edit Startup</h1>
        <p className="text-zinc-400 mt-2">
          Update the profile for {initialData.name}.
        </p>
      </div>
      
      <StartupWizard 
        initialData={initialData}
        isEditMode={true}
        startupId={id as string}
        batches={batches} 
        technologies={technologies} 
      />
    </div>
  );
}
