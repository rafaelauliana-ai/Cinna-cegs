"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { TOUR_STEPS_JOINER, TOUR_STEPS_MASTER, type TourStep } from "./steps";

interface TourContextValue {
  isActive: boolean;
  step: TourStep | null;
  stepNumber: number;
  totalSteps: number;
  start: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({
  isMaster,
  children,
}: {
  isMaster: boolean;
  children: ReactNode;
}) {
  const steps = useMemo(
    () => (isMaster ? TOUR_STEPS_MASTER : TOUR_STEPS_JOINER),
    [isMaster],
  );
  const [index, setIndex] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const goToStep = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= steps.length) {
        setIndex(null);
        return;
      }
      const nextStep = steps[newIndex];
      setIndex(newIndex);
      if (nextStep.route && nextStep.route !== pathname) {
        router.push(nextStep.route);
      }
    },
    [steps, pathname, router],
  );

  const start = useCallback(() => goToStep(0), [goToStep]);
  const next = useCallback(() => {
    if (index === null) return;
    goToStep(index + 1);
  }, [index, goToStep]);
  const prev = useCallback(() => {
    if (index === null) return;
    goToStep(index - 1);
  }, [index, goToStep]);
  const stop = useCallback(() => setIndex(null), []);

  const value: TourContextValue = {
    isActive: index !== null,
    step: index !== null ? steps[index] : null,
    stepNumber: (index ?? 0) + 1,
    totalSteps: steps.length,
    start,
    next,
    prev,
    stop,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour precisa estar dentro de um <TourProvider>");
  return ctx;
}
