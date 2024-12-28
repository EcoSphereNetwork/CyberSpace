### Sidebar Entwicklungsplan

#### **Beschreibung**
Die Sidebar ist ein zentrales UI-Element, das Benutzern einen schnellen Zugriff auf erweiterte Funktionen und Datenanalysen bietet. Sie wird als vertikale Leiste am linken oder rechten Bildschirmrand positioniert und passt sich dynamisch dem aktiven Modus (z. B. Netzwerkansicht, Spielmodus) an.

---

### **HTML-Struktur**
```html
<div class="sidebar">
  <div class="sidebar-header">
    <h2>Sidebar</h2>
  </div>
  <div class="sidebar-section" id="logs">
    <h3>Logs</h3>
    <ul class="log-list">
      <li class="log-item">System gestartet</li>
      <li class="log-item">Netzwerkaktivität erkannt</li>
    </ul>
  </div>
  <div class="sidebar-section" id="resources">
    <h3>Ressourcen</h3>
    <p>Bandbreite: 75%</p>
    <p>Energie: 60%</p>
    <p>Speicher: 50%</p>
  </div>
  <div class="sidebar-section" id="filters">
    <h3>Filter</h3>
    <label><input type="checkbox" id="active-nodes"> Nur aktive Nodes</label>
    <label><input type="checkbox" id="critical-paths"> Kritische Verbindungen</label>
  </div>
  <div class="sidebar-section" id="search">
    <h3>Suche</h3>
    <input type="text" id="search-field" placeholder="Suchen...">
  </div>
</div>
```

---

### **CSS-Styling**
```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 300px;
  background-color: rgba(26, 26, 26, 0.9);
  color: white;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
  padding: 10px;
}

.sidebar-header {
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

.sidebar-section {
  margin-bottom: 20px;
}

.sidebar-section h3 {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.log-list {
  list-style: none;
  padding: 0;
}

.log-item {
  margin: 5px 0;
  padding: 5px;
  background-color: #2a2a2a;
  border-radius: 3px;
}

input[type="text"] {
  width: calc(100% - 20px);
  padding: 5px;
  border: 1px solid #333;
  border-radius: 3px;
  background-color: #2a2a2a;
  color: white;
}

input[type="checkbox"] {
  margin-right: 10px;
}
```

---

### **JavaScript (Interaktivität)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const activeNodesCheckbox = document.getElementById('active-nodes');
  const criticalPathsCheckbox = document.getElementById('critical-paths');
  const searchField = document.getElementById('search-field');
  const logList = document.querySelector('.log-list');

  activeNodesCheckbox.addEventListener('change', (e) => {
    console.log(`Nur aktive Nodes: ${e.target.checked}`);
  });

  criticalPathsCheckbox.addEventListener('change', (e) => {
    console.log(`Kritische Verbindungen: ${e.target.checked}`);
  });

  searchField.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const logItems = logList.querySelectorAll('.log-item');

    logItems.forEach((item) => {
      if (item.textContent.toLowerCase().includes(searchTerm)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
});
```

