'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Palette, Sparkles, Loader2, Check, ArrowRight, Wand2, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { toast } from 'sonner';

const stylePresets = [
  { id: 'modern', name: 'Modern', colors: ['#6366f1', '#8b5cf6', '#ffffff'], description: 'Clean and contemporary' },
  { id: 'playful', name: 'Playful', colors: ['#f472b6', '#fbbf24', '#34d399'], description: 'Fun and energetic' },
  { id: 'luxury', name: 'Luxury', colors: ['#1f2937', '#d4af37', '#ffffff'], description: 'Elegant and premium' },
  { id: 'bold', name: 'Bold', colors: ['#ef4444', '#000000', '#ffffff'], description: 'Strong and impactful' },
  { id: 'minimal', name: 'Minimal', colors: ['#18181b', '#71717a', '#ffffff'], description: 'Simple and refined' },
] as const;

export default function SetupStep() {
  const {
    adCount,
    productName, setProductName,
    brandName, setBrandName,
    watermark, setWatermark,
    colors, setColors,
    productImageUrl, setProductImageUrl,
    productAnalysis, setProductAnalysis,
    model, setModel,
    selectedStyle, setSelectedStyle,
    setStep,
  } = useStore();

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>(['#6366f1', '#8b5cf6', '#ffffff']);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const { url } = await response.json();
      setProductImageUrl(url);
      toast.success('Image uploaded successfully');

      // Analyze the product
      setIsAnalyzing(true);
      const analysisResponse = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json();
        setProductAnalysis(analysis);
        
        // Auto-fill fields from analysis
        if (analysis.brandName && !brandName) {
          setBrandName(analysis.brandName);
        }
        if (analysis.colors && analysis.colors.length > 0) {
          setColors(analysis.colors.slice(0, 3));
          setCustomColors(analysis.colors.slice(0, 3).map((c: any) => c.hex));
        }
        
        toast.success('Product analyzed! We detected brand colors and details.');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  }, [brandName, setBrandName, setColors, setProductAnalysis, setProductImageUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const applyStylePreset = (preset: typeof stylePresets[number]) => {
    setSelectedStyle(preset.id);
    setCustomColors(preset.colors);
    setColors(preset.colors.map((hex, i) => ({
      hex,
      name: i === 0 ? 'Primary' : i === 1 ? 'Secondary' : 'Accent'
    })));
  };

  const handleContinue = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    // Set colors if not already set
    if (colors.length === 0) {
      setColors(customColors.map((hex, i) => ({
        hex,
        name: i === 0 ? 'Primary' : i === 1 ? 'Secondary' : 'Accent'
      })));
    }

    // Generate the table
    toast.loading('Creating your ad concepts...', { id: 'generating' });
    
    try {
      const response = await fetch('/api/generate-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adCount,
          productName,
          brandName,
          watermark,
          colors: customColors,
          productAnalysis,
          style: selectedStyle,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');
      
      const { rows } = await response.json();
      useStore.getState().setRows(rows);
      toast.success('Ad concepts generated!', { id: 'generating' });
      setStep('review');
    } catch (error) {
      toast.error('Failed to generate ad concepts', { id: 'generating' });
    }
  };

  const canContinue = productName.trim().length > 0;

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-genesis-500/20 text-genesis-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Creating {adCount} ads
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tell us about your product</h2>
          <p className="text-zinc-400 text-lg">The more details you provide, the better your ads will be</p>
        </motion.div>

        <div className="space-y-8">
          {/* Product Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-genesis-400" />
              Product Image
              <span className="text-xs text-zinc-500 font-normal">(Recommended)</span>
            </h3>

            {productImageUrl ? (
              <div className="relative">
                <img
                  src={productImageUrl}
                  alt="Product"
                  className="w-full h-64 object-contain rounded-xl bg-surface-2"
                />
                <button
                  onClick={() => {
                    setProductImageUrl('');
                    setProductAnalysis(null);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-surface-0/80 hover:bg-surface-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {isAnalyzing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-0/80 rounded-xl">
                    <div className="flex items-center gap-3 text-genesis-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing product...</span>
                    </div>
                  </div>
                )}

                {productAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Product Analyzed</span>
                    </div>
                    <p className="text-sm text-zinc-300">{productAnalysis.visualDescription}</p>
                  </motion.div>
                )}
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  dragOver
                    ? 'border-genesis-500 bg-genesis-500/10'
                    : 'border-surface-3 hover:border-surface-4'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-genesis-400 animate-spin" />
                    <span className="text-zinc-400">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-300 mb-2">Drop your product image here</p>
                    <p className="text-sm text-zinc-500">or click to browse</p>
                  </>
                )}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-genesis-400" />
              Product Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Wireless Bluetooth Earbuds"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g., TechSound"
                  className="input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Watermark / Website
                </label>
                <input
                  type="text"
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  placeholder="e.g., www.techsound.com or @techsound"
                  className="input"
                />
              </div>
            </div>
          </motion.div>

          {/* Style Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-genesis-400" />
              Style & Colors
            </h3>

            {/* Style presets */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {stylePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyStylePreset(preset)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedStyle === preset.id
                      ? 'border-genesis-500 bg-genesis-500/10'
                      : 'border-surface-3 hover:border-surface-4'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    {preset.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="text-sm font-medium">{preset.name}</div>
                  <div className="text-xs text-zinc-500">{preset.description}</div>
                </button>
              ))}
            </div>

            {/* Custom colors */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-zinc-400">Custom colors:</span>
              {customColors.map((color, index) => (
                <div key={index} className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...customColors];
                      newColors[index] = e.target.value;
                      setCustomColors(newColors);
                    }}
                    className="sr-only"
                    id={`color-${index}`}
                  />
                  <label
                    htmlFor={`color-${index}`}
                    className="color-swatch block"
                    style={{ backgroundColor: color }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Model Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4">AI Model</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setModel('nano-banana')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  model === 'nano-banana'
                    ? 'border-genesis-500 bg-genesis-500/10'
                    : 'border-surface-3 hover:border-surface-4'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Nano Banana</span>
                  <span className="badge-info">Fast</span>
                </div>
                <p className="text-sm text-zinc-400">Quick generation, great for testing. ~10s per image.</p>
              </button>

              <button
                onClick={() => setModel('nano-banana-pro')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  model === 'nano-banana-pro'
                    ? 'border-genesis-500 bg-genesis-500/10'
                    : 'border-surface-3 hover:border-surface-4'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Nano Banana Pro</span>
                  <span className="badge-success">Best Quality</span>
                </div>
                <p className="text-sm text-zinc-400">4K output, better text rendering. ~20s per image.</p>
              </button>
            </div>
          </motion.div>

          {/* Continue button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end"
          >
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Ad Concepts
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
