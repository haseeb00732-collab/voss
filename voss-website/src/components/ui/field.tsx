import { cn } from "@/lib/utils";

/**
 * A ruled field, not a box.
 *
 * A boxed input imports a form aesthetic from software; a rule imports it
 * from a ledger, and only one of those belongs on this page. The whole
 * primitive is a single bottom hairline whose colour carries the state.
 *
 * Every value here was already in `Waitlist`, hard-coded. Each one turned
 * out to be a substrate token exactly: `gold-500/55` is `--border-strong`,
 * `gold-300` is `--focus`, `oxblood-lit` is `--error`, `pewter` is
 * `--disabled-fg`. Nothing was re-picked — they were only given their names
 * back, so the field works on bone as well as onyx.
 */

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("eyebrow block text-[var(--text-secondary)]", className)} {...props} />;
}

export type InputProps = React.ComponentProps<"input"> & {
  /** Drives the rule's colour. `filled` is the caller's business, not the DOM's. */
  state?: "idle" | "filled" | "error";
};

export function Input({ className, state = "idle", ...props }: InputProps) {
  return (
    <input
      className={cn(
        "body-l mt-item w-full border-0 border-b bg-transparent pb-item",
        "text-[var(--text-primary)] placeholder:text-[var(--disabled-fg)] focus:outline-none",
        "transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)]",
        state === "error" && "border-b-[var(--error)]",
        state === "filled" && "border-b-[var(--border-strong)]",
        state === "idle" && [
          "border-b-[var(--border-hairline)]",
          "hover:border-b-[var(--border-strong)] focus:border-b-[var(--focus)]",
        ],
        className,
      )}
      {...props}
    />
  );
}

/**
 * Colour is never the only signal: the glyph, the text and `aria-invalid`
 * on the field all say the same thing.
 */
export function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("body-s mt-item flex items-start gap-tight text-[var(--error)]", className)}
      {...props}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="mt-1 size-3 shrink-0"
        fill="none"
        stroke="currentColor"
      >
        <path d="M6 1 11.2 10.5H0.8L6 1Z" />
        <path d="M6 4.6v2.6M6 8.6v0.6" />
      </svg>
      {children}
    </p>
  );
}
