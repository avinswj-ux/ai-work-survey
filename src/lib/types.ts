import type { QuestionKey } from "./questions";

export type SurveyInput = Record<QuestionKey, string[]> & {
  username: string;
  learningGoal: string;
};

export type SurveyResponse = SurveyInput & {
  id: string;
  createdAt: string;
};

export type OptionStats = Record<string, number>;

export type AdminStats = {
  total: number;
  distributions: Record<QuestionKey, OptionStats>;
  responses: SurveyResponse[];
};
