import { AccountControlCard } from './AccountControlCard';
// import { SystemStatusCard } from './SystemStatusCard';
import { cn } from '../../lib/utils';

interface ControlHubProps {
    className?: string;
}

export function ControlHub({ className }: ControlHubProps) {

    return (
        <div className={cn("flex flex-col h-full gap-4", className)}>
            <AccountControlCard className="h-full" />
        </div>
    );
}
