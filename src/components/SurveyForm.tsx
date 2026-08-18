"use client";

import { useMemo, useState } from "react";
import { questions, type QuestionKey } from "@/lib/questions";
import type { SurveyInput } from "@/lib/types";

const emptyAnswers = Object.fromEntries(
  questions.map((question) => [question.key, []])
) as unknown as Record<QuestionKey, string[]>;

export function SurveyForm() {
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState<Record<QuestionKey, string[]>>(emptyAnswers);
  const [otherText, setOtherText] = useState<Partial<Record<QuestionKey, string>>>({});
  const [learningGoal, setLearningGoal] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");

  const completed = useMemo(
    () =>
      (username.trim() ? 1 : 0) +
      questions.filter((question) => answers[question.key].length > 0).length +
      (learningGoal.trim() ? 1 : 0),
    [answers, learningGoal, username]
  );
  const progress = Math.round((completed / 7) * 100);

  function toggle(key: QuestionKey, option: string) {
    setAnswers((current) => ({
      ...current,
      [key]: current[key].includes(option)
        ? current[key].filter((value) => value !== option)
        : [...current[key], option]
    }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("请填写用户名");
      document.getElementById("username")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    for (const question of questions) {
      if (answers[question.key].length === 0) {
        setError(`请完成第 ${questions.indexOf(question) + 1} 题`);
        document.getElementById(question.key)?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (
        answers[question.key].includes("其他") &&
        !(otherText[question.key] || "").trim()
      ) {
        setError(`请补充“${question.title}”中的其他选项`);
        document.getElementById(question.key)?.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    if (!learningGoal.trim()) {
      setError("请填写今天最想学会什么");
      return;
    }

    const payload = Object.fromEntries(
      questions.map((question) => [
        question.key,
        answers[question.key].map((option) =>
          option === "其他"
            ? `其他：${(otherText[question.key] || "").trim()}`
            : option
        )
      ])
    ) as Record<QuestionKey, string[]>;

    setStatus("submitting");
    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, username, learningGoal } satisfies SurveyInput)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "提交失败");
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "提交失败，请稍后重试");
    }
  }

  if (status === "success") {
    return (
      <div className="success-shell">
        <section className="success-card">
          <div className="success-icon">✓</div>
          <p className="eyebrow">SUBMITTED</p>
          <h1>收到，谢谢你。</h1>
          <p>你的回答已经安全提交。它会帮助我们把接下来的内容做得更贴近真实工作。</p>
          <button onClick={() => window.location.reload()} className="secondary-button">
            再填一份
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="survey-shell">
      <aside className="intro-panel">
        <div className="brand">
          <span className="brand-mark">AI</span>
          <span>WORKFLOW LAB</span>
        </div>
        <div className="intro-copy">
          <p className="eyebrow">QUICK SURVEY · 2 MIN</p>
          <h1>让 AI 从“会聊天”<br />走进你的工作流</h1>
          <p className="intro-description">
            6 个小问题，帮我们了解你正在做什么、哪里最耗时间，以及 AI 真正应该替你接手什么。
          </p>
          <div className="multi-tip">
            <span>✓</span>
            <p><strong>所有选项均可多选</strong><br />按照真实情况选择即可</p>
          </div>
        </div>
        <p className="privacy-note">匿名收集 · 仅用于课程内容优化</p>
      </aside>

      <section className="form-panel">
        <div className="progress-wrap">
          <div className="progress-label">
            <span>填写进度</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <form onSubmit={submit}>
          <fieldset className="question-card username-card" id="username">
            <legend>
              <span>00</span>
              先认识一下你
              <small>必填</small>
            </legend>
            <label className="username-label" htmlFor="username-input">用户名</label>
            <input
              id="username-input"
              className="username-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入你的用户名"
              maxLength={50}
              autoComplete="nickname"
            />
            <p className="username-hint">同一用户名只能提交一次，请确认填写正确。</p>
          </fieldset>

          {questions.map((question, index) => (
            <fieldset className="question-card" id={question.key} key={question.key}>
              <legend>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {question.title}
                <small>可多选</small>
              </legend>
              <div className="option-grid">
                {question.options.map((option) => {
                  const selected = answers[question.key].includes(option);
                  return (
                    <label className={`option ${selected ? "selected" : ""}`} key={option}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggle(question.key, option)}
                      />
                      <span className="custom-check">{selected ? "✓" : ""}</span>
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
              {answers[question.key].includes("其他") ? (
                <input
                  className="other-input"
                  value={otherText[question.key] || ""}
                  onChange={(event) =>
                    setOtherText((current) => ({
                      ...current,
                      [question.key]: event.target.value
                    }))
                  }
                  placeholder="请补充说明"
                  maxLength={100}
                />
              ) : null}
            </fieldset>
          ))}

          <fieldset className="question-card final-question" id="learningGoal">
            <legend>
              <span>06</span>
              今天最想学会什么？
            </legend>
            <textarea
              value={learningGoal}
              onChange={(event) => setLearningGoal(event.target.value)}
              placeholder="例如：用 AI 自动整理会议纪要，并生成待办清单…"
              maxLength={500}
              rows={4}
            />
            <p className="character-count">{learningGoal.length} / 500</p>
          </fieldset>

          {error ? <p className="form-error">{error}</p> : null}
          <button className="submit-button" disabled={status === "submitting"}>
            {status === "submitting" ? "正在提交…" : "提交问卷"}
            <span>→</span>
          </button>
        </form>
      </section>
    </div>
  );
}
