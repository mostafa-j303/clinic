// pages/recruitment.tsx
// xF4TKzzTwnnPv2ojniNuWw==
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchFirstTableData,
  fetchGetRowData,
  mockFirstTableData,
} from "./recruitmentData"; // Adjust the path as needed
import Table from "@/app/types/table";
import Alert from "../_components/Alert";

const RecruitmentPage: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [initialTableData, setInitialTableData] = useState<
    {
      id: number;
      data: (string | boolean | number)[];
      nestedTables?: any;
      phrases?: any;
    }[]
  >([]); // Store the initial data
  const [firstTableData, setFirstTableData] = useState<
    {
      id: number;
      data: (string | boolean | number)[];
      nestedTables?: any;
      phrases?: any;
    }[]
  >([]);
  const [thead, setThead] = useState<string[]>([
    "LvId",

    "EmpId",
    "EmpName",
    "RequestDate",
    "FromDate",
    "ToDate",
    "TotalDays",
    "Attachments",
    "LeaveId",
    "HrStatus",
    "Status",

    "DeductFromId",
    "UnPaidLeaveReason",
    "ReplacementApprovedBy",
    "ReplacementEmpId",
    "CompanyProfileId",
    "PayId",
    "BaseAnnualLeaveRemain",
    "CreateDate",
    "HostComputer",
    "Generated",
    "GeneratedDesc",
    "GeneratedYear",
    "GeneratedMonth",
    //personla info
    "CompName",
    "JobTitle",

    //un Paid

    //Direct manger use only
    "MangerId",
    "MangerName",
    "Approved",
    "DeclineReason",
    "ApprovedDate",

    //HR use only
    "HRDId",
    "HRDName",
    "HRDdeclineReason",
    "HRDApproved",
    "HRDdate",
  ]); // Initialize with your headers

  const [options, setOptions] = useState({});
  const [AnnualLeaveRemain, setAnnualLeaveRemain] = useState();
  const [editRow, setEditRow] = useState<{
    [key: string]: string | boolean | number | any;
  } | null>(null);

  const data =  null;

  const fetchFirstTable = useCallback(async () => {
    try {
      
      const data: any = await fetchFirstTableData(
       
      );
      setAnnualLeaveRemain(data.annualLeavesRemaining[0][""]);
      // Map leaveIdList to options.LeaveId
      const mappedOptions = data.leaveIdList.map((leave: any) => ({
        value: leave.LeaveId,
        label: leave.LeaveName,
      }));
      setOptions({
        Approved: [
          { value: true, label: "Approved" },
          { value: false, label: "Decline" },
        ],
        HRDApproved: [
          { value: true, label: "Approved" },
          { value: false, label: "Decline" },
        ],
        HrStatus: [
          { value: "", label: "" },
          { value: 1, label: "NotCompleted" },
          { value: 2, label: "Completed" },
          { value: 3, label: "Completed Not Approved" },
        ],
        LeaveId: [{ value: "", label: "Select your leave" }, ...mappedOptions],
      });

      return {
        thead,
        tbody: data.empLeaves.map((item: any, index: number) => ({
          id: index,
          data: [
            item.LvId,
            item.EmpId,
            item.EmpFullName, //secondary
            item.RequestDate,
            item.FromDate,
            item.ToDate,
            item.TotalDays,
            item.Attachments,
            item.LeaveId,
            item.HrStatus,
            item.Status,
            item.DeductFromId,
            item.UnPaidLeaveReason,
            item.ReplacementApprovedBy,
            item.ReplacementEmpId,
            item.CompanyProfileId,
            item.PayId,
            // data.annualLeavesRemaining[0][""],
            item.BaseAnnualLeaveRemain, //secondary
            item.CreateDate,
            item.HostComputer,
            item.Generated,
            item.GeneratedDesc,
            item.GeneratedYear,
            item.GeneratedMonth,

            item.CompName,
            // position.Position,
            item.Position, //secondary
            item.MangerId,
            item.MangerName, //secondary
            item.Approved,
            item.DeclineReason,
            item.ApprovedDate,

            item.HRDId,
            item.HRDName,
            item.HRDdeclineReason,
            item.HRDApproved,
            item.HRDdate,
          ],
        })),
      };
    } catch (error) {
      console.error("Error in fetchFirstTable:", error);
      // Handle or display the error as needed
      return { thead, tbody: [] }; // Return an empty table on error
    }
  }, [thead]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFirstTable();
      setFirstTableData(data.tbody);
      setInitialTableData(data.tbody); // Save the initial data
      console.log(data.tbody);
    };
    fetchData();
   }, [fetchFirstTable])

  const fetchLeaveData = async (row: any) => {
    try {
      const apiResponse = await fetchGetRowData("/api/LeaveReq/GetRowData", {
       
      });
      if (apiResponse) {
        setEditRow(apiResponse);
        return apiResponse;
      } else {
        return null;
      }
    } catch (error) {
      return null; // Optionally return null or handle the error differently
    }
  };

  const handleAddFirstTableRow = async (
    newData: (string | boolean | number)[],
    nestedTableUpdates: { [title: string]: any[] }
  ) => {
    const newId = firstTableData.length
      ? firstTableData[firstTableData.length - 1].id + 1
      : 0;

    // Create a new row with padded data
    const paddedData = [...newData];
    while (paddedData.length < thead.length) {
      paddedData.push("");
    }

    // Create the new row with the merged nested tables
    const newRow = {
      id: newId,
      data: paddedData,
    };
    // Prepare the data to send to the server
    const queryData = thead.reduce((acc: any, key, index) => {
      acc[key] = paddedData[index];
      return acc;
    }, {} as Record<string, string>);

    console.log("For add query:", queryData);

    try {
      // Send the add request to the server
      const response = await fetch("/api/LeaveReq/AddRowData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newRow: queryData,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();

        // Update the table data with the new row
        setFirstTableData((prevData) => [
          ...prevData,
          {
            ...newRow,
            nestedTables: responseData.nestedTables, // Update nestedTables with the server's response
          },
        ]);

        console.log("Row successfully added:", responseData);

        // Call handleRefresh to fetch the updated data
        handleRefresh();
      } else {
        console.error("Failed to add row:", response.statusText);
        setAlertMessage(
          "Failed to add the row: The query did not complete successfully."
        );
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error adding row:", error);
      setAlertMessage(
        "An error occurred while adding the row. Please try again."
      );
      setShowAlert(true);
    }
  };

  const handleEditFirstTableRow = useCallback(
    async (
      id: number,
      updatedData: (string | boolean | number)[]
    ): Promise<void> => {
      const queryData = thead.reduce((acc: any, key, index) => {
        acc[key] = updatedData[index];
        return acc;
      }, {} as Record<string, string>);
      console.log("for edit qurery  :", queryData);
      setFirstTableData((prevFirstTableData) =>
        prevFirstTableData.map((row) => {
          if (row.id === id) {
            const updatedRow = { ...row, data: updatedData };
            return { ...updatedRow, nestedTables: row.nestedTables };
          }
          return row;
        })
      );
      try {
        // Send the update request to the server with `queryData` in the request body
        const response = await fetch("/api/LeaveReq/UpdateRowData", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            updatedRow: queryData,
          }),
        });

        // Check if the response is successful
        if (response.ok) {
          const responseData = await response.json();

          // Update the table data with the new `nestedTables` from the response
          setFirstTableData((prevFirstTableData) =>
            prevFirstTableData.map((row) => {
              if (row.id === id) {
                return {
                  ...row,
                  data: updatedData,
                  nestedTables: responseData.nestedTables,
                };
              }
              return row;
            })
          );
          handleRefresh()
        } else {
          // Show an alert if the request was unsuccessful
          console.error("Failed to update row:", response.statusText);
          setAlertMessage(
            "Failed to update the row: The query did not complete successfully."
          );
          setShowAlert(true);
        }
      } catch (error) {
        // Handle any network or server errors
        console.error("Error updating row:", error);
        setAlertMessage(
          "An error occurred while updating the row. Please try again."
        );
        setShowAlert(true);
      }
    },
    [] // Remove firstTableData from dependencies
  );

  const handleDeleteFirstTableRow = async (id: number | undefined) => {
    // Find the row data you want to delete by using the row's data[0]
    const rowToDelete = firstTableData.find((row) => row.id === id);
    if (!rowToDelete) {
      console.error("Row not found");
      return;
    }
    const rowLvID = rowToDelete.data[0]; // Use the first value in data
    console.log("Deleting row with data[0]:", rowLvID);
    try {
      // Send the delete request to the server, using rowDataToDelete instead of row.id
      const response = await fetch('/api/LeaveReq/DeleteRowData', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rowID: rowLvID, // Send row.data[0] as the ID
        }),
      });
      if (response.ok) {
        console.log("Row successfully deleted");
        // Remove the deleted row from the state
        const newData = firstTableData.filter((row) => row.id !== id);
        setFirstTableData(newData);
      } else {
        console.error('Failed to delete row:', response.statusText);
        setAlertMessage('Failed to delete the row: The query did not complete successfully.');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      setAlertMessage('An error occurred while deleting the row. Please try again.');
      setShowAlert(true);
    }
  };
  
 ;

  const handleRefresh = () => {
    const fetchData = async () => {
      const data = await fetchFirstTable();
      setFirstTableData(data.tbody);
    };
    fetchData();
  };

  const inputTypes = {
    LvId: "text",
    EmpId: "text",
    RequestDate: "date",
    FromDate: "date-time-group",
    ToDate: "date-time-group",
    Attachments: "file",
    TotalDays: "number",
    LeaveId: "select",
    DeductFromId: "text",
    UnPaidLeaveReason: "textarea",
    ReplacementApprovedBy: "text",
    ReplacementEmpId: "text",
    Status: "text",
    HrStatus: "select",
    CompanyProfileId: "text",
    PayId: "text",
    BaseAnnualLeaveRemain: "number",
    CreateDate: "date-time",
    HostComputer: "text",
    Generated: "checkbox",
    GeneratedDesc: "text",
    GeneratedYear: "text",
    GeneratedMonth: "number",

    //personla info
    EmpName: "text",
    CompName: "text",
    JobTitle: "text",
    //un Paid
    //Direct manger use only
    MangerName: "text",
    Approved: "switch",
    DeclineReason: "textarea",
    ApprovedDate: "date",
    //HR use only
    HRDName: "text",
    HRDdeclineReason: "textarea",
    HRDApproved: "switch",
    HRDdate: "date",
  };

  const disabledInputs = {
    LvId: true,
    EmpId: true,
    RequestDate: true,
    FromDate: true,
    ToDate: true,
    TotalDays: true,
    Attachments: true,
    LeaveId: true,
    DeductFromId: true,
    UnPaidLeaveReason: true,
    ReplacementApprovedBy: true,
    ReplacementEmpId: true,
    Status: true,
    HrStatus: true,
    CompanyProfileId: true,
    PayId: true,
    BaseAnnualLeaveRemain: true,
    CreateDate: true,
    HostComputer: true,
    Generated: true,
    GeneratedDesc: true,
    GeneratedYear: true,
    GeneratedMonth: true,
    //personla info
    EmpName: true,
    CompName: true,
    JobTitle: true,
    //un Paid
    //Direct manger use only
    MangerName: true,
    Approved: true,
    DeclineReason: true,
    ApprovedDate: true,
    //HR use only
    HRDName: true,
    HRDdeclineReason: true,
    HRDApproved: true,
    HRDdate: true,
  };
  
  const sections = [
    {
      enabled: false,
      title: "Personal info",
      fields: ["EmpName", "CompName", "JobTitle", "BaseAnnualLeaveRemain"],
    },
    {
      enabled: false,
      title: "Reason For Leave Request",
      fields: ["LeaveId", "Attachments", "FromDate", "", "TotalDays"],
    },
    {
      enabled: false,
      title: "Un Paid or Other Leave Reason",
      fields: ["UnPaidLeaveReason", "RequestDate"],
    },

    {
      enabled: false,
      title: "For Direct Manager Use Only",
      fields: [
        "MangerName",
        "Approved",
        "DeclineReason",
        "ReplacementEmpId",
        "ApprovedDate",
      ],
    },
    {
      enabled: false,
      title: "For HR Use Only",
      fields: ["HRDName", "HRDdeclineReason", "HRDApproved", "HRDdate"],
    },
  ];
  
  const defaultaddSectionsAndDisabledInputs = {
    sections: [
      {
        enabled: false,
        title: "Personal info",
        fields: ["EmpName", "CompName", "JobTitle", "BaseAnnualLeaveRemain"],
      },
      {
        enabled: true,
        title: "Reason For Leave Request",
        fields: ["LeaveId", "Attachments", "FromDate", "TotalDays"],
      },
      {
        enabled: true,
        title: "Un Paid or Other Leave Reason",
        fields: ["UnPaidLeaveReason", "RequestDate"],
      },
      {
        enabled: false,
        title: "For Direct Manager Use Only",
        fields: [
          "MangerName",
          "Approved",
          "DeclineReason",
          "ReplacementEmpId",
          "ApprovedDate",
        ],
      },
      {
        enabled: false,
        title: "For HR Use Only",
        fields: ["HRDName", "HRDdeclineReason", "HRDApproved", "HRDdate"],
      },
    ],
    disabledInputs: {
      RequestDate: false,
      FromDate: false,
      ToDate: false,
      TotalDays: false,
      Attachments: false,
      LeaveId: false,
      UnPaidLeaveReason: false,
      Approved: true,
      DeclineReason: true,
      ApprovedDate: true,
      ReplacementEmpId: true,
      HRDdeclineReason: true,
      HRDApproved: true,
      HRDdate: true,
      EmpName: true,
      CompName: true,
      JobTitle: true,
    },
  };
  const defaultValues = {
    EmpId: '',
    EmpName: ``,
    CompName: ``,
    MangerName: ``,
    HRDName: ``,
    JobTitle: '',
    BaseAnnualLeaveRemain: AnnualLeaveRemain,
    TotalDays: 0,
    FromDate: new Date().toISOString(),
    ToDate: new Date().toISOString(),
    RequestDate: new Date().toISOString().split("T")[0],
    ApprovedDate: new Date().toISOString().split("T")[0],
    HRDdate: new Date().toISOString().split("T")[0],
  };
  const labels = {
    LeaveId: "Leave Type",
    TotalDays: "Total Days",
    //personla info
    EmpName: "Emp Name",
    CompName: "Company/Department",
    JobTitle: "Job Title",
    BaseAnnualLeaveRemain: "Annual Leave Remain",
    //un Paid
    UnPaidLeaveReason: "Leave Reason",
    RequestDate: "Leave Request Date",
    //Direct manger use only
    MangerName: "Manger Name",
    ReplacementEmpId: "Replacement Person (ID)",
    ApprovedDate: "Approved Date",
    //HR use only
    HRDName: "HDR Name",
    HRDdeclineReason: "HRD decline Reason",
    HRDApproved: "HRD Approved",
    HRDdate: "HRD date",
  };
  const headLable = {
    EmpId: "EmpID",
    EmpName: "Name",
    FromDate: "From",
    ToDate: "To",
    RequestDate: "Date",
    LeaveId: "LeaveType",
  };
  const placeholders = { LeaveId: "Enter your Leave ID" };

  const requiredFields = ["LeaveId", "FromDate", "ToDate" ,"TotalDays"];

  const hiddenFieldBaseOnSelectOption = [
    {
      selectFieldName: "LeaveId",
      options: [
        "24",
        "2",
        "12",
        "13",
        "11",
        "5",
        "8",
        "23",
        "17",
        "16",
        "4",
        "14",
        "7",
        "21",
        "20",
        "1",
        "6",
      ],
      hiddenField: "BaseAnnualLeaveRemain",
    },
    {
      selectFieldName: "LeaveId",
      options: ["17", "16", "4", "14"],
      hiddenField: "TotalDays",
    },
    {
      selectFieldName: "LeaveId",
      options: ['3',"24", '2', '12', '13', '11', '5', '8', '23', '17', '16', '4', '14', '7', '21', '20','6'],
      hiddenField: "Attachments",
    },
    // Add more fields and their configurations as needed
  ];
  const changeFieldTypeBasedOnSelect = [
    {
      selectFieldName: "LeaveId",
      option: "3",
      fieldName: "TotalDays",
      newType: "des-number",
    },
  ];
  const fieldRequiredBaseOnSelect = [
    {
      selectFieldName: "LeaveId",
      options: ["1"],
      requiredFields: ["Attachments"],
    },
  ];

  return (
    <div>
      {showAlert && (
        <Alert value={alertMessage} onClose={() => setShowAlert(false)} />
      )}
      <div className="px-1 pt-0">
        <Table
          rowModeBaseOnColumnIndex={9}
          defaultaddSectionsAndDisabledInputs={
            defaultaddSectionsAndDisabledInputs
          }
          fetchGetRowData={fetchLeaveData}
          selectedColumns={[
            "EmpId",
            "EmpName",
            "RequestDate",
            "FromDate",
            "ToDate",
            "TotalDays",
            "LeaveId",
            "HrStatus",
          ]}
          FieldRequiredBaseOnSelectOption={fieldRequiredBaseOnSelect}
          changeFieldTypeBasedOnSelect={changeFieldTypeBasedOnSelect}
          hiddenFieldBaseOnSelectOption={hiddenFieldBaseOnSelectOption}
          FieldsrequiredBaseOnFromToDate={["Attachments"]}
          requiredFields={requiredFields}
          selectFilter="HrStatus"
          selectFilter2="LeaveId"
          dateColumn="RequestDate"
          headLable={headLable}
          dateformat={""}
          case="tabs"
          fetchData={fetchFirstTable}
          handleRefresh={handleRefresh}
          onAdd={handleAddFirstTableRow}
          onEdit={handleEditFirstTableRow}
          onDelete={handleDeleteFirstTableRow}
          data={firstTableData}
          inputTypes={inputTypes}
          disabledInputs={disabledInputs}
          sections={sections}
          options={options}
          defaultValues={defaultValues}
          labels={labels}
          placeholders={placeholders}
          //for the input constractore
        />
      </div>
    </div>
  );
};

export default RecruitmentPage;
