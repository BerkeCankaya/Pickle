import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type AuthCardProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/** Giriş, kayıt ve şifre sayfalarının ortak çerçevesi. */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-4 sm:py-8">
      <Card className="flex flex-col gap-6 p-5 sm:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold text-balance">{title}</h1>
          {description && <p className="leading-relaxed text-secondary">{description}</p>}
        </div>
        {children}
      </Card>
      {footer && <div className="text-center text-sm text-secondary">{footer}</div>}
    </div>
  );
}
