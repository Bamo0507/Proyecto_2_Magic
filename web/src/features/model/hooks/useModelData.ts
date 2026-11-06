"use client"

import { usePublicJson } from "@/features/shared/hooks/usePublicJson"
import type { ModelData } from "@/features/model/types/modelData"

export function useModelData() {
  return usePublicJson<ModelData>("/data/model.json")
}
