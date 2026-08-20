"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSettings } from "../_context/SettingsContext";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../_context/AdminAuthContext";
import Alert from "../_components/Alert";
import AdminShell from "../_components/AdminShell";
import SettingsImageUploader from "../_components/SettingsImageUploader";
import OpeningHoursEditor from "../_components/OpeningHoursEditor";
import PhoneField from "../_components/PhoneField";
import { MapPin, Link2, Tag, Truck, ShoppingCart, Globe, Palette, Building2, Wand2, Image as ImageIcon, Clock, Gift } from "lucide-react";
import { suggestPalette } from "../utils/colorHarmony";

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
        <Icon className="w-5 h-5 text-primary" />
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
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700 transition-all"
      />
    </div>
  )
);

FormInput.displayName = "FormInput";

// "social" keys that are actually phone numbers (not just social links) —
// these get the country-code PhoneField instead of a plain text input.
const SOCIAL_PHONE_KEYS = new Set(["number", "wishnb"]);
const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  tiktok: "Tiktok",
  insta: "Instagram",
  mail: "Mail",
  number: "Contact Phone Number",
  wishnb: "WhatsApp Number",
};

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
  }) => {
    // The hex text field is typed freely (so the admin can type/paste a code
    // mid-edit without every keystroke needing to already be a valid color),
    // but only commits upward (repainting the swatch + rest of the form)
    // once it actually matches a full "#rrggbb" hex value.
    const [hexDraft, setHexDraft] = useState(value);
    useEffect(() => setHexDraft(value), [value]);

    const commitIfValid = (next: string) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(next)) {
        onChange({ target: { value: next } } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value}
            onChange={onChange}
            className="w-14 h-14 rounded-lg cursor-pointer border border-gray-300 flex-shrink-0"
          />
          <input
            type="text"
            value={hexDraft}
            onChange={(e) => {
              setHexDraft(e.target.value);
              commitIfValid(e.target.value);
            }}
            onBlur={(e) => {
              // Snap back to the last valid color if left mid-edit/invalid.
              if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setHexDraft(value);
            }}
            placeholder="#000000"
            maxLength={7}
            className="w-28 px-2.5 py-1.5 border border-gray-300 rounded-lg font-mono text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
    );
  }
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

  const handleImageUploaded = useCallback(
    (imageKey: string, newUrl: string) => {
      setSettings?.((prev: any) => ({
        ...prev,
        images: { ...(prev?.images || {}), [imageKey]: newUrl },
      }));
      showAlertMessage(`Image updated successfully!`, "success");
      setShowAlert(true);
    },
    [setSettings]
  );

  const handleImageUploadError = useCallback((message: string) => {
    showAlertMessage(message, "error");
    setShowAlert(true);
  }, []);

  const handleSuggestPalette = useCallback(() => {
    setFormData((prev: any) => {
      const suggested = suggestPalette(prev.colors.primary);
      return {
        ...prev,
        colors: {
          ...prev.colors,
          secondary: suggested.secondary,
          hovprimary: suggested.hoverPrimary,
          hovsecondary: suggested.hoverSecondary,
          accent: suggested.accent,
        },
      };
    });
  }, []);

  // Live suggestion: as soon as the Primary Color changes, the rest of the
  // palette updates immediately to match. Still editable by hand afterward.
  const handlePrimaryColorChange = useCallback((newPrimary: string) => {
    setFormData((prev: any) => {
      const suggested = suggestPalette(newPrimary);
      return {
        ...prev,
        colors: {
          primary: newPrimary,
          secondary: suggested.secondary,
          hovprimary: suggested.hoverPrimary,
          hovsecondary: suggested.hoverSecondary,
          accent: suggested.accent,
        },
      };
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
      <AdminShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminShell>
    );
  if (error)
    return (
      <AdminShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </AdminShell>
    );
  if (!formData) return null;

  return (
    <AdminShell>
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
          <FormInput
            label="Site URL"
            value={formData.siteUrl || ""}
            onChange={(e) => handleChange("siteUrl", e.target.value)}
            placeholder="https://stay-well-clinic.vercel.app"
          />
          <p className="text-xs text-gray-500 -mt-2">
            Your live production domain — used to build the WhatsApp/admin-panel links in
            notification emails. Update this whenever your domain changes.
          </p>
        </FormSection>

        {/* Website Images */}
        <FormSection title="Website Images" icon={ImageIcon}>
          <p className="text-xs text-gray-500 -mt-2 mb-2">
            Choose a new image, review the preview, then click Apply to publish it. Each image
            updates on its own — no need to click "Save Settings" below.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingsImageUploader
              label="Logo"
              imageKey="logo"
              currentUrl={settings?.images?.logo}
              onUploaded={handleImageUploaded}
              onError={handleImageUploadError}
            />
            <SettingsImageUploader
              label="Hero Background"
              imageKey="background"
              currentUrl={settings?.images?.background}
              onUploaded={handleImageUploaded}
              onError={handleImageUploadError}
            />
            <SettingsImageUploader
              label="About Us Background"
              imageKey="background2"
              currentUrl={settings?.images?.background2}
              onUploaded={handleImageUploaded}
              onError={handleImageUploadError}
            />
            <SettingsImageUploader
              label="Hero Photo (Dietitian)"
              imageKey="missoPic"
              currentUrl={settings?.images?.missoPic}
              onUploaded={handleImageUploaded}
              onError={handleImageUploadError}
            />
            <SettingsImageUploader
              label="Whish Payment Logo"
              imageKey="whishlogo"
              currentUrl={settings?.images?.whishlogo}
              onUploaded={handleImageUploaded}
              onError={handleImageUploadError}
            />
          </div>
        </FormSection>

        {/* Color Theme */}
        <FormSection title="Color Theme" icon={Palette}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorInput
              label="Primary Color"
              value={formData.colors.primary}
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
            />
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSuggestPalette}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary font-medium text-sm hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                Re-suggest matching colors
              </button>
            </div>
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
            <ColorInput
              label="Accent Color"
              value={formData.colors.accent}
              onChange={(e) => handleChange("colors.accent", e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Changing the Primary Color instantly updates the rest of the palette to match.
            Use "Re-suggest matching colors" to reset them after fine-tuning by hand, or edit any field directly.
          </p>
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

        {/* Opening Hours */}
        <FormSection title="Appointment Opening Hours" icon={Clock}>
          <p className="text-xs text-gray-500 -mt-2 mb-2">
            Clients can only book a 30-minute appointment slot inside these hours. Unchecked days are treated as closed.
          </p>
          <OpeningHoursEditor
            onSaved={() => {
              showAlertMessage("Opening hours saved", "success");
              setShowAlert(true);
            }}
            onError={(msg) => {
              showAlertMessage(msg, "error");
              setShowAlert(true);
            }}
          />
        </FormSection>

        {/* Reward Program */}
        <FormSection title="Visit Reward Program" icon={Gift}>
          <p className="text-xs text-gray-500 -mt-2 mb-2">
            Automatically grants bonus visits once a client completes a set number of visits on a multi-visit package. Leave blank to disable.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Every X completed visits..."
              value={String(formData.rewardThreshold ?? "")}
              onChange={(e) => handleChange("rewardThreshold", e.target.value)}
              type="number"
            />
            <FormInput
              label="...grant Y free bonus visits"
              value={String(formData.rewardBonus ?? "")}
              onChange={(e) => handleChange("rewardBonus", e.target.value)}
              type="number"
            />
          </div>
        </FormSection>

        {/* Social Links */}
        <FormSection title="Social Links" icon={Link2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialEntries.map(([key, value]) =>
              SOCIAL_PHONE_KEYS.has(key) ? (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {SOCIAL_LABELS[key] || key}
                  </label>
                  <PhoneField
                    value={String(value || "").replace(/\D/g, "")}
                    onChange={(v) => handleChange(`social.${key}`, v)}
                  />
                </div>
              ) : (
                <FormInput
                  key={key}
                  label={SOCIAL_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                  value={String(value)}
                  onChange={(e) => handleChange(`social.${key}`, e.target.value)}
                />
              )
            )}
          </div>
        </FormSection>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 bg-primary hover:bg-hovprimary disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
    </AdminShell>
  );
}