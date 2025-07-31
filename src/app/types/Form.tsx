import React, { useState, useEffect, useCallback, useRef } from "react";
import Title from "../_components/Title";
import {
  formatDateForInput22,
  formatDateSubmit22,
  parseInputDate22,
} from "./functions/formatDateString";
import Alert from "../_components/Alert";
import { getDateDifferenceInDays } from "./functions/DateDifference";
import { Eye, Trash2 } from "lucide-react";

export interface Option {
  value?: string | undefined | boolean | number | null;
  label: string;
}
 export type Attachment = {
    DocName: string;       // Name of the file (e.g., "document.pdf")
    DocType: string;       // MIME type of the file (e.g., "application/pdf")
    DocFile: string;       // File content converted to a hexadecimal string
    Description: string;   // User-provided description of the file
};

interface TableColumn {
  header: string;
  type:
    | "text"
    | "number"
    | "select"
    | "checkbox"
    | "checkbox-group"
    | "radio-group"
    | "textarea"
    | "date"
    | "nestedtables";
  options?: string[];
}

export interface FormTableProps {
  id: number;
  title: string;
  columns: TableColumn[];
  data: { [key: string]: string | number | boolean }[];
  disabled: { [key: string]: boolean };
}

interface FormProps {
  rowModeBaseOnColumnIndex?: boolean;
  mode?: string;
  columns: string[];
  initialData: (string | boolean | number)[];
  onSubmit: (
    data: { [key: string]: any },
    nestedTables: { [key: string]: any }
  ) => void;
  onCancel?: () => void;
  inputTypes: { [column: string]: string };
  disabledInputs: { [column: string]: boolean };
  editRow: { id: number; data: (string | boolean | number)[] } | null;
  onAddNewClick: () => void;
  sections: { title?: string; fields: string[]; enabled?: boolean }[];
  options?: { [key: string]: Option[] };
  defaultValues?: { [column: string]: any };
  labels?: { [column: string]: string };
  placeholders?: { [column: string]: string };
  phrases?: string[];
  nestedTables?: FormTableProps[];
  defaultnestedtables?: FormTableProps[];
  updateNestedTable?: (tableId: number, data: any[]) => void; // Function to update nested table
  dateformat: string;
  requiredFields?: string[];
  FieldsrequiredBaseOnFromToDate?: string[];
  hiddenFieldBaseOnSelectOption?: any[];
  changeFieldTypeBasedOnSelect?: any[];
  FieldRequiredBaseOnSelectOption?: any[];
}

const Form: React.FC<FormProps> = ({
  rowModeBaseOnColumnIndex,
  mode,
  columns,
  initialData,
  onSubmit,
  onCancel,
  inputTypes,
  disabledInputs,
  editRow,
  onAddNewClick,
  sections,
  options = {},
  defaultValues = {},
  labels = {},
  placeholders = {},
  phrases = [],
  nestedTables = [],
  defaultnestedtables = [],
  updateNestedTable,
  dateformat,
  requiredFields,
  FieldsrequiredBaseOnFromToDate = [],
  hiddenFieldBaseOnSelectOption = [],
  changeFieldTypeBasedOnSelect = [],
  FieldRequiredBaseOnSelectOption = [],
}) => {

  // Initialize formData state with initialData or defaultValues
  const [formData, setFormData] = useState<{ [key: string]: any }>(() => {
    return columns.reduce((acc, column) => {
      acc[column] =
        (editRow
          ? initialData[columns.indexOf(column)]
          : defaultValues[column]) || "";
      return acc;
    }, {} as { [key: string]: any });
  });

  // State for nested table data
  const [nestedTableData, setNestedTableData] = useState<{
    [key: string]: any;
  }>(
    (nestedTables.length > 0 ? nestedTables : defaultnestedtables).reduce(
      (acc, table) => {
        acc[table.title] = table.data; // Ensure titles match what you reference
        return acc;
      },
      {} as { [key: string]: any }
    )
  );

  // Update formData with nested table data or initial data if editing
  useEffect(() => {
    const tables = nestedTables.length > 0 ? nestedTables : defaultnestedtables;
    setFormData((prevData) => ({
      ...prevData,
      ...tables.reduce((acc, table) => {
        acc[table.title] = table.data;
        return acc;
      }, {} as { [key: string]: any }),
      ...columns.reduce((acc, column) => {
        acc[column] =
          (editRow
            ? initialData[columns.indexOf(column)]
            : defaultValues[column]) || "";
        return acc;
      }, {} as { [key: string]: any }),
    }));
  }, [nestedTables, initialData, defaultValues, editRow]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate required fields
    requiredFields?.forEach((field) => {
      const value = formData[field];
      console.log("the required field ", field, "value ", formData[field]);

      // Check if the field is empty or not a string
      if (
        !value ||
        (typeof value === "string" && value.trim() === "") ||
        value == "" ||
        value == "[]"
      ) {
        newErrors[field] = `${labels[field] || field} is required.`;
      }
    });

    setErrors(newErrors);

    // If no errors, return true, else false
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = useCallback(
    (name: string, value: any) => {
      let parsedValue: Date | string | null;

      // Determine if the field is a date or datetime-local input
      if (name.endsWith("-date") || name.endsWith("-datetime-local")) {
        const inputType = name.endsWith("-datetime-local")
          ? "datetime-local"
          : "date";
        parsedValue = parseInputDate22(value, inputType);
      } else {
        parsedValue = value;
      }

      // Special handling for date-time-group
      if (name === "FromDate" || name === "ToDate") {
        const fromDate = formData["FromDate"];
        const toDate = formData["ToDate"];

        if (name === "FromDate" && toDate && parsedValue! > toDate) {
          setAlertMessage("From Date cannot be later than To Date.");
          setShowAlert(true);
          return;
        }

        if (name === "ToDate" && fromDate && parsedValue! < fromDate) {
          setAlertMessage("To Date cannot be earlier than From Date.");
          setShowAlert(true);
          return; // Exit function to prevent updating state
        }
      }

      // Ensure parsedValue is not null before updating state
      setFormData((prevData) => ({ ...prevData, [name]: parsedValue ?? "" }));
    },
    [formData]
  );
  // Handle changes in nested table inputs
  const handleTableChange = useCallback(
    (tableTitle: string, rowIndex: number, colHeader: string, value: any) => {
      console.log(
        `Updating nested table: ${tableTitle}, Row: ${rowIndex}, Column: ${colHeader} = ${value}`
      );
      setNestedTableData((prevData) => {
        const updatedData = (prevData[tableTitle] || []).map(
          (row: any, index: number) => {
            if (index === rowIndex) {
              return {
                ...row,
                [colHeader]: value,
              };
            }
            return row;
          }
        );
        const newData = { ...prevData, [tableTitle]: updatedData };

        if (updateNestedTable) {
          const table = nestedTables.find((t) => t.title === tableTitle);
          if (table) {
            updateNestedTable(table.id, updatedData);
          }
        }
        return newData;
      });
    },
    [nestedTables, updateNestedTable]
  );

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  // Handle form submission
  const handleSubmit = useCallback(() => {
    const formattedFormData = Object.entries(formData).reduce(
      (acc, [key, value]) => {
        const inputType = inputTypes[key];
        if (inputType === "date" || inputType === "date-time") {
          acc[key] = formatDateSubmit22(value);
        } else {
          acc[key] = value;
        }
        return acc;
      },
      {} as { [key: string]: any }
    );

    const nestedTableUpdates = Object.entries(nestedTableData).reduce(
      (acc, [title, data]) => {
        const table = nestedTables.find((t) => t.title === title);
        if (table) {
          acc[table.id] = data;
        } else {
          console.log(
            `Table with title "${title}" not found in nestedTables , you are mostlly adding new row `
          );
        }
        return acc;
      },
      {} as { [nestedTableId: number]: any[] }
    );
    // If nestedTableUpdates is empty, use nestedTableData instead
    const dataToSubmit =
      Object.keys(nestedTableUpdates).length > 0
        ? nestedTableUpdates
        : nestedTableData;

    if (validateForm()) {
      console.log("Submitting form data:", formattedFormData);
      console.log("Submitting nested table updates:", dataToSubmit);
      onSubmit(formattedFormData, dataToSubmit);
    }
  }, [formData, nestedTableData, onSubmit, nestedTables]);

  //attachments state start
  const [attachments, setAttachments] = useState<Attachment[]>(() => {
    // Initialize attachments state only once based on formData
    return formData["Attachments"] ? JSON.parse(formData["Attachments"]) : [];
  });

  const [tempAttachments, setTempAttachments] = useState<Attachment[]>(() => {
    // Initialize attachments state only once based on formData
    return formData["Attachments"] ? JSON.parse(formData["Attachments"]) : [];
  });
  const [deletedFiles, setDeletedFiles] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  //attachments state end

  const hiddenFields: string[] = hiddenFieldBaseOnSelectOption.reduce(
    (acc, field) => {
      if (
        formData[field.selectFieldName] &&
        field.options.includes(String(formData[field.selectFieldName]))
      ) {
        acc.push(field.hiddenField);
      }
      return acc;
    },
    [] as string[]
  );

  const getRequiredFieldsBasedOnSelect = (formData: Record<string, any>) => {
    return FieldRequiredBaseOnSelectOption.reduce((acc, field) => {
      if (
        formData[field.selectFieldName] &&
        field.options.includes(String(formData[field.selectFieldName]))
      ) {
        // Add each required field if it's not already in the list
        field.requiredFields.forEach((requiredField: string) => {
          if (
            !acc.includes(requiredField) &&
            !FieldsrequiredBaseOnFromToDate.includes(requiredField)
          ) {
            acc.push(requiredField);
          }
        });
      }
      return acc;
    }, [] as string[]);
  };

  const renderInput = (name: string, type: string, disabled: boolean) => {
    const label = labels[name] || name; // Use custom label if provided, otherwise use column name
    const placeholder = placeholders[name] || ""; // Use placeholder if provided
    const fieldOptions = options[name] || [];

    const error = errors[name]; // Check if the field has an error

    //const textareaRef = useRef<HTMLTextAreaElement>();
    // const adjustHeight = () => {
    //   if (textareaRef.current) {
    //     // Reset height to auto to correctly calculate the scrollHeight
    //     textareaRef.current.style.height = "auto";
    //     // Set the height to match the content's scroll height
    //     textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    //   }
    // };
    // useEffect(() => {
    //   adjustHeight();
    // }, [formData[name]]); // Adjust height when content changes

    // Step 1: Gather dynamic required fields from select options without adding to `requiredFields` yet
    const dynamicRequiredFields =
      getRequiredFieldsBasedOnSelect(formData) || [];
    const dateBasedRequiredFields: string[] = [];
    const fromDate = new Date(formData["FromDate"]);
    const toDate = new Date(formData["ToDate"]);
    const dateDifference = getDateDifferenceInDays(fromDate, toDate);

    if (formData["FromDate"] && formData["ToDate"]) {
      if (fromDate <= toDate) {
        if (FieldsrequiredBaseOnFromToDate) {
          for (const field of FieldsrequiredBaseOnFromToDate) {
            if (dateDifference > 1) {
              //if (!hiddenFields.includes(field)) {
              dateBasedRequiredFields.push(field); // Add fields if difference is greater than 1 day
              hiddenFields.includes(field)
                ? hiddenFields.splice(hiddenFields.indexOf(field))
                : hiddenFields;
              //}
            } else {
              // Remove fields if difference is less than or equal to 1 day
              if (requiredFields) {
                const index = requiredFields!.indexOf(field);
                if (index !== -1 && dateDifference <= 1) {
                  requiredFields!.splice(index, 1);
                }
              }
            }
          }
        }
      }
    }

    FieldRequiredBaseOnSelectOption.some((fieldOption) => {
      formData[fieldOption.selectFieldName] &&
      fieldOption.options.includes(
        String(formData[fieldOption.selectFieldName])
      )
        ? requiredFields?.push(fieldOption.requiredFields)
        : dateDifference <= 1 &&
          requiredFields?.includes(fieldOption.requiredFields)
        ? requiredFields.splice(
            requiredFields.indexOf(fieldOption.requiredFields),
            1
          )
        : requiredFields;
    });

    // Step 2: Add unique dynamic required fields to `requiredFields`
    [...dynamicRequiredFields, ...dateBasedRequiredFields].forEach((field) => {
      if (requiredFields && !requiredFields.includes(field)) {
        requiredFields.push(field);
      }
    });
    // Step 3: Remove any fields from `requiredFields` that are in `hiddenFields`
    requiredFields = requiredFields?.filter(
      (field) => !hiddenFields.includes(field)
    );

    if (hiddenFields.includes(name)) {
      return null; // Hide the field
    }

    changeFieldTypeBasedOnSelect.map((field) => {
      if (
        name === field.fieldName &&
        formData[field.selectFieldName] == field.option
      ) {
        if (type === "number" && field.newType === "des-number") {
          let fieldValue = parseFloat(formData[field.fieldName]);
          const decimalPart = fieldValue - Math.floor(fieldValue);
          if (decimalPart !== 0.5) {
            fieldValue = Math.round(fieldValue);
          }
          formData[field.fieldName] = fieldValue;
        }
        type = field.newType;
      }
    });

    switch (type) {
      case "text":
      case "number":
      case "date":
        return (
          <div
            key={name}
            className={`sm:col-span-4 md:col-span-2 lg:col-span-2 ${
              name === "" ? "invisible" : ""
            }`}
          >
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
              className="disabled:cursor-not-allowed mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              type={type}
              name={name}
              value={
                type === "date"
                  ? formatDateForInput22(new Date(formData[name] || ""), "date")
                  : formData[name] || ""
              }
              placeholder={placeholder}
              readOnly={disabled}
              onChange={(e) => handleChange(name, e.target.value)}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      case "date-time":
        const dateTimeValue = formatDateForInput22(
          new Date(formData[name] || ""),
          "datetime-local"
        );
        return (
          <div
            key={name}
            className={`sm:col-span-4 md:col-span-2 lg:col-span-2 ${
              name === "" ? "invisible" : ""
            }`}
          >
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
              className="disabled:cursor-not-allowed mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              type="datetime-local"
              name={name}
              value={dateTimeValue}
              placeholder={placeholder}
              readOnly={disabled}
              onChange={(e) => handleChange(name, e.target.value)}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      case "date-time-group":
        return (
          <div key={name} className="sm:col-span-4 md:col-span-2 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="FromDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  From Date
                </label>
                <input
                  id="FromDate"
                  className="disabled:cursor-not-allowed mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  type="datetime-local"
                  name="FromDate"
                  value={formatDateForInput22(
                    new Date(formData["FromDate"] || ""),
                    "datetime-local"
                  )}
                  onChange={(e) => handleChange("FromDate", e.target.value)}
                  readOnly={disabled}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
              <div>
                <label
                  htmlFor="ToDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  To Date
                </label>
                <input
                  id="ToDate"
                  className="disabled:cursor-not-allowed mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  type="datetime-local"
                  name="ToDate"
                  value={formatDateForInput22(
                    new Date(formData["ToDate"] || ""),
                    "datetime-local"
                  )}
                  onChange={(e) => handleChange("ToDate", e.target.value)}
                  readOnly={disabled}
                />
              </div>
            </div>
          </div>
        );
      case "des-number":
        return (
          <div
            key={name}
            className={`sm:col-span-4 md:col-span-2 lg:col-span-2 ${
              name === "" ? "invisible" : ""
            }`}
          >
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              id={name}
              className="disabled:cursor-not-allowed mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              type="number"
              name={name}
              min="0.5"
              step="0.5"
              value={formData[name] || 0.5}
              placeholder={placeholder}
              readOnly={disabled}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (parseFloat(value) % 0.5 === 0 && parseFloat(value) >= 0.5)
                ) {
                  handleChange(name, value);
                }
              }}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      case "file":
        return renderFileField(name, label, disabled, error);
      case "select":
        return (
          <div
            key={name}
            className="sm:col-span-4 md:col-span-2 lg:col-span-2 "
          >
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <select
              className="disabled:cursor-not-allowed disabled:bg-gray-100 mt-2 h-11 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              name={name}
              value={formData[name] || ""}
              disabled={disabled}
              onChange={(e) => {
                console.log(e.target.value);
                handleChange(name, e.target.value);
              }}
            >
              {fieldOptions.map((option, index) => (
                <option key={index} value={option.value?.toString()}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      case "checkbox":
        return (
          <div
            key={name}
            className="flex justify-start sm:col-span-4 md:col-span-2 lg:col-span-1"
          >
            <label className="flex gap-3  justify-start items-center text-base p-1 rounded-md font-medium text-gray-700">
              <input
                className="disabled:cursor-not-allowed size-6 min-w-6 min-h-6  rounded-md "
                type="checkbox"
                name={name}
                checked={formData[name] || false}
                disabled={disabled}
                onChange={(e) => handleChange(name, e.target.checked)}
              />
              {label}
            </label>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      case "switch":
        return (
          <div
            key={name}
            className={`${
              disabled ? "cursor-not-allowed bg-gray-100" : "bg-white"
            } flex justify-start items-center gap-2 sm:col-span-4 md:col-span-2 lg:col-span-1 h-fit w-fit p-3 rounded-2xl mt-4`}
          >
            <span className=" text-base font-medium text-gray-700">
              {label}
            </span>
            <label
              htmlFor={name}
              className={`${
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              } relative inline-block h-8 w-14 rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-primary `}
            >
              <input
                type="checkbox"
                id={name}
                name={name}
                className=" peer sr-only [&:checked_+_span_svg[data-checked-icon]]:block [&:checked_+_span_svg[data-unchecked-icon]]:hidden "
                checked={formData[name] || false}
                disabled={disabled}
                onChange={(e) => handleChange(name, e.target.checked)}
              />
              <span
                className={`${
                  disabled ? "cursor-not-allowed" : ""
                } absolute inset-y-0 start-0 z-10 m-1 inline-flex size-6 items-center justify-center rounded-full bg-white disabled:bg-gray-100 text-gray-400 transition-all peer-checked:start-6 peer-checked:text-primary`}
              >
                <svg
                  data-unchecked-icon
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>

                <svg
                  data-checked-icon
                  xmlns="http://www.w3.org/2000/svg"
                  className="hidden size-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </label>
          </div>
        );
      case "checkbox-group":
        return (
          <div key={name} className="flex col-span-4">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            {fieldOptions.map((option) => (
              <label
                key={option.value?.toString()}
                className="block text-sm font-medium text-gray-700"
              >
                <input
                  className="disabled:cursor-not-allowed"
                  type="checkbox"
                  name={name}
                  value={option.value?.toString()}
                  checked={formData[name]?.includes(option.value) || false}
                  disabled={disabled}
                  onChange={(e) => {
                    const valueArray = formData[name] || [];
                    if (e.target.checked) {
                      handleChange(name, [...valueArray, option.value]);
                    } else {
                      handleChange(
                        name,
                        valueArray.filter((val: any) => val !== option.value)
                      );
                    }
                  }}
                />
                {option.label}
              </label>
            ))}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      case "textarea":
        return (
          <div key={name} className="col-span-4">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <textarea
              //ref={textareaRef}
              className="disabled:cursor-not-allowed mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              name={name}
              value={formData[name] || ""}
              placeholder={placeholder}
              readOnly={disabled}
              onChange={(e) => handleChange(name, e.target.value)}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      case "radio-group":
        return (
          <div
            key={name}
            className={`${
              disabled ? "cursor-not-allowed bg-gray-100" : "bg-white"
            } col-span-2 sm:col-span-4 p-2 w-fit border-2 border-gray-200 rounded-md`}
          >
            <label>{label}</label>
            <div className="flex ">
              {fieldOptions.map((option, index) => (
                <label
                  key={index}
                  className="mt-2 pr-2 flex w-fit gap-1 items-center justify-center"
                >
                  <input
                    className="disabled:cursor-not-allowed border-2 h-4 w-4  rounded-full   p-2 text-sm font-medium text-gray-700"
                    type="radio"
                    name={name}
                    value={option.value?.toString()}
                    checked={formData[name] === option.value}
                    disabled={disabled}
                    onChange={() => handleChange(name, option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      case "phrase-list":
        return (
          <div key={name} className="col-span-4">
            <div className="mt-1 grid grid-cols-4 rounded-lg bg-white border-2 border-gray-200">
              {phrases?.map((phrase, index) => {
                return (
                  <div
                    key={index}
                    className=" flex items-center sm:col-span-4 md:col-span-2 last-of-type:border-r-2 border-r-gray-200 lg:col-span-1 py-2 pr-1 pl-2 border-l-2 border-gray-400 sm:border-b-2 md:border-b-2 border-b-gray-300"
                  >
                    <div className="mr-2 font-semibold bg-gray-200 text-gray-700 rounded-full flex justify-center items-center p-2 ">
                      {index + 1}
                    </div>
                    <div className="pl-1">{phrase}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "nestedtables":
        const tablesToRender =
          nestedTables.length > 0 ? nestedTables : defaultnestedtables;

        return (
          <div key={name} className="col-span-4  gap-y-4 ">
            {tablesToRender.flat().map((table: FormTableProps) => {
              return <div key={table.id}>{renderTable(table)}</div>;
            })}
          </div>
        );

      default:
        return null;
    }
  };
  const renderTable = (table: FormTableProps) => {
    // Create refs for each textarea based on table title and row/col index
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

    const adjustHeight = (key: string) => {
      const textarea = textareaRefs.current[key];
      if (textarea) {
        // Reset height to auto to correctly calculate the scrollHeight
        textarea.style.height = "auto";
        // Set the height to match the content's scroll height
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    // Call adjustHeight on mount and when the content changes
    useEffect(() => {
      Object.keys(textareaRefs.current).forEach((key) => {
        adjustHeight(key);
      });
    }, []);
    return (
      <div className="relative overflow-y-hidden gap-y-4 mb-4">
        <div className="sticky left-0 ">
          <Title value={table.title}></Title>
        </div>
        <table className="relative min-w-full overflow-x-auto divide-y divide-gray-200 border-2 border-x-primary">
          <thead className="bg-gray-50">
            <tr className="">
              {table.columns?.map((col, index) => (
                <th
                  key={col.header}
                  className="w-fit px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nestedTableData[table.title]?.map((row: any, rowIndex: number) => (
              <tr key={rowIndex}>
                {table.columns?.map((col, colIndex) => {
                  const cellValue = row[col.header] || "";
                  const isDisabled =
                    mode === "view"
                      ? true
                      : table.disabled[col.header] || false;

                  // Unique key for each textarea
                  const textareaKey = `${table.title}-${rowIndex}-${colIndex}`;

                  // Render based on the column type
                  switch (col.type) {
                    case "text":
                    case "number":
                      return (
                        <td
                          key={colIndex}
                          className=" border-r-2 pl-1 border-primary"
                        >
                          <input
                            type={col.type}
                            value={cellValue}
                            disabled={isDisabled}
                            className="outline-none w-full disabled:cursor-not-allowed"
                            onChange={(e) =>
                              handleTableChange(
                                table.title,
                                rowIndex,
                                col.header,
                                e.target.value
                              )
                            }
                          />
                        </td>
                      );
                    case "textarea":
                      return (
                        <td
                          key={colIndex}
                          className="border-r-2 pl-1 border-primary"
                        >
                          <textarea
                            ref={(el) => {
                              textareaRefs.current[textareaKey] = el;
                            }}
                            value={cellValue}
                            disabled={isDisabled}
                            className="outline-none w-full disabled:cursor-not-allowed"
                            onChange={(e) => {
                              handleTableChange(
                                table.title,
                                rowIndex,
                                col.header,
                                e.target.value
                              );
                              adjustHeight(textareaKey); // Adjust height on change
                            }}
                            onInput={() => adjustHeight(textareaKey)} // Adjust height on input
                          />
                        </td>
                      );
                    case "checkbox":
                      return (
                        <td
                          key={colIndex}
                          className=" pl-14  border-r-2 border-primary"
                        >
                          <input
                            className="flex items-center disabled:cursor-not-allowed size-4 rounded-md"
                            type="checkbox"
                            checked={Boolean(cellValue)}
                            disabled={isDisabled}
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              handleTableChange(
                                table.title,
                                rowIndex,
                                col.header,
                                newValue
                              );
                            }}
                          />
                        </td>
                      );
                    case "select":
                      return (
                        <td
                          key={colIndex}
                          className=" border-r-2 pl-1 border-primary"
                        >
                          <select
                            className="w-full outline-none disabled:cursor-not-allowed"
                            disabled={isDisabled}
                            value={cellValue}
                            onChange={(e) =>
                              handleTableChange(
                                table.title,
                                rowIndex,
                                col.header,
                                e.target.value
                              )
                            }
                          >
                            {col.options?.map((option, optionIndex) => (
                              <option key={optionIndex} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    default:
                      return <td key={colIndex}>{cellValue}</td>;
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    //
  };
  const renderFileField = (
    name: string,
    label: string,
    disabled: boolean,
    error: string
  ) => {
    const handleCancel = () => {
      setTempAttachments([...attachments]);
      setDeletedFiles([]);
      setIsModalOpen(false);
    };
    const handleFileButtonClick = () => {
      // Programmatically click the hidden file input
      const fileInput = document.getElementById(
        "fileInput"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    };

    const handleFileChange = async (files: FileList | null) => {
      if (!files) return;

      const allowedExtensions = [
        ".jpg",
        ".tiff",
        ".jfif",
        ".jpeg",
        ".png",
        ".gif",
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
      ];

      const filesArray = Array.from(files);
      const newAttachments = await Promise.all(
        filesArray.map(async (file) => {
          // Extract file extension (e.g., ".jpg", ".pdf")
          const fileExtension = file.name
            .slice(file.name.lastIndexOf("."))
            .toLowerCase();

          // Check if the file extension is allowed
          if (!allowedExtensions.includes(fileExtension)) {
            setAlertMessage(
              `The file type "${fileExtension}" is not supported.`
            );
            setShowAlert(true);
            return null; // Skip unsupported files
          }

          // Convert file to Base64 if it has a valid extension
          const base64String = await fileToBase64(file);
          return {
            DocName: file.name,
            DocType: fileExtension,
            DocFile: base64String, // Store the Base64 string here
            Description: "", // Initialize description as empty
          };
        })
      );

      // Filter out unsupported files (null entries)
      const validAttachments = newAttachments.filter(
        (attachment) => attachment !== null
      );

      // Filter out deleted attachments
      const activeTempAttachments = tempAttachments.filter(
        (_, index) => !deletedFiles.includes(index)
      );

      // Check for duplicates using the current tempAttachments
      const existingNames = new Set(
        activeTempAttachments.map((att) => att.DocName)
      ); // Collect existing names

      const filteredNewAttachments: Attachment[] = [];
      const duplicateFiles: string[] = []; // Array to hold duplicate filenames

      validAttachments.forEach((newAttachment) => {
        if (existingNames.has(newAttachment.DocName)) {
          duplicateFiles.push(newAttachment.DocName); // Add duplicate names to the array
        } else {
          filteredNewAttachments.push(newAttachment); // Add to filtered attachments if not a duplicate
        }
      });

      // Show alert if there are duplicate files
      if (duplicateFiles.length > 0) {
        setAlertMessage(
          `The following files already exist: ${duplicateFiles.join(", ")}`
        );
        setShowAlert(true);
      }

      // Update tempAttachments state with the filtered new attachments
      setTempAttachments((prev) => [...prev, ...filteredNewAttachments]);

      if (filteredNewAttachments.length > 0) {
        setIsModalOpen(true); // Open modal only if there are new files added
      }

      // Reset the file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleDescriptionChange = (index: number, value: string) => {
      // Update the description for the temp attachment at the given index
      setTempAttachments((prev) => {
        const updatedAttachments = [...prev];
        updatedAttachments[index] = {
          ...updatedAttachments[index],
          Description: value, // Update the description
        };
        return updatedAttachments;
      });
    };

    const handleSave = () => {
      const filteredTempAttachments = tempAttachments.filter(
        (_, index) => !deletedFiles.includes(index)
      );

      const updatedAttachments = [...filteredTempAttachments];

      // Set the new attachments state
      setAttachments(updatedAttachments);
      setTempAttachments(updatedAttachments);
      // Update formData with merged attachments
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: JSON.stringify(updatedAttachments), // Save merged attachments
      }));

      // Clear deleted files tracking after saving
      setDeletedFiles([]);
      // Close the modal
      setIsModalOpen(false);
    };

    const handleDelete = (index: number) => {
      const fileToDelete = tempAttachments[index];
      if (fileToDelete) {
        setDeletedFiles((prev) => [...prev, index]);
      }
    };

    const handleViewFile = (attachment: Attachment) => {
      try {
        // Map of MIME types based on DocType
        const mimeTypeMap: { [key: string]: string } = {
          jpg: "image/jpeg",
          tiff: "image/jpeg",
          jfif: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          pdf: "application/pdf",
          doc: "application/msword", // For .doc
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // For .docx
          xls: "application/vnd.ms-excel", // For .xls
          xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // For .xlsx
        };

        // Convert DocType to lowercase and remove the dot if present
        const fileExtension = attachment.DocType.replace(".", "").toLowerCase();

        // Get the corresponding MIME type from the map
        const mimeType = mimeTypeMap[fileExtension];

        // Check if the MIME type is supported
        if (!mimeType) {
          setAlertMessage(`This file type is not supported for viewing.`);
          setShowAlert(true);
          return;
        }

        // Assuming DocFile is a Base64 string
        const base64String = attachment.DocFile;

        // Decode Base64 string to binary data
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // Create a Blob object from the byte array
        const blob = new Blob([byteArray], { type: mimeType });

        // Create a URL for the Blob and open it
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, "_blank"); // Open the file in a new tab/window
      } catch (error) {
        console.error("Error viewing file:", error);
        setAlertMessage(`An error occurred while trying to view the file.`);
        setShowAlert(true);
      }
    };

    async function fileToBase64(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Read the file as a Data URL (Base64 encoded)
        reader.onload = () => {
          const base64String = reader.result?.toString().split(",")[1]; // Get only the Base64 part
          resolve(base64String || "");
        };
        reader.onerror = (error) => reject(error);
      });
    }

    return (
      <div
        key={name}
        className={`sm:col-span-4 md:col-span-2 lg:col-span-2 ${
          name === "" ? "invisible" : ""
        }`}
      >
        <label className="text-sm font-medium text-gray-700">{label}</label>

        <div>
          <button
            className="disabled:cursor-not-allowed disabled:bg-gray-300 mt-2 bg-primary text-white px-4 py-2 rounded-md"
            onClick={(e) => setIsModalOpen(true)}
          >
            {tempAttachments.length > 0 || disabled
              ? " view files "
              : "Choose files"}
          </button>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <input
            className="disabled:cursor-not-allowed mt-1 block w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
            type="file"
            id="fileInput"
            style={{ display: "none" }} // Hide the actual file input
            multiple
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files)}
          />

          {/* Modal for showing attachments */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
              <div className="w-5/6 max-h-[90%] bg-gray-100 rounded-lg shadow-lg ">
                <div className="px-6 pt-2 flex justify-between text-center items-center">
                  {" "}
                  <h2 className="text-lg font-semibold mb-4">Attachments</h2>
                  {!disabled && (
                    <button
                      className="bg-primary text-white my-4 px-4 py-2 rounded-md"
                      onClick={handleFileButtonClick}
                    >
                      Add Files
                    </button>
                  )}
                </div>
                <div className="bg-white p-4 overflow-auto max-h-[400px]">
                  <table className=" w-full max-h-28 border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2">File Name</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tempAttachments
                        .map((attachment, index) => ({ attachment, index })) // Create a new array with attachment data and original indices
                        .filter(({ index }) => !deletedFiles.includes(index)) // Filter out files that are marked for deletion
                        .map(({ attachment, index }) => (
                          <tr key={index}>
                            <td className="border p-2 w-8 h-14 overflow-hidden text-nowrap">
                              {attachment.DocName}
                            </td>
                            <td className="border flex h-14">
                              <input
                                type="text"
                                value={attachment.Description}
                                placeholder="Enter description"
                                onChange={(e) =>
                                  handleDescriptionChange(index, e.target.value)
                                }
                                className="outline-none w-full disabled:cursor-not-allowed border-none border-gray-300 rounded-md px-2 py-1"
                              />
                            </td>
                            <td className="border p-2 w-fit bg-blue-100 border-gray-300">
                              <div className="flex gap-3 justify-center items-center">
                                <button
                                  onClick={() => handleViewFile(attachment)}
                                  className="inline-block rounded-full px-2 py-2 text-xs font-medium text-white bg-blue-300 hover:bg-gray-50 hover:text-blue-300 transition duration-300"
                                >
                                  <Eye size={18} />
                                </button>
                                {!disabled && (
                                  <button
                                    className="inline-block rounded-full px-2 py-2 text-xs font-medium text-white bg-red-400 hover:bg-red-500 hover:text-white transition duration-300"
                                    onClick={() => handleDelete(index)}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 pb-2 mt-4 flex justify-end space-x-4">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  {!disabled && (
                    <button
                      className="bg-primary text-white px-4 py-2 rounded-md"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      {showAlert && <Alert value={alertMessage} onClose={handleAlertClose} />}
      <div className="mb-4 flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {editRow && mode === "view"
            ? `Viewing Row `
            : editRow
            ? `Editing Row `
            : "Adding New Row"}
        </label>
        {mode !== "view" && (
          <button
            onClick={editRow ? onAddNewClick : undefined}
            disabled={!editRow}
            className={`px-4 py-2 rounded-md ${
              !editRow
                ? "bg-gray-300 text-white cursor-not-allowed hidden"
                : "bg-primary text-white"
            }`}
          >
            + New
          </button>
        )}
      </div>

      <div>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-2">
            <Title
              value={section?.title}
              color={
                section.enabled
                  ? "bg-[#bdffa4] text-[#007200] border-[#007200]"
                  : "bg-gray-100 text-gray-600 border-primary"
              }
            />
            <div
              className={`${
                section.enabled ? "bg-[#bdffa4]" : "bg-gray-100"
              } p-4  mb-5 grid justify-start lg:grid-cols-4 sm:grid-cols-1 gap-4 md:grid-cols-3`}
            >
              {section.fields.map((field) => {
                const columnIndex = columns.indexOf(field);
                // if (columnIndex === -1) return null; // Skip if the field is not found in columns

                const inputType = inputTypes[field] || "text";
                const disabled =
                  mode === "view" ? true : disabledInputs[field] || false;

                return renderInput(field, inputType, disabled);
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-400 text-white rounded-md mr-2"
        >
          Cancel
        </button>
        {rowModeBaseOnColumnIndex !== undefined ? (
          mode !== "view" && rowModeBaseOnColumnIndex == true ? (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded-md"
            >
              {editRow ? "Update" : "Add"}
            </button>
          ) : (
            mode !== "view" && rowModeBaseOnColumnIndex == false && editRow ?(
              null
            ) :  
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded-md"
            >
              {editRow ? "Update" : "Add"}
            </button>
          )
        ) : mode == "view" ? null : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            {editRow ? "Update" : "Add"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Form;
