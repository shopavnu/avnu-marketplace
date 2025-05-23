import { SignUp } from "@clerk/nextjs";
import { NextPage } from "next";

const SignUpPage: NextPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      </div>
    </div>
  );
};

export default SignUpPage;
