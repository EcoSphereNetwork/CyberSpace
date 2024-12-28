### Node Inspector Entwicklungsplan

#### **Beschreibung**
Der **Node Inspector** ist ein spezialisiertes Interface, das detaillierte Informationen über einen ausgewählten Node (z. B. Server, Datenbank, KI-Agent) im digitalen Layer der CyberSpace-Plattform anzeigt. Er dient der Analyse, Überwachung und Steuerung von Netzwerkressourcen.

---

### **HTML-Struktur**
```html
<div class="node-inspector">
  <div class="node-header">
    <h2 id="nodeName">Node-Name</h2>
    <p id="nodeType">Typ: Server</p>
    <p id="nodeStatus" class="status-online">Status: Online</p>
  </div>
  <div class="node-resources">
    <h3>Ressourcenübersicht</h3>
    <p>CPU-Auslastung: <span id="cpuUsage">45%</span></p>
    <p>Speicherverbrauch: <span id="memoryUsage">8GB/16GB</span></p>
    <p>Netzwerkauslastung: <span id="networkUsage">75Mbps/100Mbps</span></p>
  </div>
  <div class="node-connections">
    <h3>Verbindungen</h3>
    <ul id="connectionsList">
      <li>Ziel: Node B, Typ: Datenfluss, Latenz: 20ms, Datenrate: 50Mbps</li>
      <li>Ziel: Node C, Typ: Kontrollfluss, Latenz: 15ms, Datenrate: 30Mbps</li>
    </ul>
  </div>
  <div class="node-actions">
    <h3>Aktionen</h3>
    <button id="diagnoseNode">Diagnose starten</button>
    <button id="disconnectNode">Verbindung trennen</button>
    <button id="showLogs">Logs anzeigen</button>
    <button id="startApp">Anwendung starten</button>
  </div>
  <div class="node-details">
    <h3>Detailansicht</h3>
    <div id="resourceGraph">Graph: Historische Ressourcennutzung</div>
    <ul id="eventLog">
      <li>12:00 - Verbindung zu Node B hergestellt</li>
      <li>12:05 - Hohe CPU-Auslastung erkannt</li>
    </ul>
    <p id="securityStatus">Sicherheitsstatus: Keine Schwachstellen</p>
  </div>
</div>
```

---

### **CSS-Styling**
```css
.node-inspector {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
  padding: 20px;
  background-color: #1a1a1a;
  color: white;
  border-radius: 10px;
  width: 80%;
  margin: auto;
}

.node-header {
  grid-column: 1 / 4;
  text-align: center;
  background-color: #2a2a2a;
  padding: 10px;
  border-radius: 5px;
}

.status-online {
  color: green;
}

.status-offline {
  color: red;
}

.node-resources, .node-connections, .node-actions, .node-details {
  background-color: #2a2a2a;
  padding: 10px;
  border-radius: 5px;
}

.node-actions button {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: none;
  background-color: #00cc66;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.node-actions button:hover {
  background-color: #009944;
}

.node-details ul {
  list-style: none;
  padding: 0;
}

#resourceGraph {
  height: 150px;
  background-color: #333;
  margin-bottom: 10px;
}
```

---

### **JavaScript (Interaktivität)**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const diagnoseButton = document.getElementById('diagnoseNode');
  const disconnectButton = document.getElementById('disconnectNode');
  const showLogsButton = document.getElementById('showLogs');
  const startAppButton = document.getElementById('startApp');

  diagnoseButton.addEventListener('click', () => {
    alert('Diagnose gestartet!');
  });

  disconnectButton.addEventListener('click', () => {
    alert('Verbindung getrennt!');
  });

  showLogsButton.addEventListener('click', () => {
    alert('Logs werden angezeigt.');
  });

  startAppButton.addEventListener('click', () => {
    alert('Anwendung gestartet!');
  });

  // Simulieren von Echtzeitdaten für Ressourcen
  setInterval(() => {
    const cpuUsage = document.getElementById('cpuUsage');
    const memoryUsage = document.getElementById('memoryUsage');
    const networkUsage = document.getElementById('networkUsage');

    cpuUsage.textContent = `${Math.floor(Math.random() * 100)}%`;
    memoryUsage.textContent = `${Math.floor(Math.random() * 16)}GB/16GB`;
    networkUsage.textContent = `${Math.floor(Math.random() * 100)}Mbps/100Mbps`;
  }, 5000);
});
```

