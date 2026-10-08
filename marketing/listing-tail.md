---

## Zrzuty ekranu do sklepu

Pliki: `marketing/store/{pl,en,es,de,fr,it,pt}/01..08-*.png`, 1080×1920, generuje `marketing/build-store-shots.mjs`
z prawdziwych ekranów apki (przykładowa kolekcja 48 gier z `marketing/seed.mjs`).
Kolejność ma znaczenie: pierwsze 3 widać w wynikach wyszukiwania bez przewijania.

1. Kupka wstydu: ile pieniędzy leży na półce
2. Finanse: ile naprawdę wydajesz
3. Rok w grach
4. Kolekcja i „Teraz gram”
5. Import ze Steam, PSN, Xboxa i Playnite
6. Lista życzeń z ceną docelową
7. Statystyki: gdzie poszedł Twój czas
8. Pro: jednorazowo, bez subskrypcji

Okładki gier: w tym środowisku skrypt nie miał dostępu do RAWG, więc gry mają kafelki z inicjałami.
Z okładkami (jak na starym zrzucie „Screen 2” w katalogu głównym repo) uruchom u siebie:
`npx vite --port 5199`, a w drugim oknie `COVERS=1 node marketing/shots.mjs` i `node marketing/build-store-shots.mjs`.

## Feature graphic

`public/feature-graphic.png` (1024×500) zostaje. Nie może zawierać przycisku „Pobierz” ani cen.

## Klasyfikacja treści (kwestionariusz IARC)

Zmiana po wprowadzeniu Pro: na pytanie o **zakupy cyfrowe** (digital purchases) odpowiedz **Tak**.
Reszta bez zmian: brak przemocy, hazardu, treści użytkowników i udostępniania lokalizacji. Oczekiwana kategoria: PEGI 3, z dopiskiem „Zakupy w aplikacji”.

## Polityka prywatności

`https://matiseekk-dot.github.io/Games/privacy.html` (aktualna: opisuje Cloudflare Web Analytics, Umami i weryfikację zakupu Pro).

## Bezpieczeństwo danych (Data safety): do sprawdzenia

Stary opis zakładał „aplikacja nic nie zbiera”. Od 1.18 to już nie do końca prawda, więc sprawdź formularz:
- **Zakup Pro:** token zakupu idzie do serwera weryfikacji (Cloudflare Worker). Google traktuje to zwykle jako
  „Informacje finansowe → Historia zakupów”, zbierane, nieudostępniane, cel: funkcje aplikacji, przesyłane szyfrowane.
- **Cloudflare Web Analytics** działa też w aplikacji z Google Play (to ta sama strona w TWA):
  „Aktywność w aplikacji → Interakcje z aplikacją”, anonimowe, cel: analityka.
- **Umami** jest wyłączony (`UMAMI_WEBSITE_ID` puste). Gdy go włączysz, dochodzi ta sama kategoria.
- Usuwanie danych: tak, Ustawienia → Usuń wszystkie dane.

## Reklamy

Zawiera reklamy: **Nie**. Dostęp do aplikacji: wszystkie funkcje bez logowania.
