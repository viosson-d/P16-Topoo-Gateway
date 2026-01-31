"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

const AccordionContext = React.createContext<{
    value: string | string[];
    onValueChange: (value: string) => void;
    type: "single" | "multiple";
} | null>(null)

interface AccordionProps {
    type?: "single" | "multiple"
    value?: string | string[]
    defaultValue?: string | string[]
    onValueChange?: (value: string | string[]) => void
    children: React.ReactNode
    className?: string
}

const Accordion = ({
    type = "single",
    value: controlledValue,
    defaultValue,
    onValueChange,
    children,
    className,
}: AccordionProps) => {
    const [value, setValue] = React.useState<string | string[]>(
        controlledValue || defaultValue || (type === "single" ? "" : [])
    )

    React.useEffect(() => {
        if (controlledValue !== undefined) {
            setValue(controlledValue)
        }
    }, [controlledValue])

    const handleValueChange = (itemValue: string) => {
        let newValue: string | string[]

        if (type === "single") {
            newValue = value === itemValue ? "" : itemValue
        } else {
            const current = Array.isArray(value) ? value : []
            newValue = current.includes(itemValue)
                ? current.filter((v) => v !== itemValue)
                : [...current, itemValue]
        }

        if (controlledValue === undefined) {
            setValue(newValue)
        }
        onValueChange?.(newValue)
    }

    return (
        <AccordionContext.Provider value={{ value, onValueChange: handleValueChange, type }}>
            <div className={cn("space-y-1", className)}>{children}</div>
        </AccordionContext.Provider>
    )
}

const AccordionItem = ({
    value,
    className,
    children,
}: {
    value: string
    className?: string
    children: React.ReactNode
}) => {
    return (
        <div className={cn("border bg-card rounded-lg", className)}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { "data-value": value } as any)
                }
                return child
            })}
        </div>
    )
}

const AccordionTrigger = ({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLButtonElement>) => {
    const ctx = React.useContext(AccordionContext)
    // @ts-ignore
    const value = props["data-value"]
    const isOpen = Array.isArray(ctx?.value) ? ctx?.value.includes(value) : ctx?.value === value

    return (
        <button
            onClick={() => ctx?.onValueChange(value)}
            className={cn(
                "flex flex-1 items-center justify-between py-4 px-6 font-medium transition-all hover:bg-muted/50 rounded-t-lg data-[state=open]:bg-muted/30",
                className
            )}
            data-state={isOpen ? "open" : "closed"}
            {...props}
        >
            {children}
            <ChevronDown
                className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                )}
            />
        </button>
    )
}

const AccordionContent = ({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const ctx = React.useContext(AccordionContext)
    // @ts-ignore
    const value = props["data-value"]
    const isOpen = Array.isArray(ctx?.value) ? ctx?.value.includes(value) : ctx?.value === value

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                >
                    <div className={cn("px-6 pb-4 pt-0", className)}>{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
