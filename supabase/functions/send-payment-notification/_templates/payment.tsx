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
    <Preview>ClixAgent Submitted a payment to you - ${amount.toFixed(2)} has been processed! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandText}>ClixAgent</Text>
        </Section>
        
        <Section style={content}>
          <Heading style={h1}>Your funds are on the way</Heading>
          <Text style={greeting}>Dear {name},</Text>
          
          <Section style={paymentBox}>
            <Text style={amountLabel}>Payment Amount</Text>
            <Text style={amountText}>${amount.toFixed(2)}</Text>
            <Text style={statusText}>✨ Successfully Processed ✨</Text>
          </Section>

          <Text style={messageText}>
            Thank you for being a valued affiliate partner with ClixAgent! Your dedication and performance continue to impress us, and we're excited to see your success grow. Keep up the excellent work - there's no limit to what we can achieve together!
          </Text>

          <Text style={text}>
            Your payment has been processed and should be reflected in your account according to your selected payment method's processing time.
          </Text>

          <Hr style={hr} />
          
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
  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  padding: "40px 0",
  textAlign: "center" as const,
}

const brandText = {
  color: "#ffffff",
  fontSize: "42px",
  fontWeight: "bold",
  margin: 0,
  letterSpacing: "1px",
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
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

const greeting = {
  fontSize: "18px",
  color: "#4a4a4a",
  marginBottom: "24px",
}

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
}

const messageText = {
  color: "#10B981",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "24px 0",
  padding: "20px",
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  borderLeft: "4px solid #10B981",
}

const paymentBox = {
  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
  padding: "32px",
  borderRadius: "12px",
  margin: "32px 0",
  border: "1px solid #86efac",
  textAlign: "center" as const,
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
}

const amountLabel = {
  fontSize: "16px",
  color: "#059669",
  margin: "0 0 8px",
  fontWeight: "500",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
}

const amountText = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#059669",
  margin: "0 0 8px",
  textShadow: "1px 1px 2px rgba(5, 150, 105, 0.1)",
}

const statusText = {
  fontSize: "14px",
  color: "#059669",
  margin: 0,
  fontWeight: "500",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
}

const footer = {
  color: "#666666",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "32px 0 0",
  textAlign: "center" as const,
}