export const STARTER_MISSION_ID = "mission-1-starter-reward-journey";
export const BIG_REWARD_MISSION_ID = "mission-2-big-reward-journey";
export const COMING_SOON_MISSION_ID = "mission-coming-soon";

export const STARTER_MILESTONES = [
  {
    id: "mission-1-milestone-1",
    label: "Start your first quiz",
    targetCoins: 20,
    desktop: { top: "10%", left: "76%" },
    cardSide: "left",
    mobileAlign: "right",
  },
  {
    id: "mission-1-milestone-2",
    label: "Understand how stars work",
    targetCoins: 40,
    desktop: { top: "25%", left: "54%" },
    cardSide: "right",
    mobileAlign: "left",
  },
  {
    id: "mission-1-milestone-3",
    label: "Collect enough stars",
    targetCoins: 60,
    desktop: { top: "40%", left: "24%" },
    cardSide: "right",
    mobileAlign: "right",
  },
  {
    id: "mission-1-milestone-4",
    label: "Unlock a topic for free",
    targetCoins: 80,
    desktop: { top: "58%", left: "68%" },
    cardSide: "left",
    mobileAlign: "left",
  },
  {
    id: "mission-1-milestone-5",
    label: "Unlock a topic with coins",
    targetCoins: 100,
    desktop: { top: "76%", left: "28%" },
    cardSide: "right",
    mobileAlign: "right",
  },
  {
    id: "mission-1-milestone-6",
    label: "Track your progress",
    targetCoins: 120,
    desktop: { top: "91%", left: "58%" },
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
