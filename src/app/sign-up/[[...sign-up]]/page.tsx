
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <SignUp />
    </div>
  );
}
