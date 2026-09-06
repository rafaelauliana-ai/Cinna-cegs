"use client";

import { useEffect, useRef, useState } from "react";
import { useTour } from "./TourContext";
import { Button } from "@/components/ui/Button";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

export function TourOverlay() {
  const { isActive, step, stepNumber, totalSteps, next, prev, stop } = useTour();
  const [rect, setRect] = useState<Rect | null>(null);
  const [notFound, setNotFound] = useState(false);
  const clickHandlerRef = useRef<{ el: Element; fn: () => void } | null>(null);

  useEffect(() => {
    if (!isActive || !step) return;

    if (!step.targetId) {
      setRect(null);
      setNotFound(false);
      return;
    }

    let attempts = 0;
    setNotFound(false);

    function measure() {
      const el = document.querySelector(`[data-tour-id="${step!.targetId}"]`);
      if (!el) {
        attempts += 1;
        if (attempts > 40) {
          setNotFound(true);
          return;
        }
        requestAnimationFrame(measure);
        return;
      }

      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      });
      el.scrollIntoView({ block: "center", behavior: "smooth" });

      if (clickHandlerRef.current) {
        clickHandlerRef.current.el.removeEventListener("click", clickHandlerRef.current.fn);
      }
      const handler = () => next();
      el.addEventListener("click", handler, { once: true });
      clickHandlerRef.current = { el, fn: handler };
    }

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      if (clickHandlerRef.current) {
        clickHandlerRef.current.el.removeEventListener("click", clickHandlerRef.current.fn);
        clickHandlerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, step?.id]);

  if (!isActive || !step) return null;

  const isCentered = !step.targetId || (!rect && notFound);

  return (
    <div className="fixed inset-0 z-[100]">
      {isCentered ? (
        <div className="absolute inset-0 flex items-center justify-center bg-sky-900/50 p-4">
          <TourCard
            step={step}
            stepNumber={stepNumber}
            totalSteps={totalSteps}
            onNext={next}
            onPrev={prev}
            onStop={stop}
          />
        </div>
      ) : rect ? (
        <>
          {/* 4 tarjas escuras ao redor do alvo (bloqueiam clique fora dele) */}
          <div
            className="absolute bg-sky-900/55"
            style={{ top: 0, left: 0, width: "100%", height: Math.max(rect.top, 0) }}
          />
          <div
            className="absolute bg-sky-900/55"
            style={{
              top: rect.top + rect.height,
              left: 0,
              width: "100%",
              bottom: 0,
            }}
          />
          <div
            className="absolute bg-sky-900/55"
            style={{ top: rect.top, left: 0, width: Math.max(rect.left, 0), height: rect.height }}
          />
          <div
            className="absolute bg-sky-900/55"
            style={{
              top: rect.top,
              left: rect.left + rect.width,
              right: 0,
              height: rect.height,
            }}
          />
          {/* moldura destacando o elemento (pointer-events none deixa o clique passar) */}
          <div
            className="pointer-events-none absolute rounded-control border-[3px] border-sky-300 shadow-[0_0_0_4px_rgba(124,204,234,0.35)]"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />

          <div
            className="absolute w-[min(320px,90vw)]"
            style={{
              top: Math.min(rect.top + rect.height + 12, window.innerHeight - 260),
              left: Math.min(Math.max(rect.left, 12), window.innerWidth - 332),
            }}
          >
            <TourCard
              step={step}
              stepNumber={stepNumber}
              totalSteps={totalSteps}
              onNext={next}
              onPrev={prev}
              onStop={stop}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function TourCard({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onStop,
}: {
  step: { title: string; text: string };
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
}) {
  const isFirst = stepNumber === 1;
  const isLast = stepNumber === totalSteps;

  return (
    <div className="rounded-card bg-white p-5 shadow-soft">
      <p className="mb-1 text-xs font-bold text-sky-500">
        Passo {stepNumber} de {totalSteps}
      </p>
      <h3 className="mb-2 font-heading text-lg font-extrabold text-sky-800">{step.title}</h3>
      <p className="mb-4 text-sm text-foreground-muted">{step.text}</p>
      <div className="flex items-center justify-between gap-2">
        <button onClick={onStop} className="text-xs font-semibold text-foreground-muted hover:underline">
          Pular tour
        </button>
        <div className="flex gap-2">
          {!isFirst && (
            <Button size="sm" variant="secondary" onClick={onPrev}>
              ← Anterior
            </Button>
          )}
          <Button size="sm" onClick={isLast ? onStop : onNext}>
            {isLast ? "Concluir 🎀" : "Próximo →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
