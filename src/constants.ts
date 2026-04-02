import { UserStats } from './types';

export const MOCK_USER_STATS: UserStats = {
  correct: 21,
  incorrect: 4,
  current: 26,
  unanswered: 25,
  lastExercises: [
    { name: "Vežba 6", score: 81, category: "Pravila saobraćaja" },
    { name: "Vežba 5", score: 86, category: "Saobraćajna signalizacija" },
    { name: "Vežba 4", score: 90, category: "Saobraćajna signalizacija" },
    { name: "Vežba 9", score: 73, category: "Vozači" },
    { name: "Vežba 1", score: 83, category: "Pravila saobraćaja" }
  ],
  masteryByArea: [
    { area: "Saobraćajna signalizacija", percentage: 90, color: "#FACC15" },
    { area: "Osnove bezbednosti saobraćaja", percentage: 70, color: "#EF4444" },
    { area: "Posebne mere i ovlašćenja", percentage: 65, color: "#3B82F6" },
    { area: "Pravila saobraćaja", percentage: 76, color: "#F97316" },
    { area: "Vozila", percentage: 79, color: "#06B6D4" },
    { area: "Vozači", percentage: 75, color: "#8B5CF6" }
  ]
};
