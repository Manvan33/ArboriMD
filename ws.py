
import requests
import json
import websocket
# -H 'Sec-WebSocket-Key: q0kTpYUGC+EetR7MULXpJw==' -H 'Connection: keep-alive, Upgrade' -H 'Cookie: loginstate=true; userid=7328a5aa-67b2-45c6-81d9-a81ac4813352; indent_type=space; space_units=4; keymap=sublime; logged_out_marketing_header_id=eyJfcmFpbHMiOnsibWVzc2FnZSI6IklqUTBNVFEwWXpNNExXUXhOamt0TkRBM1l5MWhPRGt4TFdKaVpERXlNalExWWpGak1TST0iLCJleHAiOm51bGwsInB1ciI6ImNvb2tpZS5sb2dnZWRfb3V0X21hcmtldGluZ19oZWFkZXJfaWQifX0%3D--27676602079c51a3e16eadffed1078917b1f581e; connect.sid=s%3AWMQJq9fd98TV89iTUwhkbKuOCU6ZywZY.%2BYOvhf1avbuT3q5Odhn1b95NcXmtTiNHNR0CZziOnuM; io=MhNEQ4BhP6lK34G6AALb' -H 'Sec-Fetch-Dest: websocket' -H 'Sec-Fetch-Mode: websocket' -H 'Sec-Fetch-Site: same-origin' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'Upgrade: websocket'



base_url = "https://notes.rezel.net/"
note_id = "2-r0QlhBRa6hN6xo-bg9lQ"

# Cookies generated with curl -c cookies.txt -X POST "https://notes.rezel.net/login" --data-raw 'email=user@mail.com&password=yes' -H "Referer: https://notes.rezel.net"

cookies = {'connect.sid': 's%3AsnbksXN-e.pi7oNE4fxCfz3A7s%e%e'}

session = requests.session()

response = session.get(
    f"{base_url}socket.io/?noteId={note_id}&EIO=3&transport=polling", cookies=cookies)

response_dict = json.loads(response.text.split("0")[1])

print(response.headers)
