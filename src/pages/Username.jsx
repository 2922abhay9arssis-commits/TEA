import { useState } from "react";

import {
auth,
db
}
from "../firebase/config";


import {
doc,
setDoc,
collection,
query,
where,
getDocs
}
from "firebase/firestore";


import {
useNavigate
}
from "react-router-dom";



function Username(){


const [username,setUsername] =
useState("");


const navigate =
useNavigate();



async function createUsername(){


if(username.length < 3){

alert(
"Username too short"
);

return;

}



const usernameCheck =
query(

collection(db,"users"),

where(
"username","==",username)

);



const result =
await getDocs(usernameCheck);



if(!result.empty){

alert(
"Username already taken ☕"
);

return;

}




await setDoc(

doc(
db,
"users",
auth.currentUser.uid
),

{

uid:
auth.currentUser.uid,


name:
auth.currentUser.displayName,


email:
auth.currentUser.email,


photo:
auth.currentUser.photoURL,


username:
username,


bio:
"Having TEA ☕",


online:
true


}


);



navigate("/home");


}





return(


<div className="
h-screen
flex
justify-center
items-center
bg-[#f5efe6]
">


<div className="
bg-white
p-10
rounded-3xl
shadow-xl
text-center
">


<h1 className="
text-3xl
font-bold
">
Create your TEA username ☕
</h1>



<input

value={username}

onChange={(e)=>
setUsername(
e.target.value.toLowerCase()
)
}


placeholder="@username"


className="
mt-8
border
p-3
rounded-xl
outline-none
"

/>



<br/>



<button

onClick={createUsername}

className="
mt-6
bg-[#454c4f]
text-white
px-8
py-3
rounded-full
"

>

Start TEA

</button>


</div>


</div>


)


}



export default Username;