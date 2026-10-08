# Shorty PS5 Vault: kanał, harmonogram, tytuły i opisy

12 filmów × 7 języków = 84 gotowych shortów w `marketing/shorts/{język}/`.
Każdy ma 12 do 18 sekund, format 9:16 (1080×1920), napisy, własny podkład synthwave (bez praw autorskich
osób trzecich) i prawdziwe ekrany apki. Obok każdego filmu leży `*-cover.png` (miniatura).
Te same pliki pasują do TikToka, Instagram Reels i reklam w Google Ads.

Generowanie od nowa (np. po zmianach w apce):
```
npx vite --port 5199                 # w jednym oknie: apka lokalnie
node marketing/shots.mjs             # zrzuty ekranu (COVERS=1 = z okładkami gier, u siebie)
node marketing/build-shorts.mjs      # filmy (albo: node marketing/build-shorts.mjs pl 01)
node marketing/build-shorts-copy.mjs # ten plik
```

## Kanał: osobny, na tym samym koncie Google

Na jednym koncie Google możesz mieć kilka kanałów YouTube. Shorty PS5 Vault wrzucaj na **nowy kanał**,
nie na kanał Spokojnego Rodzica: YouTube podsuwa shorty widzom podobnym do tych, którzy już oglądają kanał.
Rodzice niemowląt nie będą oglądać filmów o grach, a słabe wyniki obniżyłyby zasięgi obu tematów.

1. YouTube → zdjęcie profilowe → **Ustawienia** → **Dodaj kanał lub nim zarządzaj** → **Utwórz kanał**.
2. Nazwa: **PS5 Vault**. Uchwyt (handle): np. `@ps5vault` albo `@ps5vaultapp`, jeśli zajęty.
3. Zdjęcie profilowe: `public/icons/icon-512.png`. Baner: `public/feature-graphic.png` (YouTube przytnie środek).
4. YouTube Studio → **Dostosowywanie** → **Profil** → **Linki** → dodaj „PS5 Vault w Google Play”:
   ```
   https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dprofile
   ```
   Ten link jest klikalny pod nazwą kanału. Linki w opisie Shorta nie są klikalne, dlatego opis odsyła do profilu.
5. Opis kanału: „Tracker gier dla graczy: kolekcja, wydatki, kupka wstydu i podsumowanie roku. Bez konta i bez reklam.”

Między kanałami przełączasz się w YouTube Studio: zdjęcie profilowe → **Przełącz konto**.

## Jak wrzucać

1. YouTube Studio (kanał PS5 Vault) → **Utwórz** → **Prześlij filmy** → zaznacz kilka plików naraz.
2. Dla każdego: wklej **tytuł** i **opis** z sekcji w języku filmu (niżej). Miniatura: `*-cover.png`.
3. **Odbiorcy:** Nieprzeznaczony dla dzieci.
4. **Pokaż więcej → Język i certyfikacja napisów → Język filmu:** ustaw język filmu. Dzięki temu YouTube
   pokazuje film ludziom mówiącym w tym języku, więc wszystkie języki mogą być na jednym kanale.
5. **Widoczność → Zaplanuj:** wpisz datę i godzinę z harmonogramu. Możesz wrzucić cały tydzień za jednym razem.

Najlepsza pora: **18:00 i 20:30** czasu polskiego (gracze siedzą wieczorem). Filmy po angielsku i portugalsku
lepiej na 20:30 (wtedy w Ameryce jest popołudnie).

Pierwsze godziny decydują o zasięgu, więc po publikacji odpowiadaj na komentarze. Pytanie w komentarzu
(„Ile gier masz w folii?”) i przypięcie go nic nie kosztuje, a podbija rozmowę.

## Własny klip na początek (opcjonalnie, mocno polecam)

Film zaczynający się od prawdziwego obrazu zatrzymuje przewijanie lepiej niż sama grafika.
Nagraj telefonem w pionie 2 do 3 sekund: Twoja półka z pudełkami, pad w ręku albo skanowanie pudełka.
Plik połóż jako `marketing/intro/01.mp4` (dla filmu 01) albo `marketing/intro/all.mp4` (dla wszystkich)
i uruchom generator jeszcze raz: napis z hooka pojawi się na Twoim nagraniu.

**Nie wklejaj nagrań z gier** (gameplay, trailery). Materiał należy do wydawcy, a w reklamie cudzej apki to
prosta droga do roszczenia Content ID albo ostrzeżenia na nowym kanale. Pudełka na półce w Twoim pokoju są w porządku.

## Harmonogram

2 filmy dziennie od soboty 10.10. Potem lista życzeń przed Black Friday, a podsumowanie roku w grudniu.
Gdy któryś temat wyraźnie wygrywa (Studio → Analityka → wyświetlenia i „obejrzane do końca”),
zrób do niego drugą wersję: inny hook, ten sam ekran.

| Dzień | 18:00 | 20:30 |
|---|---|---|
| sb 10.10 | 🇵🇱 `pl/01-kupka-wstydu.mp4` | 🇬🇧 `en/08-how-many-hours.mp4` |
| nd 11.10 | 🇩🇪 `de/02-wie-viel-ausgegeben.mp4` | 🇧🇷 `pt/05-o-que-jogar.mp4` |
| pn 12.10 | 🇪🇸 `es/12-coste-por-hora.mp4` | 🇫🇷 `fr/04-importe-ta-bibliotheque.mp4` |
| wt 13.10 | 🇮🇹 `it/07-conto-alla-rovescia.mp4` | 🇵🇱 `pl/10-zeskanuj-pudelko.mp4` |
| śr 14.10 | 🇬🇧 `en/09-no-subscription.mp4` | 🇩🇪 `de/11-erfolge.mp4` |
| cz 15.10 | 🇬🇧 `en/01-pile-of-shame.mp4` | 🇩🇪 `de/08-wie-viele-stunden.mp4` |
| pt 16.10 | 🇧🇷 `pt/02-quanto-voce-gastou.mp4` | 🇪🇸 `es/05-a-que-juego.mp4` |
| sb 17.10 | 🇫🇷 `fr/12-cout-par-heure.mp4` | 🇮🇹 `it/04-importa-la-libreria.mp4` |
| nd 18.10 | 🇵🇱 `pl/07-odliczanie-do-premiery.mp4` | 🇬🇧 `en/10-scan-the-box.mp4` |
| pn 19.10 | 🇩🇪 `de/09-kein-abo.mp4` | 🇧🇷 `pt/11-conquistas.mp4` |
| wt 20.10 | 🇩🇪 `de/01-pile-of-shame.mp4` | 🇧🇷 `pt/08-quantas-horas.mp4` |
| śr 21.10 | 🇪🇸 `es/02-cuanto-gastaste.mp4` | 🇫🇷 `fr/05-a-quoi-jouer.mp4` |
| cz 22.10 | 🇮🇹 `it/12-costo-per-ora.mp4` | 🇵🇱 `pl/04-import-biblioteki.mp4` |
| pt 23.10 | 🇬🇧 `en/07-release-countdown.mp4` | 🇩🇪 `de/10-huelle-scannen.mp4` |
| sb 24.10 | 🇧🇷 `pt/09-sem-assinatura.mp4` | 🇪🇸 `es/11-logros.mp4` |
| nd 25.10 | 🇧🇷 `pt/01-pilha-da-vergonha.mp4` | 🇪🇸 `es/08-cuantas-horas.mp4` |
| pn 26.10 | 🇫🇷 `fr/02-combien-tu-as-depense.mp4` | 🇮🇹 `it/05-a-cosa-gioco.mp4` |
| wt 27.10 | 🇵🇱 `pl/12-koszt-godziny-grania.mp4` | 🇬🇧 `en/04-import-your-library.mp4` |
| śr 28.10 | 🇩🇪 `de/07-release-countdown.mp4` | 🇧🇷 `pt/10-escaneie-a-caixa.mp4` |
| cz 29.10 | 🇪🇸 `es/09-sin-suscripcion.mp4` | 🇫🇷 `fr/11-succes.mp4` |
| pt 30.10 | 🇪🇸 `es/01-pila-de-la-verguenza.mp4` | 🇫🇷 `fr/08-combien-d-heures.mp4` |
| sb 31.10 | 🇮🇹 `it/02-quanto-hai-speso.mp4` | 🇵🇱 `pl/05-w-co-zagrac.mp4` |
| nd 01.11 | 🇬🇧 `en/12-cost-per-hour.mp4` | 🇩🇪 `de/04-bibliothek-importieren.mp4` |
| pn 02.11 | 🇧🇷 `pt/07-contagem-regressiva.mp4` | 🇪🇸 `es/10-escanea-la-caja.mp4` |
| wt 03.11 | 🇫🇷 `fr/09-sans-abonnement.mp4` | 🇮🇹 `it/11-obiettivi.mp4` |
| śr 04.11 | 🇫🇷 `fr/01-pile-de-la-honte.mp4` | 🇮🇹 `it/08-quante-ore.mp4` |
| cz 05.11 | 🇵🇱 `pl/02-ile-wydales-na-gry.mp4` | 🇬🇧 `en/05-what-to-play.mp4` |
| pt 06.11 | 🇩🇪 `de/12-kosten-pro-stunde.mp4` | 🇧🇷 `pt/04-importe-sua-biblioteca.mp4` |
| sb 07.11 | 🇪🇸 `es/07-cuenta-atras-lanzamiento.mp4` | 🇫🇷 `fr/10-scanne-la-boite.mp4` |
| nd 08.11 | 🇮🇹 `it/09-senza-abbonamento.mp4` | 🇵🇱 `pl/11-osiagniecia.mp4` |
| pn 09.11 | 🇮🇹 `it/01-pila-della-vergogna.mp4` | 🇵🇱 `pl/08-ile-godzin-przegrales.mp4` |
| wt 10.11 | 🇬🇧 `en/02-how-much-you-spent.mp4` | 🇩🇪 `de/05-was-spielen.mp4` |
| śr 11.11 | 🇧🇷 `pt/12-custo-por-hora.mp4` | 🇪🇸 `es/04-importa-tu-biblioteca.mp4` |
| cz 12.11 | 🇫🇷 `fr/07-compte-a-rebours-sortie.mp4` | 🇮🇹 `it/10-scansiona-la-confezione.mp4` |
| pt 13.11 | 🇵🇱 `pl/09-bez-subskrypcji.mp4` | 🇬🇧 `en/11-achievements.mp4` |
| pn 16.11 | 🇵🇱 `pl/06-kupuj-tylko-w-promocji.mp4` |  |
| wt 17.11 | 🇬🇧 `en/06-only-buy-on-sale.mp4` |  |
| śr 18.11 | 🇩🇪 `de/06-nur-im-sale-kaufen.mp4` |  |
| cz 19.11 | 🇧🇷 `pt/06-so-compre-na-promocao.mp4` |  |
| pt 20.11 | 🇪🇸 `es/06-compra-solo-en-oferta.mp4` |  |
| sb 21.11 | 🇫🇷 `fr/06-achete-seulement-en-promo.mp4` |  |
| nd 22.11 | 🇮🇹 `it/06-compra-solo-in-saldo.mp4` |  |
| wt 01.12 | 🇵🇱 `pl/03-rok-w-grach.mp4` |  |
| śr 02.12 | 🇬🇧 `en/03-year-in-games.mp4` |  |
| cz 03.12 | 🇩🇪 `de/03-jahr-in-spielen.mp4` |  |
| pt 04.12 | 🇧🇷 `pt/03-ano-em-jogos.mp4` |  |
| sb 05.12 | 🇪🇸 `es/03-ano-en-juegos.mp4` |  |
| nd 06.12 | 🇫🇷 `fr/03-annee-en-jeux.mp4` |  |
| pn 07.12 | 🇮🇹 `it/03-anno-in-giochi.mp4` |  |

---

# 🇵🇱 PL (Język filmu: Polski)

## 01. `01-kupka-wstydu.mp4`

```
Ile kasy leży u Ciebie na półce? 🎮 Kupka wstydu w liczbach
```
```
Gry kupione na promocji i nigdy nie odpalone. PS5 Vault liczy, ile ich masz i ile pieniędzy w nich leży, a potem robi z tego obrazek do udostępnienia.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort01

#kupkawstydu #backlog #ps5 #playstation #gry #gracze #shorts
```

## 02. `02-ile-wydales-na-gry.mp4`

```
Ile naprawdę wydałeś na gry? 💸 Gry, DLC i mikrotransakcje
```
```
Wpisujesz ceny gier, DLC i to, co odzyskałeś ze sprzedaży, a PS5 Vault pokazuje wydatki miesiąc po miesiącu i podpowiada, gdzie przepłacasz.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort02

#gry #ps5 #playstation #wydatki #dlc #gracze #shorts
```

## 03. `03-rok-w-grach.mp4`

```
Twój rok w grach w liczbach 🎁 Podsumowanie roku dla graczy
```
```
Ile godzin grałeś w tym roku, co ukończyłeś, ile platyn wbiłeś i jaki gatunek wygrał. PS5 Vault robi z tego gotowy obrazek do udostępnienia.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort03

#podsumowanieroku #gry #ps5 #playstation #platyna #gracze #shorts
```

## 04. `04-import-biblioteki.mp4`

```
Cała biblioteka gier w minutę 📥 Import ze Steam, PSN, Xboxa i Playnite
```
```
Nie musisz wpisywać setek gier ręcznie. PS5 Vault importuje bibliotekę ze Steam, PSN, Xboxa i Playnite (za darmo do 50 gier, bez limitu w Pro).

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort04

#steam #psn #xbox #playnite #ps5 #gry #shorts
```

## 05. `05-w-co-zagrac.mp4`

```
Nie wiesz, w co zagrać? 🎲 Wylosuj grę z kupki wstydu
```
```
Godzina przeglądania biblioteki i zero grania? W PS5 Vault jeden przycisk „Co zagrać?” losuje grę z Twojej kupki wstydu.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort05

#wcozagrac #backlog #ps5 #playstation #gry #gracze #shorts
```

## 06. `06-kupuj-tylko-w-promocji.mp4`

```
Nigdy nie kupuj gry w pełnej cenie 🎯 Lista życzeń z ceną docelową
```
```
Wpisz, ile chcesz zapłacić za grę, a gdy trafisz na promocję w PS Store, PS5 Vault powie, że to już ten moment.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort06

#promocja #psstore #ps5 #playstation #gry #wishlist #shorts
```

## 07. `07-odliczanie-do-premiery.mp4`

```
Ile dni do premiery? ⏳ Odliczanie do gier, na które czekasz
```
```
Dodaj grę z datą premiery, a PS5 Vault pokaże odliczanie na głównym ekranie i przypomni 3 dni przed premierą i w dniu premiery.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort07

#premiera #preorder #ps5 #playstation #gry #gracze #shorts
```

## 08. `08-ile-godzin-przegrales.mp4`

```
Ile godzin naprawdę przegrałeś? ⏱ Top 10 gier, które zjadły Twój czas
```
```
PS5 Vault sumuje godziny z całej kolekcji i pokazuje, które gry zjadły najwięcej czasu, ile procent biblioteki ukończyłeś i ile masz platyn.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort08

#gry #ps5 #playstation #statystyki #platyna #gracze #shorts
```

## 09. `09-bez-subskrypcji.mp4`

```
Apka dla graczy bez subskrypcji i bez reklam 🔒 PS5 Vault
```
```
Kolekcja gier, statystyki, premiery i podsumowanie roku za darmo. Pro to jeden zakup w Google Play, bez abonamentu. Bez konta, kolekcja zostaje na telefonie.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort09

#bezreklam #ps5 #playstation #gry #aplikacja #gracze #shorts
```

## 10. `10-zeskanuj-pudelko.mp4`

```
Zeskanuj pudełko i gra jest w kolekcji 📷 Skaner kodów kreskowych
```
```
Masz gry na płytach? Zeskanuj kod kreskowy z tyłu pudełka, a PS5 Vault sam uzupełni tytuł, gatunek i rok. W Pro skanujesz całą półkę pod rząd.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort10

#kolekcjagier #pudełka #ps5 #playstation #gry #gracze #shorts
```

## 11. `11-osiagniecia.mp4`

```
Trofea za ogarnięcie kolekcji gier 🏆 19 osiągnięć w PS5 Vault
```
```
Kolekcjoner, finiszer, łowca trofeów, maratończyk. PS5 Vault ma 19 osiągnięć, które odblokowujesz, gdy dodajesz i kończysz gry.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort11

#trofea #platyna #ps5 #playstation #gry #gracze #shorts
```

## 12. `12-koszt-godziny-grania.mp4`

```
Ile kosztuje Cię godzina grania? 🧮 Koszt na godzinę każdej gry
```
```
Gra za 300 zł, w którą grałeś 100 godzin, kosztowała 3 zł za godzinę. PS5 Vault liczy koszt godziny całej kolekcji i pokazuje gry z najgorszą wartością.

Link w profilu kanału:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort12

#gry #ps5 #playstation #finanse #oszczędzanie #gracze #shorts
```

---

# 🇬🇧 EN (Język filmu: Angielski)

## 01. `01-pile-of-shame.mp4`

```
How much money is sitting on your shelf? 🎮 Pile of shame
```
```
Games bought on sale and never played. PS5 Vault counts how many you have and how much money is stuck in them, then turns it into an image you can share.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort01

#pileofshame #backlog #ps5 #playstation #gaming #gamer #shorts
```

## 02. `02-how-much-you-spent.mp4`

```
How much have you REALLY spent on games? 💸 Games, DLC, microtransactions
```
```
Log what you paid for games and DLC and what you got back from selling. PS5 Vault shows your spending month by month and where you overpay.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort02

#gaming #ps5 #playstation #dlc #microtransactions #gamer #shorts
```

## 03. `03-year-in-games.mp4`

```
Your year in games, in numbers 🎁 A year recap for gamers
```
```
How many hours you played this year, what you finished, how many platinums you earned and which genre won. PS5 Vault turns it into an image ready to share.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort03

#yearinreview #gaming #ps5 #playstation #platinum #gamer #shorts
```

## 04. `04-import-your-library.mp4`

```
Your whole game library in a minute 📥 Import from Steam, PSN, Xbox and Playnite
```
```
No need to type hundreds of games by hand. PS5 Vault imports your library from Steam, PSN, Xbox and Playnite (free up to 50 games, unlimited with Pro).

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort04

#steam #psn #xbox #playnite #ps5 #gaming #shorts
```

## 05. `05-what-to-play.mp4`

```
Can’t decide what to play? 🎲 Let your backlog pick
```
```
An hour of browsing your library and zero playing? In PS5 Vault one "What to play?" button picks a game from your backlog.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort05

#whattoplay #backlog #ps5 #playstation #gaming #gamer #shorts
```

## 06. `06-only-buy-on-sale.mp4`

```
Never buy a game at full price 🎯 Wishlist with target prices
```
```
Set what you want to pay for a game, and when you spot a PS Store sale, PS5 Vault tells you it is time to buy.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort06

#pssale #psstore #ps5 #playstation #gaming #wishlist #shorts
```

## 07. `07-release-countdown.mp4`

```
How many days until launch? ⏳ A countdown to the games you’re waiting for
```
```
Add a game with its release date and PS5 Vault shows a countdown on the home screen and reminds you 3 days before and on launch day.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort07

#preorder #release #ps5 #playstation #gaming #gamer #shorts
```

## 08. `08-how-many-hours.mp4`

```
How many hours have you REALLY played? ⏱ The top 10 games that ate your time
```
```
PS5 Vault adds up hours across your whole collection and shows which games ate the most time, how much of your library you finished and your platinums.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort08

#gaming #ps5 #playstation #stats #platinum #gamer #shorts
```

## 09. `09-no-subscription.mp4`

```
A gamer app with no subscription and no ads 🔒 PS5 Vault
```
```
Game collection, stats, releases and your year in games for free. Pro is a single Google Play purchase, no subscription. No account, your collection stays on your phone.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort09

#noads #ps5 #playstation #gaming #app #gamer #shorts
```

## 10. `10-scan-the-box.mp4`

```
Scan the box and the game is in your collection 📷 Barcode scanner
```
```
Collect physical games? Scan the barcode on the back of the box and PS5 Vault fills in the title, genre and year. With Pro you scan your whole shelf in a row.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort10

#physicalgames #gamecollection #ps5 #playstation #gaming #gamer #shorts
```

## 11. `11-achievements.mp4`

```
Trophies for your game collection 🏆 19 achievements in PS5 Vault
```
```
Collector, finisher, trophy hunter, marathoner. PS5 Vault has 19 achievements you unlock as you add and finish games.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort11

#trophies #platinum #ps5 #playstation #gaming #gamer #shorts
```

## 12. `12-cost-per-hour.mp4`

```
What does one hour of gaming cost you? 🧮 Cost per hour for every game
```
```
A $60 game you played for 100 hours cost $0.60 an hour. PS5 Vault works out the cost per hour of your whole collection and shows the games with the worst value.

Link in the channel profile:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort12

#gaming #ps5 #playstation #money #value #gamer #shorts
```

---

# 🇩🇪 DE (Język filmu: Niemiecki)

## 01. `01-pile-of-shame.mp4`

```
Wie viel Geld liegt bei dir im Regal? 🎮 Pile of Shame
```
```
Im Sale gekauft und nie gestartet. PS5 Vault zählt, wie viele Spiele das sind und wie viel Geld darin steckt, und macht daraus ein Bild zum Teilen.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort01

#pileofshame #backlog #ps5 #playstation #gaming #zocken #shorts
```

## 02. `02-wie-viel-ausgegeben.mp4`

```
Wie viel hast du WIRKLICH für Spiele ausgegeben? 💸 Spiele, DLCs, Mikrotransaktionen
```
```
Trag ein, was du für Spiele und DLCs bezahlt und durch Verkäufe zurückbekommen hast. PS5 Vault zeigt deine Ausgaben Monat für Monat und wo du zu viel zahlst.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort02

#gaming #ps5 #playstation #dlc #zocken #gamer #shorts
```

## 03. `03-jahr-in-spielen.mp4`

```
Dein Jahr in Spielen in Zahlen 🎁 Der Jahresrückblick für Gamer
```
```
Wie viele Stunden du dieses Jahr gespielt hast, was du beendet hast, wie viele Platin-Trophäen du geholt hast und welches Genre gewonnen hat. PS5 Vault macht daraus ein Bild zum Teilen.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort03

#jahresrückblick #gaming #ps5 #playstation #platin #zocken #shorts
```

## 04. `04-bibliothek-importieren.mp4`

```
Deine ganze Spielebibliothek in einer Minute 📥 Import aus Steam, PSN, Xbox und Playnite
```
```
Du musst nicht Hunderte Spiele von Hand eintippen. PS5 Vault importiert deine Bibliothek aus Steam, PSN, Xbox und Playnite (kostenlos bis 50 Spiele, ohne Limit mit Pro).

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort04

#steam #psn #xbox #playnite #ps5 #gaming #shorts
```

## 05. `05-was-spielen.mp4`

```
Keine Ahnung, was du spielen sollst? 🎲 Lass deinen Pile of Shame entscheiden
```
```
Eine Stunde durch die Bibliothek scrollen und null zocken? In PS5 Vault lost ein Knopf „Was spielen?“ ein Spiel aus deinem Stapel aus.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort05

#backlog #pileofshame #ps5 #playstation #gaming #zocken #shorts
```

## 06. `06-nur-im-sale-kaufen.mp4`

```
Kauf nie ein Spiel zum Vollpreis 🎯 Wunschliste mit Zielpreis
```
```
Trag ein, was du für ein Spiel zahlen willst, und wenn du einen Sale im PS Store siehst, sagt dir PS5 Vault, dass jetzt der Moment ist.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort06

#sale #psstore #ps5 #playstation #gaming #zocken #shorts
```

## 07. `07-release-countdown.mp4`

```
Wie viele Tage bis zum Release? ⏳ Countdown für deine Spiele
```
```
Trag ein Spiel mit Erscheinungsdatum ein und PS5 Vault zeigt den Countdown auf dem Startbildschirm und erinnert dich 3 Tage vorher und am Release-Tag.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort07

#release #vorbestellung #ps5 #playstation #gaming #zocken #shorts
```

## 08. `08-wie-viele-stunden.mp4`

```
Wie viele Stunden hast du WIRKLICH gezockt? ⏱ Die Top 10 Zeitfresser
```
```
PS5 Vault zählt die Stunden deiner ganzen Sammlung zusammen und zeigt, welche Spiele am meisten Zeit gefressen haben, wie viel du beendet hast und deine Platin-Trophäen.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort08

#gaming #ps5 #playstation #statistik #platin #zocken #shorts
```

## 09. `09-kein-abo.mp4`

```
Eine Gamer-App ohne Abo und ohne Werbung 🔒 PS5 Vault
```
```
Spielesammlung, Statistiken, Releases und dein Jahr in Spielen kostenlos. Pro ist ein einmaliger Kauf bei Google Play, kein Abo. Kein Konto, deine Sammlung bleibt auf deinem Handy.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort09

#ohnewerbung #ps5 #playstation #gaming #app #zocken #shorts
```

## 10. `10-huelle-scannen.mp4`

```
Hülle scannen und das Spiel ist in der Sammlung 📷 Barcode-Scanner
```
```
Du sammelst Spiele auf Disc? Scann den Barcode auf der Rückseite und PS5 Vault füllt Titel, Genre und Jahr aus. Mit Pro scannst du das ganze Regal am Stück.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort10

#retail #spielesammlung #ps5 #playstation #gaming #zocken #shorts
```

## 11. `11-erfolge.mp4`

```
Trophäen für deine Spielesammlung 🏆 19 Erfolge in PS5 Vault
```
```
Sammler, Finisher, Trophäenjäger, Marathon. PS5 Vault hat 19 Erfolge, die du freischaltest, wenn du Spiele hinzufügst und beendest.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort11

#trophäen #platin #ps5 #playstation #gaming #zocken #shorts
```

## 12. `12-kosten-pro-stunde.mp4`

```
Was kostet dich eine Stunde Zocken? 🧮 Kosten pro Stunde für jedes Spiel
```
```
Ein Spiel für 70 €, das du 100 Stunden gespielt hast, hat 0,70 € pro Stunde gekostet. PS5 Vault berechnet die Kosten pro Stunde deiner ganzen Sammlung und zeigt die Spiele mit dem schlechtesten Wert.

Link im Kanalprofil:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort12

#gaming #ps5 #playstation #geld #zocken #gamer #shorts
```

---

# 🇧🇷 PT (Język filmu: Portugalski (Brazylia))

## 01. `01-pilha-da-vergonha.mp4`

```
Quanto dinheiro está parado na sua estante? 🎮 Pilha da vergonha
```
```
Jogos comprados na promoção e nunca jogados. O PS5 Vault conta quantos você tem e quanto dinheiro está neles, e transforma isso numa imagem para compartilhar.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort01

#backlog #pilhadavergonha #ps5 #playstation #games #gamer #shorts
```

## 02. `02-quanto-voce-gastou.mp4`

```
Quanto você REALMENTE gastou com jogos? 💸 Jogos, DLCs e microtransações
```
```
Anote quanto pagou em jogos e DLCs e quanto recuperou vendendo. O PS5 Vault mostra seus gastos mês a mês e onde você paga caro.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort02

#games #ps5 #playstation #dlc #gamer #gaming #shorts
```

## 03. `03-ano-em-jogos.mp4`

```
Seu ano em jogos em números 🎁 A retrospectiva para gamers
```
```
Quantas horas você jogou este ano, o que zerou, quantas platinas pegou e qual gênero venceu. O PS5 Vault transforma tudo numa imagem pronta para compartilhar.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort03

#retrospectiva #games #ps5 #playstation #platina #gamer #shorts
```

## 04. `04-importe-sua-biblioteca.mp4`

```
Sua biblioteca de jogos inteira em um minuto 📥 Importe da Steam, PSN, Xbox e Playnite
```
```
Não precisa digitar centenas de jogos um por um. O PS5 Vault importa sua biblioteca da Steam, PSN, Xbox e Playnite (grátis até 50 jogos, sem limite no Pro).

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort04

#steam #psn #xbox #playnite #ps5 #games #shorts
```

## 05. `05-o-que-jogar.mp4`

```
Não sabe o que jogar? 🎲 Deixe sua pilha escolher
```
```
Uma hora olhando a biblioteca e zero jogando? No PS5 Vault um botão "O que jogar?" sorteia um jogo da sua pilha da vergonha.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort05

#backlog #games #ps5 #playstation #gamer #gaming #shorts
```

## 06. `06-so-compre-na-promocao.mp4`

```
Nunca compre jogo pelo preço cheio 🎯 Lista de desejos com preço-alvo
```
```
Diga quanto quer pagar num jogo e, quando aparecer uma promoção na PS Store, o PS5 Vault avisa que chegou a hora.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort06

#promocao #psstore #ps5 #playstation #games #gamer #shorts
```

## 07. `07-contagem-regressiva.mp4`

```
Quantos dias para o lançamento? ⏳ Contagem regressiva dos seus jogos
```
```
Adicione um jogo com a data de lançamento e o PS5 Vault mostra a contagem na tela inicial e avisa 3 dias antes e no dia do lançamento.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort07

#lancamento #prevenda #ps5 #playstation #games #gamer #shorts
```

## 08. `08-quantas-horas.mp4`

```
Quantas horas você REALMENTE jogou? ⏱ O top 10 de jogos que comeram seu tempo
```
```
O PS5 Vault soma as horas da sua coleção inteira e mostra quais jogos levaram mais tempo, quanto da biblioteca você zerou e suas platinas.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort08

#games #ps5 #playstation #estatisticas #platina #gamer #shorts
```

## 09. `09-sem-assinatura.mp4`

```
Um app para gamers sem assinatura e sem anúncios 🔒 PS5 Vault
```
```
Coleção de jogos, estatísticas, lançamentos e seu ano em jogos de graça. O Pro é uma compra única no Google Play, sem assinatura. Sem conta, sua coleção fica no celular.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort09

#semanuncios #ps5 #playstation #games #app #gamer #shorts
```

## 10. `10-escaneie-a-caixa.mp4`

```
Escaneie a caixa e o jogo já está na coleção 📷 Scanner de código de barras
```
```
Coleciona mídia física? Escaneie o código de barras atrás da caixa e o PS5 Vault preenche título, gênero e ano. No Pro você escaneia a estante inteira em sequência.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort10

#midiafisica #colecao #ps5 #playstation #games #gamer #shorts
```

## 11. `11-conquistas.mp4`

```
Troféus pela sua coleção de jogos 🏆 19 conquistas no PS5 Vault
```
```
Colecionador, finalizador, caçador de troféus, maratonista. O PS5 Vault tem 19 conquistas que você desbloqueia ao adicionar e zerar jogos.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort11

#trofeus #platina #ps5 #playstation #games #gamer #shorts
```

## 12. `12-custo-por-hora.mp4`

```
Quanto custa uma hora de jogo? 🧮 Custo por hora de cada jogo
```
```
Um jogo de R$ 300 que você jogou por 100 horas custou R$ 3 por hora. O PS5 Vault calcula o custo por hora da sua coleção inteira e mostra os jogos que menos valeram a pena.

Link no perfil do canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort12

#games #ps5 #playstation #dinheiro #gamer #gaming #shorts
```

---

# 🇪🇸 ES (Język filmu: Hiszpański)

## 01. `01-pila-de-la-verguenza.mp4`

```
¿Cuánto dinero tienes parado en la estantería? 🎮 Pila de la vergüenza
```
```
Juegos comprados en oferta y nunca jugados. PS5 Vault cuenta cuántos tienes y cuánto dinero hay en ellos, y lo convierte en una imagen para compartir.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort01

#backlog #piladelaverguenza #ps5 #playstation #videojuegos #gamer #shorts
```

## 02. `02-cuanto-gastaste.mp4`

```
¿Cuánto has gastado DE VERDAD en juegos? 💸 Juegos, DLC y microtransacciones
```
```
Apunta lo que pagaste por juegos y DLC y lo que recuperaste al venderlos. PS5 Vault te muestra el gasto mes a mes y dónde pagas de más.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort02

#videojuegos #ps5 #playstation #dlc #gamer #gaming #shorts
```

## 03. `03-ano-en-juegos.mp4`

```
Tu año en juegos en números 🎁 El resumen del año para gamers
```
```
Cuántas horas jugaste este año, qué terminaste, cuántos platinos sacaste y qué género ganó. PS5 Vault lo convierte en una imagen lista para compartir.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort03

#resumendelaño #videojuegos #ps5 #playstation #platino #gamer #shorts
```

## 04. `04-importa-tu-biblioteca.mp4`

```
Toda tu biblioteca de juegos en un minuto 📥 Importa de Steam, PSN, Xbox y Playnite
```
```
No hace falta escribir cientos de juegos a mano. PS5 Vault importa tu biblioteca de Steam, PSN, Xbox y Playnite (gratis hasta 50 juegos, sin límite con Pro).

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort04

#steam #psn #xbox #playnite #ps5 #videojuegos #shorts
```

## 05. `05-a-que-juego.mp4`

```
¿No sabes a qué jugar? 🎲 Deja que tu pila elija
```
```
¿Una hora mirando la biblioteca y cero jugando? En PS5 Vault un botón "¿A qué juego?" elige un juego de tu pila de pendientes.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort05

#backlog #videojuegos #ps5 #playstation #gamer #gaming #shorts
```

## 06. `06-compra-solo-en-oferta.mp4`

```
Nunca compres un juego a precio completo 🎯 Lista de deseos con precio objetivo
```
```
Indica cuánto quieres pagar por un juego y, cuando veas una oferta en PS Store, PS5 Vault te avisa de que es el momento.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort06

#ofertas #psstore #ps5 #playstation #videojuegos #gamer #shorts
```

## 07. `07-cuenta-atras-lanzamiento.mp4`

```
¿Cuántos días faltan para el lanzamiento? ⏳ Cuenta atrás para tus juegos
```
```
Añade un juego con su fecha de lanzamiento y PS5 Vault muestra la cuenta atrás en la pantalla principal y te avisa 3 días antes y el día del lanzamiento.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort07

#lanzamiento #reserva #ps5 #playstation #videojuegos #gamer #shorts
```

## 08. `08-cuantas-horas.mp4`

```
¿Cuántas horas has jugado DE VERDAD? ⏱ El top 10 de juegos que se comieron tu tiempo
```
```
PS5 Vault suma las horas de toda tu colección y te muestra qué juegos se llevaron más tiempo, cuánto de tu biblioteca terminaste y tus platinos.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort08

#videojuegos #ps5 #playstation #estadisticas #platino #gamer #shorts
```

## 09. `09-sin-suscripcion.mp4`

```
Una app para gamers sin suscripción ni anuncios 🔒 PS5 Vault
```
```
Colección de juegos, estadísticas, lanzamientos y tu año en juegos gratis. Pro es una única compra en Google Play, sin suscripción. Sin cuenta, tu colección se queda en tu móvil.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort09

#sinanuncios #ps5 #playstation #videojuegos #app #gamer #shorts
```

## 10. `10-escanea-la-caja.mp4`

```
Escanea la caja y el juego ya está en tu colección 📷 Escáner de códigos
```
```
¿Coleccionas juegos en físico? Escanea el código de barras de la caja y PS5 Vault rellena título, género y año. Con Pro escaneas toda la estantería seguida.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort10

#formatofisico #coleccion #ps5 #playstation #videojuegos #gamer #shorts
```

## 11. `11-logros.mp4`

```
Trofeos por tu colección de juegos 🏆 19 logros en PS5 Vault
```
```
Coleccionista, finalista, cazador de trofeos, maratoniano. PS5 Vault tiene 19 logros que desbloqueas al añadir y terminar juegos.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort11

#trofeos #platino #ps5 #playstation #videojuegos #gamer #shorts
```

## 12. `12-coste-por-hora.mp4`

```
¿Cuánto te cuesta una hora de juego? 🧮 Coste por hora de cada juego
```
```
Un juego de 70 € al que jugaste 100 horas te costó 0,70 € la hora. PS5 Vault calcula el coste por hora de toda tu colección y te muestra los juegos que menos valieron la pena.

Enlace en el perfil del canal:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort12

#videojuegos #ps5 #playstation #dinero #gamer #gaming #shorts
```

---

# 🇫🇷 FR (Język filmu: Francuski)

## 01. `01-pile-de-la-honte.mp4`

```
Combien d’argent dort sur ton étagère ? 🎮 Pile de la honte
```
```
Des jeux achetés en solde et jamais lancés. PS5 Vault compte combien tu en as et combien d’argent dort dedans, puis en fait une image à partager.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort01

#backlog #piledelahonte #ps5 #playstation #jeuxvideo #gamer #shorts
```

## 02. `02-combien-tu-as-depense.mp4`

```
Combien as-tu VRAIMENT dépensé en jeux ? 💸 Jeux, DLC, microtransactions
```
```
Note ce que tu as payé pour tes jeux et DLC et ce que tu as récupéré en revendant. PS5 Vault montre tes dépenses mois par mois et où tu paies trop.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort02

#jeuxvideo #ps5 #playstation #dlc #gamer #gaming #shorts
```

## 03. `03-annee-en-jeux.mp4`

```
Ton année en jeux en chiffres 🎁 Le bilan de l’année pour les joueurs
```
```
Combien d’heures tu as joué cette année, ce que tu as terminé, combien de platines tu as eues et quel genre a gagné. PS5 Vault en fait une image prête à partager.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort03

#bilan #jeuxvideo #ps5 #playstation #platine #gamer #shorts
```

## 04. `04-importe-ta-bibliotheque.mp4`

```
Toute ta bibliothèque de jeux en une minute 📥 Import Steam, PSN, Xbox et Playnite
```
```
Inutile de taper des centaines de jeux à la main. PS5 Vault importe ta bibliothèque depuis Steam, PSN, Xbox et Playnite (gratuit jusqu’à 50 jeux, sans limite avec Pro).

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort04

#steam #psn #xbox #playnite #ps5 #jeuxvideo #shorts
```

## 05. `05-a-quoi-jouer.mp4`

```
Tu ne sais pas à quoi jouer ? 🎲 Laisse ta pile choisir
```
```
Une heure à parcourir ta bibliothèque et zéro partie ? Dans PS5 Vault, un bouton « À quoi jouer ? » tire un jeu de ta pile de la honte.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort05

#backlog #jeuxvideo #ps5 #playstation #gamer #gaming #shorts
```

## 06. `06-achete-seulement-en-promo.mp4`

```
N’achète jamais un jeu au prix fort 🎯 Liste de souhaits avec prix cible
```
```
Indique combien tu veux payer un jeu et, quand tu vois une promo sur le PS Store, PS5 Vault te dit que c’est le moment.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort06

#promo #psstore #ps5 #playstation #jeuxvideo #gamer #shorts
```

## 07. `07-compte-a-rebours-sortie.mp4`

```
Combien de jours avant la sortie ? ⏳ Compte à rebours pour tes jeux
```
```
Ajoute un jeu avec sa date de sortie et PS5 Vault affiche le compte à rebours sur l’écran d’accueil et te prévient 3 jours avant et le jour J.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort07

#sortie #precommande #ps5 #playstation #jeuxvideo #gamer #shorts
```

## 08. `08-combien-d-heures.mp4`

```
Combien d’heures as-tu VRAIMENT joué ? ⏱ Le top 10 des jeux qui ont mangé ton temps
```
```
PS5 Vault additionne les heures de toute ta collection et montre quels jeux ont pris le plus de temps, combien de ta bibliothèque est terminée et tes platines.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort08

#jeuxvideo #ps5 #playstation #stats #platine #gamer #shorts
```

## 09. `09-sans-abonnement.mp4`

```
Une app pour joueurs sans abonnement ni pub 🔒 PS5 Vault
```
```
Collection de jeux, stats, sorties et ton année en jeux gratuitement. Pro est un achat unique sur Google Play, sans abonnement. Sans compte, ta collection reste sur ton téléphone.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort09

#sanspub #ps5 #playstation #jeuxvideo #app #gamer #shorts
```

## 10. `10-scanne-la-boite.mp4`

```
Scanne la boîte et le jeu est dans ta collection 📷 Scanner de codes-barres
```
```
Tu collectionnes les jeux en physique ? Scanne le code-barres au dos de la boîte et PS5 Vault remplit le titre, le genre et l’année. Avec Pro, tu scannes toute l’étagère à la suite.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort10

#physique #collection #ps5 #playstation #jeuxvideo #gamer #shorts
```

## 11. `11-succes.mp4`

```
Des trophées pour ta collection de jeux 🏆 19 succès dans PS5 Vault
```
```
Collectionneur, finisseur, chasseur de trophées, marathonien. PS5 Vault propose 19 succès que tu débloques en ajoutant et en terminant des jeux.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort11

#trophees #platine #ps5 #playstation #jeuxvideo #gamer #shorts
```

## 12. `12-cout-par-heure.mp4`

```
Combien te coûte une heure de jeu ? 🧮 Le coût par heure de chaque jeu
```
```
Un jeu à 70 € joué 100 heures t’a coûté 0,70 € de l’heure. PS5 Vault calcule le coût par heure de toute ta collection et montre les jeux qui en valaient le moins la peine.

Lien dans le profil de la chaîne:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort12

#jeuxvideo #ps5 #playstation #argent #gamer #gaming #shorts
```

---

# 🇮🇹 IT (Język filmu: Włoski)

## 01. `01-pila-della-vergogna.mp4`

```
Quanti soldi hai fermi sullo scaffale? 🎮 Pila della vergogna
```
```
Giochi comprati in saldo e mai avviati. PS5 Vault conta quanti ne hai e quanti soldi ci sono dentro, poi ne fa un’immagine da condividere.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort01

#backlog #piladellavergogna #ps5 #playstation #videogiochi #gamer #shorts
```

## 02. `02-quanto-hai-speso.mp4`

```
Quanto hai speso DAVVERO in giochi? 💸 Giochi, DLC, microtransazioni
```
```
Segna quanto hai pagato giochi e DLC e quanto hai recuperato vendendoli. PS5 Vault mostra le spese mese per mese e dove paghi troppo.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort02

#videogiochi #ps5 #playstation #dlc #gamer #gaming #shorts
```

## 03. `03-anno-in-giochi.mp4`

```
Il tuo anno in giochi in numeri 🎁 Il riepilogo dell’anno per gamer
```
```
Quante ore hai giocato quest’anno, cosa hai finito, quanti platini hai preso e quale genere ha vinto. PS5 Vault lo trasforma in un’immagine pronta da condividere.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort03

#riepilogo #videogiochi #ps5 #playstation #platino #gamer #shorts
```

## 04. `04-importa-la-libreria.mp4`

```
Tutta la tua libreria di giochi in un minuto 📥 Import da Steam, PSN, Xbox e Playnite
```
```
Non serve scrivere centinaia di giochi a mano. PS5 Vault importa la tua libreria da Steam, PSN, Xbox e Playnite (gratis fino a 50 giochi, senza limiti con Pro).

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort04

#steam #psn #xbox #playnite #ps5 #videogiochi #shorts
```

## 05. `05-a-cosa-gioco.mp4`

```
Non sai a cosa giocare? 🎲 Lascia scegliere la tua pila
```
```
Un’ora a scorrere la libreria e zero partite? In PS5 Vault un pulsante "A cosa gioco?" estrae un gioco dalla tua pila della vergogna.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort05

#backlog #videogiochi #ps5 #playstation #gamer #gaming #shorts
```

## 06. `06-compra-solo-in-saldo.mp4`

```
Mai comprare un gioco a prezzo pieno 🎯 Lista desideri con prezzo obiettivo
```
```
Scrivi quanto vuoi pagare un gioco e, quando trovi un saldo sul PS Store, PS5 Vault ti dice che è il momento.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort06

#saldi #psstore #ps5 #playstation #videogiochi #gamer #shorts
```

## 07. `07-conto-alla-rovescia.mp4`

```
Quanti giorni all’uscita? ⏳ Conto alla rovescia per i tuoi giochi
```
```
Aggiungi un gioco con la data di uscita e PS5 Vault mostra il conto alla rovescia nella schermata principale e ti avvisa 3 giorni prima e il giorno stesso.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort07

#uscita #preordine #ps5 #playstation #videogiochi #gamer #shorts
```

## 08. `08-quante-ore.mp4`

```
Quante ore hai giocato DAVVERO? ⏱ La top 10 dei giochi che ti hanno mangiato il tempo
```
```
PS5 Vault somma le ore di tutta la collezione e mostra quali giochi hanno preso più tempo, quanta libreria hai finito e i tuoi platini.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort08

#videogiochi #ps5 #playstation #statistiche #platino #gamer #shorts
```

## 09. `09-senza-abbonamento.mp4`

```
Un’app per gamer senza abbonamento e senza pubblicità 🔒 PS5 Vault
```
```
Collezione di giochi, statistiche, uscite e il tuo anno in giochi gratis. Pro è un acquisto unico su Google Play, senza abbonamento. Niente account, la collezione resta sul telefono.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort09

#senzapubblicita #ps5 #playstation #videogiochi #app #gamer #shorts
```

## 10. `10-scansiona-la-confezione.mp4`

```
Scansiona la confezione e il gioco è nella collezione 📷 Scanner codici a barre
```
```
Collezioni giochi fisici? Scansiona il codice a barre sul retro e PS5 Vault compila titolo, genere e anno. Con Pro scansioni tutto lo scaffale di fila.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort10

#fisico #collezione #ps5 #playstation #videogiochi #gamer #shorts
```

## 11. `11-obiettivi.mp4`

```
Trofei per la tua collezione di giochi 🏆 19 obiettivi in PS5 Vault
```
```
Collezionista, finisher, cacciatore di trofei, maratoneta. PS5 Vault ha 19 obiettivi che sblocchi aggiungendo e finendo giochi.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort11

#trofei #platino #ps5 #playstation #videogiochi #gamer #shorts
```

## 12. `12-costo-per-ora.mp4`

```
Quanto ti costa un’ora di gioco? 🧮 Il costo per ora di ogni gioco
```
```
Un gioco da 70 € giocato per 100 ore ti è costato 0,70 € all’ora. PS5 Vault calcola il costo per ora di tutta la collezione e mostra i giochi che valevano di meno.

Link nel profilo del canale:
https://play.google.com/store/apps/details?id=com.skudev.ps5vault&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort12

#videogiochi #ps5 #playstation #soldi #gamer #gaming #shorts
```
