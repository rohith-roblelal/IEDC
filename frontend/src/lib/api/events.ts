import { clientFetch } from "./client";

type ApiParams = Record<string, string | boolean | number>;
type FetchOptions = RequestInit & { next?: { revalidate?: number }; cache?: RequestCache };

export interface EventResponse {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description: string;
  category: "WORKSHOP" | "HACKATHON" | "SEMINAR" | "COMPETITION" | "EXHIBITION" | "OTHER";
  venue?: string;
  start_datetime: string;
  end_datetime: string;
  is_published: boolean;
  banner_url?: string;
  registration_deadline?: string;
  max_participants?: number | null;
  registration_link?: string;
  google_form_enabled?: boolean;
  google_form_url?: string;
  field_mapping?: any;
  custom_fields?: any;
  created_at: string;
  updated_at: string;
  status: string;
  computed_status?: string;
  registrations_count?: number;
}

export interface EventCreate {
  title: string;
  slug: string;
  short_description?: string;
  description: string;
  category: "WORKSHOP" | "HACKATHON" | "SEMINAR" | "COMPETITION" | "EXHIBITION" | "OTHER";
  venue?: string;
  start_datetime: string;
  end_datetime: string;
  is_published?: boolean;
  banner_url?: string;
  registration_deadline?: string;
  max_participants?: number;
  registration_link?: string;
}

export interface EventUpdate {
  title?: string;
  slug?: string;
  short_description?: string;
  description?: string;
  category?: "WORKSHOP" | "HACKATHON" | "SEMINAR" | "COMPETITION" | "EXHIBITION" | "OTHER";
  venue?: string;
  start_datetime?: string;
  end_datetime?: string;
  is_published?: boolean;
  banner_url?: string;
  registration_deadline?: string;
  max_participants?: number;
  registration_link?: string;
}

export const EventsAPI = {
  getEvents: async (
    params: ApiParams = {},
    publicOnly: boolean = false,
    options: FetchOptions = {}
  ): Promise<EventResponse[]> => {
    const merged: ApiParams = publicOnly ? { ...params, is_published: true } : { ...params };
    const urlParams = new URLSearchParams(
      Object.fromEntries(Object.entries(merged).map(([k, v]) => [k, String(v)]))
    ).toString();
    const endpoint = `/api/v1/events${urlParams ? `?${urlParams}` : ""}`;
    return clientFetch(endpoint, options);
  },

  getEvent: async (
    slug: string,
    publicOnly: boolean = false,
    options: FetchOptions = {}
  ): Promise<EventResponse> => {
    const endpoint = `/api/v1/events/${slug}`;
    return clientFetch(endpoint, options);
  },

  createEvent: async (data: EventCreate): Promise<EventResponse> => {
    return clientFetch("/api/v1/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateEvent: async (id: string, data: EventUpdate): Promise<EventResponse> => {
    return clientFetch(`/api/v1/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteEvent: async (id: string): Promise<void> => {
    return clientFetch(`/api/v1/events/${id}`, {
      method: "DELETE",
    });
  },
};
