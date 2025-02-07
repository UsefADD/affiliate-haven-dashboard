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
    <Preview>Payment Confirmation from ClixAgent</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandText}>ClixAgent</Text>
        </Section>
        
        <Section style={content}>
          <Heading style={h1}>Payment Confirmation</Heading>
          <Text style={text}>Dear {name},</Text>
          <Text style={text}>
            We are pleased to inform you that ClixAgent has successfully processed a payment to your account.
          </Text>
          
          <Section style={paymentBox}>
            <Text style={amountText}>Payment Amount: ${amount.toFixed(2)}</Text>
          </Section>

          <Text style={text}>
            The payment has been initiated and should be reflected in your account according to your selected payment method's processing time.
          </Text>

          <Hr style={hr} />
          
          <Text style={text}>
            If you have any questions about this payment, please don't hesitate to contact your account manager or our support team.
          </Text>

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
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  marginBottom: "64px",
  borderRadius: "5px",
  overflow: "hidden",
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
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  padding: "0",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
}

const paymentBox = {
  backgroundColor: "#f8fafc",
  padding: "24px",
  borderRadius: "8px",
  margin: "24px 0",
  border: "1px solid #e2e8f0",
  textAlign: "center" as const,
}

const amountText = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#10B981",
  margin: "0",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
}

const footer = {
  color: "#666",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "32px 0 0",
}