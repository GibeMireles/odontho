# OdonTHÓ — Sitio Web Oficial

Landing page para **OdonTHÓ Dentistas Militares**, clínica dental de especialidades en Mérida, Yucatán.

🌐 **[gibemireles.github.io/odontho](https://gibemireles.github.io/odontho/)**

---

## Estado actual (contexto para retomar)

Última sesión de trabajo: **7 de agosto de 2026**. Resumen de lo que ya está en producción:

- **Booking conectado a Google Calendar real vía Apps Script**: el Paso 1 (Fecha) ya no usa `horario_disponible` de los doctores — hace `fetch` a `clinica.calendar_api_url` (`?action=disponibilidad`) y solo muestra como disponibles las fechas/horarios que devuelve el Calendar real, con loader mientras carga y fallback a WhatsApp si el fetch falla. Al confirmar, el Paso 2 hace `POST` (`action=agendar`) al mismo Apps Script para crear el evento ("SIN CONFIRMAR") antes de abrir WhatsApp; si el horario ya se ocupó, regresa al Paso 1 con aviso y refresca la disponibilidad. `horario_disponible` de los doctores en `config.json` queda solo de referencia, sin uso activo. Ya no se muestra el doctor por horario (el Apps Script no lo informa).
- **Booking simplificado a "cita de valoración"**: se quitó la selección de servicio. Son 2 pasos — Fecha → Confirmar (nombre, teléfono, envío por WhatsApp).
- **Horario real cargado**: Dr. Castro (lunes/miércoles/viernes, martes/jueves/sábado cerrado) y Dra. Preciado (ya existente) — ahora de referencia, ver punto anterior.
- **Odontología General** ahora tiene servicios reales (Limpieza Dental, Resinas y Empastes, Extracciones, Revisiones) y aplica a **ambos doctores** (`doctor_ids` en vez de `doctor_id` en `especialidades`).
- **Foto de la Dra. Preciado** integrada con fallback a iniciales (no emoji) si no carga; `foto_posicion` en config permite ajustar el encuadre por doctor.
- **Mapa de Google** embebido en el footer + botón "Cómo llegar" (usa el CID del negocio, no la dirección en texto — la dirección en texto geocodificaba a un lugar incorrecto).
- **Logos reales**: ícono de cada especialidad (`assets/Icon-Maxi.png`, `Icon-KidsA.jpg`, `Icon-KidsB.png`) sin contenedor, y logo de marca real en el nav (`assets/odonTHO-logo.png`).
- **Redes sociales reales** (Facebook e Instagram) en el footer.

### Pendiente / siguiente sesión

1. **WhatsApp más allá de la confirmación inicial** — el evento ya se crea solo en Calendar al agendar, pero el paso de WhatsApp sigue siendo manual (`wa.me` con mensaje prellenado; el paciente le da "enviar"). Falta decidir e implementar recordatorios/confirmaciones automáticas — ver **Fase 1** del roadmap más abajo.
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

## Flujo de citas (Google Calendar vía Apps Script)

Todas las citas agendadas por la web son de **valoración general** — no se elige servicio ni doctor de antemano. La disponibilidad y la creación del evento las maneja un Google Apps Script Web App externo (no vive en este repo); la URL está en `config.json` → `clinica.calendar_api_url`.

```
1. Al cargar la página: GET {calendar_api_url}?action=disponibilidad
       ↓ { ok:true, dias:[{fecha:"YYYY-MM-DD", slots:["10:00",...]}, ...] }
       ↓ (loader mientras carga; si falla, mensaje + botón de WhatsApp)
2. Calendario solo marca como disponibles las fechas que trae el Calendar real
       ↓ (al elegir un día, se listan sus slots — ya no se etiqueta el doctor,
          el Apps Script no lo informa)
3. Confirmación → captura nombre y teléfono (validado, 10 dígitos MX)
       ↓
4. POST {calendar_api_url} con
   { action:'agendar', nombre, telefono, fecha:"YYYY-MM-DD", hora:"HH:mm" }
   (Content-Type: text/plain;charset=utf-8 para evitar preflight CORS)
       ↓
   ok:true  → crea el evento en Calendar ("SIN CONFIRMAR") y sigue al paso 5
   ok:false → banner de error, vuelve al Paso 1 y refresca disponibilidad
       ↓
5. Genera:
   wa.me/529990000000?text=Hola, me gustaría agendar una cita de
   valoración... Nombre / Fecha preferida / Hora preferida
       ↓
6. WhatsApp abre con mensaje prellenado, el paciente lo envía
7. Clínica confirma manualmente la cita "SIN CONFIRMAR" en Calendar
```

Sin backend propio. Sin base de datos propia. El front-end sigue siendo 100% estático — solo habla con el Apps Script externo. **Pendiente:** automatizar el paso 6–7 por WA y/o correo (Fases 1–3 del roadmap).

---

## Editar contenido (`config.json`)

Toda la información de la clínica vive en `config.json`. Para actualizar:

```jsonc
{
  "clinica": {
    "telefono": "999 000 0000",   // ← cambiar aquí
    "whatsapp": "529990000000",   // formato: 52 + 10 dígitos, sin +
    "calendar_api_url": "https://script.google.com/macros/s/.../exec", // ← Apps Script del booking
    "horario": { ... }
  },
  "doctores": [
    {
      "horario_disponible": {
        "lunes": ["9:00", "10:00", "11:00"],  // ← de referencia; el booking ya NO lee esto
        ...                                    //   (la disponibilidad real la da calendar_api_url)
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
- [x] Booking de cita de valoración (2 pasos) → WhatsApp
- [x] Calendario dinámico combinando horarios de todos los doctores (histórico; superado por el punto siguiente)
- [x] Booking conectado a Google Calendar real vía Apps Script — disponibilidad real y creación de evento al agendar (ver Fase 2)
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

### Fase 2 — Calendario real con Google Calendar 📅 ✅ *(implementado — 7 de agosto de 2026)*

**Qué hace:** El booking de la web consulta Google Calendar en tiempo real — solo muestra huecos libres. Al confirmar, crea el evento automáticamente ("SIN CONFIRMAR").

**Cómo quedó implementado:** Google Apps Script Web App (fuera de este repo) expone `GET ?action=disponibilidad` y `POST action=agendar`; la URL vive en `config.json` → `clinica.calendar_api_url`. Ver la sección "Flujo de citas" más arriba para el detalle. **Pendiente dentro de esta fase:** confirmación automática al paciente y al doctor tras crear el evento (hoy solo se abre WhatsApp con el link manual — eso es Fase 1/3).

**Flujo:**
```
Web consulta disponibilidad en tiempo real
  → muestra solo huecos libres
  → paciente elige fecha y hora
  → se crea evento en Google Calendar
  → (pendiente) confirmación automática a paciente y doctor
```

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
