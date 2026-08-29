const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(status, detail) {
    const message = typeof detail === "string" ? detail : detail?.message || `Request failed (${status})`;
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export function isTournamentFinished(err) {
  return err instanceof ApiError && err.status === 403 && err.detail?.code === "TOURNAMENT_FINISHED";
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) throw new ApiError(res.status, data?.detail);
  return data;
}

const sessionHeaders = (sessionId) => ({ "X-Session-ID": sessionId });
const adminHeaders = (password) => ({ "X-Admin-Password": password });

export const api = {
  registerSession: (teamName) =>
    request("/sessions", { method: "POST", body: { team_name: teamName } }),

  getMyPromptmon: (sessionId) =>
    request("/promptmons/me", { headers: sessionHeaders(sessionId) }),

  createPromptmon: (sessionId, promptmon) =>
    request("/promptmons", {
      method: "POST",
      body: promptmon,
      headers: sessionHeaders(sessionId),
    }),

  getWaitingStatus: () => request("/tournament/waiting-status"),

  getCurrentMatch: (sessionId) =>
    request("/matches/current", { headers: sessionHeaders(sessionId) }),

  getMatchStatus: (sessionId, matchId) =>
    request(`/matches/${matchId}/status`, { headers: sessionHeaders(sessionId) }),

  submitPrompt: (sessionId, matchId, prompt) =>
    request(`/matches/${matchId}/prompts`, {
      method: "POST",
      body: { prompt },
      headers: sessionHeaders(sessionId),
    }),

  finishBattle: (sessionId, matchId) =>
    request(`/matches/${matchId}/finish`, {
      method: "POST",
      headers: sessionHeaders(sessionId),
    }),

  getCurrentBossBattle: (sessionId) =>
    request("/boss-battles/current", { headers: sessionHeaders(sessionId) }),

  submitBossPrompt: (sessionId, bossBattleId, prompt) =>
    request(`/boss-battles/${bossBattleId}/prompts`, {
      method: "POST",
      body: { prompt },
      headers: sessionHeaders(sessionId),
    }),

  finishBossBattle: (sessionId, bossBattleId) =>
    request(`/boss-battles/${bossBattleId}/finish`, {
      method: "POST",
      headers: sessionHeaders(sessionId),
    }),

  getLeaderboard: () => request("/leaderboard"),

  adminLogin: (password) =>
    request("/admin/login", { method: "POST", headers: adminHeaders(password) }),

  getTeams: (password) =>
    request("/admin/teams", { headers: adminHeaders(password) }),

  startTournament: (password) =>
    request("/admin/start-tournament", { method: "POST", headers: adminHeaders(password) }),

  startRound3: (password) =>
    request("/admin/start-round-3", { method: "POST", headers: adminHeaders(password) }),

  startFinal: (password) =>
    request("/admin/start-final", { method: "POST", headers: adminHeaders(password) }),

  endTournament: (password) =>
    request("/admin/end-tournament", { method: "POST", headers: adminHeaders(password) }),
};