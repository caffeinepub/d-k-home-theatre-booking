import React from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { useIsCallerAdmin, useGrantAdminRole } from '../../hooks/useQueries';
import { ShieldAlert, Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, loginStatus, login } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const {
    data: isAdmin,
    isLoading: adminLoading,
    isFetched: adminFetched,
    error: adminError,
  } = useIsCallerAdmin();

  const grantAdminRole = useGrantAdminRole();

  // Show spinner while: logging in, actor is initializing, or admin check is in flight
  const isInitializing = isLoggingIn || actorFetching || (isAuthenticated && !!actor && !adminFetched);

  const handleClaimAdmin = async () => {
    if (!identity) return;
    try {
      const principal = identity.getPrincipal();
      await grantAdminRole.mutateAsync(principal as unknown as Principal);
      toast.success('Admin access granted! Welcome to the Admin Panel.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Unauthorized') || message.includes('Only admins')) {
        toast.error('Admin access already claimed by another user. Contact the current administrator.');
      } else {
        toast.error(`Failed to claim admin access: ${message}`);
      }
    }
  };

  if (isInitializing || adminLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-gold-400" />
        <p className="text-grey-400 text-sm">Verifying access…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <ShieldAlert className="w-16 h-16 text-gold-400" />
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Admin Access Required</h2>
          <p className="text-grey-400 max-w-sm">
            Please log in with your administrator account to access the Admin Panel.
          </p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="bg-gold-500 hover:bg-gold-400 text-dark-900 font-semibold px-8"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in…
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </>
          )}
        </Button>
      </div>
    );
  }

  // Authenticated but not admin — offer to claim admin access
  if (adminFetched && !isAdmin && !adminError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <ShieldCheck className="w-16 h-16 text-gold-400" />
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Claim Admin Access</h2>
          <p className="text-grey-400 max-w-sm">
            No admin role is assigned to your account yet. If you are the application owner, claim admin access to manage this theatre.
          </p>
        </div>
        <Button
          onClick={handleClaimAdmin}
          disabled={grantAdminRole.isPending}
          className="bg-gold-500 hover:bg-gold-400 text-dark-900 font-semibold px-8"
        >
          {grantAdminRole.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Claiming Access…
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Claim Admin Access
            </>
          )}
        </Button>
        {grantAdminRole.isError && (
          <p className="text-red-400 text-xs max-w-sm text-center break-all">
            {grantAdminRole.error instanceof Error
              ? grantAdminRole.error.message
              : String(grantAdminRole.error)}
          </p>
        )}
      </div>
    );
  }

  if (adminError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-grey-400 max-w-sm">
            Your account does not have administrator privileges. Please contact the system administrator.
          </p>
          <p className="text-red-400 text-xs mt-2 max-w-sm break-all">
            {String(adminError)}
          </p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  // Fallback loading state
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-gold-400" />
      <p className="text-grey-400 text-sm">Loading…</p>
    </div>
  );
}
