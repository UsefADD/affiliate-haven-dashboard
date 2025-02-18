
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
  Link,
  Img,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface RejectionEmailProps {
  name: string;
}

export const RejectionEmail = ({ name }: RejectionEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank You for Your QuickBooks Enterprise Purchase</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={content}>
          <div style={textCenter}>
            <Heading style={h1}>Thank You for Your Purchase!</Heading>
            <Text style={text}>
              Your QuickBooks Enterprise order has been confirmed. Below you'll find your download link and license information.
            </Text>
          </div>

          <Section style={boxStyle}>
            <Heading style={h2}>Download Your Software</Heading>
            <Text style={text}>
              Click the button below to start downloading QuickBooks Enterprise 2024:
            </Text>
            <Link
              href="https://dlm2.download.intuit.com/akdlm/SBD/QuickBooks/2024/Latest/QuickBooksEnterprise24.exe"
              style={button}
            >
              Download QuickBooks Enterprise
            </Link>
          </Section>

          <Section style={boxStyle}>
            <Heading style={h2}>Your License Information</Heading>
            <div style={licenseBox}>
              <Text style={labelStyle}>License Number</Text>
              <Text style={codeBox}>7799-9087-5054-456</Text>
            </div>
            <div style={licenseBox}>
              <Text style={labelStyle}>Product Number</Text>
              <Text style={codeBox}>564-784</Text>
            </div>
            <div style={licenseBox}>
              <Text style={labelStyle}>Validation Code</Text>
              <Text style={codeBox}>243592</Text>
            </div>
          </Section>

          <Section style={{ ...boxStyle, borderColor: '#93C5FD' }}>
            <Heading style={h2}>Important Installation Information</Heading>
            <Text style={text}>
              During installation, you will initially be asked for only the <strong>License Number</strong> and <strong>Product Number</strong>.
            </Text>
            <Text style={text}>
              If you encounter an activation screen showing "Contact support to complete activation," don't worry - this is a normal part of the process for some installations.
            </Text>
            <Text style={text}>
              Simply click on "Issues with activation" when prompted. This will reveal an additional input field where you can enter the <strong>Validation Code</strong> provided above. After entering the code, your software will activate properly.
            </Text>
            <Img 
              src="https://images2.imgbox.com/64/c6/eFtQQF7H_o.png" 
              alt="QuickBooks activation screen"
              width="600"
              height="400"
              style={imageStyle}
            />
          </Section>

          <Text style={footer}>
            Need help with installation? Our support team is here to help you get started.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f9fafb",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
};

const content = {
  padding: "0 24px",
};

const textCenter = {
  textAlign: "center" as const,
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.25",
  margin: "16px 0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "1.25",
  margin: "16px 0",
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "16px 0",
};

const boxStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e4e4e7",
  padding: "24px",
  marginBottom: "24px",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
};

const button = {
  backgroundColor: "#7C3AED",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1",
  padding: "16px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
  width: "100%",
};

const licenseBox = {
  marginBottom: "16px",
};

const labelStyle = {
  color: "#4a4a4a",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "4px",
};

const codeBox = {
  backgroundColor: "#F3E8FF",
  borderRadius: "8px",
  color: "#4a4a4a",
  fontSize: "16px",
  padding: "12px",
  width: "100%",
};

const imageStyle = {
  maxWidth: "100%",
  height: "auto",
  marginTop: "16px",
  borderRadius: "4px",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "center" as const,
  marginTop: "32px",
};

export default RejectionEmail;
