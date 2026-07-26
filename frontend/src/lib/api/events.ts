import { clientFetch } from "./client";
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
  banner_image_url?: string;
  registration_deadline?: string;
  max_participants?: number;
  registration_link?: string;
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
  banner_image_url?: string;
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
  banner_image_url?: string;
  registration_deadline?: string;
  max_participants?: number;
  registration_link?: string;
}

export const EventsAPI = {
  getEvents: async (params: any = {}, publicOnly: boolean = false, options: any = {}) => {
    const urlParams = new URLSearchParams(params).toString();
    const endpoint = publicOnly 
      ? `/api/v1/events/public${urlParams ? `?${urlParams}` : ''}` 
      : `/api/v1/events${urlParams ? `?${urlParams}` : ''}`;
    return clientFetch(endpoint, options);
  },
  getEvent: async (slug: string, publicOnly: boolean = false, options: any = {}) => {
    const endpoint = publicOnly ? `/api/v1/events/public/${slug}` : `/api/v1/events/${slug}`;
    return clientFetch(endpoint, options);
  },
  createEvent: async (data: any) => {
    return clientFetch("/api/v1/events", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  updateEvent: async (id: string, data: any) => {
    return clientFetch(`/api/v1/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  },
  deleteEvent: async (id: string) => {
    return clientFetch(`/api/v1/events/${id}`, {
      method: "DELETE"
    });
  }
};
