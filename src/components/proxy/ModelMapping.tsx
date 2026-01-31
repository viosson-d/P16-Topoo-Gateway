import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { SettingsCard } from "../settings/SettingsCard";
import { useState } from "react";

interface ModelMappingProps {
    mappings: Record<string, string>;
    onAdd: (from: string, to: string) => void;
    onRemove: (from: string) => void;
}

export function ModelMapping({ mappings, onAdd, onRemove }: ModelMappingProps) {
    const { t } = useTranslation();
    const [newItem, setNewItem] = useState({ from: '', to: '' });

    const handleAdd = () => {
        if (newItem.from && newItem.to) {
            onAdd(newItem.from, newItem.to);
            setNewItem({ from: '', to: '' });
        }
    };

    return (
        <SettingsCard
            title={t('proxy.config.zai.model_mapping_title')}
            description={t('proxy.config.zai.model_mapping_desc')}
        >
            <div className="p-4 space-y-4">
                {/* Add New Mapping */}
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/40">
                    <Input
                        placeholder={t('proxy.config.zai.model_mapping_original_placeholder')}
                        value={newItem.from}
                        onChange={(e) => setNewItem({ ...newItem, from: e.target.value })}
                        className="h-8 text-[12px] font-medium bg-background border-border/40"
                    />
                    <div className="text-muted-foreground/40 font-bold">→</div>
                    <Input
                        placeholder={t('proxy.config.zai.model_mapping_alias_placeholder')}
                        value={newItem.to}
                        onChange={(e) => setNewItem({ ...newItem, to: e.target.value })}
                        className="h-8 text-[12px] font-medium bg-background border-border/40"
                    />
                    <Button
                        size="sm"
                        onClick={handleAdd}
                        disabled={!newItem.from || !newItem.to}
                        className="h-8 px-3 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Mapping List */}
                <div className="space-y-1">
                    {Object.entries(mappings).length === 0 ? (
                        <div className="text-center py-8 text-[11px] text-muted-foreground/40 bg-muted/10 rounded-lg border border-dashed border-border/40 font-medium">
                            {t('proxy.config.zai.model_mapping_empty')}
                        </div>
                    ) : (
                        <div className="divide-y divide-border/10">
                            {Object.entries(mappings).map(([from, to]) => (
                                <div key={from} className="flex items-center justify-between py-2 group transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground/70 bg-muted/20 border-border/30 rounded-md">
                                            {from}
                                        </Badge>
                                        <span className="text-muted-foreground/30 text-[11px] font-bold">→</span>
                                        <Badge variant="secondary" className="font-mono text-[11px] bg-primary/5 text-primary border-primary/10 rounded-md">
                                            {to}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemove(from)}
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )
                    }
                </div>
            </div>
        </SettingsCard>
    );
}
