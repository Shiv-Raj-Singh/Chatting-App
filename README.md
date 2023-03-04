# Chatting-App


Chatting App Using React , Nodejs & Socket.IO
backend branch have both side Code Client & Server Side click on code (Green) and go on HTTP after that either Copy the HTTP URL or Download ZIP Files
after extract the code on your local system go inside root directory and type the following cmd---

#  npm i ? npm install   for install the all Node dependencies 
# npm start  for Run the App 
There i performed login & register APIs user have to create an account after that he has to login there along with choose a desire chatting Room in which whoever able to chat that particular room user can chat with them

For example x is an user and after registered he choose room study there is two more users doing gossip he can join them privately according Room names

Model -
const userSchema = new Schema( { phone: { type: String, required: true, unique: true, trim: true, },

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
},
}, { timestamps: true } );
