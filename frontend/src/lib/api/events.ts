import { clientFetch } from "./client";

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
