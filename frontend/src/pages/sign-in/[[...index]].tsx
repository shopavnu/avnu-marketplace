import { SignIn } from "@clerk/nextjs";
import { NextPage } from "next";

const SignInPage: NextPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6">
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </div>
    </div>
  );
};

export default SignInPage;
