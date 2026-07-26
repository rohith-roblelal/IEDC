import { clientFetch } from "./client";

export const AnnouncementsAPI = {
  getAnnouncements: async (params: any = {}, publicOnly: boolean = false, options: any = {}) => {
    const urlParams = new URLSearchParams(params).toString();
    const endpoint = publicOnly 
      ? `/api/v1/announcements/public${urlParams ? `?${urlParams}` : ''}` 
      : `/api/v1/announcements${urlParams ? `?${urlParams}` : ''}`;
    return clientFetch(endpoint, options);
  },
  getAnnouncement: async (slug: string, publicOnly: boolean = false, options: any = {}) => {
    const endpoint = publicOnly ? `/api/v1/announcements/public/${slug}` : `/api/v1/announcements/${slug}`;
    return clientFetch(endpoint, options);
  },
  createAnnouncement: async (data: any) => {
    return clientFetch("/api/v1/announcements", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  updateAnnouncement: async (id: string, data: any) => {
    return clientFetch(`/api/v1/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  },
  deleteAnnouncement: async (id: string) => {
    return clientFetch(`/api/v1/announcements/${id}`, {
      method: "DELETE"
    });
  }
};
