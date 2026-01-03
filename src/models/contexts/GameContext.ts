import type { USPlayer } from "../UpdateState/USPlayer"

export interface GameContext {
    arena: string;
    isOT: boolean;
    isReplay: boolean;
    target: string;
    timeRemaining: number;
    hasWinner: boolean;
    winner: string;
    players: USPlayer[];
    score: {
        blue: number;
        orange: number;
    };
    seriesScore: {
    blue: number;
    orange: number;
    };
    currentGameNumber: number;
    seriesLength: 5 | 7;
    winningTeamNum: number | null;
    mvp?: USPlayer;
    blueTimeoutAvailable: boolean;
    orangeTimeoutAvailable: boolean;
    topBarText: string;
};