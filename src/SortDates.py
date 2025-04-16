import sys
import json
from datetime import datetime

def sortInterviewsByDate(data):
    sortedData = sorted(data, key=lambda x: datetime.strptime(x["date"], "%m-%d-%Y"))
    return sortedData

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read().strip() 
        if not input_data:
            raise ValueError("No input data provided to the script.")

        interviews = json.loads(input_data)  

        print(json.dumps(sortInterviewsByDate(interviews)))

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input - {str(e)}", file=sys.stderr)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)