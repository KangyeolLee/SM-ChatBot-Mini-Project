// routes/index.js
const express = require('express');
const router = express.Router();

const libKakaoWork = require('../libs/kakaoWork');
const crawling = require('../crawling/request');

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
        blocks: [
          {
            type: "header",
            text: "🎶 멘토특강 관심분야 설정 🌹",
            style: "yellow",
          },
          {
            type: "text",
            text:
              "안녕하세요? \n선호하는 멘토특강 및 자유멘토링 관심분야가 있나요? \n해당 카테고리를 알려주시면 *알리다*가 안내 드릴게요~ 💕",
            markdown: true,
          },
          {
            type: "button",
            action_type: "call_modal",
            value: "cafe_survey",
            text: "설문 참여하기",
            style: "default",
          },
        ],
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
          title: "카테고리 선정",
          accept: "전송",
          decline: "취소",
          value: "category_survey_results",
          blocks: [
            {
              type: "label",
              text: "원하시는 분야를 입력해주세요",
              markdown: false,
            },
            {
              type: "input",
              name: "category",
              required: true,
              placeholder: "ex) 백엔드",
            },
          ],
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
        blocks: [
          {
            type: "text",
            text:
              "카테고리를 선정하셨군요! 👍 \n 5초 정도만 기다려 주시면 곧 안내 드릴게요~ 😉",
            markdown: true,
          },
          {
            type: "text",
            text: "*선택 카테고리*",
            markdown: true,
          },
          {
            type: "description",
            term: "분야",
            content: {
              type: "text",
              text: actions.category,
              markdown: false,
            },
            accent: true,
          },
          {
            type: "description",
            term: "시간",
            content: {
              type: "text",
              text: action_time,
              markdown: false,
            },
            accent: true,
          },
        ],
      });
      break;
    default:
  }
    
  res.json({ result: true });
    
  const data = await crawling.getCrawlingData();
  const waitings = data.filter(arr => arr[0].includes(actions.category) && arr[3].includes("접수"));
    
  if(waitings.length) {  
      for(const list of waitings) {
        await libKakaoWork.sendMessage({
            conversationId: message.conversation_id,
            text: "선정한 카테고리에서 아직 접수중인 특강이에요!",
            blocks: [
              {
                type: 'header',
                text: actions.category + "분야 모집중 강의",
                style: 'blue'
              },
              {
                type: "image_link",
                url: "https://swmaestro.org/static/sw/images/logo.png"
              },
                {
                  "type": "description",
                  "term": "강의명",
                  "content": {
                    "type": "text",
                    "text": list[0],
                    "markdown": false
                  },
                  "accent": true
                },
                {
                  "type": "description",
                  "term": "시작날짜",
                  "content": {
                    "type": "text",
                    "text": list[2],
                    "markdown": false
                  },
                  "accent": true
                },
                {
                  "type": "description",
                  "term": "멘토이름",
                  "content": {
                    "type": "text",
                    "text": list[4],
                    "markdown": false
                  },
                  "accent": true
                },
                {
                  "type": "divider"
                },
                {
                  "type": "button",
                  "text": "신청하기",
                  "style": "primary",
                  "action_type": "open_system_browser",
                  "value": list[1],
                }
            ]
        });
      }
  } else {
      await libKakaoWork.sendMessage({
        conversationId: message.conversation_id,
        text: "선정한 카테고리 내 멘토링이 없어요 ㅠㅠ",
        blocks: [
          {
            type: "image_link",
            url: "https://swmaestro.org/static/sw/images/logo.png"
          },
          {
            type: "text",
            text:
              "아쉽지만 선택한 카테고리 내 멘토링이 개설되지 않았네요 😢 \n 다른 멘토링을 검색해보세요~",
            markdown: true,
          },
        ],
      });
  }

});

router.get('/new', async (req, res, next) => {
  console.log(req.query)
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
          blocks: [
            {
              type: "header",
              text: "강의가 추가되었습니다 📢",
              style: "blue"
            },
            {
              "type": "image_link",
              "url": "https://swmaestro.org/static/sw/images/logo.png"
            },
            {
              "type": "description",
              "term": "강의명",
              "content": {
                "type": "text",
                "text": req.query.title,
                "markdown": false
              },
              "accent": true
            },
            {
              "type": "divider"
            },
            {
              "type": "button",
              "text": "신청하기",
              "style": "primary",
              "action_type": "open_system_browser",
              "value": "https://swmaestro.org"+req.query.URL +"&menuNo=" + req.query.menuNo,
            }
          ]
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
