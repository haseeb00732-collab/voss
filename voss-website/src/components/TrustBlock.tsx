import { AmbientField } from "./AmbientField";
import { WhatItIs } from "./WhatItIs";
import { BeforeYouPay } from "./BeforeYouPay";
import { Faqs } from "./Faqs";

/**
 * The trust block — §5.6, "merge, do not stack".
 *
 * `WhatItIs`, `BeforeYouPay` and `Faqs` were three sibling <section>s, each
 * with its own `py-section` and its own `display-l` heading. Stacked, they
 * read as three identical slabs of type on black, and the page after the
 * products looked like a document rather than a composition. That is the
 * thing §5.6 names as "its own failure".
 *
 * They are not merged by rewriting them — each still answers its own
 * question, and each is still a real landmark for a screen reader. What
 * changes is that they now sit INSIDE one composed region with one ground,
 * one ambient field and one eyebrow, so the reader gets one trust argument
 * told in three movements rather than three arguments told once each.
 *
 * This is also the answer to why they were never cut. VOSS's whole
 * differentiator against a "DM for price" Instagram seller is *this is not a
 * scam page* — these three sections are the conversion argument. §5.6 is
 * explicit that cutting them would have been the worst call in the document.
 */
export function TrustBlock() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* The animated ground, §1.6. It runs behind all three movements so the
          block reads as one room rather than three. */}
      <AmbientField />

      <div className="relative px-gutter pt-section">
        <p className="mono text-[var(--text-accent)]">
          Before you order · Three things
        </p>
      </div>

      <WhatItIs />
      <BeforeYouPay />
      <Faqs />
    </div>
  );
}
