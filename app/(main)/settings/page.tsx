'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LogOut, Trash2, User, Database } from 'lucide-react';
import { dbHelpers } from '@/lib/db/supabase';
import { localDB } from '@/lib/db/local-db';

export default function SettingsPage() {
  const { mode, user, signOut } = useAuth();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearLocalDialogOpen, setClearLocalDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAllData() {
    setIsDeleting(true);
    try {
      if (mode === 'authenticated' && user) {
        // Delete all cloud data
        await dbHelpers.deleteAllUserData(user.id);

        // Also clear local data
        await clearLocalData();

        // Sign out
        await signOut();
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to delete data:', error);
      alert('Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  async function handleClearLocalData() {
    setIsDeleting(true);
    try {
      await clearLocalData();
      router.push('/');
    } catch (error) {
      console.error('Failed to clear local data:', error);
      alert('Failed to clear local data. Please try again.');
    } finally {
      setIsDeleting(false);
      setClearLocalDialogOpen(false);
    }
  }

  async function clearLocalData() {
    // Clear all IndexedDB tables
    await localDB.sessionLogs.clear();
    await localDB.people.clear();
    await localDB.supportingInputs.clear();
    await localDB.insights.clear();
  }

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto pb-24">
      <div className="pt-8 pb-6 space-y-2">
        <h1 className="text-2xl font-light tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">Account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        {mode === 'authenticated' && user ? (
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="rounded-full bg-muted p-2">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-base mb-1">Account</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="rounded-full bg-muted p-2">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-base mb-1">Guest Mode</h2>
                <p className="text-sm text-muted-foreground">
                  Create an account to sync your data across devices
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Create Account
            </Button>
          </Card>
        )}

        {/* Data Management */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="rounded-full bg-muted p-2">
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-medium text-base mb-1">Data Management</h2>
              <p className="text-sm text-muted-foreground">
                Manage your stored data
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mode === 'authenticated' && user && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All My Data
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setClearLocalDialogOpen(true)}
              className="w-full"
            >
              Clear Local Data
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6">
          <h2 className="font-medium text-base mb-4">About</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Vibe by Vektra v1.1</p>
            <p>
              A private reflection tool for tracking post-session patterns
            </p>
          </div>
        </Card>
      </div>

      {/* Delete All Data Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all your data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your sessions, people, supporting
              inputs, and insights from both local storage and cloud. This action
              cannot be undone, and you will be signed out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllData}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Local Data Confirmation */}
      <AlertDialog
        open={clearLocalDialogOpen}
        onOpenChange={setClearLocalDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear local data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all data stored locally on this device. If
              you&apos;re signed in, your cloud data will remain intact and you can
              re-sync. If you&apos;re in guest mode, this data will be permanently
              lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearLocalData}
              disabled={isDeleting}
            >
              {isDeleting ? 'Clearing...' : 'Clear Local Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
