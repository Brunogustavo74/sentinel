import { PortalShell } from "@/components/portal/PortalShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";

interface Col {
  key: string;
  label: string;
}
interface Props {
  title: string;
  subtitle: string;
  columns: Col[];
  rows: Record<string, string>[];
  actionLabel?: string;
}

export function PortalListPage({ title, subtitle, columns, rows, actionLabel = "Novo" }: Props) {
  return (
    <PortalShell title={title}>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar…" className="pl-8 w-64" />
          </div>
          <Button><Plus className="w-4 h-4 mr-2" /> {actionLabel}</Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs text-muted-foreground">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border hover:bg-muted/30">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    {c.key === "status" ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {r[c.key]}
                      </Badge>
                    ) : (
                      <span className={c.key === "nome" || c.key === "id" ? "font-medium" : "text-muted-foreground"}>
                        {r[c.key]}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PortalShell>
  );
}
