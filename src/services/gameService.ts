import type { USPlayer } from "../models/UpdateState/USPlayer"
import type { GoalScored } from "../models/GoalScored/GoalScored";
import type { StatfeedEvent } from "../models/StatfeedEvent/StatfeedEvent";
import { WebsocketService } from "../services/websocketService";

const getOrangeTeam = (players: USPlayer[]): USPlayer[] => {
    return players.filter((player) => player.team === 1);
};

const getBlueTeam = (players: USPlayer[]): USPlayer[] => {
    return players.filter((player) => player.team === 0);
};

const getPlayerFromTarget = (players: USPlayer[], target: string): USPlayer | undefined => {
    return players.find((player) => target.includes(player.name));
};

const getClockFromSeconds = (seconds: number, isOT: boolean): string => {
    const numMinutes = Math.floor(seconds / 60);
    const numSeconds = seconds - numMinutes * 60;
    const secondsString = 
    numSeconds > 9 ? numSeconds.toString() : `0${numSeconds}`;
    return isOT 
    ? `+${numMinutes}:${secondsString}` 
    :  `${numMinutes}:${secondsString}`;
};

const getScoreFromPlayers = (players: USPlayer[]) => {
    return players.map((player) => player.score);
};

const getGoalsFromPlayers = (players: USPlayer[]): number[] => {
    return players.map((player) => player.goals);
};

const getAssistsFromPlayers = (players: USPlayer[]) => {
    return players.map((player) => player.assists);
};

const getShotsFromPlayers = (players: USPlayer[]) => {
    return players.map((player) => player.shots);
};

const getSavesFromPlayers = (players: USPlayer[]) => {
    return players.map((player) => player.saves);
};

const getDemosFromPlayers = (players: USPlayer[]) => {
    return players.map((player) => player.demos);
};

// In GameService.ts

let latestGoal: GoalScored | null = null;

const replayTagService = {
  init() {
    WebsocketService.subscribe("game", "goal_scored", (goalState: GoalScored) => {
      latestGoal = {
        scorer: {
          id: goalState.scorer.id,
          name: goalState.scorer.name,
          teamnum: goalState.scorer.teamnum
        },
        assister: goalState.assister?.name ? { name: goalState.assister.name } : undefined,
        goalspeed: goalState.goalspeed ?? 0,
        ball_last_touch: goalState.ball_last_touch,
        impact_location: goalState.impact_location
      };

      console.log("[GameService] New goal recorded:", latestGoal);
    });
  },

  getLatestGoal(): GoalScored | null {
    return latestGoal;
  },

  clearLatestGoal() {
    latestGoal = null;
  }
};

interface TeamPlayerStats {
  names: string[];
  goals: number[];
  assists: number[];
  saves: number[];
  shots: number[];
  score: number[];
  demos: number[];
}

interface EndgamePlayerStats {
  blue: TeamPlayerStats;
  orange: TeamPlayerStats;
}

export const getEndgamePlayerStats = (players: USPlayer[]): EndgamePlayerStats => {
  const getTeamStats = (teamNum: 0 | 1): TeamPlayerStats => {
    const teamPlayers = players.filter(player => player.team === teamNum);

    return {
      names: teamPlayers.map(player => player.name),
      goals: teamPlayers.map(player => player.goals),
      assists: teamPlayers.map(player => player.assists),
      saves: teamPlayers.map(player => player.saves),
      shots: teamPlayers.map(player => player.shots),
      score: teamPlayers.map(player => player.score),
      demos: teamPlayers.map(player => player.demos),
    };
  };

  return {
    blue: getTeamStats(0),
    orange: getTeamStats(1),
  };
};

export const getMVPFromWinningTeam = (players: USPlayer[], winningTeamNum: 0 | 1): USPlayer | undefined => {
  const teamPlayers = players.filter(p => p.team === winningTeamNum);
  if (teamPlayers.length === 0) return undefined;
  return teamPlayers.reduce((top, curr) =>
    (curr.score ?? 0) > (top.score ?? 0) ? curr : top
  );
};

let statfeedEvents: StatfeedEvent[] = [];
const MAX_EVENTS = 3; // max notifications shown at once

const statfeedEventService = {
  init() {
    WebsocketService.subscribe("game", "statfeed_event", (event: StatfeedEvent) => {
      // Add new event to front
      statfeedEvents.unshift(event);

      // Keep max limit
      if (statfeedEvents.length > MAX_EVENTS) {
        statfeedEvents.pop();
      }
      
      console.log("[GameService] New statfeed event:", event);
    });
  },

  getEvents(): StatfeedEvent[] {
    return statfeedEvents;
  },

  clearEvents() {
    statfeedEvents = [];
  }
};

export const GameService = {
    getOrangeTeam,
    getBlueTeam,
    getPlayerFromTarget,
    getClockFromSeconds,
    getScoreFromPlayers,
    getGoalsFromPlayers,
    getAssistsFromPlayers,
    getShotsFromPlayers,
    getSavesFromPlayers,
    getDemosFromPlayers,
    replayTagService,
    getEndgamePlayerStats,
    getMVPFromWinningTeam,
    statfeedEventService,
};

