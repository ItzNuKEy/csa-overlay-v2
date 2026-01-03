import { useEffect, useState, useContext } from "react";
import {
  StatfeedContainer,
  StatfeedItem,
  IconWrapper,
  PlayerName,
} from "./StatfeedEvents.style";
import { TeamDataContext } from "../../contexts/ConsoleInfoContext";

// Icon imports
import DemolishIcon from "../../assets/RLIconsSVG/stat-icons/demolition.svg";
import SaveIcon from "../../assets/RLIconsSVG/stat-icons/save.svg";
import EpicSaveIcon from "../../assets/RLIconsSVG/stat-icons/epic-save.svg";
import AssistIcon from "../../assets/RLIconsSVG/stat-icons/assist.svg";
import GoalIcon from "../../assets/RLIconsSVG/stat-icons/goal.svg";
import HatTrickIcon from "../../assets/RLIconsSVG/stat-icons/hat-trick.svg";
import ShotIcon from "../../assets/RLIconsSVG/stat-icons/shot-on-goal.svg";
import LongGoalIcon from "../../assets/RLIconsSVG/stat-icons/long-goal.svg";
import SaviorIcon from "../../assets/RLIconsSVG/stat-icons/savior.svg";

const eventIconMap: Record<string, string> = {
  Demolish: DemolishIcon,
  Save: SaveIcon,
  Savior: SaviorIcon,
  EpicSave: EpicSaveIcon,
  Assist: AssistIcon,
  Goal: GoalIcon,
  HatTrick: HatTrickIcon,
  Shot: ShotIcon,
  LongGoal: LongGoalIcon,
};

const allowedEvents = [
  "Demolish",
  "Goal",
  "Assist",
  "Save",
  "EpicSave",
  "HatTrick",
  "LongGoal",
  "Savior",
];

interface FakeEvent {
  id: number;
  event_name: string;
  main_target: { name: string; team_num: number };
  secondary_target?: { name: string; team_num: number };
}

export const StatfeedEventMock = () => {
  const { blueTeam, orangeTeam } = useContext(TeamDataContext);
  const [events, setEvents] = useState<FakeEvent[]>([]);

  useEffect(() => {
    // 🔹 Generate fake events for preview
    const fakeNames = ["NuKEy", "Frost", "Echo", "Luna", "Kaze", "Volt"];
    const generated = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      event_name: allowedEvents[i % allowedEvents.length],
      main_target: {
        name: fakeNames[i % fakeNames.length],
        team_num: i % 2,
      },
      secondary_target:
        i % 3 === 0
          ? {
              name: fakeNames[(i + 1) % fakeNames.length],
              team_num: (i + 1) % 2,
            }
          : undefined,
    }));
    setEvents(generated);
  }, []);

  // 🔸 Optional sequential fade-in effect
  useEffect(() => {
    events.forEach((_, i) => {
      const el = document.getElementById(`mock-stat-${i}`);
      if (el) {
        el.style.opacity = "0";
        setTimeout(() => (el.style.opacity = "1"), i * 500);
      }
    });
  }, [events]);

  const getPlayerStyle = (teamNum?: number) => {
    if (teamNum === 0)
      return {
        background: blueTeam.gradient,
        borderColor: blueTeam.borderColor,
        color: "#fff",
        padding: "4px 8px",
      };
    if (teamNum === 1)
      return {
        background: orangeTeam.gradient,
        borderColor: orangeTeam.borderColor,
        color: "#fff",
        padding: "4px 8px",
      };
    return {
      background: "#ccc",
      borderColor: "#999",
      color: "#fff",
      padding: "4px 8px",
    };
  };

  return (
    <StatfeedContainer>
      {events.map((event) => (
        <StatfeedItem key={event.id} id={`mock-stat-${event.id}`}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {event.event_name === "Demolish" ? (
              <>
                <PlayerName style={getPlayerStyle(event.main_target?.team_num)}>
                  {event.main_target?.name}
                </PlayerName>

                <IconWrapper roundLeftCorners={false}>
                  <img
                    src={eventIconMap[event.event_name]}
                    alt=""
                    style={{ width: 30, height: 30, filter: "invert(1)" }}
                  />
                </IconWrapper>

                <PlayerName
                  style={getPlayerStyle(event.secondary_target?.team_num)}
                >
                  {event.secondary_target?.name || "Unknown"}
                </PlayerName>
              </>
            ) : (
              <>
                <IconWrapper roundLeftCorners={true}>
                  <img
                    src={eventIconMap[event.event_name]}
                    alt=""
                    style={{ width: 30, height: 30, filter: "invert(1)" }}
                  />
                </IconWrapper>

                <PlayerName style={getPlayerStyle(event.main_target?.team_num)}>
                  {event.main_target?.name}
                  {event.secondary_target?.name &&
                    ` → ${event.secondary_target.name}`}
                </PlayerName>
              </>
            )}
          </div>
        </StatfeedItem>
      ))}
    </StatfeedContainer>
  );
};
