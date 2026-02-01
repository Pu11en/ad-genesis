# 🎨 Ad Genesis

> AI-Powered Ad Creation Studio — From concept to campaign in minutes.

## ✨ Features

### 🎯 Smart Ad Generation
- **One-Click Creation**: Generate 10, 20, or 30 unique ad variations instantly
- **AI-Powered Concepts**: GPT-4o creates diverse ad copy, characters, and visual guides
- **Style Presets**: Choose from Modern, Playful, Luxury, Bold, or Minimal aesthetics
- **Custom Colors**: Use brand colors or let AI suggest palettes

### 🖼️ Product Intelligence
- **Image Upload**: Drop your product photo and let AI analyze it
- **Auto-Detection**: Automatically extracts brand colors, product details, and suggests ad characters
- **Visual Consistency**: Keeps your product looking perfect across all generated ads

### 🎨 AI Image Generation
- **Nano Banana**: Fast generation (~10s per image) at $0.02/image
- **Nano Banana Pro**: Premium quality with 4K output and better text rendering
- **Real-Time Progress**: Watch your ads generate with live previews
- **Pause & Resume**: Control the generation process

### 📤 Instant Delivery
- **Cloudinary Hosting**: All images automatically uploaded and optimized
- **One-Click Download**: Download individual images or all at once
- **Copy URLs**: Instant copy-to-clipboard for sharing
- **Gallery View**: Beautiful lightbox for reviewing your ads

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/ad-genesis.git
cd ad-genesis
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
OPENAI_API_KEY=sk-proj-your-openai-key
KIE_API_KEY=your-kie-ai-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🔑 Getting API Keys

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key

### Kie.ai (Nano Banana)
1. Sign up at [kie.ai](https://kie.ai)
2. Go to [kie.ai/api-key](https://kie.ai/api-key)
3. Generate your API key

### Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings
3. Copy Cloud Name, API Key, and API Secret

## 🎮 User Flow

```
WELCOME → Choose 10, 20, or 30 ads
    ↓
SETUP → Upload product, enter brand info, pick colors
    ↓
REVIEW → Edit AI-generated ad concepts table
    ↓
GENERATING → Watch real-time progress
    ↓
COMPLETE → Download gallery of finished ads
```

## 📊 API Costs

| Service | Cost | Usage |
|---------|------|-------|
| OpenAI GPT-4o | ~$0.01 | Per table generation |
| Nano Banana | $0.02 | Per image |
| Nano Banana Pro | $0.12 | Per image (4K) |
| Cloudinary | Free | 25GB storage |

**Example**: 20 ads with Nano Banana = ~$0.41 total

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

---

Built with ❤️ by Ad Genesis
