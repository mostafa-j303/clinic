"use client";
import React, { useState, useEffect } from "react";
import { useSettings } from "../_context/SettingsContext";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../_context/AdminAuthContext";
import Alert from "../_components/Alert";

export default function SettingsPage() {
  const { settings, loading, error, setSettings } = useSettings();
  const [formData, setFormData] = useState<any>(null);
const { isAdmin, isChecking } = useAdminAuth();
  const router = useRouter();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");


// Redirect after check completes
useEffect(() => {
  if (!isChecking && !isAdmin) {
    router.push("/"); 
  }
}, [isChecking, isAdmin, router]);


// Initialize formData without images
  useEffect(() => {
    if (settings) {
      const { images, ...rest } = settings; // remove images
      setFormData(rest);
    }
  }, [settings]);
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!formData) return null;

  const handleChange = (path: string, value: string) => {
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
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/update-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
         setAlertMessage("Failed to update settings");
      setShowAlert(true);
    } else {
         setAlertMessage("Settings updated successfully!");
      setShowAlert(true);
      // ✅ Merge existing images so they are not lost
    setSettings?.({
      ...settings,
      ...formData,
      images: settings?.images || {}, // preserve current images
    });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white">
         {showAlert && (
        <Alert value={alertMessage} onClose={() => setShowAlert(false)} />
      )}
      <h1 className="text-2xl font-bold mb-4 text-gray-600 mt-14">Update Settings</h1>

      {/* Web Title */}
      <div className="mb-3">
        <label className="block text-primary mb-1">Website Title</label>
        <input
          className="w-full p-2 border rounded text-gray-700"
          value={formData.webtitle}
          onChange={(e) => handleChange("webtitle", e.target.value)}
        />
      </div>

      {/* My Location */}
      <div className="mb-3">
        <label className="block text-primary mb-1">My Location</label>
        <input
          className="w-full p-2 border rounded text-gray-700"
          value={formData.myLocation}
          onChange={(e) => handleChange("myLocation", e.target.value)}
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-gray-700">
        <div>
          <label className="block mb-1 text-primary">Primary Color</label>
          <input
            type="color"
            value={formData.colors.primary}
            onChange={(e) => handleChange("colors.primary", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1  text-primary">Hover Primary Color</label>
          <input
            type="color"
            value={formData.colors.hovprimary}
            onChange={(e) => handleChange("colors.hovprimary", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1  text-primary">Secondary Color</label>
          <input
            type="color"
            value={formData.colors.secondary}
            onChange={(e) => handleChange("colors.secondary", e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1  text-primary">Hover Secondary Color</label>
          <input
            type="color"
            value={formData.colors.hovsecondary}
            onChange={(e) => handleChange("colors.hovsecondary", e.target.value)}
          />
        </div>
      </div>

      {/* Address */}
      <div className="mb-3">
        <label className="block mb-1  text-primary">Address</label>
        <input
          className="w-full p-2 border rounded text-gray-700"
          value={formData.addressdetail.address}
          onChange={(e) => handleChange("addressdetail.address", e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1  text-primary">Building</label>
        <input
          className="w-full p-2 border rounded text-gray-700"
          value={formData.addressdetail.building}
          onChange={(e) => handleChange("addressdetail.building", e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1  text-primary">Floor</label>
        <input
          className="w-full p-2 border rounded text-gray-700"
          value={formData.addressdetail.floor}
          onChange={(e) => handleChange("addressdetail.floor", e.target.value)}
        />
      </div>

      {/* Social Links */}
      {Object.entries(formData.social).map(([key, value]) => (
        <div key={key} className="mb-3">
          <label className="block mb-1 capitalize  text-primary">{key}</label>
          <input
            className="w-full p-2 border rounded text-gray-700"
            value={String(value)}
            onChange={(e) => handleChange(`social.${key}`, e.target.value)}
          />
        </div>
      ))}

      {/* Discount */}
      <div className="mb-3">
        <label className="block mb-1  text-primary">Discount</label>
        <input
          className="w-full p-2 border rounded text-gray-700"
          value={formData.discount}
          onChange={(e) => handleChange("discount", e.target.value)}
        />
      </div>

      {/* Minimum Order */}
      <div className="mb-3">
        <label className="block mb-1  text-primary">Minimum Order</label>
        <input
          className="w-full p-2 border rounded text-gray-700"
          value={formData.minOrder}
          onChange={(e) => handleChange("minOrder", e.target.value)}
        />
      </div>

      {/* Delivery */}
      <div className="mb-3 ">
        <label className="block mb-1 text-primary">Delivery </label>
        <input
          className="w-full p-2 border rounded text-gray-700"
          value={formData.delivery}
          onChange={(e) => handleChange("delivery", e.target.value)}
        />
      </div>

      <button className="px-4 py-2 bg-primary text-white rounded" onClick={handleSubmit}>
        Save Settings
      </button>
    </div>
  );
}
