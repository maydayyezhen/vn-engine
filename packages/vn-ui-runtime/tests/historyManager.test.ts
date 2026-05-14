import { describe, expect, it } from "vitest";
import { HistoryManager } from "../src";

describe("HistoryManager", () => {
  it("能添加历史", () => {
    const history = new HistoryManager();
    history.push({ id: "1", speakerName: "林澄", text: "你好。", scriptId: "start", nodeId: "n1", createdAt: "now" });
    expect(history.list()).toHaveLength(1);
  });

  it("能限制最大条数", () => {
    const history = new HistoryManager(2);
    history.push({ id: "1", text: "一", scriptId: "start", nodeId: "n1", createdAt: "now" });
    history.push({ id: "2", text: "二", scriptId: "start", nodeId: "n2", createdAt: "now" });
    history.push({ id: "3", text: "三", scriptId: "start", nodeId: "n3", createdAt: "now" });
    expect(history.list().map((entry) => entry.id)).toEqual(["2", "3"]);
  });

  it("能避免连续重复记录", () => {
    const history = new HistoryManager();
    const entry = { id: "1", text: "重复", scriptId: "start", nodeId: "n1", createdAt: "now" };
    history.push(entry);
    history.push({ ...entry, id: "2" });
    expect(history.list()).toHaveLength(1);
  });
});
