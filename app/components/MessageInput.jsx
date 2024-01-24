import { app } from "@/lib/firebase";
import EmojiPicker from "emoji-picker-react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Paperclip, Send } from "lucide-react";
import { useState } from "react";

export default function MessageInput({
  sendMessage,
  message,
  setMessage,
  image,
  setImage,
}) {
  const storage = getStorage(app);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(f);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const storageRef = ref(storage, `chatroom_images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImage(downloadURL);
          setImagePreview(null);
          setFile(null);
        });
      }
    );
  };

  const handleEmojiClick = (emojiData, e) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="sticky bottom-0">
      <div className="flex items-center px-2 py-4 border-t bg-background gap-1 relative overflow-hidden justify-between">
        <Paperclip
          className={`cursor-pointer ${
            image ? "text-primary" : "text-foreground"
          }`}
          size={15}
          onClick={() => document.getElementById("my_modal_3").showModal()}
        />
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="relative"
        >
          😊
        </button>

        <input
          type="text"
          className="sm:flex-1 outline-none focus:outline-none border-none text-foreground w-full"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Send className="cursor-pointer text-primary" onClick={sendMessage} />

        {showEmojiPicker && (
          <div className="absolute right-0 bottom-full p-2">
            <EmojiPicker onEmojiClick={handleEmojiClick} width="100%" />
          </div>
        )}
        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {imagePreview && (
                <img
                  src={imagePreview}
                  className="w-60 max-h-60 object-cover rounded-md my-2 block"
                />
              )}
              <input type="file" onChange={handleFileChange} accept="image/*" />
              <button
                className="rounded-md bg-primary text-background py-1.5 px-3 w-max my-2 cursor-pointer"
                onClick={() => handleUpload()}
              >
                Upload
              </button>

              <div>
                <progress value={uploadProgress} max="100"></progress>
              </div>

              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
          </div>
        </dialog>
      </div>
    </div>
  );
}
