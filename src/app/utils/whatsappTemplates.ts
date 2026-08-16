// Builds the body + button parameters for each of the 4 approved per-event
// WhatsApp templates. Body is always {{1}} event title, {{2}} who, {{3}}
// details; the button is a single dynamic URL param — the record id, which
// each template appends to its own fixed base URL (configured on the
// template in Meta, e.g. ".../Orders?id="), not something this app controls.
import type { WhatsAppNotification } from "../../lib/whatsapp";

export function registrationWhatsAppParams(
  fullName: string,
  email: string,
  clientId: number
): WhatsAppNotification {
  return {
    templateName: "registration_notification",
    bodyParams: ["New Client Registration", fullName, email],
    buttonParam: String(clientId),
  };
}

export function appointmentWhatsAppParams(
  firstName: string,
  lastName: string,
  appointmentName: string,
  selectedDate: string,
  requestId: number,
  isPackage: boolean = false
): WhatsAppNotification {
  return {
    templateName: "appointment_notification",
    bodyParams: [
      isPackage ? "New Package Request" : "New Appointment Request",
      `${firstName} ${lastName}`,
      `${appointmentName} — ${selectedDate}`,
    ],
    buttonParam: String(requestId),
  };
}

export function orderWhatsAppParams(
  name: string,
  lastName: string,
  orderId: number,
  itemCount: number
): WhatsAppNotification {
  return {
    templateName: "order_notification",
    bodyParams: [
      "New Order",
      `${name} ${lastName}`,
      `Order #${orderId} — ${itemCount} item${itemCount === 1 ? "" : "s"}`,
    ],
    buttonParam: String(orderId),
  };
}

export function intakeFormWhatsAppParams(
  fullName: string,
  reason: string,
  intakeFormId: number
): WhatsAppNotification {
  return {
    templateName: "intake_notification",
    bodyParams: ["New Intake Form", fullName, reason],
    buttonParam: String(intakeFormId),
  };
}
