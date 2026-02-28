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
  });
}

export function useGetScreening(id: ScreeningId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Screening>({
    queryKey: ['screening', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getScreening(id);
    },
    enabled: !!actor && !actorFetching && !!id,
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
      return actor.getSeatPlan(screeningId);
    },
    enabled: !!actor && !actorFetching && !!screeningId,
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
      return actor.getReservationsByScreening(screeningId);
    },
    enabled: !!actor && !actorFetching && !!screeningId,
  });
}

export function useGetAllReservations() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[string, Reservation][]>({
    queryKey: ['allReservations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReservations();
    },
    enabled: !!actor && !actorFetching,
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
    },
  });
}

export function useConfirmReservation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmReservation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
      queryClient.invalidateQueries({ queryKey: ['seatPlan'] });
    },
  });
}

export function useCancelReservation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelReservation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['allReservations'] });
      queryClient.invalidateQueries({ queryKey: ['seatPlan'] });
    },
  });
}
