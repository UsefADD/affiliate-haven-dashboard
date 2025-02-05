
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
        <Section>
          <Heading style={h1}>Application Update</Heading>
          <Text style={text}>Dear {name},</Text>
          <Text style={text}>
            Thank you for your interest in joining the ClixAgent Partner Program. We have carefully reviewed your application, and we regret to inform you that we are unable to accept your application at this time.
          </Text>
          
          <Text style={text}>
            While we appreciate your interest in partnering with us, we have to be selective in our approval process to maintain the quality and standards of our affiliate program.
          </Text>

          <Hr style={hr} />
          
          <Text style={text}>
            You are welcome to apply again in the future if your circumstances change. Some factors that we consider in our evaluation include:
          </Text>
          
          <ul style={list}>
            <li>Marketing experience and track record</li>
            <li>Quality of traffic sources</li>
            <li>Alignment with our target market</li>
            <li>Compliance with our terms and conditions</li>
          </ul>

          <Text style={text}>
            We wish you the best in your future endeavors.
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
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
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
}

const footer = {
  color: "#666",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "32px 0 0",
}

