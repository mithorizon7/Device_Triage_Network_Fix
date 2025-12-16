import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Building2, Hotel, Check } from "lucide-react";
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

export function ScenarioSelector({
  scenarios,
  selectedId,
  onSelect,
  isLoading = false
}: ScenarioSelectorProps) {
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
        aria-label="Select scenario"
      >
        <div className="flex items-center gap-2">
          {selectedScenario && (
            <>
              {(() => {
                const Icon = environmentIcons[selectedScenario.environment.type] || Home;
                return <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
              })()}
              <SelectValue placeholder="Select a scenario" />
            </>
          )}
          {!selectedScenario && <SelectValue placeholder="Select a scenario" />}
        </div>
      </SelectTrigger>
      <SelectContent>
        {scenarios.map((scenario) => {
          const Icon = environmentIcons[scenario.environment.type] || Home;
          const isSelected = scenario.id === selectedId;
          
          return (
            <SelectItem
              key={scenario.id}
              value={scenario.id}
              data-testid={`option-scenario-${scenario.id}`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{scenario.title}</span>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary ml-auto" aria-hidden="true" />
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
