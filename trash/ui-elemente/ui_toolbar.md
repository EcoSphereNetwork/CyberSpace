### Toolbar Entwicklungsplan

#### **Beschreibung**
Die Toolbar ist ein UI-Bestandteil, der Benutzern schnellen Zugriff auf oft genutzte Funktionen innerhalb der CyberSpace-Plattform bietet. Sie ist kontextsensitiv und kann an spezifische Ansichten (z. B. 3D-Szene, Missionen) angepasst werden.

---

### **HTML-Struktur**
```html
<div class="toolbar">
  <button class="toolbar-button" id="zoomIn">🔍+</button>
  <button class="toolbar-button" id="zoomOut">🔍-</button>
  <button class="toolbar-button" id="resetCamera">🔄</button>
  <div class="toolbar-dropdown">
    <button class="toolbar-button" id="layerSwitch">🌐 Layer</button>
    <ul class="dropdown-menu">
      <li><input type="radio" name="layer" id="physicalLayer" checked> Physisches Layer</li>
      <li><input type="radio" name="layer" id="digitalLayer"> Digitales Layer</li>
      <li><input type="radio" name="layer" id="hybridLayer"> Hybrid-Layer</li>
    </ul>
  </div>
  <button class="toolbar-button" id="help">❓</button>
</div>
```

---

### **CSS-Styling**
```css
.toolbar {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  background-color: rgba(26, 26, 26, 0.9);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.toolbar-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.2em;
  margin: 0 5px;
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
}

.toolbar-button:hover {
  transform: scale(1.1);
  color: #00cc66;
}

.toolbar-dropdown {
  position: relative;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #333;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.toolbar-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu li {
  list-style: none;
  padding: 5px;
}

.dropdown-menu li:hover {
  background-color: #444;
}
```

---

### **JavaScript (Interaktivität)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const zoomInButton = document.getElementById('zoomIn');
  const zoomOutButton = document.getElementById('zoomOut');
  const resetCameraButton = document.getElementById('resetCamera');
  const layerRadios = document.querySelectorAll('input[name="layer"]');
  const helpButton = document.getElementById('help');

  zoomInButton.addEventListener('click', () => {
    alert('Zoom In aktiviert!');
  });

  zoomOutButton.addEventListener('click', () => {
    alert('Zoom Out aktiviert!');
  });

  resetCameraButton.addEventListener('click', () => {
    alert('Kamera zurückgesetzt!');
  });

  layerRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      alert(`${radio.id} aktiviert!`);
    });
  });

  helpButton.addEventListener('click', () => {
    alert('Hilfe wird geöffnet.');
  });
});
```

