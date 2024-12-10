import AddFriendButton from "@/components/AddFriendButton";
import AddDeveloperCardClient from "@/components/AddDeveloperCard";

const page = async () => {
  return (
    <main className="pt-8">
      <h1 className="font-bold font-mono mb-8 text-3xl sm:text-5xl">
        Add a friend
      </h1>
      <AddFriendButton />
      <div className="mt-8">
        <AddDeveloperCardClient />
      </div>
    </main>
  );
};

export default page;
