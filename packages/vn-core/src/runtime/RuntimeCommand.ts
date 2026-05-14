import type { VariableValue } from "@vn-engine/vn-schema";

/** 运行时命令，表示一次可序列化的状态修改意图。 */
export type RuntimeCommand =
  | {
      /** 命令类型。 */
      type: "setVariable";
      /** 要写入的变量名。 */
      name: string;
      /** 要写入的变量值。 */
      value: VariableValue;
    };
