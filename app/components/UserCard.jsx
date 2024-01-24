export default function UserCard({
  name,
  latestMessage,
  avatarUrl,
  time,
  type,
}) {
  return (
    <div className="flex items-center border-b gap-3 py-1 w-full cursor-pointer">
      <div className="h-10 w-10">
        <img
          src={avatarUrl}
          alt="avatar"
          width="100%"
          height="100%"
          className="rounded-full object-cover"
        />
      </div>
      <div className="w-full flex-col gap-1">
        <div className="flex justify-between font-semibold">
          <h1 className={`${time ? "text-sm" : "text-base font-semibold"}`}>
            {name}
          </h1>
        </div>
        {type === "chat" && (
          <p className="font-medium text-foreground/80 text-sm line-clamp-1">
            {latestMessage}
          </p>
        )}
      </div>
    </div>
  );
}
