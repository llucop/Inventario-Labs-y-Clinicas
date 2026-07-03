import React, { useState } from "react";
import {
  Home, ScanLine, ClipboardList, LayoutGrid, Search, ChevronLeft,
  AlertTriangle, ArrowDownCircle, ArrowUpCircle, CheckCircle2,
  MapPin, FlaskConical, Syringe, Package, Droplet, X, QrCode, User,
  PackagePlus, ChevronDown, RotateCw, MoreHorizontal
} from "lucide-react";

/* ---------------------------------------------------------
   TOKENS — Fluent UI / Power Apps (Office 365)
   Paleta y tipografía alineadas al player de Power Apps:
   Segoe UI, azul de marca de Office y grises neutros de Fluent.
--------------------------------------------------------- */
const C = {
  bg: "#FAF9F8",          // Neutral background (Fluent)
  surface: "#FFFFFF",
  border: "#EDEBE9",       // Neutral border
  borderStrong: "#D2D0CE",
  textPrimary: "#201F1E",  // Neutral foreground
  textSecondary: "#605E5C",
  textTertiary: "#A19F9D",
  brand: "#0078D4",        // Office/Fluent blue
  brandDark: "#005A9E",
  brandLight: "#DEECF9",
  green: "#107C10",        // Entrada
  greenLight: "#DFF6DD",
  red: "#D13438",          // Salida
  redLight: "#FDE7E9",
  amber: "#CA5010",        // Alerta stock bajo (Fluent "severe")
  amberLight: "#FDF0E6",
  playerChrome: "#5B2D82", // Cabecera del reproductor Power Apps
  playerChromeDark: "#44235F",
};

const FONT_STACK =
  "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO_STACK = "'Consolas', 'Cascadia Mono', 'Courier New', monospace";

/* ---------------------------------------------------------
   DATOS DE MUESTRA (reflejan el esquema real de las listas)
--------------------------------------------------------- */
const UBICACIONES = ["Lab Química 1", "Clínica Dental"];

const ITEMS = [
  { id: 1, nombre: "Tubos de ensayo", qr: "QR-0001", categoria: "Instrumental", ubicacion: "Lab Química 1", stock: 86, min: 40, unidad: "Unidad", icon: FlaskConical },
  { id: 2, nombre: "Guantes de nitrilo M", qr: "QR-0002", categoria: "EPP", ubicacion: "Lab Química 1", stock: 12, min: 20, unidad: "Caja", icon: Package },
  { id: 3, nombre: "Pipetas 10ml", qr: "QR-0003", categoria: "Instrumental", ubicacion: "Lab Química 1", stock: 34, min: 15, unidad: "Unidad", icon: Syringe },
  { id: 4, nombre: "Putty de empastes tipo A", qr: "QR-0004", categoria: "Material dental", ubicacion: "Clínica Dental", stock: 4.5, min: 6, unidad: "Kilogramo", icon: Droplet },
  { id: 5, nombre: "Ácido clorhídrico 1M", qr: "QR-0005", categoria: "Reactivos", ubicacion: "Lab Química 1", stock: 8.25, min: 5, unidad: "Litro", icon: FlaskConical },
];

const MOVIMIENTOS = [
  { id: 101, item: "Tubos de ensayo", tipo: "Salida", cantidad: 24, motivo: "Consumo", nota: "Práctica de titulación — Grupo 2B", fecha: "Hoy · 10:14", usuario: "R. Ortega" },
  { id: 102, item: "Putty de empastes tipo A", tipo: "Entrada", cantidad: 6, motivo: "Compra", nota: "Pedido #4521, proveedor XYZ", fecha: "Hoy · 09:02", usuario: "M. Reyes" },
  { id: 103, item: "Guantes de nitrilo M", tipo: "Salida", cantidad: 3, motivo: "Consumo", nota: "Práctica de disección", fecha: "Ayer · 16:40", usuario: "R. Ortega" },
  { id: 104, item: "Ácido clorhídrico 1M", tipo: "Entrada", cantidad: 2, motivo: "Compra", nota: "Reposición trimestral", fecha: "Ayer · 11:20", usuario: "M. Reyes" },
];

const MOTIVOS = ["Compra", "Consumo", "Donación", "Baja", "Ajuste de inventario"];
const RESPONSABLES = ["R. Ortega", "M. Reyes", "A. Serrano", "J. Peña"];
const CATEGORIAS = ["Instrumental", "EPP", "Material dental", "Reactivos"];
const UNIDADES = ["Unidad", "Caja", "Litro", "Kilogramo", "Paquete"];

/* ---------------------------------------------------------
   PIEZAS REUTILIZABLES — estilo controles de Power Apps
--------------------------------------------------------- */

// Barra de stock (Rectangle + Rectangle relleno, como en Power Apps)
function StockBar({ stock, min, unidad, size = "md" }) {
  const max = Math.max(stock, min) * 1.4;
  const pct = Math.min(100, (stock / max) * 100);
  const minPct = Math.min(100, (min / max) * 100);
  const low = stock < min;
  const height = size === "lg" ? 88 : 52;

  return (
    <div className="flex items-end gap-3">
      <div
        className="relative overflow-hidden"
        style={{ width: size === "lg" ? 28 : 18, height, background: "#F3F2F1", border: `1px solid ${C.border}`, borderRadius: 2 }}
      >
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: `${pct}%`,
            background: low ? C.amber : C.brand,
            transition: "height 300ms ease",
          }}
        />
        <div style={{ position: "absolute", left: -2, right: -2, bottom: `${minPct}%`, borderTop: `2px dashed ${C.red}` }} />
      </div>
      <div>
        <div style={{ fontFamily: MONO_STACK, fontWeight: 600 }} className={size === "lg" ? "text-2xl" : "text-base"}>
          <span style={{ color: low ? C.amber : C.textPrimary }}>{stock}</span>
          <span style={{ color: C.textTertiary, fontSize: "0.65em" }}> {unidad.toLowerCase()}</span>
        </div>
        <div style={{ color: C.textTertiary }} className="text-xs mt-0.5">mín. {min}</div>
        {low && (
          <div style={{ color: C.amber }} className="text-xs font-semibold mt-1 flex items-center gap-1">
            <AlertTriangle size={12} /> Bajo mínimo
          </div>
        )}
      </div>
    </div>
  );
}

function QrTag({ code }) {
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1" style={{ border: `1px dashed ${C.borderStrong}`, background: "#FAFAFA", borderRadius: 2 }}>
      <QrCode size={13} style={{ color: C.textSecondary }} />
      <span style={{ fontFamily: MONO_STACK, color: C.textSecondary, letterSpacing: "0.02em" }} className="text-xs">{code}</span>
    </div>
  );
}

// Chip tipo "Pill button" de Power Apps
function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
      style={{
        background: active ? C.brand : C.surface,
        color: active ? "#fff" : C.textSecondary,
        border: `1px solid ${active ? C.brand : C.borderStrong}`,
        borderRadius: 2,
      }}
    >
      {children}
    </button>
  );
}

// Botón primario Fluent
function PrimaryButton({ children, onClick, bg = C.brand, disabled, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
      style={{ background: disabled ? "#F3F2F1" : bg, color: disabled ? C.textTertiary : "#fff", borderRadius: 2, border: "none" }}
    >
      {Icon && <Icon size={15} />} {children}
    </button>
  );
}

function FieldLabel({ children, icon: Icon }) {
  return (
    <label style={{ color: C.textPrimary }} className="text-xs font-semibold flex items-center gap-1 mb-1">
      {Icon && <Icon size={12} />} {children}
    </label>
  );
}

const fluentInput = { border: `1px solid ${C.borderStrong}`, color: C.textPrimary, borderRadius: 2, background: "#fff" };

function TopBar({ title, onBack, right }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-1.5">
        {onBack && (
          <button onClick={onBack} className="p-1 -ml-1" style={{ color: C.brand }}>
            <ChevronLeft size={20} />
          </button>
        )}
        <h1 style={{ fontFamily: FONT_STACK, color: C.textPrimary }} className="text-lg font-semibold">{title}</h1>
      </div>
      {right}
    </div>
  );
}

/* ---------------------------------------------------------
   PANTALLA: INICIO
--------------------------------------------------------- */
function Inicio({ onOpenItem, onGoTab, onCrear, onSalidaRapida }) {
  const bajos = ITEMS.filter((i) => i.stock < i.min);
  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <TopBar
        title="Inventario"
        right={
          <div className="flex items-center gap-1 text-xs px-2.5 py-1" style={{ background: C.brandLight, color: C.brandDark, borderRadius: 2 }}>
            <MapPin size={12} /> Todas las sedes
          </div>
        }
      />

      <div className="px-4 grid grid-cols-3 gap-2 my-4">
        <StatCard label="Ítems" value={ITEMS.length} />
        <StatCard label="Bajo mínimo" value={bajos.length} accent={C.amber} />
        <StatCard label="Mov. hoy" value={2} accent={C.brand} />
      </div>

      <div className="px-4 mb-2 flex items-center justify-between">
        <h2 style={{ color: C.textPrimary }} className="text-sm font-semibold">Alertas de stock bajo</h2>
        <span style={{ color: C.textTertiary }} className="text-xs">{bajos.length} ítems</span>
      </div>

      <div className="px-4 flex flex-col gap-2 mb-5">
        {bajos.map((it) => (
          <button
            key={it.id}
            onClick={() => onOpenItem(it)}
            className="text-left flex items-center justify-between p-3"
            style={{ background: C.amberLight, border: `1px solid #F0D6BE`, borderRadius: 2 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center" style={{ background: "#fff", borderRadius: 2, border: `1px solid ${C.border}` }}>
                <it.icon size={17} style={{ color: C.amber }} />
              </div>
              <div>
                <div style={{ color: C.textPrimary }} className="text-sm font-medium">{it.nombre}</div>
                <div style={{ color: C.textSecondary }} className="text-xs">{it.ubicacion}</div>
              </div>
            </div>
            <div style={{ fontFamily: MONO_STACK, color: C.amber }} className="text-sm font-semibold">
              {it.stock} <span className="text-xs">{it.unidad.toLowerCase()}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 grid grid-cols-2 gap-2">
        <PrimaryButton onClick={() => onGoTab("escanear")} icon={ScanLine}>Escanear ítem</PrimaryButton>
        <button
          onClick={() => onGoTab("catalogo")}
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
          style={{ background: C.surface, color: C.textPrimary, border: `1px solid ${C.borderStrong}`, borderRadius: 2 }}
        >
          <LayoutGrid size={15} /> Ver catálogo
        </button>
        <button
          onClick={onCrear}
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
          style={{ background: C.brandLight, color: C.brandDark, borderRadius: 2, border: "none" }}
        >
          <PackagePlus size={15} /> Crear ítem
        </button>
        <button
          onClick={onSalidaRapida}
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
          style={{ background: C.redLight, color: C.red, borderRadius: 2, border: "none" }}
        >
          <ArrowUpCircle size={15} /> Dar salida
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="p-2.5" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 2 }}>
      <div style={{ color: accent || C.textPrimary }} className="text-2xl font-semibold">{value}</div>
      <div style={{ color: C.textTertiary }} className="text-[11px] mt-0.5">{label}</div>
    </div>
  );
}

/* ---------------------------------------------------------
   PANTALLA: CATÁLOGO
--------------------------------------------------------- */
function Catalogo({ onOpenItem }) {
  const [query, setQuery] = useState("");
  const [ubicacion, setUbicacion] = useState("Todas");

  const filtered = ITEMS.filter((i) => {
    const matchesQuery = i.nombre.toLowerCase().includes(query.toLowerCase());
    const matchesUbi = ubicacion === "Todas" || i.ubicacion === ubicacion;
    return matchesQuery && matchesUbi;
  });

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <TopBar title="Catálogo" />
      <div className="px-4 mt-3 mb-3">
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: C.surface, border: `1px solid ${C.borderStrong}`, borderRadius: 2 }}>
          <Search size={15} style={{ color: C.textTertiary }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ítem..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: C.textPrimary }}
          />
        </div>
      </div>
      <div className="px-4 flex gap-2 mb-3 overflow-x-auto">
        {["Todas", ...UBICACIONES].map((u) => (
          <Chip key={u} active={ubicacion === u} onClick={() => setUbicacion(u)}>{u}</Chip>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-2">
        {filtered.map((it) => (
          <button
            key={it.id}
            onClick={() => onOpenItem(it)}
            className="text-left flex items-center gap-3 p-2.5"
            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 2 }}
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: C.brandLight, borderRadius: 2 }}>
              <it.icon size={18} style={{ color: C.brandDark }} />
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: C.textPrimary }} className="text-sm font-medium truncate">{it.nombre}</div>
              <div style={{ color: C.textTertiary }} className="text-xs">{it.categoria} · {it.ubicacion}</div>
            </div>
            <div style={{ fontFamily: MONO_STACK, color: it.stock < it.min ? C.amber : C.textPrimary }} className="text-sm font-semibold shrink-0">
              {it.stock}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10" style={{ color: C.textTertiary }}>No se encontraron ítems.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PANTALLA: DETALLE DE ÍTEM (+ registrar movimiento)
--------------------------------------------------------- */
function Detalle({ item, onBack, onRegister }) {
  const [formOpen, setFormOpen] = useState(null); // 'Entrada' | 'Salida' | null
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [responsable, setResponsable] = useState(RESPONSABLES[0]);
  const [toast, setToast] = useState(false);

  const historial = MOVIMIENTOS.filter((m) => m.item === item.nombre);

  const submit = () => {
    if (!cantidad || Number(cantidad) <= 0) return;
    setFormOpen(null);
    setCantidad("");
    setToast(true);
    onRegister?.();
    setTimeout(() => setToast(false), 2200);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4 relative">
      <TopBar title="Detalle del ítem" onBack={onBack} />

      <div className="px-4 mt-3">
        <div className="p-3.5 mb-4" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 2 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 flex items-center justify-center" style={{ background: C.brandLight, borderRadius: 2 }}>
              <item.icon size={20} style={{ color: C.brandDark }} />
            </div>
            <div>
              <div style={{ color: C.textPrimary }} className="text-base font-semibold">{item.nombre}</div>
              <div style={{ color: C.textTertiary }} className="text-xs">{item.categoria} · {item.ubicacion}</div>
            </div>
          </div>
          <QrTag code={item.qr} />
          <div className="mt-4"><StockBar stock={item.stock} min={item.min} unidad={item.unidad} size="lg" /></div>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setFormOpen("Entrada")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
            style={{ background: C.greenLight, color: C.green, borderRadius: 2, border: "none" }}
          >
            <ArrowDownCircle size={16} /> Entrada
          </button>
          <button
            onClick={() => setFormOpen("Salida")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
            style={{ background: C.redLight, color: C.red, borderRadius: 2, border: "none" }}
          >
            <ArrowUpCircle size={16} /> Salida
          </button>
        </div>

        <h2 style={{ color: C.textPrimary }} className="text-sm font-semibold mb-2">Historial</h2>
        <div className="flex flex-col gap-2 mb-4">
          {historial.length === 0 && <div style={{ color: C.textTertiary }} className="text-xs">Sin movimientos registrados todavía.</div>}
          {historial.map((m) => <MovRow key={m.id} m={m} compact />)}
        </div>
      </div>

      {formOpen && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(32,31,30,0.4)" }}>
          <div className="w-full p-4" style={{ background: C.surface, borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: C.textPrimary }} className="text-base font-semibold">Registrar {formOpen.toLowerCase()}</h3>
              <button onClick={() => setFormOpen(null)}><X size={18} style={{ color: C.textTertiary }} /></button>
            </div>

            <FieldLabel>Cantidad ({item.unidad.toLowerCase()})</FieldLabel>
            <input
              type="number" step="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0.00"
              className="w-full mb-3 px-3 py-2.5 outline-none text-sm"
              style={{ ...fluentInput, fontFamily: MONO_STACK }}
            />
            {cantidad !== "" && Number(cantidad) <= 0 && (
              <div style={{ color: C.red }} className="text-xs -mt-2 mb-3">La cantidad debe ser mayor que 0.</div>
            )}

            <FieldLabel>Motivo</FieldLabel>
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full mb-3 px-3 py-2.5 outline-none text-sm" style={fluentInput}>
              {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
            </select>

            <FieldLabel icon={User}>Responsable</FieldLabel>
            <select value={responsable} onChange={(e) => setResponsable(e.target.value)} className="w-full mb-4 px-3 py-2.5 outline-none text-sm" style={fluentInput}>
              {RESPONSABLES.map((r) => <option key={r}>{r}</option>)}
            </select>

            <PrimaryButton onClick={submit} bg={formOpen === "Entrada" ? C.green : C.red}>Guardar movimiento</PrimaryButton>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute top-3 left-4 right-4 flex items-center gap-2 px-4 py-3 text-sm font-medium" style={{ background: C.green, color: "#fff", borderRadius: 2 }}>
          <CheckCircle2 size={16} /> Movimiento registrado por {responsable}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   PANTALLA: ESCANEAR
--------------------------------------------------------- */
function Escanear({ onFound }) {
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState(null);

  const simulate = () => {
    setScanning(true);
    setFound(null);
    setTimeout(() => { setScanning(false); setFound(ITEMS[0]); }, 1100);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <TopBar title="Escanear QR" />
      <div className="px-4 mt-3">
        <div className="relative overflow-hidden flex items-center justify-center mb-4" style={{ background: "#201F1E", height: 250, borderRadius: 2 }}>
          <div className="relative" style={{ width: 160, height: 160 }}>
            {["-top-1 -left-1 border-t-2 border-l-2", "-top-1 -right-1 border-t-2 border-r-2", "-bottom-1 -left-1 border-b-2 border-l-2", "-bottom-1 -right-1 border-b-2 border-r-2"].map((pos, i) => (
              <div key={i} className={`absolute w-7 h-7 ${pos}`} style={{ borderColor: "#3AA0F3" }} />
            ))}
          </div>
          <span className="absolute bottom-4 text-xs" style={{ color: "#3AA0F3" }}>
            {scanning ? "Buscando código..." : "Apunta la cámara al código QR"}
          </span>
        </div>

        <div className="mb-4"><PrimaryButton onClick={simulate} icon={ScanLine}>Simular escaneo</PrimaryButton></div>

        {found && (
          <button
            onClick={() => onFound(found)}
            className="w-full text-left flex items-center gap-3 p-3"
            style={{ background: C.brandLight, border: `1px solid #C7E0F4`, borderRadius: 2 }}
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: "#fff", borderRadius: 2 }}>
              <found.icon size={18} style={{ color: C.brandDark }} />
            </div>
            <div className="flex-1">
              <div style={{ color: C.brandDark }} className="text-sm font-semibold">{found.nombre}</div>
              <div style={{ color: C.textSecondary }} className="text-xs">Encontrado · {found.qr}</div>
            </div>
            <ChevronLeft size={16} style={{ color: C.brandDark, transform: "rotate(180deg)" }} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PANTALLA: MOVIMIENTOS
--------------------------------------------------------- */
function MovRow({ m, compact }) {
  const entrada = m.tipo === "Entrada";
  return (
    <div className={`flex items-center gap-3 ${compact ? "p-2" : "p-3"}`} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 2 }}>
      <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: entrada ? C.greenLight : C.redLight, borderRadius: 2 }}>
        {entrada ? <ArrowDownCircle size={15} style={{ color: C.green }} /> : <ArrowUpCircle size={15} style={{ color: C.red }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ color: C.textPrimary }} className="text-sm font-medium truncate">{m.item}</div>
        <div style={{ color: C.textTertiary }} className="text-[11px] truncate">{m.motivo} · {m.fecha} · {m.usuario}</div>
      </div>
      <div style={{ fontFamily: MONO_STACK, color: entrada ? C.green : C.red }} className="text-sm font-semibold">
        {entrada ? "+" : "−"}{m.cantidad}
      </div>
    </div>
  );
}

function Movimientos() {
  const [filtro, setFiltro] = useState("Todos");
  const list = MOVIMIENTOS.filter((m) => filtro === "Todos" || m.tipo === filtro);
  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <TopBar title="Movimientos" />
      <div className="px-4 flex gap-2 mt-3 mb-3">
        {["Todos", "Entrada", "Salida"].map((f) => (
          <Chip key={f} active={filtro === f} onClick={() => setFiltro(f)}>{f}</Chip>
        ))}
      </div>
      <div className="px-4 flex flex-col gap-2">{list.map((m) => <MovRow key={m.id} m={m} />)}</div>
    </div>
  );
}

/* ---------------------------------------------------------
   HOJA: CREAR ÍTEM NUEVO
--------------------------------------------------------- */
function CrearItemSheet({ onClose, onCreated }) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [ubicacion, setUbicacion] = useState(UBICACIONES[0]);
  const [min, setMin] = useState("");
  const [unidad, setUnidad] = useState(UNIDADES[0]);
  const nextQr = `QR-000${ITEMS.length + 1}`;
  const valido = nombre.trim().length > 0 && Number(min) > 0;

  return (
    <div className="absolute inset-0 flex items-end" style={{ background: "rgba(32,31,30,0.4)" }}>
      <div className="w-full p-4 max-h-[92%] overflow-y-auto" style={{ background: C.surface, borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
        <div className="flex items-center justify-between mb-1">
          <h3 style={{ color: C.textPrimary }} className="text-base font-semibold flex items-center gap-2">
            <PackagePlus size={18} style={{ color: C.brand }} /> Crear ítem nuevo
          </h3>
          <button onClick={onClose}><X size={18} style={{ color: C.textTertiary }} /></button>
        </div>
        <p style={{ color: C.textTertiary }} className="text-xs mb-4">
          Se creará con stock actual = 0. Después registra una entrada con motivo "Stock inicial".
        </p>

        <FieldLabel>Nombre del ítem</FieldLabel>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Mascarillas quirúrgicas"
          className="w-full mb-3 px-3 py-2.5 outline-none text-sm" style={fluentInput} />

        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <FieldLabel>Categoría</FieldLabel>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full px-3 py-2.5 outline-none text-sm" style={fluentInput}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <FieldLabel>Ubicación</FieldLabel>
            <select value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="w-full px-3 py-2.5 outline-none text-sm" style={fluentInput}>
              {UBICACIONES.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <FieldLabel>Stock mínimo</FieldLabel>
            <input type="number" step="0.01" value={min} onChange={(e) => setMin(e.target.value)} placeholder="0"
              className="w-full px-3 py-2.5 outline-none text-sm" style={{ ...fluentInput, fontFamily: MONO_STACK }} />
          </div>
          <div className="flex-1">
            <FieldLabel>Unidad de medida</FieldLabel>
            <select value={unidad} onChange={(e) => setUnidad(e.target.value)} className="w-full px-3 py-2.5 outline-none text-sm" style={fluentInput}>
              {UNIDADES.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <FieldLabel>Código QR asignado</FieldLabel>
          <QrTag code={nextQr} />
        </div>

        <PrimaryButton disabled={!valido} onClick={() => onCreated(nombre)}>Crear ítem</PrimaryButton>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   HOJA: SALIDA RÁPIDA
--------------------------------------------------------- */
function SalidaRapidaSheet({ onClose, onDone }) {
  const [itemId, setItemId] = useState(ITEMS[0].id);
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState(MOTIVOS[1]);
  const [responsable, setResponsable] = useState(RESPONSABLES[0]);
  const item = ITEMS.find((i) => i.id === Number(itemId));
  const valido = cantidad !== "" && Number(cantidad) > 0;

  return (
    <div className="absolute inset-0 flex items-end" style={{ background: "rgba(32,31,30,0.4)" }}>
      <div className="w-full p-4" style={{ background: C.surface, borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: C.textPrimary }} className="text-base font-semibold flex items-center gap-2">
            <ArrowUpCircle size={18} style={{ color: C.red }} /> Salida rápida
          </h3>
          <button onClick={onClose}><X size={18} style={{ color: C.textTertiary }} /></button>
        </div>

        <FieldLabel>Ítem</FieldLabel>
        <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="w-full mb-3 px-3 py-2.5 outline-none text-sm" style={fluentInput}>
          {ITEMS.map((i) => <option key={i.id} value={i.id}>{i.nombre} · {i.ubicacion}</option>)}
        </select>

        <div style={{ color: C.textTertiary }} className="text-xs mb-3">
          Stock actual: <span style={{ fontFamily: MONO_STACK, color: C.textPrimary }}>{item.stock} {item.unidad.toLowerCase()}</span>
        </div>

        <FieldLabel>Cantidad ({item.unidad.toLowerCase()})</FieldLabel>
        <input type="number" step="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0.00"
          className="w-full mb-3 px-3 py-2.5 outline-none text-sm" style={{ ...fluentInput, fontFamily: MONO_STACK }} />
        {cantidad !== "" && Number(cantidad) <= 0 && (
          <div style={{ color: C.red }} className="text-xs -mt-2 mb-3">La cantidad debe ser mayor que 0.</div>
        )}

        <FieldLabel>Motivo</FieldLabel>
        <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full mb-3 px-3 py-2.5 outline-none text-sm" style={fluentInput}>
          {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
        </select>

        <FieldLabel icon={User}>Responsable</FieldLabel>
        <select value={responsable} onChange={(e) => setResponsable(e.target.value)} className="w-full mb-4 px-3 py-2.5 outline-none text-sm" style={fluentInput}>
          {RESPONSABLES.map((r) => <option key={r}>{r}</option>)}
        </select>

        <PrimaryButton disabled={!valido} bg={C.red} onClick={() => onDone(responsable)}>Guardar salida</PrimaryButton>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   APP RAÍZ — incluye la cabecera del reproductor Power Apps
--------------------------------------------------------- */
export default function InventarioMockup() {
  const [tab, setTab] = useState("inicio");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCrear, setShowCrear] = useState(false);
  const [showSalida, setShowSalida] = useState(false);
  const [globalToast, setGlobalToast] = useState("");

  const openItem = (it) => setSelectedItem(it);
  const closeItem = () => setSelectedItem(null);
  const goTab = (t) => { setSelectedItem(null); setTab(t); };

  const flashToast = (msg) => { setGlobalToast(msg); setTimeout(() => setGlobalToast(""), 2400); };
  const handleCreated = (nombre) => { setShowCrear(false); flashToast(`"${nombre}" creado con stock inicial en 0`); };
  const handleSalidaDone = (responsable) => { setShowSalida(false); flashToast(`Salida registrada por ${responsable}`); };

  const tabs = [
    { key: "inicio", label: "Inicio", icon: Home },
    { key: "catalogo", label: "Catálogo", icon: LayoutGrid },
    { key: "escanear", label: "Escanear", icon: ScanLine },
    { key: "movimientos", label: "Movim.", icon: ClipboardList },
  ];

  let screen;
  if (selectedItem) {
    screen = <Detalle item={selectedItem} onBack={closeItem} />;
  } else if (tab === "inicio") {
    screen = <Inicio onOpenItem={openItem} onGoTab={goTab} onCrear={() => setShowCrear(true)} onSalidaRapida={() => setShowSalida(true)} />;
  } else if (tab === "catalogo") {
    screen = <Catalogo onOpenItem={openItem} />;
  } else if (tab === "escanear") {
    screen = <Escanear onFound={openItem} />;
  } else {
    screen = <Movimientos />;
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-8 gap-3" style={{ background: "#E1DFDD", fontFamily: FONT_STACK }}>
      <div className="text-xs font-medium" style={{ color: C.textSecondary }}>Vista previa · Reproductor de Power Apps (móvil)</div>

      <div
        className="flex flex-col"
        style={{
          position: "relative",
          width: 390,
          height: 800,
          background: C.bg,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 20px 45px -15px rgba(32,31,30,0.4)",
          border: `1px solid ${C.borderStrong}`,
        }}
      >
        {/* Cabecera del reproductor Power Apps */}
        <div className="flex items-center justify-between px-3 py-2.5" style={{ background: C.playerChrome }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)", borderRadius: 3 }}>
              <PackagePlus size={13} color="#fff" />
            </div>
            <span className="text-xs font-semibold truncate" style={{ color: "#fff" }}>Inventario Labs y Clínicas</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <RotateCw size={14} color="rgba(255,255,255,0.85)" />
            <MoreHorizontal size={16} color="rgba(255,255,255,0.85)" />
          </div>
        </div>

        {screen}

        {/* Barra inferior de navegación */}
        <div className="flex items-stretch" style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
          {tabs.map((t) => {
            const active = !selectedItem && tab === t.key;
            return (
              <button key={t.key} onClick={() => goTab(t.key)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
                <t.icon size={18} style={{ color: active ? C.brand : C.textTertiary }} />
                <span style={{ color: active ? C.brand : C.textTertiary, fontWeight: active ? 600 : 500 }} className="text-[10px]">{t.label}</span>
              </button>
            );
          })}
        </div>

        {showCrear && <CrearItemSheet onClose={() => setShowCrear(false)} onCreated={handleCreated} />}
        {showSalida && <SalidaRapidaSheet onClose={() => setShowSalida(false)} onDone={handleSalidaDone} />}

        {globalToast && (
          <div className="absolute top-3 left-4 right-4 flex items-center gap-2 px-4 py-3 text-sm font-medium" style={{ background: C.green, color: "#fff", borderRadius: 2 }}>
            <CheckCircle2 size={16} /> {globalToast}
          </div>
        )}
      </div>
    </div>
  );
}
