import TutorialModal from "./TutorialModal.component.vue";

export default {
  title: "Game UI Components/TutorialModal",
  component: TutorialModal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Полноэкранное модальное окно с пошаговым слайдером обучения перед началом игры.",
      },
      story: {
        inline: false,
        iframeHeight: "600px",
      },
    },
    layout: "fullscreen",
  },
  argTypes: {
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
    <TutorialModal @lets-go="args.onLetsGo">
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
Default.args = {};

export const CustomSlides = (args) => ({
  components: { TutorialModal },
  setup() {
    return { args };
  },
  template: `
    <TutorialModal @lets-go="args.onLetsGo">
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
CustomSlides.args = {};