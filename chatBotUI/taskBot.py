from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def hrList_ticketTypes():
    # return ["Starter", "Leaver", "Change department", "Office management", "Linguistic quality issues", "Ideas"]
    return ["Starter", "Leaver", "Change department"]

def hrList_strategicGroups():
    return ["AVA", "Burberry", "China", "Games", "Germany", "LQA", "Nexus", "LTC", "Other"]


def create_hr_ticket(list):
    # Open browser and get to HR ticket URL
    options = Options()
    # options.add_argument("-headless")
    driver = webdriver.Firefox(options=options)
    driver.get("https://support.alphacrc.com:9676/portal/page/116-hr")

    # Login
    email = create_email(list)
    driver.find_element(By.XPATH, "//input[@label='Email:']").send_keys(email)
    driver.find_element(By.XPATH, "//button[@data-button-type='submit']").click()

    # Start filling out ticket
    # 1. Ticket type
    ticket_types = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//select[@id='custom_ticket_form_field_125']"))
    )
    selectedType = Select(ticket_types)
    selectedType.select_by_index(list[1])

    # 2. Full name
    driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_202']").send_keys(list[2].title())

    # 3. Office
    driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_203']").send_keys(list[3].capitalize())

    # 4. Strategic group
    strategic_groups = driver.find_element(By.CSS_SELECTOR, "select#custom_ticket_form_field_204")
    selectedGroup = Select(strategic_groups)
    selectedGroup.select_by_index(list[4])

    # 5. Mail aliaes
    driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_240']").send_keys(list[5])

    # 6. Summary
    summary = create_summary(list)
    driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_126']").send_keys(summary)

    # 7. Description
    description = create_description(list)
    driver.find_element(By.XPATH, "//textarea[@id='custom_ticket_form_field_127']").send_keys(description)

    # 8. Date
    if list[1] == 2: # Leaver
        driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_130_custom_ticket_form_field_130_date']").send_keys(list[8])

    else:
        driver.find_element(By.XPATH, "//input[@id='custom_ticket_form_field_129_custom_ticket_form_field_129_date']").send_keys(list[8])

    # 9. Submit
    submit = driver.find_element(By.XPATH, "//button[@class='sui-bttn-primary sui-bttn ']")
    submit.click()

    # 10. Obtain the link
    ticketTitle = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//div[contains(@class,'builtin-block view_ticket')]//h2[1]"))
    )
    ticketURL = driver.current_url
    link = {}
    link[ticketTitle.text] = ticketURL
    driver.quit()

    return link

def create_email(list):
    username = list[0]
    email_address = username + "@thisisalpha.com"
    return email_address

def create_summary(list):
    summary = "<AI TESTING TICKET, PLEASE IGNORE>: " + hrList_ticketTypes()[list[1]-1] + " - " + list[2].title() + " - " + list[8] + " - " + list[6].upper() + " - " + list[3].capitalize()
    return summary

def create_description(list):
    greeting = "Hello, this is a ticket for - " + hrList_ticketTypes()[list[1]-1] + "\n\n"
    fullname = "Full name: " + list[2].title() + "\n"
    centre = "Cost Centre: " + list[6].upper() + "\n"
    department = "Department: " + list[7].upper() + "\n"
    office = "Office: " + list[3].capitalize() + "\n"
    date = "Effective Date: " + list[8] + "\n\n"

    if list[1] == 1: # Starter
        notes = "Note:\nPlease setup the following:\nAlpha computer\nAlpha email account\nTWeb\nMoodle\n\n"
        additional = "Additional Info:\n" + list[9] + "\n"

    elif list[1] == 2: # Leaver
        notes = "Holiday arrangement:\n" + list[9] + "\n\n"
        additional = "Additional Info:\n" + list[10] + "\n"
    
    else:
        notes = ""
        additional = "Additional Info:\n" + list[9] + "\n"

    description = greeting + fullname + centre + department + office + date + notes + additional

    return description

if __name__ == "__main__":
    hrList_ticketTypes()
    hrList_strategicGroups()
    create_hr_ticket(list)
    create_email(list)
    create_summary(list)
    create_description(list)
