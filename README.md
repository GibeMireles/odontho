# OdonTHÓ — Sitio Web Oficial

Landing page para **OdonTHÓ Dentistas Militares**, clínica dental de especialidades en Mérida, Yucatán.

---

## Stack

- HTML5 + CSS3 + JavaScript vanilla
- Sin frameworks, sin bundlers, sin dependencias externas
- Data centralizada en `config.json`
- Hosting: GitHub Pages

---

## Estructura del proyecto

```
odontho/
├── index.html          # Página principal
├── config.json         # Toda la data de la clínica (editable sin tocar código)
├── css/
│   └── styles.css      # Estilos globales (mobile first)
├── js/
│   └── main.js         # Lógica: carga config, citas, WhatsApp
└── assets/
    ├── logo-odontho.png
    ├── logo-maxilofacial.png
    ├── logo-kids.png
    ├── logo-general.png
    ├── dr-castro.jpg
    └── dra-preciado.jpg
```

---

## Colores de marca

| Token | Hex | Uso |
|-------|-----|-----|
| Navy | `#1E2D4E` | Fondo hero, textos principales |
| Teal | `#3DBFBF` | Acentos, botones, iconos |
| Teal light | `#E8F8F8` | Fondos de cards, hover states |
| Blanco | `#FFFFFF` | Fondos de sección |
| Crema | `#FAF8F4` | Fondo general |

---

## Especialidades

| Especialidad | Doctor | Icono |
|---|---|---|
| Cirugía Maxilofacial | Dr. Juan José Castro Mosqueda | `logo-maxilofacial.png` |
| Odontología General | Dr. Juan José Castro Mosqueda | `logo-general.png` |
| OdonTHÓ Kids | Dra. Miriam Edith Preciado Oseguera | `logo-kids.png` |

---

## Flujo de citas

```
Usuario selecciona:
  1. Especialidad / Servicio
  2. Doctor
  3. Fecha preferida
  4. Horario preferido
  5. Nombre + teléfono

→ Se genera link wa.me/52XXXXXXXXXX?text=...
→ Se abre WhatsApp con mensaje prellenado
→ Clínica confirma manualmente
```

Sin backend. Sin base de datos. 100% estático.

---

## Configuración (`config.json`)

Todo lo editable sin tocar código vive aquí:
- Datos de la clínica (teléfono, dirección, horario, redes)
- Perfiles de doctores y horarios disponibles
- Catálogo de servicios con precios
- Testimonios
- FAQ
- Colores de marca

---

## Convenciones de código

- **Clases CSS:** español descriptivo → `.seccion-hero`, `.tarjeta-doctor`, `.boton-whatsapp`
- **IDs para JS:** inglés → `#booking-form`, `#wa-float`, `#services-grid`
- **`config.json`** se carga con `fetch()` en `main.js` — nunca hardcodear datos en HTML
- **CSS:** mobile first — breakpoint principal `@media (min-width: 768px)`
- **Comentarios:** en español

---

## Setup local

```bash
# Clonar el repo
git clone https://github.com/GibeMireles/odontho.git

# Entrar al proyecto
cd odontho

# Abrir en VS Code
code .

# Para desarrollo local (evita errores de CORS con fetch):
# Usar Live Server (extensión de VS Code) — click derecho en index.html → Open with Live Server
```

> ⚠️ No abrir `index.html` directo con doble click — el `fetch()` de `config.json` requiere un servidor local. Usar **Live Server** de VS Code.

---

## Deploy (GitHub Pages)

```bash
# Todo commit a main se publica automáticamente
git add .
git commit -m "descripción del cambio"
git push origin main

# URL pública: https://gibemireles.github.io/odontho/
```

Para conectar dominio propio: Settings → Pages → Custom domain.

---

## Roadmap

- [x] Estructura base y config.json
- [ ] Hero + Nav con logos reales
- [ ] Sección de especialidades
- [ ] Sistema de citas → WhatsApp
- [ ] Perfiles de doctores
- [ ] Testimonios
- [ ] FAQ
- [ ] Footer + mapa
- [ ] Dominio personalizado
- [ ] Optimización SEO local (Mérida)

---

## Clínica

**OdonTHÓ Dentistas Militares**
Av. Yucatán 351, Col. Los Pinos, Mérida, Yuc. 97138

- Dr. Juan José Castro Mosqueda — Cirujano Maxilofacial
- Dra. Miriam Edith Preciado Oseguera — Odontopediatra
