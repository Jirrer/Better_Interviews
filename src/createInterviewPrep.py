import sys
import json
import sqlite3
import google.generativeai as genai
import os

#to do
# make env, make it add other infomraiton with the description

def updateDb(data, description):
        connection = sqlite3.connect("db/better_interviews.db")
        cursor = connection.cursor()

        cursor.execute("""
        INSERT INTO interviews (user_id, description, status)
        VALUES (?, ?, ?)
        """, (2, description, "pending")) 


        connection.commit()
        connection.close()

def getLLM_response(data):
    genai.configure(api_key="AIzaSyBakuPnIa9RO3cCQoZVvoJh846zjhCuVVE") # make env

    model = genai.GenerativeModel('gemini-2.0-flash')

    prompt = "I am preparing for a job interview. I want you to give me a study guide/prep based off of the following job description: \n" + data 
    response = model.generate_content(prompt)

    return response.text  


def getDescription(data):
    search = "interviewDescription"
    searchIndex = 0
    foundIndex = -1

    for x in range(len(data)):
        if data[x] == search[searchIndex]:
            searchIndex += 1
        else:
            searchIndex = 0

        if searchIndex >= 20:
            foundIndex = x
            break

    if foundIndex > 0:
        return data[foundIndex + 5: len(data) - 3]
    else:
        print("Error processing data.")
        

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        print(input_data)
        interviewData = json.loads(input_data)
        interviewDescription = getDescription(input_data)
        LLM_response = getLLM_response(interviewDescription)
        updateDb(interviewData, LLM_response)

    except Exception as e:
        # Log any errors to stderr
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)