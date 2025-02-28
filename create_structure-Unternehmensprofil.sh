#!/bin/bash

# Basisordner
BASE_DIR="Unternehmensprofil"

# Ordner und Dateien definieren
declare -A STRUCTURE=(
    ["$BASE_DIR/Identität&Werte"]="Leitbild.md Purpose.md Vision.md Mission.md"
    ["$BASE_DIR"]="Businessplan.md Strategische_Ziele.md Corporate_Identity.md Zielgruppen.md"
    ["$BASE_DIR/Markt- und Wettbewerbsanalyse"]="Marktanalyse.md Wettbewerbsanalyse.md"
)

# Struktur erstellen
for DIR in "${!STRUCTURE[@]}"; do
    mkdir -p "$DIR"  # Erstelle Verzeichnisse
    for FILE in ${STRUCTURE[$DIR]}; do
        touch "$DIR/$FILE"  # Erstelle die Dateien
    done
done

echo "Die Ordnerstruktur wurde erfolgreich erstellt."
