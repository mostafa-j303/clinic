// Table.tsx
"use client";
import {
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  RefreshCcw,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Form, { FormTableProps } from "./Form";
import { Option } from "./Form";
import ConfirmationModal from "../_components/ConfirmationModal";
import { formatDateTime22 } from "./functions/formatDateString";
import Alert from "../_components/Alert";

interface TableProps {
  dateformat: string;
  case: "tabs" | "popup" | "combined";
  mode?: "view";
  rowModeBaseOnColumnIndex?: number;
  fetchData: () => Promise<{
    thead: string[];
    tbody: { id: number; data: (string | boolean | number | any)[] }[];
  }>;
  handleRefresh: () => void;
  onAdd: (
    newData: (string | boolean | number)[],
    nestedTableUpdates: { [title: string]: any[] }
  ) => void;
  onEdit: (id: number, updatedData: (string | boolean | number)[]) => void;
  onDelete: (id: number | undefined) => void;
  data: { id: number; data: (string | boolean | number)[] }[];
  inputTypes?: { [column: string]: string };
  disabledInputs?: { [column: string]: boolean };
  selectedColumns: string[];
  sections: { title?: string; fields: string[]; enabled?: boolean }[];
  options?: { [key: string]: Option[] }; // Options for select, checkbox-group, and radio-group
  defaultValues?: { [column: string]: any }; // Default values for inputs
  labels?: { [column: string]: string }; // Custom labels for inputs
  placeholders?: { [column: string]: string }; // Placeholders for inputs
  phrases?: string[];
  nestedTables?: FormTableProps[];
  defaultnestedtables?: FormTableProps[];
  updateNestedTable?: (
    tableId: number,
    nestedTableId: number,
    updatedData: any
  ) => void; // Added
  dateColumn?: string;
  headLable?: { [column: string]: string };
  selectFilter?: string;
  selectFilter2?: string;
  requiredFields?: string[];
  FieldsrequiredBaseOnFromToDate?: string[];
  hiddenFieldBaseOnSelectOption?: any[];
  FieldRequiredBaseOnSelectOption?: any[];
  changeFieldTypeBasedOnSelect?: any[];
  fetchGetRowData?: (row: any) => void;
  defaultaddSectionsAndDisabledInputs?: any;
  //for the inputconstructor
}

const Table: React.FC<TableProps> = ({
  dateformat,
  case: displayCase,
  mode,
  rowModeBaseOnColumnIndex,
  fetchData,
  handleRefresh,
  onAdd,
  onEdit,
  onDelete,
  updateNestedTable,
  data,
  inputTypes = {},
  disabledInputs = {},
  selectedColumns,
  sections,
  options,
  defaultValues,
  labels,
  placeholders,
  phrases,
  defaultnestedtables = [],
  dateColumn,
  selectFilter,
  selectFilter2,
  headLable = {},
  requiredFields,
  FieldsrequiredBaseOnFromToDate = [],
  hiddenFieldBaseOnSelectOption = [],
  FieldRequiredBaseOnSelectOption = [],
  changeFieldTypeBasedOnSelect = [],
  fetchGetRowData,
  defaultaddSectionsAndDisabledInputs,
  //for the inputconstrucotr
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [thead, setThead] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<
    {
      id: number;
      data: (string | boolean | number | any)[];
      nestedTables?: any[]; // Include nestedTables in the state
    }[]
  >(data);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"table" | "form">("table");
  const [editRow, setEditRow] = useState<{
    id: number;
    data: (string | boolean | number)[];
    nestedTables?: any[];
  } | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortColumn, setSortColumn] = useState<string>("id"); // Add state to keep track of the column being sorted

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [yearFilter, setYearFilter] = useState<
    "Last 3 Months" | "This Year" | "Last Year" | "All Years"
  >("Last 3 Months");
  const [selectedFilterOption, setSelectedFilterOption] = useState<string>("1");
  const [selectedFilterOption2, setSelectedFilterOption2] =
    useState<string>("");

  const [ConfirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const fetchTableData = async () => {
    const data = await fetchData();
    const formattedTbody = data.tbody.map((row) => {
      const formattedData = row.data.map((cell, index) => {
        const column = data.thead[index];
        const inputType = inputTypes[column];

        if (
          inputType === "date" ||
          inputType === "date-time" ||
          inputType === "date-time-group"
        ) {
          return formatDateTime22(cell, dateformat); // Use the desired format here
        }
        return cell;
      });

      return {
        ...row,
        data: formattedData,
      };
    });
    setThead(["ID", ...data.thead]); // Add ID to table headers
    setFilteredData(formattedTbody);
    // setFilteredData(data.tbody);
  };
  useEffect(() => {
    fetchTableData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = data;

    // Apply Year Filter if a valid date column is provided
    if (dateColumn && inputTypes[dateColumn] === "date") {
      const currentYear = new Date().getFullYear();
      const currentDate = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

      filtered = filtered.filter((row) => {
        const dateValueRaw = row.data[thead.indexOf(dateColumn)];
        let dateValue: Date | null = null;

        // Ensure that dateValueRaw is a string or number and a valid date
        if (
          typeof dateValueRaw === "string" ||
          typeof dateValueRaw === "number"
        ) {
          const parsedDate = new Date(dateValueRaw);
          if (!isNaN(parsedDate.getTime())) {
            dateValue = parsedDate;
          }
        }

        if (dateValue) {
          if (yearFilter === "This Year") {
            return dateValue.getFullYear() === currentYear;
          } else if (yearFilter === "Last Year") {
            return dateValue.getFullYear() === currentYear - 1;
          } else if (yearFilter === "Last 3 Months") {
            return dateValue >= threeMonthsAgo && dateValue <= currentDate;
          }
        }
        // If dateValue is null or invalid, include the row in "All Years" by default
        return true;
      });
    }
    if (selectFilter && inputTypes[selectFilter] === "select") {
      const filterOptions = options?.[selectFilter] || [];
      const selectedOption = filterOptions.find(
        (option) => option.value?.toString() === selectedFilterOption
      );

      if (selectedOption) {
        const filterValue = selectedOption.value;
        filtered = filtered.filter((row) => {
          const cellValue = row.data[thead.indexOf(selectFilter) - 1];
          return filterValue === "" || cellValue === filterValue;
        });
      }
    }
    if (selectFilter2 && inputTypes[selectFilter2] === "select") {
      const filterOptions = options?.[selectFilter2] || [];
      const selectedOption = filterOptions.find(
        (option) => option.value?.toString() === selectedFilterOption2
      );

      if (selectedOption) {
        const filterValue = selectedOption.value;
        filtered = filtered.filter((row) => {
          const cellValue = row.data[thead.indexOf(selectFilter2) - 1];
          return filterValue === "" || cellValue === filterValue;
        });
      }
    }

    // Handle Search Query with Selected Columns
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();

      filtered = filtered.filter((row) =>
        row.data.some((cell, index) => {
          const column = thead[index + 1];
          const inputType = inputTypes[column];

          // Skip columns not in selectedColumns
          if (!selectedColumns.includes(column)) {
            return false;
          }

          let cellValue: string | undefined;

          if (inputType === "select") {
            // Handle select input type
            const option = options?.[column]?.find(
              (option) => option.value === cell
            );
            cellValue = option?.label || cell?.toString();
          } else if (
            inputType === "date" ||
            inputType === "date-time-group" ||
            inputType === "date-time"
          ) {
            // Handle date input type
            if (typeof cell === "string" || typeof cell === "number") {
              const cellDate = new Date(cell);
              const formattedDate = formatDateTime22(cellDate, dateformat);
              cellValue = formattedDate;
            }
          } else {
            // Handle other types
            cellValue = cell?.toString();
          }

          // Return whether cellValue includes the search query
          return cellValue && cellValue.toLowerCase().includes(lowerCaseQuery);
        })
      );
    }

    let sortedData = [...filtered];
    const columnIndex = thead.indexOf(sortColumn) - 1;

    if (columnIndex > -1) {
      sortedData.sort((a, b) => {
        const aValue = a.data[columnIndex];
        const bValue = b.data[columnIndex];
        if (
          inputTypes[sortColumn] === "number" ||
          inputTypes[sortColumn] === "des-number"
        ) {
          return sortOrder === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        } else if (
          inputTypes[sortColumn] === "date" ||
          inputTypes[sortColumn] === "date-time-group" ||
          inputTypes[sortColumn] === "date-time"
        ) {
          const dateA =
            typeof aValue === "string" || typeof aValue === "number"
              ? new Date(aValue).getTime()
              : 0;
          const dateB =
            typeof bValue === "string" || typeof bValue === "number"
              ? new Date(bValue).getTime()
              : 0;
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        } else {
          // Fallback to string comparison (e.g., text)
          return sortOrder === "asc"
            ? aValue?.toString().localeCompare(bValue?.toString())
            : bValue?.toString().localeCompare(aValue?.toString());
        }
      });
    }
    setFilteredData(sortedData);
  }, [
    searchQuery,
    data,
    sortOrder,
    sortColumn,
    thead,
    yearFilter,
    dateColumn,
    inputTypes,
    selectFilter,
    selectFilter2,
    selectedFilterOption,
    selectedFilterOption2,
    options,
    formatDateTime22,
    selectedColumns,
  ]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const [section, setSection] = useState<any[]>(sections);
  const [disabledInput, setdisabledInput] = useState<any>(disabledInputs);
  const handleAddNewClick = () => {
    setEditRow(null);
    setActiveTab("form");
    if (defaultaddSectionsAndDisabledInputs) {
      setSection(defaultaddSectionsAndDisabledInputs?.sections);
      setdisabledInput(defaultaddSectionsAndDisabledInputs?.disabledInputs);
    }
  };
  useEffect(() => {
    setSection(sections);
    setdisabledInput(disabledInputs);
  }, [sections, disabledInputs]);

  // const handleEditClick = (row: {
  //   id: number;
  //   data: (string | boolean | number)[];
  //   nestedTables?: any[];
  // }) => {
  //   console.log("Edited row :" ,row)
  //   console.log("theads of rows :",thead)
  //   setEditRow(row);
  //   setActiveTab("form");
  // };

  const handleEditClick = async (row: {
    id: number;
    data: (string | boolean | number)[];
    nestedTables?: any[];
  }) => {
    let result: any;
    // Check if fetchGetRowData is defined before calling it
    if (fetchGetRowData) {
      try {
        // Attempt to fetch row data
        result = await fetchGetRowData(row);
        // Only proceed if the result exists and is valid
        if (result) {
          // Assuming the header names match your row structure
          const updatedRowData = row.data.map((value: any, index: number) => {
            const header = thead[index + 1]; // Adjust based on your actual headers
            if (result[header] !== undefined) {
              return result[header];
            }
            return value;
          });
          // Update state with new row data
          setEditRow({
            ...row,
            data: updatedRowData,
          });
          // Set the active tab to "form"
          setActiveTab("form");
        } else {
          setAlertMessage("Error fetching row data.");
          setShowAlert(true);
        }
      } catch (error) {
        console.error("Error fetching row data:", error);
        // Handle fetch error (e.g., show an error message)
      }
    } else {
      // Assuming the header names match your row structure
      const updatedRowData = row.data.map((value, index) => {
        const header = thead[index + 1]; // Adjust based on your actual headers
        return typeof value === "undefined" &&
          result &&
          result[header] !== undefined
          ? result[header]
          : value;
      });
      // Update state with new row data
      setEditRow({
        ...row,
        data: updatedRowData,
      });
      setActiveTab("form");
    }
  };

  const handleFormSubmit = useCallback(
    async (
      data: { [key: string]: any },
      nestedTableUpdates?: { [nestedTableId: number]: any[] }
    ) => {
      try {
        console.log("Form Submit Data:", data);
        console.log("Nested Table Updates:", nestedTableUpdates);
        console.log("Edit Row:", editRow);

        if (editRow) {
          console.log("Editing row ID:", editRow.id);

          // Await to ensure this operation completes before proceeding
          await onEdit(editRow.id, Object.values(data));

          if (editRow.nestedTables && nestedTableUpdates) {
            for (const [nestedTableId, updatedData] of Object.entries(
              nestedTableUpdates
            )) {
              console.log(
                "Updating Nested Table ID:",
                nestedTableId,
                "with Data:",
                updatedData
              );
              if (updateNestedTable)
                // Await to ensure each nested table update completes
                await updateNestedTable(
                  editRow.id,
                  parseInt(nestedTableId, 10),
                  updatedData
                );
            }
          }
        } else {
          // If nestedTableUpdates is undefined or empty, use the current nestedTableData
          const dataToSubmit =
            nestedTableUpdates && Object.keys(nestedTableUpdates).length > 0
              ? nestedTableUpdates
              : {};
          console.log(
            "Adding new row with Data:",
            Object.values(data),
            dataToSubmit
          );
          await onAdd(Object.values(data), dataToSubmit);
        }

        // Switch to the table view after operations complete
        setActiveTab("table");
        setEditRow(null);
      } catch (error) {
        console.error("Error during form submission:", error);
      }
    },
    [editRow, onEdit, updateNestedTable, onAdd] // Correct dependencies
  );

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleConfirmation = () => {
    onDelete(editRow?.id);
    setConfirmationModalOpen(false);
  };
  const handleCancelConfirmation = () => {
    setConfirmationModalOpen(false); // Close the modal without deleting
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilterOption(event.target.value);
    setCurrentPage(1);
  };
  const handleFilterChange2 = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilterOption2(event.target.value);
    setCurrentPage(1);
  };
  return (
    <div >
      {showAlert && (
        <Alert value={alertMessage} onClose={() => setShowAlert(false)} />
      )}
      {displayCase === "tabs" && (
        <>
          <div className="flex justify-between mb-1 gap-2 mt-28">
            <div className="flex ">
              <button
                className={`px-4 py-2 ${
                  activeTab === "table" ? "bg-gray-200 hidden" : "bg-white"
                } border`}
                onClick={() => setActiveTab("table")}
              >
                Table
              </button>

              {activeTab === "table" && (
                <div className=" py-0 flex items-center gap-4">
                  <div className="sm:flex flex-col">
                    <select
                      value={rowsPerPage}
                      onChange={handleRowsPerPageChange}
                      className="p-[9.5px] border-2 border-gray-200 rounded-md bg-primary text-white font-light"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>

                    {/* Conditionally render the year filter dropdown */}
                    {dateColumn && inputTypes[dateColumn] === "date" && (
                      <select
                        value={yearFilter}
                        onChange={(e) => {
                          setYearFilter(
                            e.target.value as
                              | "Last 3 Months"
                              | "This Year"
                              | "Last Year"
                              | "All Years"
                          );
                          setCurrentPage(1);
                        }}
                        className="p-[9.5px] border-2 border-gray-200 rounded-md bg-primary text-white font-light"
                      >
                        <option value="Last 3 Months">Last 3 Mo</option>
                        <option value="This Year">This Year</option>
                        <option value="Last Year">Last Year</option>
                        <option value="All Years">All Years</option>
                      </select>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-1">
                    {selectFilter && inputTypes[selectFilter] === "select" && (
                      <div className="flex justify-center items-center bg-white p-2 gap-2">
                        <h2>{headLable[selectFilter] || selectFilter}</h2>
                        <select
                          value={selectedFilterOption}
                          onChange={handleFilterChange}
                          className="p-[9.5px] py-0 border-2 w-3 border-gray-200 rounded-md bg-primary text-white font-light"
                        >
                          {options?.[selectFilter]?.map((option) => (
                            <option
                              key={option.value?.toString()}
                              value={option.value?.toString()}
                            >
                              {option.value ? option.label : `All`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {selectFilter2 &&
                      inputTypes[selectFilter2] === "select" && (
                        <div className="flex justify-center items-center bg-white p-2 gap-2">
                          <h2>{headLable[selectFilter2] || selectFilter2}</h2>
                          <select
                            value={selectedFilterOption2}
                            onChange={handleFilterChange2}
                            className="p-[9.5px] py-0 border-2 w-3 border-gray-200 rounded-md bg-primary text-white font-light"
                          >
                            {options?.[selectFilter2]?.map((option) => (
                              <option
                                key={option.value?.toString()}
                                value={option.value?.toString()}
                              >
                                {option.value ? option.label : `All`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
            {activeTab === "table" && (
              <div className="  flex sm:flex-col-reverse gap-1  justify-end">
                <div className="inline-flex items-center justify-center rounded bg-primary py-1 text-white">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex size-8 items-center justify-center rtl:rotate-180"
                  >
                    <span className="sr-only">Prev Page</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <span
                    className="h-4 w-px bg-white/25"
                    aria-hidden="true"
                  ></span>

                  <div>
                    <label htmlFor="PaginationPage" className="sr-only">
                      Page
                    </label>

                    <input
                      type="number"
                      className="h-8 w-12 rounded border-none bg-transparent p-0 text-center text-xs font-medium [-moz-appearance:_textfield] focus:outline-none focus:ring-inset focus:ring-white [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                      min="1"
                      value={currentPage}
                      id="PaginationPage"
                      onChange={(e) => handlePageChange(Number(e.target.value))}
                    />
                  </div>

                  <span className="h-4 w-px bg-white/25"></span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex size-8 items-center justify-center rtl:rotate-180"
                  >
                    <span className="sr-only">Next Page</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                {mode !== "view" && (
                  <button
                    onClick={handleAddNewClick}
                    className="px-4 py-2 bg-primary text-white rounded-md mr-1"
                  >
                    Add
                  </button>
                )}{" "}
              </div>
            )}
          </div>

          {activeTab === "table" && (
            <>
              <div className="flex  min-w-full sticky left-0">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none flex-grow h-16 px-4 py-2 border-2 border-gray-100"
                />
                <button
                  className="bg-white px-5 mx-1 rounded-3xl"
                  onClick={handleRefresh}
                >
                  <RefreshCcw color="gray" />
                </button>
              </div>
              <hr className="border-primary m-1"></hr>
              <div className="overflow-auto max-h-[450px] ">
                <table className="min-w-full divide-y-2 border-2 border-b-gray-300 border-gray-100 rounded-md border-r-gray-200 divide-gray-200 bg-white text-sm  ">
                  <thead className=" text-left">
                    <tr>
                      {/* <th
                      className="sticky left-[-0.5px] pr-1 py-2 bg-gray-100 font-medium text-gray-400 w-12 cursor-pointer border-gray-300 border-r-2"
                      onClick={() => handleSort("id")}
                    >
                      ID
                      <button className="relative right-[6px] ml-2 inline-flex items-center">
                        {sortColumn === "id" && sortOrder === "asc" ? (
                          <ChevronUp size={16} />
                        ) : sortColumn === "id" ? (
                          <ChevronDown size={16} />
                        ) : null}
                      </button>
                    </th> */}
                      {thead
                        .filter((header) => selectedColumns.includes(header))
                        .map((header, index) => {
                          // Use headLabel if available, otherwise fall back to the original header
                          const displayHeader = headLable[header] ?? header;

                          return (
                            <th
                              onClick={() => handleSort(header)}
                              key={index}
                              className="px-4 py-2 font-medium text-gray-400"
                            >
                              <div className="flex">
                                {displayHeader}
                                <button className="relative right-[6px] ml-2 inline-flex items-center">
                                  {sortOrder === "asc" ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </button>
                              </div>
                            </th>
                          );
                        })}
                      <th className=" sticky -right-1 z-10 bg-gray-100 border-l-2 border-gray-300 h-14 w-[119px] px-2 py-2 text-center items-center justify-center text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.map((row) => {
                      return (
                        <tr key={row.id} className="hover:bg-gray-50    ">
                          {/* <td className="sticky left-[-0.5px] pl-2 py-2 bg-gray-100 border-r-2 border-gray-300 text-gray-400 font-bold w-12">
                          {row.id}
                        </td> */}
                          {thead.slice(1).map((header, index) => {
                            if (selectedColumns.includes(header)) {
                              const cell = row.data[index];
                              const inputType = inputTypes[header];
                              let displayValue = cell;
                              // Check if the inputType is "select" and map the value to the corresponding label
                              if (inputType === "select" && options?.[header]) {
                                const option = (
                                  options[header] as {
                                    value: string;
                                    label: string;
                                  }[]
                                ).find((opt) => opt.value == cell);
                                displayValue = option ? option.label : cell;
                              }

                              if (
                                inputType === "date-time" ||
                                inputType === "date-time-group"
                              ) {
                                displayValue = formatDateTime22(
                                  cell,
                                  dateformat
                                ); // Use the desired format here
                              }
                              if (inputType === "date") {
                                displayValue = formatDateTime22(
                                  cell,
                                  dateformat
                                )?.split(" ")[0]; // Use the desired format here
                              }
                              // Determine text color based on the cell value
                              const textColorClass = (() => {
                                if (displayValue == "Completed")
                                  return "text-blue-800  font-bold";
                                if (
                                  displayValue == "Not Completed" ||
                                  displayValue == "NotCompleted"
                                )
                                  return "text-orange-500  font-bold";
                                if (
                                  displayValue == "Completed Not Approved" ||
                                  displayValue == "CompletedNotApproved"
                                )
                                  return "text-red-600  font-bold";
                                return "";
                              })();

                              return (
                                <td
                                  key={index}
                                  className={`px-4 truncate py-4 ${textColorClass}`}
                                >
                                  {typeof displayValue === "boolean" ? (
                                    <input
                                      type="checkbox"
                                      checked={displayValue}
                                      readOnly
                                    />
                                  ) : (
                                    displayValue
                                  )}
                                </td>
                              );
                            }
                            return null;
                          })}
                          <td className="sticky -right-1 z-10 bg-gray-100 border-l-2 border-gray-300  px-1 py-2 text-center items-center justify-end ">
                            <div className="flex justify-around">
                              <button
                                onClick={() => handleEditClick(row)}
                                className="inline-block rounded-full px-2 py-2 text-xl font-medium text-gray-300 hover:bg-gray-50 hover:text-blue-200 transition duration-300"
                              >
                                {rowModeBaseOnColumnIndex ? (
                                  mode !== "view" &&
                                  row.data?.[rowModeBaseOnColumnIndex] == 1 ? (
                                    <Pencil size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )
                                ) : mode !== "view" ? (
                                  <Pencil size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                              {rowModeBaseOnColumnIndex
                                ? mode !== "view" &&
                                  row.data?.[rowModeBaseOnColumnIndex] == 1 && (
                                    <button
                                      disabled={mode === "view"}
                                      onClick={() => {
                                        setConfirmationModalOpen(true);
                                        setEditRow(row);
                                      }}
                                      className="inline-block rounded-full px-2 py-2 text-xs font-medium text-gray-300 hover:bg-gray-50 hover:text-red-400 transition duration-300"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  )
                                : mode !== "view" && (
                                    <button
                                      disabled={mode === "view"}
                                      onClick={() => {
                                        setConfirmationModalOpen(true);
                                        setEditRow(row);
                                      }}
                                      className="inline-block rounded-full px-2 py-2 text-xs font-medium text-gray-300 hover:bg-gray-50 hover:text-red-400 transition duration-300"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {ConfirmationModalOpen && (
                  <ConfirmationModal
                    text="Click confirm to delete the row."
                    onConfirm={() => {
                      handleConfirmation(), setEditRow(null);
                    }}
                    onCancel={() => {
                      handleCancelConfirmation(), setEditRow(null);
                    }}
                  />
                )}
              </div>
            </>
          )}
          {activeTab === "form" && (
            <Form
            rowModeBaseOnColumnIndex={
              rowModeBaseOnColumnIndex == undefined
                ? undefined
                : typeof rowModeBaseOnColumnIndex == "number" &&
                  editRow?.data[rowModeBaseOnColumnIndex] == 1
                ? true
                : false
            }
              changeFieldTypeBasedOnSelect={changeFieldTypeBasedOnSelect}
              hiddenFieldBaseOnSelectOption={hiddenFieldBaseOnSelectOption}
              FieldRequiredBaseOnSelectOption={FieldRequiredBaseOnSelectOption}
              FieldsrequiredBaseOnFromToDate={FieldsrequiredBaseOnFromToDate}
              requiredFields={requiredFields}
              dateformat={dateformat}
              mode={mode}
              columns={thead.slice(1)}
              initialData={editRow ? editRow.data : []}
              onSubmit={handleFormSubmit}
              options={options}
              defaultValues={defaultValues}
              labels={labels}
              placeholders={placeholders}
              onCancel={() => {
                setActiveTab("table");
                setEditRow(null);
              }}
              inputTypes={inputTypes}
              disabledInputs={disabledInput}
              editRow={editRow}
              onAddNewClick={handleAddNewClick}
              sections={section}
              phrases={phrases}
              defaultnestedtables={defaultnestedtables}
              nestedTables={editRow?.nestedTables || []}
              // Extract the tables array from row.data} // Extract the tables array from row.data
            />
          )}
        </>
      )}
      {displayCase === "combined" && (
        <>
          <Form
             rowModeBaseOnColumnIndex={
              rowModeBaseOnColumnIndex == undefined
                ? undefined
                : typeof rowModeBaseOnColumnIndex == "number" &&
                  editRow?.data[rowModeBaseOnColumnIndex] == 1
                ? true
                : false
            }
            changeFieldTypeBasedOnSelect={changeFieldTypeBasedOnSelect}
            hiddenFieldBaseOnSelectOption={hiddenFieldBaseOnSelectOption}
            FieldRequiredBaseOnSelectOption={FieldRequiredBaseOnSelectOption}
            FieldsrequiredBaseOnFromToDate={FieldsrequiredBaseOnFromToDate}
            requiredFields={requiredFields}
            dateformat={dateformat}
            mode={mode}
            columns={thead.slice(1)}
            initialData={editRow ? editRow.data : []}
            onSubmit={handleFormSubmit}
            options={options}
            defaultValues={defaultValues}
            labels={labels}
            placeholders={placeholders}
            onCancel={() => {
              setActiveTab("table");
              setEditRow(null);
            }}
            inputTypes={inputTypes}
            disabledInputs={disabledInput}
            editRow={editRow}
            onAddNewClick={handleAddNewClick}
            sections={section}
            phrases={phrases}
            defaultnestedtables={defaultnestedtables}
            nestedTables={editRow?.nestedTables || []}
          />

          <hr className="border-2 border-primary mt-6 mb-4"></hr>
          <div className="flex justify-between mb-1 gap-2">
            <div className="flex ">
              <div className=" py-0 flex items-center gap-4">
                <div className="sm:flex flex-col">
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="p-[9.5px] border-2 border-gray-200 rounded-md bg-primary text-white font-light"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>

                  {/* Conditionally render the year filter dropdown */}
                  {dateColumn && inputTypes[dateColumn] === "date" && (
                    <select
                      value={yearFilter}
                      onChange={(e) => {
                        setYearFilter(
                          e.target.value as
                            | "Last 3 Months"
                            | "This Year"
                            | "Last Year"
                            | "All Years"
                        );
                        setCurrentPage(1);
                      }}
                      className="p-[9.5px] border-2 border-gray-200 rounded-md bg-primary text-white font-light"
                    >
                      <option value="Last 3 Months">Last 3 Mo</option>
                      <option value="This Year">This Year</option>
                      <option value="Last Year">Last Year</option>
                      <option value="All Years">All Years</option>
                    </select>
                  )}
                </div>
                <div className="flex sm:flex-col gap-1">
                  {selectFilter && inputTypes[selectFilter] === "select" && (
                    <div className="flex justify-center items-center bg-white p-2 gap-2">
                      <h2>{headLable[selectFilter] || selectFilter}</h2>
                      <select
                        value={selectedFilterOption}
                        onChange={handleFilterChange}
                        className="p-[9.5px] py-0 border-2 w-3 border-gray-200 rounded-md bg-primary text-white font-light"
                      >
                        {options?.[selectFilter]?.map((option) => (
                          <option
                            key={option.value?.toString()}
                            value={option.value?.toString()}
                          >
                            {option.value ? option.label : `All `}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectFilter2 && inputTypes[selectFilter2] === "select" && (
                    <div className="flex justify-center items-center bg-white p-2 gap-2">
                      <h2>{headLable[selectFilter2] || selectFilter2}</h2>
                      <select
                        value={selectedFilterOption2}
                        onChange={handleFilterChange2}
                        className="p-[9.5px] py-0 border-2 w-3 border-gray-200 rounded-md bg-primary text-white font-light"
                      >
                        {options?.[selectFilter2]?.map((option) => (
                          <option
                            key={option.value?.toString()}
                            value={option.value?.toString()}
                          >
                            {option.value ? option.label : `All`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="  flex sm:flex-col-reverse gap-1  justify-end">
              <div className="inline-flex items-center justify-center rounded bg-primary py-1 text-white">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex size-8 items-center justify-center rtl:rotate-180"
                >
                  <span className="sr-only">Prev Page</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <span
                  className="h-4 w-px bg-white/25"
                  aria-hidden="true"
                ></span>

                <div>
                  <label htmlFor="PaginationPage" className="sr-only">
                    Page
                  </label>

                  <input
                    type="number"
                    className="h-8 w-12 rounded border-none bg-transparent p-0 text-center text-xs font-medium [-moz-appearance:_textfield] focus:outline-none focus:ring-inset focus:ring-white [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                    min="1"
                    value={currentPage}
                    id="PaginationPage"
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                  />
                </div>

                <span className="h-4 w-px bg-white/25"></span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex size-8 items-center justify-center rtl:rotate-180"
                >
                  <span className="sr-only">Next Page</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              {mode !== "view" && (
                <button
                  onClick={handleAddNewClick}
                  className="px-4 py-2 bg-primary text-white rounded-md mr-1"
                >
                  Add
                </button>
              )}{" "}
            </div>
          </div>
          <div className="flex  min-w-full sticky left-0">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none flex-grow h-16 px-4 py-2 border-2 border-gray-100"
            />
            <button
              className="bg-white px-5 mx-1 rounded-3xl"
              onClick={handleRefresh}
            >
              <RefreshCcw color="gray" />
            </button>
          </div>
          <hr className="border-primary m-1"></hr>
          <div className="overflow-auto max-h-[450px]  mb-1">
            <table className=" w-full divide-y-2 border-2 border-b-gray-300 border-gray-100 rounded-md border-r-gray-200 divide-gray-200 bg-white text-sm  ">
              <thead className=" text-left">
                <tr>
                  {/* <th
                      className="sticky left-[-0.5px] pr-1 py-2 bg-gray-100 font-medium text-gray-400 w-12 cursor-pointer border-gray-300 border-r-2"
                      onClick={() => handleSort("id")}
                    >
                      ID
                      <button className="relative right-[6px] ml-2 inline-flex items-center">
                        {sortColumn === "id" && sortOrder === "asc" ? (
                          <ChevronUp size={16} />
                        ) : sortColumn === "id" ? (
                          <ChevronDown size={16} />
                        ) : null}
                      </button>
                    </th> */}
                  {thead
                    .filter((header) => selectedColumns.includes(header))
                    .map((header, index) => {
                      // Use headLabel if available, otherwise fall back to the original header
                      const displayHeader = headLable[header] ?? header;

                      return (
                        <th
                          onClick={() => handleSort(header)}
                          key={index}
                          className="px-4 py-2 font-medium text-gray-400"
                        >
                          <div className="flex">
                            {displayHeader}
                            <button className="relative right-[6px] ml-2 inline-flex items-center">
                              {sortOrder === "asc" ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  <th className=" sticky -right-1 z-10 bg-gray-100 border-l-2 border-gray-300 h-14 w-[119px] px-2 py-2 text-center items-center justify-center text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((row) => {
                  return (
                    <tr key={row.id} className="hover:bg-gray-50    ">
                      {/* <td className="sticky left-[-0.5px] pl-2 py-2 bg-gray-100 border-r-2 border-gray-300 text-gray-400 font-bold w-12">
                          {row.id}
                        </td> */}
                      {thead.slice(1).map((header, index) => {
                        if (selectedColumns.includes(header)) {
                          const cell = row.data[index];
                          const inputType = inputTypes[header];
                          let displayValue = cell;
                          // Check if the inputType is "select" and map the value to the corresponding label
                          if (inputType === "select" && options?.[header]) {
                            const option = (
                              options[header] as {
                                value: string;
                                label: string;
                              }[]
                            ).find((opt) => opt.value == cell);
                            displayValue = option ? option.label : cell;
                          }

                          if (
                            inputType === "date-time" ||
                            inputType === "date-time-group"
                          ) {
                            displayValue = formatDateTime22(cell, dateformat); // Use the desired format here
                          }
                          if (inputType === "date") {
                            displayValue = formatDateTime22(
                              cell,
                              dateformat
                            )?.split(" ")[0]; // Use the desired format here
                          }

                          // Determine text color based on the cell value
                          const textColorClass = (() => {
                            if (displayValue == "Completed")
                              return "text-blue-800  font-bold";
                            if (
                              displayValue == "Not Completed" ||
                              displayValue == "NotCompleted"
                            )
                              return "text-orange-500  font-bold";
                            if (
                              displayValue == "Completed Not Approved" ||
                              displayValue == "CompletedNotApproved"
                            )
                              return "text-red-600  font-bold";
                            return "";
                          })();

                          return (
                            <td
                              key={index}
                              className={`px-4 truncate py-4 ${textColorClass}`}
                            >
                              {typeof displayValue === "boolean" ? (
                                <input
                                  type="checkbox"
                                  checked={displayValue}
                                  readOnly
                                />
                              ) : (
                                displayValue
                              )}
                            </td>
                          );
                        }
                        return null;
                      })}
                      <td className="sticky -right-1 z-10 bg-gray-100 border-l-2 border-gray-300  px-1 py-2 text-center items-center justify-end ">
                        <div className="flex justify-around">
                          <button
                            onClick={() => handleEditClick(row)}
                            className="inline-block rounded-full px-2 py-2 text-xl font-medium text-gray-300 hover:bg-gray-50 hover:text-blue-200 transition duration-300"
                          >
                            {rowModeBaseOnColumnIndex ? (
                              mode !== "view" &&
                              row.data?.[rowModeBaseOnColumnIndex] == 1 ? (
                                <Pencil size={18} />
                              ) : (
                                <Eye size={18} />
                              )
                            ) : mode !== "view" ? (
                              <Pencil size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                          {rowModeBaseOnColumnIndex
                            ? mode !== "view" &&
                              row.data?.[rowModeBaseOnColumnIndex] == 1 && (
                                <button
                                  disabled={mode === "view"}
                                  onClick={() => {
                                    setConfirmationModalOpen(true);
                                    setEditRow(row);
                                  }}
                                  className="inline-block rounded-full px-2 py-2 text-xs font-medium text-gray-300 hover:bg-gray-50 hover:text-red-400 transition duration-300"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )
                            : mode !== "view" && (
                                <button
                                  disabled={mode === "view"}
                                  onClick={() => {
                                    setConfirmationModalOpen(true);
                                    setEditRow(row);
                                  }}
                                  className="inline-block rounded-full px-2 py-2 text-xs font-medium text-gray-300 hover:bg-gray-50 hover:text-red-400 transition duration-300"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {ConfirmationModalOpen && (
              <ConfirmationModal
                text="Click confirm to delete the row."
                onConfirm={() => {
                  handleConfirmation(), setEditRow(null);
                }}
                onCancel={() => {
                  handleCancelConfirmation(), setEditRow(null);
                }}
              />
            )}
          </div>
        </>
      )}
      {displayCase === "popup" && (
        <>
          <div className="flex justify-between mb-1 gap-2">
            <div className=" py-0 flex items-center gap-4">
              <div className="sm:flex flex-col">
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="p-[9.5px] border-2 border-gray-200 rounded-md bg-primary text-white font-light"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>

                {/* Conditionally render the year filter dropdown */}
                {dateColumn && inputTypes[dateColumn] === "date" && (
                  <select
                    value={yearFilter}
                    onChange={(e) => {
                      setYearFilter(
                        e.target.value as
                          | "Last 3 Months"
                          | "This Year"
                          | "Last Year"
                          | "All Years"
                      );
                      setCurrentPage(1);
                    }}
                    className="p-[9.5px] border-2 border-gray-200 rounded-md bg-primary text-white font-light"
                  >
                    <option value="Last 3 Months">Last 3 Mo</option>
                    <option value="This Year">This Year</option>
                    <option value="Last Year">Last Year</option>
                    <option value="All Years">All Years</option>
                  </select>
                )}
              </div>
              <div className="flex sm:flex-col gap-1">
                {selectFilter && inputTypes[selectFilter] === "select" && (
                  <div className="flex justify-center items-center bg-white p-2 gap-2">
                    <h2>{headLable[selectFilter] || selectFilter}</h2>
                    <select
                      value={selectedFilterOption}
                      onChange={handleFilterChange}
                      className="p-[9.5px] py-0 border-2 w-3 border-gray-200 rounded-md bg-primary text-white font-light"
                    >
                      {options?.[selectFilter]?.map((option) => (
                        <option
                          key={option.value?.toString()}
                          value={option.value?.toString()}
                        >
                          {option.value ? option.label : `All`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectFilter2 && inputTypes[selectFilter2] === "select" && (
                  <div className="flex justify-center items-center bg-white p-2 gap-2">
                    <h2>{headLable[selectFilter2] || selectFilter2}</h2>
                    <select
                      value={selectedFilterOption2}
                      onChange={handleFilterChange2}
                      className="p-[9.5px] py-0 border-2 w-3 border-gray-200 rounded-md bg-primary text-white font-light"
                    >
                      {options?.[selectFilter2]?.map((option) => (
                        <option
                          key={option.value?.toString()}
                          value={option.value?.toString()}
                        >
                          {option.value ? option.label : `All`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="  flex sm:flex-col-reverse gap-1  justify-end">
              <div className="inline-flex items-center justify-center rounded bg-primary py-1 text-white">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex size-8 items-center justify-center rtl:rotate-180"
                >
                  <span className="sr-only">Prev Page</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <span
                  className="h-4 w-px bg-white/25"
                  aria-hidden="true"
                ></span>

                <div>
                  <label htmlFor="PaginationPage" className="sr-only">
                    Page
                  </label>

                  <input
                    type="number"
                    className="h-8 w-12 rounded border-none bg-transparent p-0 text-center text-xs font-medium [-moz-appearance:_textfield] focus:outline-none focus:ring-inset focus:ring-white [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                    min="1"
                    value={currentPage}
                    id="PaginationPage"
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                  />
                </div>

                <span className="h-4 w-px bg-white/25"></span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex size-8 items-center justify-center rtl:rotate-180"
                >
                  <span className="sr-only">Next Page</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              {mode !== "view" && (
                <button
                  onClick={handleAddNewClick}
                  className="px-4 py-2 bg-primary text-white rounded-md mr-1"
                >
                  Add
                </button>
              )}{" "}
            </div>
          </div>
          <div className="flex  min-w-full sticky left-0">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none flex-grow h-16 px-4 py-2 border-2 border-gray-100"
            />
            <button
              className="bg-white px-5 mx-1 rounded-3xl"
              onClick={handleRefresh}
            >
              <RefreshCcw color="gray" />
            </button>
          </div>
          <hr className="border-primary m-1"></hr>
          <div className="overflow-auto max-h-[450px]  ">
            <table className=" w-full divide-y-2 border-2 border-b-gray-300 border-gray-100 rounded-md border-r-gray-200 divide-gray-200 bg-white text-sm  ">
              <thead className=" text-left">
                <tr>
                  {/* <th
                      className="sticky left-[-0.5px] pr-1 py-2 bg-gray-100 font-medium text-gray-400 w-12 cursor-pointer border-gray-300 border-r-2"
                      onClick={() => handleSort("id")}
                    >
                      ID
                      <button className="relative right-[6px] ml-2 inline-flex items-center">
                        {sortColumn === "id" && sortOrder === "asc" ? (
                          <ChevronUp size={16} />
                        ) : sortColumn === "id" ? (
                          <ChevronDown size={16} />
                        ) : null}
                      </button>
                    </th> */}
                  {thead
                    .filter((header) => selectedColumns.includes(header))
                    .map((header, index) => {
                      // Use headLabel if available, otherwise fall back to the original header
                      const displayHeader = headLable[header] ?? header;

                      return (
                        <th
                          onClick={() => handleSort(header)}
                          key={index}
                          className="px-4 py-2 font-medium text-gray-400"
                        >
                          <div className="flex">
                            {displayHeader}
                            <button className="relative right-[6px] ml-2 inline-flex items-center">
                              {sortOrder === "asc" ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  <th className=" sticky -right-1 z-10 bg-gray-100 border-l-2 border-gray-300 h-14 w-[119px] px-2 py-2 text-center items-center justify-center text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((row) => {
                  return (
                    <tr key={row.id} className="hover:bg-gray-50    ">
                      {/* <td className="sticky left-[-0.5px] pl-2 py-2 bg-gray-100 border-r-2 border-gray-300 text-gray-400 font-bold w-12">
                          {row.id}
                        </td> */}
                      {thead.slice(1).map((header, index) => {
                        if (selectedColumns.includes(header)) {
                          const cell = row.data[index];
                          const inputType = inputTypes[header];
                          let displayValue = cell;
                          // Check if the inputType is "select" and map the value to the corresponding label
                          if (inputType === "select" && options?.[header]) {
                            const option = (
                              options[header] as {
                                value: string;
                                label: string;
                              }[]
                            ).find((opt) => opt.value == cell);
                            displayValue = option ? option.label : cell;
                          }

                          if (
                            inputType === "date-time" ||
                            inputType === "date-time-group"
                          ) {
                            displayValue = formatDateTime22(cell, dateformat); // Use the desired format here
                          }
                          if (inputType === "date") {
                            displayValue = formatDateTime22(
                              cell,
                              dateformat
                            )?.split(" ")[0]; // Use the desired format here
                          }
                          // Determine text color based on the cell value
                          const textColorClass = (() => {
                            if (displayValue == "Completed")
                              return "text-blue-800  font-bold";
                            if (
                              displayValue == "Not Completed" ||
                              displayValue == "NotCompleted"
                            )
                              return "text-orange-500  font-bold";
                            if (
                              displayValue == "Completed Not Approved" ||
                              displayValue == "CompletedNotApproved"
                            )
                              return "text-red-600  font-bold";
                            return "";
                          })();

                          return (
                            <td
                              key={index}
                              className={`px-4 truncate py-4 ${textColorClass}`}
                            >
                              {typeof displayValue === "boolean" ? (
                                <input
                                  type="checkbox"
                                  checked={displayValue}
                                  readOnly
                                />
                              ) : (
                                displayValue
                              )}
                            </td>
                          );
                        }
                        return null;
                      })}
                      <td className="sticky -right-1 z-10 bg-gray-100 border-l-2 border-gray-300  px-1 py-2 text-center items-center justify-end ">
                        <div className="flex justify-around">
                          <button
                            onClick={() => handleEditClick(row)}
                            className="inline-block rounded-full px-2 py-2 text-xl font-medium text-gray-300 hover:bg-gray-50 hover:text-blue-200 transition duration-300"
                          >
                            {rowModeBaseOnColumnIndex ? (
                              mode !== "view" &&
                              row.data?.[rowModeBaseOnColumnIndex] == 1 ? (
                                <Pencil size={18} />
                              ) : (
                                <Eye size={18} />
                              )
                            ) : mode !== "view" ? (
                              <Pencil size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                          {rowModeBaseOnColumnIndex
                            ? mode !== "view" &&
                              row.data?.[rowModeBaseOnColumnIndex] == 1 && (
                                <button
                                  disabled={mode === "view"}
                                  onClick={() => {
                                    setConfirmationModalOpen(true);
                                    setEditRow(row);
                                  }}
                                  className="inline-block rounded-full px-2 py-2 text-xs font-medium text-gray-300 hover:bg-gray-50 hover:text-red-400 transition duration-300"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )
                            : mode !== "view" && (
                                <button
                                  disabled={mode === "view"}
                                  onClick={() => {
                                    setConfirmationModalOpen(true);
                                    setEditRow(row);
                                  }}
                                  className="inline-block rounded-full px-2 py-2 text-xs font-medium text-gray-300 hover:bg-gray-50 hover:text-red-400 transition duration-300"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {ConfirmationModalOpen && (
              <ConfirmationModal
                text="Click confirm to delete the row."
                onConfirm={() => {
                  handleConfirmation(), setEditRow(null);
                }}
                onCancel={() => {
                  handleCancelConfirmation(), setEditRow(null);
                }}
              />
            )}
          </div>
          {activeTab === "form" && (
            <div className="fixed  overflow-auto inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="relative bg-white rounded-sm p-2 w-4/5 h-[600px] border-4 border-gray-300  overflow-auto">
                <div className="w-full sticky top-0 text-end">
                  <button
                    onClick={() => setActiveTab("table")}
                    className=" pt-2  font-extrabold text-xl  text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>

                <Form
                  rowModeBaseOnColumnIndex={
                    rowModeBaseOnColumnIndex == undefined
                      ? undefined
                      : typeof rowModeBaseOnColumnIndex == "number" &&
                        editRow?.data[rowModeBaseOnColumnIndex] == 1
                      ? true
                      : false
                  }
                  changeFieldTypeBasedOnSelect={changeFieldTypeBasedOnSelect}
                  hiddenFieldBaseOnSelectOption={hiddenFieldBaseOnSelectOption}
                  FieldRequiredBaseOnSelectOption={
                    FieldRequiredBaseOnSelectOption
                  }
                  FieldsrequiredBaseOnFromToDate={
                    FieldsrequiredBaseOnFromToDate
                  }
                  requiredFields={requiredFields}
                  dateformat={dateformat}
                  mode={mode}
                  columns={thead.slice(1)}
                  initialData={editRow ? editRow.data : []}
                  onSubmit={handleFormSubmit}
                  options={options}
                  defaultValues={defaultValues}
                  labels={labels}
                  placeholders={placeholders}
                  onCancel={() => {
                    setActiveTab("table");
                    setEditRow(null);
                  }}
                  inputTypes={inputTypes}
                  disabledInputs={disabledInput}
                  editRow={editRow}
                  onAddNewClick={handleAddNewClick}
                  sections={section}
                  phrases={phrases}
                  defaultnestedtables={defaultnestedtables}
                  nestedTables={editRow?.nestedTables || []}
                  // Extract the tables array from row.data} // Extract the tables array from row.data
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Table;
