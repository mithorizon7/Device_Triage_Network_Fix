import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  tutorialSteps, 
  isTutorialComplete, 
  markTutorialComplete,
  resetTutorial,
  type TutorialStep 
} from "@/lib/tutorialSteps";
import { ChevronLeft, ChevronRight, X, GraduationCap } from "lucide-react";

interface TutorialOverlayProps {
  onComplete: () => void;
}

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const updateTooltipPosition = useCallback(() => {
    if (!step || !tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width || 400;
    const tooltipHeight = tooltipRect.height || 200;

    if (step.placement === "center") {
      setTooltipPosition({
        top: window.innerHeight / 2 - tooltipHeight / 2,
        left: window.innerWidth / 2 - tooltipWidth / 2
      });
      return;
    }

    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
      setTooltipPosition({
        top: window.innerHeight / 2 - tooltipHeight / 2,
        left: window.innerWidth / 2 - tooltipWidth / 2
      });
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const padding = 16;

    let top = 0;
    let left = 0;

    switch (step.placement) {
      case "top":
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
    }

    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    setTooltipPosition({ top, left });
  }, [step]);

  useEffect(() => {
    updateTooltipPosition();
    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition);
    
    return () => {
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition);
    };
  }, [updateTooltipPosition, currentStep]);

  useEffect(() => {
    const timer = setTimeout(updateTooltipPosition, 100);
    return () => clearTimeout(timer);
  }, [currentStep, updateTooltipPosition]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    markTutorialComplete();
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={(e) => e.stopPropagation()}
        data-testid="tutorial-backdrop"
      />
      
      <div
        ref={tooltipRef}
        className="fixed z-[101] w-[90vw] max-w-md animate-in fade-in-0 zoom-in-95 duration-200"
        style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
        data-testid="tutorial-tooltip"
      >
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
                <CardTitle className="text-base">{step.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="h-8 w-8"
                data-testid="button-tutorial-skip"
                aria-label={t('tutorial.skipAriaLabel')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.content}
            </p>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2 pt-0">
            <div className="flex items-center gap-1">
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
                  {t('tutorial.back')}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                data-testid="button-tutorial-next"
              >
                {isLastStep ? t('tutorial.getStarted') : t('tutorial.next')}
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
      aria-label={t('tutorial.startAriaLabel')}
    >
      <GraduationCap className="h-4 w-4 mr-2" aria-hidden="true" />
      {t('tutorial.tutorial')}
    </Button>
  );
}

export function useTutorial(scenarioLoaded: boolean = false) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasAutoStartedForSession, setHasAutoStartedForSession] = useState(false);
  const [tutorialCompleteState, setTutorialCompleteState] = useState(() => isTutorialComplete());

  useEffect(() => {
    const shouldAutoStart = !tutorialCompleteState && scenarioLoaded && !hasAutoStartedForSession && !showTutorial;
    
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
    resetTutorialState
  };
}
