### Plugin Manager Window Entwicklungsplan

#### **Beschreibung**
Das **Plugin Manager Window** ist ein zentrales Interface zur Verwaltung und Steuerung von Plugins innerhalb der CyberSpace-Plattform. Es bietet Benutzern die Möglichkeit, Plugins zu installieren, zu aktivieren/deaktivieren, zu konfigurieren und zu aktualisieren. Dieses Modul unterstützt die Erweiterbarkeit der Plattform und ermöglicht eine hohe Flexibilität bei der Integration neuer Funktionen.

---

### **HTML-Struktur**
```html
<div class="plugin-manager">
  <div class="plugin-header">
    <h1>Plugin Manager</h1>
    <input type="text" id="pluginSearch" placeholder="Plugins suchen...">
  </div>
  <div class="plugin-content">
    <div class="plugin-list">
      <h2>Installierte Plugins</h2>
      <ul id="pluginList">
        <li class="plugin-item">
          <span class="plugin-name">Plugin A</span>
          <span class="plugin-version">v1.0.0</span>
          <button class="toggle-button">Deaktivieren</button>
          <button class="remove-button">Entfernen</button>
          <button class="configure-button">Konfigurieren</button>
        </li>
        <li class="plugin-item">
          <span class="plugin-name">Plugin B</span>
          <span class="plugin-version">v2.1.0</span>
          <button class="toggle-button">Aktivieren</button>
          <button class="remove-button">Entfernen</button>
          <button class="configure-button">Konfigurieren</button>
        </li>
      </ul>
    </div>
    <div class="plugin-details">
      <h2>Plugin Details</h2>
      <p id="pluginDescription">Wähle ein Plugin, um Details anzuzeigen.</p>
      <p id="pluginDeveloper">Entwickler: -</p>
      <p id="pluginCompatibility">Kompatibilität: -</p>
      <button id="updateButton">Aktualisieren</button>
    </div>
  </div>
  <div class="plugin-footer">
    <h2>Neues Plugin installieren</h2>
    <input type="file" id="pluginUpload">
    <button id="installButton">Installieren</button>
  </div>
</div>
```

---

### **CSS-Styling**
```css
.plugin-manager {
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  margin: auto;
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#pluginSearch {
  padding: 10px;
  border-radius: 5px;
  border: none;
  width: 300px;
}

.plugin-content {
  display: flex;
  margin-top: 20px;
}

.plugin-list {
  flex: 1;
  margin-right: 20px;
  background-color: #2a2a2a;
  padding: 10px;
  border-radius: 5px;
}

.plugin-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 5px;
  background-color: #333;
  border-radius: 5px;
}

.plugin-details {
  flex: 1;
  background-color: #2a2a2a;
  padding: 10px;
  border-radius: 5px;
}

.plugin-footer {
  margin-top: 20px;
  text-align: center;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: #00cc66;
  color: white;
  cursor: pointer;
  margin: 5px;
}

button:hover {
  background-color: #009944;
}
```

---

### **JavaScript (Interaktivität)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const pluginList = document.getElementById('pluginList');
  const pluginDescription = document.getElementById('pluginDescription');
  const pluginDeveloper = document.getElementById('pluginDeveloper');
  const pluginCompatibility = document.getElementById('pluginCompatibility');
  const updateButton = document.getElementById('updateButton');

  pluginList.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-button')) {
      const pluginName = e.target.parentElement.querySelector('.plugin-name').textContent;
      alert(`${pluginName} wurde ${e.target.textContent.toLowerCase()}!`);
      e.target.textContent = e.target.textContent === 'Aktivieren' ? 'Deaktivieren' : 'Aktivieren';
    } else if (e.target.classList.contains('remove-button')) {
      const pluginName = e.target.parentElement.querySelector('.plugin-name').textContent;
      alert(`${pluginName} wurde entfernt!`);
      e.target.parentElement.remove();
    } else if (e.target.classList.contains('configure-button')) {
      const pluginName = e.target.parentElement.querySelector('.plugin-name').textContent;
      pluginDescription.textContent = `Details zu ${pluginName}: Lorem ipsum...`;
      pluginDeveloper.textContent = 'Entwickler: CyberSpace Dev Team';
      pluginCompatibility.textContent = 'Kompatibilität: Version 1.0+';
    }
  });

  updateButton.addEventListener('click', () => {
    alert('Plugin wird aktualisiert!');
  });

  const installButton = document.getElementById('installButton');
  installButton.addEventListener('click', () => {
    const pluginUpload = document.getElementById('pluginUpload');
    if (pluginUpload.files.length > 0) {
      alert(`${pluginUpload.files[0].name} wird installiert...`);
    } else {
      alert('Bitte wählen Sie eine Datei aus.');
    }
  });
});
```

