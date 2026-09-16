import GameResultModal from "./GameResultModal.component.vue";

export default {
  title: "Game UI Components/GameResultModal",
  component: GameResultModal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Модальное окно результатов игры при победе или поражении (гибели) игрока с возможностью перезапуска игры.",
      },
      story: {
        inline: false,
        iframeHeight: "768px",
      },
    },
    layout: "fullscreen",
  },
  argTypes: {
    isGameOver: {
      control: "boolean",
      description: "Флаг окончания игры, управляющий отображением модального окна",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    isWin: {
      control: "boolean",
      description: "Результат игры: true — победа (выжил), false — поражение (погиб)",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    onAgain: {
      action: "again",
      description: "Событие нажатия на кнопку 'Заново' или клавишу Enter",
      table: {
        category: "Events",
      },
    },
  },
};

const Template = (args) => ({
  components: { GameResultModal },
  setup() {
    return { args };
  },
  template: `
    <div style="width: 100vw; height: 100vh; background: #000; display: flex; align-items: center; justify-content: center;">
      <div class="platformer-screen__game-wrapper" style="width: 800px; height: 768px; position: relative;">
        <canvas width="800" height="768" style="display: block; width: 100%; height: 100%; background: #1a1a24;"></canvas>
      </div>
      <GameResultModal 
        v-bind="args" 
        @again="args.onAgain" 
      />
    </div>
  `,
});

export const Defeat = Template.bind({});
Defeat.args = {
  isGameOver: true,
  isWin: false,
};

export const Victory = Template.bind({});
Victory.args = {
  isGameOver: true,
  isWin: true,
};

export const Closed = Template.bind({});
Closed.args = {
  isGameOver: false,
  isWin: false,
};