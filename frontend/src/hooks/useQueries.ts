import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Screening, ScreeningId, Seat, SeatId, Reservation, UserProfile } from '../backend';
import type { Principal } from '@dfinity/principal';

// ── Admin check ────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useGrantAdminRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidate: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.grantAdminRole(candidate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
    },
  });
}

// ── User profile ───────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Screenings ─────────────────────────────────────────────────────────────────

export function useGetAllScreenings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Screening[]>({
    queryKey: ['screenings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllScreenings();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useGetScreening(id: ScreeningId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Screening | null>({
    queryKey: ['screening', id],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getScreening(id);
      if (result.__kind__ === 'ok') return result.ok;
      throw new Error(
        result.__kind__ === 'err'
          ? (result.err.__kind__ === 'notFound' ? result.err.notFound : 'Failed to load screening')
          : 'Unknown error'
      );
    },
    enabled: !!actor && !actorFetching && !!id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAddScreening() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (screening: Screening) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addScreening(screening);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screenings'] });
    },
  });
}

export function useEditScreening() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, screening }: { id: ScreeningId; screening: Screening }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editScreening(id, screening);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screenings'] });
    },
  });
}

export function useDeleteScreening() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: ScreeningId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteScreening(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screenings'] });
      queryClient.invalidateQueries({ queryKey: ['seatPlan'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
    },
  });
}

// ── Seat plan ──────────────────────────────────────────────────────────────────

export function useGetSeatPlan(screeningId: ScreeningId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[string, Seat][]>({
    queryKey: ['seatPlan', screeningId],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getSeatPlan(screeningId);
      if (result.__kind__ === 'ok') return result.ok;
      if (result.__kind__ === 'err' && result.err.__kind__ === 'notFound') return [];
      throw new Error(
        result.__kind__ === 'err' ? 'Failed to load seat plan' : 'Unknown error'
      );
    },
    enabled: !!actor && !actorFetching && !!screeningId,
    staleTime: 0,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateSeatPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (screeningId: ScreeningId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSeatPlan(screeningId);
    },
    onSuccess: (_data, screeningId) => {
      queryClient.invalidateQueries({ queryKey: ['seatPlan', screeningId] });
    },
  });
}

export function useAddSeat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ screeningId, seat }: { screeningId: ScreeningId; seat: Seat }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSeat(screeningId, seat);
    },
    onSuccess: (_data, { screeningId }) => {
      queryClient.invalidateQueries({ queryKey: ['seatPlan', screeningId] });
    },
  });
}

export function useRemoveSeat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ screeningId, seatId }: { screeningId: ScreeningId; seatId: SeatId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeSeat(screeningId, seatId);
    },
    onSuccess: (_data, { screeningId }) => {
      queryClient.invalidateQueries({ queryKey: ['seatPlan', screeningId] });
    },
  });
}

export function useToggleSeatStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ screeningId, seatId }: { screeningId: ScreeningId; seatId: SeatId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleSeatStatus(screeningId, seatId);
    },
    onSuccess: (_data, { screeningId }) => {
      queryClient.invalidateQueries({ queryKey: ['seatPlan', screeningId] });
    },
  });
}

// ── Reservations ───────────────────────────────────────────────────────────────

export function useGetReservationsByScreening(screeningId: ScreeningId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Reservation[]>({
    queryKey: ['reservations', screeningId],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getReservationsByScreening(screeningId);
      if (result.__kind__ === 'ok') return result.ok;
      if (result.__kind__ === 'err' && result.err.__kind__ === 'notAuthorized') {
        throw new Error('Not authorized to view reservations');
      }
      return [];
    },
    enabled: !!actor && !actorFetching && !!screeningId,
    staleTime: 0,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useGetAllReservations() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[string, Reservation][]>({
    queryKey: ['allReservations'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllReservations();
      if (result.__kind__ === 'ok') return result.ok;
      if (result.__kind__ === 'err' && result.err.__kind__ === 'notAuthorized') {
        throw new Error('Not authorized to view reservations');
      }
      return [];
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useMakeReservation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationId,
      reservation,
    }: {
      reservationId: string;
      reservation: Reservation;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.makeReservation(reservationId, reservation);
    },
    onSuccess: (_data, { reservation }) => {
      queryClient.invalidateQueries({ queryKey: ['seatPlan', reservation.screeningId] });
      queryClient.invalidateQueries({ queryKey: ['reservations', reservation.screeningId] });
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
    },
  });
}

export function useConfirmReservation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, screeningId }: { id: string; screeningId: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.confirmReservation(id);
      if (result.__kind__ === 'err') {
        const errMsg =
          result.err.__kind__ === 'notFound'
            ? result.err.notFound
            : result.err.__kind__ === 'notAuthorized'
            ? 'Not authorized'
            : 'Failed to confirm reservation';
        throw new Error(errMsg);
      }
      return result;
    },
    onMutate: async ({ id, screeningId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['allReservations'] });
      await queryClient.cancelQueries({ queryKey: ['reservations', screeningId] });

      // Snapshot previous values
      const previousAllReservations = queryClient.getQueryData<[string, Reservation][]>(['allReservations']);
      const previousReservations = queryClient.getQueryData<Reservation[]>(['reservations', screeningId]);

      // Optimistically update allReservations
      if (previousAllReservations) {
        queryClient.setQueryData<[string, Reservation][]>(
          ['allReservations'],
          previousAllReservations.map(([resId, res]) =>
            resId === id ? [resId, { ...res, status: 'confirmed' as Reservation['status'] }] : [resId, res]
          )
        );
      }

      // Optimistically update reservations by screening
      if (previousReservations) {
        // We don't have IDs here, so we can't optimistically update by ID
        // Just invalidate after success
      }

      return { previousAllReservations, previousReservations };
    },
    onError: (_err, { screeningId }, context) => {
      // Roll back optimistic updates
      if (context?.previousAllReservations) {
        queryClient.setQueryData(['allReservations'], context.previousAllReservations);
      }
      if (context?.previousReservations) {
        queryClient.setQueryData(['reservations', screeningId], context.previousReservations);
      }
    },
    onSettled: (_data, _err, { screeningId }) => {
      // Always refetch after mutation settles to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations', screeningId] });
      queryClient.invalidateQueries({ queryKey: ['seatPlan', screeningId] });
    },
  });
}

export function useCancelReservation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, screeningId }: { id: string; screeningId: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.cancelReservation(id);
      if (result.__kind__ === 'err') {
        const errMsg =
          result.err.__kind__ === 'notFound'
            ? result.err.notFound
            : result.err.__kind__ === 'notAuthorized'
            ? 'Not authorized'
            : 'Failed to cancel reservation';
        throw new Error(errMsg);
      }
      return result;
    },
    onMutate: async ({ id, screeningId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['allReservations'] });
      await queryClient.cancelQueries({ queryKey: ['reservations', screeningId] });

      // Snapshot previous values
      const previousAllReservations = queryClient.getQueryData<[string, Reservation][]>(['allReservations']);
      const previousReservations = queryClient.getQueryData<Reservation[]>(['reservations', screeningId]);

      // Optimistically update allReservations
      if (previousAllReservations) {
        queryClient.setQueryData<[string, Reservation][]>(
          ['allReservations'],
          previousAllReservations.map(([resId, res]) =>
            resId === id ? [resId, { ...res, status: 'cancelled' as Reservation['status'] }] : [resId, res]
          )
        );
      }

      return { previousAllReservations, previousReservations };
    },
    onError: (_err, { screeningId }, context) => {
      // Roll back optimistic updates
      if (context?.previousAllReservations) {
        queryClient.setQueryData(['allReservations'], context.previousAllReservations);
      }
      if (context?.previousReservations) {
        queryClient.setQueryData(['reservations', screeningId], context.previousReservations);
      }
    },
    onSettled: (_data, _err, { screeningId }) => {
      // Always refetch after mutation settles to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations', screeningId] });
      queryClient.invalidateQueries({ queryKey: ['seatPlan', screeningId] });
    },
  });
}

// ── User blocking ──────────────────────────────────────────────────────────────

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.blockUser(user);
      if (result.__kind__ === 'err') {
        const errMsg =
          result.err.__kind__ === 'notAuthorized'
            ? 'Not authorized to block users'
            : 'Failed to block user';
        throw new Error(errMsg);
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate all reservations and seat plans so blocked user's bookings disappear
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['seatPlan'] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.unblockUser(user);
      if (result.__kind__ === 'err') {
        const errMsg =
          result.err.__kind__ === 'notAuthorized'
            ? 'Not authorized to unblock users'
            : 'Failed to unblock user';
        throw new Error(errMsg);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['seatPlan'] });
    },
  });
}

export function useIsUserBlocked(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isUserBlocked', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return false;
      const result = await actor.isUserBlocked(user);
      if (result.__kind__ === 'ok') return result.ok;
      return false;
    },
    enabled: !!actor && !actorFetching && !!user,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
