"use client";

import { useId, useState } from "react";
import { Hairline, RevealLines } from "./Reveal";
import { Button } from "./ui/button";
import { FieldError, Input, Label } from "./ui/field";

type State = "idle" | "error" | "done";

/**
 * The waitlist. A ruled line, not a box.
 *
 * A boxed input imports a form aesthetic from software; a rule imports it
 * from a ledger, and only one of those belongs on this page. The CTA is a
 * gold hairline rather than a filled rectangle for the same reason, and it
 * changes only colour and edge opacity on hover — no scale, no shadow.
 */
export function Waitlist() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const fieldId = `email-${uid}`;
  const helpId = `help-${uid}`;
  const errorId = `error-${uid}`;

  const [value, setValue] = useState("");
  const [state, setState] = useState<State>("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Deliberately permissive: the server is the only thing that can really
    // tell you an address exists, and a clever regex only ever rejects
    // somebody's perfectly valid address.
    const ok = /^\S+@\S+\.\S+$/.test(value.trim());
    setState(ok ? "done" : "error");
  };

  return (
    <section
      id="waitlist"
      data-surface="dark"
      className="substrate vignette py-section"
      aria-label="Join the list"
    >
      <div className="above-material relative mx-auto grid max-w-[120rem] grid-cols-12 gap-x-gap-col px-gutter">
        <div className="col-span-12 md:col-span-5">
          <p className="eyebrow text-gold-500">The List</p>
          <Hairline className="mt-5 max-w-[6rem]" />
          <RevealLines as="h2" className="display-l mt-group text-paper-100">
            One letter, when there is something to&nbsp;say.
          </RevealLines>
        </div>

        <div className="col-span-12 mt-block self-end md:col-span-5 md:col-start-8 md:mt-0">
          {state === "done" ? (
            <p className="body-l flex items-baseline gap-3 text-paper-100" role="status">
              <span aria-hidden="true" className="text-gold-300">
                &#10003;
              </span>
              You&rsquo;re on the list.
            </p>
          ) : (
            <form onSubmit={submit} noValidate>
              <Label htmlFor={fieldId}>Email</Label>

              <Input
                id={fieldId}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (state === "error") setState("idle");
                }}
                aria-invalid={state === "error"}
                aria-describedby={state === "error" ? `${errorId} ${helpId}` : helpId}
                state={state === "error" ? "error" : value ? "filled" : "idle"}
              />

              {state === "error" && (
                <FieldError id={errorId}>
                  That doesn&rsquo;t look like an email address yet.
                </FieldError>
              )}

              <div className="mt-block flex flex-wrap items-center gap-group">
                <Button type="submit" size="lg">
                  Join the list
                </Button>

                <p id={helpId} className="body-s text-smoke">
                  We&rsquo;ll write once, when it&rsquo;s ready.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
