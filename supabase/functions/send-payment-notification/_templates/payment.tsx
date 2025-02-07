import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22"
import * as React from "npm:react@18.3.1"

interface PaymentEmailProps {
  name: string;
  amount: number;
}

export const PaymentEmail = ({ name, amount }: PaymentEmailProps) => (
  <Html>
    <Head />
    <Preview>Payment Confirmation from ClixAgent - ${amount.toFixed(2)} has been processed! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandText}>ClixAgent</Text>
        </Section>
        
        <Section style={content}>
          <Heading style={h1}>Payment Confirmation</Heading>
          <Text style={text}>Dear {name},</Text>
          
          <Section style={paymentBox}>
            <Text style={amountLabel}>Payment Amount</Text>
            <Text style={amountText}>${amount.toFixed(2)}</Text>
            <Text style={statusText}>Successfully Processed</Text>
          </Section>

          <Text style={text}>
            🌟 Congratulations on another successful milestone! Your dedication and performance continue to impress us, and we're thrilled to have you as a valued member of the ClixAgent family.
          </Text>

          <Text style={text}>
            Your payment has been processed and should be reflected in your account according to your selected payment method's processing time. Keep up the fantastic work - your success is our success!
          </Text>

          <Section style={statsBox}>
            <Text style={statsTitle}>Did You Know? 💡</Text>
            <Text style={statsText}>
              Top-performing affiliates like you are key to our growth. With consistent performance, you could unlock even higher commission rates and exclusive bonuses!
            </Text>
          </Section>

          <Hr style={hr} />
          
          <Text style={text}>
            Ready to take it to the next level? Check out our latest high-converting offers in your dashboard and discover new opportunities to maximize your earnings!
          </Text>

          <Section style={ctaBox}>
            <Text style={ctaText}>
              "Success is not final; failure is not fatal: it is the courage to continue that counts." - Winston Churchill
            </Text>
          </Section>

          <Text style={footer}>
            Best regards,<br />
            The ClixAgent Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  marginBottom: "64px",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
}

const header = {
  backgroundColor: "#10B981",
  padding: "40px 0",
  textAlign: "center" as const,
}

const brandText = {
  color: "#ffffff",
  fontSize: "42px",
  fontWeight: "bold",
  margin: 0,
  letterSpacing: "1px",
}

const content = {
  padding: "40px",
}

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 20px",
  padding: 0,
  textAlign: "center" as const,
}

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
}

const paymentBox = {
  backgroundColor: "#f0fdf4",
  padding: "32px",
  borderRadius: "12px",
  margin: "32px 0",
  border: "1px solid #86efac",
  textAlign: "center" as const,
}

const amountLabel = {
  fontSize: "16px",
  color: "#059669",
  margin: "0 0 8px",
  fontWeight: "500",
}

const amountText = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#059669",
  margin: "0 0 8px",
}

const statusText = {
  fontSize: "14px",
  color: "#059669",
  margin: 0,
  fontStyle: "italic",
}

const statsBox = {
  backgroundColor: "#eff6ff",
  padding: "24px",
  borderRadius: "12px",
  margin: "24px 0",
  border: "1px solid #bfdbfe",
}

const statsTitle = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1e40af",
  margin: "0 0 12px",
}

const statsText = {
  fontSize: "15px",
  color: "#1e40af",
  margin: 0,
  lineHeight: "22px",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
}

const ctaBox = {
  backgroundColor: "#fef2f2",
  padding: "24px",
  borderRadius: "12px",
  margin: "24px 0",
  border: "1px solid #fecaca",
}

const ctaText = {
  fontSize: "16px",
  color: "#991b1b",
  margin: 0,
  lineHeight: "24px",
  fontStyle: "italic",
  textAlign: "center" as const,
}

const footer = {
  color: "#666666",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "32px 0 0",
  textAlign: "center" as const,
}