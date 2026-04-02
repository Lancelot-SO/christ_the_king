import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    const newImages = [...images];

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // 1. Get signature from our API
        const signResponse = await fetch("/api/upload/sign", { method: "POST" });
        if (!signResponse.ok) throw new Error("Failed to get upload signature");
        const signData = await signResponse.json();

        // 2. Upload directly to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signData.api_key);
        formData.append("timestamp", signData.timestamp.toString());
        formData.append("signature", signData.signature);
        formData.append("folder", "christ_king");

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`;
        
        const response = await fetch(cloudinaryUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Cloudinary error detail:", errorData);
          throw new Error("Cloudinary upload failed");
        }

        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {images.map((url, index) => (
          <div key={index} className={styles.previewCard}>
            <img src={url} alt={`Upload ${index + 1}`} className={styles.previewImage} />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className={styles.removeBtn}
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            className={`${styles.uploadPlaceholder} ${uploading ? styles.isUploading : ""}`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className={styles.spin} size={24} />
            ) : (
              <>
                <Upload size={24} />
                <span>{images.length === 0 ? "Upload Image" : "Add More"}</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        style={{ display: "none" }}
      />
      
      <p className={styles.hint}>
        Suggested size: 1000 x 1000px. Max {maxImages} images.
      </p>
    </div>
  );
}
