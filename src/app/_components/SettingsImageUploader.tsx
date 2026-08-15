"use client";
import React, { useMemo, useRef, useState } from "react";
import { ImagePlus, Check, X, Loader2 } from "lucide-react";

interface SettingsImageUploaderProps {
  label: string;
  imageKey: string;
  currentUrl?: string;
  onUploaded: (imageKey: string, newUrl: string) => void;
  onError: (message: string) => void;
}

export default function SettingsImageUploader({
  label,
  imageKey,
  currentUrl,
  onUploaded,
  onError,
}: SettingsImageUploaderProps) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : currentUrl),
    [pendingFile, currentUrl]
  );

  const handleCancel = () => {
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleApply = async () => {
    if (!pendingFile) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("imageKey", imageKey);
      formData.append("file", pendingFile);

      const res = await fetch("/api/update-settings-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        onError(data.message || `Failed to update ${label}`);
      } else {
        onUploaded(imageKey, data.url);
        setPendingFile(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    } catch (err) {
      onError(`Failed to update ${label}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ImagePlus size={22} />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="inline-flex items-center gap-2 w-fit px-3 py-2 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary text-sm text-gray-500 hover:text-primary cursor-pointer transition">
            <ImagePlus size={16} />
            Choose new image
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
            />
          </label>

          {pendingFile && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 truncate max-w-[160px]">
                {pendingFile.name}
              </span>
              <button
                type="button"
                onClick={handleApply}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-hovprimary text-white text-xs font-semibold rounded-lg transition disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Apply
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
