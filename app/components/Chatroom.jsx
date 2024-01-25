import { useEffect, useRef, useState } from "react";
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export default function Chatroom({ user, selectedChatroom }) {
  const me = selectedChatroom?.myData;
  const other = selectedChatroom?.otherData;
  const chatroomId = selectedChatroom?.id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const messagesContainerRef = useRef(null);

  const sendMessage = async (e) => {
    const messageCollection = collection(firestore, "messages");

    if (message.trim() === "" && !image) return;

    try {
      const messageData = {
        chatroomId,
        senderId: me?.id,
        content: message,
        time: serverTimestamp(),
        image: image,
        messageType: "text",
      };

      await addDoc(messageCollection, messageData);
      setMessage("");
      setImage(null);

      const chatroomRef = doc(firestore, "chatrooms", chatroomId);
      await updateDoc(chatroomRef, {
        latestMessage: message ? message : "Image",
        time: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }

    // Scroll to the bottom after sending a message
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!chatroomId) return;

    const unsubscribe = onSnapshot(
      query(
        collection(firestore, "messages"),
        where("chatroomId", "==", chatroomId),
        orderBy("time", "asc")
      ),
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      }
    );

    return unsubscribe;
  }, [chatroomId]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = window.screen.availHeight;
    }
  }, [messages]);

  return (
    <div className="h-screen relative flex flex-col overflow-y-auto">
      {selectedChatroom ? (
        <div ref={messagesContainerRef} className="flex-1">
          <div className="border-b fixed top-0 flex gap-2 items-center p-2 bg-background z-40 w-full">
            <div className="h-10 w-10">
              <img
                src={other.avatarUrl}
                alt="avatar"
                width="100%"
                height="100%"
                className="rounded-full object-cover"
              />
            </div>
            <h1 className="font-semibold text-lg">{other.name}</h1>
          </div>
          <div className="flex-1 flex flex-col gap-3 sm:px-4 px-2 sm:pb-4 pb-20 pt-[70px] w-full">
            {messages.map((message, index) => (
              <MessageCard
                message={message}
                key={message.id}
                me={me}
                other={other}
                image={image}
                setImage={setImage}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1 justify-center items-center w-full text-foreground/30">
          <img
            src="https://www.svgrepo.com/show/530377/chat-chat.svg"
            alt=""
            className="h-10 w-10"
          />
          <h1 className="text-3xl font-semibold">ChitChat</h1>
          <div>
            <p>Sorry, you have no messages!</p>
            <p>Select a user to start chatting</p>
          </div>
        </div>
      )}

      <MessageInput
        sendMessage={sendMessage}
        message={message}
        setMessage={setMessage}
        setImage={setImage}
        image={image}
      />
    </div>
  );
}
