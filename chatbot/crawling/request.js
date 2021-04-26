const axios = require('axios');
const cheerio = require("cheerio");
const login = require('../crawling/login');
const configs = require("../configs/crawlingOps/crawlingOps");

exports.getCrawlingData = async () => {
    const [wcs_bt, JSESSIONID] = await login.getSession();
    const header = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Cookie': configs.cookie + "JSESSIONID=" + JSESSIONID + "; wcs_bt=" + wcs_bt,
        'Host': 'swmaestro.org',
        'Referer': 'https://swmaestro.org/sw/member/user/toLogin.do',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
        'sec-ch-ua-mobile': '?0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/53',
    }
    
    const res = await axios.get(configs.mentoring_page, { headers: header });
    
    const pageIndex = "&pageIndex=";
    const mentorings = [];

    for(let i = 1; i <= 10; i++) {
        const res = await axios.get(configs.mentoring_page + pageIndex + i, { headers: header });
        const $ = cheerio.load(res.data);
        
        $('table tbody tr').each((i, el) => {
            const title = String($(el).find('td.tit > div.rel > a').text());
            const link = "https://www.swmaestro.org" + String($(el).find('td.tit > div.rel > a').attr('href'));
            const date = String($(el).find('td:nth-of-type(4)').text());
            const status = String($(el).find('td:nth-of-type(6)').text());
            const name = String($(el).find('td:nth-of-type(7)').text());
            
            mentorings.push([title, link, date, status, name]);
        });
    }
    
    return mentorings;
}