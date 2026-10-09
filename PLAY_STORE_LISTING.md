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

---

## Polski (pl-PL)

**Nazwa aplikacji** (23/30)

```
PS5 Vault: Tracker Gier
```

**Krótki opis** (66/80)

```
Kolekcja gier, wydatki i podsumowanie roku. Bez konta, bez reklam.
```

**Pełny opis** (2693/4000)

```
Ile naprawdę wydałeś na gry? Ile godzin w nie wsiąkło? I ile gier wciąż czeka w folii?

PS5 Vault to prywatny tracker kolekcji gier. Dodajesz gry, a apka liczy godziny, pieniądze i postępy, a na koniec roku robi z tego podsumowanie do udostępnienia.

━━━ KOLEKCJA W MINUTĘ ━━━
🔎 Wpisz tytuł: okładka, gatunek i data premiery uzupełnią się same (baza RAWG, ponad 500 000 gier).
📷 Zeskanuj kod kreskowy z pudełka i gra jest w kolekcji.
📥 Masz już setki gier? Zaimportuj bibliotekę ze Steam, PSN, Xboxa albo Playnite (za darmo do 50 gier).
🕹 PS5, PS4, Xbox, PC i Switch w jednym miejscu, także gry z PS Plus i Game Pass.

━━━ PIENIĄDZE POD KONTROLĄ ━━━
💰 Ile wydałeś na gry, DLC i mikrotransakcje, a ile odzyskałeś ze sprzedaży.
📉 Wydatki miesiąc po miesiącu i najdroższy miesiąc.
🧊 Niezagrane gry: ile pieniędzy leży na półce.
🎯 Lista życzeń z ceną docelową: wpisz, za ile kupisz, a apka powie, kiedy trafiłeś na promocję.

━━━ KUPKA WSTYDU I PODSUMOWANIE ROKU ━━━
📦 Twoja kupka wstydu na jednym obrazku: ile gier i ile złotych czeka. Udostępnij znajomym.
🎁 Rok w grach: godziny, najczęściej grane tytuły, ukończone gry, platyny i ulubiony gatunek.
🎲 Nie wiesz, w co grać? „Co zagrać?” wylosuje grę z Twojej kupki.
🏆 19 osiągnięć: od pierwszej gry po łowcę trofeów.

━━━ PREMIERY ━━━
📅 Gry z przyszłą datą premiery trafiają do osobnej zakładki z odliczaniem.
🔔 Przypomnienie na miesiąc, tydzień i 3 dni przed premierą oraz w dniu premiery.

━━━ STATYSTYKI ━━━
📊 Top 10 gier, w które poszło najwięcej czasu, procent ukończonej biblioteki, platyny, oceny i gatunki.

━━━ PS5 VAULT PRO (OPCJONALNIE) ━━━
Jednorazowy zakup w Google Play. Bez subskrypcji i bez reklam, na zawsze.
• Import całej biblioteki bez limitu
• Zaawansowane finanse: koszt na godzinę, ROI, prognoza roku, wykresy według sklepu i gatunku
• Analiza wydatków: gdzie przepłacasz i co warto sprzedać
• Budżet miesięczny z alertem po przekroczeniu
• Skaner seryjny: wiele pudełek pod rząd
Wszystko poza tym jest darmowe.

━━━ PRYWATNOŚĆ ━━━
Bez konta i bez reklam. Twoja kolekcja zostaje na Twoim telefonie. Kopię zapasową zrobisz jednym przyciskiem (plik JSON).
Apka pyta zewnętrzne serwisy tylko o informacje o grach (RAWG, baza kodów kreskowych), nigdy o Ciebie.

━━━ TAKŻE ━━━
• 7 języków: polski, angielski, hiszpański, niemiecki, francuski, włoski, portugalski
• 12 walut, w tym złoty, euro, dolar i funt
• Działa offline
• Zaznaczanie wielu gier naraz i cofanie usunięcia

PS5 Vault robi jedna osoba po godzinach. Masz pomysł albo znalazłeś błąd? Napisz w opinii, czytam wszystkie.

PS5 Vault nie jest powiązany z Sony Interactive Entertainment. „PS5” i „PlayStation” są znakami towarowymi Sony Interactive Entertainment Inc.
```

**Co nowego w tej wersji** (320/500)

```
Nowość: PS5 Vault Pro, jednorazowy zakup bez subskrypcji.
• Import całej biblioteki ze Steam, PSN, Xboxa i Playnite bez limitu
• Koszt na godzinę, ROI, prognoza roku i analiza wydatków
• Budżet miesięczny z alertem i skaner wielu pudełek pod rząd
Do tego lista życzeń z ceną docelową, obrazek „kupka wstydu” i 7 języków.
```

---

## English (en-US, also en-GB)

**Nazwa aplikacji** (23/30)

```
PS5 Vault: Game Tracker
```

**Krótki opis** (75/80)

```
Track your games, spending and backlog. Year in review. No account, no ads.
```

**Pełny opis** (2739/4000)

```
How much have you really spent on games? How many hours went into them? And how many are still in the shrink wrap?

PS5 Vault is a private tracker for your game collection. Add your games and the app counts hours, money and progress, then turns your year into a recap you can share.

━━━ YOUR COLLECTION IN A MINUTE ━━━
🔎 Type a title: cover, genre and release date fill in by themselves (RAWG database, 500,000+ games).
📷 Scan the barcode on the box and the game is in your collection.
📥 Hundreds of games already? Import your library from Steam, PSN, Xbox or Playnite (free up to 50 games).
🕹 PS5, PS4, Xbox, PC and Switch in one place, including PS Plus and Game Pass games.

━━━ MONEY UNDER CONTROL ━━━
💰 What you spent on games, DLC and microtransactions, and what you got back from selling.
📉 Spending month by month and your most expensive month.
🧊 Unplayed games: how much money is sitting on the shelf.
🎯 Wishlist with a target price: say what you would pay and the app tells you when the sale is good enough.

━━━ PILE OF SHAME AND YEAR IN GAMES ━━━
📦 Your pile of shame in one image: how many games and how much money are waiting. Share it with friends.
🎁 Year in games: hours, most played titles, games finished, platinums and favorite genre.
🎲 Can't decide what to play? "What to play?" picks a game from your backlog.
🏆 19 achievements, from your first game to trophy hunter.

━━━ RELEASES ━━━
📅 Games with a future release date get their own tab with a countdown.
🔔 Reminders a month, a week and 3 days before launch, and on launch day.

━━━ STATS ━━━
📊 Your top 10 games by time played, library completion, platinums, ratings and genres.

━━━ PS5 VAULT PRO (OPTIONAL) ━━━
A one-time purchase on Google Play. No subscription and no ads, forever.
• Import your whole library with no limit
• Advanced finance: cost per hour, ROI, yearly forecast, charts by store and genre
• Spending analysis: where you overpay and what is worth selling
• Monthly budget with an alert when you go over
• Serial scanner: many boxes in a row
Everything else is free.

━━━ PRIVACY ━━━
No account and no ads. Your collection stays on your phone. Make a backup with one tap (JSON file).
The app only asks outside services about games (RAWG, a barcode database), never about you.

━━━ ALSO ━━━
• 7 languages: English, Spanish, German, French, Italian, Portuguese, Polish
• 12 currencies, including dollar, euro, pound and real
• Works offline
• Select many games at once and undo deletes

PS5 Vault is made by one person in their spare time. Have an idea or found a bug? Leave a review, I read every one.

PS5 Vault is not affiliated with Sony Interactive Entertainment. "PS5" and "PlayStation" are trademarks of Sony Interactive Entertainment Inc.
```

**Co nowego w tej wersji** (338/500)

```
New: PS5 Vault Pro, a one-time purchase with no subscription.
• Import your whole Steam, PSN, Xbox or Playnite library with no limit
• Cost per hour, ROI, yearly forecast and spending analysis
• Monthly budget with an alert and a scanner for many boxes in a row
Plus a wishlist with target prices, the pile of shame image and 7 languages.
```

---

## Español (es-419 y es-ES)

**Nazwa aplikacji** (28/30)

```
PS5 Vault: Tracker de Juegos
```

**Krótki opis** (70/80)

```
Tu colección, tus gastos y tu resumen del año. Sin cuenta ni anuncios.
```

**Pełny opis** (2910/4000)

```
¿Cuánto has gastado de verdad en juegos? ¿Cuántas horas les has dedicado? ¿Y cuántos siguen sin abrir?

PS5 Vault es un tracker privado para tu colección de juegos. Añade tus juegos y la app cuenta horas, dinero y progreso, y al final del año te da un resumen para compartir.

━━━ TU COLECCIÓN EN UN MINUTO ━━━
🔎 Escribe el título: portada, género y fecha de lanzamiento se rellenan solos (base de datos RAWG, más de 500.000 juegos).
📷 Escanea el código de barras de la caja y el juego ya está en tu colección.
📥 ¿Ya tienes cientos de juegos? Importa tu biblioteca de Steam, PSN, Xbox o Playnite (gratis hasta 50 juegos).
🕹 PS5, PS4, Xbox, PC y Switch en un solo lugar, también juegos de PS Plus y Game Pass.

━━━ TU DINERO BAJO CONTROL ━━━
💰 Cuánto gastaste en juegos, DLC y microtransacciones, y cuánto recuperaste al venderlos.
📉 Gastos mes a mes y tu mes más caro.
🧊 Juegos sin jugar: cuánto dinero está parado en la estantería.
🎯 Lista de deseos con precio objetivo: indica cuánto pagarías y la app te avisa cuando la oferta merece la pena.

━━━ PILA DE LA VERGÜENZA Y AÑO EN JUEGOS ━━━
📦 Tu pila de la vergüenza en una imagen: cuántos juegos y cuánto dinero esperan. Compártela con tus amigos.
🎁 Año en juegos: horas, títulos más jugados, juegos terminados, platinos y género favorito.
🎲 ¿No sabes a qué jugar? "¿A qué juego?" elige un juego de tu pila.
🏆 19 logros, desde tu primer juego hasta cazador de trofeos.

━━━ LANZAMIENTOS ━━━
📅 Los juegos con fecha de lanzamiento futura tienen su propia pestaña con cuenta atrás.
🔔 Avisos un mes, una semana y 3 días antes del lanzamiento, y el mismo día.

━━━ ESTADÍSTICAS ━━━
📊 Tu top 10 de juegos por tiempo jugado, porcentaje de biblioteca terminada, platinos, notas y géneros.

━━━ PS5 VAULT PRO (OPCIONAL) ━━━
Una compra única en Google Play. Sin suscripción y sin anuncios, para siempre.
• Importa toda tu biblioteca sin límite
• Finanzas avanzadas: coste por hora, ROI, previsión del año, gráficos por tienda y género
• Análisis de gastos: dónde pagas de más y qué conviene vender
• Presupuesto mensual con aviso cuando lo superas
• Escáner en serie: varias cajas seguidas
Todo lo demás es gratis.

━━━ PRIVACIDAD ━━━
Sin cuenta y sin anuncios. Tu colección se queda en tu móvil. Haz una copia de seguridad con un toque (archivo JSON).
La app solo pregunta a servicios externos por los juegos (RAWG, una base de códigos de barras), nunca por ti.

━━━ ADEMÁS ━━━
• 7 idiomas: español, inglés, portugués, francés, italiano, alemán y polaco
• 12 monedas, entre ellas euro, dólar y peso mexicano
• Funciona sin conexión
• Selecciona varios juegos a la vez y deshaz un borrado

PS5 Vault lo hace una sola persona en su tiempo libre. ¿Tienes una idea o encontraste un error? Déjalo en una reseña, las leo todas.

PS5 Vault no está afiliado a Sony Interactive Entertainment. "PS5" y "PlayStation" son marcas comerciales de Sony Interactive Entertainment Inc.
```

**Co nowego w tej wersji** (352/500)

```
Novedad: PS5 Vault Pro, una compra única sin suscripción.
• Importa toda tu biblioteca de Steam, PSN, Xbox o Playnite sin límite
• Coste por hora, ROI, previsión del año y análisis de gastos
• Presupuesto mensual con aviso y escáner de varias cajas seguidas
Además: lista de deseos con precio objetivo, la imagen de tu pila de la vergüenza y 7 idiomas.
```

---

## Deutsch (de-DE)

**Nazwa aplikacji** (25/30)

```
PS5 Vault: Spiele-Tracker
```

**Krótki opis** (71/80)

```
Spielesammlung, Ausgaben und Jahresrückblick. Ohne Konto, ohne Werbung.
```

**Pełny opis** (3007/4000)

```
Wie viel hast du wirklich für Spiele ausgegeben? Wie viele Stunden stecken darin? Und wie viele liegen noch eingeschweißt im Regal?

PS5 Vault ist ein privater Tracker für deine Spielesammlung. Du trägst deine Spiele ein, die App zählt Stunden, Geld und Fortschritt und macht am Jahresende einen Rückblick zum Teilen daraus.

━━━ DEINE SAMMLUNG IN EINER MINUTE ━━━
🔎 Titel eintippen: Cover, Genre und Erscheinungsdatum füllen sich von selbst aus (RAWG-Datenbank, über 500.000 Spiele).
📷 Barcode auf der Hülle scannen und das Spiel ist in deiner Sammlung.
📥 Schon Hunderte Spiele? Importiere deine Bibliothek aus Steam, PSN, Xbox oder Playnite (kostenlos bis 50 Spiele).
🕹 PS5, PS4, Xbox, PC und Switch an einem Ort, auch Spiele aus PS Plus und Game Pass.

━━━ GELD IM BLICK ━━━
💰 Was du für Spiele, DLCs und Mikrotransaktionen ausgegeben und durch Verkäufe zurückbekommen hast.
📉 Ausgaben Monat für Monat und dein teuerster Monat.
🧊 Ungespielte Spiele: wie viel Geld im Regal liegt.
🎯 Wunschliste mit Zielpreis: Trag ein, was du zahlen würdest, und die App sagt dir, wann das Angebot passt.

━━━ PILE OF SHAME UND JAHR IN SPIELEN ━━━
📦 Dein Pile of Shame auf einem Bild: wie viele Spiele und wie viel Geld warten. Teile es mit Freunden.
🎁 Jahr in Spielen: Stunden, meistgespielte Titel, beendete Spiele, Platin-Trophäen und Lieblingsgenre.
🎲 Keine Ahnung, was du spielen sollst? „Was spielen?“ lost ein Spiel aus deinem Stapel aus.
🏆 19 Erfolge, vom ersten Spiel bis zum Trophäenjäger.

━━━ RELEASES ━━━
📅 Spiele mit künftigem Erscheinungsdatum bekommen einen eigenen Tab mit Countdown.
🔔 Erinnerungen einen Monat, eine Woche und 3 Tage vor dem Release sowie am Release-Tag.

━━━ STATISTIKEN ━━━
📊 Deine Top 10 nach Spielzeit, Anteil beendeter Spiele, Platin-Trophäen, Bewertungen und Genres.

━━━ PS5 VAULT PRO (OPTIONAL) ━━━
Ein einmaliger Kauf bei Google Play. Kein Abo und keine Werbung, für immer.
• Ganze Bibliothek ohne Limit importieren
• Erweiterte Finanzen: Kosten pro Stunde, ROI, Jahresprognose, Diagramme nach Shop und Genre
• Ausgabenanalyse: wo du zu viel zahlst und was sich zu verkaufen lohnt
• Monatsbudget mit Warnung bei Überschreitung
• Serienscanner: viele Hüllen am Stück
Alles andere ist kostenlos.

━━━ DATENSCHUTZ ━━━
Kein Konto und keine Werbung. Deine Sammlung bleibt auf deinem Handy. Ein Backup machst du mit einem Tipp (JSON-Datei).
Die App fragt externe Dienste nur nach Spielen (RAWG, eine Barcode-Datenbank), nie nach dir.

━━━ AUSSERDEM ━━━
• 7 Sprachen: Deutsch, Englisch, Französisch, Italienisch, Spanisch, Portugiesisch, Polnisch
• 12 Währungen, darunter Euro, Pfund und Dollar
• Funktioniert offline
• Mehrere Spiele auf einmal auswählen und Löschen rückgängig machen

PS5 Vault entsteht in der Freizeit einer einzelnen Person. Du hast eine Idee oder einen Fehler gefunden? Schreib es in eine Bewertung, ich lese alle.

PS5 Vault steht in keiner Verbindung zu Sony Interactive Entertainment. „PS5“ und „PlayStation“ sind Marken der Sony Interactive Entertainment Inc.
```

**Co nowego w tej wersji** (332/500)

```
Neu: PS5 Vault Pro, ein einmaliger Kauf ohne Abo.
• Importiere deine ganze Steam-, PSN-, Xbox- oder Playnite-Bibliothek ohne Limit
• Kosten pro Stunde, ROI, Jahresprognose und Ausgabenanalyse
• Monatsbudget mit Warnung und Scanner für viele Hüllen am Stück
Außerdem: Wunschliste mit Zielpreis, das Pile-of-Shame-Bild und 7 Sprachen.
```

---

## Français (fr-FR)

**Nazwa aplikacji** (25/30)

```
PS5 Vault : Suivi de Jeux
```

**Krótki opis** (72/80)

```
Ta collection, tes dépenses et ton bilan de l’année. Sans compte ni pub.
```

**Pełny opis** (3016/4000)

```
Combien as-tu vraiment dépensé en jeux ? Combien d’heures y as-tu passé ? Et combien sont encore sous blister ?

PS5 Vault est un suivi privé pour ta collection de jeux. Ajoute tes jeux, l’app compte les heures, l’argent et ta progression, puis transforme ton année en bilan à partager.

━━━ TA COLLECTION EN UNE MINUTE ━━━
🔎 Tape le titre : jaquette, genre et date de sortie se remplissent tout seuls (base RAWG, plus de 500 000 jeux).
📷 Scanne le code-barres de la boîte et le jeu est dans ta collection.
📥 Déjà des centaines de jeux ? Importe ta bibliothèque depuis Steam, PSN, Xbox ou Playnite (gratuit jusqu’à 50 jeux).
🕹 PS5, PS4, Xbox, PC et Switch au même endroit, y compris les jeux PS Plus et Game Pass.

━━━ TON ARGENT SOUS CONTRÔLE ━━━
💰 Ce que tu as dépensé en jeux, DLC et microtransactions, et ce que tu as récupéré en les revendant.
📉 Tes dépenses mois par mois et ton mois le plus cher.
🧊 Jeux pas encore lancés : combien d’argent dort sur l’étagère.
🎯 Liste de souhaits avec prix cible : indique combien tu paierais et l’app te dit quand la promo vaut le coup.

━━━ PILE DE LA HONTE ET ANNÉE EN JEUX ━━━
📦 Ta pile de la honte en une image : combien de jeux et combien d’argent attendent. Partage-la avec tes amis.
🎁 Année en jeux : heures, titres les plus joués, jeux terminés, platines et genre préféré.
🎲 Tu ne sais pas à quoi jouer ? « À quoi jouer ? » tire un jeu de ta pile au sort.
🏆 19 succès, de ton premier jeu au chasseur de trophées.

━━━ SORTIES ━━━
📅 Les jeux avec une date de sortie à venir ont leur propre onglet avec compte à rebours.
🔔 Des rappels un mois, une semaine et 3 jours avant la sortie, et le jour J.

━━━ STATISTIQUES ━━━
📊 Ton top 10 par temps de jeu, la part de ta bibliothèque terminée, tes platines, tes notes et tes genres.

━━━ PS5 VAULT PRO (OPTIONNEL) ━━━
Un achat unique sur Google Play. Sans abonnement et sans pub, pour toujours.
• Import de toute ta bibliothèque sans limite
• Finances avancées : coût par heure, ROI, prévision de l’année, graphiques par boutique et par genre
• Analyse des dépenses : où tu paies trop et ce qui vaut la peine d’être revendu
• Budget mensuel avec alerte en cas de dépassement
• Scanner en série : plusieurs boîtes à la suite
Tout le reste est gratuit.

━━━ VIE PRIVÉE ━━━
Sans compte et sans pub. Ta collection reste sur ton téléphone. Une sauvegarde se fait en un geste (fichier JSON).
L’app ne demande aux services externes que des infos sur les jeux (RAWG, une base de codes-barres), jamais sur toi.

━━━ AUSSI ━━━
• 7 langues : français, anglais, espagnol, italien, allemand, portugais, polonais
• 12 devises, dont l’euro, le dollar canadien et la livre
• Fonctionne hors ligne
• Sélection de plusieurs jeux à la fois et annulation d’une suppression

PS5 Vault est développé par une seule personne sur son temps libre. Une idée, un bug ? Dis-le dans un avis, je les lis tous.

PS5 Vault n’est pas affilié à Sony Interactive Entertainment. « PS5 » et « PlayStation » sont des marques de Sony Interactive Entertainment Inc.
```

**Co nowego w tej wersji** (360/500)

```
Nouveau : PS5 Vault Pro, un achat unique sans abonnement.
• Importe toute ta bibliothèque Steam, PSN, Xbox ou Playnite sans limite
• Coût par heure, ROI, prévision de l’année et analyse des dépenses
• Budget mensuel avec alerte et scanner de plusieurs boîtes à la suite
Et aussi : liste de souhaits avec prix cible, l’image de ta pile de la honte et 7 langues.
```

---

## Italiano (it-IT)

**Nazwa aplikacji** (25/30)

```
PS5 Vault: Tracker Giochi
```

**Krótki opis** (69/80)

```
Collezione, spese e riepilogo dell’anno. Senza account né pubblicità.
```

**Pełny opis** (2945/4000)

```
Quanto hai speso davvero in giochi? Quante ore ci hai passato? E quanti sono ancora nel cellophane?

PS5 Vault è un tracker privato per la tua collezione di giochi. Aggiungi i tuoi giochi e l’app conta ore, soldi e progressi, poi trasforma il tuo anno in un riepilogo da condividere.

━━━ LA TUA COLLEZIONE IN UN MINUTO ━━━
🔎 Scrivi il titolo: copertina, genere e data di uscita si compilano da soli (database RAWG, oltre 500.000 giochi).
📷 Scansiona il codice a barre della confezione e il gioco è nella tua collezione.
📥 Hai già centinaia di giochi? Importa la tua libreria da Steam, PSN, Xbox o Playnite (gratis fino a 50 giochi).
🕹 PS5, PS4, Xbox, PC e Switch in un unico posto, compresi i giochi di PS Plus e Game Pass.

━━━ SOLDI SOTTO CONTROLLO ━━━
💰 Quanto hai speso in giochi, DLC e microtransazioni e quanto hai recuperato vendendoli.
📉 Spese mese per mese e il tuo mese più caro.
🧊 Giochi mai avviati: quanti soldi restano fermi sullo scaffale.
🎯 Lista desideri con prezzo obiettivo: scrivi quanto pagheresti e l’app ti dice quando l’offerta è quella giusta.

━━━ PILA DELLA VERGOGNA E ANNO IN GIOCHI ━━━
📦 La tua pila della vergogna in un’immagine: quanti giochi e quanti soldi ti aspettano. Condividila con gli amici.
🎁 Anno in giochi: ore, titoli più giocati, giochi finiti, platini e genere preferito.
🎲 Non sai a cosa giocare? "A cosa gioco?" estrae un gioco dalla tua pila.
🏆 19 obiettivi, dal primo gioco al cacciatore di trofei.

━━━ USCITE ━━━
📅 I giochi con data di uscita futura hanno una scheda tutta loro con il conto alla rovescia.
🔔 Promemoria un mese, una settimana e 3 giorni prima dell’uscita, e il giorno stesso.

━━━ STATISTICHE ━━━
📊 La tua top 10 per tempo di gioco, la percentuale di libreria finita, platini, voti e generi.

━━━ PS5 VAULT PRO (FACOLTATIVO) ━━━
Un acquisto unico su Google Play. Niente abbonamento e niente pubblicità, per sempre.
• Importa tutta la libreria senza limiti
• Finanze avanzate: costo per ora, ROI, previsione dell’anno, grafici per negozio e genere
• Analisi delle spese: dove paghi troppo e cosa conviene vendere
• Budget mensile con avviso quando lo superi
• Scanner in serie: più confezioni di fila
Tutto il resto è gratis.

━━━ PRIVACY ━━━
Nessun account e nessuna pubblicità. La tua collezione resta sul tuo telefono. Il backup si fa con un tocco (file JSON).
L’app chiede ai servizi esterni solo informazioni sui giochi (RAWG, un database di codici a barre), mai su di te.

━━━ INOLTRE ━━━
• 7 lingue: italiano, inglese, spagnolo, francese, tedesco, portoghese, polacco
• 12 valute, tra cui euro, sterlina e dollaro
• Funziona offline
• Selezione di più giochi insieme e annullamento delle eliminazioni

PS5 Vault è fatto da una sola persona nel tempo libero. Hai un’idea o hai trovato un errore? Scrivilo in una recensione, le leggo tutte.

PS5 Vault non è affiliato a Sony Interactive Entertainment. "PS5" e "PlayStation" sono marchi di Sony Interactive Entertainment Inc.
```

**Co nowego w tej wersji** (360/500)

```
Novità: PS5 Vault Pro, un acquisto unico senza abbonamento.
• Importa tutta la tua libreria Steam, PSN, Xbox o Playnite senza limiti
• Costo per ora, ROI, previsione dell’anno e analisi delle spese
• Budget mensile con avviso e scanner per più confezioni di fila
In più: lista desideri con prezzo obiettivo, l’immagine della tua pila della vergogna e 7 lingue.
```

---

## Português do Brasil (pt-BR)

**Nazwa aplikacji** (28/30)

```
PS5 Vault: Controle de Jogos
```

**Krótki opis** (76/80)

```
Sua coleção, seus gastos e a retrospectiva do ano. Sem conta e sem anúncios.
```

**Pełny opis** (2836/4000)

```
Quanto você realmente gastou com jogos? Quantas horas passou neles? E quantos ainda estão lacrados?

PS5 Vault é um controle particular da sua coleção de jogos. Você adiciona seus jogos e o app conta horas, dinheiro e progresso, e no fim do ano transforma tudo numa retrospectiva para compartilhar.

━━━ SUA COLEÇÃO EM UM MINUTO ━━━
🔎 Digite o título: capa, gênero e data de lançamento se preenchem sozinhos (base RAWG, mais de 500 mil jogos).
📷 Escaneie o código de barras da caixa e o jogo já está na sua coleção.
📥 Já tem centenas de jogos? Importe sua biblioteca da Steam, PSN, Xbox ou Playnite (grátis até 50 jogos).
🕹 PS5, PS4, Xbox, PC e Switch num só lugar, incluindo jogos da PS Plus e do Game Pass.

━━━ DINHEIRO SOB CONTROLE ━━━
💰 Quanto você gastou com jogos, DLCs e microtransações, e quanto recuperou vendendo.
📉 Gastos mês a mês e o seu mês mais caro.
🧊 Jogos nunca jogados: quanto dinheiro está parado na estante.
🎯 Lista de desejos com preço-alvo: diga quanto pagaria e o app avisa quando a promoção vale a pena.

━━━ PILHA DA VERGONHA E ANO EM JOGOS ━━━
📦 Sua pilha da vergonha numa imagem: quantos jogos e quanto dinheiro estão esperando. Compartilhe com os amigos.
🎁 Ano em jogos: horas, títulos mais jogados, jogos zerados, platinas e gênero favorito.
🎲 Não sabe o que jogar? "O que jogar?" sorteia um jogo da sua pilha.
🏆 19 conquistas, do primeiro jogo ao caçador de troféus.

━━━ LANÇAMENTOS ━━━
📅 Jogos com data de lançamento futura ganham uma aba própria com contagem regressiva.
🔔 Lembretes um mês, uma semana e 3 dias antes do lançamento, e no dia.

━━━ ESTATÍSTICAS ━━━
📊 Seu top 10 por tempo jogado, a porcentagem da biblioteca zerada, platinas, notas e gêneros.

━━━ PS5 VAULT PRO (OPCIONAL) ━━━
Uma compra única no Google Play. Sem assinatura e sem anúncios, para sempre.
• Importe toda a biblioteca sem limite
• Finanças avançadas: custo por hora, ROI, previsão do ano, gráficos por loja e gênero
• Análise de gastos: onde você paga caro e o que vale a pena vender
• Orçamento mensal com alerta quando você passar do limite
• Scanner em série: várias caixas seguidas
Todo o resto é grátis.

━━━ PRIVACIDADE ━━━
Sem conta e sem anúncios. Sua coleção fica no seu celular. O backup é feito com um toque (arquivo JSON).
O app só pergunta a serviços externos sobre jogos (RAWG, uma base de códigos de barras), nunca sobre você.

━━━ TAMBÉM ━━━
• 7 idiomas: português, inglês, espanhol, francês, italiano, alemão e polonês
• 12 moedas, incluindo real, dólar e euro
• Funciona offline
• Selecione vários jogos de uma vez e desfaça exclusões

O PS5 Vault é feito por uma pessoa só, no tempo livre. Tem uma ideia ou achou um bug? Conte numa avaliação, eu leio todas.

O PS5 Vault não é afiliado à Sony Interactive Entertainment. "PS5" e "PlayStation" são marcas registradas da Sony Interactive Entertainment Inc.
```

**Co nowego w tej wersji** (345/500)

```
Novidade: PS5 Vault Pro, uma compra única sem assinatura.
• Importe toda a sua biblioteca da Steam, PSN, Xbox ou Playnite sem limite
• Custo por hora, ROI, previsão do ano e análise de gastos
• Orçamento mensal com alerta e scanner de várias caixas seguidas
E mais: lista de desejos com preço-alvo, a imagem da sua pilha da vergonha e 7 idiomas.
```

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
