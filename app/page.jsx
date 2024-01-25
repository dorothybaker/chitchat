"use client";

import { app, firestore } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Users from "./components/Users";
import Chatroom from "./components/Chatroom";
import { Menu, PanelRightOpen } from "lucide-react";

export default function Home() {
  const auth = getAuth(app);
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [mobileView, setMobileView] = useState(false);
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  const toggleMobileView = () => {
    setMobileView((curr) => !curr);
  };

  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);
        // prettier-ignore
        const userData = ({ id: userSnap.id, ...userSnap.data() });
        setUser(userData);
      } else {
        setUser(null);
        router.push("/login");
      }
    });

    return () => unsubcribe();
  }, [auth, router]);

  return (
    <div className="h-screen mx-auto max-w-7xl flex relative">
      <div
        className="absolute right-2 top-3 z-[100] md:hidden block"
        onClick={toggleMobileView}
      >
        <button className="bg-primary text-background px-3 py-1 rounded-md cursor-pointer">
          Menu
        </button>
      </div>

      {mobileView && (
        <div className="absolute left-0 right-0 w-[90vw] z-50 bg-background">
          <Users
            userData={user}
            setSelectedChatroom={setSelectedChatroom}
            setMobileView={setMobileView}
          />
        </div>
      )}
      <div className="flex-shrink-0 lg:w-3/12 md:w-1/3 border-r md:block hidden">
        <Users userData={user} setSelectedChatroom={setSelectedChatroom} />
      </div>
      <div className="flex-grow w-3/12">
        <Chatroom user={user} selectedChatroom={selectedChatroom} />
      </div>
    </div>
  );
}
