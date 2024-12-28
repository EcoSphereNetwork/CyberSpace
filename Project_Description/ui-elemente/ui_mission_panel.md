### Mission Panel Entwicklungsplan

#### **Beschreibung**
Das **Mission Panel** dient als zentraler Knotenpunkt für die Verwaltung, Überwachung und Steuerung von Missionen innerhalb des CyberWar-Games. Es bietet den Benutzern eine Übersicht über aktive, abgeschlossene und bevorstehende Missionen sowie die jeweiligen Ziele, Belohnungen und Fortschritte.

---

### **Elemente**

#### **1. Missionsliste (zentral)**
- **Funktion:** Zeigt alle relevanten Missionen in einer sortierbaren Liste an.
- **Elemente:**
  - **Missionstitel:** Der Name der Mission.
  - **Status:** Aktiver, abgeschlossener oder bevorstehender Zustand mit visueller Farbmarkierung.
  - **Belohnungen:** Punkte, Ressourcen oder Upgrades, die für das Abschließen der Mission vergeben werden.
  - **Fortschrittsanzeige:** Ein Balkendiagramm oder Prozentsatz, der den Fortschritt der Mission zeigt.

#### **2. Missionsdetails (rechts)**
- **Funktion:** Zeigt detaillierte Informationen über die ausgewählte Mission.
- **Elemente:**
  - **Beschreibung:** Zusammenfassung der Missionsziele und Anforderungen.
  - **Teilaufgaben:** Eine Liste mit spezifischen Aufgaben und ihrem jeweiligen Status.
  - **Zeitlimit:** Verbleibende Zeit zur Erfüllung der Mission (falls zutreffend).
  - **Belohnungsvorschau:** Detaillierte Aufschlüsselung der Belohnungen.

#### **3. Steuerungsbereich (oben)**
- **Funktion:** Bietet Werkzeuge zur Missionsverwaltung.
- **Elemente:**
  - **Filteroptionen:**
    - Status (aktiv, abgeschlossen, bevorstehend).
    - Schwierigkeitsgrad (leicht, mittel, schwer).
  - **Sortierfunktionen:**
    - Alphabetisch, nach Fortschritt oder nach Belohnung.
  - **Neustart-Button:** Option, um eine Mission neu zu starten (falls erlaubt).

#### **4. Aktionen und Interaktionen (unten)**
- **Funktion:** Ermöglicht direkte Interaktionen mit Missionen.
- **Elemente:**
  - **Start-/Fortsetzen-Button:** Startet oder setzt die Mission fort.
  - **Abbrechen-Button:** Bricht die Mission ab.
  - **Freigeben-Button:** Teilt die Mission mit Teammitgliedern.

---

### **HTML-Struktur**
```html
<div class="mission-panel">
  <div class="mission-header">
    <h1>Missionen</h1>
    <div class="filters">
      <select>
        <option>Status: Alle</option>
        <option>Status: Aktiv</option>
        <option>Status: Abgeschlossen</option>
        <option>Status: Bevorstehend</option>
      </select>
      <select>
        <option>Schwierigkeit: Alle</option>
        <option>Leicht</option>
        <option>Mittel</option>
        <option>Schwer</option>
      </select>
    </div>
  </div>
  <div class="mission-content">
    <div class="mission-list">
      <ul>
        <li class="mission-item active">
          <span class="mission-title">Mission 1</span>
          <span class="mission-progress">75%</span>
        </li>
        <li class="mission-item completed">
          <span class="mission-title">Mission 2</span>
          <span class="mission-progress">100%</span>
        </li>
        <li class="mission-item upcoming">
          <span class="mission-title">Mission 3</span>
          <span class="mission-progress">0%</span>
        </li>
      </ul>
    </div>
    <div class="mission-details">
      <h2>Mission Details</h2>
      <p><strong>Ziel:</strong> Sammle 100 Punkte</p>
      <p><strong>Status:</strong> Aktiv</p>
      <p><strong>Belohnungen:</strong> 500 Punkte, 3 Ressourcen</p>
      <div class="mission-tasks">
        <h3>Teilaufgaben:</h3>
        <ul>
          <li>Aufgabe 1: Erledigt</li>
          <li>Aufgabe 2: Offen</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="mission-actions">
    <button class="start-button">Starten</button>
    <button class="cancel-button">Abbrechen</button>
    <button class="share-button">Teilen</button>
  </div>
</div>
```

### **CSS-Styling**
```css
.mission-panel {
  background-color: #1a1a1a;
  color: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  margin: auto;
}

.mission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters select {
  margin-left: 10px;
  padding: 5px;
  border-radius: 5px;
}

.mission-content {
  display: flex;
  margin-top: 20px;
}

.mission-list {
  flex: 1;
  margin-right: 20px;
}

.mission-item {
  padding: 10px;
  margin-bottom: 5px;
  background-color: #2a2a2a;
  border-radius: 5px;
  cursor: pointer;
}

.mission-item.active {
  border-left: 5px solid green;
}

.mission-item.completed {
  border-left: 5px solid blue;
  opacity: 0.7;
}

.mission-item.upcoming {
  border-left: 5px solid orange;
}

.mission-details {
  flex: 2;
  background-color: #2a2a2a;
  padding: 10px;
  border-radius: 5px;
}

.mission-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  background-color: #00cc66;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #009944;
}
```

### **JavaScript (Interaktivität)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const missionItems = document.querySelectorAll('.mission-item');
  const missionDetails = document.querySelector('.mission-details');
  const startButton = document.querySelector('.start-button');
  const cancelButton = document.querySelector('.cancel-button');
  const shareButton = document.querySelector('.share-button');

  missionItems.forEach((item) => {
    item.addEventListener('click', () => {
      missionDetails.querySelector('h2').textContent = `Details zu ${item.querySelector('.mission-title').textContent}`;
      missionDetails.querySelector('p:nth-child(2)').innerHTML = '<strong>Status:</strong> ' + item.className.split(' ')[1];
    });
  });

  startButton.addEventListener('click', () => {
    alert('Mission gestartet!');
  });

  cancelButton.addEventListener('click', () => {
    alert('Mission abgebrochen!');
  });

  shareButton.addEventListener('click', () => {
    alert('Mission geteilt!');
  });
});
```

