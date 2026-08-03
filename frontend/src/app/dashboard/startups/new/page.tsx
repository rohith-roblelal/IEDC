'use client';

import React, { useEffect, useState } from 'react';
import { StartupWizard } from '../components/StartupWizard';
import { startupsApi } from '@/lib/api/startups';
import { Batch, Technology } from '@/lib/validations/startup';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

export default function NewStartupPage() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [batchesRes, techRes] = await Promise.all([
          startupsApi.getBatches(),
          startupsApi.getTechnologies()
        ]);
        setBatches(batchesRes.data);
        setTechnologies(techRes.data);
      } catch (error) {
        console.error("Failed to fetch dictionary data", error);
        toast("Failed to load batches and technologies", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Add New Startup</h1>
        <p className="text-zinc-400 mt-2">
          Create a new startup profile in the IEDC database.
        </p>
      </div>
      
      <StartupWizard 
        batches={batches} 
        technologies={technologies} 
      />
    </div>
  );
}
