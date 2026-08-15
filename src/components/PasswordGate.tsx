"use client";

import { FormEvent, useState, useSyncExternalStore, type ReactNode } from "react";

const PASSWORD = "belvie";
const STORAGE_KEY = "belvie-optimiser-auth";
const AUTH_EVENT = "belvie-auth";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(AUTH_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(AUTH_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

function getServerSnapshot() {
  return false;
}

function unlock() {
  sessionStorage.setItem(STORAGE_KEY, "1");
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const ok = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!ok) {
    return <LoginForm onSuccess={unlock} />;
  }

  return <>{children}</>;
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = String(form.get("password") ?? "");
    if (value === PASSWORD) {
      onSuccess();
      return;
    }
    setError("Incorrect password.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-[10px] border border-line bg-white p-6"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-terracotta">
          Belvie · Bengaluru
        </div>
        <h1 className="mt-1 font-serif text-2xl font-normal text-charcoal">
          Network Cost Optimiser
        </h1>
        <p className="mt-2 text-[13.5px] text-gray">Password required.</p>
        <label htmlFor="password" className="mt-5 block text-[12.5px] text-charcoal">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-[5px] border border-line bg-white px-3 py-2 text-[14px] text-ink focus:border-terracotta focus:outline-2 focus:outline-offset-1 focus:outline-terracotta"
          onChange={() => {
            if (error) setError("");
          }}
        />
        <p className="mt-2 min-h-[1.2em] text-[12.5px] text-bad">{error}</p>
        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-charcoal px-3 py-2 text-sm text-white hover:bg-terracotta"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
