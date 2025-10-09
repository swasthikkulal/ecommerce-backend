const nodemailer = require('nodemailer');

const sendPurchaseMail = async (userEmail, receipt, price) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.ADMIN_EMAIL, // your Gmail
                pass: process.env.ADMIN_PASS,  // app password (not Gmail password)
            },
        });

        const mailOptions = {
            from: `"E-Commerce" <${process.env.ADMIN_EMAIL}>`,
            to: process.env.ADMIN_EMAIL, // admin receives the email
            subject: "🧾 New Order Received!",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #4CAF50;">New Purchase Alert 🚀</h2>
          <p><strong>User Email:</strong> ${userEmail}</p>
          <p><strong>Receipt Number:</strong> ${receipt}</p>
          <p><strong>Total Amount:</strong> ₹${(price / 100).toFixed(2)}</p>
          <p>Check your admin dashboard for more details.</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent to admin successfully!");
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};

module.exports = { sendPurchaseMail };
