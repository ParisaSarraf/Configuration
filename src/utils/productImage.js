import { BASEURL } from "@/Services/axiosInstance.js";

export const getProductImageUrl = (imagePath) => {
  if (typeof imagePath !== "string" || !imagePath.trim()) return null;
  const path = imagePath.trim();
  if (/^(https?:\/\/|blob:|data:image\/)/i.test(path)) return path;
  const mediaBase = (BASEURL || "").replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  return `${mediaBase}/${path.replace(/^\/+/, "")}`;
};
