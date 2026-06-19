import { useNavigate } from "react-router-dom";
import logo from "../assets/tea-logo.png";


import {
doc,
getDoc
}
from "firebase/firestore";


import {
db
}
from "../firebase/config";


import {
signInWithPopup
}
from "firebase/auth";


import {
auth,
googleProvider
}
from "../firebase/config";



function Login(){

const navigate = useNavigate();

async function login(){


const result =
await signInWithPopup(
auth,
googleProvider
);


const user = result.user;


const userRef =
doc(
db,
"users",
user.uid
);


const userSnap =
await getDoc(userRef);



if(userSnap.exists()){


navigate("/home");


}

else{


navigate("/username");


}


}





return(

<div className="
h-screen
flex
flex-col
justify-center
items-center
bg-[#f5efe6]
">


<img 
src={logo}
className="w-40"
/>


<h1
className="
text-5xl
font-bold
mt-5
"
>
TEA
</h1>



<p
className="
mt-3
text-gray-600
"
>
Talk. Express. Anywhere.
</p>



<button

onClick={login}


className="
mt-10
bg-[#454c4f]
text-white
px-8
py-3
rounded-full
shadow-xl
"


>


Continue with Google


</button>



</div>

)

}



export default Login;