import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  tutorialSteps,
  isTutorialComplete,
  markTutorialComplete,
  resetTutorial,
} from "@/lib/tutorialSteps";
import { ChevronLeft, ChevronRight, X, GraduationCap } from "lucide-react";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
}

interface TutorialOverlayProps {
  onComplete: () => void;
}

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const SPOTLIGHT_PADDING = 12;

  // Focus the next button when tooltip appears or step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      nextButtonRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const calculateSpotlightRect = useCallback(
    (targetElement: Element | null): SpotlightRect | null => {
      if (!targetElement) return null;

      const rect = targetElement.getBoundingClientRect();

      // Don't show spotlight if element is not visible in viewport
      if (rect.width === 0 || rect.height === 0) return null;

      const computedStyle = window.getComputedStyle(targetElement);
      const borderRadius = parseFloat(computedStyle.borderRadius) || 8;

      // Clamp spotlight to viewport bounds
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = rect.top - SPOTLIGHT_PADDING;
      let left = rect.left - SPOTLIGHT_PADDING;
      let width = rect.width + SPOTLIGHT_PADDING * 2;
      let height = rect.height + SPOTLIGHT_PADDING * 2;

      // Ensure spotlight stays within viewport
      if (top < 0) {
        height += top;
        top = 0;
      }
      if (left < 0) {
        width += left;
        left = 0;
      }
      if (top + height > viewportHeight) {
        height = viewportHeight - top;
      }
      if (left + width > viewportWidth) {
        width = viewportWidth - left;
      }

      // Minimum size to be visible
      if (width < 20 || height < 20) return null;

      return {
        top,
        left,
        width,
        height,
        borderRadius: borderRadius + 4,
      };
    },
    []
  );

  const updatePositions = useCallback(() => {
    if (!step || !tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width || 400;
    const tooltipHeight = tooltipRect.height || 200;

    // Handle center placement (no target element)
    if (step.placement === "center") {
      setSpotlightRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2 - tooltipHeight / 2,
        left: window.innerWidth / 2 - tooltipWidth / 2,
      });
      return;
    }

    const targetElement = document.querySelector(step.target);

    if (!targetElement) {
      // Fallback to center if target not found
      setSpotlightRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2 - tooltipHeight / 2,
        left: window.innerWidth / 2 - tooltipWidth / 2,
      });
      return;
    }

    // Calculate spotlight rectangle
    const newSpotlightRect = calculateSpotlightRect(targetElement);
    setSpotlightRect(newSpotlightRect);

    // Calculate tooltip position relative to spotlight
    const targetRect = targetElement.getBoundingClientRect();
    const padding = 16;

    let top = 0;
    let left = 0;

    switch (step.placement) {
      case "top":
        top = targetRect.top - tooltipHeight - padding - SPOTLIGHT_PADDING;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = targetRect.bottom + padding + SPOTLIGHT_PADDING;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding - SPOTLIGHT_PADDING;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding + SPOTLIGHT_PADDING;
        break;
    }

    // Keep tooltip within viewport bounds
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    setTooltipPosition({ top, left });
  }, [step, calculateSpotlightRect]);

  const ensureTargetVisible = useCallback(() => {
    if (!step || step.placement === "center") return;

    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const padding = 24;

    const isOutOfView =
      rect.top < padding ||
      rect.left < padding ||
      rect.bottom > viewportHeight - padding ||
      rect.right > viewportWidth - padding;

    if (isOutOfView) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [step]);

  // Update positions on mount, step change, resize, and scroll
  useEffect(() => {
    updatePositions();

    const handleUpdate = () => updatePositions();

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [updatePositions, currentStep]);

  // Scroll to bring the active target into view when steps change
  useEffect(() => {
    const timer = setTimeout(() => {
      ensureTargetVisible();
    }, 60);
    return () => clearTimeout(timer);
  }, [currentStep, ensureTargetVisible]);

  // Delayed position update after step change for DOM settling
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      updatePositions();
      setIsTransitioning(false);
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStep, updatePositions]);

  const handleComplete = useCallback(() => {
    markTutorialComplete();
    setIsVisible(false);
    onComplete();
  }, [onComplete]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleComplete();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleComplete]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Click on backdrop (outside spotlight) dismisses tutorial
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the actual backdrop, not the spotlight area
    if (e.target === e.currentTarget) {
      handleComplete();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Full-screen backdrop for click handling */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={handleBackdropClick}
        data-testid="tutorial-backdrop"
        aria-hidden="true"
      />

      {/* Spotlight overlay with cutout effect */}
      {spotlightRect ? (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            borderRadius: spotlightRect.borderRadius,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            transition: isTransitioning ? "none" : "all 0.3s ease-out",
          }}
          aria-hidden="true"
        />
      ) : (
        /* No target - show full dark overlay for center placement */
        <div className="fixed inset-0 bg-black/60 z-[100] pointer-events-none" aria-hidden="true" />
      )}

      {/* Spotlight border ring for extra visibility */}
      {spotlightRect && (
        <div
          className="fixed z-[100] pointer-events-none border-2 border-primary/50"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            borderRadius: spotlightRect.borderRadius,
            transition: isTransitioning ? "none" : "all 0.3s ease-out",
          }}
          aria-hidden="true"
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-content"
        className="fixed z-[101] w-[90vw] max-w-md"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transition: isTransitioning ? "none" : "top 0.3s ease-out, left 0.3s ease-out",
        }}
        data-testid="tutorial-tooltip"
      >
        <Card className="border-2 border-primary/30 shadow-[0_30px_60px_-40px_hsl(var(--shadow-color)/0.6)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
                <CardTitle id="tutorial-title" className="text-base">
                  {t(step.titleKey)}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                data-testid="button-tutorial-skip"
                aria-label={t("tutorial.skipAriaLabel")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p id="tutorial-content" className="text-sm text-muted-foreground leading-relaxed">
              {t(step.contentKey)}
            </p>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2 pt-0">
            <div
              className="flex items-center gap-1"
              aria-label={t("tutorial.stepOf", {
                current: currentStep + 1,
                total: tutorialSteps.length,
              })}
            >
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-primary"
                      : index < currentStep
                        ? "bg-primary/40"
                        : "bg-muted"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  data-testid="button-tutorial-prev"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                  {t("tutorial.back")}
                </Button>
              )}
              <Button
                ref={nextButtonRef}
                size="sm"
                onClick={handleNext}
                data-testid="button-tutorial-next"
              >
                {isLastStep ? t("tutorial.getStarted") : t("tutorial.next")}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

interface TutorialTriggerProps {
  onStart: () => void;
}

export function TutorialTrigger({ onStart }: TutorialTriggerProps) {
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onStart}
      data-testid="button-start-tutorial"
      aria-label={t("tutorial.startAriaLabel")}
    >
      <GraduationCap className="h-4 w-4 mr-2" aria-hidden="true" />
      {t("tutorial.tutorial")}
    </Button>
  );
}

export function useTutorial(scenarioLoaded: boolean = false) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasAutoStartedForSession, setHasAutoStartedForSession] = useState(false);
  const [tutorialCompleteState, setTutorialCompleteState] = useState(() => isTutorialComplete());

  useEffect(() => {
    const shouldAutoStart =
      !tutorialCompleteState && scenarioLoaded && !hasAutoStartedForSession && !showTutorial;

    if (shouldAutoStart) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
        setHasAutoStartedForSession(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [scenarioLoaded, hasAutoStartedForSession, showTutorial, tutorialCompleteState]);

  const startTutorial = useCallback(() => {
    setShowTutorial(true);
  }, []);

  const completeTutorial = useCallback(() => {
    setShowTutorial(false);
    setTutorialCompleteState(true);
  }, []);

  const resetTutorialState = useCallback(() => {
    resetTutorial();
    setTutorialCompleteState(false);
    setHasAutoStartedForSession(false);
  }, []);

  return {
    showTutorial,
    hasCompletedTutorial: tutorialCompleteState,
    startTutorial,
    completeTutorial,
    resetTutorialState,
  };
}
