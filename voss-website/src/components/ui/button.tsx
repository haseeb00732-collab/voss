import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The hairline action. A rule around a caps label — the site's only CTA shape.
 *
 * Three call sites had each grown their own copy of this: the nav CTA, the
 * waitlist submit and the collection rail arrows. All three drew the same
 * thing, and all three hard-coded the gold.
 *
 * The gold is not a constant. It inverts across the substrate — gold-500 on
 * onyx, gold-900 on bone — so the resting colour here is `--text-accent`,
 * which each `data-surface` resolves for itself. On the surfaces these
 * buttons sit on today that is the same pixel value they already shipped;
 * what changes is that moving one onto bone no longer silently drops it to
 * 2.0:1.
 *
 * Hover changes colour and edge opacity. It does not scale, lift or shadow.
 */
export const buttonVariants = cva(
  [
    "eyebrow inline-flex items-center justify-center",
    "transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)]",
  ],
  {
    variants: {
      variant: {
        /** Rule around a label. */
        outline: [
          "border border-[var(--border-hairline)] text-[var(--text-accent)]",
          "hover:border-[var(--border-strong)] hover:text-[var(--link)]",
          "active:text-[var(--link-hover)]",
        ],
        /** Label alone — the menu trigger and its close. No rule, no box. */
        quiet: "text-[var(--text-secondary)] hover:text-[var(--link)]",
      },
      size: {
        sm: "px-control-x py-control-y",
        lg: "px-control-x-l py-control-y-l",
        /** The square that holds an icon, not a label. */
        icon: "size-control",
        none: "",
      },
    },
    defaultVariants: { variant: "outline", size: "sm" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/**
 * Half these actions are navigations, not buttons. Rather than an `asChild`
 * indirection, `next/link` takes the same class list directly:
 *
 *   <Link href="/#waitlist" className={buttonVariants()}>Join the list</Link>
 */
