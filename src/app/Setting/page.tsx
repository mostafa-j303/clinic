"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSettings } from "../_context/SettingsContext";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../_context/AdminAuthContext";
import Alert from "../_components/Alert";
import { MapPin, Link2, Tag, Truck, ShoppingCart, Globe, Palette, Building2 } from "lucide-react";

// Memoized FormSection Component
const FormSection = React.memo(
  ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <Icon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
);

FormSection.displayName = "FormSection";

// Memoized FormInput Component
const FormInput = React.memo(
  ({
    label,
    value,
    onChange,
    type = "text",
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 transition-all"
      />
    </div>
  )
);

FormInput.displayName = "FormInput";

// Memoized ColorInput Component
const ColorInput = React.memo(
  ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="w-14 h-14 rounded-lg cursor-pointer border border-gray-300"
        />
        <span className="font-mono text-sm text-gray-600">{value}</span>
      </div>
    </div>
  )
);

ColorInput.displayName = "ColorInput";

export default function SettingsPage() {
  const { settings, loading, error, setSettings } = useSettings();
  const [formData, setFormData] = useState<any>(null);
  const { isAdmin, isChecking } = useAdminAuth();
  const router = useRouter();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
 const [alertType, setAlertType] = useState<"success" | "error">("success");

  const showAlertMessage = (message: string, type: "success" | "error" = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isChecking && !isAdmin) {
      router.push("/");
    }
  }, [isChecking, isAdmin, router]);

  useEffect(() => {
    if (settings) {
      const { images, ...rest } = settings;
      setFormData(rest);
    }
  }, [settings]);

  // Memoized handleChange to prevent new function on every render
  const handleChange = useCallback((path: string, value: string) => {
    setFormData((prev: any) => {
      const keys = path.split(".");
      const updated = { ...prev };
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  }, []);

  // Memoized handleSubmit
  const handleSubmit = useCallback(async () => {
    setIsSaving(true);
    const res = await fetch("/api/update-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsSaving(false);
    if (!res.ok) {
      showAlertMessage("Failed to update settings", "error");
      setShowAlert(true);
    } else {
      showAlertMessage("Settings updated successfully!", "success");
      setShowAlert(true);
      setSettings?.({
        ...settings,
        ...formData,
        images: settings?.images || {},
      });
    }
  }, [formData, settings, setSettings]);

  // Memoized social links entries
  const socialEntries = useMemo(
    () => formData?.social ? Object.entries(formData.social) : [],
    [formData?.social]
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {showAlert && (
        <Alert value={alertMessage} type={alertType} onClose={() => setShowAlert(false)} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Customize your website and business information
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Website Identity */}
        <FormSection title="Website Identity" icon={Globe}>
          <FormInput
            label="Website Title"
            value={formData.webtitle}
            onChange={(e) => handleChange("webtitle", e.target.value)}
          />
          <FormInput
            label="My Location"
            value={formData.myLocation}
            onChange={(e) => handleChange("myLocation", e.target.value)}
          />
        </FormSection>

        {/* Color Theme */}
        <FormSection title="Color Theme" icon={Palette}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorInput
              label="Primary Color"
              value={formData.colors.primary}
              onChange={(e) => handleChange("colors.primary", e.target.value)}
            />
            <ColorInput
              label="Primary Hover Color"
              value={formData.colors.hovprimary}
              onChange={(e) => handleChange("colors.hovprimary", e.target.value)}
            />
            <ColorInput
              label="Secondary Color"
              value={formData.colors.secondary}
              onChange={(e) => handleChange("colors.secondary", e.target.value)}
            />
            <ColorInput
              label="Secondary Hover Color"
              value={formData.colors.hovsecondary}
              onChange={(e) =>
                handleChange("colors.hovsecondary", e.target.value)
              }
            />
          </div>
        </FormSection>

        {/* Location & Address */}
        <FormSection title="Location & Address" icon={MapPin}>
          <FormInput
            label="Street Address"
            value={formData.addressdetail.address}
            onChange={(e) => handleChange("addressdetail.address", e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Building"
              value={formData.addressdetail.building}
              onChange={(e) => handleChange("addressdetail.building", e.target.value)}
            />
            <FormInput
              label="Floor"
              value={formData.addressdetail.floor}
              onChange={(e) => handleChange("addressdetail.floor", e.target.value)}
            />
          </div>
        </FormSection>

        {/* Business Operations */}
        <FormSection title="Business Operations" icon={ShoppingCart}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Minimum Order Amount"
              value={formData.minOrder}
              onChange={(e) => handleChange("minOrder", e.target.value)}
            />
            <FormInput
              label="Delivery Fee"
              value={formData.delivery}
              onChange={(e) => handleChange("delivery", e.target.value)}
            />
            <FormInput
              label="Discount (%)"
              value={formData.discount}
              onChange={(e) => handleChange("discount", e.target.value)}
            />
          </div>
        </FormSection>

        {/* Social Links */}
        <FormSection title="Social Links" icon={Link2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialEntries.map(([key, value]) => (
              <FormInput
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={String(value)}
                onChange={(e) => handleChange(`social.${key}`, e.target.value)}
              />
            ))}
          </div>
        </FormSection>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <span>✓</span>
                Save Settings
              </>
            )}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}