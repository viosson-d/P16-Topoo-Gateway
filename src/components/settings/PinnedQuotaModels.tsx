import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import { PinnedQuotaModelsConfig } from '../../types/config';

interface PinnedQuotaModelsProps {
    config: PinnedQuotaModelsConfig;
    onChange: (config: PinnedQuotaModelsConfig) => void;
}

const PinnedQuotaModels = ({ config, onChange }: PinnedQuotaModelsProps) => {

    const toggleModel = (model: string) => {
        const currentModels = config.models || [];
        let newModels: string[];

        if (currentModels.includes(model)) {
            // 至少保留一个模型
            if (currentModels.length <= 1) return;
            newModels = currentModels.filter(m => m !== model);
        } else {
            newModels = [...currentModels, model];
        }

        onChange({ ...config, models: newModels });
    };

    const modelOptions = [
        { id: 'gemini-3-pro-high', label: 'G3 Pro', desc: 'Gemini 3 Pro High' },
        { id: 'gemini-3-flash', label: 'G3 Flash', desc: 'Gemini 3 Flash' },
        { id: 'gemini-3-pro-image', label: 'G3 Image', desc: 'Gemini 3 Pro Image' },
        { id: 'claude-sonnet-4-5-thinking', label: 'Claude 4.5', desc: 'Claude Sonnet 4.5 Thinking' }
    ];

    return (
        <div className="p-3">
            <div className="grid grid-cols-4 gap-2">
                {modelOptions.map((model) => {
                    const isSelected = config.models?.includes(model.id);
                    return (
                        <div
                            key={model.id}
                            onClick={() => toggleModel(model.id)}
                            className={cn(
                                "flex items-center justify-between p-2 rounded-md border cursor-pointer transition-all duration-200",
                                isSelected
                                    ? "bg-secondary/50 border-secondary-foreground/20 text-foreground"
                                    : "bg-background border-border hover:border-border/80 text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            <div className="flex flex-col min-w-0 overflow-hidden">
                                <span className={cn("text-[11px] font-medium truncate", isSelected ? "text-foreground" : "text-muted-foreground")}>
                                    {model.label}
                                </span>
                                <span className="text-[9px] text-muted-foreground/60 mt-0.5 truncate pr-1">
                                    {model.desc}
                                </span>
                            </div>
                            {isSelected && (
                                <div className="w-3 h-3 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
                                    <Check size={8} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PinnedQuotaModels;
