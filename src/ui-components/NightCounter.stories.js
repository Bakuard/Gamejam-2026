import NightCounter from "./NightCounter.component.vue";

export default {
  title: "Game UI Components/NightCounter",
  component: NightCounter,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Виджет счетчика ночей, которые смог пережить игрок в survival horror игре.",
      },
    },
  },
  argTypes: {
    count: {
      control: { type: "number", min: 0 },
      description: "Количество пережитых игроком ночей",
      table: {
        category: "Props",
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
  },
};

const Template = (args) => ({
  components: { NightCounter },
  setup() {
    return { args };
  },
  template: `
    <div style="padding: 40px; background: #1a1a1a; display: flex; justify-content: center; align-items: center;">
      <NightCounter v-bind="args" />
    </div>
  `,
});

export const InitialNight = Template.bind({});
InitialNight.args = {
  count: 0,
};

export const FirstNightSurvived = Template.bind({});
FirstNightSurvived.args = {
  count: 1,
};

export const MidGame = Template.bind({});
MidGame.args = {
  count: 5,
};

export const ExperiencedSurvivor = Template.bind({});
ExperiencedSurvivor.args = {
  count: 10,
};