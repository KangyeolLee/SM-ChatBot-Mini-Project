import config
from selenium import webdriver


def get_session():
    driver = webdriver.Chrome('./chromedriver')
    driver.get('https://swmaestro.org/sw/member/user/forLogin.do?menuNo=200025')

    driver.find_element_by_name('username').send_keys(config.email)
    driver.find_element_by_name('password').send_keys(config.password)
    driver.find_element_by_css_selector('#login_form > div > div:nth-child(1) > div > dl > dd > button').click()

    driver.switch_to.alert.accept()

    cookies = driver.get_cookies()
    driver.close()

    result = [cookies[0]['value'], cookies[1]['value']]
    return result

