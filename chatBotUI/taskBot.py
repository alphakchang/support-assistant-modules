from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def get_ticket_types():
    options = Options()
    # options.add_argument("-headless")
    driver = webdriver.Chrome(options=options)
    driver.get("https://support.alphacrc.com:9676/portal/page/116-hr")

    email = "kchang@thisisalpha.com"
    driver.find_element(By.XPATH, "//input[@label='Email:']").send_keys(email)
    driver.find_element(By.XPATH, "//button[@data-button-type='submit']").click()

    # Select the first dropdown menu
    # wait for 10 seconds max so that the element is loaded
    ticket_types = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "select#custom_ticket_form_field_125"))
    )
    selectedType = Select(ticket_types)
    selectedType.select_by_index(1)

    for items in selectedType.options:
        print(items.text)
    driver.quit()

def hrList_ticketTypes():
    return ["Starter", "Leaver", "Change department", "Office management", "Linguistic quality issues", "Ideas"]

def hrList_strategicGroups():
    return ["AVA", "Burberry", "China", "Games", "Germany", "LQA", "Nexus", "LTC", "Other"]

def define_list():
    list = [1, "John Doe", "Cambridge", 1, "n/a", "summary", "description", "18-07-2023"]
    return create_hr_ticket(list)

def create_hr_ticket(list):
    options = Options()
    # options.add_argument("-headless")
    driver = webdriver.Chrome(options=options)
    driver.get("https://support.alphacrc.com:9676/portal/page/116-hr")
    email = "kchang@thisisalpha.com"
    driver.find_element(By.XPATH, "//input[@label='Email:']").send_keys(email)
    driver.find_element(By.XPATH, "//button[@data-button-type='submit']").click()

    ticket_types = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "select#custom_ticket_form_field_125"))
    )
    selectedType = Select(ticket_types)
    selectedType.select_by_index(list[0])

    driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_202']").send_keys(list[1])
    driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_203']").send_keys(list[2])
    strategic_groups = driver.find_element(By.CSS_SELECTOR, "select#custom_ticket_form_field_204")
    selectedGroup = Select(strategic_groups)
    selectedGroup.select_by_index(list[3])
    driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_240']").send_keys(list[4])
    driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_126']").send_keys(list[5])
    driver.find_element(By.XPATH, "//textarea[@id='custom_ticket_form_field_127']").send_keys(list[6])
    driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_129_custom_ticket_form_field_129_date']").send_keys(list[7])

    # driver.quit()

if __name__ == "__main__":
    get_ticket_types()
    hrList_ticketTypes()
    hrList_strategicGroups()
    define_list()
    create_hr_ticket()
