'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function Homepage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          router.push('/workspace');
        } else {
          setError('Incorrect password');
        }
      } else {
        setError('Error verifying password');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error verifying password');
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Welcome to Simple Transcripts QC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              Hint: The password is the number of the lab room!
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            {error && <div className="text-destructive text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full">
              Enter Workspace
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
