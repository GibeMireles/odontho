# OdonTHÓ — Sitio Web Oficial

Landing page para **OdonTHÓ Dentistas Militares**, clínica dental de especialidades en Mérida, Yucatán.

🌐 **[gibemireles.github.io/odontho](https://gibemireles.github.io/odontho/)**

---

## Stack

- HTML5 + CSS3 + JavaScript vanilla
- Sin frameworks, sin bundlers, sin dependencias externas
- Data centralizada en `config.json` — todo el contenido editable sin tocar código
- Hosting: GitHub Pages (rama `main`)

---

## Estructura del proyecto

```
odontho/
├── index.html          # Esqueleto semántico — sin datos hardcodeados
├── config.json         # Fuente única de verdad: clínica, doctores, servicios, FAQ...
├── css/
│   └── styles.css      # Diseño editorial, mobile-first, ~650 líneas
├── js/
│   └── main.js         # Carga config.json, renderiza todo, lógica de citas
└── assets/             # Logos e imágenes (pendiente de agregar)
    ├── logo-odontho.png
    ├── logo-maxilofacial.png
    ├── logo-kids.png
    ├── logo-general.png
    ├── dr-castro.jpg
    └── dra-preciado.jpg
```

---

## Paleta de marca

| Variable CSS | Hex | Uso |
|---|---|---|
| `--navy` | `#1E2D4E` | Hero, footer, textos principales, botón CTA |
| `--teal` | `#3DBFBF` | Acentos, botones teal, líneas decorativas |
| `--teal-light` | `#E8F8F8` | Fondos de cards, hover states |
| `--crema` | `#FAF8F3` | Fondo general de la página |
| `--blanco` | `#FFFFFF` | Fondos de secciones alternas |
| `--gris` | `#64748B` | Textos secundarios, párrafos |
| `--borde` | `#E2DDD6` | Bordes de cards y separadores |

---

## Secciones implementadas

| Sección | Descripción |
|---|---|
| Nav | Sticky, hamburguesa mobile, sombra al scroll |
| Hero | Navy + 2 cols desktop, tarjetas de doctores dinámicas |
| Trust bar | 4 stats de confianza (Doctoralia, experiencia, SEDENA) |
| Citas | Booking 3 pasos: servicio → calendario → confirmación WhatsApp |
| Especialidades | 3 cards con hover editorial (border-left teal) |
| Servicios | Grid filtrable por especialidad |
| Doctores | Perfil completo con cédulas, formación y link a Doctoralia |
| Testimonios | Reseñas reales de Doctoralia (Georgia italic) |
| FAQ | Accordion con animación, textos desde config.json |
| Contacto | Formulario → genera link wa.me con mensaje prellenado |
| Footer | Navy, 3 columnas, redes sociales |
| WA flotante | Botón fijo bottom-right con shadow verde |

---

## Flujo de citas (sin backend)

```
1. Usuario elige servicio
       ↓ (determina doctor por especialidad_id → doctor_id)
2. Calendario dinámico con días disponibles del doctor
       ↓
3. Slots de horario desde horario_disponible en config.json
       ↓
4. Confirmación → genera:
   wa.me/529990000000?text=Hola, quiero agendar...
       ↓
5. WhatsApp abre con mensaje prellenado
6. Clínica confirma manualmente
```

Sin backend. Sin base de datos. 100% estático.

---

## Editar contenido (`config.json`)

Toda la información de la clínica vive en `config.json`. Para actualizar:

```jsonc
{
  "clinica": {
    "telefono": "999 000 0000",   // ← cambiar aquí
    "whatsapp": "529990000000",   // formato: 52 + 10 dígitos, sin +
    "horario": { ... }
  },
  "doctores": [
    {
      "horario_disponible": {
        "lunes": ["9:00", "10:00", "11:00"],  // ← slots reales del doctor
        ...
      }
    }
  ],
  "servicios": [
    {
      "precio_desde": 2800,          // null = "Consultar precio"
      "destacado": true              // aparece primero en el booking
    }
  ]
}
```

---

## Agregar imágenes de doctores

Guardar en `assets/` con exactamente estos nombres:

```
assets/dr-castro.jpg        → foto Dr. Castro (recomendado: 400×400px, JPG)
assets/dra-preciado.jpg     → foto Dra. Preciado
assets/logo-maxilofacial.png
assets/logo-kids.png
assets/logo-general.png
```

Si la imagen no existe, se muestra el emoji de fallback `👤` automáticamente.

---

## Convenciones de código

- **Clases CSS:** español descriptivo → `.seccion-hero`, `.tarjeta-doctor`, `.barra-confianza`
- **IDs para JS:** inglés → `#booking-box`, `#wa-float`, `#servicios-grid`
- **`config.json`** se carga con `fetch()` al iniciar `main.js` — nunca hardcodear datos en HTML
- **CSS:** mobile-first — breakpoint único `@media (min-width: 768px)`
- **Comentarios:** en español
- **Tipografía:** Georgia (headings) + system-ui (UI/cuerpo)

---

## Desarrollo local

```bash
# Clonar el repo
git clone https://github.com/GibeMireles/odontho.git
cd odontho

# Levantar servidor local (necesario para el fetch() de config.json)
python -m http.server 8080
# → abrir http://localhost:8080

# Alternativa: Live Server en VS Code
# Click derecho en index.html → Open with Live Server
```

> ⚠️ **No abrir `index.html` con doble click** — el `fetch('config.json')` falla en el protocolo `file://`. Siempre usar un servidor local.

---

## Deploy

```bash
# Publicar cambios (GitHub Pages despliega automáticamente desde main)
git add .
git commit -m "descripción del cambio"
git push origin main

# URL pública: https://gibemireles.github.io/odontho/
```

Para dominio propio: **Settings → Pages → Custom domain**.

---

## Roadmap

- [x] Estructura base HTML semántica
- [x] config.json con toda la data de la clínica
- [x] Diseño editorial navy + teal, mobile-first
- [x] Nav sticky con hamburguesa mobile
- [x] Hero con tarjetas de doctores dinámicas
- [x] Barra de confianza (stats Doctoralia / SEDENA)
- [x] Booking 3 pasos → WhatsApp (sin backend)
- [x] Calendario dinámico con horarios por doctor
- [x] Sección especialidades con filtros
- [x] Perfiles de doctores (cédula, formación, Doctoralia)
- [x] Testimonios reales de Doctoralia
- [x] FAQ accordion
- [x] Formulario de contacto → WhatsApp
- [x] Footer + redes sociales
- [x] GitHub Pages activo
- [ ] Fotos reales de doctores en `assets/`
- [ ] Logos de especialidades en `assets/`
- [ ] Google Maps embed real
- [ ] SEO local (meta tags, Schema.org, Google Business)
- [ ] Dominio personalizado `odontho.mx`

---

## Clínica

**OdonTHÓ — Dentistas Militares**  
Av. Yucatán 351, Col. Los Pinos, Mérida, Yuc. 97138  
📞 999 000 0000 · 💬 WhatsApp

| Doctor | Especialidad | Doctoralia |
|---|---|---|
| Dr. Juan José Castro Mosqueda | Cirujano Maxilofacial | [Ver perfil](https://www.doctoralia.com.mx/juan-jose-castro-mosqueda/cirujano-maxilofacial-dentista-odontologo/yucatan) |
| Dra. Miriam Edith Preciado Oseguera | Odontopediatra | [Ver perfil](https://www.doctoralia.com.mx/miriam-edith-preciado-oseguera/odontologo-pediatra/yucatan) |
