import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// 这是一个简化的示例，展示如何用 shadcn UI 重构账号卡片
export function AccountCardShadcnExample() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>example@gmail.com</span>
                    <Badge>活跃</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Gemini Pro 配额 */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gemini Pro</span>
                        <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                </div>

                {/* Gemini Flash 配额 */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gemini Flash</span>
                        <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-4">
                    <Button className="flex-1" size="sm">切换到此账号</Button>
                    <Button variant="outline" size="sm">刷新</Button>
                    <Button variant="destructive" size="sm">删除</Button>
                </div>
            </CardContent>
        </Card>
    )
}
