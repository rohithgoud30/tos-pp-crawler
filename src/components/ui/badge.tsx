import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  "inline-flex cursor-default items-center gap-1 truncate whitespace-nowrap [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 border rounded-full text-xs font-medium outline-none",
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-black text-white dark:bg-white dark:text-black [a&]:hover:bg-gray-800 dark:[a&]:hover:bg-gray-200',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/80',
        outline: 'text-foreground [a&]:hover:bg-accent',
      },
      size: {
        default: 'px-2.5 py-0.5',
        sm: 'px-1.5 py-0 h-5',
        lg: 'px-3.5 py-1 h-7 text-[13px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      data-slot='badge'
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
