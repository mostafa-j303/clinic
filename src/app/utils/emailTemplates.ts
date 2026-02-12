/**
 * Email Template Utilities
 * Generates formatted HTML email content for orders and appointments
 */

export interface OrderEmailData {
  customerName: string;
  customerPhone: string;
  address: string;
  items: Array<{
    name: string;
    price: string;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  paymentMethod: string;
  orderDate?: string;
}

export interface AppointmentEmailData {
  customerName: string;
  customerPhone: string;
  appointmentName: string;
  appointmentDate: string;
  price: string;
  paymentMethod: string;
  bookingDate?: string;
}

/**
 * Generate order confirmation email HTML
 */
export function generateOrderEmailHTML(data: OrderEmailData): string {
  const orderDate = data.orderDate || new Date().toLocaleDateString();
  
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.price}
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 12px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 8px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: 600;
          color: #555;
        }
        .info-value {
          color: #333;
          text-align: right;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f0f0f0;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #2563eb;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .summary {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 5px;
          margin-top: 15px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .summary-row.total {
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
          border-top: 2px solid #2563eb;
          padding-top: 12px;
          margin-top: 12px;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        .status-badge {
          display: inline-block;
          background-color: #10b981;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Order Confirmed</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your order!</p>
        </div>

        <div class="content">
          <!-- Customer Info -->
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${data.customerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${data.customerPhone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Delivery Address:</span>
              <span class="info-value" style="text-align: right; max-width: 50%;">${data.address}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Order Date:</span>
              <span class="info-value">${orderDate}</span>
            </div>
          </div>

          <!-- Order Items -->
          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <!-- Payment Summary -->
          <div class="section">
            <div class="section-title">Payment Summary</div>
            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <strong>$${data.subtotal.toFixed(2)}</strong>
              </div>
              <div class="summary-row">
                <span>Discount:</span>
                <strong style="color: #ef4444;">-$${data.discount.toFixed(2)}</strong>
              </div>
              <div class="summary-row">
                <span>Delivery:</span>
                <strong>$${data.delivery.toFixed(2)}</strong>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <strong style="color: #2563eb;">$${data.total.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="section">
            <div class="section-title">Payment Method</div>
            <div class="info-row">
              <span class="info-label">Method:</span>
              <span class="info-value">${data.paymentMethod}</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              ✓ Your order has been received and will be confirmed via WhatsApp
            </p>
            <div class="status-badge">Status: Pending Confirmation</div>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 8px 0 0 0;">For support, contact us via WhatsApp or phone.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate appointment confirmation email HTML
 */
export function generateAppointmentEmailHTML(data: AppointmentEmailData): string {
  const bookingDate = data.bookingDate || new Date().toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Booking Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 12px;
          border-bottom: 2px solid #8b5cf6;
          padding-bottom: 8px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: 600;
          color: #555;
        }
        .info-value {
          color: #333;
          text-align: right;
          font-weight: 500;
        }
        .appointment-card {
          background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
          border-left: 4px solid #8b5cf6;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .appointment-card .label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .appointment-card .value {
          font-size: 18px;
          font-weight: bold;
          color: #8b5cf6;
          margin-top: 4px;
        }
        .price-section {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 5px;
          text-align: center;
        }
        .price-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        .price-value {
          font-size: 28px;
          font-weight: bold;
          color: #8b5cf6;
          margin-top: 5px;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        .status-badge {
          display: inline-block;
          background-color: #8b5cf6;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Appointment Booked</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your booking request has been received</p>
        </div>

        <div class="content">
          <!-- Booking Details -->
          <div class="section">
            <div class="section-title">Booking Details</div>
            <div class="appointment-card">
              <div class="label">Service</div>
              <div class="value">${data.appointmentName}</div>
            </div>
            <div class="appointment-card">
              <div class="label">Scheduled Date</div>
              <div class="value">${data.appointmentDate}</div>
            </div>
          </div>

          <!-- Customer Information -->
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${data.customerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${data.customerPhone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Booking Date:</span>
              <span class="info-value">${bookingDate}</span>
            </div>
          </div>

          <!-- Price Information -->
          <div class="section">
            <div class="price-section">
              <div class="price-label">Service Price</div>
              <div class="price-value">${data.price}</div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span class="info-value">${data.paymentMethod}</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              ✓ Your appointment booking has been received and will be confirmed via WhatsApp
            </p>
            <div class="status-badge">Status: Pending Confirmation</div>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 8px 0 0 0;">For support, contact us via WhatsApp or phone.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}