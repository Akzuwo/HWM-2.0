# DESIGN.md

> **Status:** Verbindliche UI-/UX-Spezifikation
> **Geltungsbereich:** HWM / HWM 3 und zugehörige Frontends
> **Zielgruppe:** Menschen, Entwickler, Codex/AI-Agents und Reviewer
> **Priorität:** Diese Datei ist bei UI-/UX-Entscheidungen verbindlich, sofern eine Aufgabe nichts Abweichendes ausdrücklich verlangt.

---

# 0. Zweck dieses Dokuments

Dieses Dokument definiert die UI- und UX-Regeln des Projekts.

Es soll verhindern, dass:

- jede Seite eine eigene Designsprache entwickelt,
- neue Komponenten ohne System entstehen,
- Farben, Abstände, Radien oder Animationen spontan erfunden werden,
- Desktop und Mobile nur optisch skaliert statt sinnvoll angepasst werden,
- wichtige Zustände wie Loading, Empty, Error oder Offline vergessen werden,
- Interaktionen zwar funktionieren, aber nicht verständlich oder vorhersehbar sind,
- visuelle Änderungen bestehende Funktionen unabsichtlich verschlechtern,
- AI-Agents „irgendetwas Modernes“ bauen, statt die vorhandene Produktsprache weiterzuführen.

Das Ziel ist **kein generisches Design-System**, sondern eine konsistente Produktsprache mit klaren Regeln.

---

# 1. Oberste Designprinzipien

## 1.1 Nutzerabsicht vor Datenmodell

Eine Oberfläche wird nicht danach strukturiert, wie Daten intern gespeichert sind.

Sie wird danach strukturiert:

1. Wer benutzt diese Seite?
2. Was will diese Person hier hauptsächlich erreichen?
3. Welche Aktion wird am häufigsten ausgeführt?
4. Welche Fehler wären besonders problematisch?
5. Welche Informationen braucht die Person zuerst?
6. Was darf sekundär oder versteckt sein?

Die UI darf niemals wie ein direkt gerendertes Datenbankschema wirken.

---

## 1.2 Jede visuelle Entscheidung braucht einen Grund

Farben, Typografie, Abstände, Radien, Schatten, Transparenz und Motion sind keine Dekoration.

Sie haben Funktionen:

- Hierarchie zeigen
- Gruppierungen verständlich machen
- Interaktivität signalisieren
- Zustände sichtbar machen
- Fokus lenken
- Rückmeldung geben
- Markencharakter erzeugen
- Orientierung erhalten

Ein Wert darf nicht nur verwendet werden, weil er „gut aussieht“.

---

## 1.3 Kein stilles Erfinden neuer Designwerte

**No silent invention.**

Wenn für eine neue Oberfläche bereits Tokens, Komponenten oder Varianten existieren, müssen diese wiederverwendet werden.

Neue Werte sind nur erlaubt, wenn:

1. das bestehende System den Anwendungsfall tatsächlich nicht abdeckt,
2. eine neue Variante begründet werden kann,
3. der neue Wert als offizieller Token oder Komponentenfall dokumentiert wird.

Nicht erlaubt:

```css
padding: 17px;
border-radius: 13px;
color: #2f71f1;
```

nur weil diese Werte lokal gerade passend wirken.

---

## 1.4 Konsistenz schlägt lokale Perfektion

Eine einzelne Seite darf nicht „schöner“ gemacht werden, wenn sie danach anders funktioniert oder aussieht als der Rest des Produkts.

Bevor eine neue Variante erstellt wird:

- existierende Komponente suchen,
- existierende Tokens prüfen,
- bestehendes Verhalten vergleichen,
- erst danach erweitern.

---

## 1.5 Funktion vor Dekoration

Dekorative Elemente dürfen niemals:

- Inhalt überdecken,
- Klickflächen verkleinern,
- Lesbarkeit reduzieren,
- Scrollprobleme erzeugen,
- Fokuszustände verstecken,
- Interaktionen verlangsamen,
- unnötigen Platz verbrauchen,
- auf kleinen Displays Kernfunktionen verdrängen.

---

# 2. Design-Charakter

## 2.1 Grundcharakter

HWM soll wirken:

- clean,
- modern,
- hochwertig,
- ruhig,
- präzise,
- leicht,
- technisch kompetent,
- aber nicht steril.

Die Oberfläche darf visuell interessant sein, soll aber nie verspielt oder überladen wirken.

---

## 2.2 Keine generische AI-UI

Vermeiden:

- riesige Gradient-Headlines ohne Zweck,
- zufällige violett-blaue AI-Gradients,
- übermässige Glow-Effekte,
- unnötige Dashboard-Karten für jede Kleinigkeit,
- Emojis als Interface-Icons,
- überall identische 16px-Rundungen ohne Hierarchie,
- beliebige Glassmorphism-Flächen ohne Tiefensystem,
- unnötig grosse Hero-Bereiche in funktionalen Anwendungen,
- „fancy“ Animationen, die keine Zustandsänderung erklären.

Ein Screenshot einer HWM-Seite soll als HWM erkennbar sein.

---

## 2.3 Glassmorphism

Glassmorphism gehört zur visuellen Sprache von HWM 3 und soll erhalten bleiben.

Glassmorphism ist jedoch **kein Selbstzweck**.

### Glass-Flächen werden eingesetzt für:

- Header,
- schwebende Navigation,
- Overlays,
- Modals,
- wichtige Panels über einem stabilen Hintergrund,
- UI-Ebenen, die sich visuell vom darunterliegenden Inhalt lösen müssen.

### Glass-Flächen sollen nicht:

- auf jeder einzelnen Card verwendet werden,
- Texte durch zu starke Transparenz schlecht lesbar machen,
- mit mehreren Blur-Ebenen übereinander verschachtelt werden,
- Kontrast nur durch Schatten erzeugen.

### Grundregel

Eine Glass-Fläche braucht mindestens:

- ausreichenden Hintergrundkontrast,
- klaren Rand oder subtile Lichtkante,
- konsistente Transparenz,
- konsistenten Blur,
- definierte Elevation.

---

# 3. Design-System-Architektur

Das System besteht aus vier Ebenen:

1. **Foundation Tokens**
2. **Semantic Tokens**
3. **Components**
4. **Patterns**

---

## 3.1 Foundation Tokens

Foundation Tokens enthalten rohe Werte.

Beispiele:

```css
--space-1
--space-2
--space-3
--radius-sm
--radius-md
--font-size-sm
--font-size-md
--neutral-100
--neutral-900
```

Diese Tokens sollen nicht direkt überall verwendet werden.

---

## 3.2 Semantic Tokens

Semantic Tokens beschreiben Zweck statt Aussehen.

Beispiele:

```css
--color-bg-page
--color-bg-surface
--color-bg-glass
--color-text-primary
--color-text-secondary
--color-border-subtle
--color-action-primary
--color-danger
--color-success
--color-warning
--shadow-overlay
```

Komponenten sollen bevorzugt semantische Tokens verwenden.

---

## 3.3 Komponenten

Komponenten kapseln:

- visuelles Design,
- States,
- Accessibility,
- Interaktion,
- Responsive-Verhalten.

Eine Button-Komponente ist nicht nur ein CSS-Stil, sondern ein vollständiges Interaktionssystem.

---

## 3.4 Patterns

Patterns definieren Kombinationen mehrerer Komponenten.

Beispiele:

- Settings Section
- Data Table
- Empty State
- Search Experience
- Confirmation Flow
- Bulk Selection
- Calendar Item
- Page Header
- Modal Flow
- Form Section

---

# 4. Spacing-System

## 4.1 Grundprinzip

Abstände zeigen Beziehungen.

**Nähe bedeutet Zugehörigkeit. Abstand bedeutet Trennung.**

Nicht jede Gruppe braucht einen sichtbaren Rahmen.

---

## 4.2 Empfohlene Skala

Bestehende Projekttokens haben Vorrang. Falls keine vorhanden sind, soll eine konsistente Skala verwendet werden:

```text
4px
8px
12px
16px
24px
32px
48px
64px
```

Zwischenwerte sind nur erlaubt, wenn sie als neuer Token begründet werden.

---

## 4.3 Verhältnisregeln

Typische Beziehungen:

```text
Icon ↔ Label                 6–8px
Label ↔ Helper Text          4–6px
Element ↔ Element            8–12px
Form Field ↔ Form Field      16–24px
Card-Innenabstand            16–24px
Section ↔ Section            32–48px
Page Block ↔ Page Block      48–64px
```

---

## 4.4 Vertikaler Rhythmus

Texte, Inputs und Controls sollen auf einer konsistenten vertikalen Struktur sitzen.

Vermeiden:

- einzelne 3px/7px/19px Fixes,
- unterschiedliche Innenabstände bei visuell gleichen Komponenten,
- unterschiedliche Card-Paddings innerhalb derselben Seite.

---

# 5. Layout

## 5.1 Viewport sinnvoll nutzen

Desktop-Layouts sollen vorhandene Breite sinnvoll verwenden.

Nicht erlaubt:

- schmale Content-Spalte bei datenreichen Ansichten ohne Grund,
- grosse leere Flächen neben Tabellen/Kalendern,
- unnötiges vertikales Scrollen, wenn der Inhalt sinnvoll in den Viewport passen kann.

---

## 5.2 Kalender und dichte Produktivitätsansichten

Bei Ansichten wie Kalender, Stundenplan oder Dashboard gilt:

**Der Viewport ist Arbeitsfläche.**

Die UI soll sich möglichst an die verfügbare Höhe anpassen.

Wenn Inhalte dichter werden:

1. interne Abstände reduzieren,
2. Einträge kompakter rendern,
3. sekundäre Informationen reduzieren,
4. Tooltip/Popover für Details verwenden,
5. erst als letzte Option zusätzlichen Seiten-Scroll erzeugen.

---

## 5.3 Grid

Für komplexe Desktopseiten soll ein konsistentes Grid verwendet werden.

Richtwert:

- Desktop: 12 Spalten
- Tablet: 8 Spalten
- Mobile: 4 Spalten

Das Grid darf bewusst gebrochen werden, aber nicht aus Versehen.

---

## 5.4 Max Width

Eine Max-Width ist sinnvoll für:

- lange Texte,
- Formulare,
- Einstellungen,
- Dokumentansichten.

Eine Max-Width ist häufig falsch für:

- Kalender,
- Tabellen,
- Adminübersichten,
- Timelines,
- datenreiche Dashboards.

---

# 6. Responsive Design

## 6.1 Responsive bedeutet nicht „kleiner skalieren“

Mobile ist kein verkleinerter Desktop.

Wenn die Funktionsweise auf Mobile andere Anforderungen hat, darf die Struktur grundlegend anders sein.

Beispiele:

- Desktop Sidebar → Mobile Bottom Navigation
- Desktop Tabelle → Mobile Cards / Drilldown
- Desktop Wochenkalender → Mobile Tages-/Agendaansicht
- Hover-Aktion → sichtbare Aktion oder Kontextmenü
- Drag & Drop → alternatives Tap-Menü

---

## 6.2 Breakpoints nach Inhalt

Breakpoints sollen dort entstehen, wo das Layout nicht mehr funktioniert.

Nicht nur:

```text
mobile = 768px
tablet = 1024px
desktop = 1440px
```

sondern prüfen:

- Wann kollidiert Navigation?
- Wann werden Labels abgeschnitten?
- Wann werden Targets zu klein?
- Wann ist eine Tabelle nicht mehr sinnvoll?
- Wann wird ein Kalender unlesbar?

---

## 6.3 Touch Targets

Interaktive Touchflächen sollen in der Regel mindestens **44 × 44 px** gross sein.

Ein Icon kann optisch 18–22 px gross sein, aber seine anklickbare Fläche bleibt grösser.

---

# 7. Typografie

## 7.1 Grundprinzip

Typografie erzeugt Hierarchie vor Farbe.

Eine Seite soll auch in Graustufen verständlich bleiben.

---

## 7.2 Rollen

Mindestens folgende Rollen unterscheiden:

- Display / sehr grosse Marketingtitel
- Page Title
- Section Title
- Card Title
- Body
- Secondary Body
- Label
- Helper Text
- Caption
- Numeric / Tabular

---

## 7.3 Hierarchie

Nicht nur Schriftgrösse verwenden.

Hierarchie entsteht durch Kombination aus:

- Grösse,
- Gewicht,
- Farbe,
- Zeilenhöhe,
- Abstand,
- Position.

---

## 7.4 Lesbarkeit

Für Fliesstext:

- keine unnötig kleinen Schriftgrössen,
- ausreichende Zeilenhöhe,
- moderate Zeilenlänge,
- sekundärer Text darf schwächer, aber nicht unlesbar sein.

---

## 7.5 Zahlen

Für Tabellen, Noten, Zeiten und Messwerte nach Möglichkeit tabellarische Zahlen verwenden:

```css
font-variant-numeric: tabular-nums;
```

Dadurch springen Spalten visuell nicht.

---

# 8. Farben

## 8.1 Farbe hat Bedeutung

Farbe soll nicht der einzige Informationsträger sein.

Beispiele:

Fehler:

```text
nur roter Rand
```

Besser:

```text
roter Rand + Icon + verständlicher Fehlertext
```

---

## 8.2 Semantische Farben

Mindestens:

- Primary Action
- Neutral
- Success
- Warning
- Danger
- Info

Semantische Farben dürfen nicht für zufällige Dekoration missbraucht werden.

---

## 8.3 Kontrast

Text und wichtige Controls müssen ausreichenden Kontrast besitzen.

Kontrast muss insbesondere geprüft werden bei:

- Glassmorphism,
- Disabled States,
- Secondary Text,
- Dark Mode,
- farbigen Badges,
- Text auf Bildern,
- transparenten Overlays.

---

## 8.4 Akzentfarbe

Die Akzentfarbe signalisiert Interaktion und Fokus.

Sie soll nicht überall gleichzeitig vorkommen.

Wenn alles hervorgehoben ist, ist nichts hervorgehoben.

---

# 9. Dark Mode

## 9.1 Dark Mode ist kein invertierter Light Mode

Nicht einfach:

```text
weiss → schwarz
schwarz → weiss
```

Dark Mode braucht eigene Oberflächenwerte.

---

## 9.2 Hierarchie im Dark Mode

Tiefe wird eher durch Helligkeitsunterschiede als durch starke Schatten dargestellt.

Beispiel:

```text
Page Background
Surface
Elevated Surface
Overlay
```

werden jeweils leicht heller.

---

## 9.3 Farben reduzieren

Gesättigte Farben wirken auf dunklem Hintergrund stärker.

Akzent-, Warn- und Erfolgsfarben müssen deshalb gegebenenfalls angepasst werden.

---

## 9.4 Keine Light-Theme-Rückstände

Komponenten dürfen nicht einzelne hardcodierte Light-Werte enthalten.

Falsch:

```css
background: #fff;
color: #111;
```

Besser:

```css
background: var(--color-bg-surface);
color: var(--color-text-primary);
```

---

# 10. Border Radius

## 10.1 Radius ist hierarchisch

Nicht jede Komponente bekommt denselben Radius.

Beispielsystem:

```text
sm  → kleine Controls, Chips
md  → Inputs, Buttons
lg  → Cards
xl  → Modals / grosse Glass-Panels
```

---

## 10.2 Verschachtelte Radien

Innenradius soll optisch kleiner sein als Aussenradius.

Faustregel:

```text
inner radius ≈ outer radius - padding
```

Keine fast gleich grossen konzentrischen Rundungen, wenn dadurch optisch unruhige Ecken entstehen.

---

# 11. Borders, Shadows und Depth

## 11.1 Tiefe ist semantisch

Elevation zeigt:

- was über was liegt,
- was anklickbar oder schwebend ist,
- was temporär ist,
- wo Fokus liegt.

---

## 11.2 Keine Schatteninflation

Nicht jede Card braucht einen Schatten.

Flache Informationsflächen können durch:

- Hintergrund,
- Border,
- Abstand

gruppiert werden.

---

## 11.3 Elevation Levels

Empfohlene Bedeutung:

```text
Level 0  Page
Level 1  Surface / Card
Level 2  Sticky / Floating Control
Level 3  Dropdown / Popover
Level 4  Modal
Level 5  Critical Overlay / Toast Layer
```

---

## 11.4 Z-Index

Keine `z-index: 999999`-Strategie.

Z-Index soll als definierte Skala existieren.

Beispiel:

```css
--z-base: 0;
--z-sticky: 100;
--z-dropdown: 200;
--z-popover: 300;
--z-modal-backdrop: 400;
--z-modal: 410;
--z-toast: 500;
```

Stacking Contexts beachten.

Komponenten dürfen bei Bedarf mit `isolation: isolate` ihre interne Layer-Struktur kapseln.

---

# 12. Icons

## 12.1 Keine Emojis als UI-Icons

Emojis sind für Interface-Aktionen nicht erlaubt.

Verwenden:

- ein konsistentes Icon-Set,
- gleiche Stroke-Logik,
- gleiche optische Grösse,
- gleiche Corner-Charakteristik.

---

## 12.2 Icon-only Buttons

Icon-only Buttons benötigen:

- ausreichend grosse Klickfläche,
- Accessible Name,
- Tooltip bei nicht offensichtlicher Bedeutung,
- Focus State.

---

## 12.3 Icons sind unterstützend

Ein Icon darf bei wichtigen Aktionen nicht die einzige Erklärung sein, wenn seine Bedeutung nicht allgemein bekannt ist.

---

# 13. Buttons

## 13.1 Varianten

Mindestens:

- Primary
- Secondary
- Tertiary / Ghost
- Destructive
- Icon Button

---

## 13.2 Eine Primary Action pro Kontext

Eine Card, ein Modal oder ein Formular soll normalerweise nur eine klar dominante Primary Action besitzen.

Zu viele Primary Buttons zerstören die Hierarchie.

---

## 13.3 Button States

Jeder Button benötigt:

- default
- hover
- active/pressed
- focus-visible
- disabled
- busy/loading

---

## 13.4 Disabled Buttons

Disabled darf nicht bedeuten:

> „Du darfst nicht klicken und wir erklären nicht warum.“

Wenn eine Aktion blockiert ist, soll der Grund sichtbar oder anderweitig erreichbar sein.

Bei Formularen ist oft besser:

- Button klickbar lassen,
- nach sinnvoller Interaktion auf fehlende Felder hinweisen,

statt permanent einen grauen, unerklärten Button zu zeigen.

---

## 13.5 Loading ist nicht Disabled

Während einer asynchronen Aktion:

- Fokus behalten,
- visuellen Busy-State zeigen,
- Doppel-Submit verhindern,
- `aria-busy` korrekt setzen.

Den Button nicht einfach „tot grau“ machen.

---

# 14. Links

Links müssen visuell als Links erkennbar sein.

Textlinks sollen nicht ausschliesslich auf Hover sichtbar werden.

Externe Links dürfen bei Bedarf ein kleines External-Link-Icon erhalten.

---

# 15. Inputs und Formulare

## 15.1 Labels bleiben Labels

Kein Placeholder-only Design.

Placeholder ist Beispiel oder Format-Hinweis, kein Ersatz für ein Feldlabel.

---

## 15.2 Field States

Jedes Feld soll mindestens unterstützen:

1. default
2. hover
3. focus
4. filled
5. error
6. disabled

Je nach Komponente zusätzlich:

- success
- warning
- read-only
- loading

---

## 15.3 Fehler

Fehlertexte sollen beantworten:

1. Was ist falsch?
2. Wie kann ich es korrigieren?

Schlecht:

```text
Ungültige Eingabe
```

Besser:

```text
Die E-Mail-Adresse enthält kein gültiges @-Zeichen.
```

---

## 15.4 Validation Timing

Nicht während jeder einzelnen Tastatureingabe aggressiv Fehler zeigen.

Empfohlene Strategie:

- Format-Hilfe vor Eingabe,
- Validierung nach Blur oder sinnvoller Pause,
- sofortige Korrekturmeldung, wenn ein bestehender Fehler behoben wurde,
- Submit validiert vollständig.

---

## 15.5 Gruppierung

Felder nach Nutzeraufgabe gruppieren, nicht nach Datenbanktabelle.

---

## 15.6 Defaults

Gute Standardwerte reduzieren Arbeit.

Defaults müssen:

- wahrscheinlich korrekt sein,
- einfach änderbar sein,
- keine riskanten Aktionen versteckt vorauswählen.

---

# 16. Settings

Settings sind ein eigenes UX-System.

---

## 16.1 Nach Aufgabe gruppieren

Nicht eine Liste aus 30 Schaltern.

Beispiel:

```text
Darstellung
Benachrichtigungen
Synchronisierung
Datenschutz
Erweitert
```

---

## 16.2 Apply-Modell nach Risiko

### Sofort speichern

Geeignet für:

- Theme
- Sprache
- einfache Anzeigepräferenzen
- harmlose Toggles

Feedback:

```text
Gespeichert
```

subtil und ohne Modal.

### Explizit speichern

Geeignet für:

- Accountdaten
- Identität
- API-Konfiguration
- sicherheitsrelevante Werte
- grössere Konfigurationsblöcke

Mit:

- Speichern
- Abbrechen
- Unsaved-Changes-Indikator

---

## 16.3 Geänderte Werte

Wenn sinnvoll:

- modified indicator,
- Reset nur für diese Einstellung,
- optional „Alle zurücksetzen“.

---

## 16.4 Advanced Settings

Seltene Einstellungen dürfen hinter „Erweitert“ liegen.

Kernfunktionen dürfen nicht dort versteckt werden.

---

## 16.5 Destructive Zone

Gefährliche Aktionen klar vom Rest trennen.

Beispiele:

- Daten löschen
- Account löschen
- Cloud-Daten zurücksetzen

Irreversible Aktionen brauchen erhöhte Bestätigung.

---

# 17. Toggles

Ein Toggle steht für einen Zustand, der direkt geändert wird.

Gut:

```text
Dark Mode     [on/off]
```

Nicht gut:

```text
Exportieren   [on/off]
```

Exportieren ist eine Aktion → Button.

---

## 17.1 Toggle Copy

Label beschreibt den Zustand:

```text
Benachrichtigungen aktivieren
```

nicht:

```text
Benachrichtigungseinstellung
```

---

# 18. Dropdowns und Selects

## 18.1 Dropdown nur bei echter Auswahl

Für 2 Optionen oft besser:

- Segmented Control
- Radio Buttons

Für sehr viele Optionen:

- Searchable Select / Combobox

---

## 18.2 Dropdown-Verhalten

- aktuelle Auswahl sichtbar,
- Tastatursteuerung,
- Escape schliesst,
- Klick ausserhalb schliesst,
- Fokus kehrt sinnvoll zurück.

---

# 19. Tabs

Tabs wechseln zwischen gleichwertigen Ansichten desselben Kontexts.

Tabs sind nicht für lineare Schritte gedacht.

---

## 19.1 Stabilität

Beim Wechseln darf:

- die Tab-Leiste nicht springen,
- die Höhe nicht unnötig flackern,
- der aktive Tab nicht unklar sein.

---

## 19.2 Mobile

Bei zu vielen Tabs:

- horizontal scrollbare Tab-Leiste,
- oder strukturell andere Navigation.

Keine mikroskopisch kleinen Tabs erzwingen.

---

# 20. Navigation

Navigation soll die mentale Struktur des Produkts widerspiegeln.

---

## 20.1 Primärnavigation

Nur häufig genutzte Hauptbereiche.

Seltene Admin-Funktionen nicht gleich stark gewichten.

---

## 20.2 Aktiver Zustand

Der aktuelle Bereich muss eindeutig sichtbar sein.

Nicht nur durch minimale Farbänderung.

---

## 20.3 Header

Der HWM-Header soll möglichst persistent wirken.

Bei Seitenwechseln soll der Header nicht unnötig verschwinden oder neu „blinken“.

Seitenwechsel sollen sich wie Navigation innerhalb einer Anwendung anfühlen, nicht wie neue Webseiten.

---

## 20.4 Navigation darf wachsen

Wenn zusätzliche Rollen oder Adminfunktionen Navigationselemente hinzufügen, muss das Layout diesen Zustand ausdrücklich unterstützen.

Nicht:

- Text quetschen,
- Tabs überlappen,
- Elemente abschneiden.

Stattdessen:

- flexible Breite,
- Overflow-Menü,
- Rollenbereich,
- alternative Navigation.

---

# 21. Search

Suche besteht nicht nur aus einem Input.

Ein vollständiges Search-System berücksichtigt:

- Input
- Query State
- Loading
- Results
- Empty Results
- Error
- Clear
- Keyboard Navigation
- eventuell Recent Searches
- eventuell Filters

---

## 21.1 Suchfeedback

Die Person muss wissen:

```text
12 Ergebnisse für „Mathematik“
```

statt nur plötzlich eine andere Liste zu sehen.

---

# 22. Filter

Filter sollen sichtbare Auswirkungen haben.

Aktive Filter:

- als Chips oder anderweitig sichtbar,
- einzeln entfernbar,
- vollständig zurücksetzbar.

---

## 22.1 Result Count

Wenn möglich:

```text
24 Ergebnisse
```

aktualisiert sich direkt.

---

# 23. Cards

Cards sind Gruppierung, nicht Standardbehälter für alles.

---

## 23.1 Eine Card braucht einen Grund

Cards sind sinnvoll, wenn Inhalt:

- als Einheit funktioniert,
- eine eigene Aktion hat,
- visuell von Nachbarn getrennt sein muss.

Wenn nur Layout-Abstand benötigt wird, keine Card erzwingen.

---

## 23.2 Card Hierarchie

Typischer Aufbau:

1. Eyebrow / Status optional
2. Titel
3. wichtigste Information
4. sekundäre Information
5. Aktion

Nicht fünf gleich starke Textblöcke.

---

## 23.3 Clickable Cards

Wenn die gesamte Card klickbar ist:

- Cursor/affordance eindeutig,
- Hover nur auf Geräten mit Hover,
- Keyboard erreichbar,
- sichtbarer Focus State.

---

# 24. Modals, Dialoge, Popovers und Bottom Sheets

Nicht jedes Overlay ist ein Modal.

---

## 24.1 Popover

Für:

- kleine Kontextaktionen,
- Filter,
- kurze Zusatzinfos.

---

## 24.2 Modal

Für:

- fokussierte Aufgaben,
- Formulare,
- wichtige Bestätigungen,
- Inhalte, bei denen Hintergrundinteraktion pausieren muss.

---

## 24.3 Bottom Sheet

Auf Mobile bevorzugt für:

- kontextuelle Aktionen,
- Auswahlmenüs,
- kurze Formulare.

Daumenreichweite beachten.

---

## 24.4 Modal Hierarchie

Nicht mehrere Modals übereinander stapeln.

Wenn ein Flow weitere Details benötigt:

- Modalinhalt wechseln,
- Unterseite,
- Popover,
- Stepper

statt Modal über Modal.

---

## 24.5 Modal Verhalten

- Fokus beim Öffnen ins Modal,
- Focus Trap,
- Escape schliesst, sofern nicht gefährlich,
- nach Schliessen Fokus zum Auslöser zurück,
- Hintergrund nicht scrollbar,
- mobile Höhe sinnvoll begrenzen.

---

# 25. Destructive Actions

Gefährliche Aktionen brauchen eine eigene Designsprache.

---

## 25.1 Nicht alles rot

Rot wird für echte Gefahr reserviert.

Kein roter „Abbrechen“-Button.

---

## 25.2 Reversible Aktionen

Wenn technisch sicher möglich, ist **Undo** oft besser als ein Bestätigungsmodal.

Beispiel:

```text
Eintrag gelöscht. Rückgängig
```

---

## 25.3 Irreversible Aktionen

Bei wirklich irreversiblen Aktionen:

- Konsequenz konkret nennen,
- Objekt nennen,
- kein vages „Sind Sie sicher?“,
- gegebenenfalls Eingabe des Namens verlangen.

---

# 26. Bulk Actions

Mehrfachauswahl ist ein System.

---

## 26.1 Checkbox Header

Drei Zustände:

- nichts ausgewählt
- teilweise ausgewählt / indeterminate
- alles ausgewählt

---

## 26.2 Auswahlumfang

Immer klar machen, was ausgewählt ist:

```text
12 ausgewählt
```

oder:

```text
Alle 247 passenden Einträge auswählen
```

Nicht nur „Alle“.

---

## 26.3 Auswahlzustand persistieren

Auswahl soll nicht versehentlich verschwinden, wenn:

- Seite gewechselt,
- gescrollt,
- nachgeladen

wird, sofern der Kontext gleich bleibt.

---

# 27. Tabellen

Tabellen sind für vergleichbare strukturierte Daten.

---

## 27.1 Tabellen sind keine Div-Grids

Semantische Tabellenstruktur bevorzugen, wenn es tabellarische Daten sind.

---

## 27.2 Priorisierung

Nicht jede Datenbankspalte anzeigen.

Fragen:

- Welche 3–5 Werte braucht man tatsächlich?
- Was gehört in Details?
- Was gehört in Overflow Actions?

---

## 27.3 Mobile Tabellen

Keine Desktoptabelle brutal zusammenschieben.

Alternativen:

- horizontales Scrollen bei echten Vergleichstabellen,
- Cards,
- wichtigste Spalten + Detailansicht,
- responsive column priority.

---

## 27.4 Numeric Alignment

Zahlen rechtsbündig.

Text meistens linksbündig.

---

# 28. Kalender und Stundenplan

Kalender sind hochdichte Informationsoberflächen und brauchen eigene Regeln.

---

## 28.1 Primäres Ziel

Auf einen Blick erkennen:

- was,
- wann,
- wo,
- welcher Zustand,
- was als Nächstes passiert.

---

## 28.2 Einträge

Kalendereinträge sollen priorisieren:

1. Titel / Fach / Ereignis
2. Zeit
3. Raum / Zusatzinfo
4. Status

Sekundäre Details dürfen bei Platzmangel reduziert werden.

---

## 28.3 Kompression

Wenn viele Einträge vorhanden sind:

- Höhe dynamisch reduzieren,
- Text clamping,
- Icons nur bei echtem Mehrwert,
- Details in Tooltip/Popover/Modal.

Keine Überlappungen.

---

## 28.4 Mobile Kalender

Mobile darf eine andere Funktionslogik verwenden.

Eine Desktop-Wochenansicht muss nicht auf 390px Breite gezwungen werden.

---

# 29. Loading States

Loading ist ein System.

Nicht überall Skeletons verwenden.

---

## 29.1 Spinner

Geeignet für:

- kleine lokale Aktion,
- Button,
- unbekannte kurze Dauer.

---

## 29.2 Skeleton

Geeignet wenn:

- Layout bereits bekannt,
- Content nachgeladen wird,
- räumliche Stabilität wichtig ist.

Skeleton soll echte Contentstruktur approximieren.

---

## 29.3 Progress

Wenn Dauer oder Fortschritt bekannt:

- Progress Bar,
- Prozent,
- Schrittanzeige.

---

## 29.4 Bestehenden Inhalt behalten

Beim Refresh vorhandene Daten nicht unnötig komplett durch Skeleton ersetzen.

Besser:

- bestehende Daten behalten,
- kleinen Refresh-Indikator zeigen.

Das verhindert visuelles Flackern.

---

# 30. Empty States

Ein Empty State ist kein Fehler.

Er soll erklären:

1. Was ist hier?
2. Warum ist noch nichts da?
3. Was kann ich als Nächstes tun?

---

## 30.1 Beispiel

Schlecht:

```text
Keine Daten
```

Besser:

```text
Noch keine Noten erfasst.
Füge deine erste Note hinzu, um den Schnitt zu berechnen.
[Note hinzufügen]
```

---

# 31. Error States

Fehler brauchen Recovery.

Ein guter Fehlerzustand beantwortet:

1. Was ist passiert?
2. Was bedeutet das?
3. Was kann ich tun?

---

## 31.1 Fehlertexte

Nicht:

```text
Error 500
```

Besser:

```text
Die Daten konnten nicht geladen werden.
Bitte versuche es erneut.
[Erneut versuchen]
```

Technische Details können optional separat verfügbar sein.

---

# 32. Offline State

HWM kann in Szenarien mit instabiler Verbindung verwendet werden.

Wenn eine Funktion Verbindung benötigt:

- Offline-Zustand sichtbar machen,
- lokale Daten nach Möglichkeit weiter anzeigen,
- Synchronisationsstatus erklären,
- nicht still scheitern.

---

# 33. State Completeness

Jede datenbasierte Ansicht muss bewusst mindestens folgende Zustände prüfen:

- Loading
- Empty
- Partial
- Error
- Success
- Offline

Zusätzlich je nach Funktion:

- Permission denied
- Disabled
- Read-only
- First-use
- Stale data
- Syncing
- Conflict

Ein Feature gilt UX-seitig nicht als fertig, wenn nur der Success State gestaltet wurde.

---

# 34. Feedback

## 34.1 Sofortige Reaktion

Eine Interaktion soll visuell möglichst sofort reagieren.

Beispiele:

- Button pressed state
- Checkbox State
- Toggle Animation
- Row highlight

Netzwerkantwort darf später kommen.

---

## 34.2 Optimistic UI

Geeignet für günstige, reversible Aktionen:

- Favorit
- Like
- Sortierung
- lokale Umbenennung
- einfache Einstellungen

Nicht blind verwenden bei:

- irreversiblen Aktionen,
- Zahlungen,
- sicherheitskritischen Operationen,
- komplexen Transaktionen.

---

# 35. Toasts und Notifications

Nicht jede Rückmeldung ist ein Toast.

---

## 35.1 Toast geeignet für

- kurze Bestätigung,
- Hintergrundaktion,
- reversible Aktion mit Undo,
- nicht blockierende Info.

---

## 35.2 Toast ungeeignet für

- Formfehler,
- Informationen, die gelesen werden müssen,
- kritische Entscheidungen,
- persistente Systemzustände.

---

## 35.3 Toast Verhalten

- verständliche Nachricht,
- keine technischen Codes,
- optional Aktion,
- nicht zu viele gleichzeitig,
- ausreichend lange sichtbar,
- pausierbar bei Hover/Fokus, wenn zeitgesteuert.

---

# 36. Autosave

Autosave braucht ehrliches Feedback.

Mögliche Zustände:

```text
Nicht gespeichert
Speichert…
Gespeichert
Speichern fehlgeschlagen
Offline – lokal gespeichert
```

„Gespeichert“ darf erst erscheinen, wenn der entsprechende Persistenzschritt tatsächlich erfolgreich war.

---

# 37. Undo

Undo ist bei reversiblen Aktionen eine bevorzugte Sicherheitsstrategie.

Typische Fälle:

- Löschen eines einfachen Eintrags
- Verschieben
- Archivieren
- Änderung eines Status

Undo muss:

- klar sichtbar,
- zeitlich ausreichend,
- tatsächlich zuverlässig

sein.

---

# 38. Motion Design

Motion erklärt Zustandsänderung.

Sie soll nicht bloss zeigen, dass Animation technisch möglich ist.

---

## 38.1 Motion-Ziele

Animation darf verwendet werden, um:

- räumliche Beziehung zu erklären,
- Ursache und Wirkung zu verbinden,
- Fokus zu lenken,
- Layoutwechsel verständlich zu machen,
- Feedback zu geben,
- Übergänge weicher zu machen.

---

## 38.2 Keine Animation ohne Zweck

Vermeiden:

- Elemente fliegen bei jedem Seitenaufruf grundlos ein,
- grosse Bounce-Effekte,
- Animation bei jedem Hover,
- lange Page-Transitions,
- dekorative Daueranimationen in Produktivitätsansichten.

---

# 39. Animation Timing

Motion muss schnell genug sein, um reaktiv zu wirken.

Empfohlene Grössenordnung:

```text
Micro feedback       80–140ms
Hover / Press        100–180ms
Small transition     140–220ms
Panel / Popover      180–260ms
Modal                200–320ms
Page transition      220–380ms
```

Keine Regel ist absolut; Distanz und Komplexität entscheiden mit.

---

## 39.1 Eintritt vs Austritt

Austritt darf meist etwas schneller sein als Eintritt.

Die Person will beim Schliessen nicht warten.

---

# 40. Easing

Lineare Bewegung wirkt bei UI-Objekten meistens künstlich.

Empfohlene Kategorien:

- Eintritt: decelerating / ease-out
- Austritt: accelerating / ease-in
- Bewegung zwischen Zuständen: smooth ease-in-out
- physische Controls: leichte Spring-Kurve möglich

Spring-Effekte nur subtil.

---

# 41. Synchronisierte Animation

Wenn mehrere Elemente Teil derselben Bewegung sind, müssen sie zusammengehören.

Beispiel Accordion:

- Chevron dreht,
- Content öffnet,

mit derselben Motion-Logik.

Ein sichtbarer Versatz lässt das Interface defekt wirken.

---

# 42. Layout Animation

Layout darf nicht springen, wenn die Veränderung vorhersehbar animierbar ist.

Beispiele:

- Accordion
- Filterbar
- Expandable Card
- Sidebar
- Tabs mit Indicator

Aber:

Performance und Reduced Motion haben Vorrang.

---

# 43. Page Transitions

HWM soll sich wie eine zusammenhängende App anfühlen.

Daher:

- persistente UI-Elemente nicht unnötig neu animieren,
- Header möglichst stehen lassen,
- Contentbereich wechseln,
- Hintergrundkontinuität erhalten,
- keine kompletten Fade-to-black/white Übergänge.

---

# 44. Reduced Motion

`prefers-reduced-motion` muss respektiert werden.

Bei Reduced Motion:

- grosse Translationen entfernen,
- Parallax deaktivieren,
- Spring/Bounce vermeiden,
- Dauer stark reduzieren oder Transition ganz entfernen,
- keine Funktion darf von Animation abhängig sein.

---

# 45. Hover

Hover ist Enhancement, keine Voraussetzung.

---

## 45.1 Capability Detection

Hover-Stile nur dort einsetzen, wo Hover existiert:

```css
@media (hover: hover) {
  ...
}
```

Nicht pauschal über Device-Namen entscheiden.

---

## 45.2 Keine versteckten Hauptaktionen

Eine zentrale Aktion darf nicht nur bei Hover erscheinen.

Touch-User müssen dieselbe Funktion erreichen können.

---

# 46. Focus

Keyboard Focus muss immer sichtbar sein.

Nicht:

```css
outline: none;
```

ohne gleichwertigen Ersatz.

---

## 46.1 Focus-visible

Bevorzugt:

```css
:focus-visible
```

um Keyboard-Fokus klar zu zeigen, ohne Mausinteraktionen unnötig zu markieren.

---

# 47. Keyboard UX

Wichtige UI muss ohne Maus nutzbar sein.

Mindestens:

- Tab Navigation
- Shift+Tab
- Enter
- Space
- Escape
- Pfeiltasten bei passenden Widgets

Komponenten mit speziellen Erwartungen:

- Tabs
- Combobox
- Menu
- Dialog
- Slider
- Accordion

sollen sich an etablierte Keyboard-Patterns halten.

---

# 48. Drag & Drop

Drag & Drop darf nie die einzige Möglichkeit sein.

Alternativen:

- Kontextmenü
- Move Buttons
- Auswahl + Aktion

---

## 48.1 Feedback

Beim Drag:

- Dragged Item klar,
- Drop Target klar,
- ungültige Targets klar,
- Ergebnis sofort sichtbar.

---

# 49. Sliders

Slider nur verwenden, wenn räumliche Auswahl sinnvoll ist.

---

## 49.1 Slider UX

- Track-Zustand sichtbar,
- aktueller Wert sichtbar,
- grosser Hit Target,
- definierte Steps, wenn präzise Werte wichtig,
- Keyboard Support,
- Pfeiltasten,
- Home/End.

Bei exakten numerischen Eingaben gegebenenfalls Input zusätzlich anbieten.

---

# 50. Accordions

Accordion Header ist ein echtes `button`-Element.

Benötigt:

- `aria-expanded`
- `aria-controls`
- Keyboard Support
- synchronisierte Chevron-Animation

---

## 50.1 Accordion vs Disclosure

Accordion:

- typischerweise nur ein Panel offen.

Disclosure:

- mehrere Panels können offen bleiben.

Verhalten nach Inhalt wählen.

---

# 51. Tooltips

Tooltips sind Zusatzinformation.

Nicht verwenden, um essenzielle Information zu verstecken.

---

## 51.1 Tooltips brauchen

- Hover und Focus,
- sinnvolle Verzögerung,
- keine Interaktion blockieren,
- kurze Texte,
- saubere Positionierung.

Auf Touch braucht wichtige Information eine andere Lösung.

---

# 52. Microcopy

UI-Texte sollen:

- konkret,
- kurz,
- menschlich,
- eindeutig

sein.

---

## 52.1 Buttons als Verben

Gut:

```text
Note hinzufügen
Änderungen speichern
Eintrag löschen
Neu laden
```

Schwach:

```text
OK
Bestätigen
Weiter
```

wenn die konkrete Aktion genannt werden kann.

---

## 52.2 Keine unnötige Fachsprache

Technische Backend-Begriffe gehören nicht automatisch in die UI.

---

# 53. Informationshierarchie

Vor Implementierung einer Seite Aktionen priorisieren:

```text
Primary
Secondary
Tertiary
Destructive
```

Dasselbe gilt für Informationen:

```text
Must see
Should see
Can discover
Advanced
```

---

# 54. Progressive Disclosure

Komplexität darf stufenweise gezeigt werden.

Standardansicht:

- häufig,
- wichtig,
- sicher.

Erweiterte Ebene:

- selten,
- technisch,
- power-user-spezifisch.

---

# 55. Visuelle Gruppierung

Gruppierung zuerst mit:

1. Abstand
2. Ausrichtung
3. Hintergrund
4. Border

lösen.

Nicht automatisch jede Gruppe einrahmen.

---

# 56. Affordance

Interaktive Dinge müssen interaktiv aussehen.

Ein normaler Textblock darf nicht plötzlich anklickbar sein, ohne Hinweis.

Ein Button soll nicht wie statischer Text aussehen.

---

# 57. Accessibility

Accessibility ist keine spätere Qualitätsstufe, sondern Teil der Komponente.

---

## 57.1 Mindestanforderungen

- semantisches HTML,
- Keyboard Navigation,
- sichtbarer Fokus,
- ausreichender Kontrast,
- Accessible Names,
- Labels für Inputs,
- sinnvolle Heading-Struktur,
- Statusmeldungen für Screenreader,
- keine reine Farbcodierung,
- Touch Targets,
- Reduced Motion.

---

# 58. ARIA

ARIA nur verwenden, wenn natives HTML nicht reicht.

Bevorzugt:

```html
<button>
<input>
<select>
<table>
<nav>
dialog
```

statt Divs mit nachgebautem Verhalten.

---

# 59. Live Regions

Asynchrone Statusänderungen, die sonst unsichtbar wären, gegebenenfalls über sinnvolle ARIA-Live-Region kommunizieren.

Beispiele:

- Speichern erfolgreich
- Fehler beim Laden
- Suchresultatanzahl geändert

Nicht jede Animation ansagen.

---

# 60. Performance als UX

Eine schöne UI, die ruckelt, ist schlechte UX.

---

## 60.1 Vermeiden

- unnötige Re-Renders,
- grosse Blur-Flächen über ständig animiertem Content,
- Layout Thrashing,
- ungebremste Resize/Scroll Handler,
- riesige DOM-Listen ohne Virtualisierung,
- Animation von teuren Layout-Properties bei grossen Flächen.

---

## 60.2 Animation Performance

Bevorzugt:

- transform
- opacity

Vorsicht mit:

- width
- height
- top
- left
- filter / backdrop-filter auf grossen bewegten Flächen.

---

# 61. Datenaktualisierung

Wenn Daten neu geladen werden:

- bestehende Ansicht möglichst stabil halten,
- keine komplette UI neu mounten, wenn nicht nötig,
- Fokus nicht verlieren,
- Scrollposition erhalten,
- nur betroffene Teile aktualisieren.

---

# 62. Optimistic vs Confirmed Data

Die Oberfläche muss klar unterscheiden zwischen:

- lokal angenommener Änderung,
- bestätigtem Serverzustand.

Bei kritischen Daten muss Server-Truth gewinnen.

---

# 63. Übergänge bei Sprachwechsel

Sprachwechsel dürfen subtil animiert werden.

Ziel:

- kein hartes Flackern,
- Layout bleibt stabil,
- Textwechsel fühlt sich sauber an.

Nicht:

- jeden Text einzeln lang einfliegen lassen,
- Lesbarkeit durch Motion verzögern.

---

# 64. Internationalisierung

Layouts müssen mit längeren Übersetzungen funktionieren.

Keine Buttons auf exakt deutschsprachige Textlängen optimieren.

Testen mit:

- Deutsch
- Englisch
- Italienisch
- möglichst längeren Labels.

---

# 65. Zahlen, Datum und Zeit

Lokalisierung beachten.

Nicht hardcoden:

```text
MM/DD/YYYY
```

wenn Schweizer Darstellung erwartet wird.

Zeiten und Datumsangaben sollen zum Produktkontext passen.

---

# 66. Content Density

Dichte ist kein Fehler.

Eine Produktivitätsanwendung darf kompakt sein.

Ziel ist:

**hohe Informationsdichte bei klarer Struktur.**

Nicht jede Ansicht braucht riesige White-Space-Flächen.

---

# 67. Desktop vs Mobile Density

Desktop:

- höhere Dichte möglich,
- mehrere Spalten,
- Hover Enhancement,
- direkte Vergleichbarkeit.

Mobile:

- fokussierter,
- grosse Targets,
- weniger parallele Information,
- Drilldown statt Überladung.

---

# 68. First Use

Neue Nutzer sollen Kernfunktionen ohne Handbuch verstehen.

Bevorzugt:

- gute Labels,
- sinnvolle Empty States,
- kleine Inline-Hinweise,
- progressive Einführung.

Nicht sofort:

- 12-Schritt-Tutorial,
- Popover-Tour auf jedem Element.

---

# 69. Onboarding

Onboarding soll nur das erklären, was nicht durch gutes Interface verständlich gemacht werden kann.

---

# 70. Permissions

Wenn eine Funktion aufgrund fehlender Berechtigung nicht verfügbar ist:

- Grund nennen,
- mögliche Lösung nennen,
- keine scheinbar defekte UI zeigen.

---

# 71. Admin UI

Adminfunktionen dürfen dichter und technischer sein als Endnutzerseiten, müssen aber dieselbe Designsprache verwenden.

Keine separate „Bootstrap-Admin“-Optik.

---

# 72. Developer-/Debug-Informationen

Technische Informationen:

- IDs
- Stacktraces
- Raw JSON
- API-Fehlercodes

nicht prominent normalen Nutzern anzeigen.

Bei Bedarf:

```text
Technische Details anzeigen
```

---

# 73. Charts

Charts müssen Daten ehrlich darstellen.

---

## 73.1 Achsen

Keine manipulativen abgeschnittenen Achsen ohne klare Begründung.

---

## 73.2 Farbe

Nicht zehn zufällige Farben.

Farben sollen Kategorien konsistent abbilden.

---

## 73.3 Tooltip

Werte bei Hover/Focus präzise anzeigen.

Charts müssen auch ohne Farbe möglichst verständlich bleiben.

---

# 74. Notenrechner-spezifische UX

Der Notenrechner ist ein Arbeitswerkzeug, kein Marketing-Dashboard.

---

## 74.1 Ohne Cloud Sync

Direkt verfügbar:

- Note hinzufügen
- Name optional
- Wert
- Gewichtung
- Liste bestehender Noten
- bearbeiten
- Trendgrafik optional
- Wunschschnitt berechnen

Cloud-Funktionen dürfen diesen Flow nicht stören.

---

## 74.2 Mit Cloud Sync

Zusätzlich:

- Fächer wechseln
- Schnitt pro Fach
- Gesamtschnitt
- Schnitt aus auf 0.5 gerundeten Fächerschnitten
- Mangelpunkte
- Sync Status
- Daten hochladen / neu laden

Cloud-Status muss sichtbar sein, ohne dominant zu werden.

---

# 75. Animationen für Datenänderungen

Wenn Listen aktualisiert werden:

- neue Elemente subtil hervorheben,
- entfernte Elemente sauber ausblenden,
- keine komplette Liste neu animieren.

---

# 76. Persistent UI

Elemente, die konzeptionell konstant bleiben, sollen beim Navigieren möglichst nicht neu erscheinen.

Beispiele:

- Header
- globaler Hintergrund
- primäre Navigation

Das erzeugt räumliche Kontinuität.

---

# 77. Scroll-Verhalten

Scroll soll vorhersehbar bleiben.

Nicht:

- Scrollposition beim kleinen Datenupdate resetten,
- Hintergrund hinter Modal scrollen,
- unerwartet automatisch weit springen.

---

# 78. Scrollbars

Scrollbars dürfen optisch dezent sein, aber Scrollbarkeit darf nicht unsichtbar oder unbenutzbar werden.

Custom Scrollbars nur vorsichtig.

---

# 79. Sticky UI

Sticky Header/Controls sind sinnvoll, wenn sie häufig gebraucht werden.

Sticky Elemente dürfen nicht so viel Platz einnehmen, dass kaum Content übrig bleibt.

---

# 80. Overflow Menus

Sekundäre oder seltene Aktionen können in `…` verschoben werden.

Nicht im Overflow verstecken:

- primäre Aktion,
- häufigste Aktion,
- sicherheitskritischer Status.

---

# 81. Context Menus

Kontextmenüs sind optionaler Shortcut, nie einziger Zugang.

Right-click Funktionen brauchen auch sichtbare Alternativen.

---

# 82. Command Palette

Für Power User kann eine Command Palette sinnvoll sein.

Sie ersetzt aber nicht die normale Navigation.

---

# 83. Toast vs Inline vs Modal Entscheidung

Verwende:

### Inline
wenn Feedback direkt zu einem Element gehört.

### Toast
wenn die Aktion erfolgreich im Hintergrund abgeschlossen wurde.

### Modal
wenn eine Entscheidung vor Fortsetzung erforderlich ist.

### Banner
wenn ein Zustand die ganze Seite betrifft.

---

# 84. Banner

Banner für:

- Offline
- Wartung
- globale Warnung
- Sync Problem
- Berechtigungsproblem mit breiter Auswirkung.

Banner bleiben sichtbar, solange der Zustand relevant ist.

---

# 85. Status Badges

Badges sollen kurze Zustände darstellen.

Beispiele:

```text
Offen
In Bearbeitung
Synchronisiert
Fehler
Offline
```

Keine ganzen Sätze in Badges.

---

# 86. Status Icons

Icon + Text bevorzugen, wenn Farbe allein nicht reicht.

---

# 87. Progress / Stepper

Stepper verwenden, wenn Aufgaben wirklich sequenziell sind.

Nicht künstlich einen einfachen 3-Feld-Dialog in 4 Schritte zerlegen.

---

# 88. Date Picker

Datumseingabe soll zur Aufgabe passen.

Für bekannte Daten oft zusätzlich direkte Texteingabe erlauben.

Keyboard-Nutzer nicht zwingen, durch Monate zu klicken.

---

# 89. File Upload

Upload braucht:

- erlaubte Dateitypen,
- Grössenlimit,
- sichtbaren Uploadstatus,
- Fehler,
- Retry,
- Entfernen,
- bei Bedarf Drag & Drop.

---

# 90. Password Fields

Passwortfelder:

- Show/Hide,
- Caps Lock Hinweis wenn sinnvoll,
- Anforderungen vor Eingabe,
- Stärke nicht nur über künstliche Regeln bewerten.

---

# 91. Fokus auf Recovery statt Schuld

Fehlermeldungen beschreiben das Problem neutral.

Nicht:

```text
Du hast ein falsches Datum eingegeben.
```

Besser:

```text
Dieses Datum liegt ausserhalb des erlaubten Bereichs.
```

---

# 92. Sicherheitskritische Aktionen

Für sicherheitskritische Prozesse gilt:

- keine Optimistic UI,
- klare Progress-Anzeige,
- confirmed Server State,
- Doppelausführung verhindern,
- Fehler recovery-fähig.

---

# 93. API- und Netzwerkaktionen

Frontendvalidierung dient Geschwindigkeit und UX.

Backendvalidierung bleibt notwendig.

Das UI darf niemals implizieren, dass clientseitige Prüfung Sicherheit garantiert.

---

# 94. Design Tokens – Beispielstruktur

Falls noch kein etabliertes Tokensystem vorhanden ist:

```css
:root {
  /* Typography */
  --font-family-ui: ...;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Radius */
  --radius-sm: ...;
  --radius-md: ...;
  --radius-lg: ...;
  --radius-xl: ...;

  /* Semantic surfaces */
  --color-bg-page: ...;
  --color-bg-surface: ...;
  --color-bg-elevated: ...;
  --color-bg-glass: ...;

  /* Text */
  --color-text-primary: ...;
  --color-text-secondary: ...;
  --color-text-muted: ...;

  /* Border */
  --color-border-subtle: ...;
  --color-border-strong: ...;

  /* Actions */
  --color-action-primary: ...;
  --color-action-primary-hover: ...;

  /* Semantic */
  --color-success: ...;
  --color-warning: ...;
  --color-danger: ...;
  --color-info: ...;

  /* Motion */
  --duration-fast: ...;
  --duration-normal: ...;
  --duration-slow: ...;
  --ease-standard: ...;
  --ease-enter: ...;
  --ease-exit: ...;

  /* Layering */
  --z-sticky: 100;
  --z-dropdown: 200;
  --z-popover: 300;
  --z-modal-backdrop: 400;
  --z-modal: 410;
  --z-toast: 500;
}
```

**Wichtig:** Nicht blind übernehmen. Bestehende Projektwerte zuerst analysieren und konsolidieren.

---

# 95. Komponentenvertrag

Jede wiederverwendbare UI-Komponente soll definieren:

```text
Purpose
Anatomy
Variants
Sizes
States
Responsive behaviour
Keyboard behaviour
Accessibility
Motion
Do / Don't
```

---

# 96. Neue Komponente einführen

Vor einer neuen Komponente prüfen:

1. Existiert bereits eine passende?
2. Kann eine bestehende Variante erweitert werden?
3. Ist der Anwendungsfall wiederverwendbar?
4. Welche States braucht sie?
5. Wie funktioniert sie auf Touch?
6. Wie funktioniert sie per Keyboard?
7. Wie sieht Loading/Error aus?
8. Welche Tokens verwendet sie?

---

# 97. UI Review Checklist

Vor Merge jeder grösseren UI-Änderung prüfen:

## Nutzerabsicht

- [ ] Hauptaufgabe der Seite ist klar.
- [ ] Primary Action ist klar.
- [ ] Seltene Aktionen sind visuell sekundär.
- [ ] UI folgt Nutzerlogik statt Datenmodell.

## Konsistenz

- [ ] Bestehende Tokens verwendet.
- [ ] Keine zufälligen Hex-Werte.
- [ ] Keine zufälligen Spacing-Werte.
- [ ] Keine neue Komponentenvariante ohne Grund.
- [ ] Icons stammen aus demselben System.

## Layout

- [ ] Desktopbreite sinnvoll genutzt.
- [ ] Kein unnötiger Page-Scroll.
- [ ] Keine Überlappungen.
- [ ] Content bleibt bei Zoom nutzbar.
- [ ] Mobile ist sinnvoll angepasst.

## States

- [ ] Loading
- [ ] Empty
- [ ] Partial
- [ ] Error
- [ ] Success
- [ ] Offline

## Interaktion

- [ ] Hover
- [ ] Active
- [ ] Focus
- [ ] Disabled
- [ ] Busy
- [ ] Keyboard
- [ ] Touch

## Accessibility

- [ ] Semantisches HTML.
- [ ] Focus sichtbar.
- [ ] Labels vorhanden.
- [ ] Kontrast ausreichend.
- [ ] Touch Targets ausreichend.
- [ ] Reduced Motion berücksichtigt.

## Motion

- [ ] Animation erklärt etwas.
- [ ] Dauer angemessen.
- [ ] Exit nicht unnötig langsam.
- [ ] Persistente UI flackert nicht.
- [ ] Keine Layout-Jumps.

## Content

- [ ] UI-Texte konkret.
- [ ] Buttons beschreiben Aktionen.
- [ ] Fehler bieten Recovery.
- [ ] Keine unnötige technische Sprache.

---

# 98. AI-Agent-Regeln

Dieser Abschnitt ist besonders wichtig für Codex und andere AI-Agents.

---

## 98.1 Vor Designänderungen

Der Agent MUSS zuerst prüfen:

1. bestehende Styles,
2. CSS Variables,
3. Theme-Dateien,
4. verwendete Komponenten,
5. ähnliche Seiten,
6. bestehende Responsive Patterns.

Er darf nicht eine neue visuelle Sprache parallel zum Projekt erstellen.

---

## 98.2 Keine Design-Rewrites ohne Auftrag

Wenn die Aufgabe lautet:

> „Modal reparieren“

darf der Agent nicht gleichzeitig:

- Header redesignen,
- Farben ändern,
- Buttons neu gestalten,
- Navigation umbauen.

Scope einhalten.

---

## 98.3 Funktionale Logik schützen

Bei reinen Designänderungen:

- Business Logic unverändert,
- API-Verhalten unverändert,
- State Management unverändert,
- Routing unverändert,

sofern nicht zwingend erforderlich.

---

## 98.4 Keine Platzhalterentscheidung

Nicht:

```text
Ich verwende hier einfach Blau.
```

Stattdessen bestehendes Primary Token verwenden.

---

## 98.5 Bestehendes System gewinnt

Wenn DESIGN.md und tatsächlicher Code leicht voneinander abweichen:

1. prüfen, ob Code absichtlich neuer ist,
2. System konsolidieren,
3. nicht blind beides vermischen.

---

## 98.6 Bei echter Lücke

Wenn eine Entscheidung nicht dokumentiert ist:

- aus bestehenden Mustern ableiten,
- minimal erweitern,
- neue Regel dokumentieren.

Keine grosse neue Designsprache erfinden.

---

# 99. UX-Spezifikation vor komplexer Implementierung

Bei komplexen neuen Screens zuerst eine kurze UX-Spezifikation erstellen.

Mindestens:

```markdown
## User
Wer nutzt die Seite?

## Primary Goal
Was soll die Person hier erreichen?

## Worst Mistake
Was wäre der problematischste Fehler?

## Information Priority
1.
2.
3.

## Actions
Primary:
Secondary:
Destructive:

## States
Loading:
Empty:
Partial:
Error:
Success:
Offline:

## Responsive
Desktop:
Mobile:

## Accessibility
Keyboard:
Focus:
Announcements:
```

Erst danach implementieren.

---

# 100. Severity bei UX Reviews

Gefundene UX-Probleme sollen priorisiert werden:

## P0 – Blocker

- Funktion nicht nutzbar
- Datenverlust möglich
- unzugängliche Kernfunktion
- UI friert ein
- massive Überlappung

## P1 – Hoch

- Hauptflow verwirrend
- Mobile Kernfunktion defekt
- Fehler nicht recoverbar
- wichtige Aktion nicht auffindbar

## P2 – Mittel

- Inkonsistenz
- schwache Hierarchie
- unnötiger Scroll
- fehlendes Feedback

## P3 – Niedrig

- optische Feinheit
- kleine Motion-Unstimmigkeit
- Spacing-Polish

Erst Blocker und Flow-Probleme lösen, danach Pixel-Polish.

---

# 101. Anti-Patterns – explizit verboten

Folgende Muster sollen nicht eingeführt werden:

- Emojis als UI-Icons
- Placeholder-only Inputs
- `outline: none` ohne Ersatz
- zufällige z-index-Werte
- UI nur für Success State
- wichtige Aktionen nur auf Hover
- Desktop-UI auf Mobile nur zusammenschieben
- komplette Page neu laden für kleine Datenupdates
- Skeleton für jede Ladeaktion
- Disabled Buttons ohne erklärbaren Grund
- technische Fehlermeldungen ohne Recovery
- Modals stapeln
- Rot für harmlose Aktionen
- zufällige Hex-Farben
- lokale One-off-Radien
- Buttons mit unklarer Bezeichnung wie „OK“, wenn konkrete Aktion möglich
- massives Glassmorphism ohne Kontrast
- unnötiger Fullpage-Scroll in produktiven Desktopansichten
- Animation, die wichtige Interaktion verzögert
- Layoutsprünge durch asynchrone Daten
- User-Agent-Sniffing für Hover/Touch-Design
- Desktopfunktionen, die auf Mobile nur über Hover erreichbar sind.

---

# 102. Definition of Done für UI/UX

Eine Oberfläche ist erst fertig, wenn:

1. die Hauptaufgabe klar ist,
2. visuelle Hierarchie stimmt,
3. bestehendes Design-System eingehalten wird,
4. Desktop sinnvoll funktioniert,
5. Mobile sinnvoll funktioniert,
6. Loading vorhanden ist,
7. Empty vorhanden ist,
8. Error vorhanden ist,
9. Offline berücksichtigt wurde, falls relevant,
10. Focus States funktionieren,
11. Keyboard-Bedienung geprüft wurde,
12. Touch Targets passen,
13. Motion einen Zweck erfüllt,
14. Reduced Motion berücksichtigt wird,
15. Texte verständlich sind,
16. keine Überlappungen auftreten,
17. Datenupdates keine UI-Flackerei erzeugen,
18. keine neuen Designwerte still erfunden wurden.

---

# 103. Kurzform für Agents

Wenn Zeit knapp ist, gelten mindestens diese Regeln:

> **Intent first. Hierarchy second. System before invention. States before polish. Responsive by behaviour, not scaling. Motion must explain change. Accessibility is part of the component.**

Und konkret:

1. Nutzerziel bestimmen.
2. Primary Action bestimmen.
3. Bestehende Tokens/Komponenten lesen.
4. Keine neuen Werte ohne Grund.
5. Loading/Empty/Error/Success/Offline entwerfen.
6. Mobile separat prüfen.
7. Hover nie voraussetzen.
8. Focus und Keyboard prüfen.
9. Keine Emojis als Icons.
10. Keine Überlappungen und keinen unnötigen Scroll erzeugen.
11. Header und persistente UI bei Navigation stabil halten.
12. Funktionalität nicht für visuelles Redesign beschädigen.

---

# 104. Quellen und Inspiration

Die UX-Grundsätze in diesem Dokument wurden unter anderem durch die frei zugängliche Pattern Library und die öffentlich beschriebenen Design-System-Prinzipien von **designmotionhq** inspiriert und für HWM konkretisiert.

Wichtige Referenzbereiche:

- UX Pattern Library
  https://designmotionhq.com/patterns

- UX Engine / Design-System-Prinzipien
  https://designmotionhq.com/ux-engine

- Settings System
  https://designmotionhq.com/patterns/settings-system

- Disabled Buttons
  https://designmotionhq.com/patterns/disabled-buttons

- Hover Trap
  https://designmotionhq.com/patterns/hover-trap

- Bulk Actions
  https://designmotionhq.com/patterns/bulk-actions

- Behind the Button
  https://designmotionhq.com/patterns/behind-the-button

- Range Sliders
  https://designmotionhq.com/patterns/range-sliders

- Accordion Disclosure
  https://designmotionhq.com/patterns/accordion-disclosure

- Z-Index Mastery
  https://designmotionhq.com/patterns/z-index-mastery

Die Regeln wurden nicht als Kopie einzelner Artikel übernommen, sondern als projektspezifische Spezifikation zusammengeführt, erweitert und auf HWM zugeschnitten.

---

# 105. Pflege dieses Dokuments

DESIGN.md ist ein lebendes Dokument.

Wenn sich das tatsächliche Design-System bewusst weiterentwickelt:

1. Änderung im System umsetzen,
2. Komponenten aktualisieren,
3. DESIGN.md anpassen,
4. alte Sonderfälle entfernen.

Dieses Dokument soll den realen Stand des Produkts beschreiben, nicht eine historische Wunschvorstellung.

---

# Ende

**Grundsatz:** Gute UI sieht nicht nur konsistent aus. Sie verhält sich konsistent.
