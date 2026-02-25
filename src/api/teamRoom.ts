import request from './request'

export interface TeamRoomModeInfo {
  mode: string
  duration: number
  problems: number[]
}

export interface TeamRoomPlayerInfo {
  user_id: string
  username: string
  join_at: number
}

export interface TeamRoomProblemInfo {
  problem_id: string
  problem_url: string
  difficulty: number
  solved: boolean
  solved_by: string
  penalty: number
  solved_at: number
}

export interface TeamRoomInfo {
  room_id: string
  mode: string
  status: number
  created_at: string
  end_time: number
  players: TeamRoomPlayerInfo[]
  problems: TeamRoomProblemInfo[]
  score: number
  duration: number
}

export interface TeamRoomListItem {
  room_id: string
  mode: string
  status: number
  created_at: string
  end_time: number
  player_count: number
  problem_count: number
}

export interface TeamRoomCreateResp {
  room: TeamRoomInfo
}

export interface TeamRoomInfoResp {
  room: TeamRoomInfo
}

export interface TeamRoomListResp {
  total: number
  rooms: TeamRoomListItem[]
}

export interface TeamRoomModeListResp {
  modes: TeamRoomModeInfo[]
}

export const listTeamRoomModes = () => {
  return request<any, TeamRoomModeListResp>({
    url: '/team-room/modes',
    method: 'get',
  })
}

export const createTeamRoom = (mode: string) => {
  return request<any, TeamRoomCreateResp>({
    url: '/team-room/room',
    method: 'post',
    data: { mode },
  })
}

export const getTeamRoomInfo = (roomId: string) => {
  return request<any, TeamRoomInfoResp>({
    url: '/team-room/room',
    method: 'get',
    params: { room_id: roomId },
  })
}

export const listTeamRooms = (params?: { page?: number; limit?: number; status?: number }) => {
  return request<any, TeamRoomListResp>({
    url: '/team-room/rooms',
    method: 'get',
    params,
  })
}
