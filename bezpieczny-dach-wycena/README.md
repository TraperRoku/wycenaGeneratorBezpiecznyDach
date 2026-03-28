# Bezpieczny Dach — Generator wycen

Aplikacja webowa do generowania profesjonalnych wycen dekarskich w formacie PDF.

## Uruchomienie

```bash
# 1. Zainstaluj zależności
npm install

# 2. Uruchom tryb deweloperski
npm run dev
# → http://localhost:5173

# 3. Build produkcyjny
npm run build
```

## Logo

Wrzuć plik `logo.png` do katalogu `src/assets/logo.png`, a następnie w `src/components/TopBar.jsx`:
- odkomentuj linię `<img src={logoSrc} alt="Logo Bezpieczny Dach" />`
- zakomentuj lub usuń linię `<span className="topbar-logo-fallback">BD</span>`

## Struktura plików

```
src/
  App.jsx                 ← główny komponent (zakładki)
  App.css                 ← style (motyw pomarańczowo-biały)
  main.jsx                ← punkt wejścia
  assets/
    logo.png              ← [WSTAW TUTAJ SWOJE LOGO]
  components/
    TopBar.jsx            ← pasek górny z logo i nawigacją
    Sidebar.jsx           ← panel boczny (klient + lista usług)
    Builder.jsx           ← kreator wyceny (tabela + podsumowanie)
    Catalog.jsx           ← zarządzanie katalogiem usług
    AddModal.jsx          ← modal dodawania/edycji usługi
    Preview.jsx           ← podgląd PDF + przycisk pobierania
  pdf/
    QuotePDF.jsx          ← dokument PDF (@react-pdf/renderer)
  store/
    index.js              ← stan globalny (zustand + localStorage)
  data/
    services.js           ← domyślny katalog usług
```

## Dane klienta i wyceny

Wszystkie dane są automatycznie zapisywane w localStorage przeglądarki.
Aby wyczyścić wycenę kliknij przycisk "Wyczyść" w kreatorze.

## Funkcje

- ✅ Katalog usług z cenami bazowymi (edytowalne)
- ✅ Dodawanie własnych usług i kategorii
- ✅ Edycja cen i ilości bezpośrednio w wycenie
- ✅ Rabat procentowy
- ✅ Różne stawki VAT (23%, 8%, 0%)
- ✅ Uwagi / warunki płatności
- ✅ Podgląd PDF w przeglądarce
- ✅ Pobieranie wyceny jako PDF
- ✅ Zapis stanu w localStorage
- ✅ Motyw pomarańczowo-biały zgodny z marką Bezpieczny Dach
