import { clientFetch } from "./client";

type FetchOptions = RequestInit & { next?: { revalidate?: number }; cache?: RequestCache };
type ApiParams = Record<string, string | boolean | number>;

export interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string | null;
  description?: string | null;
  category?: string | null;
  is_published?: boolean;
  event_id?: string | null;
  created_at?: string;
}

export interface GalleryImageUpdate {
  caption?: string;
  description?: string;
  category?: string;
  is_published?: boolean;
}

export interface GalleryPaginatedResponse {
  items: GalleryImage[];
  total?: number;
  skip?: number;
  limit?: number;
}

export const galleryApi = {
  getImages: async (params: ApiParams = {}, options: FetchOptions = {}): Promise<GalleryImage[] | GalleryPaginatedResponse> => {
    const urlParams = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    ).toString();
    return clientFetch(`/api/v1/gallery${urlParams ? `?${urlParams}` : ''}`, {
      cache: "no-store",
      ...options
    });
  },

  getPublicImages: async (params: ApiParams = {}, options: FetchOptions = {}): Promise<GalleryImage[] | GalleryPaginatedResponse> => {
    const urlParams = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    ).toString();
    return clientFetch(`/api/v1/gallery/public${urlParams ? `?${urlParams}` : ''}`, options);
  },

  uploadImage: async (formData: FormData): Promise<GalleryImage> => {
    return clientFetch("/api/v1/gallery/upload", {
      method: "POST",
      body: formData
    });
  },

  updateImage: async (id: string, data: GalleryImageUpdate): Promise<GalleryImage> => {
    return clientFetch(`/api/v1/gallery/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  },

  deleteImage: async (id: string): Promise<void> => {
    return clientFetch(`/api/v1/gallery/${id}`, {
      method: "DELETE"
    });
  }
};
