'use client';

import { motion } from 'framer-motion';
import { Check, Settings, Table, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '../lib/store';

const steps = [
  { id: 'setup', label: 'Setup', icon: Settings },
  { id: 'review', label: 'Review', icon: Table },
  { id: 'generating', label: 'Generate', icon: Loader2 },
  { id: 'complete', label: 'Complete', icon: Sparkles },
];

export default function StepIndicator() {
  const { currentStep, generationProgress } = useStore();

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;
        const isGenerating = step.id === 'generating' && isActive;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted 
                    ? 'rgb(16 185 129)' 
                    : isActive 
                      ? 'rgb(217 70 239)' 
                      : 'rgb(39 39 42)',
                }}
                className={`step-indicator ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              <span className={`text-xs mt-2 font-medium transition-colors ${
                isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-zinc-500'
              }`}>
                {step.label}
              </span>
              {isGenerating && (
                <span className="text-[10px] text-genesis-400 mt-0.5">
                  {Math.round(generationProgress)}%
                </span>
              )}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="w-16 h-0.5 mx-3 mt-[-20px] relative overflow-hidden rounded-full bg-surface-3">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{
                    width: isCompleted ? '100%' : isActive && step.id === 'generating' ? `${generationProgress}%` : '0%'
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-genesis-500"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
