# Nyxoy Stories PWA

Nyxoy Stories ist eine Wattpad-inspirierte Progressive Web App für Web, Android und iOS. Sie läuft als statische App im Browser, kann installiert werden und speichert Demo-Daten lokal im `localStorage`.

## Funktionen

- Rollenbasierte Logins für Admins, Autoren und Leser.
- Admin-Bereich zum Anlegen neuer Autoren und Aktivieren/Deaktivieren von Konten.
- Autor-Studio, in dem Autoren ausschließlich ihre eigenen Bücher bearbeiten.
- Bibliothek mit Cover-Karten, Genres, Klappentexten und Kapiteln.
- Lesemodus mit Fragen, die direkt zwischen Textabsätzen eingebettet sind.
- Anpassbares Design mit Akzentfarben, UI-Schrift, Leseschrift und Rundungen.
- PWA-Metadaten, App-Icons und Service Worker für Offline-Caching nach dem ersten Laden.

## Demo-Logins

| Rolle | E-Mail | Passwort |
| --- | --- | --- |
| Admin | `admin@nyxoy.io` | `admin123` |
| Autor | `mira@nyxoy.io` | `author123` |
| Leser | `lina@nyxoy.io` | `reader123` |

## Admin-Login finden

- Auf der Startseite ist oben rechts ein eigener Button **Admin-Login** sichtbar.
- Alternativ im Login-Bereich die hervorgehobene Karte **Admin-Login** auswählen und anschließend **Jetzt einloggen** klicken.
- Falls der Browser eine alte PWA-Version gecacht hat, einmal neu laden; der Service Worker wurde für diese Änderung aktualisiert.

## Entwicklung

```bash
npm run check
npm run build
npm run start
```

Die App ist danach unter <http://localhost:4173> erreichbar.
