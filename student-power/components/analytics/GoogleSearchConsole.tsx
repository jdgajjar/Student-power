interface GoogleSearchConsoleProps {
  verificationCode?: string;
}

export default function GoogleSearchConsole({ verificationCode }: GoogleSearchConsoleProps) {
  // Use environment variable or provided verification code
  const VERIFICATION_CODE = verificationCode || process.env.NEXT_PUBLIC_GSC_VERIFICATION;

  // Don't render if no verification code is provided
  if (!VERIFICATION_CODE) {
    return null;
  }

  return (
    <meta name="google-site-verification" content={VERIFICATION_CODE} />
  );
}
