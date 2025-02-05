
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
        <Section style={headerSection}>
          <Heading style={headerText}>Welcome to ClixAgent Partner Program!</Heading>
        </Section>

        <Section style={contentSection}>
          <Text style={greeting}>Dear {name},</Text>
          <Text style={text}>
            🎉 Congratulations! We are thrilled to inform you that your application to join the ClixAgent Partner Program has been approved. Welcome to our growing family of successful affiliates!
          </Text>
          
          <Text style={text}>
            We believe your expertise and marketing strategies align perfectly with our program goals, and we're excited about the potential success we can achieve together.
          </Text>
          
          <Section style={credentialsBox}>
            <Text style={credentialsTitle}>Your Account Credentials</Text>
            <Text style={credentialText}>Email: {email}</Text>
            <Text style={credentialText}>Password: {password}</Text>
          </Section>

          <Text style={text}>
            For security reasons, we strongly recommend changing your password after your first login.
          </Text>

          <Button style={button} href="https://partner.clixagent.com/login">
            Login to Your Dashboard
          </Button>

          <Text style={text}>
            If the button above doesn't work, you can copy and paste this link into your browser:
            <br />
            <Link href="https://partner.clixagent.com/login" style={link}>
              https://partner.clixagent.com/login
            </Link>
          </Text>

          <Hr style={hr} />
          
          <Text style={text}>
            Here's what you can do next:
          </Text>
          <ul style={list}>
            <li>Log in to your affiliate dashboard using the credentials above</li>
            <li>Complete your profile information</li>
            <li>Browse our selection of high-converting offers</li>
            <li>Generate your tracking links and start promoting</li>
            <li>Track your performance and earnings in real-time</li>
          </ul>

          <Text style={text}>
            We're committed to your success! Our dedicated affiliate management team is here to support you every step of the way. If you have any questions or need assistance, don't hesitate to reach out.
          </Text>

          <Text style={text}>
            Here's to a successful partnership! 🚀
          </Text>

          <Text style={footer}>
            Best regards,<br />
            The ClixAgent Partner Program Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  marginBottom: '64px',
}

const headerSection = {
  backgroundColor: '#22c55e',
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const headerText = {
  color: '#ffffff',
  fontSize: '30px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
  lineHeight: '1.3',
}

const contentSection = {
  padding: '40px 24px',
}

const greeting = {
  fontSize: '20px',
  lineHeight: '28px',
  margin: '16px 0',
  color: '#333',
  fontWeight: 'bold',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const credentialsBox = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
  border: '1px solid #e2e8f0',
}

const credentialsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  margin: '0 0 16px 0',
}

const credentialText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
  fontFamily: 'monospace',
}

const button = {
  backgroundColor: '#22c55e',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '12px 24px',
  margin: '24px 0',
}

const link = {
  color: '#22c55e',
  textDecoration: 'underline',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
}

const list = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  paddingLeft: '24px',
}

const footer = {
  color: '#666',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '48px 0 0',
  fontStyle: 'italic',
}

export default ApprovalEmail
