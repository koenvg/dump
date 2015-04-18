#Sending out mail with webhook

This is the code needed for webhook to send out mail, this can be from anything without the users need to authenticate.
You will need to add another worker to your server and adjust the firebase configuration to allow anonymus logins.
Also add this part to your security and rules under management\commands:

```
"mail": {
  "$command" : {
    ".write": true,
    ".validate": "newData.hasChildren(['from', 'to', 'message','subject'])",
    "id": {
     ".validate": true
    }
  }
},
```
