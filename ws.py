
import requests
import json
import websocket
# curl 'wss://notes.rezel.net/socket.io/?noteId=eo5EtXjyQveGvdlHImZbGQ&EIO=3&transport=websocket&sid=MhNEQ4BhP6lK34G6AALb' -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0' -H 'Accept: */*' -H 'Accept-Language: fr-FR,en;q=0.7,en-GB;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'Sec-WebSocket-Version: 13' -H 'Origin: https://notes.rezel.net' -H 'Sec-WebSocket-Extensions: permessage-deflate'
# -H 'Sec-WebSocket-Key: q0kTpYUGC+EetR7MULXpJw==' -H 'Connection: keep-alive, Upgrade' -H 'Cookie: loginstate=true; userid=7328a5aa-67b2-45c6-81d9-a81ac4813352; indent_type=space; space_units=4; keymap=sublime; logged_out_marketing_header_id=eyJfcmFpbHMiOnsibWVzc2FnZSI6IklqUTBNVFEwWXpNNExXUXhOamt0TkRBM1l5MWhPRGt4TFdKaVpERXlNalExWWpGak1TST0iLCJleHAiOm51bGwsInB1ciI6ImNvb2tpZS5sb2dnZWRfb3V0X21hcmtldGluZ19oZWFkZXJfaWQifX0%3D--27676602079c51a3e16eadffed1078917b1f581e; connect.sid=s%3AWMQJq9fd98TV89iTUwhkbKuOCU6ZywZY.%2BYOvhf1avbuT3q5Odhn1b95NcXmtTiNHNR0CZziOnuM; io=MhNEQ4BhP6lK34G6AALb' -H 'Sec-Fetch-Dest: websocket' -H 'Sec-Fetch-Mode: websocket' -H 'Sec-Fetch-Site: same-origin' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'Upgrade: websocket'

# curl 'wss://notes.rezel.net/socket.io/?noteId=kLr6CwbZSyqlakGuNcHhcA&EIO=3&transport=websocket&sid=enpPe44yO6TdtXcIAALZ' -H 'Origin: https://notes.rezel.net' -H 'Sec-WebSocket-Key: 9zum+msHxGy8FeI8fgGbtg==' -H 'Connection: keep-alive, Upgrade' -H 'Cookie: loginstate=true; userid=7328a5aa-67b2-45c6-81d9-a81ac4813352; indent_type=space; space_units=4; keymap=sublime; logged_out_marketing_header_id=eyJfcmFpbHMiOnsibWVzc2FnZSI6IklqUTBNVFEwWXpNNExXUXhOamt0TkRBM1l5MWhPRGt4TFdKaVpERXlNalExWWpGak1TST0iLCJleHAiOm51bGwsInB1ciI6ImNvb2tpZS5sb2dnZWRfb3V0X21hcmtldGluZ19oZWFkZXJfaWQifX0%3D--27676602079c51a3e16eadffed1078917b1f581e; connect.sid=s%3AWMQJq9fd98TV89iTUwhkbKuOCU6ZywZY.%2BYOvhf1avbuT3q5Odhn1b95NcXmtTiNHNR0CZziOnuM; io=enpPe44yO6TdtXcIAALZ' -H 'Sec-Fetch-Dest: websocket' -H 'Sec-Fetch-Mode: websocket' -H 'Sec-Fetch-Site: same-origin' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'Upgrade: websocket'

# curl 'https://notes.rezel.net/2-r0QlhBRa6hN6xo-bg9lQ' -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' -H 'Accept-Language: fr-FR,en;q=0.7,en-GB;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'Referer: https://notes.rezel.net/' -H 'Connection: keep-alive' -H 'Cookie: loginstate=true; userid=7328a5aa-67b2-45c6-81d9-a81ac4813352; indent_type=space; space_units=4; keymap=sublime; logged_out_marketing_header_id=eyJfcmFpbHMiOnsibWVzc2FnZSI6IklqUTBNVFEwWXpNNExXUXhOamt0TkRBM1l5MWhPRGt4TFdKaVpERXlNalExWWpGak1TST0iLCJleHAiOm51bGwsInB1ciI6ImNvb2tpZS5sb2dnZWRfb3V0X21hcmtldGluZ19oZWFkZXJfaWQifX0%3D--27676602079c51a3e16eadffed1078917b1f581e; connect.sid=s%3AWMQJq9fd98TV89iTUwhkbKuOCU6ZywZY.%2BYOvhf1avbuT3q5Odhn1b95NcXmtTiNHNR0CZziOnuM; io=MhNEQ4BhP6lK34G6AALb' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-User: ?1'


base_url = "https://notes.rezel.net/"
note_id = "2-r0QlhBRa6hN6xo-bg9lQ"

# Cookies generated with curl -c cookies.txt -X POST "https://notes.rezel.net/login" --data-raw 'email=ansible@rezel.net&password=KvuDlYQetHHHNMhLutTooapuGVcYrOSicKvccgqhfjxCAgcwIb' -H "Referer: https://notes.rezel.net"

cookies = {'connect.sid': 's%3AsnbksXN-wVZwEgRZFxuBzpjT_WP3r6LT.pi7oNE4fxCfz3A7s%2BpB27wc%2BM03wnnLB6vDl0PBd9Mw'}

session = requests.session()

response = session.get(
    f"{base_url}socket.io/?noteId={note_id}&EIO=3&transport=polling", cookies=cookies)

response_dict = json.loads(response.text.split("0")[1])

print(response.headers)
