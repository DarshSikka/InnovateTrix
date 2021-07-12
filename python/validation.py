import json
password=input()
confirm=input()
def validation(p, c):
    #validation code
    print(json.dumps({'type':p!=c, 'errors':["Password short", "Confirm does not match"]}))
validation(password, confirm)