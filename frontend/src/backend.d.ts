import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type SeatId = string;
export interface Seat {
    id: SeatId;
    row: string;
    status: SeatStatus;
    number: bigint;
}
export interface Reservation {
    customerName: string;
    status: ReservationStatus;
    contactInfo: string;
    seatIds: Array<SeatId>;
    screeningId: ScreeningId;
}
export interface Screening {
    id: ScreeningId;
    title: string;
    date: Time;
    time: string;
    description: string;
    trailerLinks: Array<string>;
    posterImages: Array<string>;
}
export type ScreeningId = string;
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
    addScreening(screening: Screening): Promise<void>;
    addSeat(screeningId: ScreeningId, seat: Seat): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelReservation(id: string): Promise<void>;
    confirmReservation(id: string): Promise<void>;
    createSeatPlan(screeningId: ScreeningId): Promise<void>;
    deleteScreening(id: ScreeningId): Promise<void>;
    editScreening(id: ScreeningId, updatedScreening: Screening): Promise<void>;
    getAllReservations(): Promise<Array<[string, Reservation]>>;
    getAllScreenings(): Promise<Array<Screening>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getReservation(id: string): Promise<Reservation>;
    getReservationsByScreening(screeningId: string): Promise<Array<Reservation>>;
    getScreening(id: ScreeningId): Promise<Screening>;
    getSeatPlan(screeningId: ScreeningId): Promise<Array<[string, Seat]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantAdminRole(candidate: Principal): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    makeReservation(reservationId: string, reservation: Reservation): Promise<void>;
    removeSeat(screeningId: ScreeningId, seatId: SeatId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleSeatStatus(screeningId: ScreeningId, seatId: SeatId): Promise<void>;
}
