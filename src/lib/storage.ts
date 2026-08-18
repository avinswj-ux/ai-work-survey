import { promises as fs } from "node:fs";
import path from "node:path";
import { questions } from "./questions";
import type { AdminStats, SurveyInput, SurveyResponse } from "./types";

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "responses.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
let writeQueue = Promise.resolve();

function normalizeUsername(username: string) {
  return username.trim().toLocaleLowerCase("zh-CN");
}

export class DuplicateUsernameError extends Error {
  constructor() {
    super("这个用户名已经提交过问卷，请勿重复提交");
    this.name = "DuplicateUsernameError";
  }
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function readResponses(): Promise<SurveyResponse[]> {
  await ensureDataFile();
  try {
    const parsed = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function createResponse(input: SurveyInput) {
  const operation = writeQueue.then(async () => {
    const responses = await readResponses();
    const normalizedUsername = normalizeUsername(input.username);
    if (
      responses.some(
        (item) =>
          typeof item.username === "string" &&
          normalizeUsername(item.username) === normalizedUsername
      )
    ) {
      throw new DuplicateUsernameError();
    }
    const response: SurveyResponse = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString()
    };
    responses.unshift(response);
    await fs.writeFile(DATA_FILE, JSON.stringify(responses, null, 2), "utf8");
    return response;
  });
  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export function deleteResponses(ids: string[]) {
  const operation = writeQueue.then(async () => {
    const responses = await readResponses();
    const requested = new Set(ids);
    const remaining = responses.filter((item) => !requested.has(item.id));
    if (remaining.length !== responses.length) {
      await fs.mkdir(BACKUP_DIR, { recursive: true });
      await fs.writeFile(
        path.join(BACKUP_DIR, `responses-${Date.now()}.json`),
        JSON.stringify(responses, null, 2),
        "utf8"
      );
      await fs.writeFile(DATA_FILE, JSON.stringify(remaining, null, 2), "utf8");
    }
    return { deleted: responses.length - remaining.length };
  });
  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export async function getStats(): Promise<AdminStats> {
  const responses = await readResponses();
  const distributions = Object.fromEntries(
    questions.map((question) => [
      question.key,
      responses.reduce<Record<string, number>>((counts, response) => {
        response[question.key].forEach((option) => {
          counts[option] = (counts[option] || 0) + 1;
        });
        return counts;
      }, {})
    ])
  ) as AdminStats["distributions"];

  return { total: responses.length, distributions, responses };
}
