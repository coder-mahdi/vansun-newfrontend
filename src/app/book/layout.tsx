import { RecaptchaV3Provider } from "@/components/recaptcha/RecaptchaV3Provider";

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="book-page">
      <RecaptchaV3Provider>{children}</RecaptchaV3Provider>
    </div>
  );
}
