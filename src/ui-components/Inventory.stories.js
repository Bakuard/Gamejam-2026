import Inventory from "./Inventory.component.vue";
import { ITEM_SALT, ITEM_MATCHES, ITEM_SKELETON_KEY } from "@/configs/gameplay.config.js";

export default {
  title: "Game UI Components/Inventory",
  component: Inventory,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Player inventory HUD component displayed during gameplay.",
      },
    },
  },
  argTypes: {
    items: {
      control: "object",
      description: "Array of items with name and amount",
      table: {
        category: "Props",
        type: {
          summary: "Array<{ name: string, amount: number }>",
        },
        defaultValue: { summary: "[]" },
      },
    },
  },
};

const Template = (args) => ({
  components: { Inventory },
  setup() {
    return { args };
  },
  template: `
    <div style="padding: 20px; background: #222; min-height: 200px;">
      <Inventory v-bind="args" />
    </div>
  `,
});

export const Default = Template.bind({});
Default.args = {
  items: [
    { name: ITEM_SALT, amount: 3 },
    { name: ITEM_MATCHES, amount: 5 },
    { name: ITEM_SKELETON_KEY, amount: 1 },
  ],
};

export const Empty = Template.bind({});
Empty.args = {
  items: [],
};

export const SingleItem = Template.bind({});
SingleItem.args = {
  items: [{ name: ITEM_MATCHES, amount: 10 }],
};