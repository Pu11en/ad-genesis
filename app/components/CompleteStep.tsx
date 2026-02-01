'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Grid, LayoutGrid, Sparkles, Check, Copy, ExternalLink, X, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useStore } from '../lib/store';
import { toast } from 'sonner';

export default function CompleteStep() {
  const { rows, reset, setStep } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const completedRows = rows.filter(row => row.status === 'complete' && row.imageUrl);

  const downloadAll = async () => {
    toast.loading('Preparing download...', { id: 'download' });
    
    try {
      for (let i = 0; i < completedRows.length; i++) {
        const row = completedRows[i];
        if (!row.imageUrl) continue;
        
        const response = await fetch(row.imageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ad-${row.index}-${row.ad_copy.slice(0, 20).replace(/[^a-z0-9]/gi, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        await new Promise(r => setTimeout(r, 200));
      }
      
      toast.success('All images downloaded!', { id: 'download' });
    } catch (error) {
      toast.error('Download failed', { id: 'download' });
    }
  };

  const copyImageUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    toast.success('URL copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadSingle = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      
      toast.success('Image downloaded!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    if (direction === 'prev') {
      setSelectedImage(selectedImage > 0 ? selectedImage - 1 : completedRows.length - 1);
    } else {
      setSelectedImage(selectedImage < completedRows.length - 1 ? selectedImage + 1 : 0);
    }
  };

  const startOver = () => {
    reset();
    setStep('welcome');
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 mb-6 shadow-2xl shadow-emerald-500/30"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Ads Are Ready!</h2>
          <p className="text-zinc-400 text-lg mb-2">
            {completedRows.length} stunning ad creatives generated
          </p>
          <p className="text-zinc-500 text-sm">
            All images are hosted on Cloudinary and ready to use
          </p>
        </motion.div>

        {/* Action bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-genesis-500/20 text-genesis-400' : 'text-zinc-400 hover:text-white'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('large')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'large' ? 'bg-genesis-500/20 text-genesis-400' : 'text-zinc-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <span className="text-sm text-zinc-500">{completedRows.length} images</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={downloadAll} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download All
            </button>
            <button onClick={startOver} className="btn-primary flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Create More
            </button>
          </div>
        </motion.div>

        {/* Image gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {completedRows.map((row, index) => (
            <motion.div
              key={row.index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className="image-card group"
              onClick={() => setSelectedImage(index)}
            >
              <div className={`aspect-square ${viewMode === 'large' ? 'md:aspect-[4/3]' : ''}`}>
                <img
                  src={row.imageUrl}
                  alt={`Ad ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-sm font-medium mb-1 truncate">{row.ad_copy}</div>
                  <div className="text-xs text-zinc-400 truncate">{row.product}</div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyImageUrl(row.imageUrl!, index);
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSingle(row.imageUrl!, `ad-${row.index}.png`);
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <a
                      href={row.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Index badge */}
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-xs font-mono">
                {row.index}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage !== null && completedRows[selectedImage] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
              onClick={() => setSelectedImage(null)}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl max-h-[80vh] relative"
              >
                <img
                  src={completedRows[selectedImage].imageUrl}
                  alt={`Ad ${selectedImage + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl"
                />
                
                <div className="glass-strong rounded-xl p-4 mt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold mb-1">{completedRows[selectedImage].ad_copy}</div>
                      <div className="text-sm text-zinc-400">{completedRows[selectedImage].product}</div>
                      <div className="text-xs text-zinc-500 mt-2">{completedRows[selectedImage].visual_guide}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => copyImageUrl(completedRows[selectedImage].imageUrl!, selectedImage)}
                        className="btn-secondary flex items-center gap-2 text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copy URL
                      </button>
                      <button
                        onClick={() => downloadSingle(completedRows[selectedImage].imageUrl!, `ad-${completedRows[selectedImage].index}.png`)}
                        className="btn-primary flex items-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                {selectedImage + 1} / {completedRows.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center text-sm text-zinc-500"
        >
          <p>Generated with Ad Genesis • Powered by Kie.ai Nano Banana</p>
        </motion.div>
      </div>
    </div>
  );
}
