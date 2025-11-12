import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * PasswordGate blocks rendering until the correct password is entered.
 * The unlock state persists in localStorage until the user clears it.
 */
export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const PASSWORD = "panda123"; 
  const STORAGE_KEY = "panda_app_unlocked_v1";

  const [input, setInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");

  // Check localStorage on load
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      setIsUnlocked(true);
      localStorage.setItem(STORAGE_KEY, "true");
      setError("");
    } else {
      setError("Invalid password.");
    }
  };

  const handleLock = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsUnlocked(false);
  };

  if (isUnlocked) {
    return (
      <>
        {/* Optional small “lock” button for manual re-locking */}
        <div className="fixed bottom-3 right-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleLock}
          >
            Lock
          </Button>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-lg">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="text-center"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
