import requests
import config
import login
import json
import time
from bs4 import BeautifulSoup

(wcs_bt, JSESSIONID) = " ", ""

while True:
    time.sleep(60)
    # 최신 게시물의 id값 가져오기
    with open('./page.json', 'r') as f:
        json_data =json.load(f)

    max_page = json_data['page']
    updated = False
    
    head = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Cookie': config.cookie + "JSESSIONID=" + JSESSIONID + "; wcs_bt=" + wcs_bt,
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

    url = "https://swmaestro.org/sw/mypage/mentoLec/list.do?menuNo=200046"
    r = requests.get(url=url, headers=head)
    soup = BeautifulSoup(r.content, 'html.parser')
    result = soup.select('#contentsList > div > div > div > table > tbody > tr')

    # 로그인이 안된 경우
    if not result:
        (wcs_bt, JSESSIONID) = login.get_session()
        continue

    for target in result:
        t = target.select('td.tit > div.rel > a')
        date = target.select('td:nth-of-type(4)')[0].get_text();
        name = target.select('td:nth-of-type(7)')[0].get_text();
        print(date, name)
        title = t[0].get_text()
        link = t[0]['href']
        index = 37
        num = ""

        # 게시글의 번호를 파싱
        while True:
            if link[index] == '&':
                break
            else:
                num += link[index]
                index += 1
        # 마지막 게시물보다 큰 값이 발견되면 알림!
        if num > json_data['page']:
            updated = True
            requests.get("http://localhost:3000/new?URL="+link+"&title="+title+"&date="+date+"&name="+name)
            if max_page < num:
                max_page = num


    if updated:
        json_data['page'] = max_page
        with open('./page.json', 'w', encoding='utf-8') as make_file:
            json.dump(json_data, make_file, indent="\t")