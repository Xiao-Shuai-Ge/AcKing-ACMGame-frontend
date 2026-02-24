import request from './request'

export interface SinglePlayerRoomInfo {
  room_id: string
  user_id: string
  problem_id: string
  problem_url: string
  problem_difficulty: number
  status: number
  penalty: number
  performance_score: number
  rating_before: number
  rating_after: number
  created_at: string
  end_time: number
}

export interface SinglePlayerCreateResp {
  room: SinglePlayerRoomInfo
}

export interface SinglePlayerRoomInfoResp {
  room: SinglePlayerRoomInfo
}

export interface SinglePlayerAbandonResp {
  room: SinglePlayerRoomInfo
}

export const createSinglePlayerRoom = () => {
  return request<any, SinglePlayerCreateResp>({
    url: '/single-player/room',
    method: 'post',
  })
}

export const getSinglePlayerRoomInfo = (roomId: string) => {
  return request<any, SinglePlayerRoomInfoResp>({
    url: '/single-player/room',
    method: 'get',
    params: { room_id: roomId },
  })
}

export const abandonSinglePlayerRoom = (roomId: string) => {
  return request<any, SinglePlayerAbandonResp>({
    url: '/single-player/room/abandon',
    method: 'post',
    data: { room_id: roomId },
  })
}
