"use client"

import { useEffect } from "react"
import { usePageTitle } from "@/components/page-title-provider"

export function PageTitleSetter({ title }: { title: string }) {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle(title)
  }, [title, setTitle])

  return null
}
