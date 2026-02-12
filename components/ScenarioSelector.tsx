import React, { useState } from 'react';
import { Scenario } from '../constants';
import { ChevronDown, Check } from 'lucide-react';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  currentScenario: Scenario;
  onSelect: (scenario: Scenario) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ 
  scenarios, 
  currentScenario, 
  onSelect 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
      >
        <currentScenario.icon className="w-4 h-4 text-indigo-600" />
        <span className="hidden sm:inline">{currentScenario.label}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-2 border-b border-gray-50 mb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Scenario</span>
            </div>
            {scenarios.map((scenario) => {
              const Icon = scenario.icon;
              const isSelected = currentScenario.id === scenario.id;
              
              return (
                <button
                  key={scenario.id}
                  onClick={() => {
                    onSelect(scenario);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors
                    ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {scenario.label}
                      </span>
                      {isSelected && <Check size={14} className="text-indigo-600" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      {scenario.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};