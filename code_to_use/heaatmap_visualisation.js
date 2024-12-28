// heatmap_visualization.js

/**
 * Heatmap Visualization: Renders a heatmap to visualize resource usage or network activity.
 * This module uses a canvas to dynamically draw heatmaps based on provided data.
 */

/**
 * Renders a heatmap on the provided canvas element.
 * @param {HTMLCanvasElement} canvas - The canvas element to draw the heatmap.
 * @param {Array} data - Array of data points {x, y, value}, where value influences the intensity.
 * @param {Object} options - Configuration options (width, height, maxIntensity).
 */
export function renderHeatmap(canvas, data, options = { width: 500, height: 500, maxIntensity: 100 }) {
    const ctx = canvas.getContext('2d');
    const { width, height, maxIntensity } = options;
  
    canvas.width = width;
    canvas.height = height;
  
    // Clear previous heatmap
    ctx.clearRect(0, 0, width, height);
  
    // Draw heatmap
    data.forEach(({ x, y, value }) => {
      const intensity = Math.min(value / maxIntensity, 1);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
  
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  /** Example Usage */
  (function exampleHeatmap() {
    const canvas = document.createElement('canvas');
    canvas.style.border = '1px solid #ddd';
    canvas.style.margin = '20px';
    document.body.appendChild(canvas);
  
    const sampleData = [
      { x: 100, y: 150, value: 30 },
      { x: 200, y: 250, value: 70 },
      { x: 300, y: 100, value: 100 },
      { x: 400, y: 300, value: 50 },
    ];
  
    renderHeatmap(canvas, sampleData, { width: 500, height: 500, maxIntensity: 100 });
  })();
  