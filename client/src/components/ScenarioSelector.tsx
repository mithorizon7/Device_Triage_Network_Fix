import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Building2, Hotel } from "lucide-react";
import type { Scenario } from "@shared/schema";

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
  public: Hotel
};

const builtInScenarioTitleKeys: Record<string, string> = {
  "family_iot_sprawl_v1": "scenarios.familyIoT",
  "small_office_v1": "scenarios.smallOffice",
  "hotel_public_v1": "scenarios.hotelPublic"
};

export function ScenarioSelector({
  scenarios,
  selectedId,
  onSelect,
  isLoading = false
}: ScenarioSelectorProps) {
  const { t } = useTranslation();
  const selectedScenario = scenarios.find(s => s.id === selectedId);

  if (isLoading) {
    return (
      <div className="h-9 w-[280px] bg-muted rounded-md animate-pulse" />
    );
  }

  return (
    <Select value={selectedId} onValueChange={onSelect}>
      <SelectTrigger 
        className="w-[280px]"
        data-testid="select-scenario"
        aria-label={t('scenarios.select')}
      >
        <SelectValue placeholder={t('scenarios.selectPlaceholder')} />
      </SelectTrigger>
      <SelectContent>
        {scenarios.map((scenario) => {
          const Icon = environmentIcons[scenario.environment.type] || Home;
          const titleKey = builtInScenarioTitleKeys[scenario.id];
          const displayTitle = titleKey ? t(titleKey) : scenario.title;
          
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
