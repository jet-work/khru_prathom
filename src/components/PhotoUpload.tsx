"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/constants";

export default function PhotoUpload({
  pathPrefix,
  onUploaded,
}: {
  pathPrefix: string;
  onUploaded: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${pathPrefix}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: true });

    setUploading(false);

    if (uploadError) {
      setError("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
      return;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    onUploaded(data.publicUrl);
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="text-sm"
      />
      {uploading && <p className="text-sm text-gray-500">กำลังอัปโหลด...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {preview && !uploading && !error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="ตัวอย่างรูป" className="h-32 w-32 object-cover rounded-md border" />
      )}
    </div>
  );
}
