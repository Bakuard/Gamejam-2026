import LeaderboardComponent from "./Leaderboard.component.vue";

export default {
  title: "Game UI Components/Leaderboard",
  component: LeaderboardComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Таблица лидеров (лидерборд) для отображения рекордов игроков из Яндекс Игр.",
      },
    },
  },
  argTypes: {
    entries: {
      control: "object",
      description: "Список записей лидеров (топ игроков)",
      table: {
        category: "Props",
        type: {
          summary: "Array<{ rank: number, name: string, score: number, avatar?: string, isUser?: boolean }>",
        },
        defaultValue: { summary: "[]" },
      },
    },
    userNeighbors: {
      control: "object",
      description: "Соседи игрока по рейтингу (если он не входит в топ)",
      table: {
        category: "Props",
        type: {
          summary: "Array<{ rank: number, name: string, score: number, avatar?: string, isUser?: boolean }>",
        },
        defaultValue: { summary: "[]" },
      },
    },
    topCount: {
      control: "number",
      description: "Количество лидеров, отображаемых в топе",
      table: {
        category: "Props",
        type: { summary: "number" },
        defaultValue: { summary: "5" },
      },
    },
    title: {
      control: "text",
      description: "Заголовок лидерборда",
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "Лучшие игроки" },
      },
    },
    isLoading: {
      control: "boolean",
      description: "Флаг состояния загрузки данных",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    loadingText: {
      control: "text",
      description: "Текст в состоянии загрузки",
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "Загрузка..." },
      },
    },
    hasError: {
      control: "boolean",
      description: "Флаг ошибки при загрузке данных",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    errorText: {
      control: "text",
      description: "Текст сообщения об ошибке",
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "Не удалось загрузить таблицу лидеров" },
      },
    },
    retryText: {
      control: "text",
      description: "Текст кнопки повторной попытки загрузки",
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "Повторить" },
      },
    },
    isAuthenticated: {
      control: "boolean",
      description: "Флаг авторизации пользователя на платформе Яндекс Игры",
      table: {
        category: "Props",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    unauthenticatedText: {
      control: "text",
      description: "Текст предупреждения для неавторизованного пользователя",
      table: {
        category: "Props",
        type: { summary: "string" },
        defaultValue: { summary: "Войдите в аккаунт Яндекс, чтобы сохранить свой рекорд и появиться в таблице лидеров." },
      },
    },
    onRetry: {
      action: "retry",
      description: "Событие нажатия кнопки повторной попытки загрузки",
      table: {
        category: "Events",
      },
    },
  },
};

const Template = (args) => ({
  components: { Leaderbord: LeaderboardComponent },
  setup() {
    return { args };
  },
  template: `
    <div style="padding: 24px; background: #0e0e14; min-height: 400px; display: flex; justify-content: center; align-items: center;">
      <Leaderbord v-bind="args" @retry="args.onRetry" />
    </div>
  `,
});

export const Default = Template.bind({});
Default.args = {
  isLoading: false,
  hasError: false,
  isAuthenticated: true,
  entries: [
    { rank: 1, name: "ShadowHunter", score: 1250, avatar: "https://avatars.yandex.net/get-yapic/0/0-0/islands-middle", isUser: false },
    { rank: 2, name: "NightWalker", score: 980, avatar: "https://avatars.yandex.net/get-yapic/0/0-0/islands-middle", isUser: false },
    { rank: 3, name: "GhostBuster", score: 870, avatar: "https://avatars.yandex.net/get-yapic/0/0-0/islands-middle", isUser: true },
    { rank: 4, name: "Player1234", score: 620, avatar: "", isUser: false },
    { rank: 5, name: "DarkKnight", score: 450, avatar: "", isUser: false },
  ],
};

export const UserOutsideTop5 = Template.bind({});
UserOutsideTop5.args = {
  isLoading: false,
  hasError: false,
  isAuthenticated: true,
  topCount: 5,
  entries: [
    { rank: 1, name: "ShadowHunter", score: 1250, avatar: "https://avatars.yandex.net/get-yapic/0/0-0/islands-middle", isUser: false },
    { rank: 2, name: "NightWalker", score: 980, avatar: "https://avatars.yandex.net/get-yapic/0/0-0/islands-middle", isUser: false },
    { rank: 3, name: "GhostBuster", score: 870, avatar: "https://avatars.yandex.net/get-yapic/0/0-0/islands-middle", isUser: false },
    { rank: 4, name: "Player1234", score: 620, avatar: "", isUser: false },
    { rank: 5, name: "DarkKnight", score: 450, avatar: "", isUser: false },
  ],
  userNeighbors: [
    { rank: 41, name: "Survivor_99", score: 210, avatar: "", isUser: false },
    { rank: 42, name: "MySuperNick", score: 195, avatar: "https://avatars.yandex.net/get-yapic/0/0-0/islands-middle", isUser: true },
    { rank: 43, name: "NoobMaster", score: 180, avatar: "", isUser: false },
  ],
};

export const UnauthenticatedUser = Template.bind({});
UnauthenticatedUser.args = {
  isLoading: false,
  hasError: false,
  isAuthenticated: false,
  entries: [
    { rank: 1, name: "ShadowHunter", score: 1250, avatar: "https://avatars.yandex.net/get-yapic/0/0-0/islands-middle", isUser: false },
    { rank: 2, name: "NightWalker", score: 980, avatar: "https://avatars.yandex.net/get-yapic/0/0-0/islands-middle", isUser: false },
    { rank: 3, name: "GhostBuster", score: 870, avatar: "https://avatars.yandex.net/get-yapic/0/0-0/islands-middle", isUser: false },
    { rank: 4, name: "Player1234", score: 620, avatar: "", isUser: false },
    { rank: 5, name: "DarkKnight", score: 450, avatar: "", isUser: false },
  ],
};

export const Loading = Template.bind({});
Loading.args = {
  isLoading: true,
  hasError: false,
  isAuthenticated: true,
  entries: [],
};

export const Error = Template.bind({});
Error.args = {
  isLoading: false,
  hasError: true,
  isAuthenticated: true,
  entries: [],
};

export const Empty = Template.bind({});
Empty.args = {
  isLoading: false,
  hasError: false,
  isAuthenticated: true,
  entries: [],
};