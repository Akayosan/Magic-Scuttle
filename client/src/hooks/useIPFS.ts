import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export interface IPFSUploadResponse {
  url: string;
  cid: string;
}

export interface NFTMetadata {
  name: string;
  description?: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  encryptedRarity?: string;
}

export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<IPFSUploadResponse | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ipfs/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setIsUploading(false);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
      setIsUploading(false);
      return null;
    }
  };

  const uploadMetadata = async (
    metadata: NFTMetadata
  ): Promise<IPFSUploadResponse | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await apiRequest("/api/ipfs/upload-metadata", {
        method: "POST",
        body: JSON.stringify(metadata),
      });

      setIsUploading(false);
      return response as IPFSUploadResponse;
    } catch (err: any) {
      setError(err.message || "Failed to upload metadata");
      setIsUploading(false);
      return null;
    }
  };

  const getIPFSUrl = (cid: string, gateway = "ipfs.io"): string => {
    if (cid.startsWith("ipfs://")) {
      return cid.replace("ipfs://", `https://${gateway}/ipfs/`);
    }
    if (cid.startsWith("http")) {
      return cid;
    }
    return `https://${gateway}/ipfs/${cid}`;
  };

  return {
    isUploading,
    error,
    uploadImage,
    uploadMetadata,
    getIPFSUrl,
  };
}
