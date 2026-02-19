import React from "react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventPitchFilters {
  windowSize: number;
  teamFilter: 'both' | 'home' | 'away';
}

interface EventPitchOptionsProps {
  filters: EventPitchFilters;
  onFiltersChange: (filters: EventPitchFilters) => void;
}

const EventPitchOptions: React.FC<EventPitchOptionsProps> = ({
  filters,
  onFiltersChange,
}) => {
  const windowOptions = [5, 10, 20];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="h-6 w-6 p-0 bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 group"
        >
          <Settings className="h-4 w-4 text-slate-300 group-hover:text-gray-300" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 ">
        <div className="space-y-4">
          {/* Selector de Tamaño de Ventana */}
          <div className="space-y-2">
            <Label htmlFor="window-size" className="text-sm font-medium">
              Tamaño de ventana
            </Label>
            <Select
              value={filters.windowSize.toString()}
              onValueChange={(value) => onFiltersChange({ ...filters, windowSize: parseInt(value) })}
            >
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {windowOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} eventos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Equipo */}
          <div className="space-y-2">
            <Label htmlFor="team-filter" className="text-sm font-medium">
              Equipo
            </Label>
            <Select
              value={filters.teamFilter}
              onValueChange={(value) => onFiltersChange({ ...filters, teamFilter: value as 'both' | 'home' | 'away' })}
            >
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Local</SelectItem>
                <SelectItem value="both">Ambos</SelectItem>
                <SelectItem value="away">Visitante</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { EventPitchFilters };

export default EventPitchOptions;
