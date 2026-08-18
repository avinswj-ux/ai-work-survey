export const questions = [
  {
    key: "industries",
    title: "你的行业",
    options: ["软件开发", "产品", "运营", "市场", "设计", "电商", "教育", "制造", "其他"]
  },
  {
    key: "timeConsumingWork",
    title: "你每天花时间最多的工作",
    options: ["写文档", "Excel", "PPT", "写代码", "调试 Bug", "数据分析", "回复消息", "搜资料", "其他"]
  },
  {
    key: "aiDelegation",
    title: "哪些工作最希望交给 AI？",
    options: ["自动写代码", "自动生成网页", "自动分析 PDF", "自动整理 Excel", "自动生成 PPT", "自动写文案", "自动部署项目", "自动修 Bug"]
  },
  {
    key: "aiTools",
    title: "目前使用过哪些 AI 工具？",
    options: ["ChatGPT", "Claude", "DeepSeek", "豆包", "Kimi", "通义", "Copilot", "Cursor", "Codex", "其他"]
  },
  {
    key: "codingLevels",
    title: "你对编程的熟悉程度",
    options: ["完全不会", "会一点", "能看懂代码", "能独立开发"]
  }
] as const;

export type QuestionKey = (typeof questions)[number]["key"];
