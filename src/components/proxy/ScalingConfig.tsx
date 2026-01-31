
import { Server, Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

interface ScalingConfigProps {
    protocol: string;
    instances: number;
    onProtocolChange: (protocol: string) => void;
    onInstancesChange: (instances: number) => void;
}

export function ScalingConfig({ protocol, instances, onProtocolChange, onInstancesChange }: ScalingConfigProps) {
    const protocols = [
        { id: 'openai', name: 'OpenAI', icon: '⚡' },
        { id: 'anthropic', name: 'Anthropic', icon: '🧠' },
        { id: 'gemini', name: 'Gemini', icon: '✨' },
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="space-y-1">
                    <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                        Protocol & Scaling
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Select the API protocol and number of worker instances
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">API Protocol</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {protocols.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => onProtocolChange(p.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 rounded-lg border text-sm transition-all",
                                    protocol === p.id
                                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                        : "border-border hover:bg-muted/50 hover:border-primary/50"
                                )}
                            >
                                <span className="text-lg mb-1">{p.icon}</span>
                                <span className="font-medium text-xs">{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Worker Instances</Label>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{instances}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="range"
                            min={1}
                            max={10}
                            step={1}
                            value={instances}
                            onChange={(e) => onInstancesChange(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-transparent p-0 border-0"
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        Higher instances allow more concurrent requests but consume more system resources.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
