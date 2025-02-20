
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.12'
import * as React from 'npm:react@18.3.1'

interface ConfirmationEmailProps {
  name: string;
}

export const ConfirmationEmail = ({
  name,
}: ConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>ClixAgent Application Received</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={header}>
              ClixAgent
            </Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>
              Dear {name},
            </Text>
            
            <Text style={text}>
              Thank you for submitting your application to join ClixAgent. We're excited about the possibility of working together!
            </Text>

            <Text style={text}>
              Our team will carefully review your application within the next 2-3 business days. You'll receive a follow-up email with our decision and next steps.
            </Text>

            <Text style={text}>
              If you have any questions in the meantime, feel free to reach out to our support team.
            </Text>

            <Text style={text}>
              Best regards,<br />
              The ClixAgent Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} ClixAgent. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
}

const headerSection = {
  backgroundColor: '#10b981',
  padding: '20px',
  textAlign: 'center' as const,
}

const header = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const contentSection = {
  padding: '40px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const footer = {
  backgroundColor: '#f6f9fc',
  padding: '20px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
}

export default ConfirmationEmail
