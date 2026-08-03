import { clientFetch } from './client';
import { StartupResponse, StartupFormData, Batch, Technology } from '../validations/startup';
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const startupsApi = {
  // Public endpoints
  getPublicStartups: (page = 1, pageSize = 20, featuredOnly = false) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize), featured_only: String(featuredOnly) });
    return clientFetch(`/api/v1/startups?${params.toString()}`).then(data => ({ data }));
  },
    
  getPublicStartup: (idOrSlug: string) =>
    clientFetch(`/api/v1/startups/${idOrSlug}`).then(data => ({ data })),
    
  // Dictionary Lookups
  getBatches: () =>
    clientFetch('/api/v1/startups/batches').then(data => ({ data })),
    
  getTechnologies: () =>
    clientFetch('/api/v1/startups/technologies').then(data => ({ data })),

  // Admin endpoints
  getAdminStartups: (page = 1, pageSize = 20) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    return clientFetch(`/api/v1/startups/dashboard/all?${params.toString()}`).then(data => ({ data }));
  },
    
  getAdminStartup: (idOrSlug: string) =>
    clientFetch(`/api/v1/startups/dashboard/${idOrSlug}`).then(data => ({ data })),
    
  createStartup: (data: StartupFormData) =>
    clientFetch('/api/v1/startups', {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(data => ({ data })),
    
  updateStartup: (id: string, data: Partial<StartupFormData>) =>
    clientFetch(`/api/v1/startups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(data => ({ data })),
    
  deleteStartup: (id: string) =>
    clientFetch(`/api/v1/startups/${id}`, {
      method: 'DELETE'
    }),
    
  uploadLogo: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return clientFetch(`/api/v1/startups/${id}/logo`, {
      method: 'POST',
      body: formData,
      headers: {} // Don't set Content-Type here, let browser set it with boundary
    }).then(data => ({ data }));
  },
  
  uploadGalleryImage: (id: string, file: File, altText?: string, caption?: string, isPublished = false) => {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('alt_text', altText);
    if (caption) formData.append('caption', caption);
    formData.append('is_published', String(isPublished));
    
    return clientFetch(`/api/v1/startups/${id}/gallery`, {
      method: 'POST',
      body: formData,
      headers: {} // Don't set Content-Type here, let browser set it with boundary
    }).then(data => ({ data }));
  },
  
  deleteGalleryImage: (imageId: string) =>
    clientFetch(`/api/v1/startups/gallery/${imageId}`, {
      method: 'DELETE'
    }),
};
