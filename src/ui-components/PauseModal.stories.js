import PauseModal from "./PauseModal.component.vue";

export default {
  title: "Game UI Components/PauseModal",
  component: PauseModal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Модальное окно паузы игры с возможностью продолжить игру, перезапустить уровень или вернуться в главное меню.",
      },
      story: {
        inline: false,
        iframeHeight: "600px",
      },
    },
    layout: "fullscreen",
  },
  argTypes: {
    isShow: {
      control: "boolean",
      description: "Флаг видимости модального окна паузы",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    onResume: {
      action: "resume",
      description: "Событие продолжения игры (закрытие меню паузы)",
      table: {
        category: "Events",
      },
    },
    onAgain: {
      action: "again",
      description: "Событие нажатия на кнопку 'Заново'",
      table: {
        category: "Events",
      },
    },
    onToMenu: {
      action: "to-menu",
      description: "Событие нажатия на кнопку 'В меню'",
      table: {
        category: "Events",
      },
    },
  },
};

const Template = (args) => ({
  components: { PauseModal },
  setup() {
    return { args };
  },
  template: `
    <div style="width: 100vw; height: 100vh; background: #000; display: flex; align-items: center; justify-content: center;">
      <div class="platformer-screen__game-wrapper" style="width: 800px; height: 500px; position: relative;">
        <canvas width="800" height="500" style="display: block; width: 100%; height: 100%; background: #1a1a24;"></canvas>
      </div>
      <PauseModal 
        v-bind="args" 
        @resume="args.onResume" 
        @again="args.onAgain" 
        @to-menu="args.onToMenu" 
      />
    </div>
  `,
});

export const Opened = Template.bind({});
Opened.args = {
  isShow: true,
};

export const Closed = Template.bind({});
Closed.args = {
  isShow: false,
};