import { clientFetch } from "./client";

export const galleryApi = {
  getImages: async (params: any = {}, options: any = {}) => {
    const urlParams = new URLSearchParams(params).toString();
    return clientFetch(`/api/v1/gallery${urlParams ? `?${urlParams}` : ''}`, {
      cache: "no-store",
      ...options
    });
  },
  getPublicImages: async (params: any = {}, options: any = {}) => {
    const urlParams = new URLSearchParams(params).toString();
    return clientFetch(`/api/v1/gallery/public${urlParams ? `?${urlParams}` : ''}`, options);
  },
  uploadImage: async (formData: FormData) => {
    return clientFetch("/api/v1/gallery/upload", {
      method: "POST",
      body: formData as any
    });
  },
  updateImage: async (id: string, data: any) => {
    return clientFetch(`/api/v1/gallery/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  },
  deleteImage: async (id: string) => {
    return clientFetch(`/api/v1/gallery/${id}`, {
      method: "DELETE"
    });
  }
};
