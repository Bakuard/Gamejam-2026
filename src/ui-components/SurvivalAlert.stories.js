import { ref, watch } from "vue";
import SurvivalAlert from "./SurvivalAlert.component.vue";

export default {
  title: "Game UI Components/SurvivalAlert",
  component: SurvivalAlert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Алерт с информацией о том, сколько ночей смог продержаться игрок в survival horror игре.",
      },
    },
  },
  argTypes: {
    count: {
      control: { type: "number", min: 0 },
      description: "Количество ночей, которые смог пережить игрок",
      table: {
        category: "Props",
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
    viewTime: {
      control: { type: "number", min: 0 },
      description: "Время показа алерта (в миллисекундахсь)",
      table: {
        category: "Props",
        type: { summary: "number" },
        defaultValue: { summary: "0" },
      },
    },
  },
};

const Template = (args) => ({
  components: { SurvivalAlert },
  setup() {
    const currentCount = ref(args.count);

    watch(
      () => args.count,
      (val) => {
        currentCount.value = val;
      }
    );

    const increment = () => {
      currentCount.value += 1;
    };

    return { args, currentCount, increment };
  },
  template: `
    <div style="padding: 40px; background: #0f0f14; min-height: 250px; display: flex; flex-direction: column; gap: 20px; justify-content: center; align-items: center;">
      <button
        @click="increment"
        style="padding: 8px 16px; background: #d99b47; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;"
      >
        Пережить ночь (+1)
      </button>
      <SurvivalAlert :count="currentCount" :viewTime="args.viewTime" />
    </div>
  `,
});

export const Default = Template.bind({});
Default.args = {
  count: 0,
  viewTime: 3000,
};

export const ShortViewTime = Template.bind({});
ShortViewTime.args = {
  count: 0,
  viewTime: 1500,
};

export const LongViewTime = Template.bind({});
LongViewTime.args = {
  count: 0,
  viewTime: 5000,
};