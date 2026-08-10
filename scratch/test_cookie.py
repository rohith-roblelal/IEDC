from http.cookies import SimpleCookie
import urllib.parse

C = SimpleCookie('access_token="Bearer eyJ..."')
print("With quotes:", C['access_token'].value)

C2 = SimpleCookie('access_token=Bearer%20eyJ...')
print("URL encoded:", C2['access_token'].value)
print("Unquoted:", urllib.parse.unquote(C2['access_token'].value))
