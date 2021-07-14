import json
password=input()
confirm=input()
def validation(p, c):
    res={
        'type':False,
        'errors':[]
    }
    flag = 0
    errors=[]
    if (len(password)<8):
        errors.append("At least 8 Charaters needed in the password")
        flag = 0
    if confirm!=password: 
        errors.append("Passwords don't match")
        flag = 0
    if(confirm==password and len(password)>8):
        flag=-1
    if flag == -1:
        print(json.dumps(res))
    elif flag == 0:
        res['type']=True
        res['errors']=errors
        print(json.dumps(res))
validation(password, confirm)