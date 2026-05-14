import type { ValidationIssue } from "@vn-engine/vn-schema";

/** 获取动作校验问题的显示文本。 */
export function formatActionValidationIssue(issue: ValidationIssue): string {
  return issue.actionId ? `${issue.message}（动作：${issue.actionId}）` : issue.message;
}
