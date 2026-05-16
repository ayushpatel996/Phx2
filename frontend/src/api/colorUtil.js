/**
 * Extracts a dominant/vibrant color from an image URL using the Canvas API.
 * This ensures the UI accent color matches the album art.
 */
export async function getDominantColor(imageUrl) {
  if (!imageUrl) return "rgb(29, 185, 84)";

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      // Smaller dimensions for faster processing
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      
      let r = 0, g = 0, b = 0;
      let count = 0;

      // Sample pixels, skipping every 4th to speed up and avoiding pure black/white
      for (let i = 0; i < data.length; i += 16) {
        const pr = data[i];
        const pg = data[i + 1];
        const pb = data[i + 2];
        
        // Filter out extremely dark or light pixels to get a more "representative" color
        const brightness = (pr * 299 + pg * 587 + pb * 114) / 1000;
        if (brightness > 30 && brightness < 220) {
          r += pr;
          g += pg;
          b += pb;
          count++;
        }
      }

      if (count === 0) {
        // Fallback to simple average if filter was too strict
        for (let i = 0; i < data.length; i += 16) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      // Enhance saturation slightly for "UI Pop"
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      
      if (diff < 50) {
        if (r === max) r = Math.min(255, r + 30);
        else if (g === max) g = Math.min(255, g + 30);
        else b = Math.min(255, b + 30);
      }

      resolve(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = () => {
      resolve("rgb(29, 185, 84)"); // Spotify Green fallback
    };
  });
}
