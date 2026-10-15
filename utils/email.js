import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "Fashionero <noreply@fashionero.com>";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const sendResetEmail = async (to, token) => {
  const link = `${CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Reset Your Password — Fashionero",
    html: `
      <div style="font-family:'Nunito',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f7f6f4;border-radius:12px">
        <h2 style="color:#1a1a1a;margin:0 0 16px">Password Reset</h2>
        <p style="color:#4b5563;line-height:1.6">
          We received a request to reset the password for your Fashionero account. Click the button below to set a new password. This link expires in 1 hour.
        </p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:linear-gradient(135deg,#6B705C,#3A3D34);color:#fff;text-decoration:none;border-radius:100px;font-weight:700">Reset Password</a>
        <p style="color:#9ca3af;font-size:13px">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

export const sendReceiptEmail = async (to, order, items, address) => {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:center">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right">₦${Number(item.price).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Order Confirmed — #${String(order._id).slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:'Nunito',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f7f6f4;border-radius:12px">
        <h2 style="color:#1a1a1a;margin:0 0 4px">Thank you for your order!</h2>
        <p style="color:#6b7280;margin:0 0 24px">Order #${String(order._id).slice(-8).toUpperCase()}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr style="background:#e5e5e5">
              <th style="padding:8px 12px;text-align:left">Item</th>
              <th style="padding:8px 12px;text-align:center">Qty</th>
              <th style="padding:8px 12px;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="text-align:right;line-height:1.8;color:#374151">
          <div>Subtotal: ₦${subtotal.toLocaleString()}</div>
          ${order.discountAmount ? `<div>Discount: -₦${Number(order.discountAmount).toLocaleString()}</div>` : ""}
          <div>Shipping: ₦${Number(order.shippingFee).toLocaleString()}</div>
          <div style="font-weight:700;font-size:18px;margin-top:4px">Total: ₦${Number(order.price).toLocaleString()}</div>
        </div>
        ${
          address
            ? `<div style="margin-top:20px;padding:16px;background:#fff;border-radius:8px">
            <strong>Shipping to:</strong><br/>
            ${address.contactName}<br/>
            ${address.address}, ${address.city}<br/>
            ${address.state}, ${address.country}<br/>
            ${address.phoneNumber}
          </div>`
            : ""
        }
        <p style="color:#9ca3af;font-size:13px;margin-top:24px">If you have any questions, reply to this email.</p>
      </div>
    `,
  });
};

export const sendNewsletterEmail = async (to, subject, body) => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html: `
      <div style="font-family:'Nunito',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f7f6f4;border-radius:12px">
        <h2 style="color:#1a1a1a;margin:0 0 16px">${subject}</h2>
        <div style="color:#374151;line-height:1.7">${body}</div>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 16px"/>
        <p style="color:#9ca3af;font-size:12px;text-align:center">
          You are receiving this because you subscribed to the Fashionero newsletter.<br/>
          <a href="${CLIENT_URL}/unsubscribe?email=${encodeURIComponent(to)}" style="color:#9ca3af">Unsubscribe</a>
        </p>
      </div>
    `,
  });
};

export default transporter;
