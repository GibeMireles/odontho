# OdonTHÓ — Sitio Web Oficial

Landing page para **OdonTHÓ Dentistas Militares**, clínica dental de especialidades en Mérida, Yucatán.

🌐 **[gibemireles.github.io/odontho](https://gibemireles.github.io/odontho/)**

---

## Estado actual (contexto para retomar)

Última sesión de trabajo: **6 de agosto de 2026**. Resumen de lo que ya está en producción:

- **Booking simplificado a "cita de valoración"**: se quitó la selección de servicio. Ahora son 2 pasos — Fecha (calendario combinado de ambos doctores) → Confirmar (nombre, teléfono, envío por WhatsApp). Cada horario disponible muestra una leyenda con el doctor correspondiente (ej. "10:00 · DRA. PRECIADO").
- **Horario real cargado**: Dr. Castro (lunes/miércoles/viernes, martes/jueves/sábado cerrado) y Dra. Preciado (ya existente).
- **Odontología General** ahora tiene servicios reales (Limpieza Dental, Resinas y Empastes, Extracciones, Revisiones) y aplica a **ambos doctores** (`doctor_ids` en vez de `doctor_id` en `especialidades`).
- **Foto de la Dra. Preciado** integrada con fallback a iniciales (no emoji) si no carga; `foto_posicion` en config permite ajustar el encuadre por doctor.
- **Mapa de Google** embebido en el footer + botón "Cómo llegar" (usa el CID del negocio, no la dirección en texto — la dirección en texto geocodificaba a un lugar incorrecto).
- **Logos reales**: ícono de cada especialidad (`assets/Icon-Maxi.png`, `Icon-KidsA.jpg`, `Icon-KidsB.png`) sin contenedor, y logo de marca real en el nav (`assets/odonTHO-logo.png`).
- **Redes sociales reales** (Facebook e Instagram) en el footer.

### Pendiente / siguiente sesión

1. **WhatsApp** — hoy el flujo solo abre `wa.me` con un mensaje prellenado (el paciente debe darle "enviar" manualmente y la clínica confirma a mano). Falta decidir e implementar algo más automatizado — ver **Fase 1** del roadmap más abajo (recordatorios, o de plano WhatsApp Business API).
2. **Correo para validar/confirmar la cita agendada** — actualmente no existe ningún flujo de confirmación por correo; falta definir de dónde sale el email del paciente (¿se agrega un campo al formulario de booking?) y qué dispara el envío (¿un backend? ¿Make/n8n? ¿EmailJS desde el propio front sin backend?).
3. **Foto real del Dr. Castro** — sigue sin subirse (`assets/dr-castro.jpg` no existe); hoy cae al fallback de iniciales "JC".

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
└── assets/
    ├── odonTHO-logo.png     # Logo de marca (usado en el nav)
    ├── Icon-Maxi.png        # Ícono especialidad Cirugía Maxilofacial
    ├── Icon-KidsA.jpg       # Ícono especialidad Odontología General
    ├── Icon-KidsB.png       # Ícono especialidad OdonTHÓ Kids
    ├── dra-preciado.png     # Foto Dra. Preciado
    └── dr-castro.jpg        # ⚠️ pendiente — aún no existe, cae a fallback de iniciales "JC"
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
| Citas | Booking de cita de **valoración** (2 pasos): Fecha (calendario combinado de ambos doctores + horarios con leyenda de doctor) → Confirmar (nombre, teléfono, WhatsApp) |
| Especialidades | 3 cards con hover editorial (border-left teal), íconos reales sin contenedor |
| Servicios | Grid filtrable por especialidad — catálogo informativo, independiente del booking |
| Doctores | Perfil completo con cédulas, formación y link a Doctoralia |
| Testimonios | Reseñas reales de Doctoralia (Georgia italic) |
| FAQ | Accordion con animación, textos desde config.json |
| Contacto | Formulario → genera link wa.me con mensaje prellenado |
| Footer | Navy, 3 columnas, redes sociales reales, mapa de Google embebido + botón "Cómo llegar" |
| WA flotante | Botón fijo bottom-right con shadow verde |

---

## Flujo de citas (sin backend)

Todas las citas agendadas por la web son de **valoración general** — no se elige servicio ni doctor de antemano.

```
1. Calendario combina horario_disponible de TODOS los doctores
       ↓ (un día se muestra disponible si cualquier doctor tiene horario ese día)
2. Slots de horario del día elegido, uno por (doctor, hora),
   ordenados y con leyenda del doctor correspondiente
       ↓ (al elegir un slot se fija fecha + hora + doctor)
3. Confirmación → captura nombre y teléfono (validado, 10 dígitos MX)
       ↓
4. Genera:
   wa.me/529990000000?text=Hola, me gustaría agendar una cita de
   valoración... Nombre / Fecha preferida / Hora preferida
       ↓
5. WhatsApp abre con mensaje prellenado, el paciente lo envía
6. Clínica confirma manualmente y asigna el doctor mostrado en el slot
```

Sin backend. Sin base de datos. 100% estático. **Pendiente:** este es justo el punto donde entrarían las Fases 1–3 del roadmap (automatizar el paso 5–6 por WA y/o correo).

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

Guardar en `assets/` y referenciar la ruta exacta en el campo `foto` de cada doctor en `config.json` (el nombre de archivo no está hardcodeado en el código, solo tiene que coincidir con lo que diga `foto`).

- Recomendado: retrato vertical, buena resolución. Si la cara no queda centrada en el recorte circular, ajusta `foto_posicion` del doctor en `config.json` (ej. `"center 40%"`) — se aplica como `object-position` del `<img>`.
- Si la imagen no existe o no carga, se muestran automáticamente las **iniciales** del doctor (nombre + apellido paterno, ej. "MP", "JC") en vez de una foto.
- Pendiente: subir foto real del Dr. Castro (hoy usa el fallback de iniciales).

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

### Fase 0 — Landing page ✅

- [x] Estructura base HTML semántica
- [x] config.json con toda la data de la clínica
- [x] Diseño editorial navy + teal, mobile-first
- [x] Nav sticky con hamburguesa mobile
- [x] Hero con tarjetas de doctores dinámicas
- [x] Barra de confianza (stats Doctoralia / SEDENA)
- [x] Booking de cita de valoración (2 pasos) → WhatsApp (sin backend)
- [x] Calendario dinámico combinando horarios de todos los doctores
- [x] Sección especialidades con filtros
- [x] Perfiles de doctores (cédula, formación, Doctoralia)
- [x] Testimonios reales de Doctoralia
- [x] FAQ accordion
- [x] Formulario de contacto → WhatsApp
- [x] Footer + redes sociales
- [x] GitHub Pages activo
- [x] Logos de especialidades y de marca en `assets/`
- [x] Google Maps embed real + botón "Cómo llegar" (usando CID del negocio)
- [x] Foto real de la Dra. Preciado
- [x] Booking simplificado a cita de valoración (sin selección de servicio)
- [ ] Foto real del Dr. Castro
- [ ] SEO local (meta tags, Schema.org, Google Business)
- [ ] Dominio personalizado `odontho.mx`
- [ ] Confirmación de citas por correo electrónico
- [ ] WhatsApp más allá del link `wa.me` manual (ver Fase 1)

---

### Fase 1 — Recordatorios WA 📲 *(siguiente · mayor ROI, menor esfuerzo)*

**Qué hace:** Mensajes automáticos 24 h y 2 h antes de cada cita. Reduce no-shows hasta un 40%. Puede pedir confirmación al paciente.

**Flujo:**
```
Cita agendada en Google Calendar
  → trigger 24 h antes
  → WA: "¿Confirmas tu cita mañana a las 4:00 PM con el Dr. Castro?"
  → paciente responde Sí / No
  → si No → libera el slot en el calendario
```

| Opción | Stack | Esfuerzo |
|---|---|---|
| Sin código | Wati.io · MessageBird | Bajo |
| Automatización | Make.com · n8n + WA Business API | Medio |

---

### Fase 2 — Calendario real con Google Calendar 📅

**Qué hace:** El booking de la web consulta Google Calendar en tiempo real — solo muestra huecos libres. Al confirmar, crea el evento automáticamente y envía confirmación a ambos.

**Flujo:**
```
Web consulta disponibilidad en tiempo real
  → muestra solo huecos libres
  → paciente elige fecha y hora
  → se crea evento en Google Calendar
  → confirmación automática a paciente y doctor
```

| Opción | Stack | Esfuerzo |
|---|---|---|
| Sin código | Embed de Cal.com (gratis) · Calendly | Bajo — reemplaza el booking actual |
| Con backend | Google Calendar API + Supabase Edge Functions | Alto |

> 💡 Recomendado empezar con **Cal.com embed** y migrar a API propia cuando haya volumen.

---

### Fase 3 — Agente de WhatsApp con IA 🤖

**Qué hace:** Responde automáticamente cuando alguien escribe. Saluda, pregunta qué necesita, da información de servicios, agenda la cita o escala al doctor.

**Flujo:**
```
Paciente escribe a WA
  → agente saluda y pregunta por servicio
  → ofrece fechas disponibles (consulta Calendar)
  → paciente elige → confirma cita
  → notifica al doctor
  → escala a humano si hay duda compleja
```

| Opción | Stack | Esfuerzo |
|---|---|---|
| Sin código | Tidio · Respond.io · Wati.io | Bajo |
| Con IA | WA Business API + n8n + Claude API + Supabase | Medio-alto |

> ⚠️ La **WA Business API requiere aprobación de Meta** (proceso de 1–2 semanas). Iniciar el trámite antes de arrancar el desarrollo.

---

## Clínica

**OdonTHÓ — Dentistas Militares**  
Av. Yucatán 351, Col. Los Pinos, Mérida, Yuc. 97138  
📞 999 000 0000 · 💬 WhatsApp

| Doctor | Especialidad | Doctoralia |
|---|---|---|
| Dr. Juan José Castro Mosqueda | Cirujano Maxilofacial | [Ver perfil](https://www.doctoralia.com.mx/juan-jose-castro-mosqueda/cirujano-maxilofacial-dentista-odontologo/yucatan) |
| Dra. Miriam Edith Preciado Oseguera | Odontopediatra | [Ver perfil](https://www.doctoralia.com.mx/miriam-edith-preciado-oseguera/odontologo-pediatra/yucatan) |
