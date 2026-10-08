# PS5 Vault Pro: uruchomienie krok po kroku

Pro to jednorazowy zakup w Google Play (produkt `pro_lifetime`, ok. 19,99 zł / 4,99 €).
Kod jest gotowy i wdrożony, ale wyłączony przełącznikiem `PRO_ENABLED` w `src/constants.js`.
Dopóki go nie włączymy, użytkownicy nie widzą żadnej zmiany.

Jak to działa: apka (TWA) kupuje przez Google Play Billing (Digital Goods API w Chrome).
Google zwraca pieniądze za zakup, którego serwer nie potwierdzi w ciągu 3 dni, a samej apki
TWA nie da się do tego użyć. Dlatego zakup potwierdza mały serwer `worker/` na Cloudflare
(darmowy plan). Klucz do API Google trzyma tylko ten serwer.

Kolejność ma znaczenie: produkt w Play Console da się utworzyć dopiero po wgraniu wersji
z modułem płatności (uprawnienie `BILLING`).

## 1. Podpisz i wgraj AAB 1.18.0 (versionCode 50)

AAB z modułem Play Billing (biblioteka 8.3.0, wymagana przez Google od 31.08.2026) jest zbudowany,
ale niepodpisany. Klucz do przesyłania to `android.keystore` (alias `my-key-alias`, SHA-256 9B:85:BB:E0...). Hasło trzymaj w menedżerze haseł. Podpisany 8.10.2026, plik leży w Archiwum. Polecenie na przyszłość (jarsigner zapyta o hasło, nikt inny go nie widzi):

```
"C:/Program Files/Eclipse Adoptium/jdk-17.0.20.101-hotspot/bin/jarsigner.exe" -keystore "C:/Users/kinga/ps5vault-twa-build/android.keystore" -signedjar "C:/Users/kinga/Desktop/Aplikacje/Gry/Archiwum/PS5 Vault - Google Play package v1.18.0/PS5 Vault v1.18.0.aab" "C:/Users/kinga/ps5vault-twa-build/app/build/outputs/bundle/release/app-release.aab" my-key-alias
```

Wgraj podpisany plik najpierw na **test wewnętrzny** (Testowanie, Test wewnętrzny).

## 2. Konto usługi Google z dostępem do Play Console

Serwer musi pytać Google o zakupy. Potrzebne jest konto usługi (service account):

1. Google Cloud Console, projekt powiązany z Play Console (może być ten od Spokojnego Rodzica),
   IAM, Konta usługi: utwórz konto, np. `ps5vault-billing`, bez ról w Cloud.
2. W tym koncie: Klucze, Dodaj klucz, JSON. Plik zapisz w bezpiecznym miejscu (nie w repo).
3. Włącz w projekcie **Google Play Android Developer API**.
4. Play Console, Użytkownicy i uprawnienia, Zaproś użytkownika: adres e-mail konta usługi,
   dostęp do aplikacji PS5 Vault z uprawnieniami **Wyświetlanie danych finansowych** oraz
   **Zarządzanie zamówieniami i subskrypcjami**.

Jeśli konto usługi od Spokojnego Rodzica ma już dostęp do całego konta dewelopera, wystarczy
dodać mu dostęp do PS5 Vault i użyć tego samego klucza.

## 3. Serwer na Cloudflare

W folderze `worker/` repozytorium (PowerShell; znak `<` tam nie działa, stąd Get-Content):

```
cd worker
npx wrangler login
npx wrangler deploy
Get-Content "C:/sciezka/do/klucza.json" -Raw | npx wrangler secret put GOOGLE_SA_JSON
```

`wrangler deploy` wypisze adres, np. `https://ps5vault-billing.<twoje-konto>.workers.dev`.
Ten adres przekaż mi (to nie jest tajne).

## 4. Produkt w Play Console

Zarabianie, Produkty, Produkty w aplikacji, Utwórz produkt:

- Identyfikator: `pro_lifetime` (dokładnie tak)
- Nazwa: `PS5 Vault Pro`
- Opis: `Import bez limitu, zaawansowane finanse, budżet i skaner seryjny.`
- Cena: 19,99 PLN; sprawdź przeliczenia dla innych krajów (np. 4,99 EUR)
- Aktywuj produkt.

## 5. Zakup testowy

Play Console, Ustawienia, Testowanie licencji: dodaj swój adres Gmail. Zainstaluj wersję z testu
wewnętrznego i kup Pro. Konta testowe płacą testową kartą, bez prawdziwych pieniędzy.

## 6. Włączenie (zrobione 8.10.2026, wersja 1.21.0)

Po podaniu adresu serwera ustawiam `BILLING_API` i `PRO_ENABLED = true`, wdrażam i razem
sprawdzamy zakup testowy. Na koniec wersja 1.18.0 idzie na produkcję w Play.

## Uwaga przy `bubblewrap update`

Projekt Androida (`C:/Users/kinga/ps5vault-twa-build`) ma moduł płatności dodany ręcznie.
`bubblewrap update` wstawiłby `com.google.androidbrowserhelper:billing:1.1.0` (Play Billing
Library 7, odrzucana przez Google). Po każdym `bubblewrap update` sprawdź w `app/build.gradle`,
że jest `billing:1.2.0` lub nowszy. Kopia plików sprzed zmian: `_backup_v49/`.

## Analityka (Umami)

Kod jest gotowy i wyłączony. Załóż darmowe konto na umami.is (plan Hobby, bez karty), dodaj
stronę `matiseekk-dot.github.io` i przekaż mi jej Website ID. Wtedy wpiszę je w
`UMAMI_WEBSITE_ID` i wdrożę. Zdarzenia: `first_open`, `onboarding_done`, `first_game_added`,
`import_done`, `finance_opened`, `paywall_view`, `purchase_start`, `purchase_result`,
`drive_enabled`, `drive_restore`, `rate_prompt`, `rate_click`, `shame_share`, `wish_added`, `wish_bought`.
Po włączeniu trzeba też zaktualizować formularz Bezpieczeństwo danych w Play Console
(Aktywność w aplikacji, Interakcje z aplikacją: zbierane, nieudostępniane, anonimowe).

## Kopia na Dysku Google (1.19.0)

Kod jest gotowy i ukryty, dopóki `DRIVE_CLIENT_ID` w `src/constants.js` jest pusty. Kopia trafia
do ukrytego folderu apki na Dysku użytkownika (uprawnienie `drive.appdata`, Google uznaje je za
niewrażliwe, więc nie ma płatnego audytu bezpieczeństwa). Po włączeniu Pro kopia jest w Pro.

1. Google Cloud Console (może być ten sam projekt co konto usługi): Interfejsy API i usługi,
   Biblioteka, włącz **Google Drive API**.
2. Google Auth Platform, Branding: nazwa `PS5 Vault`, e-mail pomocy, strona główna
   `https://skudev.pl/ps5-vault/`, polityka prywatności
   `https://matiseekk-dot.github.io/Games/privacy.html`, autoryzowane domeny `skudev.pl` i
   `matiseekk-dot.github.io`.
3. Odbiorcy: typ Zewnętrzny, stan publikacji **W produkcji** (w trybie testowym działa tylko dla
   dodanych kont testowych).
4. Dostęp do danych: dodaj zakres `https://www.googleapis.com/auth/drive.appdata`.
5. Klienty: Utwórz klienta, typ **Aplikacja internetowa**, Autoryzowane źródła JavaScriptu:
   `https://matiseekk-dot.github.io` (bez ścieżki). Identyfikatory URI przekierowania nie są
   potrzebne.
6. Przekaż mi identyfikator klienta (kończy się na `.apps.googleusercontent.com`, jest jawny,
   to nie hasło). Wpiszę go, wdrożę i razem sprawdzimy na telefonie w wersji z Google Play.
   To ważne: okno logowania Google musi poprawnie wrócić do apki w TWA. Jeśli nie wróci,
   przełączę logowanie na tryb przekierowania.

Google może poprosić o weryfikację marki (potwierdzenie domen w Search Console). Jest bezpłatna
i zwykle trwa kilka dni. Zdarzenia analityki: `drive_enabled`, `drive_restore`.
