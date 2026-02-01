'use client';

import { useStore } from './lib/store';
import WelcomeStep from './components/WelcomeStep';
import SetupStep from './components/SetupStep';
import ReviewStep from './components/ReviewStep';
import GeneratingStep from './components/GeneratingStep';
import CompleteStep from './components/CompleteStep';
import StepIndicator from './components/StepIndicator';

export default function Home() {
  const { currentStep } = useStore();

  return (
    <div className="min-h-screen">
      {/* Floating orbs for atmosphere */}
      <div className="floating-orb w-96 h-96 bg-genesis-500 -top-48 -left-48" />
      <div className="floating-orb w-64 h-64 bg-fuchsia-500 top-1/3 -right-32" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-80 h-80 bg-pink-500 -bottom-40 left-1/4" style={{ animationDelay: '4s' }} />

      {/* Step indicator - shown after welcome */}
      {currentStep !== 'welcome' && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="glass-strong border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <StepIndicator />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={currentStep !== 'welcome' ? 'pt-24' : ''}>
        {currentStep === 'welcome' && <WelcomeStep />}
        {currentStep === 'setup' && <SetupStep />}
        {currentStep === 'review' && <ReviewStep />}
        {currentStep === 'generating' && <GeneratingStep />}
        {currentStep === 'complete' && <CompleteStep />}
      </div>
    </div>
  );
}
