'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Rocket, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';

const adCountOptions = [
  { count: 10 as const, label: 'Starter', description: 'Perfect for testing ideas', icon: Zap, color: 'from-blue-500 to-cyan-500' },
  { count: 20 as const, label: 'Growth', description: 'Ideal for A/B testing', icon: Rocket, color: 'from-genesis-500 to-fuchsia-500' },
  { count: 30 as const, label: 'Scale', description: 'Maximum creative variety', icon: Sparkles, color: 'from-orange-500 to-pink-500' },
];

export default function WelcomeStep() {
  const { setAdCount, setStep } = useStore();

  const handleSelect = (count: 10 | 20 | 30) => {
    setAdCount(count);
    setStep('setup');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-4xl mx-auto mb-16"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <Sparkles className="w-4 h-4 text-genesis-400" />
          <span className="text-sm text-zinc-300">AI-Powered Ad Generation</span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          <span className="gradient-text">Ad Genesis</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Transform your product into stunning ad creatives.
          <span className="text-white"> From concept to campaign in minutes.</span>
        </p>
      </motion.div>

      {/* Selection cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl"
      >
        <p className="text-center text-zinc-400 mb-8 text-lg">
          How many ad variations would you like to create?
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {adCountOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.count}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option.count)}
                className="group relative card-hover text-left"
              >
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"
                  style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                />

                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">{option.count}</span>
                  <span className="text-zinc-400 text-lg">ads</span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{option.label}</h3>
                <p className="text-zinc-400">{option.description}</p>

                <div className="flex items-center gap-2 mt-6 text-genesis-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-medium">Get started</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Features list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-20 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>AI-generated visuals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Product-aware designs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Instant Cloudinary hosting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Multiple style options</span>
        </div>
      </motion.div>
    </div>
  );
}
