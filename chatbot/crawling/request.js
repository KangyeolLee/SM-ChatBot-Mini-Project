const axios = require("axios");
const cheerio = require("cheerio");
const login = require("../crawling/login");
const configs = require("../configs/crawlingOps/crawlingOps");

let wcs_bt = " ";
let JSESSIONID = "";

exports.getCrawlingData = async (keyword) => {
  const mentorings = [];
  const encodedKeyword = encodeURIComponent(keyword);

  let res = await axios.get(configs.search_page(1, encodedKeyword), {
    headers: setHeaders(JSESSIONID, wcs_bt),
  });

  if (res.data.includes("로그인")) {
    [wcs_bt, JSESSIONID] = await login.getSession();
    res = await axios.get(configs.search_page(1, encodedKeyword), {
      headers: setHeaders(JSESSIONID, wcs_bt),
    });
  }

  const $ = cheerio.load(res.data);
  const total = $("div.total > strong").text();
  const maxPages = Math.ceil(total / 10);

  parsingHTML(res.data, mentorings);

  for (let i = 2; i <= maxPages; i++) {
    const next = await axios.get(configs.search_page(i, encodedKeyword), {
      headers: setHeaders(JSESSIONID, wcs_bt),
    });

    parsingHTML(next.data, mentorings);
  }

  return mentorings;
};

const parsingHTML = (htmlData, arr) => {
  const $ = cheerio.load(htmlData);

  $("table tbody tr").each((i, el) => {
    const title = String($(el).find("td.tit > div.rel > a").text());
    const link =
      "https://www.swmaestro.org" +
      String($(el).find("td.tit > div.rel > a").attr("href"));
    const date = String($(el).find("td:nth-of-type(4)").text());
    const status = String($(el).find("td:nth-of-type(6)").text());
    const name = String($(el).find("td:nth-of-type(7)").text());

    arr.push([title, link, date, status, name]);
  });
};

const setHeaders = (sid, wid) => {
  const header = {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "max-age=0",
    Connection: "keep-alive",
    Cookie: configs.cookie + "JSESSIONID=" + sid + "; wcs_bt=" + wid,
    Host: "swmaestro.org",
    Referer: "https://swmaestro.org/sw/member/user/toLogin.do",
    "sec-ch-ua":
      '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
    "sec-ch-ua-mobile": "?0",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/53",
  };

  return header;
};
