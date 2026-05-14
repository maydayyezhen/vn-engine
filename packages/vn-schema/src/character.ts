/** 视觉小说中的角色定义。 */
export interface Character {
  /** 角色唯一标识。 */
  id: string;
  /** 角色显示名称。 */
  name: string;
  /** 角色默认立绘素材 id。 */
  defaultAssetId?: string;
  /** 角色台词名称颜色。 */
  color?: string;
  /** 角色说明。 */
  description?: string;
}
