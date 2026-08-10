import { clientFetch } from "./client";

export interface AnnouncementResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_published: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementCreate {
  title: string;
  slug: string;
  content: string;
  is_pinned?: boolean;
  is_published?: boolean;
  expires_at?: string | null;
}

export interface AnnouncementUpdate {
  title?: string;
  slug?: string;
  content?: string;
  is_pinned?: boolean;
  is_published?: boolean;
  expires_at?: string | null;
}

export const AnnouncementsAPI = {
  getAnnouncements: async (
    params: Record<string, string | boolean | number> = {},
    publicOnly: boolean = false,
    options: RequestInit & { next?: { revalidate?: number } } = {}
  ): Promise<AnnouncementResponse[] | { items: AnnouncementResponse[] }> => {
    const urlParams = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    ).toString();
    const endpoint = publicOnly
      ? `/api/v1/announcements/public${urlParams ? `?${urlParams}` : ''}`
      : `/api/v1/announcements${urlParams ? `?${urlParams}` : ''}`;
    return clientFetch(endpoint, options);
  },

  getAnnouncement: async (
    slug: string,
    publicOnly: boolean = false,
    options: RequestInit & { next?: { revalidate?: number } } = {}
  ): Promise<AnnouncementResponse> => {
    const endpoint = publicOnly
      ? `/api/v1/announcements/public/${slug}`
      : `/api/v1/announcements/${slug}`;
    return clientFetch(endpoint, options);
  },

  createAnnouncement: async (data: AnnouncementCreate): Promise<AnnouncementResponse> => {
    return clientFetch("/api/v1/announcements", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateAnnouncement: async (id: string, data: AnnouncementUpdate): Promise<AnnouncementResponse> => {
    return clientFetch(`/api/v1/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    return clientFetch(`/api/v1/announcements/${id}`, {
      method: "DELETE"
    });
  }
};
