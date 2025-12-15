import { Card, CardContent, CardHeader } from "@/components/ui/card";

import SignInForm from "./form";

const SignInPage = () => {
  return (
    <main className="flex flex-col h-screen justify-center items-center p-4">
      <Card className="w-full lg:w-1/3 bg-background border-none">
        <CardHeader className="flex flex-col items-center">
          <div className="w-fit bg-primary/20 p-2 rounded-md">
            <h1 className="text-4xl text-primary font-bold">SIGIZI</h1>
          </div>
          <p className="text-md text-muted-foreground">
            RSUD Dr. Achmad Mochtar
          </p>
        </CardHeader>

        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </main>
  );
};

export default SignInPage;
