// routes/index.js
const express = require('express');
const router = express.Router();

const libKakaoWork = require('../libs/kakaoWork');

router.get('/', async (req, res, next) => {
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
