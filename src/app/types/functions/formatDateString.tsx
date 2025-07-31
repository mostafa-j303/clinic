


export const formatDateTime22 = (date: Date | string | undefined , format: string): string | undefined => {
  if (date === undefined) return undefined;

  const formattedDate = new Date(date);

  if (isNaN(formattedDate.getTime())) return date.toString();

  const year = formattedDate.getFullYear();
  const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
  const day = String(formattedDate.getDate()).padStart(2, '0');
  
  const hours24 = formattedDate.getHours(); // Local hours
  const hours = String(hours24 % 12 || 12).padStart(2, '0');
  const minutes = String(formattedDate.getMinutes()).padStart(2, '0');
  const amPm = hours24 < 12 ? 'AM' : 'PM';

  const timeString = hours24 === 0 && formattedDate.getMinutes() === 0
    ? ''
    : `${hours}:${minutes} ${amPm}`;

  if (format === 'YYYY/MM/DD') {
    return `${year}/${month}/${day} ${timeString}`.trim();
  } else if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year} ${timeString}`.trim();
  }

  return date.toString();
};

export const formatDateForInput22 = (date: Date, type: 'datetime-local' | 'date'): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return ''; // Return an empty string for invalid dates
  }

  // Use local time for input display
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (type === 'datetime-local') {
    const hours = String(date.getHours()).padStart(2, '0');
    // const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } else if (type === 'date') {
    return `${year}-${month}-${day}`;
  }

  return ''; // Default case, though this should not happen
};

export const parseInputDate22 = (value: string, type: 'datetime-local' | 'date'): Date | null => {
  if (!value) return null;

  // For 'datetime-local'
  if (type === 'datetime-local') {
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  // For 'date'
  if (type === 'date') {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return null;
};

export function formatDateSubmit22(date: string): string {
  const formattedDate = new Date(date);

  if (isNaN(formattedDate.getTime())) return date; // Return original date if invalid

  // Extract year, month, day, hours, and minutes based on local time
  const year = formattedDate.getFullYear();
  const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
  const day = String(formattedDate.getDate()).padStart(2, "0");
  const hours = String(formattedDate.getHours()).padStart(2, "0");
  const minutes = String(formattedDate.getMinutes()).padStart(2, "0");
  const seconds = String(formattedDate.getSeconds()).padStart(2, "0");

  // Format to 'YYYY-MM-DDTHH:MM:SS'
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}