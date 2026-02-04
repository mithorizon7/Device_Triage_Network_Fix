import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Building2, Hotel } from "lucide-react";
import { getScenarioDisplayTitle } from "@/lib/scenarioTitles";

interface ScenarioSelectorProps {
  scenarios: Array<{ id: string; title: string; environment: { type: string } }>;
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

const environmentIcons: Record<string, typeof Home> = {
  home: Home,
  office: Building2,
  hotel: Hotel,
  public: Hotel,
};

export function ScenarioSelector({
  scenarios,
  selectedId,
  onSelect,
  isLoading = false,
}: ScenarioSelectorProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="h-10 w-[280px] bg-muted/70 rounded-full animate-pulse" />;
  }

  return (
    <Select value={selectedId} onValueChange={onSelect}>
      <SelectTrigger
        className="w-[280px] rounded-full text-sm font-semibold tracking-[0.04em]"
        data-testid="select-scenario"
        aria-label={t("scenarios.select")}
      >
        <SelectValue placeholder={t("scenarios.selectPlaceholder")} />
      </SelectTrigger>
      <SelectContent>
        {scenarios.map((scenario) => {
          const Icon = environmentIcons[scenario.environment.type] || Home;
          const displayTitle = getScenarioDisplayTitle(scenario, t);

          return (
            <SelectItem
              key={scenario.id}
              value={scenario.id}
              data-testid={`option-scenario-${scenario.id}`}
            >
              <div className="flex items-center gap-2 pr-2">
                <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{displayTitle}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
