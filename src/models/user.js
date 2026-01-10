const mongoose= require('mongoose')
const RESERVED_USERNAMES=(["admin", "administrator","support","help","bank","payment",
    "security","root","system","superuser"
]);
// The string should be 6 to 20 characters long, and both 
// the first and last characters must be letters or digits.
// allows . _ -@ only if between alnum chars, no consecutive special chars

const USERNAME_REGEX = /^[a-z0-9](?:[._-@]?[a-z0-9]){5,19}$/;

//according to the regular expression the password must contain
// at least one lowercase
//at least one uppercase
//at least one digit 
//at least one specail character @$!%*?&
// and this can be in any order because of positive lockhead ?=...
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

const userSchema= new mongoose.Schema({
    Username: {
        type: String,
        required: [true,'Username is required'],
        trim:true,
        lowecase:true,
        minlength:[6,'Username should be atleast 6 charectors long'],
        maxlength:[20,'Username cannot be more then 20 charecotrs long'],
        match:[USERNAME_REGEX ,'Username format is invalid'],
        unique: [true,'Username is already taken please enter another'],
        validate:[function(v){
            return !RESERVED_USERNAMES.has(v);
        }]
    },
    Email:{
        type:String,
        required:[true,'Email is required'],
        lowercase:true,
        maxlength:[254,'Email is too long'],
        trim: true,
        validate:{
            validator:function(v){
                //disallow the empty string after trimming
                if(!v)return false;
                // Basic cheack format
                return validator.isEmail
            },
            messege:"please enter the valid email"
        }


    },
    Password:{
        type:String,
        required:[true,"Password is required"],
        minlength:[6,"Password must be 6 digits long"],
        maxlength:[20,"Password must be less then 20 digits"],
        select:false,// do NOT return password in queries
        validate:{
            validator:function(v){
                //disallow the emplty password
                if(!v)return false;
                if(!PASSWORD_REGEX.test(v)){
                    throw new Error (
                        "Password must include uppercase, lowercase, number and special character"
                    )
                }

            }
        }
    },
    passwordChangedAt: {
        type: Date,
        default: null
    }
}
, { timestamps: true }
)
export const User = mongoose.models("User",userSchema);