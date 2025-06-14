
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Collapsible = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>, "value" | "onValueChange" | "type" | "collapsible"> & {
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ className, children, open: openProp, defaultOpen, onOpenChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen ?? false)
  // Ensure uniqueId is stable and suitable for AccordionItem value. Fallback for older React if useId isn't available.
  const internalId = React.useId ? React.useId() : `collapsible-item-${Math.random().toString(36).substr(2, 9)}`;

  React.useEffect(() => {
    if (openProp !== undefined) {
      setIsOpen(openProp)
    }
  }, [openProp])

  const handleValueChange = (value: string) => {
    // value will be the internalId if the item is opened, or "" if closed
    const newOpenState = value === internalId
    if (openProp === undefined) { // Only update internal state if not controlled
      setIsOpen(newOpenState)
    }
    onOpenChange?.(newOpenState)
  }

  const accordionValue = isOpen ? internalId : ""

  return (
    <AccordionPrimitive.Root
      ref={ref}
      type="single"
      collapsible
      className={cn(className)}
      value={accordionValue}
      onValueChange={handleValueChange}
      {...props}
    >
      {/* This Item wrapper is crucial for the context */}
      <AccordionPrimitive.Item value={internalId} className="border-none">
        {children}
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  )
})
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
CollapsibleTrigger.displayName = AccordionPrimitive.Trigger.displayName

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    {/* The div wrapper is important for animations that change height */}
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
CollapsibleContent.displayName = AccordionPrimitive.Content.displayName

// This export is mostly for API consistency if a full Accordion was being built,
// not directly used by the typical single Collapsible pattern from the parent component.
const CollapsibleItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)} // Default ShadCN styling for an item if used directly
    {...props}
  />
));
CollapsibleItem.displayName = "CollapsibleItem";

export { Collapsible, CollapsibleTrigger, CollapsibleContent, CollapsibleItem }
