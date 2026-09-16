import { ref } from "vue";
import Tooltip from "./Tooltipe.component.vue";
import { TOOLTIP_ICONS } from "@/configs/gameplay.config";

const iconOptions = Object.keys(TOOLTIP_ICONS);

export default {
  title: "Game UI Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Компонент всплывающих подсказок для survival horror игры (управление, интерактивные объекты, монстры). Поддерживает таймер истечения времени, режим паузы и постоянный режим без таймера.",
      },
    },
  },
  argTypes: {
    icon: {
      control: {
        type: "select",
        labels: {
          null: "Без иконки",
          CONTROLLER: "CONTROLLER",
          MATCHES: "MATCHES",
          GHOST: "GHOST",
          DOOR: "DOOR",
          KEY: "KEY",
          LAMP: "LAMP",
          SALT: "SALT",
          BOX: "BOX",
        },
      },
      options: [null, ...iconOptions],
      description: "Ключ иконки из TOOLTIP_ICONS (CONTROLLER, MATCHES, GHOST и т.д.)",
      table: {
        category: "Props",
        type: { summary: "string | null" },
        defaultValue: { summary: "null" },
      },
    },
    text: {
      control: "text",
      description: "Текст подсказки",
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "''" },
      },
    },
    id: {
      control: "text",
      description: "Уникальный идентификатор подсказки",
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "''" },
      },
    },
    viewTime: {
      control: { type: "number", min: 0, step: 500 },
      description: "Время отображения подсказки в мс (0 или не передано — подсказка постоянная без полоски таймера)",
      table: {
        category: "Props",
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
    isPaused: {
      control: "boolean",
      description: "Флаг паузы: при значении true таймер и анимация полоски прогресса замирают",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    onHide: {
      action: "hide",
      description: "Событие скрытия подсказки по истечении таймера",
      table: {
        category: "Events",
      },
    },
  },
};

const Template = (args) => ({
  components: { Tooltip },
  setup() {
    const triggerKey = ref(0);
    const isPausedLocal = ref(args.isPaused ?? false);

    const replay = () => {
      triggerKey.value += 1;
    };

    const togglePause = () => {
      isPausedLocal.value = !isPausedLocal.value;
    };

    return { args, triggerKey, replay, isPausedLocal, togglePause };
  },
  template: `
    <div style="padding: 40px; background: #0c0d14; min-height: 250px; display: flex; flex-direction: column; gap: 24px; align-items: center; justify-content: center;">
      <div style="display: flex; gap: 12px;">
        <button
          v-if="args.viewTime > 0"
          @click="replay"
          style="padding: 8px 16px; background: #2a2d3d; color: #fff; border: 1px solid #454a60; border-radius: 6px; cursor: pointer; font-size: 13px;"
        >
          Перезапустить показ (Re-trigger)
        </button>
        <button
          v-if="args.viewTime > 0"
          @click="togglePause"
          style="padding: 8px 16px; background: #3b3628; color: #d99b47; border: 1px solid #705828; border-radius: 6px; cursor: pointer; font-size: 13px;"
        >
          {{ isPausedLocal ? "Возобновить" : "Пауза" }}
        </button>
      </div>

      <Tooltip
        :key="triggerKey"
        :id="args.id"
        :icon="args.icon"
        :text="args.text"
        :viewTime="args.viewTime"
        :isPaused="isPausedLocal"
        @hide="args.onHide"
      />
    </div>
  `,
});

export const Default = Template.bind({});
Default.args = {
  id: "controls-hint",
  icon: "CONTROLLER",
  text: "Используйте WASD для перемещения",
  viewTime: 4000,
  isPaused: false,
};

export const Paused = Template.bind({});
Paused.args = {
  id: "controls-hint-paused",
  icon: "CONTROLLER",
  text: "Подсказка на паузе (таймер заморожен)",
  viewTime: 5000,
  isPaused: true,
};

export const InteractionWithoutTimer = Template.bind({});
InteractionWithoutTimer.args = {
  id: "lamp-interact",
  icon: "LAMP",
  text: "Нажмите [E], чтобы зажечь керосиновую лампу",
  viewTime: 0,
  isPaused: false,
};

export const GhostWarning = Template.bind({});
GhostWarning.args = {
  id: "ghost-danger",
  icon: "GHOST",
  text: "Опасность! Призрак приближается!",
  viewTime: 5000,
  isPaused: false,
};

export const DoorLocked = Template.bind({});
DoorLocked.args = {
  id: "door-locked",
  icon: "KEY",
  text: "Дверь заперта. Нужен ключ от подвала.",
  viewTime: 3500,
  isPaused: false,
};

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
  id: "ambient-note",
  icon: null,
  text: "Вы слышите зловещий шорох за стеной...",
  viewTime: 3000,
  isPaused: false,
};