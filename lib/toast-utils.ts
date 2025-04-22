"use client"

// This file provides a simplified toast API that works with sonner
import { toast as sonnerToast } from "sonner"

export const toast = {
  // Basic toast with title and description
  default: (props: { title: string; description?: string }) => {
    return sonnerToast(props.title, {
      description: props.description,
    })
  },

  // Success toast
  success: (props: { title: string; description?: string }) => {
    return sonnerToast.success(props.title, {
      description: props.description,
    })
  },

  // Error toast
  error: (props: { title: string; description?: string }) => {
    return sonnerToast.error(props.title, {
      description: props.description,
    })
  },

  // Warning toast
  warning: (props: { title: string; description?: string }) => {
    return sonnerToast(props.title, {
      description: props.description,
      className: "bg-yellow-50 text-yellow-900 border-yellow-200",
    })
  },

  // Destructive toast (similar to error)
  destructive: (props: { title: string; description?: string }) => {
    return sonnerToast.error(props.title, {
      description: props.description,
    })
  },
}

// Hook to use toast (for compatibility with existing code)
export function useToast() {
  return {
    toast,
  }
}
