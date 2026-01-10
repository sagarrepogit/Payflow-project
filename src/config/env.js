const dotenv= require('dotenv');
dotenv.config();
function required(parameter){
    const v =process.env[parameter];
    if(!v){
        throw new Error(`missing required env parameter: ${parameter}`);
    } return v;
}
const env={
PORT: (process.env.PORT || 4000),
MONGO_URI:required("MONGO_URI"),
//JWT_SECRET:required("JWT_SECRET")
}
module.exports={env};