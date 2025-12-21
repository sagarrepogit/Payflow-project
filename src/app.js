const express = require('exoress');
const app= express();

const port= 3000// so the port will help the data route correctly to the desired
// location or the application where it should be send to as a computer has only one ip
// address but it has many applicaiont running and many request comming at that same ip
//address to solve that problem we will have diffirent  number of ports here for that.
app.listen(port,console.log('server is listining $(port)...')
