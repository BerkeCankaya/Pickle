"use client";

import { useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-field bg-surface px-4 text-base text-primary placeholder:text-secondary " +
  "ring-1 ring-secondary/30 outline-none transition-[box-shadow] duration-200 ease-out-soft " +
  "hover:ring-secondary/60 focus:ring-2 focus:ring-accent focus:shadow-glow-sm " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const fieldError = "ring-danger hover:ring-danger focus:ring-danger";

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  count?: { current: number; max: number };
  children: ReactNode;
};

function FieldShell({ id, label, required, hint, error, count, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-primary">
        {label}
        {required && (
          <span className="text-secondary" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {(error || hint || count) && (
        <div className="flex items-start justify-between gap-4 text-sm">
          {error ? (
            <p id={`${id}-message`} className="text-danger">
              {error}
            </p>
          ) : hint ? (
            <p id={`${id}-message`} className="text-secondary">
              {hint}
            </p>
          ) : (
            <span />
          )}
          {count && (
            <span className="shrink-0 tabular-nums text-secondary" aria-hidden="true">
              {count.current}/{count.max}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

type SharedProps = {
  label: string;
  hint?: string;
  error?: string;
  /** maxLength ile birlikte karakter sayacı gösterir. */
  showCount?: boolean;
};

function useFieldState(value: unknown, defaultValue: unknown) {
  const [length, setLength] = useState(String(value ?? defaultValue ?? "").length);
  const currentLength = value !== undefined ? String(value).length : length;
  return {
    currentLength,
    track: (next: string) => setLength(next.length),
  };
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & SharedProps;

export function Input({
  label,
  hint,
  error,
  showCount,
  id,
  className,
  onChange,
  ...props
}: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const { currentLength, track } = useFieldState(props.value, props.defaultValue);
  const hasMessage = Boolean(error || hint);

  return (
    <FieldShell
      id={fieldId}
      label={label}
      required={props.required}
      hint={hint}
      error={error}
      count={showCount && props.maxLength ? { current: currentLength, max: props.maxLength } : undefined}
    >
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? `${fieldId}-message` : undefined}
        className={cn(fieldBase, "h-12", error && fieldError, className)}
        onChange={(event) => {
          track(event.target.value);
          onChange?.(event);
        }}
        {...props}
      />
    </FieldShell>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & SharedProps;

export function Textarea({
  label,
  hint,
  error,
  showCount,
  id,
  className,
  onChange,
  rows = 4,
  ...props
}: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const { currentLength, track } = useFieldState(props.value, props.defaultValue);
  const hasMessage = Boolean(error || hint);

  return (
    <FieldShell
      id={fieldId}
      label={label}
      required={props.required}
      hint={hint}
      error={error}
      count={showCount && props.maxLength ? { current: currentLength, max: props.maxLength } : undefined}
    >
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? `${fieldId}-message` : undefined}
        className={cn(fieldBase, "resize-y py-3 leading-relaxed", error && fieldError, className)}
        onChange={(event) => {
          track(event.target.value);
          onChange?.(event);
        }}
        {...props}
      />
    </FieldShell>
  );
}
