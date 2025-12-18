import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lock, 
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Clock,
  Shield,
  Lightbulb
} from "lucide-react";

import { analyzePassword, getWeakExamplePassword, type PasswordAnalysis, type PasswordStrength } from "@/lib/passwordStrength";

interface PasswordTrainingDialogProps {
  isOpen: boolean;
  dontShowAgain: boolean;
  onDontShowAgainChange: (checked: boolean) => void;
  onComplete: (passwordAccepted: boolean) => void;
  onClose: () => void;
}

interface StrengthConfig {
  color: string;
  textColor: string;
  progress: number;
  label: string;
}

export function PasswordTrainingDialog({
  isOpen,
  dontShowAgain,
  onDontShowAgainChange,
  onComplete,
  onClose,
}: PasswordTrainingDialogProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const originalPassword = getWeakExamplePassword();
  
  const analysis = useMemo(() => {
    if (!password) return null;
    return analyzePassword(password);
  }, [password]);

  const strengthConfigs: Record<PasswordStrength, StrengthConfig> = {
    weak: { 
      color: 'bg-red-500', 
      textColor: 'text-red-600 dark:text-red-400',
      progress: 33,
      label: t('passwordTraining.strengthWeak')
    },
    medium: { 
      color: 'bg-amber-500', 
      textColor: 'text-amber-600 dark:text-amber-400',
      progress: 66,
      label: t('passwordTraining.strengthMedium')
    },
    strong: { 
      color: 'bg-green-500', 
      textColor: 'text-green-600 dark:text-green-400',
      progress: 100,
      label: t('passwordTraining.strengthStrong')
    },
  };

  const handleAccept = () => {
    if (!analysis || analysis.strength !== 'strong') {
      return;
    }
    onComplete(true);
    setPassword('');
  };

  const handleDecline = () => {
    onComplete(false);
    setPassword('');
  };

  const handleClose = () => {
    onClose();
    setPassword('');
  };

  const currentStrengthConfig = analysis ? strengthConfigs[analysis.strength] : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="max-w-lg max-h-[90vh] flex flex-col"
        data-testid="dialog-password-training"
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            {t('passwordTraining.title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('passwordTraining.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-5">
            <div className="space-y-3 p-4 rounded-md bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                {t('passwordTraining.didYouKnow')}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('passwordTraining.bruteForceInfo')}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{t('passwordTraining.shortPasswordTime')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-green-500" />
                  <span>{t('passwordTraining.longPasswordTime')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-md border bg-card">
              <div className="text-sm font-medium">{t('passwordTraining.bestPractices')}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{t('passwordTraining.tipLength')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{t('passwordTraining.tipMix')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{t('passwordTraining.tipAvoid')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{t('passwordTraining.tipPassphrase')}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t('passwordTraining.originalPassword')}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOriginal(!showOriginal)}
                  data-testid="button-toggle-original"
                >
                  {showOriginal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <code className="text-sm text-red-600 dark:text-red-400">
                  {showOriginal ? originalPassword : '••••••••'}
                </code>
                <Badge variant="outline" className="ml-2 text-red-600 dark:text-red-400">
                  {t('passwordTraining.veryWeak')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('passwordTraining.originalExplanation')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                {t('passwordTraining.createNew')}
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordTraining.placeholder')}
                  className="pr-10"
                  data-testid="input-new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {analysis && currentStrengthConfig && (
              <div className="space-y-4 p-4 rounded-md border bg-card">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('passwordTraining.strength')}</span>
                    <Badge 
                      variant="outline" 
                      className={currentStrengthConfig.textColor}
                      data-testid="badge-password-strength"
                    >
                      {currentStrengthConfig.label}
                    </Badge>
                  </div>
                  <Progress 
                    value={currentStrengthConfig.progress} 
                    className="h-2"
                    data-testid="progress-password-strength"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">{t('passwordTraining.requirements')}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      {analysis.length >= 12 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={analysis.length >= 12 ? 'text-foreground' : 'text-muted-foreground'}>
                        {t('passwordTraining.req12Chars')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {analysis.hasUppercase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={analysis.hasUppercase ? 'text-foreground' : 'text-muted-foreground'}>
                        {t('passwordTraining.reqUppercase')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {analysis.hasLowercase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={analysis.hasLowercase ? 'text-foreground' : 'text-muted-foreground'}>
                        {t('passwordTraining.reqLowercase')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {analysis.hasNumbers ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={analysis.hasNumbers ? 'text-foreground' : 'text-muted-foreground'}>
                        {t('passwordTraining.reqNumbers')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {analysis.hasSymbols ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={analysis.hasSymbols ? 'text-foreground' : 'text-muted-foreground'}>
                        {t('passwordTraining.reqSymbols')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {!analysis.isCommonPassword ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={!analysis.isCommonPassword ? 'text-foreground' : 'text-muted-foreground'}>
                        {t('passwordTraining.reqNotCommon')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {analysis.isCommonPassword && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>{t('passwordTraining.warnCommon')}</span>
                    </div>
                  )}
                  {analysis.hasSequentialChars && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>{t('passwordTraining.warnSequential')}</span>
                    </div>
                  )}
                  {analysis.hasRepeatingChars && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>{t('passwordTraining.warnRepeating')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t('passwordTraining.crackTime')}:
                  </span>
                  <span className="font-medium">
                    {t(`passwordTraining.crackTime_${analysis.estimatedCrackTime}`)}
                  </span>
                </div>

                <div className="p-3 rounded-md bg-muted/50">
                  <div className="text-sm font-medium mb-1">
                    {t('passwordTraining.whyThisRating')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.strength === 'weak' && t('passwordTraining.explainWeak')}
                    {analysis.strength === 'medium' && t('passwordTraining.explainMedium')}
                    {analysis.strength === 'strong' && t('passwordTraining.explainStrong')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Checkbox
            id="dont-show-password-training"
            checked={dontShowAgain}
            onCheckedChange={(checked) => onDontShowAgainChange(checked === true)}
            data-testid="checkbox-dont-show-password"
          />
          <Label 
            htmlFor="dont-show-password-training" 
            className="text-sm text-muted-foreground cursor-pointer"
          >
            {t('education.dontShowAgain')}
          </Label>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            data-testid="button-password-decline"
          >
            {t('education.turnOff')}
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!analysis || analysis.strength !== 'strong'}
            data-testid="button-password-accept"
          >
            {analysis?.strength === 'strong' 
              ? t('passwordTraining.acceptStrong')
              : t('passwordTraining.createFirst')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
