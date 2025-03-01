# **API-Architektur für CyberSpace**
Basierend auf den Analyseergebnissen und dem Entwicklungsplan erstelle ich hier die **technische API-Architektur für CyberSpace**. Diese Architektur stellt die **Basis für Echtzeit-Datenverarbeitung, Nutzerverwaltung, NFT-Synchronisation und die NovaProtocol-Integration** bereit.

---

## **🔹 1. API-Übersicht**
Die **CyberSpace API** basiert auf einer **modularen Microservice-Architektur** mit einer Kombination aus **REST-API für persistente Daten & WebSockets für Echtzeit-Synchronisation**.

### **Technologie-Stack**
| **Komponente** | **Technologie** |
|---------------|----------------|
| **Backend** | Node.js mit Express.js oder NestJS |
| **Datenbank** | MongoDB oder PostgreSQL |
| **Echtzeit-Synchronisation** | WebSockets mit Socket.IO oder Firebase |
| **Authentifizierung** | OAuth 2.0 oder JWT-Token |
| **NFT-Integration** | Smart Contracts (Ethereum / Polygon) |

---

## **🔹 2. API-Architektur & Komponenten**
Die API besteht aus mehreren **modularen Diensten**, die verschiedene Funktionalitäten bereitstellen.

### **📌 API-Struktur & Dienste**
```
+-------------------------------------------------------+
| CyberSpace API Gateway (GraphQL/REST, Auth, Rate-Limit)  |
+-------------------------------------------------------+
|  User Service   |  NFT Service   |  Spaces Service   |  NovaProtocol API  |
|-----------------|---------------|-------------------|------------------|
| - Login/Auth    | - NFT Mapping  | - 3D-Spaces Mgmt | - Game Portals   |
| - Profile Mgmt  | - NFT Trading  | - Asset Mgmt     | - API Bridge     |
| - Roles & Perm  | - Blockchain Tx| - Geocaching     | - WebRTC-Support |
+-----------------+---------------+-------------------+------------------+
|                         Database Layer (MongoDB/PostgreSQL)               |
+-------------------------------------------------------+
|                        WebSocket Server (Socket.IO)                         |
+-------------------------------------------------------+
```

---

## **🔹 3. API-Endpunkte & Funktionsweise**
Hier sind die **wichtigsten Endpunkte** für die API, unterteilt nach Services.

---

### **📌 3.1. Nutzerverwaltung & Authentifizierung**
📌 **Ziel:** Sichere Nutzer-Authentifizierung mit **OAuth 2.0 oder JWT-Token**.

🔹 **Registrierung**
```http
POST /api/auth/register
```
**📌 Request:**
```json
{
  "username": "PlayerOne",
  "email": "player@example.com",
  "password": "securePassword123"
}
```
**📌 Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1..."
}
```

🔹 **Login**
```http
POST /api/auth/login
```
**📌 Request:**
```json
{
  "email": "player@example.com",
  "password": "securePassword123"
}
```
**📌 Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1..."
}
```

🔹 **Nutzerinformationen abrufen**
```http
GET /api/user/profile
```
**📌 Response:**
```json
{
  "user_id": "12345",
  "username": "PlayerOne",
  "email": "player@example.com",
  "nft_inventory": ["nft_weapon_01", "nft_ticket_123"]
}
```

---

### **📌 3.2. NFT-Management & Marktplatz**
📌 **Ziel:** Verwaltung von **NFTs, Geocaching-Mechanik & Handelsoptionen**.

🔹 **NFT an einem Ort platzieren**
```http
POST /api/nft/place
```
**📌 Request:**
```json
{
  "user_id": "12345",
  "nft_id": "nft_weapon_01",
  "location": {
    "lat": 48.1371,
    "lng": 11.5754
  }
}
```
**📌 Response:**
```json
{
  "message": "NFT successfully placed",
  "location_id": "xyz-5678"
}
```

🔹 **NFT-Marktplatz anzeigen**
```http
GET /api/nft/marketplace
```
**📌 Response:**
```json
[
  {
    "nft_id": "nft_weapon_01",
    "owner": "PlayerOne",
    "price": "0.05 ETH",
    "location": "Virtual Space"
  },
  {
    "nft_id": "nft_artwork_03",
    "owner": "PlayerTwo",
    "price": "0.2 ETH",
    "location": "Munich, Germany"
  }
]
```

---

### **📌 3.3. Spaces & digitale Umgebungen**
📌 **Ziel:** Erstellen & Verwalten von **virtuellen Räumen für User & Unternehmen**.

🔹 **Neuen digitalen Space erstellen**
```http
POST /api/spaces/create
```
**📌 Request:**
```json
{
  "user_id": "12345",
  "space_name": "CyberLounge",
  "description": "Virtual meeting place",
  "access_type": "public"
}
```
**📌 Response:**
```json
{
  "message": "Space created successfully",
  "space_id": "space-5678"
}
```

🔹 **Space-Details abrufen**
```http
GET /api/spaces/{space_id}
```
**📌 Response:**
```json
{
  "space_id": "space-5678",
  "space_name": "CyberLounge",
  "owner": "PlayerOne",
  "participants": ["PlayerOne", "PlayerTwo"]
}
```

---

### **📌 3.4. NovaProtocol-Integration**
📌 **Ziel:** Verbindung zwischen **CyberSpace & NovaProtocol** für nahtlose Übergänge.

🔹 **Portal zu NovaProtocol betreten**
```http
POST /api/portal/enter
```
**📌 Request:**
```json
{
  "user_id": "12345",
  "portal_id": "CSGO-Planet"
}
```
**📌 Response:**
```json
{
  "message": "Entering NovaProtocol Planet",
  "session_url": "https://novaprotocol.com/planets/CSGO-Planet"
}
```

---

## **🔹 4. WebSocket-Echtzeit-Daten (Multiplayer & Live-Synchronisation)**
📌 **Ziel:** Echtzeit-Updates für **NFT-Funde, digitale Räume & Events**.

🔹 **WebSocket-Verbindung aufbauen**
```javascript
const socket = io("https://cyberspace-api.com");

socket.emit("join_space", { user_id: "12345", space_id: "space-5678" });

socket.on("new_nft", (data) => {
  console.log(`NFT ${data.nft_id} gefunden bei ${data.location}`);
});
```

---

## **🚀 Fazit & Nächste Schritte**
📌 **Kurzfristige Entwicklung (1-3 Monate)**:
✅ **Backend-Server mit Express/NestJS aufsetzen**.  
✅ **Datenbank-Modelle für NFTs, User & Spaces implementieren**.  
✅ **Authentifizierung mit OAuth oder JWT einfügen**.  

📌 **Mittelfristige Entwicklung (4-6 Monate)**:
✅ **WebSocket-Support für Echtzeit-Daten entwickeln**.  
✅ **NFT-Marktplatz & API-Schnittstellen für NovaProtocol vervollständigen**.  

📌 **Langfristige Erweiterungen (6+ Monate)**:
✅ **Erweiterung der API für VR-/AR-Integration**.  
✅ **Skalierung & Sicherheitsoptimierungen für API-Zugriff**.  
