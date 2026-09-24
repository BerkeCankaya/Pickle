import { cn } from "@/lib/cn";

type FormAlertProps = {
  tone: "error" | "success" | "info";
  children: React.ReactNode;
};

/** Formun üstünde gösterilen hata / başarı kutusu. */
export function FormAlert({ tone, children }: FormAlertProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-field px-4 py-3 text-sm leading-relaxed ring-1",
        tone === "error" && "bg-danger/10 text-danger ring-danger/40",
        tone === "success" && "bg-success/10 text-success ring-success/40",
        tone === "info" && "bg-background/60 text-secondary ring-secondary/30",
      )}
    >
      {children}
    </p>
  );
}
