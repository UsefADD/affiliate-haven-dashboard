import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.12'
import * as React from 'npm:react@18.2.0'

interface ResetPasswordEmailProps {
  resetLink: string;
  userEmail: string;
}

export const ResetPasswordEmail = ({
  resetLink,
  userEmail,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your ClixAgent password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src="https://partner.clixagent.com/logo.png"
            width="170"
            height="50"
            alt="ClixAgent"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Reset Your Password</Heading>
        <Text style={text}>
          We received a request to reset the password for your ClixAgent account ({userEmail}).
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={resetLink}>
            Reset Password
          </Button>
        </Section>
        <Text style={text}>
          If you didn't request this password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </Text>
        <Text style={footer}>
          © {new Date().getFullYear()} ClixAgent. All rights reserved.
        </Text>
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
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}

const logoContainer = {
  padding: '20px 0',
  borderBottom: '1px solid #e6ebf1',
}

const logo = {
  margin: '0 auto',
  display: 'block',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  textAlign: 'center' as const,
  margin: '30px 0',
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  margin: '20px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const button = {
  backgroundColor: '#10b981',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
  margin: '0 auto',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '48px 0 0',
}

export default ResetPasswordEmail