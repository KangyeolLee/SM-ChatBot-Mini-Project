const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const configs = require("../configs/crawlingOps/crawlingOps");

exports.getSession = async () => {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  
    const page = await browser.newPage();
    await page.goto(configs.login_page);
    
    await page.evaluate((id, pw) => {
        document.querySelector('input#username').value = id;
        document.querySelector('input#password').value = pw;
    }, configs.swm_id, configs.swm_pw);
    
    page.on('dialog', async dialog => {
        await dialog.accept();
    });
    
    await page.click('button.btn5.btn_blue2');
    await page.waitForNavigation();
    
    const cookies = await page.cookies();

    // 모든 스크래핑 작업을 마치고 브라우저 닫기
    await browser.close();
    
    return [cookies[0].value, cookies[1].value];
};