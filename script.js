// Global variables
let originalImage = null;
let originalCanvas = document.getElementById('originalCanvas');
let recoloredCanvas = document.getElementById('recoloredCanvas');
let originalCtx = originalCanvas.getContext('2d');
let recoloredCtx = recoloredCanvas.getContext('2d');
let selectedColor = null;
let detectedColors = [];

// Event listeners
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('hueInput').addEventListener('input', syncSlider);
document.getElementById('saturationInput').addEventListener('input', syncSlider);
document.getElementById('valueInput').addEventListener('input', syncSlider);
document.getElementById('toleranceInput').addEventListener('input', syncSlider);
document.getElementById('hueSlider').addEventListener('input', syncInput);
document.getElementById('saturationSlider').addEventListener('input', syncInput);
document.getElementById('valueSlider').addEventListener('input', syncInput);
document.getElementById('toleranceSlider').addEventListener('input', syncInput);
document.getElementById('applyBtn').addEventListener('click', applyRecolor);
document.getElementById('downloadBtn').addEventListener('click', downloadImage);
document.getElementById('resetBtn').addEventListener('click', resetAll);

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = file.name;

    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage = new Image();
        originalImage.onload = function() {
            // Set canvas dimensions
            originalCanvas.width = originalImage.width;
            originalCanvas.height = originalImage.height;
            recoloredCanvas.width = originalImage.width;
            recoloredCanvas.height = originalImage.height;

            // Draw original image
            originalCtx.drawImage(originalImage, 0, 0);

            // Extract colors
            extractColors();

            // Show color section
            document.getElementById('colorSection').style.display = 'block';
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Extract dominant colors from image
function extractColors() {
    const imageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const pixels = imageData.data;
    const colorMap = {};

    // Sample every nth pixel for performance
    const step = 10;
    for (let i = 0; i < pixels.length; i += step * 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent pixels
        if (a < 128) continue;

        // Quantize colors to reduce variation
        const qr = Math.round(r / 20) * 20;
        const qg = Math.round(g / 20) * 20;
        const qb = Math.round(b / 20) * 20;
        const key = `${qr},${qg},${qb}`;

        colorMap[key] = (colorMap[key] || 0) + 1;
    }

    // Sort by frequency and get top colors
    detectedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([color]) => {
            const [r, g, b] = color.split(',').map(Number);
            return { r, g, b };
        });

    displayColorPalette();
}

// Display color palette
function displayColorPalette() {
    const palette = document.getElementById('colorPalette');
    palette.innerHTML = '';

    detectedColors.forEach((color, index) => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        colorBox.title = `RGB(${color.r}, ${color.g}, ${color.b})`;
        colorBox.addEventListener('click', () => selectColor(color, colorBox));
        palette.appendChild(colorBox);
    });
}

// Select a color for replacement
function selectColor(color, element) {
    selectedColor = color;

    // Update UI
    document.querySelectorAll('.color-box').forEach(box => box.classList.remove('selected'));
    element.classList.add('selected');

    const selectedBox = document.getElementById('selectedColorBox');
    selectedBox.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

    // Show control section
    document.getElementById('controlSection').style.display = 'block';

    // Set default target values based on selected color's HSV
    const hsv = rgbToHsv(color.r, color.g, color.b);
    document.getElementById('hueInput').value = Math.round(hsv.h);
    document.getElementById('saturationInput').value = Math.round(hsv.s);
    document.getElementById('valueInput').value = Math.round(hsv.v);
    syncSlider({ target: document.getElementById('hueInput') });
    syncSlider({ target: document.getElementById('saturationInput') });
    syncSlider({ target: document.getElementById('valueInput') });
}

// Sync slider with input
function syncSlider(event) {
    const input = event.target;
    const sliderId = input.id.replace('Input', 'Slider');
    document.getElementById(sliderId).value = input.value;
}

// Sync input with slider
function syncInput(event) {
    const slider = event.target;
    const inputId = slider.id.replace('Slider', 'Input');
    document.getElementById(inputId).value = slider.value;
}

// Apply recoloring
function applyRecolor() {
    if (!selectedColor || !originalImage) return;

    const targetHue = parseInt(document.getElementById('hueInput').value);
    const targetSat = parseInt(document.getElementById('saturationInput').value);
    const targetVal = parseInt(document.getElementById('valueInput').value);
    const tolerance = parseInt(document.getElementById('toleranceInput').value);

    // Get image data
    const imageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const pixels = imageData.data;

    // Process each pixel
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent pixels
        if (a < 10) continue;

        // Check if color matches selected color within tolerance
        const colorDistance = Math.sqrt(
            Math.pow(r - selectedColor.r, 2) +
            Math.pow(g - selectedColor.g, 2) +
            Math.pow(b - selectedColor.b, 2)
        );

        if (colorDistance <= tolerance * 2.5) {
            // Convert to HSV
            const hsv = rgbToHsv(r, g, b);

            // Replace with target HSV
            const newRgb = hsvToRgb(targetHue, targetSat, targetVal);

            pixels[i] = newRgb.r;
            pixels[i + 1] = newRgb.g;
            pixels[i + 2] = newRgb.b;
        }
    }

    // Draw recolored image
    recoloredCtx.putImageData(imageData, 0, 0);

    // Show download button
    document.getElementById('downloadBtn').style.display = 'inline-block';
}

// RGB to HSV conversion
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = max === 0 ? 0 : (diff / max) * 100;
    let v = max * 100;

    if (diff !== 0) {
        if (max === r) {
            h = 60 * (((g - b) / diff) % 6);
        } else if (max === g) {
            h = 60 * ((b - r) / diff + 2);
        } else {
            h = 60 * ((r - g) / diff + 4);
        }
    }

    if (h < 0) h += 360;

    return { h, s, v };
}

// HSV to RGB conversion
function hsvToRgb(h, s, v) {
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r, g, b;

    if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

// Download recolored image
function downloadImage() {
    const link = document.createElement('a');
    link.download = 'recolored-image.png';
    link.href = recoloredCanvas.toDataURL();
    link.click();
}

// Reset all
function resetAll() {
    selectedColor = null;
    detectedColors = [];
    document.getElementById('imageUpload').value = '';
    document.getElementById('fileName').textContent = '';
    document.getElementById('colorSection').style.display = 'none';
    document.getElementById('controlSection').style.display = 'none';
    document.getElementById('downloadBtn').style.display = 'none';
    originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    recoloredCtx.clearRect(0, 0, recoloredCanvas.width, recoloredCanvas.height);
}