import TutorialModal from "./TutorialModal.component.vue";

export default {
  title: "Game UI Components/TutorialModal",
  component: TutorialModal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Полноэкранное модальное окно с пошаговым слайдером обучения или произвольным контентом (например, лидербордом).",
      },
      story: {
        inline: false,
        iframeHeight: "600px",
      },
    },
    layout: "fullscreen",
  },
  argTypes: {
    hasControl: {
      control: "boolean",
      description: "Флаг отображения нижней панели с кнопками переключения слайдов",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    onLetsGo: {
      action: "lets-go",
      description: "Событие, вызываемое при нажатии кнопки 'Вперед!' на последнем слайде",
    },
    onClose: {
      action: "close",
      description: "Событие, вызываемое при нажатии кнопки закрытия в правом верхнем углу",
    },
  },
};

const Template = (args) => ({
  components: { TutorialModal },
  setup() {
    return { args };
  },
  template: `
    <TutorialModal v-bind="args" @lets-go="args.onLetsGo" @close="args.onClose">
      <div>
        <img src="/assets/img/tutorial/introduction_1.jpg" alt="Инструкция 1" />
      </div>
      <div>
        <img src="/assets/img/tutorial/introduction_2.jpg" alt="Инструкция 2" />
      </div>
      <div>
        <img src="/assets/img/tutorial/introduction_3.jpg" alt="Инструкция 3" />
      </div>
    </TutorialModal>
  `,
});

export const Default = Template.bind({});
Default.args = {
  hasControl: true,
};

export const WithoutControls = Template.bind({});
WithoutControls.args = {
  hasControl: false,
};

export const CustomSlides = (args) => ({
  components: { TutorialModal },
  setup() {
    return { args };
  },
  template: `
    <TutorialModal v-bind="args" @lets-go="args.onLetsGo" @close="args.onClose">
      <div style="background: rgba(255,255,255,0.05); padding: 40px; border-radius: 12px; color: #fff; text-align: center;">
        <h2>Слайд 1: Управление</h2>
        <p>Используйте клавиши со стрелками или WASD для перемещения персонажа.</p>
      </div>
      <div style="background: rgba(255,255,255,0.05); padding: 40px; border-radius: 12px; color: #fff; text-align: center;">
        <h2>Слайд 2: Выживание</h2>
        <p>Избегайте призраков в темноте и зажигайте свет.</p>
      </div>
    </TutorialModal>
  `,
});
CustomSlides.args = {
  hasControl: true,
};