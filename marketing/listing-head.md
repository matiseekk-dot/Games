# Google Play: teksty do sklepu (wersja 1.21, październik 2026)

Gotowe do wklejenia w Play Console. Plik jest generowany: teksty edytuj w `marketing/listing.mjs`,
potem `node marketing/listing.mjs` (sprawdza limity znaków i długie myślniki) i
`node marketing/build-listing.mjs` (składa ten plik).

Co się zmieniło względem starego opisu:
- Usunięte funkcje, których już nie ma: Cele, Rekomendacje, timer sesji, „brak telemetrii”, „100% open source”, rozmiar pliku.
- Dodane: PS5 Vault Pro (jednorazowo), import Steam / PSN / Xbox / Playnite, lista życzeń z ceną docelową,
  obrazek „kupka wstydu”, losowanie „Co zagrać?”, PS Plus i Game Pass jako źródło, 7 języków, 12 walut.
- Bez nazwy „Spotify Wrapped” (cudza marka w opisie łamie zasady Google Play dotyczące metadanych).
- Na końcu każdego opisu zdanie, że apka nie jest powiązana z Sony. Nazwa zawiera „PS5”, więc to chroni przed zgłoszeniem.

## Jak wkleić

1. Play Console → PS5 Vault → **Zwiększanie liczby użytkowników** → **Strona aplikacji w sklepie** → **Główna strona aplikacji**.
2. Język domyślny: polski. Wklej nazwę, krótki i pełny opis z sekcji PL.
3. **Zarządzaj tłumaczeniami** → **Dodaj własne tłumaczenia** i zaznacz: `en-US`, `en-GB`, `es-419`, `es-ES`, `de-DE`, `fr-FR`, `it-IT`, `pt-BR`.
   en-GB dostaje ten sam tekst co en-US, a es-ES ten sam co es-419.
4. Dla każdego języka wgraj zrzuty z `marketing/store/{język}/` (patrz niżej).
5. „Co nowego” wklejasz przy wysyłaniu kolejnej wersji: **Wersje** → wersja → **Informacje o wersji**.

Nazwa w sklepie: „PS5 Vault: Tracker Gier” zamiast samego „PS5 Vault”. Dopisek pomaga w wyszukiwaniu
(ludzie wpisują „tracker gier”, „game tracker”), a apka nadal nazywa się PS5 Vault.

Kategoria: **Rozrywka**. Tagi w Play Console: Gry wideo, Narzędzia, Finanse osobiste.
