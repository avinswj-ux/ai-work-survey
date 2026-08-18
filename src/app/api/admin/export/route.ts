import { readResponses } from "@/lib/storage";
import { isAdmin } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdmin(request.headers.get("x-admin-password"))) {
    return Response.json({ message: "后台密码错误" }, { status: 401 });
  }
  const responses = await readResponses();
  const escapeCsv = (value: string | number) =>
    `"${String(value).replaceAll('"', '""')}"`;
  const headers = [
    "序号", "用户名", "行业", "每天最花时间的工作", "最希望交给AI的工作",
    "使用过的AI工具", "编程熟悉程度", "今天最想学会什么", "提交时间"
  ];
  const rows = responses.map((item, index) => [
    responses.length - index,
    item.username,
    item.industries.join("、"),
    item.timeConsumingWork.join("、"),
    item.aiDelegation.join("、"),
    item.aiTools.join("、"),
    item.codingLevels.join("、"),
    item.learningGoal,
    new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false })
  ]);
  const csv = `\uFEFF${[headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n")}`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ai-survey-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
