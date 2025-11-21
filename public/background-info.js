/* 
 * BACKGROUND LAYER STRUCTURE
 * ==========================
 * 
 * The CareerLens app uses a 3-layer background system:
 * 
 * Layer 1 (z-index: -20) - Your Custom Background
 *   └─ Static or animated image from /public/background.jpg or .gif
 *   └─ Low opacity (0.15) for subtle effect
 *   └─ Fixed position, covers entire viewport
 * 
 * Layer 2 (z-index: -10) - Animated Gradient Overlay
 *   └─ Slow-moving gradient animation
 *   └─ Blends neon colors (cyan, purple, emerald)
 *   └─ 80% opacity to soften custom background
 * 
 * Layer 3 (z-index: 0+) - UI Content
 *   └─ All your pages, components, cards
 *   └─ Glass effects with backdrop-blur
 *   └─ Readable on any background
 * 
 * CUSTOMIZATION QUICK REFERENCE
 * ==============================
 * 
 * File: src/app/layout.tsx
 * 
 * 1. Change background image:
 *    backgroundImage: 'url(/background.jpg)' → 'url(/your-image.gif)'
 * 
 * 2. Adjust visibility:
 *    opacity: 0.15 → 0.1 (subtle) or 0.3 (strong)
 * 
 * 3. Change position:
 *    bg-center → bg-top, bg-bottom, bg-left, bg-right
 * 
 * 4. Change sizing:
 *    bg-cover → bg-contain (fit without crop)
 * 
 * 5. Disable animated gradient (more visible background):
 *    opacity-80 → opacity-50 or opacity-30
 * 
 * PERFORMANCE TIPS
 * ================
 * - Keep JPG files under 2MB
 * - Keep GIF files under 5MB
 * - Use optimized/compressed images
 * - Test on mobile devices
 * - Avoid heavy animations in GIFs
 * 
 */

// This file is for documentation purposes only
// Actual implementation is in src/app/layout.tsx
