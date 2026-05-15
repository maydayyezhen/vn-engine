import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import "./style.css";
import "./styles/editor-tokens.css";
import "./styles/editor-layout.css";
import "./styles/editor-panels.css";
import "./styles/editor-components.css";
import "./styles/editor-overrides.css";

/** 创建并挂载编辑器 Vue 应用。 */
createApp(App).use(ElementPlus).mount("#app");
