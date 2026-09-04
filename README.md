# OdonTHÓ — Sitio Web Oficial

Landing page para **OdonTHÓ Dentistas Militares**, clínica dental de especialidades en Mérida, Yucatán.

🌐 **[gibemireles.github.io/odontho](https://gibemireles.github.io/odontho/)**

---

## Estado actual (contexto para retomar)

Última sesión de trabajo: **4 de septiembre de 2026**. Resumen de lo que ya está en producción:

- **Cirugía Maxilofacial y Dr. Castro pausados (no eliminados)**: por ahora el sitio solo ofrece Odontología General y OdonTHÓ Kids con la Dra. Preciado. Se implementó un flag `"activo": false` en `config.json` (especialidad, doctor, sus servicios, testimonios y la pregunta de FAQ asociada) en vez de borrar los datos — `js/main.js` filtra todo lo marcado como inactivo en cada sección (hero, barra de confianza, especialidades, servicios, doctores, testimonios, FAQ, footer y el `<select>` del formulario). Para reactivarlo cuando el Dr. Castro se sume de nuevo: cambiar esos `activo` a `true` y volver a agregar `"castro"` al `doctor_ids` de la especialidad `general`. Ver sección **"Contenido pausado (patrón `activo`)"** más abajo.
- **Horario real de la Dra. Preciado actualizado**: Lun/Mié/Vie 9am–12pm, Mar/Jue 9am–12pm y 3pm–7pm, Sáb 9am–2pm. Se actualizó en las 3 fuentes: `CONFIG.HORARIOS` del Apps Script real (en script.google.com, ya desplegado y verificado contra el endpoint en vivo), `horario_disponible` de referencia en `config.json`, y el texto del horario que se muestra en el footer del sitio.
- **Rediseño de tarjetas de doctor**: se quitó el conteo de reseñas de Doctoralia (hero y "Nuestros especialistas") porque con una sola doctora activa el número se veía escaso; se agrandó la tarjeta del hero (avatar, tipografía, padding) para que no quedara vacía.
- **En proceso: Google Business Profile propio para "OdonTHÓ"** — hoy Maps solo tiene el perfil personal del Dr. Castro (con muchas reseñas). Se decidió crear un perfil nuevo para la clínica en vez de renombrar el existente (riesgo de suspensión por cambio de nombre/categoría en un perfil establecido, y las reseñas actuales hablan de él específicamente). Google permite varios perfiles en la misma dirección (clínica + cada practicante) si la señalética del consultorio respalda los nombres. Descripción del perfil ya redactada (ver checklist de pendientes). Cuando el perfil quede activo, falta actualizar `clinica.maps_embed` y `clinica.maps_link` en `config.json` para que apunten a OdonTHÓ en vez del perfil del Dr. Castro.
- **Sistema de agenda completo (Calendar + Sheets + recordatorios)**: el booking del sitio, un Google Apps Script y un Google Sheets de registro trabajan juntos — ver la sección **"Sistema de Agenda y Citas"** más abajo para el detalle completo (arquitectura, componentes, mantenimiento).
- **Booking conectado a Google Calendar real vía Apps Script**: el Paso 1 (Fecha) ya no usa `horario_disponible` de los doctores — hace `fetch` a `clinica.calendar_api_url` (`?action=disponibilidad`) y solo muestra como disponibles las fechas/horarios que devuelve el Calendar real, con loader mientras carga y fallback a WhatsApp si el fetch falla. Al confirmar, el Paso 2 hace `POST` (`action=agendar`) para crear el evento ("SIN CONFIRMAR") y registrarlo en Sheets, antes de abrir WhatsApp; si el horario ya se ocupó, regresa al Paso 1 con aviso y refresca la disponibilidad. `horario_disponible` de los doctores en `config.json` queda solo de referencia, sin uso activo. Ya no se muestra el doctor por horario (el Apps Script no lo informa).
- **Recordatorios diarios por correo**: un segundo Apps Script revisa cada tarde las citas del día siguiente y le manda un correo a la clínica con un link de WhatsApp de un clic por paciente — no es 100% automático (falta WA Business API), pero ya no hay que revisar Calendar a mano.
- **Booking simplificado a "cita de valoración"**: se quitó la selección de servicio. Son 2 pasos — Fecha → Confirmar (nombre, teléfono, envío por WhatsApp).
- **Odontología General** ahora tiene servicios reales (Limpieza Dental, Resinas y Empastes, Extracciones, Revisiones) y aplica a **ambos doctores** (`doctor_ids` en vez de `doctor_id` en `especialidades`).
- **Foto de la Dra. Preciado** integrada con fallback a iniciales (no emoji) si no carga; `foto_posicion` en config permite ajustar el encuadre por doctor.
- **Mapa de Google** embebido en el footer + botón "Cómo llegar" (usa el CID del negocio, no la dirección en texto — la dirección en texto geocodificaba a un lugar incorrecto).
- **Logos reales**: ícono de cada especialidad (`assets/Icon-Maxi.png`, `Icon-KidsA.jpg`, `Icon-KidsB.png`) sin contenedor, y logo de marca real en el nav (`assets/odonTHO-logo.png`).
- **Redes sociales reales** (Facebook e Instagram) en el footer.

### Pendiente / siguiente sesión

1. **Terminar el Google Business Profile de "OdonTHÓ"** — completar categoría, horario, fotos y pasar la verificación de Google; luego mandar el link/CID nuevo para actualizar `clinica.maps_embed` y `clinica.maps_link` en `config.json`.
2. **WhatsApp 100% automático** — hoy los recordatorios llegan por correo con un link de 1 clic; falta WhatsApp Business API para que salgan solos sin intervención humana — ver **Fase 1** del roadmap más abajo.
3. **Foto real del Dr. Castro** — sigue sin subirse (`assets/dr-castro.jpg` no existe); hoy cae al fallback de iniciales "JC". Sigue aplicando aunque esté pausado, para cuando se reactive.
4. **SEO local** y **dominio personalizado** — ver Roadmap.

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
├── CONFIG-PRIVADO.md   # ⚠️ NO versionado (.gitignore) — valores reales de Calendar/Sheets/correo
├── css/
│   └── styles.css      # Diseño editorial, mobile-first, ~650 líneas
├── js/
│   └── main.js         # Carga config.json, renderiza todo, lógica de citas
├── apps-script/         # Copias de referencia del backend externo (Google Apps Script)
│   ├── gestor-de-citas.gs   # GET disponibilidad / POST agendar → Calendar + Sheets
│   └── recordatorios.gs     # Trigger diario → correo con links de WhatsApp de 1 clic
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
| Citas | Booking de cita de **valoración** (2 pasos): Fecha (disponibilidad real vía Google Calendar) → Confirmar (nombre, teléfono, WhatsApp) — ver "Sistema de Agenda y Citas" |
| Especialidades | 3 cards con hover editorial (border-left teal), íconos reales sin contenedor |
| Servicios | Grid filtrable por especialidad — catálogo informativo, independiente del booking |
| Doctores | Perfil completo con cédulas, formación y link a Doctoralia |
| Testimonios | Reseñas reales de Doctoralia (Georgia italic) |
| FAQ | Accordion con animación, textos desde config.json |
| Contacto | Formulario → genera link wa.me con mensaje prellenado |
| Footer | Navy, 3 columnas, redes sociales reales, mapa de Google embebido + botón "Cómo llegar" |
| WA flotante | Botón fijo bottom-right con shadow verde |

---

## Sistema de Agenda y Citas

> ⚠️ Esta sección documenta un sistema que depende de **Google Apps Script**, corriendo
> fuera de este repositorio (script.google.com). Los valores reales (IDs de Calendar/Sheets,
> correo de la cuenta) NUNCA se versionan aquí — se referencian como placeholders
> (`[CALENDAR_ID]`, `[SHEETS_ID]`, `[CORREO_CLINICA]`) y viven solo en `CONFIG-PRIVADO.md`
> (no versionado, ver `.gitignore`). La única excepción es la URL del Web App: vive real en
> `config.json` → `clinica.calendar_api_url` porque el navegador necesita hacerle `fetch()`
> desde el cliente — no es un secreto que se pueda ocultar, cualquier visitante ya la ve en
> la pestaña Network del sitio en vivo.

### Arquitectura

Google Calendar es la fuente única de verdad de la agenda, conectado al sitio vía un Google
Apps Script Web App. Cada cita agendada también se registra en Google Sheets como historial.
Un segundo Apps Script, con un disparador diario, lee ese Sheets y envía un correo con
recordatorios listos para enviar por WhatsApp.

**Flujo completo:**

```
1. Paciente agenda en el sitio (booking 2 pasos: fecha → hora)
       ↓
2. La web consulta disponibilidad real vía Apps Script
   GET {calendar_api_url}?action=disponibilidad
       ↓
3. Al confirmar, Apps Script crea el evento en Calendar
   (marcado "⚠️ SIN CONFIRMAR - ")
       ↓
4. La misma operación registra la cita en Sheets (hoja "Citas")
   — si falla el registro en Sheets, NO se cancela la cita:
     el evento en Calendar ya es la fuente de verdad
       ↓
5. La web abre WhatsApp con el mensaje de valoración prellenado
       ↓
6. Cada día a las 6 PM, el script de Recordatorios lee las citas
   de MAÑANA y envía un correo a la clínica con cada recordatorio
   listo — un link de WhatsApp de 1 clic por paciente
```

### Componentes

**1. Apps Script "Gestor de Citas"** (`apps-script/gestor-de-citas.gs`)

- Cuenta: `[CORREO_CLINICA]`
- Calendario dedicado "Citas OdonTHÓ" — ID real en `CONFIG-PRIVADO.md`
- Endpoints:
  - `GET ?action=disponibilidad&desde=YYYY-MM-DD&hasta=YYYY-MM-DD` → huecos libres
  - `POST {action:'agendar', nombre, telefono, fecha, hora}` → crea la cita + la registra en Sheets
- Config: valoración de 30 min, anticipación mínima 6 h, ventana de 60 días
- Horarios (Dra. Preciado, único doctor activo): Lun/Mié/Vie 9–12, Mar/Jue 9–12 y 15–19, Sáb 9–14, Dom cerrado (editable en `CONFIG.HORARIOS`)
- URL del Web App: en `config.json` → `clinica.calendar_api_url` (real, pública por diseño — ver nota arriba) y también copiada en `CONFIG-PRIVADO.md` para referencia

**2. Apps Script "Recordatorios"** (`apps-script/recordatorios.gs`)

- Función: `enviarRecordatoriosDeManana()`
- Disparador diario: 6 PM, zona horaria `America/Merida` (se crea una sola vez ejecutando `crearDisparadorDiario()`)
- Lee la hoja "Citas" del Sheets, filtra las de mañana, arma y envía un correo HTML a `[CORREO_CLINICA]` con un botón "Enviar recordatorio" (link `wa.me`) por paciente

**3. Google Sheets (registro)** — ID real: `[SHEETS_ID]` (ver `CONFIG-PRIVADO.md`)

- Hoja "Citas": `Timestamp | Nombre | Teléfono | Fecha cita | Hora | Estado | Evento ID | Motivo`
- Los encabezados y el formato de la fila se crean solos en la primera escritura
- **Importante:** configura las columnas A, D y E como formato **"Texto sin formato"** (Formato → Número → Texto sin formato) para que Sheets no reinterprete esos valores como fecha/hora y los desfase por zona horaria. El teléfono (columna C) ya se escribe con un apóstrofo (`'`) desde el script para conservar el 0 inicial y evitar notación científica.

### Notas de mantenimiento

- **Cambiar horarios de atención:** edita `CONFIG.HORARIOS` en `gestor-de-citas.gs` (en el editor de Apps Script, no aquí), guarda y vuelve a desplegar (Implementar → Gestionar implementaciones → Editar → Nueva versión). La URL del Web App no cambia entre versiones.
- Las citas se crean como **"⚠️ SIN CONFIRMAR -"**; la clínica confirma por WhatsApp y le quita la marca al título del evento en Calendar.
- Si la clínica borra una cita directo en Calendar, el hueco reaparece solo en el sitio (la disponibilidad se consulta en vivo, no hay caché).
- **Limitación actual:** sin WhatsApp Business API, el envío de recordatorios sigue siendo manual — un clic por paciente desde el correo diario. Ver Fase 1 del roadmap para la automatización completa.
- Los `.gs` en `apps-script/` son copias de referencia versionadas — no se despliegan solas desde git. Cualquier cambio real se hace en el editor de script.google.com; opcionalmente se refleja después en el repo (con los placeholders, nunca los valores reales).

Sin backend propio. Sin base de datos propia. El front-end sigue siendo 100% estático — solo habla con los Apps Script externos.

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

## Contenido pausado (patrón `activo`)

Cuando una especialidad, doctor, servicio, testimonio o pregunta de FAQ deja de ofrecerse **temporalmente** (ej. un doctor que se va y puede regresar más adelante), no se borra del `config.json` — se marca con `"activo": false`. `js/main.js` filtra (`.filter(x => x.activo !== false)`) todo lo marcado así antes de renderizar cada sección, así que cualquier entrada sin el campo `activo` sigue mostrándose normal.

**Uso actual:** especialidad `maxilofacial`, doctor `castro`, sus 7 servicios, sus 3 testimonios, y la FAQ de "¿Qué es la cirugía maxilofacial?" y "¿La cirugía de terceros molares duele?" — todo pausado mientras solo se ofrece Odontología General y OdonTHÓ Kids.

**Para reactivar cuando el Dr. Castro (u otro doctor) regrese:**
1. Cambiar cada `"activo": false` relevante a `"activo": true` (o borrar el campo) en `config.json`
2. Volver a agregar su `id` al `doctor_ids` de las especialidades que le apliquen (ej. `"castro"` en `general`)
3. Si vuelve a tener horario propio de citas, agregarlo también a `CONFIG.HORARIOS` en el Apps Script real (script.google.com) — hoy solo tiene el horario de la Dra. Preciado

Si en cambio algo se quita **para siempre**, sí se borra directo del `config.json` (el historial en git ya sirve de respaldo).

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
- [x] Sistema de citas con disponibilidad real (Google Calendar) — ver Fase 2
- [x] Registro en Google Sheets
- [x] Recordatorios automáticos diarios por correo
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
- [x] Cirugía Maxilofacial y Dr. Castro pausados con patrón `activo` (reversible)
- [x] Horario real de la Dra. Preciado (Apps Script + config.json + footer)
- [ ] Foto real del Dr. Castro
- [ ] SEO local (meta tags, Schema.org, Google Business)
- [ ] Google Business Profile propio para "OdonTHÓ" (en proceso — falta verificación de Google; ver "Pendiente / siguiente sesión")
- [ ] Dominio personalizado `odontho.mx`
- [ ] WhatsApp Business API (recordatorios 100% automáticos, futuro)
- [ ] Agente de IA en WhatsApp (futuro, ver Fase 3)

---

### Fase 1 — Recordatorios WA 📲 *(parcialmente implementado — versión "1 clic")*

**Qué hace:** Mensajes automáticos 24 h y 2 h antes de cada cita. Reduce no-shows hasta un 40%. Puede pedir confirmación al paciente.

**Cómo quedó implementado (interino):** en vez de WA Business API, un Apps Script (`apps-script/recordatorios.gs`) revisa cada tarde las citas de mañana y le manda un correo a la clínica con un botón de WhatsApp ya armado por paciente — la clínica solo da clic y "enviar". Automatiza detectar y preparar el mensaje; el envío en sí sigue siendo manual porque no hay WA Business API todavía. **Pendiente para la automatización completa:** el flujo de abajo (trigger directo a WhatsApp, sin pasar por correo ni por un clic humano).

**Flujo (automatización completa, aún no implementada):**
```
Cita agendada en Google Calendar
  → trigger 24 h antes
  → WA: "¿Confirmas tu cita mañana a las 4:00 PM con el Dr. Castro?"
  → paciente responde Sí / No
  → si No → libera el slot en el calendario
```

| Opción | Stack | Esfuerzo |
|---|---|---|
| Implementado | Apps Script + Gmail (correo con links wa.me de 1 clic) | Hecho |
| Sin código | Wati.io · MessageBird | Bajo |
| Automatización completa | Make.com · n8n + WA Business API | Medio |

---

### Fase 2 — Calendario real con Google Calendar 📅 ✅ *(implementado — 7 de agosto de 2026)*

**Qué hace:** El booking de la web consulta Google Calendar en tiempo real — solo muestra huecos libres. Al confirmar, crea el evento automáticamente ("SIN CONFIRMAR").

**Cómo quedó implementado:** Google Apps Script Web App expone `GET ?action=disponibilidad` y `POST action=agendar`, y también registra cada cita en Google Sheets. Ver la sección **"Sistema de Agenda y Citas"** más arriba para el detalle completo (arquitectura, componentes, mantenimiento). **Pendiente dentro de esta fase:** confirmación automática al paciente (hoy solo llega el correo de recordatorio a la clínica, ver Fase 1).

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
📞 999 446 9926 · 💬 WhatsApp

| Doctor | Especialidad | Doctoralia | Estado |
|---|---|---|---|
| Dr. Juan José Castro Mosqueda | Cirujano Maxilofacial | [Ver perfil](https://www.doctoralia.com.mx/juan-jose-castro-mosqueda/cirujano-maxilofacial-dentista-odontologo/yucatan) | Pausado en el sitio (`activo: false`) |
| Dra. Miriam Edith Preciado Oseguera | Odontopediatra | [Ver perfil](https://www.doctoralia.com.mx/miriam-edith-preciado-oseguera/odontologo-pediatra/yucatan) | Activa |
