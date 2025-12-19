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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Lightbulb,
  Info,
  Timer,
  Hash
} from "lucide-react";

import { 
  analyzePassword, 
  getWeakExamplePassword, 
  ATTACK_PRESETS,
  DEFAULT_PRESET_ID,
  formatKeyspace,
  type PasswordStrength 
} from "@/lib/passwordStrength";

interface PasswordTrainingDialogProps {
  isOpen: boolean;
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
  onComplete,
  onClose,
}: PasswordTrainingDialogProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(DEFAULT_PRESET_ID);
  
  const originalPassword = getWeakExamplePassword();
  
  const analysis = useMemo(() => {
    if (!password) return null;
    return analyzePassword(password, selectedPreset);
  }, [password, selectedPreset]);

  const originalAnalysis = useMemo(() => {
    return analyzePassword(originalPassword, selectedPreset);
  }, [originalPassword, selectedPreset]);

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

  const formatCrackTime = (formatted: { displayString: string; unitKey: string; isScientific: boolean }) => {
    if (formatted.unitKey === 'instant') {
      return t('passwordTraining.timeInstant');
    }
    const unitLabel = t(`passwordTraining.timeUnit_${formatted.unitKey}`);
    return `${formatted.displayString} ${unitLabel}`;
  };

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
                {t('passwordTraining.howBruteForceWorks')}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('passwordTraining.bruteForceExplainer')}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 bg-background/50 p-2 rounded">
                <Info className="h-3 w-3 flex-shrink-0" />
                <span>{t('passwordTraining.exponentialGrowth')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('passwordTraining.attackScenario')}
              </Label>
              <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                <SelectTrigger data-testid="select-attack-preset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ATTACK_PRESETS).map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {t(preset.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t(ATTACK_PRESETS[selectedPreset]?.notesKey || '')}
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-md border bg-card">
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
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <span>{t('passwordTraining.length')}: {originalAnalysis.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3 text-red-500" />
                  <span>{t('passwordTraining.crackTime')}: {formatCrackTime(originalAnalysis.crackTimeEstimate.avgTimeFormatted)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                {t('passwordTraining.tryPassword')}
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
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {t('passwordTraining.privacyNote')}
              </p>
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

                <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-muted/50">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">{t('passwordTraining.detectedLength')}</div>
                    <div className="text-lg font-semibold">{analysis.length}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">{t('passwordTraining.alphabetSize')}</div>
                    <div className="text-lg font-semibold">{analysis.alphabetSize}</div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="text-xs text-muted-foreground">{t('passwordTraining.totalCombinations')}</div>
                    <div className="text-sm font-mono font-semibold">
                      {formatKeyspace(analysis.crackTimeEstimate.log10Keyspace)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">{t('passwordTraining.characterTypes')}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      {analysis.hasLowercase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={analysis.hasLowercase ? 'text-foreground' : 'text-muted-foreground'}>
                        {t('passwordTraining.reqLowercase')} (26)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {analysis.hasUppercase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={analysis.hasUppercase ? 'text-foreground' : 'text-muted-foreground'}>
                        {t('passwordTraining.reqUppercase')} (26)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {analysis.hasNumbers ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={analysis.hasNumbers ? 'text-foreground' : 'text-muted-foreground'}>
                        {t('passwordTraining.reqNumbers')} (10)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {analysis.hasSymbols ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={analysis.hasSymbols ? 'text-foreground' : 'text-muted-foreground'}>
                        {t('passwordTraining.reqSymbols')} (33)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-3 rounded-md bg-gradient-to-r from-primary/5 to-primary/10 border">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    {t('passwordTraining.estimatedCrackTime')}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">{t('passwordTraining.averageCase')}</div>
                      <div className={`text-lg font-bold ${
                        analysis.strength === 'strong' ? 'text-green-600 dark:text-green-400' :
                        analysis.strength === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCrackTime(analysis.crackTimeEstimate.avgTimeFormatted)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">{t('passwordTraining.worstCase')}</div>
                      <div className="text-lg font-bold text-muted-foreground">
                        {formatCrackTime(analysis.crackTimeEstimate.worstTimeFormatted)}
                      </div>
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

                <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{t('passwordTraining.dictionaryWarning')}</span>
                  </div>
                </div>

                {analysis.strength === 'strong' && (
                  <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>{t('passwordTraining.strongPasswordCongrats')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!analysis && (
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
                    <span>{t('passwordTraining.tipPassphrase')}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2 pt-4 border-t">
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
