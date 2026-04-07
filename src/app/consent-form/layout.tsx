import { RecaptchaV3Provider } from "@/components/recaptcha/RecaptchaV3Provider";

export default function ConsentFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RecaptchaV3Provider>{children}</RecaptchaV3Provider>;
}
