
# Besucherfüllstand Visualisierung für MMG-Messegelände

Diese Anwendung dient als Prototyp für eine grafische Besucher-Füllstandsanzeige für das MMG-Messegelände in München Riem. Sie besteht aus zwei Hauptkomponenten:

1. **Besucher-Füllstandsanzeige** - Eine Read-Only-Ansicht, die den aktuellen Besucherfüllstand verschiedener Bereiche des Messegeländes visualisiert.
2. **Management Console** - Eine Administrationsansicht zur Konfiguration der Schwellwerte und visuellen Darstellung.

## Features

- Dynamische Einfärbung von 27 geografischen Bereichen basierend auf konfigurierbaren Schwellwerten
- Automatische Aktualisierung der Daten mindestens alle 60 Sekunden
- Anzeige von Datum und Uhrzeit des letzten Datenupdates
- Konfigurierbare Schwellwerte für jeden Bereich in der Management-Konsole
- Responsive Design für verschiedene Bildschirmgrößen

## Technischer Aufbau

### Datenmodell

Das System verwendet zwei Hauptdatenmodelle:

**VisitorData**
- `id`: Eindeutige ID
- `timestamp`: Zeitstempel der Daten
- `area_number`: Bereichsnummer
- `amount_visitors`: Anzahl der Besucher

**Settings**
- `id`: Eindeutige ID
- `last_updated`: Zeitpunkt der letzten Aktualisierung
- `area_name`: Name des Bereichs
- `highlight`: Farbcode für spezielle Hervorhebung
- `capacity_usage`: Kapazitätsnutzung
- `x`, `y`, `width`, `height`: Koordinaten und Größe des Bereichs auf der Karte

In der aktuellen Version werden Mockdaten verwendet, die in einer späteren Version durch echte Datenbankverbindungen ersetzt werden können.

## Verwendung

- **Besucher-Füllstandsanzeige**: Auf der Startseite verfügbar
- **Management Console**: Unter `/admin` erreichbar

## Erweiterungen

Für die Zukunft sind folgende Erweiterungen geplant:

- Management console
- Security console

