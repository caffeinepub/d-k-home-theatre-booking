import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Result_2 = {
    __kind__: "ok";
    ok: Array<[string, Seat]>;
} | {
    __kind__: "err";
    err: Error_;
};
export type Time = bigint;
export type SeatId = string;
export interface Seat {
    id: SeatId;
    row: string;
    status: SeatStatus;
    number: bigint;
}
export type Result_6 = {
    __kind__: "ok";
    ok: Array<[string, Reservation]>;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Screening {
    id: ScreeningId;
    title: string;
    date: Time;
    time: string;
    description: string;
    trailerLinks: Array<string>;
    posterImages: Array<string>;
}
export type Result_5 = {
    __kind__: "ok";
    ok: Reservation;
} | {
    __kind__: "err";
    err: Error_;
};
export type ScreeningId = string;
export type Result_1 = {
    __kind__: "ok";
    ok: boolean;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Reservation {
    customerName: string;
    status: ReservationStatus;
    contactInfo: string;
    seatIds: Array<SeatId>;
    userId?: Principal;
    screeningId: ScreeningId;
}
export type Error_ = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "invalidInput";
    invalidInput: string;
} | {
    __kind__: "notFound";
    notFound: string;
} | {
    __kind__: "internalError";
    internalError: string;
};
export type Result_4 = {
    __kind__: "ok";
    ok: Array<Reservation>;
} | {
    __kind__: "err";
    err: Error_;
};
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Result_3 = {
    __kind__: "ok";
    ok: Screening;
} | {
    __kind__: "err";
    err: Error_;
};
export interface UserProfile {
    contactInfo: string;
    name: string;
}
export enum ReservationStatus {
    cancelled = "cancelled",
    pending = "pending",
    confirmed = "confirmed"
}
export enum SeatStatus {
    reserved = "reserved",
    booked = "booked",
    available = "available"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addScreening(screening: Screening): Promise<Result>;
    addSeat(screeningId: ScreeningId, seat: Seat): Promise<Result>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(user: Principal): Promise<Result>;
    cancelReservation(id: string): Promise<Result>;
    confirmReservation(id: string): Promise<Result>;
    createSeatPlan(screeningId: ScreeningId): Promise<Result>;
    deleteScreening(id: ScreeningId): Promise<Result>;
    editScreening(id: ScreeningId, updatedScreening: Screening): Promise<Result>;
    getAllReservations(): Promise<Result_6>;
    getAllScreenings(): Promise<Array<Screening>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getReservation(id: string): Promise<Result_5>;
    getReservationsByScreening(screeningId: string): Promise<Result_4>;
    getScreening(id: ScreeningId): Promise<Result_3>;
    getSeatPlan(screeningId: ScreeningId): Promise<Result_2>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantAdminRole(candidate: Principal): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isUserBlocked(user: Principal): Promise<Result_1>;
    makeReservation(reservationId: string, reservation: Reservation): Promise<Result>;
    removeSeat(screeningId: ScreeningId, seatId: SeatId): Promise<Result>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleSeatStatus(screeningId: ScreeningId, seatId: SeatId): Promise<Result>;
    unblockUser(user: Principal): Promise<Result>;
}
