
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
    <Preview>Welcome to ClixAgent's Affiliate Program</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to ClixAgent!</Heading>
        <Text style={text}>Dear {name},</Text>
        <Text style={text}>
          Thank you for applying to join ClixAgent's Affiliate Program. We're thrilled about the possibility of partnering with you!
        </Text>
        <Text style={text}>
          Our team will carefully review your application within the next 2-3 business days. During this time, we'll evaluate your experience, marketing strategies, and potential alignment with our program goals.
        </Text>
        <Text style={text}>
          What happens next:
        </Text>
        <ul style={list}>
          <li>Our affiliate team will review your application</li>
          <li>We'll evaluate your marketing channels and strategies</li>
          <li>You'll receive a decision email within 2-3 business days</li>
          <li>If approved, we'll send you detailed onboarding information</li>
        </ul>
        <Text style={text}>
          If you have any questions in the meantime, please don't hesitate to reach out to our affiliate support team.
        </Text>
        <Text style={footer}>
          Best regards,<br />
          The ClixAgent Affiliate Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ConfirmationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '580px',
}

const h1 = {
  color: '#22c55e',
  fontSize: '32px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const list = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  paddingLeft: '20px',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '48px 0 24px',
  fontStyle: 'italic',
}
