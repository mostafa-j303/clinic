// Builds the 3 body parameters for the shared "new_notification" WhatsApp template:
// {{1}} event title, {{2}} who, {{3}} details.

export function registrationWhatsAppParams(fullName: string, email: string): string[] {
  return ["New Client Registration", fullName, email];
}

export function appointmentWhatsAppParams(
  firstName: string,
  lastName: string,
  appointmentName: string,
  selectedDate: string
): string[] {
  return ["New Appointment Request", `${firstName} ${lastName}`, `${appointmentName} — ${selectedDate}`];
}

export function orderWhatsAppParams(
  name: string,
  lastName: string,
  orderId: number,
  itemCount: number
): string[] {
  return [
    "New Order",
    `${name} ${lastName}`,
    `Order #${orderId} — ${itemCount} item${itemCount === 1 ? "" : "s"}`,
  ];
}

export function intakeFormWhatsAppParams(fullName: string, reason: string): string[] {
  return ["New Intake Form", fullName, reason];
}
