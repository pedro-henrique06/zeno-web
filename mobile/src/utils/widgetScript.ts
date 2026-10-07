/**
 * Builds the Scriptable script for the iPhone home-screen widget.
 * The API base URL and the personal widget key are embedded so the user only pastes it.
 */
export function buildWidgetScript(apiBase: string, key: string): string {
  return `// Zeno - widget da tela inicial (Scriptable)
const API = ${JSON.stringify(apiBase)};
const KEY = ${JSON.stringify(key)};
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";

const NAVY = new Color("#1B2D48");
const GREEN = new Color("#2DC579");
const RED = new Color("#E86B52");
const TEAL = new Color("#5ECCC8");
const MUTED = new Color("#FFFFFF", 0.55);
const LOCALES = { PtBR: "pt-BR", EnUS: "en-US", Es: "es-ES" };
const LABELS = {
  PtBR: { today: "DISPONÍVEL HOJE", month: "Saldo do mês", goal: "Meta" },
  EnUS: { today: "AVAILABLE TODAY", month: "Month balance", goal: "Goal" },
  Es: { today: "DISPONIBLE HOY", month: "Saldo del mes", goal: "Meta" },
};

async function load() {
  const req = new Request(API + "/widget/summary?tz=" + encodeURIComponent(TZ));
  req.headers = { "X-Widget-Key": KEY };
  let json = null;
  try {
    json = await req.loadJSON();
  } catch (e) {}
  const status = req.response ? req.response.statusCode : 0;
  if (status === 401) throw new Error("Chave inválida ou revogada");
  if (!json || status < 200 || status >= 300 || !json.success) throw new Error("Erro " + status);
  return json.data;
}

function bar(percent, width, height) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  ctx.setFillColor(new Color("#FFFFFF", 0.14));
  ctx.addPath(roundedPath(0, 0, width, height));
  ctx.fillPath();
  const filled = Math.max(height, (width * Math.min(percent, 100)) / 100);
  ctx.setFillColor(GREEN);
  ctx.addPath(roundedPath(0, 0, filled, height));
  ctx.fillPath();
  return ctx.getImage();
}

function roundedPath(x, y, w, h) {
  const p = new Path();
  p.addRoundedRect(new Rect(x, y, w, h), h / 2, h / 2);
  return p;
}

async function build() {
  const w = new ListWidget();
  w.backgroundColor = NAVY;
  w.setPadding(14, 16, 14, 16);
  w.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);

  let d;
  try {
    d = await load();
  } catch (e) {
    const t = w.addText("Zeno");
    t.textColor = Color.white();
    t.font = Font.boldSystemFont(15);
    const m = w.addText(String(e.message || e));
    m.textColor = RED;
    m.font = Font.systemFont(12);
    return w;
  }

  const fmt = new Intl.NumberFormat(LOCALES[d.language] || "pt-BR", {
    style: "currency",
    currency: d.currency || "BRL",
    maximumFractionDigits: 0,
  });
  const L = LABELS[d.language] || LABELS.PtBR;
  const family = config.widgetFamily || "medium";

  const head = w.addText("Zeno.");
  head.textColor = Color.white();
  head.font = new Font("Georgia-Bold", 13);

  w.addSpacer(6);

  if (d.dailyBudget > 0) {
    const label = w.addText(L.today);
    label.textColor = MUTED;
    label.font = Font.boldSystemFont(9);
    const value = w.addText(fmt.format(d.availableToday));
    value.textColor = d.availableToday >= 0 ? GREEN : RED;
    value.font = new Font("Georgia-Bold", family === "small" ? 24 : 28);
    value.minimumScaleFactor = 0.6;
    w.addSpacer(6);
  }

  const mLabel = w.addText(L.month);
  mLabel.textColor = MUTED;
  mLabel.font = Font.boldSystemFont(9);
  const mValue = w.addText(fmt.format(d.monthBalance));
  mValue.textColor = d.monthBalance >= 0 ? Color.white() : RED;
  mValue.font = new Font("Georgia-Bold", d.dailyBudget > 0 ? 17 : 26);
  mValue.minimumScaleFactor = 0.6;

  if (d.goal && family !== "small") {
    w.addSpacer(8);
    const g = w.addText(L.goal + " · " + d.goal.name + " · " + Math.round(d.goal.progressPercent) + "%");
    g.textColor = MUTED;
    g.font = Font.systemFont(10);
    g.lineLimit = 1;
    w.addSpacer(3);
    const img = w.addImage(bar(d.goal.progressPercent, 280, 8));
    img.imageSize = new Size(280, 8);
  }

  return w;
}

const widget = await build();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentMedium();
}
Script.complete();
`;
}
