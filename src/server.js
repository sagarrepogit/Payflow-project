const {env}=require('./config/env.js');
const connectDB = require('./Database/db_connection.js');
const express = require('express')
const app = express()
const port = env.PORT;
// no need to define the default port here all the env logic is defined as env.js 
//because env file do not have any logic in itself

// Connect to database
connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/login',(req,res)=>{
  res.send('give the login details now')
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
