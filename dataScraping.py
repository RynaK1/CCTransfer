from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import sqlite3
import json


def getMajor(majorButton):
  return majorButton.find_element("xpath", ".//div[@class='viewByRowColText']").text


def getReceiving(row, driver):
  return row.find_element("xpath", ".//div[@class='rowReceiving']//div[@class='prefixCourseNumber']").text


def getSending(row, driver):
  driver.implicitly_wait(0)
  courses = row.find_elements("xpath", ".//div[@class='rowSending']//div[@class='prefixCourseNumber']")

  coursePrefixes = []
  for course in courses:
    coursePrefixes.append(course.text)

  driver.implicitly_wait(1)
  return coursePrefixes


def writeToFile(allCourseArticulations):
  conn = sqlite3.connect('courseTransfers.db')
  cursor = conn.cursor()

  cursor.execute('''CREATE TABLE IF NOT EXISTS course_articulations (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL)''')

  for key, value in allCourseArticulations.items():
    serialized_value = json.dumps(value)
    cursor.execute('INSERT INTO course_articulations (key, value) VALUES (?, ?)', (key, serialized_value))

  conn.commit()
  conn.close()


def scrapeData():
  driver = webdriver.Chrome()
  driver.implicitly_wait(10)
  driver.get("https://assist.org/transfer/results?year=74&institution=113&agreement=7&agreementType=to&view=agreement&viewBy=major&viewSendingAgreements=false")
  driver.fullscreen_window()

  majorButtons = driver.find_elements("xpath", "//div[@class='viewByRow']//a[@href='#']") 
  majorButtons.pop(0)

  data = {}

  for majorButton in majorButtons:
    try:
      driver.execute_script("arguments[0].scrollIntoView(false);", majorButton)
      majorButton.click()
      WebDriverWait(driver, 10).until(EC.presence_of_element_located(("xpath", "//div[@class='resultsBoxContent']")))

      courses = driver.find_element("xpath", "//div[@class='resultsBoxContent']")
      print(courses.find_element("xpath", "//section[@class='results']/app-report-preview/div/awc-agreement/div/awc-report-header/div[3]/h1").text)

    except TimeoutException:
      print("Error")

  driver.quit()

scrapeData()
#select a, b, c
#Complete [num] or more courses from [alphabet], ...
#Complete [num] courses from the following.
#Complete 1 sequence from [alphabet] or [alphabet]
#select [num] courses from section [alphabet]
#select up to [num] units from the following
#No course articulated
#Maximum credit from A or B
#AND/OR