import React, { useState } from "react";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "@/lib/firebase";
import EmojiPicker from "emoji-picker-react";

function MessageInput({ sendMessage, message, setMessage, image, setImage }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Initialize storage object
  const storage = getStorage(app);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Display image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected.");
      return;
    }

    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Error uploading file:", error.message);
      },
      () => {
        // Upload complete, get download URL and log it
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          // Reset file state and update message with download URL
          setFile(null);
          setImage(downloadURL);
          // Clear image preview
          setImagePreview(null);
          document.getElementById("my_modal_3").close();
        });
      }
    );
  };

  const handleEmojiClick = (emojiData, event) => {
    // Append the selected emoji to the message state
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  return (
    <div className="sm:sticky fixed bottom-0 w-full border-t p-2 bg-background">
      <div className="relative flex items-center">
        <FaPaperclip
          onClick={() => document.getElementById("my_modal_3").showModal()}
          className={`${
            image ? "text-primary" : "text-gray-500"
          } mr-2 cursor-pointer`}
        />
        {/* Emoji Picker Button */}
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          placeholder="Type a message..."
          className="flex-1 border-none p-2 outline-none"
        />

        <FaPaperPlane
          onClick={() => sendMessage()}
          className="text-primary cursor-pointer ml-2"
        />

        {showEmojiPicker && (
          <div className="absolute right-0 bottom-full p-2">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              disableAutoFocus={true}
              width="100%"
            />
          </div>
        )}

        {/* Image Upload Modal */}
        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Uploaded"
                  className="max-h-60 w-60 my-4 rounded-sm"
                />
              )}
              <label
                htmlFor="fileImage"
                className="font-semibold cursor-pointer"
              >
                {imagePreview ? "File selected" : "Click to select a file"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="fileImage"
                className="hidden"
              />
              <div
                onClick={() => {
                  handleUpload();
                }}
                className="rounded-md bg-primary px-3 py-1 text-background w-max my-2"
              >
                Upload
              </div>
              <progress
                value={uploadProgress}
                max="100"
                className="rounded-sm block"
              ></progress>
            </form>
            <button
              onClick={() => document.getElementById("my_modal_3").close()}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
          </div>
        </dialog>
      </div>
    </div>
  );
}

export default MessageInput;
