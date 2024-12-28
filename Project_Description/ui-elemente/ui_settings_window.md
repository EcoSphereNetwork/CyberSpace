### Settings Window Entwicklungsplan

#### **Beschreibung**
Das **Settings Window** bietet Benutzern eine zentrale Schnittstelle zur Konfiguration der CyberSpace-Plattform. Es umfasst Systemeinstellungen, Benutzeranpassungen und erweiterte Optionen für Plugins und Netzwerkfunktionen. Dieses Fenster ist modular aufgebaut, sodass verschiedene Kategorien von Einstellungen klar strukturiert dargestellt werden.

---

### **HTML-Struktur**
```html
<div class="settings-window">
  <div class="settings-nav">
    <ul>
      <li class="nav-item active">Allgemein</li>
      <li class="nav-item">Darstellung</li>
      <li class="nav-item">Plugins</li>
      <li class="nav-item">Netzwerk</li>
      <li class="nav-item">Benutzer</li>
    </ul>
  </div>
  <div class="settings-content">
    <h2>Einstellungen - Allgemein</h2>
    <form>
      <label>
        Sprache:
        <select>
          <option>Deutsch</option>
          <option>Englisch</option>
        </select>
      </label>
      <label>
        Zeitzone:
        <input type="text" placeholder="GMT+1">
      </label>
    </form>
  </div>
  <div class="settings-controls">
    <button class="save-button">Speichern</button>
    <button class="cancel-button">Abbrechen</button>
    <button class="reset-button">Zurücksetzen</button>
  </div>
</div>
```

---

### **CSS-Styling**
```css
.settings-window {
  display: flex;
  width: 80%;
  margin: auto;
  background-color: #1a1a1a;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.settings-nav {
  width: 20%;
  background-color: #2a2a2a;
  padding: 10px;
  border-right: 1px solid #333;
}

.settings-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
}

.nav-item.active {
  background-color: #00cc66;
}

.nav-item:hover {
  background-color: #005533;
}

.settings-content {
  flex: 1;
  padding: 20px;
}

.settings-content h2 {
  margin-top: 0;
}

.settings-controls {
  padding: 10px;
  text-align: right;
  border-top: 1px solid #333;
}

button {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 5px;
  background-color: #00cc66;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #009944;
}

.cancel-button {
  background-color: #cc0000;
}

.cancel-button:hover {
  background-color: #990000;
}

.reset-button {
  background-color: #ffaa00;
}

.reset-button:hover {
  background-color: #cc8800;
}
```

---

### **JavaScript (Interaktivität)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const settingsContent = document.querySelector('.settings-content');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      // Entferne "active" von allen Nav-Items
      navItems.forEach((nav) => nav.classList.remove('active'));
      // Aktiviere das aktuelle Item
      item.classList.add('active');
      // Aktualisiere den Inhalt basierend auf der Auswahl
      const category = item.textContent;
      settingsContent.innerHTML = `<h2>Einstellungen - ${category}</h2><p>Inhalt für ${category} wird hier angezeigt.</p>`;
    });
  });

  const saveButton = document.querySelector('.save-button');
  const cancelButton = document.querySelector('.cancel-button');
  const resetButton = document.querySelector('.reset-button');

  saveButton.addEventListener('click', () => {
    alert('Einstellungen gespeichert!');
  });

  cancelButton.addEventListener('click', () => {
    alert('Änderungen verworfen!');
  });

  resetButton.addEventListener('click', () => {
    alert('Einstellungen zurückgesetzt!');
  });
});
```

