# Chatting-App

Chatting App Using React , Nodejs & Socket.IO
backend branch have both side Code Client & Server Side click on code (Green) and go on HTTP after that either Copy the HTTP URL or Download ZIP Files
after extract the code on your local system go inside root directory and type the following cmd---

npm i or npm install for install the all Node dependencies

* npm start for Run the App

There i performed login & register APIs user have to create an account after that he has to login there along with choose a desire chatting Room in which whoever able to chat that particular room user can chat with them

For example x is an user and after registered he choose room study there is two more users doing gossip he can join them privately according Room names

## Model-
- userSchema-
```

 { 
 phone: { type: String,
    required: true,
    unique: true,
    trim: true
 },
name: {
  type: String,
  trim: true,
  required: true,
},
email: {
  type: String,
  required: true,
  unique: true,
  trim: true,
},
password: {
  type: String,
  required: true,
  trim: true,
},
cPassword: {
  type: String,
  required: true,
  trim: true,
}
, { timestamps: true } 
}

```

###  Create User & Login User two Post APIs


# -POST APIs
  #### -/register  
  - Create new user & take user credentials in body param and validate them 
  - All felids are required   
  - User Email & Phone Number Should be Unique Validate them 
  - At the end create a new User and send 201 status Code for successfully registered 

  ####  Response 
  ```
  {
    status : true ,
    data : {
          _id : 63e77965e68cfc923d1d1d12 , 
            phone : "9627347143" ,
            name : "Shiv Raj Singh" ,
            email : "mt932747@gmail.com" ,
            password : "Mangal1234",
            cPassword :  "Mangal123" ,
            createdAt : 2023-02-11T11:17:57.828+00:00 ,
            updatedAt : 2023-02-11T11:17:57.828+00:00 ,
            __v : 0
          }
    }

  ```

 #### -/login  

  - take user credentials in body param and validate them if not then return suitable error
  - Phone & Password felids are required   
  - Check User Have account or Not if Not then Navigate him on Register page
  - At the end if user login successfully then navigate him on chat-page

  ####  Response 
  ```
  {
    status : true ,
    message : 'login Successfully' 
    data : {
          _id : 63e77965e68cfc923d1d1d12 , 
            phone : "9627347143" ,
            name : "Shiv Raj Singh" ,
            email : "mt932747@gmail.com" ,
            password : "Mangal1234",
            cPassword :  "Mangal123" ,
            createdAt : 2023-02-11T11:17:57.828+00:00 ,
            updatedAt : 2023-02-11T11:17:57.828+00:00 ,
            __v : 0
          }
    }

  ```

## For See the Live Project Click Here -
##### - https://chat-app-frontend-sigma.vercel.app/