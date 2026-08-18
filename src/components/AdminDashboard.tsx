"use client";

import { useState } from "react";
import { questions } from "@/lib/questions";
import type { AdminStats } from "@/lib/types";

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function loadStats(event?: React.FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/stats", {
        headers: { "x-admin-password": password }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "加载失败");
      setStats(data);
      setSelectedIds([]);
    } catch (err) {
      setStats(null);
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function removeSelected() {
    if (!selectedIds.length || !window.confirm(`确定删除选中的 ${selectedIds.length} 份答卷吗？`)) return;
    const response = await fetch("/api/admin/responses", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password
      },
      body: JSON.stringify({ ids: selectedIds })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "删除失败");
      return;
    }
    await loadStats();
  }

  async function exportExcel() {
    const response = await fetch("/api/admin/export", {
      headers: { "x-admin-password": password }
    });
    if (!response.ok) {
      setError("导出失败，请重新登录后台");
      return;
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = `AI工作流问卷-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">AI WORKFLOW LAB</p>
          <h1>问卷数据后台</h1>
          <p>查看实时统计、浏览原始答卷并导出 Excel。</p>
        </div>
        <form onSubmit={loadStats} className="login-form">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="输入后台密码"
          />
          <button disabled={loading}>{loading ? "加载中…" : "进入后台"}</button>
        </form>
      </header>

      {error ? <p className="admin-error">{error}</p> : null}

      {stats ? (
        <>
          <section className="metric-row">
            <article className="metric-card primary">
              <span>累计答卷</span>
              <strong>{stats.total}</strong>
              <small>份有效提交</small>
            </article>
            {questions.slice(0, 3).map((question) => {
              const entries = Object.entries(stats.distributions[question.key])
                .sort((a, b) => b[1] - a[1]);
              return (
                <article className="metric-card" key={question.key}>
                  <span>{question.title}</span>
                  <strong className="metric-text">{entries[0]?.[0] || "暂无"}</strong>
                  <small>{entries[0] ? `${entries[0][1]} 人选择 · 当前最高` : "等待第一份答卷"}</small>
                </article>
              );
            })}
          </section>

          <section className="charts-grid">
            {questions.map((question) => {
              const entries = Object.entries(stats.distributions[question.key])
                .sort((a, b) => b[1] - a[1]);
              const max = Math.max(...entries.map(([, value]) => value), 1);
              return (
                <article className="chart-card" key={question.key}>
                  <h2>{question.title}</h2>
                  <div className="bars">
                    {entries.length ? entries.map(([label, count]) => (
                      <div className="bar-row" key={label}>
                        <div><span>{label}</span><strong>{count}</strong></div>
                        <div className="bar-track"><span style={{ width: `${(count / max) * 100}%` }} /></div>
                      </div>
                    )) : <p className="empty-state">暂无数据</p>}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="responses-card">
            <div className="responses-toolbar">
              <div>
                <h2>原始答卷</h2>
                <p>按提交时间从新到旧排列</p>
              </div>
              <div>
                <button className="danger-button" disabled={!selectedIds.length} onClick={removeSelected}>
                  删除{selectedIds.length ? `（${selectedIds.length}）` : ""}
                </button>
                <button className="export-button" onClick={exportExcel}>导出 Excel</button>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="全选"
                        checked={stats.responses.length > 0 && selectedIds.length === stats.responses.length}
                        onChange={() => setSelectedIds(
                          selectedIds.length === stats.responses.length
                            ? []
                            : stats.responses.map((item) => item.id)
                        )}
                      />
                    </th>
                    <th>提交时间</th>
                    <th>用户名</th>
                    <th>行业</th>
                    <th>耗时工作</th>
                    <th>希望交给 AI</th>
                    <th>AI 工具</th>
                    <th>编程程度</th>
                    <th>最想学会</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.responses.map((response) => (
                    <tr key={response.id}>
                      <td><input type="checkbox" checked={selectedIds.includes(response.id)} onChange={() => toggle(response.id)} /></td>
                      <td>{new Date(response.createdAt).toLocaleString("zh-CN", { hour12: false })}</td>
                      <td><strong>{response.username || "历史答卷"}</strong></td>
                      <td>{response.industries.join("、")}</td>
                      <td>{response.timeConsumingWork.join("、")}</td>
                      <td>{response.aiDelegation.join("、")}</td>
                      <td>{response.aiTools.join("、")}</td>
                      <td>{response.codingLevels.join("、")}</td>
                      <td className="goal-cell">{response.learningGoal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!stats.responses.length ? <p className="empty-table">还没有人提交问卷。</p> : null}
            </div>
          </section>
        </>
      ) : (
        <section className="admin-placeholder">
          <div>↗</div>
          <h2>数据在这里等你</h2>
          <p>输入管理员密码后即可进入完整后台。</p>
        </section>
      )}
    </div>
  );
}
