import sys
import json
from datetime import datetime

def sortInterviews(data):
    sortedData = sorted(data, key=lambda x: datetime.strptime(x["date"], "%m-%d-%Y"))
    return sortedData

if __name__ == "__main__":
    try:
        # Read JSON data from stdin
        input_data = sys.stdin.read().strip()  # Remove any leading/trailing whitespace
        if not input_data:
            raise ValueError("No input data provided to the script.")

        interviews = json.loads(input_data)  # Parse the JSON input into a Python list

        # Process and sort the interviews
        processed_interviews = sortInterviews(interviews)

        # Output the sorted data as JSON
        print(json.dumps(processed_interviews))
    except json.JSONDecodeError as e:
        # Handle JSON parsing errors
        print(f"Error: Invalid JSON input - {str(e)}", file=sys.stderr)
    except Exception as e:
        # Log any other errors to stderr
        print(f"Error: {str(e)}", file=sys.stderr)
