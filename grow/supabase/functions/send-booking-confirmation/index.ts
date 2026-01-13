import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  email: string;
  bookingNumber: string;
  customerName: string;
  packageName: string;
  travelDate: string;
  numberOfTravelers: number;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-booking-confirmation function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      bookingNumber,
      customerName,
      packageName,
      travelDate,
      numberOfTravelers,
      totalAmount,
    }: BookingConfirmationRequest = await req.json();

    console.log(`Sending booking confirmation to ${email} for booking ${bookingNumber}`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${customerName}!</h2>
            
            <p style="font-size: 16px; color: #555;">
              Great news! Your travel booking has been confirmed. Here are your booking details:
            </p>
            
            <div style="background: #f7f7f7; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Booking Number:</td>
                  <td style="padding: 8px 0; color: #333; text-align: right; font-family: 'Courier New', monospace;">${bookingNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Package:</td>
                  <td style="padding: 8px 0; color: #333; text-align: right;">${packageName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Travel Date:</td>
                  <td style="padding: 8px 0; color: #333; text-align: right;">${new Date(travelDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Travelers:</td>
                  <td style="padding: 8px 0; color: #333; text-align: right;">${numberOfTravelers} ${numberOfTravelers === 1 ? 'person' : 'people'}</td>
                </tr>
                <tr style="border-top: 2px solid #667eea;">
                  <td style="padding: 12px 0 0 0; color: #667eea; font-weight: bold; font-size: 18px;">Total Amount:</td>
                  <td style="padding: 12px 0 0 0; color: #667eea; font-weight: bold; font-size: 18px; text-align: right;">$${totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 14px; color: #555; background: #e8f4fd; padding: 15px; border-radius: 6px; border-left: 3px solid #2196F3;">
              <strong>📧 Next Steps:</strong> You will receive your detailed itinerary and travel documents within 24 hours. Please check your spam folder if you don't see it in your inbox.
            </p>
            
            <p style="font-size: 14px; color: #555; margin-top: 25px;">
              If you have any questions about your booking, please don't hesitate to contact us.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 14px; color: #888; margin: 5px 0;">Safe travels!</p>
              <p style="font-size: 14px; color: #888; margin: 5px 0;"><strong>The Travel Agency CRM Team</strong></p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Travel Agency CRM. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Travel Agency CRM <bookings@resend.dev>",
      to: [email],
      subject: `Booking Confirmed - ${bookingNumber}`,
      html: htmlContent,
    });

    console.log("Booking confirmation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
