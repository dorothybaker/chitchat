"use client";

import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { getAuth, signOut } from "firebase/auth";
import { app, firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import moment from "moment";

export default function Users({ userData, setSelectedChatroom }) {
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [users, setUsers] = useState([]);
  const [userChatrooms, setUserChatrooms] = useState([]);

  const auth = getAuth(app);
  const router = useRouter();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleLogOut = () => {
    signOut(auth)
      .then(() => {
        toast.success("Logout successful!");
        router.push("/login");
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  };

  const createChat = async (user) => {
    const existingChatroom = query(
      collection(firestore, "chatrooms"),
      where("users", "==", [user?.id, userData?.id])
    );

    const existingChatroom2 = query(
      collection(firestore, "chatrooms"),
      where("users", "==", [userData?.id, user?.id])
    );

    try {
      const existingChatroomSnapshot = await getDocs(existingChatroom);
    const existingChatroomSnapshot2 = await getDocs(existingChatroom2);

      if (existingChatroomSnapshot.docs.length > 0 || existingChatroomSnapshot2.docs.length > 0) {
        toast.error("Chatroom already exists!");
        return;
      }

      const usersData = { [userData.id]: userData, [user.id]: user };

      const chatroomData = {
        users: [user.id, userData.id],
        usersData,
        timestamp: serverTimestamp(),
        latestMessage: null,
      };

      const chatroomRef = await addDoc(
        collection(firestore, "chatrooms"),
        chatroomData
      );

      setActiveTab("chats");
    } catch (error) {
      console.log(error);
    }
  };

  const openChat = (chatroom) => {
    const data = {
      id: chatroom.id,
      myData: userData,
      otherData:
        chatroom.usersData[chatroom.users.find((id) => id !== userData.id)],
    };

    setSelectedChatroom(data);
  };

  const timeFormat = (time) => {
    const date = time?.toDate();
    const momentDate = moment(date).format("LT");
    return momentDate;
  };

  useEffect(() => {
    setLoading2(true);
    if (!userData?.id) return;
    const chatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "array-contains", userData?.id)
    );
    const unsubscribeChatrooms = onSnapshot(chatroomsQuery, (snapshot) => {
      const chatrooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserChatrooms(chatrooms);
      setLoading2(false);
    });

    // Cleanup function for chatrooms
    return () => unsubscribeChatrooms();
  }, [userData]);

  useEffect(() => {
    setLoading(true);
    const taskQuery = query(collection(firestore, "users"));

    const unsubcribe = onSnapshot(taskQuery, (querySnapshot) => {
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(users);
      setLoading(false);
    });

    return () => unsubcribe();
  }, []);

  return (
    <div className="min-h-screen overflow-auto p-3 bg-background">
      <div className="shadow-sm text-2xl font-semibold text-primary my-3">
        <h1>ChitChat</h1>
      </div>
      <div className="flex justify-between p-2 gap-2">
        <button
          onClick={() => handleTabClick("users")}
          className={`${
            activeTab === "users"
              ? "bg-primary text-background"
              : "text-primary bg-background border-2 border-primary"
          } px-3 py-1.5 rounded-xl cursor-pointer text-sm`}
        >
          Users
        </button>
        <button
          onClick={() => handleTabClick("chats")}
          className={`${
            activeTab === "chats"
              ? "bg-primary text-background"
              : "text-primary bg-background border-2 border-primary"
          } px-3 py-1.5 rounded-xl cursor-pointer text-sm`}
        >
          Chats
        </button>
        <button
          onClick={handleLogOut}
          className="px-3 py-1.5 rounded-xl cursor-pointer bg-foreground text-background text-sm"
        >
          Log out
        </button>
      </div>

      {activeTab === "chats" && (
        <div>
          <h1 className="font-semibold  mb-1">ChatRoom</h1>
          <div className="flex flex-col gap-3">
            {!loading2 &&
              userChatrooms.map((chatroom) => (
                <div key={chatroom.id} onClick={() => openChat(chatroom)}>
                  <UserCard
                    name={
                      chatroom.usersData[
                        chatroom.users.find((id) => id !== userData?.id)
                      ].name
                    }
                    avatarUrl={
                      chatroom.usersData[
                        chatroom.users.find((id) => id !== userData?.id)
                      ].avatarUrl
                    }
                    latestMessage={chatroom.latestMessage}
                    type={"chat"}
                  />
                </div>
              ))}

            {loading2 && (
              <div className="mt-2 text-center text-sm">
                Loading chatrooms...
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "users" && (
        <div>
          <h1 className="font-semibold mb-1">Select a user</h1>
          <div className="flex flex-col gap-3">
            {!loading &&
              users.map(
                (user) =>
                  user.id !== userData?.id && (
                    <div onClick={() => createChat(user)} key={user.id}>
                      <UserCard
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        type={"user"}
                      />
                    </div>
                  )
              )}
            {loading && (
              <div className="mt-2 text-center text-sm">Loading users...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
