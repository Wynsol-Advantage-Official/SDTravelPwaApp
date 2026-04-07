import apiClient from "./client"
import type { Room } from "@/types/tour"

export async function fetchRoom(
  id: string,
): Promise<Room | null> {
  const { data } = await apiClient.get("/api/wix/debug/rooms", {
    params: { id },
  })
  return data?.room ?? data ?? null
}
