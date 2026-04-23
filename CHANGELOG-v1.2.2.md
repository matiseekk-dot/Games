# PS5 Vault — v1.2.2

**Theme:** Branding polish przed screenshot session
**Previous:** v1.2.1 (Settings crash hotfix — na produkcji)

## Zmiany

### Header logo: "PS5" → "V"
- `.lico` (header top-left 34×34): tekst "PS5" → "V", font 20px dla czytelności
- `.ob-logo` (onboarding 80×80): tekst "PS5" → "V", font 48px

Powód: spójność z nową 4-quadrant ikoną launchera. "V" jak "Vault" — cleaner, skaluje się w screenshotach Play Store lepiej.

### Store dropdown expanded
- `STORES` whitelist: było 8 pozycji, teraz 13
- Dodane: `PS Store`, `Steam`, `Empik`, `Amazon`, `eBay`
- Nic nie usunięte — backward compat 100%

Nowa lista: `PSN, PS Store, Steam, CDP, Allegro, OLX, Media Expert, Empik, Amazon, eBay, Disc, Key, Other`

## Tech

- Build passes (829 modules)
- SW bump v9 → v10
- package.json → 1.2.2
- Bundle size: bez zmian (kilka bajtów)

## Deployment

1. Wypakuj ZIP → zastąp `ps5-vault/`
2. Commit: `v1.2.2 — header V logo + 5 more stores in dropdown`
3. Push
4. Hard refresh → SW = `ps5vault-v10`
5. Sprawdź: header widzisz "V" w kwadracie, nie "PS5"
6. Sprawdź: Add/Edit gra → dropdown Sklep ma teraz Amazon, eBay, Steam itd.

## Twoja akcja PRZED screenshots

Masz w kolekcji 5 gier z pustym store (`Horizon`, `TLoU2`, `TLoU Remastered`, `Days Gone`, `Vampire`) i 2 z "Inne" (Crimson Desert, Ghost of Yotei).

**Dla dobrych screenów** wybierz dla każdej z tych 7 gier sensowny store z nowej rozszerzonej listy. Proponowany rozkład:

- Horizon Zero Dawn Remastered → **PS Store**
- The Last of Us Part II → **PS Store**
- The Last Of Us Remastered → **PS Store**
- Days Gone → **Allegro**
- Vampire: The Masquerade → **Steam** (lub Allegro)
- Crimson Desert (obecnie "Inne") → **Allegro**
- Ghost of Yotei (obecnie "Inne") → **Media Expert**

Po edycji chart "Wydatki wg sklepu" będzie miał spójne polskie + realistyczne sklepy (Allegro dominujący, PS Store, Media Expert, Steam, Inne — 5 kategorii zamiast "Inne/Other").

## Nie zrobiono (ale rozważane)

- i18n dla STORES ("Other" w EN = "Inne" w PL) → v1.3+, wymaga migrations i testów
- Autocomplete freehand input → nie potrzebny, whitelist z 13 pozycjami wystarczy dla 95% przypadków
