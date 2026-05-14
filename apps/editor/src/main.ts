import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import "./style.css";

/** 创建并挂载编辑器 Vue 应用。 */
createApp(App).use(ElementPlus).mount("#app");
