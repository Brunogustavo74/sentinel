import { useEffect, useState } from "react";
import { Accessibility, Type, Contrast, Link2, MousePointer2, Pause, RotateCcw, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type A11ySettings = {
  fontScale: number; // 1, 1.15, 1.3, 1.5
  highContrast: boolean;
  underlineLinks: boolean;
  reducedMotion: boolean;
  bigCursor: boolean;
  readableFont: boolean;
};

const DEFAULTS: A11ySettings = {
  fontScale: 1,
  highContrast: false,
  underlineLinks: false,
  reducedMotion: false,
  bigCursor: false,
  readableFont: false,
};

const STORAGE_KEY = "sentinel-a11y";

function applySettings(s: A11ySettings) {
  const root = document.documentElement;
  root.style.setProperty("--a11y-font-scale", String(s.fontScale));
  root.classList.toggle("a11y-high-contrast", s.highContrast);
  root.classList.toggle("a11y-underline-links", s.underlineLinks);
  root.classList.toggle("a11y-reduced-motion", s.reducedMotion);
  root.classList.toggle("a11y-big-cursor", s.bigCursor);
  root.classList.toggle("a11y-readable-font", s.readableFont);
}

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
      setSettings(parsed);
      applySettings(parsed);
    } catch {
      applySettings(DEFAULTS);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings, ready]);

  const update = <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const fontOptions: { label: string; value: number }[] = [
    { label: "A", value: 1 },
    { label: "A+", value: 1.15 },
    { label: "A++", value: 1.3 },
    { label: "A+++", value: 1.5 },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Abrir painel de acessibilidade"
          className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
        >
          <Accessibility className="w-6 h-6" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" aria-hidden="true" />
            Acessibilidade
          </SheetTitle>
          <SheetDescription>
            Ajuste o site às suas necessidades. As preferências são salvas neste dispositivo.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-6 mt-4">
          <section aria-labelledby="a11y-font">
            <h3 id="a11y-font" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Type className="w-4 h-4" aria-hidden="true" /> Tamanho da fonte
            </h3>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Tamanho da fonte">
              {fontOptions.map((opt) => {
                const active = settings.fontScale === opt.value;
                return (
                  <button
                    key={opt.value}
                    role="radio"
                    aria-checked={active}
                    onClick={() => update("fontScale", opt.value)}
                    className={`h-12 rounded-md border text-sm font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 border-border hover:bg-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          <ToggleRow
            icon={<Contrast className="w-4 h-4" aria-hidden="true" />}
            label="Alto contraste"
            description="Aumenta o contraste entre texto e fundo."
            checked={settings.highContrast}
            onChange={(v) => update("highContrast", v)}
          />

          <ToggleRow
            icon={<Link2 className="w-4 h-4" aria-hidden="true" />}
            label="Destacar links"
            description="Sublinha todos os links da interface."
            checked={settings.underlineLinks}
            onChange={(v) => update("underlineLinks", v)}
          />

          <ToggleRow
            icon={<Pause className="w-4 h-4" aria-hidden="true" />}
            label="Reduzir animações"
            description="Desativa transições e animações."
            checked={settings.reducedMotion}
            onChange={(v) => update("reducedMotion", v)}
          />

          <ToggleRow
            icon={<MousePointer2 className="w-4 h-4" aria-hidden="true" />}
            label="Cursor grande"
            description="Aumenta o cursor do mouse."
            checked={settings.bigCursor}
            onChange={(v) => update("bigCursor", v)}
          />

          <ToggleRow
            icon={<Type className="w-4 h-4" aria-hidden="true" />}
            label="Fonte para dislexia"
            description="Usa uma fonte com espaçamento mais legível."
            checked={settings.readableFont}
            onChange={(v) => update("readableFont", v)}
          />

          <div className="pt-2 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSettings(DEFAULTS)}
            >
              <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" /> Restaurar
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              <X className="w-4 h-4 mr-2" aria-hidden="true" /> Fechar
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Dica: pressione <kbd className="px-1 py-0.5 bg-muted rounded border border-border">Tab</kbd> para navegar pelo teclado. Use o link "Pular para conteúdo" no topo da página.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium flex items-center gap-2 cursor-pointer">
          {icon} {label}
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
