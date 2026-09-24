import Link from "next/link";

/** Kayıtta ve Google ile ilk girişte gösterilen kullanım koşulları onayı. */
export function TermsCheckbox({ error }: { error?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-secondary">
        <input
          type="checkbox"
          name="terms"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "terms-message" : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-accent"
        />
        <span>
          <Link href="/terms" target="_blank" className="text-accent-soft underline underline-offset-4 hover:text-primary">
            Kullanım koşullarını
          </Link>{" "}
          ve{" "}
          <Link href="/privacy" target="_blank" className="text-accent-soft underline underline-offset-4 hover:text-primary">
            KVKK aydınlatma metnini
          </Link>{" "}
          okudum, kabul ediyorum.
        </span>
      </label>
      {error && (
        <p id="terms-message" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
