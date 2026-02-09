import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EventWindowSelectorProps {
  windowSize: number;
  onWindowSizeChange: (size: number) => void;
}

const EventWindowSelector: React.FC<EventWindowSelectorProps> = ({
  windowSize,
  onWindowSizeChange,
}) => {
  const options = [
    { value: '5', label: 'Últimos 5 eventos' },
    { value: '10', label: 'Últimos 10 eventos' },
    { value: '20', label: 'Últimos 20 eventos' },
    { value: '50', label: 'Últimos 50 eventos' },
  ];

  return (
    <Select
      value={windowSize.toString()}
      onValueChange={(value) => onWindowSizeChange(Number(value))}
    >
      <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
        <SelectValue placeholder="Seleccionar ventana" />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700">
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="text-white"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default EventWindowSelector;
