
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

interface RejectionEmailProps {
  name: string;
}

export const RejectionEmail = ({ name }: RejectionEmailProps) => (
  <Html>
    <Head />
    <Preview>Update on Your ClixAgent Partner Program Application</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandText}>ClixAgent</Text>
        </Section>
        
        <Section style={content}>
          <Heading style={h1}>Application Status Update</Heading>
          <Text style={text}>Dear {name},</Text>
          <Text style={text}>
            Thank you for your interest in joining the ClixAgent Partner Program. After careful review of your application, we regret to inform you that we are unable to accept your application at this time.
          </Text>
          
          <Text style={text}>
            The affiliate marketing landscape is constantly evolving, and our selection process takes into account various factors to ensure mutual success in our partnerships.
          </Text>

          <Hr style={hr} />
          
          <Text style={text}>
            Some key factors we consider in our evaluation include:
          </Text>
          
          <ul style={list}>
            <li style={listItem}>Marketing experience and demonstrated track record</li>
            <li style={listItem}>Quality and sustainability of traffic sources</li>
            <li style={listItem}>Alignment with our target market and business goals</li>
            <li style={listItem}>Compliance with industry regulations and our terms of service</li>
          </ul>

          <Text style={text}>
            We encourage you to continue developing your marketing expertise and consider reapplying in the future when you feel your application better aligns with our program requirements.
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
  padding: "20px 0",
  textAlign: "center" as const,
}

const brandText = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
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

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
}

const list = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  paddingLeft: "24px",
}

const listItem = {
  margin: "8px 0",
}

const footer = {
  color: "#666",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "32px 0 0",
}

