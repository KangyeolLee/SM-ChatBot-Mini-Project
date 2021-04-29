// routes/index.js
const express = require("express");
const router = express.Router();

const libKakaoWork = require("../libs/kakaoWork");
const crawling = require("../crawling/request");
const blockKitsPack = require("../blockKit/blocks");

const BLOCKS_LENGTH = 5; // 하나의 특강 정보가 가지고 있는 블록킷 갯수
const PER_LIMIT = 9; // 하나의 메시지에 표현할 최대 특강 개수
const limit = BLOCKS_LENGTH * PER_LIMIT;

// 상호 평가 대응 API 요청 (기본 전송과 로직은 동일)
router.post("/chatbot", async (req, res, next) => {
  const users = await libKakaoWork.getUserList();

  const conversations = await Promise.all(
    users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
  );

  const messages = await Promise.all([
    conversations.map((conversation) =>
      libKakaoWork.sendMessage({
        conversationId: conversation.id,
        text: "관심분야 설정 안내",
        blocks: blockKitsPack.firstGuideMessage,
      })
    ),
  ]);

  res.json({
    users,
    conversations,
    messages,
  });
});

// 기본 챗봇 전송 요청
router.get("/", async (req, res, next) => {
  const users = await libKakaoWork.getUserList();

  const conversations = await Promise.all(
    users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
  );

  const messages = await Promise.all([
    conversations.map((conversation) =>
      libKakaoWork.sendMessage({
        conversationId: conversation.id,
        text: "관심분야 설정 안내",
        blocks: blockKitsPack.firstGuideMessage,
      })
    ),
  ]);

  res.json({
    users,
    conversations,
    messages,
  });
});

// 챗봇 유저 상호작용 요청
router.post("/request", async (req, res, next) => {
  const { message, value } = req.body;

  switch (value) {
    case "cafe_survey":
      // 설문조사용 모달 전송
      return res.json({
        view: {
          title: "관심분야 선정",
          accept: "전송",
          decline: "취소",
          value: "category_survey_results",
          blocks: blockKitsPack.surveyModalMessage,
        },
      });
      break;
    default:
  }

  res.json({});
});

// 챗봇 유저 상호작용 리턴값 응답
router.post("/callback", async (req, res, next) => {
  const { message, actions, action_time, value } = req.body; // 설문조사 결과 확인 (2)

  switch (value) {
    case "category_survey_results":
      await libKakaoWork.sendMessage({
        conversationId: message.conversation_id,
        text: "카테고리를 선정하셨군요!",
        blocks: blockKitsPack.callbackMessage(actions.category),
      });
      break;
    default:
  }

  res.json({ result: true });

  // 입력 키워드를 기준으로 모든 데이터 크롤링
  const data = await crawling.getCrawlingData(actions.category);
  // 현재 접수중인 특강 정보만 재추출
  const waitings = data.filter((arr) => arr[3].includes("접수"));

  if (waitings.length) {
    const blocks = blockKitsPack.makeBlockKitPackage(waitings);

    for (let i = 0; i < blocks.length; i += limit) {
      await libKakaoWork.sendMessage({
        conversationId: message.conversation_id,
        text: "입력한 카테고리에서 아직 접수중인 특강이에요!",
        blocks: [
          ...blockKitsPack.makeKeywordResultMessage(actions.category),
          ...blocks.slice(i, i + limit),
        ],
      });
    }
  } else {
    await libKakaoWork.sendMessage({
      conversationId: message.conversation_id,
      text: "선정한 카테고리 내 개설 또는 접수중인 멘토링이 없어요 ㅠㅠ",
      blocks: blockKitsPack.noResultMessage,
    });
  }
});

router.get("/new", async (req, res, next) => {
  const { URL, menuNo, title, date, name } = req.query;
  // 유저 목록 검색 (1)
  const users = await libKakaoWork.getUserList();

  // 검색된 모든 유저에게 각각 채팅방 생성 (2)
  const conversations = await Promise.all(
    users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
  );

  // 생성된 채팅방에 메세지 전송 (3)
  const messages = await Promise.all([
    conversations.map((conversation) =>
      libKakaoWork.sendMessage({
        conversationId: conversation.id,
        text: "새로운 강의가 추가되었습니다.",
        blocks: blockKitsPack.newUpdateMessage(URL, menuNo, title, date, name),
      })
    ),
  ]);

  res.json({
    users,
    conversations,
    messages,
  });
});

module.exports = router;
