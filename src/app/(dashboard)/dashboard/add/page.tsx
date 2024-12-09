import AddFriendButton from "@/components/AddFriendButton";
import AddDeveloperCardClient from "@/components/AddDeveloperCard";
import { getUserByEmail } from "@/helpers/get-user-by-email";

const page = async () => {
  const developer = (await getUserByEmail("riad.boussoura@gmail.com")) as User;

  return (
    <main className="pt-8">
      <h1 className="font-bold font-mono text-5xl mb-8">Add a friend</h1>
      <AddFriendButton />
      <div className="mt-8">
        <AddDeveloperCardClient developer={developer} />
      </div>
    </main>
  );
};

export default page;
