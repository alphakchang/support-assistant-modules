from flask import Flask, render_template, request
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

@app.route('/gpt', methods=['POST'])
def gpt():
    completion = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[{
            'role': 'user',
            'content': request.json['message']
        }]
    )
    reply = completion.choices[0].message.content
    # return 1/0 #debug
    return {'reply': reply}

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
    final_message =  prompt_1 + concatenated_tags + prompt_2 + userMessage + prompt_2_5 + prompt_3

    completion = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[{
            'role': 'user',
            'content': final_message
        }],
        temperature=0
    )
    matched = completion.choices[0].message.content
    # print("---Start of matched tags---") #debug
    # print(matched) #debug
    # print("---End of matched tags---") #debug
    if matched == "NO MATCH":
        reply = matched
    else:
        trimmed_list = create_trimmed_list(matched)
        indices = find_indices_of_trimmed_list(concatenated_tags, range_string_dict, trimmed_list)
        reply = {}
        for i in indices:
            reply[database["Chapter"][i]] = database["URL"][i]
    # reply = {} #debug
    # print(reply) #debug
    return {'reply': reply}


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

@app.route('/test')
def test():
    tb.define_list()
    test = "hello"
    return {'reply': test}


