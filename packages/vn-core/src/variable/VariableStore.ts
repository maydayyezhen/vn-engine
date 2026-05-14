import type { VariableValue } from "@vn-engine/vn-schema";

/** 运行时变量存储，封装变量读写和快照复制。 */
export class VariableStore {
  /** 内部变量表。 */
  private values: Record<string, VariableValue>;

  /** 创建变量存储。 */
  constructor(initialValues: Record<string, VariableValue> = {}) {
    this.values = { ...initialValues };
  }

  /** 读取变量值。 */
  get(name: string): VariableValue | undefined {
    return this.values[name];
  }

  /** 写入变量值。 */
  set(name: string, value: VariableValue): void {
    this.values[name] = value;
  }

  /** 替换全部变量。 */
  load(values: Record<string, VariableValue>): void {
    this.values = { ...values };
  }

  /** 获取变量表快照。 */
  snapshot(): Record<string, VariableValue> {
    return { ...this.values };
  }
}
