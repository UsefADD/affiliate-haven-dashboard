
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22"
import * as React from "npm:react@18.3.1"

interface ApprovalEmailProps {
  name: string;
  email: string;
  password: string;
}

export const ApprovalEmail = ({ name, email, password }: ApprovalEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to ClixAgent Partner Program!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
          <Heading style={h1}>Welcome to ClixAgent Partner Program!</Heading>
          <Text style={text}>Dear {name},</Text>
          <Text style={text}>
            Congratulations! We are pleased to inform you that your application to join the ClixAgent Partner Program has been approved. Welcome to our affiliate network!
          </Text>
          
          <Text style={text}>
            Your account has been created with the following credentials:
          </Text>
          
          <Section style={credentials}>
            <Text style={credentialText}>Email: {email}</Text>
            <Text style={credentialText}>Password: {password}</Text>
          </Section>

          <Text style={text}>
            For security reasons, we recommend changing your password after your first login.
          </Text>

          <Button style={button} href="https://partner.clixagent.com/login">
            Login to Your Account
          </Button>

          <Text style={text}>
            If the button above doesn't work, you can also copy and paste this link into your browser:
            <br />
            <Link href="https://partner.clixagent.com/login" style={link}>
              https://partner.clixagent.com/login
            </Link>
          </Text>

          <Hr style={hr} />
          
          <Text style={text}>
            What's next:
          </Text>
          <ul style={list}>
            <li>Log in to your account using the credentials above</li>
            <li>Complete your profile information</li>
            <li>Browse available offers</li>
            <li>Start promoting and earning!</li>
          </ul>

          <Text style={text}>
            If you need any assistance or have questions, our support team is here to help.
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

const button = {
  backgroundColor: "#556CD6",
  borderRadius: "5px",
  color: "#fff",
  display: "block",
  fontSize: "16px",
  fontWeight: "bold",
  textAlign: "center" as const,
  textDecoration: "none",
  width: "100%",
  padding: "12px",
  margin: "32px 0",
}

const link = {
  color: "#556CD6",
  textDecoration: "underline",
}

const credentials = {
  backgroundColor: "#f4f4f4",
  padding: "24px",
  borderRadius: "5px",
  margin: "16px 0",
}

const credentialText = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
  fontFamily: "monospace",
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

