import { auth } from "../firebase/config";

import { onAuthStateChanged } from "firebase/auth";
import { socket } from "../socket/socket";
import { Search, Settings } from "lucide-react";
import logo from "../assets/tea-logo.png";
import React,{ useState, useEffect, useRef } from "react";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

function Home() {
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatInfo, setChatInfo] = useState({});
  const [friends, setFriends] = useState([]);
  const [showGif, setShowGif] = useState(false);
  const bottomRef = useRef(null);
  const [gifSearch, setGifSearch] = useState("");
  const [gifs, setGifs] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    socket.on("user-typing", () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    });

    return () => {
      socket.off("user-typing");
    };
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    socket.emit("user-online", auth.currentUser.uid);

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("users", "array-contains", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      let data = {};
      snap.forEach((doc) => {
        const chat = doc.data();
        const friendId = chat.users.find((id) => id !== auth.currentUser.uid);
        data[friendId] = chat;
      });
      setChatInfo(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const stop = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const friendsRef = collection(db, "users", user.uid, "friends");

      const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
        let list = [];
        snapshot.forEach((doc) => list.push(doc.data()));
        setFriends(list);
      });

      return unsubscribe;
    });

    return () => stop();
  }, []);

  async function searchGif() {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=vSRADGJhNI6tBeQojeUYAc5mfGuymUk9&q=${gifSearch}&limit=20`
    );
    const data = await response.json();
    setGifs(data.data);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const room = localStorage.getItem("room");

    const q = query(collection(db, "chats", room, "messages"), orderBy("time"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = [];
      snapshot.forEach((doc) => msgs.push(doc.data()));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  useEffect(() => {
    socket.on("receive-message", (data) => {
      setMessages((old) => [...old, data]);
    });

    return () => socket.off("receive-message");
  }, []);

  async function openChat(user) {
    setSelectedUser(user);

    const ids = [auth.currentUser.uid, user.uid].sort();
    const room = ids[0] + "_" + ids[1];

    socket.emit("join-room", room);
    localStorage.setItem("room", room);

    await setDoc(doc(db, "users", auth.currentUser.uid, "friends", user.uid), user);

    const msgRef = collection(db, "chats", localStorage.getItem("room"), "messages");
    const allMessages = await getDocs(msgRef);

    allMessages.forEach(async (messageDoc) => {
      const msg = messageDoc.data();
      if (msg.receiver === auth.currentUser.uid) {
        await updateDoc(doc(db, "chats", localStorage.getItem("room"), "messages", messageDoc.id), { seen: true });
      }
    });
  }

  async function sendGif(url) {
    const data = {
      type: "gif",
      gif: url,
      sender: auth.currentUser.uid,
      receiver: selectedUser.uid,
      room: localStorage.getItem("room"),
      time: new Date(),
    };

    socket.emit("send-message", data);

    await addDoc(collection(db, "chats", data.room, "messages"), { ...data, time: serverTimestamp() });

    await setDoc(doc(db, "chats", data.room), {
      lastMessage: data.text,
      lastTime: serverTimestamp(),
      users: [auth.currentUser.uid, selectedUser.uid],
    });

    setShowGif(false);
  }

  async function sendMessage() {
    if (message.trim() === "") return;

    const data = {
      type: "text",
      text: message,
      sender: auth.currentUser.uid,
      receiver: selectedUser.uid,
      room: localStorage.getItem("room"),
      seen: false,
      time: new Date(),
    };

    socket.emit("send-message", data);

    await addDoc(collection(db, "chats", data.room, "messages"), { ...data, time: serverTimestamp() });

    await setDoc(doc(db, "chats", data.room), {
      lastMessage: data.text,
      lastTime: serverTimestamp(),
      users: [auth.currentUser.uid, selectedUser.uid],
    });

    setMessage("");

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function searchUser() {
    if (search === "") return;

    const q = query(collection(db, "users"), where("username", "==", search.toLowerCase()));
    const result = await getDocs(q);
    let foundUsers = [];
    result.forEach((doc) => foundUsers.push(doc.data()));
    setUsers(foundUsers);
  }

  function getMessageDate(time){

if(!time?.toDate) return "";

const msgDate = time.toDate();

const today = new Date();

const yesterday = new Date();
yesterday.setDate(today.getDate()-1);


if(
msgDate.toDateString()
===
today.toDateString()
){

return "Today";

}


if(
msgDate.toDateString()
===
yesterday.toDateString()
){

return "Yesterday";

}


return msgDate.toLocaleDateString(
"en-IN",
{
day:"numeric",
month:"long",
year:"numeric"
}
);

}

  return (
    <div className="
    fixed
    inset-0
    bg-[#f5efe6]
    flex
    overflow-hidden
">
      {/* LEFT SIDEBAR */}
      <div className="
      w-[380px]
      bg-white
      border-r
      flex
      flex-col
    ">
        {/* HEADER */}
        <div className="
        p-5
        flex
        justify-between
        items-center
      ">
          <div>
            <div className="
            flex
            items-center
            gap-3
          ">
              <img src={logo} className="
                w-12
                h-12
                rounded-full
              " />

              <h1 className="
                text-3xl
                font-bold
              ">
                TEA
              </h1>
            </div>

            <p className="
              text-gray-500
              text-sm
            ">
              Talk. Express. Anywhere.
            </p>
          </div>

          <Settings className="cursor-pointer" />
        </div>

        {/* SEARCH */}
        <div className="px-5">
          <div className="
            bg-[#f5efe6]
            rounded-full
            p-3
            flex
            gap-2
            items-center
          ">
            <Search size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchUser();
              }}
              placeholder="Search username"
              className="bg-transparent outline-none w-full"
            />
          </div>
        </div>

        {/* FRIEND LIST */}
        <div className="
          mt-5
          flex-1
          overflow-y-auto
        ">
          {(users.length > 0 ? users : friends).map((user) => (
            <Friend
              key={user.uid}
              name={user.name}
              photo={user.photo}
              msg={chatInfo[user.uid]?.lastMessage || "@" + user.username}
              onClick={() => openChat(user)}
            />
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="
        flex-1
        h-screen
        flex
        flex-col
        overflow-hidden
        relative
      ">
        {selectedUser ? (
          <>
            {/* CHAT AREA */}
            <div className="
              flex-1
              h-screen
              flex
              flex-col
              overflow-hidden
              relative
            ">

              {/* CHAT HEADER */}
              <div className="
                h-20
                bg-white
                border-b
                flex
                items-center
                px-6
                gap-4
                shrink-0
              ">
                <img src={selectedUser.photo} className="
                  w-12
                  h-12
                  rounded-full
                " />

                <div>
                  <h2 className="font-bold text-lg">{selectedUser.name}</h2>
                  <p className="text-sm text-green-500">{onlineUsers.includes(selectedUser.uid) ? "🟢 Online" : "Offline"}</p>
                  {typing && <p className="text-sm text-green-500">typing...</p>}
                  <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                </div>
              </div>

              {/* MESSAGE SCROLL AREA */}
<div className="
    flex-1
    h-0
    overflow-y-scroll
    overflow-x-hidden
    p-5
    bg-[#f5efe6]
">
  {
messages.map((msg,index)=>{


const currentDate =
getMessageDate(msg.time);


const previousDate =
index > 0
?
getMessageDate(messages[index-1].time)
:
null;


const showDate =
currentDate !== previousDate;
                  const isMe = msg.sender === auth.currentUser.uid;
                  return (

<React.Fragment key={index}>

{
showDate && (

<div className="
text-center
my-4
">

<span className="
bg-white
px-4
py-1
rounded-full
text-xs
text-gray-500
">

{currentDate}

</span>

</div>

)
}


<div 
className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}
>


<div

className={`
px-4 
py-2 
rounded-2xl 
max-w-[60%] 
shadow 

${isMe 
? 
"bg-[#454c4f] text-white rounded-br-none" 
: 
"bg-white text-black rounded-bl-none"
}

`}

>


{
msg.type === "gif" ?

<img

src={msg.gif}

className="
w-48
rounded-xl
"

/>

:

<p>{msg.text}</p>

}


<p className="
text-xs
opacity-60
mt-1
text-right
">

{
msg.time?.toDate 
?
msg.time.toDate().toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
)
:
""
}


{
isMe && 

<span>

{
msg.seen ? " ✓✓" : " ✓"
}

</span>

}


</p>


</div>

</div>


</React.Fragment>

);

})

}

                <div ref={bottomRef}></div>
              </div>
               
               {
showGif &&

<div className="
absolute
bottom-24
right-10
bg-white
shadow-xl
rounded-xl
p-4
w-[350px]
z-50
">

<input

value={gifSearch}

onChange={(e)=>
setGifSearch(e.target.value)
}

onKeyDown={(e)=>{

if(e.key==="Enter")
searchGif();

}}

placeholder="Search GIF"

className="
border
p-3
rounded-xl
w-full
mb-3
"

/>


<div className="
grid
grid-cols-2
gap-2
h-80
overflow-y-auto
">

{
gifs.map((gif)=>(

<img

key={gif.id}

src={
gif.images.fixed_height.url
}

onClick={()=>{

sendGif(
gif.images.fixed_height.url
);

}}

className="
rounded-lg
cursor-pointer
"

/>

))
}

</div>


</div>

}
              {/* INPUT BAR */}
              <div className="
                p-4
                bg-white
                flex
                items-center
                gap-3
                border-t
                shrink-0
              ">

                <input
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    socket.emit("typing", { room: localStorage.getItem("room") });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Message TEA..."
                  className="flex-1 bg-[#f5efe6] rounded-full px-5 py-3 outline-none"
                />

                <button onClick={() => setShowGif(!showGif)} className="text-xl">🎁</button>

                <button onClick={sendMessage} className="bg-[#454c4f] text-white px-6 py-3 rounded-full">Send</button>
              </div>
            </div>
          </>
        ) : (
          <div className="
            h-full
            flex
            flex-col
            justify-center
            items-center
            text-gray-500
          ">
            <img src={logo} className="w-40 mb-5" />
            <h1 className="text-3xl font-bold">Welcome to TEA</h1>
            <p>Select a chat and start talking</p>
          </div>
        )}
      </div>

      {/* Friend component is defined below */}
      
    </div>
  );
}

function Friend({ name, msg, photo, onClick }) {
  return (
    <div onClick={onClick} className="p-4 flex gap-3 items-center hover:bg-[#f5efe6] cursor-pointer">
      <img src={photo} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <h2 className="font-semibold">{name}</h2>
        <p className="text-gray-500 text-sm">{msg}</p>
      </div>
    </div>
  );
}

export default Home;