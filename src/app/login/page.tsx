// src/app/login/page.tsx
import { LoginForm } from "@/components/LoginForm";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
