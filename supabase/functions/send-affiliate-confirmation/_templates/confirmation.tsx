
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ConfirmationEmailProps {
  name: string;
}

export const ConfirmationEmail = ({
  name,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for your ClixAgent Affiliate Application</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Application Received</Heading>
        <Text style={text}>Dear {name},</Text>
        <Text style={text}>
          Thank you for submitting your affiliate application to ClixAgent. We're excited about the possibility of working together!
        </Text>
        <Text style={text}>
          Our team will carefully review your application and get back to you as soon as possible, typically within 2-3 business days.
        </Text>
        <Text style={text}>
          If you have any questions in the meantime, please don't hesitate to reach out to our support team.
        </Text>
        <Text style={footer}>
          Best regards,<br />
          The ClixAgent Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ConfirmationEmail

const main = {
  backgroundColor: '#f2fce2',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'normal',
  textAlign: 'center' as const,
  margin: '30px 0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '48px 0 24px',
}
