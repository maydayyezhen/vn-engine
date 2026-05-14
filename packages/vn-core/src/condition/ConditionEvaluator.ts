import type { ConditionBranch, VariableValue } from "@vn-engine/vn-schema";
import { VariableStore } from "../variable/VariableStore";

/** 条件求值器，用于判断条件分支是否成立。 */
export class ConditionEvaluator {
  /** 变量存储。 */
  private readonly variables: VariableStore;

  /** 创建条件求值器。 */
  constructor(variables: VariableStore) {
    this.variables = variables;
  }

  /** 判断单个条件分支是否成立。 */
  evaluate(branch: ConditionBranch): boolean {
    const actual = this.variables.get(branch.variable);
    return this.compare(branch.operator, actual, branch.value);
  }

  /** 根据分支运算符比较变量值。 */
  private compare(
    operator: ConditionBranch["operator"],
    actual: VariableValue | undefined,
    expected: VariableValue | undefined
  ): boolean {
    if (operator === "exists") return actual !== undefined && actual !== null;
    if (operator === "equals") return actual === expected;
    if (operator === "notEquals") return actual !== expected;
    if (operator === "greaterThan") return Number(actual) > Number(expected);
    if (operator === "lessThan") return Number(actual) < Number(expected);
    return false;
  }
}
