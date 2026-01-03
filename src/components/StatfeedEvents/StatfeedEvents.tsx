import { useEffect, useState } from "react";
import { StatfeedEvent as StatfeedEventType } from "../../models/StatfeedEvent/StatfeedEvent";
import {
  StatfeedContainer,
  StatfeedItem,
  IconWrapper,
  PlayerName
} from "./StatfeedEvents.style";
// import { TeamDataContext } from "../../contexts/ConsoleInfoContext";

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
import { universalColors } from "../../constants/universalColor";

// 👇 Define icon mapping
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

// 👇 Events to show
const allowedEvents = [
  "Demolish",
  "Goal",
  "Assist",
  "Save",
  "EpicSave",
  "HatTrick",
  "LongGoal",
  "Savior", // optional if you want it too
];
interface TimedStatfeed {
  id: number;
  event: StatfeedEventType;
}

interface Props {
  events: TimedStatfeed[];
  removeEvent: (id: number) => void;
}

export const StatfeedEvent = ({ events, removeEvent }: Props) => {
  const maxVisibleEvents = 3; // or whatever fits your space

const filteredEvents = events
  .filter((e) => allowedEvents.includes(e.event.event_name))
  .slice(0, maxVisibleEvents);


  return (
    <StatfeedContainer>
      {filteredEvents.map(({ id, event }) => (
        <StatfeedEventItem key={id} id={id} event={event} removeEvent={removeEvent} />
      ))}
    </StatfeedContainer>
  );
};

const StatfeedEventItem = ({
  id,
  event,
  removeEvent,
}: {
  id: number;
  event: StatfeedEventType;
  removeEvent: (id: number) => void;
}) => {
  // const { blueTeam, orangeTeam } = useContext(TeamDataContext);
  const [fadeOut, setFadeOut] = useState(false);
  const { BlueTeam, OrangeTeam } = universalColors;

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    return () => {
      clearTimeout(fadeTimer);
    };
  }, []);

  const handleAnimationEnd = () => {
    if (fadeOut) removeEvent(id);
  };

  const getPlayerStyle = (teamNum?: number) => {
  if (teamNum === 0) {
    return {
      background: BlueTeam.gradient, // gradient now
      borderColor: BlueTeam.borderColor,
      color: "#fff",
      padding: "4px 8px",
    };
  }
  if (teamNum === 1) {
    return {
      background: OrangeTeam.gradient, // gradient now
      borderColor: OrangeTeam.borderColor,
      color: "#fff",
      padding: "4px 8px",
    };
  }
  return {
    background: "#ccc",
    borderColor: "#999",
    color: "#fff",
    padding: "4px 8px",
  };
};

  return (
    <StatfeedItem
      className={fadeOut ? "fade-out" : ""}
      onAnimationEnd={handleAnimationEnd}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {event.event_name === "Demolish" ? (
  <>
    <PlayerName style={getPlayerStyle(event.main_target?.team_num)}>
      {event.main_target?.name || "Unknown"}
    </PlayerName>

    <IconWrapper roundLeftCorners={false}>
      <img
        src={eventIconMap[event.event_name]}
        alt=""
        style={{ width: 30, height: 30, filter: "invert(1)" }}
      />
    </IconWrapper>

    <PlayerName style={getPlayerStyle(event.secondary_target?.team_num)}>
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
      {event.main_target?.name || "Unknown"}
      {event.secondary_target?.name &&
        ` → ${event.secondary_target.name}`}
    </PlayerName>
  </>
)}
      </div>
    </StatfeedItem>
  );
};
