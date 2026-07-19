# Panduan penamaan foto produk

Setiap produk membutuhkan minimal 3 foto. Simpan di folder sesuai slug produk :

```
public/images/products/
  beaumont-14x10/
    cover.jpg      ← thumbnail catalogue (PLP + related)
    1.jpg          ← photo lifestyle grande vue (PDP hero)
    2.jpg          ← photo alternative
    3.jpg          ← plan / dimensions
    4.jpg          ← optionnelle
```

Format recommandé : **JPG ou WebP**, largeur **≥ 1600 px**, ratio libre — le composant `ProductImage` recadre en `object-cover`.

Le composant a un fallback gradient automatique : si un fichier manque, un dégradé aux tons du produit s'affiche avec la mention « Visuel à venir ». Aucune erreur console.

## Mapping recommandé (photos Backyard Discovery que vous avez envoyées)

| Slug produit | Photos à placer |
|---|---|
| `beaumont-10x10` | photos du plan 10x10 Beaumont |
| `beaumont-12x10` | plan 12x10 Beaumont + lifestyle |
| `beaumont-12x12` | plan 12x12 Beaumont + lifestyle |
| `beaumont-14x10` | plan 14x10 Beaumont + lifestyle |
| `beaumont-14x12` | plan 14x12 Beaumont + lifestyle poolside |
| `beaumont-16x12` | plan 16x12 Beaumont + lifestyle string-lights |
| `beaumont-20x12` | plan 20x12 Beaumont + lifestyle grand format |
| `beaumont-24x12` | plan 24x12 Beaumont + lifestyle |
| `ashland-14x10` | plan 14x10 Ashland + lifestyle piscine |
| `somerville-14x10-barnwood` | Somerville barnwood + lifestyle bord de mer |
| `somerville-14x10-walnut` | Somerville teinte noyer + lifestyle brumeux |
| `delray-14x10` | vue produit + lifestyle |
| `brendan-12x10` | Brendan sail shade + lifestyle |
| `sarasota-10x10` | Sarasota 10x10 louvered noir |
| `sarasota-12x10` | Sarasota 12x10 louvered noir |
| `sarasota-14x10` | Sarasota 14x10 + lifestyle piscine |
| `sarasota-16x10` | Sarasota 16x10 + lifestyle |
| `sarasota-18x10` | Sarasota 18x10 |
| `sarasota-20x10` | Sarasota 20x10 + lifestyle grand espace |
| `evanston-10x10` à `evanston-20x10` | vues Evanston adossée maison façade blanche |
| `windham-14x10` / `windham-14x12` | Windham steel blanc + lifestyle campagne |
| `tuscany-corner` | pergola d'angle avec panneaux bambou + fire pit |
| `verona-corner` | pergola d'angle avec panneaux pebble |

## Après avoir déposé les photos

Aucune action requise côté code — le dev server les servira automatiquement. Pour une build de production :

```bash
npm run build && npm start
```
