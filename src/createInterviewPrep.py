import sys
import json
import sqlite3
import google.generativeai as genai
import os

#to do
# make env, make it add other infomraiton with the description

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
    
    genai.configure(api_key="AIzaSyBakuPnIa9RO3cCQoZVvoJh846zjhCuVVE") # make env

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
    foundCat = False

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

        userId = parseData(interviewData,"userId")
        companyName = parseData(interviewData, "companyName")
        jobLocation = parseData(interviewData, "companyLocation")
        jobEmail = parseData(interviewData, "companyEmail")
        jobIndustry = parseData(interviewData, "companyIndustry")
        jobName = parseData(interviewData, "jobName")
        jobDate = parseData(interviewData, "jobDate")
        numInterviewers = parseData(interviewData, "numInterviewers")
        jobTime = parseData(interviewData,"jobTime")
        interviewDescription = parseData(interviewData, "interviewDescription")
        
        interviewInformation = [companyName, jobLocation, jobEmail, jobIndustry, jobName, jobDate, numInterviewers, jobTime, interviewDescription, userId]
        
        LLM_response = getLLM_response(interviewInformation)

        informationToSubmit = [interviewInformation[9], interviewInformation[0], interviewInformation[5], LLM_response]
        
        updateDb(informationToSubmit)

    except Exception as e:
        # Log any errors to stderr
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)