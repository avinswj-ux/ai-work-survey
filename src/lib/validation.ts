import { questions } from "./questions";
import type { SurveyInput } from "./types";

export function validateSurvey(body: unknown): SurveyInput {
  if (!body || typeof body !== "object") throw new Error("提交内容无效");
  const source = body as Record<string, unknown>;
  const result = {} as SurveyInput;

  const username =
    typeof source.username === "string" ? source.username.trim() : "";
  if (!username) throw new Error("请填写用户名");
  if (username.length > 50) throw new Error("用户名不能超过 50 个字符");
  result.username = username;

  for (const question of questions) {
    const value = source[question.key];
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(`请完成“${question.title}”`);
    }
    result[question.key] = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);
    if (result[question.key].length === 0) {
      throw new Error(`请完成“${question.title}”`);
    }
  }

  const learningGoal =
    typeof source.learningGoal === "string" ? source.learningGoal.trim() : "";
  if (!learningGoal) throw new Error("请填写今天最想学会什么");
  if (learningGoal.length > 500) throw new Error("学习目标不能超过 500 字");
  result.learningGoal = learningGoal;
  return result;
}

export function isAdmin(password: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && password && password === expected);
}
