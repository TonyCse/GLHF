"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type DialogVariant = "default" | "danger";

type DialogOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
};

type DialogState = DialogOptions & {
  type: "confirm" | "alert";
};

type DialogContextValue = {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: DialogOptions) => Promise<void>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setState(null);
  }, []);

  const confirm = useCallback((options: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({
        type: "confirm",
        title: options.title,
        description: options.description,
        confirmText: options.confirmText ?? "Confirmer",
        cancelText: options.cancelText ?? "Annuler",
        variant: options.variant ?? "default",
      });
    });
  }, []);

  const alert = useCallback((options: DialogOptions) => {
    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();
      setState({
        type: "alert",
        title: options.title,
        description: options.description,
        confirmText: options.confirmText ?? "OK",
        cancelText: options.cancelText,
        variant: options.variant ?? "default",
      });
    });
  }, []);

  useEffect(() => {
    if (!state) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state, close]);

  const contextValue = useMemo(() => ({ confirm, alert }), [confirm, alert]);

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => close(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#8F60D0]/30 bg-[#1c1d1f] p-6 shadow-2xl">
            <div className="text-lg font-semibold text-white">{state.title}</div>
            {state.description && <p className="mt-2 text-sm text-white">{state.description}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {state.type === "confirm" && (
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="btn-neon rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#8F60D0]/60 hover:text-white"
                >
                  {state.cancelText ?? "Annuler"}
                </button>
              )}
              <button
                type="button"
                onClick={() => close(true)}
                className={`btn-neon rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                  state.variant === "danger"
                    ? "bg-linear-to-r from-red-600 to-red-700"
                    : "bg-linear-to-r from-[#8F60D0] to-[#A855F7]"
                }`}
              >
                {state.confirmText ?? "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return ctx;
}
