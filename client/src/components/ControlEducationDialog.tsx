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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Lock,
  Users,
  Shield,
  Key,
  RefreshCw,
  KeyRound,
  Wifi,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ControlKey =
  | "strongWifiPassword"
  | "guestNetworkEnabled"
  | "iotNetworkEnabled"
  | "mfaEnabled"
  | "autoUpdatesEnabled"
  | "defaultPasswordsAddressed"
  | "wifiSecurity";

interface ControlEducationDialogProps {
  controlKey: ControlKey | null;
  isOpen: boolean;
  dontShowAgain: boolean;
  onDontShowAgainChange: (checked: boolean) => void;
  onKeepEnabled: () => void;
  onTurnOff: () => void;
  onClose: () => void;
}

const controlIcons: Record<ControlKey, LucideIcon> = {
  strongWifiPassword: Lock,
  guestNetworkEnabled: Users,
  iotNetworkEnabled: Shield,
  mfaEnabled: Key,
  autoUpdatesEnabled: RefreshCw,
  defaultPasswordsAddressed: KeyRound,
  wifiSecurity: Wifi,
};

export function ControlEducationDialog({
  controlKey,
  isOpen,
  dontShowAgain,
  onDontShowAgainChange,
  onKeepEnabled,
  onTurnOff,
  onClose,
}: ControlEducationDialogProps) {
  const { t } = useTranslation();

  if (!controlKey) return null;

  const Icon = controlIcons[controlKey];
  const title = t(`education.${controlKey}.title`);
  const whatContent = t(`education.${controlKey}.what`);
  const whyContent = t(`education.${controlKey}.why`);
  const howContent = t(`education.${controlKey}.how`);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-lg max-h-[90vh] flex flex-col"
        data-testid={`dialog-education-${controlKey}`}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/15 border border-primary/30">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">{t("common.learnMore")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <HelpCircle className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span>{t("education.whatIsThis")}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">{whatContent}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Lightbulb className="h-4 w-4 text-[hsl(var(--accent))]" />
                <span>{t("education.whyMatters")}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">{whyContent}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--risk-low))]" />
                <span>{t("education.howToDo")}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">{howContent}</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Checkbox
            id="dont-show-again"
            checked={dontShowAgain}
            onCheckedChange={(checked) => onDontShowAgainChange(checked === true)}
            data-testid="checkbox-dont-show-again"
          />
          <Label htmlFor="dont-show-again" className="text-sm text-muted-foreground cursor-pointer">
            {t("education.dontShowAgain")}
          </Label>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          <Button variant="outline" onClick={onTurnOff} data-testid="button-turn-off">
            {t("education.turnOff")}
          </Button>
          <Button onClick={onKeepEnabled} data-testid="button-keep-enabled">
            {t("education.keepEnabled")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
