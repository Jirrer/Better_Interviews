import sys
import sqlite3
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

def updateDb(info):
        connection = sqlite3.connect("db/better_interviews.db")
        cursor = connection.cursor()

        cursor.execute("""
        INSERT INTO interviews (user_id, status, company_name, date, description)
        VALUES (?, ?, ?,?,?)
        """, (info[0], "Pending", info[1], info[2], info[3])) 

        connection.commit()
        connection.close()

def getLLM_response(info):
    if not info:
        print("Error: No data provided to LLM.")
        return "No response generated."
    
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

    model = genai.GenerativeModel('gemini-2.0-flash')

    prompt = f'''
    I am preparing for a job interview. I want you to give me a study guide/prep based off of the following job description: \n
    company name = {info[0]}
    company location = {info[1]}
    company email = {info[2]}
    company industry = {info[3]}
    job date = {info[4]}
    job name = {info[5]}
    number of interviewers = {info[6]}
    length of interview = {info[7]}
    description of the role/company: \n
    {info[8]}
    '''

    response = model.generate_content(prompt)

    return response.text  
    
def parseData(data, find):
    searchIndex = 0
    foundIndex = 0
    endIndex = len(data)

    for x in range(len(data) - 1):
        if searchIndex < len(find):
            if data[x] == find[searchIndex]:
                searchIndex += 1
            else:
                searchIndex = 0

        if searchIndex < len(find) - 1:
            continue
    
        elif searchIndex == len(find) - 1:
            foundIndex = x

        elif data[x] == '|':
            endIndex = x
            break 

    return data[foundIndex + 3:endIndex]

if __name__ == "__main__":
    try:
        interviewData = sys.stdin.read()

        interviewInformation = [
            parseData(interviewData, "companyName"), 
            parseData(interviewData, "companyLocation"), 
            parseData(interviewData, "companyEmail"), 
            parseData(interviewData, "companyIndustry"), 
            parseData(interviewData, "jobName"), 
            parseData(interviewData, "jobDate"), 
            parseData(interviewData, "numInterviewers"), 
            parseData(interviewData,"jobTime"), 
            parseData(interviewData, "interviewDescription"), 
            parseData(interviewData,"userId")
        ]
        
        LLM_response = getLLM_response(interviewInformation)
        
        updateDb([interviewInformation[9], interviewInformation[0], interviewInformation[5], LLM_response])

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)