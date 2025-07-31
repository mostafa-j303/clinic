// src/app/recruitmentData.ts

export const fetchFirstTableData = async (): Promise<any[]> => {
  const response = await fetch('/api/LeaveReq/LeaveRequest');
  
  const result = await response.json();
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error);
  }
};

export const fetchGetRowData = async (endpoint:string, body:any) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};


export const mockFirstTableData = {
  inputsdata: [
    {
      LvId: 2,
      EmpId: '125',
      RequestDate: '2024-07-01',
      FromDate: '2024-07-05',
      ToDate: '2024-07-10',
      TotalDays: '5',
      LeaveId: 2,
      DeductFromId: 'B1',
      UnPaidLeaveReason: 'Personal',
      ReplacementApprovedBy: 'Manager A',
      ReplacementEmpId: '456',
      Status: 'Approved',
      HrStatus: 'Processed',
      CompanyProfileId: 'XYZ',
      PayId: 'P123',
      AnnualLeaveRemain: '10',
      CreateDate: '2024-06-30',
      HostComputer: 'CompA',
      Generated: true,
      GeneratedDesc: 'Auto',
      GeneratedYear: '2024',
      GeneratedMonth: '07',
      
      // Personal info
      EmpName: "mostafa jarjour",
      CompName: "GSV",
      JobTitle: "developer",

      // Unpaid leave
      LeaveReason: "",
      LeaveRequestDate: "",

      // Direct manager use only
      MangerName: "ali/wael",
      Approved: false,
      DeclineReason: "",
      RemplacemnetPerson: "2",
      ApprovedDate: "",

      // HR use only
      HDRdescision: "osmat",
      HRDdeclineReason: "",
      HRDApproved: true,
      HRDdate: "",

     
    },
  ],
};

  // Add more mock data objects as needed