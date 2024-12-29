### 3D Scene Context Menu Entwicklungsplan

#### **Beschreibung**
Das **3D Scene Context Menu** ist ein kontextsensitives Menü, das bei einem Rechtsklick auf Objekte in der 3D-Szene erscheint. Es bietet Benutzern schnelle Zugriffsmöglichkeiten auf spezifische Aktionen und Einstellungen für Nodes, Verbindungen oder andere interaktive Elemente in der Szene.

---

### **Elemente**

#### **1. Objektinformationen (oben)**
- **Funktion:** Zeigt grundlegende Informationen über das angeklickte Objekt.
- **Elemente:**
  - **Name des Objekts:** Eindeutiger Bezeichner des Nodes oder der Verbindung.
  - **Typ des Objekts:** (z. B. Server, KI-Agent, Datenbank).
  - **Statusanzeige:** Visuelle Darstellung von Zustand oder Aktivität (z. B. Online/Offline).

#### **2. Aktionsliste (zentral)**
- **Funktion:** Bietet spezifische Aktionen für das ausgewählte Objekt.
- **Elemente:**
  - **Node-Aktionen:**
    - "Verbindung trennen": Beendet eine aktive Verbindung.
    - "Diagnose starten": Führt eine Systemanalyse durch.
    - "Logs anzeigen": Öffnet das Ereignisprotokoll für das Objekt.
  - **Verbindungsaktionen:**
    - "Bandbreite priorisieren": Reserviert mehr Ressourcen für diese Verbindung.
    - "Blockieren": Unterbricht den Datenfluss.

#### **3. Erweiterte Optionen (unten)**
- **Funktion:** Zusätzliche Konfigurations- und Anpassungsmöglichkeiten.
- **Elemente:**
  - **Transparenz einstellen:** Anpassung der Sichtbarkeit des Objekts.
  - **Eigenschaften bearbeiten:** Öffnet ein Fenster für detaillierte Einstellungen.
  - **Notiz hinzufügen:** Ermöglicht Benutzern, Kommentare oder Markierungen zu hinterlegen.

#### **4. Kontext-Hilfe (unten rechts)**
- **Funktion:** Bietet Erklärungen zu den Menüpunkten.
- **Elemente:**
  - **Tooltipps:** Kurze Hinweise bei Hover.
  - **Link zu Dokumentation:** Führt zu einem detaillierten Handbuch.

---

### **HTML-Struktur**
```html
<div class="context-menu" id="contextMenu">
  <div class="menu-header">
    <span id="objectName">Objektname</span>
    <span id="objectType">Objekttyp</span>
    <span id="objectStatus">Status: Online</span>
  </div>
  <ul class="menu-actions">
    <li>Verbindung trennen</li>
    <li>Diagnose starten</li>
    <li>Logs anzeigen</li>
  </ul>
  <div class="menu-options">
    <button>Transparenz einstellen</button>
    <button>Eigenschaften bearbeiten</button>
    <button>Notiz hinzufügen</button>
  </div>
  <div class="menu-help">
    <span>Tooltipps anzeigen</span>
    <a href="#">Dokumentation</a>
  </div>
</div>
```

---

### **CSS-Styling**
```css
.context-menu {
  position: absolute;
  background-color: #1a1a1a;
  color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: none;
  z-index: 1000;
}

.menu-header {
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.menu-actions li {
  list-style: none;
  padding: 5px 0;
  cursor: pointer;
  border-bottom: 1px solid #333;
}

.menu-actions li:hover {
  background-color: #00cc66;
}

.menu-options button {
  display: block;
  width: 100%;
  margin: 5px 0;
  padding: 5px;
  background-color: #333;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 3px;
}

.menu-options button:hover {
  background-color: #00cc66;
}

.menu-help {
  margin-top: 10px;
  font-size: 0.8em;
  text-align: right;
}

.menu-help a {
  color: #00ccff;
}

.menu-help a:hover {
  text-decoration: underline;
}
```

---

### **JavaScript (Interaktivität)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const contextMenu = document.getElementById('contextMenu');

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    const { clientX: mouseX, clientY: mouseY } = e;
    contextMenu.style.top = `${mouseY}px`;
    contextMenu.style.left = `${mouseX}px`;
    contextMenu.style.display = 'block';
  });

  document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
  });

  const menuActions = document.querySelectorAll('.menu-actions li');
  menuActions.forEach((action) => {
    action.addEventListener('click', (e) => {
      alert(`${e.target.textContent} ausgeführt.`);
      contextMenu.style.display = 'none';
    });
  });

  const transparencyButton = document.querySelector('.menu-options button:nth-child(1)');
  transparencyButton.addEventListener('click', () => {
    alert('Transparenz eingestellt.');
  });
});
```

