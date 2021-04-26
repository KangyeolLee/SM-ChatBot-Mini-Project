import config
from selenium import webdriver


def get_session():
    options = webdriver.ChromeOptions()
    options.add_argument('headless')
    options.add_argument("--no-sandbox")
    options.add_argument('window-size=1920x1080')
    options.add_argument("disable-gpu")
    options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/53")
    driver = webdriver.Chrome(options=options)
    driver.get('https://swmaestro.org/sw/member/user/forLogin.do?menuNo=200025')

    driver.find_element_by_name('username').send_keys(config.email)
    driver.find_element_by_name('password').send_keys(config.password)
    driver.find_element_by_css_selector('#login_form > div > div:nth-child(1) > div > dl > dd > button').click()

    driver.switch_to.alert.accept()

    cookies = driver.get_cookies()
    driver.close()

    result = [cookies[0]['value'], cookies[1]['value']]
    return result

print(get_session())
