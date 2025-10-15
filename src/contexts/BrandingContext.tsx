import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type BrandingState = {
  logoUrl: string | null;
  brandName: string;
};

type BrandingContextValue = BrandingState & {
  setLogoUrl: (url: string | null) => void;
  setBrandName: (name: string) => void;
};

const defaultBrandingState: BrandingState = {
  logoUrl: null,
  brandName: "CollabBoard",
};

const BRANDING_STORAGE_KEY = "collabboard.branding";

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<BrandingState>(defaultBrandingState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<BrandingState>;
      setState((prev) => ({
        ...prev,
        ...parsed,
      }));
    } catch (error) {
      console.warn("Unable to load branding preferences", error);
    }
  }, []);

  const persistState = (next: BrandingState) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("Unable to persist branding preferences", error);
    }
  };

  const contextValue = useMemo<BrandingContextValue>(() => ({
    ...state,
    setLogoUrl: (url) => {
      setState((prev) => {
        const next = { ...prev, logoUrl: url };
        persistState(next);
        return next;
      });
    },
    setBrandName: (name) => {
      const safeName = name.slice(0, 60);
      setState((prev) => {
        const next = { ...prev, brandName: safeName };
        persistState(next);
        return next;
      });
    },
  }), [state]);

  return <BrandingContext.Provider value={contextValue}>{children}</BrandingContext.Provider>;
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};
