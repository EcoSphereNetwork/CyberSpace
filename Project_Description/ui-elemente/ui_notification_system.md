### Notification System Entwicklungsplan

#### **Beschreibung**
Das **Notification System** ist ein UI-Element, das Benutzern in Echtzeit wichtige Ereignisse und Statusänderungen anzeigt. Es umfasst Benachrichtigungen zu Angriffen, Missionsfortschritten, Systemwarnungen und Erfolgen. Die Benachrichtigungen sind kontextsensitiv und bieten Optionen zur weiteren Interaktion.

---

### **Elemente**

#### **1. Benachrichtigungsleiste (oben rechts)**
- **Funktion:** Zeigt eine kompakte Liste der letzten Benachrichtigungen.
- **Elemente:**
  - **Symbol:** Visualisiert den Benachrichtigungstyp (z. B. Erfolg, Warnung, Fehler).
  - **Kurztext:** Zeigt eine kurze Beschreibung des Ereignisses.
  - **Zeitstempel:** Gibt den Zeitpunkt des Ereignisses an.

#### **2. Detaillierte Benachrichtigung (Popup)**
- **Funktion:** Zeigt erweiterte Informationen zu einer ausgewählten Benachrichtigung.
- **Elemente:**
  - **Titel:** Beschreibung des Ereignisses (z. B. "Node 5 erfolgreich gehackt").
  - **Details:** Weitere Informationen zum Ereignis, wie Auswirkungen und beteiligte Ressourcen.
  - **Buttons:** Aktionen wie "Zur Szene springen" oder "Details anzeigen".

#### **3. Toast-Benachrichtigungen (unten rechts)**
- **Funktion:** Kurzzeitige Hinweise, die automatisch verschwinden.
- **Elemente:**
  - **Titel:** Kurzbeschreibung des Ereignisses.
  - **Icon:** Typenspezifisches Symbol (z. B. Schild für Verteidigung, Blitz für Angriff).

#### **4. Filteroptionen (oben links)**
- **Funktion:** Ermöglicht das Anpassen der angezeigten Benachrichtigungen.
- **Elemente:**
  - **Checkboxen:** Auswahl von Kategorien (z. B. "Nur Fehler anzeigen").
  - **Dropdown-Menü:** Filter nach Zeitraum oder Typ (z. B. "Letzte Stunde").

#### **5. Benachrichtigungsverlauf (zusätzliches Fenster)**
- **Funktion:** Zeigt alle bisherigen Benachrichtigungen chronologisch an.
- **Elemente:**
  - **Suchfeld:** Ermöglicht die Suche nach bestimmten Ereignissen.
  - **Export-Option:** Speichert den Verlauf als Datei (z. B. CSV).

---

### **Funktionen**

1. **Echtzeit-Benachrichtigungen:**
   - Sofortige Anzeige neuer Ereignisse.

2. **Interaktive Aktionen:**
   - Direkte Aktionen aus Benachrichtigungen heraus (z. B. Überprüfen von Angriffen).

3. **Anpassbare Filter:**
   - Benutzer können Benachrichtigungen nach Typ, Dringlichkeit oder Zeitraum filtern.

4. **Automatische Priorisierung:**
   - Kritische Warnungen werden hervorgehoben (z. B. rot für Angriffe).

---

### **Design**

- **Farbschema:**
  - Dunkler Hintergrund mit kontrastreichen Farben für Typen (grün = Erfolg, gelb = Warnung, rot = Fehler).
- **Icons:**
  - Klar erkennbare Symbole für Ereignistypen.
- **Animationen:**
  - Ein- und Ausblenden von Toast-Benachrichtigungen.
  - Sanfte Slide-in-Effekte für neue Einträge in der Benachrichtigungsleiste.

---

### **Technische Details**

- **Framework:** HTML, CSS und JavaScript (z. B. React).
- **API-Anbindung:**
  - RESTful API oder WebSocket-Unterstützung für Echtzeitdaten.
  - Verbindung zum Backend für den Abruf und die Verwaltung von Benachrichtigungen.
- **Datenstruktur:**
  - Jede Benachrichtigung enthält:
    - Typ
    - Zeitstempel
    - Titel
    - Details

---

### **HTML-Struktur**
```html
<div class="notification-system">
  <div class="notification-bar">
    <ul id="notification-list">
      <li class="notification-item">
        <span class="notification-icon success">✔</span>
        <span class="notification-text">Mission abgeschlossen!</span>
        <span class="notification-timestamp">vor 2 Minuten</span>
      </li>
    </ul>
  </div>
  <div class="toast-notifications" id="toast-container"></div>
  <div class="notification-filters">
    <label><input type="checkbox" id="filter-errors"> Nur Fehler anzeigen</label>
    <label><input type="checkbox" id="filter-warnings"> Nur Warnungen anzeigen</label>
    <select id="time-filter">
      <option>Letzte Stunde</option>
      <option>Letzte 24 Stunden</option>
      <option>Letzte Woche</option>
    </select>
  </div>
</div>
```

### **CSS-Styling**
```css
.notification-system {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 300px;
  background-color: #1a1a1a;
  color: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.notification-bar {
  max-height: 200px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid #333;
}

.notification-item .notification-icon {
  margin-right: 10px;
}

.toast-notifications {
  position: fixed;
  bottom: 20px;
  right: 20px;
  max-width: 300px;
}

.toast-notification {
  background-color: #2a2a2a;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
  animation: slide-in 0.5s ease-out;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### **JavaScript (Interaktivität)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const notificationList = document.getElementById('notification-list');
  const toastContainer = document.getElementById('toast-container');

  function addNotification(type, text) {
    const li = document.createElement('li');
    li.classList.add('notification-item');

    const icon = document.createElement('span');
    icon.classList.add('notification-icon', type);
    icon.textContent = type === 'success' ? '✔' : type === 'warning' ? '⚠' : '!';

    const message = document.createElement('span');
    message.classList.add('notification-text');
    message.textContent = text;

    const timestamp = document.createElement('span');
    timestamp.classList.add('notification-timestamp');
    timestamp.textContent = 'vor wenigen Sekunden';

    li.appendChild(icon);
    li.appendChild(message);
    li.appendChild(timestamp);
    notificationList.appendChild(li);

    showToast(type, text);
  }

  function showToast(type, text) {
    const toast = document.createElement('div');
    toast.classList.add('toast-notification');
    toast.textContent = `${type.toUpperCase()}: ${text}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Example usage
  setInterval(() => {
    addNotification('success', 'Neue Mission abgeschlossen!');
  }, 10000);
});
```

