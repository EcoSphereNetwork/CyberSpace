### Minimap Entwicklungsplan

#### **Beschreibung**
Die **Minimap** ist ein kompaktes, interaktives Overlay, das eine Übersicht über die gesamte 3D-Szene bietet. Sie hilft Benutzern, sich in großen Szenen zurechtzufinden, indem sie eine vereinfachte Ansicht von Objekten, Nodes, Verbindungen und wichtigen Markierungen bereitstellt. Die Minimap ist besonders nützlich für die Navigation und das schnelle Auffinden spezifischer Bereiche.

---

### **Elemente**

#### **1. Kartendarstellung (zentral)**
- **Funktion:** Zeigt eine vereinfachte 2D- oder isometrische Ansicht der gesamten Szene.
- **Elemente:**
  - **Nodes:** Punkte oder Symbole, die Objekte wie Server, Geräte oder Agenten repräsentieren.
  - **Verbindungen:** Linien, die Netzwerkpfade oder Datenströme anzeigen.
  - **Markierungen:** Hervorhebung wichtiger Punkte (z. B. Ziele, Bedrohungen).
  - **Kameraansicht:** Rechteck, das den aktuellen Sichtbereich des Benutzers darstellt.

#### **2. Navigationssteuerung (unten rechts)**
- **Funktion:** Ermöglicht das schnelle Navigieren durch die Szene.
- **Elemente:**
  - **Zoom-In/Out-Buttons:** Vergrößerung oder Verkleinerung der Minimap.
  - **Verschiebefunktion:** Drag-and-Drop, um den Sichtbereich zu verschieben.

#### **3. Filteroptionen (oben rechts)**
- **Funktion:** Ermöglicht das Ein- oder Ausblenden bestimmter Elemente auf der Minimap.
- **Elemente:**
  - **Checkboxen:**
    - Nodes anzeigen/ausblenden.
    - Verbindungen anzeigen/ausblenden.
    - Bedrohungen anzeigen/ausblenden.
  - **Dropdown-Menü:** Auswahl spezifischer Kategorien (z. B. nur aktive Nodes).

#### **4. Statusanzeige (unten)**
- **Funktion:** Zeigt relevante Informationen zur aktuellen Szene.
- **Elemente:**
  - **Aktive Nodes:** Anzahl der aktiven Nodes in der Szene.
  - **Verbindungen:** Gesamtanzahl der Verbindungen.
  - **Warnungen:** Anzahl der aktuellen Bedrohungen oder Anomalien.

---

### **Funktionen**

1. **Navigationshilfe:**
   - Direkte Steuerung der Kameraansicht durch Interaktion mit der Minimap.

2. **Schnelle Orientierung:**
   - Zeigt in Echtzeit die Position und Bewegungen von Objekten.

3. **Filterung:**
   - Benutzer können die angezeigten Informationen auf der Minimap anpassen.

4. **Interaktion:**
   - Klick auf ein Element in der Minimap zentriert die Kamera auf dieses Objekt in der 3D-Szene.

---

### **Design**
- **Farbschema:**
  - Dunkler Hintergrund mit farblich hervorgehobenen Nodes und Verbindungen.
- **Layout:**
  - Rechteckiges oder quadratisches Overlay in einer Ecke der Benutzeroberfläche.
- **Animationen:**
  - Sanfte Aktualisierung bei Bewegungen oder Zustandsänderungen.

---

### **Technische Details**
- **Framework:** HTML, CSS und JavaScript (z. B. React oder Three.js).
- **Datenquellen:**
  - Direkte Synchronisierung mit der 3D-Szenen-Engine.
  - Nutzung von WebSockets für Echtzeit-Updates.
- **Performance:**
  - Optimierung für minimale Ressourcennutzung bei großen Szenen.

---

### **HTML-Struktur**
```html
<div class="minimap-container">
  <div class="minimap">
    <canvas id="minimapCanvas"></canvas>
  </div>
  <div class="minimap-controls">
    <button id="zoom-in">+</button>
    <button id="zoom-out">-</button>
  </div>
  <div class="minimap-filters">
    <label><input type="checkbox" id="toggle-nodes" checked> Nodes anzeigen</label>
    <label><input type="checkbox" id="toggle-connections" checked> Verbindungen anzeigen</label>
    <label><input type="checkbox" id="toggle-threats" checked> Bedrohungen anzeigen</label>
  </div>
  <div class="minimap-status">
    <p>Aktive Nodes: <span id="active-nodes">0</span></p>
    <p>Verbindungen: <span id="connections">0</span></p>
    <p>Warnungen: <span id="threats">0</span></p>
  </div>
</div>
```

### **CSS-Styling**
```css
.minimap-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #1a1a1a;
  color: white;
  border-radius: 8px;
  padding: 10px;
  width: 250px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.minimap {
  position: relative;
  height: 150px;
  background-color: #2a2a2a;
  border: 1px solid #333;
  border-radius: 5px;
}

.minimap canvas {
  width: 100%;
  height: 100%;
}

.minimap-controls {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.minimap-controls button {
  background-color: #333;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
}

.minimap-controls button:hover {
  background-color: #555;
}

.minimap-filters {
  margin-top: 10px;
}

.minimap-status {
  margin-top: 10px;
  font-size: 0.9em;
}
```

### **JavaScript (Interaktivität)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('minimapCanvas');
  const ctx = canvas.getContext('2d');

  const nodes = [
    { x: 50, y: 50, type: 'node', active: true },
    { x: 100, y: 100, type: 'node', active: false },
  ];

  const connections = [
    { from: nodes[0], to: nodes[1] },
  ];

  function drawMinimap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    connections.forEach((connection) => {
      ctx.beginPath();
      ctx.moveTo(connection.from.x, connection.from.y);
      ctx.lineTo(connection.to.x, connection.to.y);
      ctx.strokeStyle = '#00ffcc';
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = node.active ? '#00cc00' : '#666';
      ctx.fill();
    });
  }

  drawMinimap();

  // Zoom controls
  document.getElementById('zoom-in').addEventListener('click', () => {
    console.log('Zoom in');
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    console.log('Zoom out');
  });

  // Filter controls
  document.getElementById('toggle-nodes').addEventListener('change', (e) => {
    console.log(`Nodes visibility: ${e.target.checked}`);
  });

  document.getElementById('toggle-connections').addEventListener('change', (e) => {
    console.log(`Connections visibility: ${e.target.checked}`);
  });

  document.getElementById('toggle-threats').addEventListener('change', (e) => {
    console.log(`Threats visibility: ${e.target.checked}`);
  });
});
```

