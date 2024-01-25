import moment from "moment";

export default function MessageCard({ message, me, other }) {
  const isMessageFromMe = message.senderId === me.id;

  const timeFormat = (time) => {
    const date = time?.toDate();
    const momentDate = moment(date).format("LT");
    return momentDate;
  };

  return (
    <div
      key={message.id}
      className={`${
        isMessageFromMe ? "justify-end" : "justify-start"
      } flex w-full`}
    >
      <div
        className={`${
          isMessageFromMe
            ? "self-end bg-foreground/65 rounded-s-2xl rounded-tr-2xl text-end"
            : "self-start bg-primary/90 rounded-e-2xl rounded-tl-2xl text-start"
        } text-background w-max max-w-[600px] p-2`}
      >
        {message.image && (
          <img
            src={message.image}
            className="w-60 h-60 rounded-md object-cover"
          />
        )}
        <p className="text-[15px]">{message.content}</p>
        <span
          className={`text-xs text-background/80 block ${
            isMessageFromMe ? "text-start" : "text-end"
          }`}
        >
          {timeFormat(message.time)}
        </span>
      </div>
    </div>
  );
}
