import { createRouter, createWebHashHistory } from "vue-router";

import StartMenuScreen from "@/screens/StartMenu.screen.vue";
import Platformer from "@/screens/Platformer.screen.vue";

export const routes = [
  {
    path: "/",
    component: StartMenuScreen,
  },
  {
    path: "/platformer",
    component: Platformer,
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
