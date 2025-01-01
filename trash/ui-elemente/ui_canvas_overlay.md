### Canvas Overlay Entwicklungsplan

#### **Beschreibung**
Das **Canvas Overlay** ist ein dynamisches UI-Modul, das über der Haupt-3D-Szene liegt und zusätzliche Informationen, interaktive Elemente und Werkzeuge bereitstellt. Es bietet eine flexible Darstellung für Layer-Visualisierungen, interaktive Markierungen und erweiterte Funktionen wie Echtzeitdatenanzeigen.

---

### **HTML-Struktur**
```html
<div class="canvas-overlay">
  <div class="layer-control">
    <h3>Layer-Kontrolle</h3>
    <label>
      <input type="checkbox" id="physicalLayer" checked> Physisches Layer
    </label>
    <label>
      <input type="checkbox" id="digitalLayer" checked> Digitales Layer
    </label>
    <label>
      <input type="checkbox" id="hybridLayer" checked> Hybrid-Layer
    </label>
    <label>
      Transparenz:
      <input type="range" id="layerTransparency" min="0" max="100" value="100">
    </label>
  </div>
  <div class="marking-manager">
    <h3>Markierungs-Manager</h3>
    <input type="text" id="searchMarkings" placeholder="Markierungen suchen">
    <ul id="markingsList">
      <li>Knoten A</li>
      <li>Knoten B</li>
    </ul>
    <button id="addMarking">Markierung hinzufügen</button>
    <button id="removeMarking">Markierung entfernen</button>
  </div>
  <div class="data-overlays">
    <h3>Echtzeit-Daten</h3>
    <p id="resourceUsage">Ressourcen: 75%</p>
    <p id="connectionStatus">Verbindungen: Stabil</p>
  </div>
  <div class="context-menu">
    <h3>Kontext-Menü</h3>
    <button id="cameraPerspective">Perspektive wechseln</button>
    <button id="filterNodes">Filter anwenden</button>
  </div>
</div>
```

---

### **CSS-Styling**
```css
.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  color: white;
}

.layer-control, .marking-manager, .data-overlays, .context-menu {
  background-color: rgba(26, 26, 26, 0.8);
  padding: 10px;
  border-radius: 5px;
  pointer-events: auto;
}

.layer-control {
  position: absolute;
  top: 10px;
  right: 10px;
}

.marking-manager {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
}

.data-overlays {
  position: absolute;
  top: 10px;
  left: 10px;
}

.context-menu {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

button {
  margin: 5px 0;
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  background-color: #00cc66;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #009944;
}

input[type="text"] {
  width: 100%;
  padding: 5px;
  border: 1px solid #333;
  border-radius: 3px;
}

input[type="range"] {
  width: 100%;
}
```

---

### **JavaScript (Interaktivität)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const physicalLayerCheckbox = document.getElementById('physicalLayer');
  const digitalLayerCheckbox = document.getElementById('digitalLayer');
  const hybridLayerCheckbox = document.getElementById('hybridLayer');
  const transparencySlider = document.getElementById('layerTransparency');
  const markingsList = document.getElementById('markingsList');
  const addMarkingButton = document.getElementById('addMarking');
  const removeMarkingButton = document.getElementById('removeMarking');

  physicalLayerCheckbox.addEventListener('change', () => {
    alert(`Physisches Layer ${physicalLayerCheckbox.checked ? 'aktiviert' : 'deaktiviert'}`);
  });

  digitalLayerCheckbox.addEventListener('change', () => {
    alert(`Digitales Layer ${digitalLayerCheckbox.checked ? 'aktiviert' : 'deaktiviert'}`);
  });

  hybridLayerCheckbox.addEventListener('change', () => {
    alert(`Hybrid-Layer ${hybridLayerCheckbox.checked ? 'aktiviert' : 'deaktiviert'}`);
  });

  transparencySlider.addEventListener('input', (e) => {
    const transparency = e.target.value;
    alert(`Transparenz geändert: ${transparency}%`);
  });

  addMarkingButton.addEventListener('click', () => {
    const newMarking = prompt('Name der neuen Markierung:');
    if (newMarking) {
      const li = document.createElement('li');
      li.textContent = newMarking;
      markingsList.appendChild(li);
    }
  });

  removeMarkingButton.addEventListener('click', () => {
    if (markingsList.lastElementChild) {
      markingsList.removeChild(markingsList.lastElementChild);
    }
  });
});
```

