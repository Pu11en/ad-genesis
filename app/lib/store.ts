import { create } from 'zustand';

export interface AdRow {
  index: string;
  ad_copy: string;
  product: string;
  character: string;
  visual_guide: string;
  text_watermark: string;
  color_1: string;
  color_2: string;
  color_3: string;
  status?: 'pending' | 'generating' | 'complete' | 'error';
  imageUrl?: string;
  taskId?: string;
}

export interface ProductAnalysis {
  brandName: string;
  colors: { hex: string; name: string }[];
  visualDescription: string;
  suggestedCharacters: string[];
  productType: string;
}

interface AppState {
  // Step tracking
  currentStep: 'welcome' | 'setup' | 'review' | 'generating' | 'complete';
  setStep: (step: AppState['currentStep']) => void;

  // Configuration
  adCount: 10 | 20 | 30;
  setAdCount: (count: 10 | 20 | 30) => void;
  
  productName: string;
  setProductName: (name: string) => void;
  
  brandName: string;
  setBrandName: (name: string) => void;
  
  watermark: string;
  setWatermark: (watermark: string) => void;
  
  colors: { hex: string; name: string }[];
  setColors: (colors: { hex: string; name: string }[]) => void;
  
  // Product image
  productImageUrl: string;
  setProductImageUrl: (url: string) => void;
  
  productAnalysis: ProductAnalysis | null;
  setProductAnalysis: (analysis: ProductAnalysis | null) => void;

  // Model selection
  model: 'nano-banana' | 'nano-banana-pro';
  setModel: (model: 'nano-banana' | 'nano-banana-pro') => void;

  // Ad rows
  rows: AdRow[];
  setRows: (rows: AdRow[]) => void;
  updateRow: (index: number, updates: Partial<AdRow>) => void;
  regenerateRow: (index: number) => void;

  // Generation progress
  generationProgress: number;
  setGenerationProgress: (progress: number) => void;
  
  completedImages: string[];
  addCompletedImage: (url: string) => void;
  
  // Style presets
  selectedStyle: 'modern' | 'playful' | 'luxury' | 'bold' | 'minimal';
  setSelectedStyle: (style: AppState['selectedStyle']) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentStep: 'welcome' as const,
  adCount: 10 as const,
  productName: '',
  brandName: '',
  watermark: '',
  colors: [] as { hex: string; name: string }[],
  productImageUrl: '',
  productAnalysis: null,
  model: 'nano-banana' as const,
  rows: [] as AdRow[],
  generationProgress: 0,
  completedImages: [] as string[],
  selectedStyle: 'modern' as const,
};

export const useStore = create<AppState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  setAdCount: (count) => set({ adCount: count }),
  setProductName: (name) => set({ productName: name }),
  setBrandName: (name) => set({ brandName: name }),
  setWatermark: (watermark) => set({ watermark }),
  setColors: (colors) => set({ colors }),
  setProductImageUrl: (url) => set({ productImageUrl: url }),
  setProductAnalysis: (analysis) => set({ productAnalysis: analysis }),
  setModel: (model) => set({ model }),
  setRows: (rows) => set({ rows }),
  updateRow: (index, updates) =>
    set((state) => ({
      rows: state.rows.map((row, i) =>
        i === index ? { ...row, ...updates } : row
      ),
    })),
  regenerateRow: (index) =>
    set((state) => ({
      rows: state.rows.map((row, i) =>
        i === index ? { ...row, status: 'pending', imageUrl: undefined } : row
      ),
    })),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  addCompletedImage: (url) =>
    set((state) => ({ completedImages: [...state.completedImages, url] })),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  reset: () => set(initialState),
}));
