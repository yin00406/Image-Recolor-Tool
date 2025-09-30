# Image Recolor Tool

A web-based tool for precisely recoloring images, perfect for editing paper figures, diagrams, and illustrations.

## 🌟 Features

- **Automatic Color Detection**: Upload any image and the tool automatically extracts and displays the dominant colors
- **Intuitive Color Selection**: Click on any detected color to select it for replacement
- **Precise HSV Control**: Fine-tune your target color using HSV (Hue, Saturation, Value) parameters with both sliders and numeric inputs
- **Smart Color Matching**: Adjustable color tolerance to match similar shades of the selected color
- **Real-time Preview**: See both original and recolored images side-by-side
- **Easy Download**: Save your recolored image with one click

## 🚀 Live Demo

Visit the tool at: https://yin00406.github.io/Image-Recolor-Tool/

## 📖 How to Use

1. **Upload Image**: Click "Choose Image" and select the image you want to recolor
2. **Select Color**: Click on any color from the automatically detected color palette
3. **Adjust Target Color**:
   - **Hue (0-360)**: The color type (e.g., 0=red, 120=green, 240=blue)
   - **Saturation (0-100%)**: Color intensity (0=gray, 100=vivid)
   - **Value (0-100%)**: Brightness level (0=black, 100=bright)
4. **Set Color Tolerance (0-100)**: Controls how similar colors are matched for replacement
   - **Low tolerance (0-20)**: Only matches colors very close to the selected color (more precise, less coverage)
   - **Medium tolerance (20-50)**: Matches moderately similar colors (balanced approach)
   - **High tolerance (50-100)**: Matches a wide range of similar colors (less precise, more coverage)
   - **Tip**: Start with tolerance around 30 and adjust based on results. Increase if not enough pixels are recolored, decrease if too many unwanted pixels are affected.
5. **Apply**: Click "Apply Recolor" to see the result
6. **Download**: Save your recolored image as PNG

## 🎯 Use Cases

- Recoloring figures and diagrams for academic papers
- Adjusting color schemes in illustrations
- Standardizing colors across multiple images
- Creating color variants of graphics
- Fixing color inconsistencies in visual materials

## 🛠️ Technical Details

- Pure client-side processing (no server required, images never uploaded)
- HTML5 Canvas API for image manipulation
- RGB to HSV color space conversion for precise control
- Responsive design for desktop and mobile devices