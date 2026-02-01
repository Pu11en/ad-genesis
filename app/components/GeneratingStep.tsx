'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, AlertCircle, Sparkles, Pause, Play, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';
import { toast } from 'sonner';

interface GenerationTask {
  rowIndex: number;
  taskId: string;
  status: 'queued' | 'generating' | 'complete' | 'error';
  imageUrl?: string;
  error?: string;
}

export default function GeneratingStep() {
  const { rows, updateRow, model, productImageUrl, setStep, generationProgress, setGenerationProgress } = useStore();
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const completedCount = tasks.filter(t => t.status === 'complete').length;
  const errorCount = tasks.filter(t => t.status === 'error').length;
  const progress = rows.length > 0 ? (completedCount / rows.length) * 100 : 0;

  // Start generation on mount
  useEffect(() => {
    startGeneration();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Update progress
  useEffect(() => {
    setGenerationProgress(progress);
    if (completedCount === rows.length && rows.length > 0) {
      setTimeout(() => setStep('complete'), 1500);
    }
  }, [completedCount, rows.length, progress]);

  const startGeneration = async () => {
    // Initialize all tasks as queued
    const initialTasks: GenerationTask[] = rows.map((_, index) => ({
      rowIndex: index,
      taskId: '',
      status: 'queued',
    }));
    setTasks(initialTasks);

    // Start generating one at a time (to respect rate limits)
    for (let i = 0; i < rows.length; i++) {
      if (isPaused) {
        setCurrentIndex(i);
        break;
      }
      await generateRow(i);
      // Small delay between requests
      await new Promise(r => setTimeout(r, 1000));
    }
  };

  const generateRow = async (index: number) => {
    const row = rows[index];
    
    // Update status to generating
    setTasks(prev => prev.map((t, i) => 
      i === index ? { ...t, status: 'generating' } : t
    ));

    try {
      // Create the image generation task
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row,
          model,
          productImageUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to create task');

      const { taskId } = await response.json();
      
      // Update task with ID
      setTasks(prev => prev.map((t, i) => 
        i === index ? { ...t, taskId } : t
      ));

      // Poll for completion
      const imageUrl = await pollTaskStatus(taskId, index);
      
      if (imageUrl) {
        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(imageUrl, index);
        
        // Update row with image
        updateRow(index, { imageUrl: cloudinaryUrl, status: 'complete' });
        
        setTasks(prev => prev.map((t, i) => 
          i === index ? { ...t, status: 'complete', imageUrl: cloudinaryUrl } : t
        ));
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setTasks(prev => prev.map((t, i) => 
        i === index ? { ...t, status: 'error', error: error.message } : t
      ));
      updateRow(index, { status: 'error' });
    }
  };

  const pollTaskStatus = async (taskId: string, rowIndex: number): Promise<string | null> => {
    const maxAttempts = 60; // 2 minutes max
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(r => setTimeout(r, 2000));
      
      try {
        const response = await fetch(`/api/task-status?taskId=${taskId}`);
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data.status === 'success' && data.imageUrl) {
          return data.imageUrl;
        }
        
        if (data.status === 'fail') {
          throw new Error(data.error || 'Generation failed');
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    }
    
    throw new Error('Generation timed out');
  };

  const uploadToCloudinary = async (imageUrl: string, index: number): Promise<string> => {
    const response = await fetch('/api/cloudinary-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl,
        publicId: `ad-genesis/ad-${Date.now()}-${index}`,
      }),
    });

    if (!response.ok) throw new Error('Failed to upload to Cloudinary');
    
    const { url } = await response.json();
    return url;
  };

  const retryFailed = async () => {
    const failedIndices = tasks
      .filter(t => t.status === 'error')
      .map(t => t.rowIndex);
    
    for (const index of failedIndices) {
      await generateRow(index);
      await new Promise(r => setTimeout(r, 1000));
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      // Resume from current index
      (async () => {
        for (let i = currentIndex; i < rows.length; i++) {
          if (tasks[i].status !== 'queued') continue;
          await generateRow(i);
          await new Promise(r => setTimeout(r, 1000));
        }
      })();
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-5 h-5 text-genesis-400" />
            <span className="text-sm">Generating with {model === 'nano-banana-pro' ? 'Nano Banana Pro' : 'Nano Banana'}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Creating Your Ads</h2>
          <p className="text-zinc-400 text-lg">
            Sit back and watch the magic happen
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold gradient-text">{completedCount}/{rows.length}</div>
              <div className="text-zinc-400">
                <div className="text-sm">Ads generated</div>
                {errorCount > 0 && (
                  <div className="text-red-400 text-xs">{errorCount} failed</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {errorCount > 0 && (
                <button
                  onClick={retryFailed}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Failed
                </button>
              )}
              <button
                onClick={togglePause}
                className="btn-secondary flex items-center gap-2"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
          </div>

          <div className="progress-bar">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex justify-between text-xs text-zinc-500 mt-2">
            <span>0%</span>
            <span>{Math.round(progress)}%</span>
            <span>100%</span>
          </div>
        </motion.div>

        {/* Image grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="aspect-square rounded-xl overflow-hidden bg-surface-2 border border-surface-3 relative"
              >
                {task.status === 'complete' && task.imageUrl ? (
                  <>
                    <img
                      src={task.imageUrl}
                      alt={`Ad ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="text-xs font-medium truncate">{rows[index]?.ad_copy}</div>
                    </div>
                  </>
                ) : task.status === 'generating' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-genesis-500/30" />
                      <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-genesis-500 border-t-transparent animate-spin" />
                    </div>
                    <span className="text-xs text-zinc-400 mt-3">Generating...</span>
                  </div>
                ) : task.status === 'error' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <span className="text-xs">Failed</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                    <div className="text-3xl font-bold opacity-20">{index + 1}</div>
                    <span className="text-xs">Queued</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Estimated time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-sm text-zinc-500"
        >
          <p>
            Estimated time remaining: ~{Math.ceil((rows.length - completedCount) * (model === 'nano-banana-pro' ? 20 : 10) / 60)} min
          </p>
        </motion.div>
      </div>
    </div>
  );
}
