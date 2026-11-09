"use client"

import { usePublicJson } from "@/features/shared/hooks/usePublicJson"
import type { ValidationData } from "@/features/validation/types/validationData"

export function useValidationData() {
  return usePublicJson<ValidationData>("/data/validation.json")
}
