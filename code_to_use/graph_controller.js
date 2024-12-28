// graph_controller.js

document.addEventListener('DOMContentLoaded', () => {
    const layoutSelect = document.getElementById('layout-select');
    const zoomSlider = document.getElementById('zoom-slider');
    const transparencyCheckbox = document.getElementById('transparency-checkbox');
  
    layoutSelect.addEventListener('change', (e) => {
      console.log(`Layout geändert zu: ${e.target.value}`);
      // Implement layout switching logic here
    });
  
    zoomSlider.addEventListener('input', (e) => {
      const scale = e.target.value;
      const graph = document.getElementById('graph-visualization');
      graph.style.transform = `scale(${scale})`;
    });
  
    transparencyCheckbox.addEventListener('change', (e) => {
      const isTransparent = e.target.checked;
      const graphElements = document.querySelectorAll('#graph-visualization *');
      graphElements.forEach((element) => {
        element.style.opacity = isTransparent ? '0.5' : '1';
      });
    });
  
    document.getElementById('disable-node-btn').addEventListener('click', () => {
      console.log('Node deaktivieren Aktion ausgelöst');
      // Add node disabling logic here
    });
  
    document.getElementById('set-priority-btn').addEventListener('click', () => {
      console.log('Ressourcenpriorität setzen Aktion ausgelöst');
      // Add resource priority logic here
    });
  
    document.getElementById('enhance-connection-btn').addEventListener('click', () => {
      console.log('Verbindung verstärken Aktion ausgelöst');
      // Add connection enhancement logic here
    });
  
    document.getElementById('remove-connection-btn').addEventListener('click', () => {
      console.log('Verbindung entfernen Aktion ausgelöst');
      // Add connection removal logic here
    });
  
    document.getElementById('show-heatmap-btn').addEventListener('click', () => {
      console.log('Heatmap anzeigen Aktion ausgelöst');
      // Add heatmap display logic here
    });
  
    document.getElementById('export-data-btn').addEventListener('click', () => {
      console.log('Daten exportieren Aktion ausgelöst');
      // Add data export logic here
    });
  });
  