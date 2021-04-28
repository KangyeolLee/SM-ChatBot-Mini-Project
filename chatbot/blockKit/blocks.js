exports.firstGuideMessage = [
  {
    type: "header",
    text: "🎶 멘토특강 관심분야 설정 🌹",
    style: "red",
  },
  {
    type: "text",
    text:
      "안녕하세요? 반갑습니다!\n선호하는 멘토특강 및 자유멘토링 관심분야가 있나요? \n해당 카테고리를 알려주시면 *알리다*가 안내 드릴게요~ 💕",
    markdown: true,
  },
  {
    type: "button",
    action_type: "call_modal",
    value: "cafe_survey",
    text: "입력하기",
    style: "default",
  },
];

exports.surveyModalMessage = [
  {
    type: "label",
    text: "원하시는 분야 또는 키워드를 입력해주세요",
    markdown: false,
  },
  {
    type: "input",
    name: "category",
    required: true,
    placeholder: "ex) 백엔드",
  },
  {
    type: "label",
    text: "[입력가이드]",
    markdown: false,
  },
  {
    type: "label",
    text:
      "1. 입력 문자는 관심분야 또는 특정 키워드 모두 가능합니다. 예를 들어 <프론트>라고 입력하면, <프론트>가 제목에 기재된 특강 중 현재 접수중인 특강만 표시합니다.",
    markdown: false,
  },
  {
    type: "label",
    text: "2. 입력된 카테고리 또는 키워드를 기준으로 강의를 검색합니다.",
    markdown: false,
  },
  {
    type: "label",
    text: "3. 이미 마감된 특강은 표시하지 않습니다.",
    markdown: false,
  },
  {
    type: "label",
    text: "4. 출력할 특강의 개수에 따라 소요시간이 다를 수 있습니다.",
    markdown: false,
  },
  {
    type: "label",
    text: "5. 영어의 경우 대소문자를 구분하지 않습니다. 편하게 검색하세요~",
    markdown: false,
  },
];

exports.callbackMessage = [
  {
    type: "text",
    text:
      "입력하신 정보를 바탕으로 찾아보고 있어요..! 👍 \n 조금만 기다려 주시면 곧 안내 드릴게요~ 😉",
    markdown: true,
  },
  {
    type: "text",
    text: "*요청정보*",
    markdown: true,
  },
  {
    type: "description",
    term: "입력",
    content: {
      type: "text",
      text: actions.category,
      markdown: false,
    },
    accent: true,
  },
];

exports.keywordResultMessage = [
  {
    type: "header",
    text: "[" + actions.category + "] 분야 모집 중 멘토링",
    style: "yellow",
  },
  {
    type: "image_link",
    url: "https://swm-chatbot-zorlne-xck4ah.run.goorm.io/logo.PNG",
  },
];

exports.noResultMessage = [
  {
    type: "image_link",
    url: "https://swm-chatbot-zorlne-xck4ah.run.goorm.io/no-result-found.png",
  },
  {
    type: "text",
    text:
      "아쉽지만 선택한 카테고리 내 멘토링이 개설되지 않았네요 😢 \n\n 다른 키워드 또는 분야를 입력해보시겠어요?",
    markdown: true,
  },
];

exports.makeBlockKitPackage = (pendingList) => {
  const blocks = [];

  for (const list of pendingList) {
    const blockKitContent = [
      {
        type: "divider",
      },
      {
        type: "description",
        term: "강의명",
        content: {
          type: "text",
          text: list[0],
          markdown: false,
        },
        accent: true,
      },
      {
        type: "description",
        term: "특강일",
        content: {
          type: "text",
          text: list[2],
          markdown: false,
        },
        accent: true,
      },
      {
        type: "description",
        term: "멘토",
        content: {
          type: "text",
          text: list[4],
          markdown: false,
        },
        accent: true,
      },
      {
        type: "button",
        text: "신청하기",
        style: "primary",
        action_type: "open_system_browser",
        value: list[1],
      },
    ];

    blocks.push(...blockKitContent);
  }

  return blocks;
};
