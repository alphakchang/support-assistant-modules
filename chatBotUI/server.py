from flask import Flask, render_template, request, jsonify
import pandas as pd
import openai
import taskBot as tb

openai.api_key = ""

app = Flask(__name__)

if __name__ == "__main__":
    app.run()

@app.route('/')
def index():
    return render_template("index.html")


@app.route('/find_matches', methods=['POST'])
def find_matches():
    userMessage = request.json['message']
    database = pd.read_csv("./database/moodle.csv")
    tags = database["Tags"]
    tags_list = tags.tolist()
    concatenated_tags = ''
    range_string_dict = {}

    for index, item in enumerate(tags_list):
        start_index = len(concatenated_tags)
        concatenated_tags += item
        end_index = len(concatenated_tags)
        range_string_dict[index] = (start_index, end_index)

    prompt_1 = "I have a list of tags, each tag wrapped with square brackets: "
    prompt_2 = "Now read the following message then return the most relevant tags in their original forms, do not generate any new tags: "
    prompt_2_5 = "mmq means MemoQ, ppt means powerpoint. "
    prompt_3 = "If there are no relevant tags, type 'NO MATCH'"
    final_prompt =  prompt_1 + concatenated_tags + prompt_2 + userMessage + prompt_2_5 + prompt_3

    matched = gpt(final_prompt)
    # print(f"Matched tags = {matched}") #debug

    if matched == "NO MATCH":
        reply = matched
    else:
        trimmed_list = create_trimmed_list(matched)
        indices = find_indices_of_trimmed_list(concatenated_tags, range_string_dict, trimmed_list)
        reply = {}
        for i in indices:
            reply[database["Chapter"][i]] = database["URL"][i]
    # reply = {} #debug
    print(reply) #debug
    return {'reply': reply}

def gpt(prompt):
    completion = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[{
            'role': 'user',
            'content': prompt
        }],
        temperature=0
    )
    reply = completion.choices[0].message.content
    # return 1/0 #debug
    return reply

def create_trimmed_list(matched):
    matched_trim = matched.replace('"', '')
    matched_trim = matched_trim.strip('[]')
    trimmed_list = matched_trim.split(',')
    trimmed_list = [item.strip() for item in trimmed_list]
    return trimmed_list

def find_indices_of_trimmed_list(concatenated_tags, range_string_dict, trimmed_list):
    indices = []
    for item in trimmed_list:
        start_index = 0
        while start_index < len(concatenated_tags):
            start_index = concatenated_tags.find(item, start_index)
            if start_index == -1:
                break
            else:
                for index, range in range_string_dict.items():
                    if start_index >= range[0] and start_index < range[1]:
                        indices.append(index)
                        break
                start_index += 1
    indices_set = set(indices)
    return indices_set

@app.route('/grabList')
def grabList():
    listName = request.args.get('listName', None)

    lists = {
        'ticketTypes': tb.hrList_ticketTypes(),
        'strategicGroups': tb.hrList_strategicGroups()
    }

    if listName in lists:
        return jsonify({'reply': lists[listName]})
    else:
        return jsonify({'error': 'List not found'}), 404

@app.route('/raiseHRTicket', methods=['POST'])
def raiseHRTicket():
    data = request.get_json() # get data from request
    list_data = data['list'] # get the list from the data
    print(list_data)
    href_link = tb.create_hr_ticket(list_data)

    # return jsonify({'link': href_link})
    return {'link': href_link}

@app.route('/test')
def test():
    test = tb.hrList_ticketTypes()
    return {'reply': test}


