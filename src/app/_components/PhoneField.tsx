"use client";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
}

// Shared country-code + number field, defaulting to Lebanon, used everywhere
// a phone number is collected (Cart checkout was the only one with this
// before — intake form, complete-profile, and the admin booking modal all
// used to be a plain text input with no country code at all).
export default function PhoneField({ value, onChange, required, error }: PhoneFieldProps) {
  return (
    <PhoneInput
      country={"lb"}
      value={value}
      onChange={onChange}
      inputProps={{ required }}
      dropdownClass="custom-dropdown"
      enableSearch
      containerClass="w-full"
      inputClass={`!w-full !py-2.5 !pl-12 !text-gray-900 dark:!text-white dark:!bg-gray-800 !border !rounded-lg !focus:ring-2 !focus:ring-primary ${
        error ? "!border-red-500" : "dark:!border-gray-700"
      }`}
      buttonClass="dark:!bg-gray-800 dark:!border-gray-700"
    />
  );
}
