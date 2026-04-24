export const STARTER_MISSION_ID = "mission-1-starter-reward-journey";
export const BIG_REWARD_MISSION_ID = "mission-2-big-reward-journey";
export const COMING_SOON_MISSION_ID = "mission-coming-soon";

export const STARTER_MILESTONES = [
  {
    id: "mission-1-milestone-1",
    label: "Milestone 1",
    desktop: { top: "8%", left: "76%" },
    cardSide: "left",
    mobileAlign: "right",
  },
  {
    id: "mission-1-milestone-2",
    label: "Milestone 2",
    desktop: { top: "22%", left: "57%" },
    cardSide: "left",
    mobileAlign: "left",
  },
  {
    id: "mission-1-milestone-3",
    label: "Milestone 3",
    desktop: { top: "37%", left: "25%" },
    cardSide: "right",
    mobileAlign: "right",
  },
  {
    id: "mission-1-milestone-4",
    label: "Milestone 4",
    desktop: { top: "53%", left: "64%" },
    cardSide: "left",
    mobileAlign: "left",
  },
  {
    id: "mission-1-milestone-5",
    label: "Milestone 5",
    desktop: { top: "69%", left: "30%" },
    cardSide: "right",
    mobileAlign: "right",
  },
  {
    id: "mission-1-milestone-6",
    label: "Milestone 6",
    desktop: { top: "83%", left: "74%" },
    cardSide: "left",
    mobileAlign: "left",
  },
];

export const STARTER_FIRST_MILESTONE_ID = STARTER_MILESTONES[0].id;

export const MISSION_DEFINITIONS = [
  {
    id: STARTER_MISSION_ID,
    title: "Starter Reward Journey",
    subtitle: "Progress through six milestones to unlock your selected reward.",
    progressTarget: STARTER_MILESTONES.length,
    milestones: STARTER_MILESTONES,
    status: "active",
  },
  {
    id: BIG_REWARD_MISSION_ID,
    title: "Big Reward Journey",
    subtitle: "Unlock after Starter Reward Journey is complete.",
    status: "locked",
  },
  {
    id: COMING_SOON_MISSION_ID,
    title: "Coming Soon",
    subtitle: "More mission journeys will appear here soon.",
    status: "coming-soon",
  },
];
