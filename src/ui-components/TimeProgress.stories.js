import TimeProgress from "./TimeProgress.component.vue";

export default {
  title: "Game UI Components/TimeProgress",
  component: TimeProgress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Виджет индикатора оставшегося времени (таймер/прогресс) со сменой иконки дня (солнце) и ночи (луна).",
      },
    },
  },
  argTypes: {
    allTime: {
      control: { type: "number", min: 0 },
      description: "Общая продолжительность времени (в миллисекундах или секундах)",
      table: {
        category: "Props",
        type: { summary: "number" },
      },
    },
    remainingTime: {
      control: { type: "number", min: 0 },
      description: "Оставшееся время",
      table: {
        category: "Props",
        type: { summary: "number" },
      },
    },
    isNight: {
      control: "boolean",
      description: "Флаг ночного времени суток (отображает луну вместо солнца)",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
  },
};

const Template = (args) => ({
  components: { TimeProgress },
  setup() {
    return { args };
  },
  template: `
    <div style="padding: 40px; background: #222; display: flex; justify-content: center;">
      <TimeProgress v-bind="args" />
    </div>
  `,
});

export const DayFullTime = Template.bind({});
DayFullTime.args = {
  allTime: 60,
  remainingTime: 60,
  isNight: false,
};

export const DayHalfTime = Template.bind({});
DayHalfTime.args = {
  allTime: 60,
  remainingTime: 30,
  isNight: false,
};

export const NightFullTime = Template.bind({});
NightFullTime.args = {
  allTime: 60,
  remainingTime: 60,
  isNight: true,
};

export const NightLowTime = Template.bind({});
NightLowTime.args = {
  allTime: 60,
  remainingTime: 5,
  isNight: true,
};

export const TimeOut = Template.bind({});
TimeOut.args = {
  allTime: 60,
  remainingTime: 0,
  isNight: false,
};
