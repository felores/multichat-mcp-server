# Initial Setup
Register and make a successful API request
##
[​](https://docs.perplexity.ai/guides/<#registration>)
Registration
  * Start by visiting the [API Settings page](https://docs.perplexity.ai/guides/<https:/www.perplexity.ai/pplx-api>)   


![](https://mintlify.s3.us-west-1.amazonaws.com/perplexity/images/24cc167-Screenshot_2023-11-28_at_6.19.34_PM.png)     
  * Register your credit card to get started


This step will not charge your credit card. It just stores payment information for later API usage.
![](https://mintlify.s3.us-west-1.amazonaws.com/perplexity/images/50d9caa-Screenshot_2023-11-28_at_6.23.21_PM.png)     
##
[​](https://docs.perplexity.ai/guides/<#generate-an-api-key>)
Generate an API key
  * Every API call needs a valid API key


The API key is a long-lived access token that can be used until it is manually refreshed or deleted.
![](https://mintlify.s3.us-west-1.amazonaws.com/perplexity/images/c83bb1f-Screenshot_2023-11-28_at_6.41.40_PM.png)     
Send the API key as a bearer token in the Authorization header with each API request.
When you run out of credits, your API keys will be blocked until you add to your credit balance. You can avoid this by configuring “Automatic Top Up”, which refreshes your balance whenever you drop below $2.
##
[​](https://docs.perplexity.ai/guides/<#make-your-api-call>)
Make your API call
  * The API is conveniently OpenAI client-compatible for easy integration with existing applications.


cURL
Copy
```
curl --location 'https://api.perplexity.ai/chat/completions' \
--header 'accept: application/json' \
--header 'content-type: application/json' \
--header 'Authorization: Bearer {API_KEY}' \
--data '{
 "model": "sonar-pro ",
 "messages": [
  {
   "role": "system",
   "content": "Be precise and concise."
  },
  {
   "role": "user",
   "content": "How many stars are there in our galaxy?"
  }
 ]
}'

```

python
Copy
```
from openai import OpenAI
YOUR_API_KEY = "INSERT API KEY HERE"
messages = [
  {
    "role": "system",
    "content": (
      "You are an artificial intelligence assistant and you need to "
      "engage in a helpful, detailed, polite conversation with a user."
    ),
  },
  {
    "role": "user",
    "content": (
      "How many stars are in the universe?"
    ),
  },
]
client = OpenAI(api_key=YOUR_API_KEY, base_url="https://api.perplexity.ai")
# chat completion without streaming
response = client.chat.completions.create(
  model="sonar-pro",
  messages=messages,
)
print(response)
# chat completion with streaming
response_stream = client.chat.completions.create(
  model="sonar-pro",
  messages=messages,
  stream=True,
)
for response in response_stream:
  print(response)

```



# Supported Models
Model| Context Length| Model Type
---|---|---
`sonar-reasoning`| 127k| Chat Completion
`sonar-pro`| 200k| Chat Completion
`sonar`| 127k| Chat Completion
  1. `sonar-pro` has a max output token limit of 8k
  2. `sonar-reasoning` outputs CoT in its response as well


##
[​](https://docs.perplexity.ai/guides/<#legacy-models>)
Legacy Models
These models will be deprecated and will no longer be available to use after 2/22/2025
Model| Context Length| Model Type
---|---|---
`llama-3.1-sonar-small-128k-online`| 127k| Chat Completion
`llama-3.1-sonar-large-128k-online`| 127k| Chat Completion
`llama-3.1-sonar-huge-128k-online`| 127k| Chat Completion
[Initial Setup](https://docs.perplexity.ai/guides/</guides/getting-started>)[Pricing](https://docs.perplexity.ai/guides/</guides/pricing>)
[twitter](https://docs.perplexity.ai/guides/<https:/twitter.com/perplexity_ai>)[linkedin](https://docs.perplexity.ai/guides/<https:/www.linkedin.com/company/perplexity-ai/>)[discord](https://docs.perplexity.ai/guides/<https:/discord.com/invite/perplexity-ai>)[website](https://docs.perplexity.ai/guides/<https:/labs.perplexity.ai/>)
On this page
  * [Legacy Models](https://docs.perplexity.ai/guides/<#legacy-models>)

# Structured Outputs Guide
Structured outputs is currently a beta feature
##
[​](https://docs.perplexity.ai/guides/<#overview>)
Overview
We currently support two types of structured outputs: **JSON Schema** and **Regex**. LLM responses will work to match the specified format, except for the following cases:
  * The output exceeds `max_tokens`


Enabling the structured outputs can be done by adding a `response_format` field in the request:
**JSON Schema**
  * `response_format: { type: "json_schema", json_schema: {"schema": object} }` .
  * The schema should be a valid JSON schema object.


**Regex** (only avilable for `sonar` right now)
  * `response_format: { type: "regex", regex: {"regex": str} }` .
  * The regex is a regular expression string.


We recommend to give the LLM some hints about the output format in the prompts.
The first request with a new JSON Schema or Regex expects to incur delay on the first token. Typically, it takes 10 to 30 seconds to prepare the new schema. Once the schema has been prepared, the subsequent requests will not see such delay.
##
[​](https://docs.perplexity.ai/guides/<#examples>)
Examples
###
[​](https://docs.perplexity.ai/guides/<#1-get-a-response-in-json-format>)
1. Get a response in JSON format
**Request**
python
Copy
```
import requests
from pydantic import BaseModel
class AnswerFormat(BaseModel):
  first_name: str
  last_name: str
  year_of_birth: int
  num_seasons_in_nba: int
url = "https://api.perplexity.ai/chat/completions"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
payload = {
  "model": "sonar",
  "messages": [
    {"role": "system", "content": "Be precise and concise."},
    {"role": "user", "content": (
      "Tell me about Michael Jordan. "
      "Please output a JSON object containing the following fields: "
      "first_name, last_name, year_of_birth, num_seasons_in_nba. "
    )},
  ],
  "response_format": {
                  "type": "json_schema",
    "json_schema": {"schema": AnswerFormat.model_json_schema()},
  },
}
response = requests.post(url, headers=headers, json=payload).json()
print(response["choices"][0]["message"]["content"])

```

**Response**
Copy
```
{"first_name":"Michael","last_name":"Jordan","year_of_birth":1963,"num_seasons_in_nba":15}

```

###
[​](https://docs.perplexity.ai/guides/<#2-use-a-regex-to-output-the-format>)
2. Use a regex to output the format
**Request**
python
Copy
```
import requests
url = "https://api.perplexity.ai/chat/completions"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
payload = {
  "model": "sonar",
  "messages": [
    {"role": "system", "content": "Be precise and concise."},
    {"role": "user", "content": "What is the IPv4 address of OpenDNS DNS server?"},
  ],
  "response_format": {
                  "type": "regex",
    "regex": {"regex": r"(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)"},  
  },
}
response = requests.post(url, headers=headers, json=payload).json()
print(response["choices"][0]["message"]["content"])

```

**Response**
Copy
```
208.67.222.222

```

##
[​](https://docs.perplexity.ai/guides/<#best-practices>)
Best Practices
###
[​](https://docs.perplexity.ai/guides/<#generating-responses-in-a-json-format>)
Generating responses in a JSON Format
For Python users, we recommend using the Pydantic library to [generate JSON schema](https://docs.perplexity.ai/guides/<https:/docs.pydantic.dev/latest/api/base_model/#pydantic.BaseModel.model_json_schema>).
**Unsupported JSON Schemas**
Recursive JSON schema is not supported. As a result of that, unconstrained objects are not supported either. Here’s a few example of unsupported schemas:
Copy
```
# UNSUPPORTED!
from typing import Any
class UnconstrainedDict(BaseModel):
  unconstrained: dict[str, Any]
class RecursiveJson(BaseModel):
  value: str
  child: list["RecursiveJson"]

```

###
[​](https://docs.perplexity.ai/guides/<#generating-responses-using-a-regex>)
Generating responses using a regex
**Supported Regex**
  * Characters: `\d`, `\w`, `\s` , `.`
  * Character classes: `[0-9A-Fa-f]` , `[^x]`
  * Quantifiers: `*`, `?` , `+`, `{3}`, `{2,4}` , `{3,}`
  * Alternation: `|`
  * Group: `( ... )`
  * Non-capturing group: `(?: ... )`
  * Positive lookahead: `(?= ... )`
  * Negative lookahead: `(?! ... )`


**Unsupported Regex**
  * Contents of group: `\1`
  * Anchors: `^`, `$`, `\b`
  * Positive look-behind: `(?<= ... )`
  * Negative look-behind: `(?<! ... )`
  * Recursion: `(?R)`


[Rate Limits and Usage Tiers](https://docs.perplexity.ai/guides/</guides/usage-tiers>)[Prompt Guide](https://docs.perplexity.ai/guides/</guides/prompt-guide>)
[twitter](https://docs.perplexity.ai/guides/<https:/twitter.com/perplexity_ai>)[linkedin](https://docs.perplexity.ai/guides/<https:/www.linkedin.com/company/perplexity-ai/>)[discord](https://docs.perplexity.ai/guides/<https:/discord.com/invite/perplexity-ai>)[website](https://docs.perplexity.ai/guides/<https:/labs.perplexity.ai/>)
On this page
  * [Overview](https://docs.perplexity.ai/guides/<#overview>)
  * [Examples](https://docs.perplexity.ai/guides/<#examples>)
  * [1. Get a response in JSON format](https://docs.perplexity.ai/guides/<#1-get-a-response-in-json-format>)
  * [2. Use a regex to output the format](https://docs.perplexity.ai/guides/<#2-use-a-regex-to-output-the-format>)     
  * [Best Practices](https://docs.perplexity.ai/guides/<#best-practices>)
  * [Generating responses in a JSON Format](https://docs.perplexity.ai/guides/<#generating-responses-in-a-json-format>)
  * [Generating responses using a regex](https://docs.perplexity.ai/guides/<#generating-responses-using-a-regex>)

# Chat Completions
Generates a model’s response for the given chat conversation.
POST
/
chat
/
completions
Try it
cURL
Python
JavaScript
PHP
Go
Java
Copy
```
curl --request POST \
 --url https://api.perplexity.ai/chat/completions \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '{
 "model": "sonar",
 "messages": [
  {
   "role": "system",
   "content": "Be precise and concise."
  },
  {
   "role": "user",
   "content": "How many stars are there in our galaxy?"
  }
 ],
 "max_tokens": "Optional",
 "temperature": 0.2,
 "top_p": 0.9,
 "search_domain_filter": [
  "perplexity.ai"
 ],
 "return_images": false,
 "return_related_questions": false,
 "search_recency_filter": "month",
 "top_k": 0,
 "stream": false,
 "presence_penalty": 0,
 "frequency_penalty": 1,
 "response_format": null
}'
```

200
422
Copy
```
{
 "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
 "model": "sonar",
 "object": "chat.completion",
 "created": 1724369245,
 "citations": [
  "https://www.astronomy.com/science/astro-for-kids-how-many-stars-are-there-in-space/",
  "https://www.esa.int/Science_Exploration/Space_Science/Herschel/How_many_stars_are_there_in_the_Universe",
  "https://www.space.com/25959-how-many-stars-are-in-the-milky-way.html",
  "https://www.space.com/26078-how-many-stars-are-there.html",
  "https://en.wikipedia.org/wiki/Milky_Way"
 ],
 "choices": [
  {
   "index": 0,
   "finish_reason": "stop",
   "message": {
    "role": "assistant",
    "content": "The number of stars in the Milky Way galaxy is estimated to be between 100 billion and 400 billion stars. The most recent estimates from the Gaia mission suggest that there are approximately 100 to 400 billion stars in the Milky Way, with significant uncertainties remaining due to the difficulty in detecting faint red dwarfs and brown dwarfs."
   },
   "delta": {
    "role": "assistant",
    "content": ""
   }
  }
 ],
 "usage": {
  "prompt_tokens": 14,
  "completion_tokens": 70,
  "total_tokens": 84
 }
}
```

#### Authorizations
[​](https://docs.perplexity.ai/api-reference/<#authorization-authorization>)
Authorization
string
header
required
Bearer authentication header of the form `Bearer <token>`, where `<token>` is your auth token.
#### Body
application/json
[​](https://docs.perplexity.ai/api-reference/<#body-messages>)
messages
object[]
required
A list of messages comprising the conversation so far.
Show child attributes
[​](https://docs.perplexity.ai/api-reference/<#body-messages-content>)
messages.content
string
required
The contents of the message in this turn of conversation.
[​](https://docs.perplexity.ai/api-reference/<#body-messages-role>)
messages.role
enum<string>
required
The role of the speaker in this turn of conversation. After the (optional) system message, user and assistant roles should alternate with `user` then `assistant`, ending in `user`.
Available options:
`system`,
`user`,
`assistant`
[​](https://docs.perplexity.ai/api-reference/<#body-model>)
model
string
required
The name of the model that will complete your prompt. Refer to [Supported Models](https://docs.perplexity.ai/api-reference/<https:/docs.perplexity.ai/docs/model-cards>) to find all the models offered.
[​](https://docs.perplexity.ai/api-reference/<#body-frequency-penalty>)
frequency_penalty
number
default:
1
A multiplicative penalty greater than 0. Values greater than 1.0 penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. A value of 1.0 means no penalty. Incompatible with `presence_penalty`.
Required range: `x > 0`
[​](https://docs.perplexity.ai/api-reference/<#body-max-tokens>)
max_tokens
integer
The maximum number of completion tokens returned by the API. The number of tokens requested in `max_tokens` plus the number of prompt tokens sent in messages must not exceed the context window token limit of model requested. If left unspecified, then the model will generate tokens until either it reaches its stop token or the end of its context window.   
[​](https://docs.perplexity.ai/api-reference/<#body-presence-penalty>)
presence_penalty
number
default:
0
A value between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. Incompatible with `frequency_penalty`.
Required range: `-2 < x < 2`
[​](https://docs.perplexity.ai/api-reference/<#body-response-format>)
response_format
object
Enable structured outputs with a JSON or Regex schema. Refer to the guide [here](https://docs.perplexity.ai/api-reference/<https:/docs.perplexity.ai/guides/structured-outputs>) for more information on how to use this parameter.
[​](https://docs.perplexity.ai/api-reference/<#body-return-images>)
return_images
boolean
default:
false
Determines whether or not a request to an online model should return images.
[​](https://docs.perplexity.ai/api-reference/<#body-return-related-questions>)
return_related_questions
boolean
default:
false
Determines whether or not a request to an online model should return related questions.
[​](https://docs.perplexity.ai/api-reference/<#body-search-domain-filter>)
search_domain_filter
any[]
Given a list of domains, limit the citations used by the online model to URLs from the specified domains. Currently limited to only 3 domains for whitelisting and blacklisting. For **blacklisting** add a `-` to the beginning of the domain string.
[​](https://docs.perplexity.ai/api-reference/<#body-search-recency-filter>)
search_recency_filter
string
Returns search results within the specified time interval - does not apply to images. Values include `month`, `week`, `day`, `hour`.
[​](https://docs.perplexity.ai/api-reference/<#body-stream>)
stream
boolean
default:
false
Determines whether or not to incrementally stream the response with [server-sent events](https://docs.perplexity.ai/api-reference/<https:/developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format>) with `content-type: text/event-stream`.
[​](https://docs.perplexity.ai/api-reference/<#body-temperature>)
temperature
number
default:
0.2
The amount of randomness in the response, valued between 0 inclusive and 2 exclusive. Higher values are more random, and lower values are more deterministic.
Required range: `0 < x < 2`
[​](https://docs.perplexity.ai/api-reference/<#body-top-k>)
top_k
number
default:
0
The number of tokens to keep for highest top-k filtering, specified as an integer between 0 and 2048 inclusive. If set to 0, top-k filtering is disabled. We recommend either altering top_k or top_p, but not both.
Required range: `0 < x < 2048`
[​](https://docs.perplexity.ai/api-reference/<#body-top-p>)
top_p
number
default:
0.9
The nucleus sampling threshold, valued between 0 and 1 inclusive. For each subsequent token, the model considers the results of the tokens with top_p probability mass. We recommend either altering top_k or top_p, but not both.
Required range: `0 < x < 1`
#### Response
200 - application/json
[​](https://docs.perplexity.ai/api-reference/<#response-choices>)
choices
object[]
The list of completion choices the model generated for the input prompt.
Show child attributes
[​](https://docs.perplexity.ai/api-reference/<#response-choices-delta>)
choices.delta
object
The incrementally streamed next tokens. Only meaningful when `stream = true`.
Show child attributes
[​](https://docs.perplexity.ai/api-reference/<#response-choices-delta-content>)
choices.delta.content
string
required
The contents of the message in this turn of conversation.
[​](https://docs.perplexity.ai/api-reference/<#response-choices-delta-role>)
choices.delta.role
enum<string>
required
The role of the speaker in this turn of conversation. After the (optional) system message, user and assistant roles should alternate with `user` then `assistant`, ending in `user`.
Available options:
`system`,
`user`,
`assistant`
[​](https://docs.perplexity.ai/api-reference/<#response-choices-finish-reason>)
choices.finish_reason
enum<string>
The reason the model stopped generating tokens. Possible values include `stop` if the model hit a natural stopping point, or `length` if the maximum number of tokens specified in the request was reached.
Available options:
`stop`,
`length`
[​](https://docs.perplexity.ai/api-reference/<#response-choices-index>)
choices.index
integer
[​](https://docs.perplexity.ai/api-reference/<#response-choices-message>)
choices.message
object
The message generated by the model.
Show child attributes
[​](https://docs.perplexity.ai/api-reference/<#response-choices-message-content>)
choices.message.content
string
required
The contents of the message in this turn of conversation.
[​](https://docs.perplexity.ai/api-reference/<#response-choices-message-role>)
choices.message.role
enum<string>
required
The role of the speaker in this turn of conversation. After the (optional) system message, user and assistant roles should alternate with `user` then `assistant`, ending in `user`.
Available options:
`system`,
`user`,
`assistant`
[​](https://docs.perplexity.ai/api-reference/<#response-citations>)
citations
any[]
Citations for the generated answer.
[​](https://docs.perplexity.ai/api-reference/<#response-created>)
created
integer
The Unix timestamp (in seconds) of when the completion was created.
[​](https://docs.perplexity.ai/api-reference/<#response-id>)
id
string
An ID generated uniquely for each response.
[​](https://docs.perplexity.ai/api-reference/<#response-model>)
model
string
The model used to generate the response.
[​](https://docs.perplexity.ai/api-reference/<#response-object>)
object
string
The object type, which always equals `chat.completion`.
[​](https://docs.perplexity.ai/api-reference/<#response-usage>)
usage
object
Usage statistics for the completion request.
Show child attributes
[​](https://docs.perplexity.ai/api-reference/<#response-usage-completion-tokens>)
usage.completion_tokens
integer
The number of tokens generated in the response output.
[​](https://docs.perplexity.ai/api-reference/<#response-usage-prompt-tokens>)
usage.prompt_tokens
integer
The number of tokens provided in the request prompt.
[​](https://docs.perplexity.ai/api-reference/<#response-usage-total-tokens>)
usage.total_tokens
integer
The total number of tokens used in the chat completion (prompt + completion).
[twitter](https://docs.perplexity.ai/api-reference/<https:/twitter.com/perplexity_ai>)[linkedin](https://docs.perplexity.ai/api-reference/<https:/www.linkedin.com/company/perplexity-ai/>)[discord](https://docs.perplexity.ai/api-reference/<https:/discord.com/invite/perplexity-ai>)[website](https://docs.perplexity.ai/api-reference/<https:/labs.perplexity.ai/>)
cURL
Python
JavaScript
PHP
Go
Java
Copy
```
curl --request POST \
 --url https://api.perplexity.ai/chat/completions \
 --header 'Authorization: Bearer <token>' \
 --header 'Content-Type: application/json' \
 --data '{
 "model": "sonar",
 "messages": [
  {
   "role": "system",
   "content": "Be precise and concise."
  },
  {
   "role": "user",
   "content": "How many stars are there in our galaxy?"
  }
 ],
 "max_tokens": "Optional",
 "temperature": 0.2,
 "top_p": 0.9,
 "search_domain_filter": [
  "perplexity.ai"
 ],
 "return_images": false,
 "return_related_questions": false,
 "search_recency_filter": "month",
 "top_k": 0,
 "stream": false,
 "presence_penalty": 0,
 "frequency_penalty": 1,
 "response_format": null
}'
```

200
422
Copy
```
{
 "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
 "model": "sonar",
 "object": "chat.completion",
 "created": 1724369245,
 "citations": [
  "https://www.astronomy.com/science/astro-for-kids-how-many-stars-are-there-in-space/",
  "https://www.esa.int/Science_Exploration/Space_Science/Herschel/How_many_stars_are_there_in_the_Universe",
  "https://www.space.com/25959-how-many-stars-are-in-the-milky-way.html",
  "https://www.space.com/26078-how-many-stars-are-there.html",
  "https://en.wikipedia.org/wiki/Milky_Way"
 ],
 "choices": [
  {
   "index": 0,
   "finish_reason": "stop",
   "message": {
    "role": "assistant",
    "content": "The number of stars in the Milky Way galaxy is estimated to be between 100 billion and 400 billion stars. The most recent estimates from the Gaia mission suggest that there are approximately 100 to 400 billion stars in the Milky Way, with significant uncertainties remaining due to the difficulty in detecting faint red dwarfs and brown dwarfs."
   },
   "delta": {
    "role": "assistant",
    "content": ""
   }
  }
 ],
 "usage": {
  "prompt_tokens": 14,
  "completion_tokens": 70,
  "total_tokens": 84
 }
}
```


