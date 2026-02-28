import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Enable automatic data migration on upgrades to new logic
(with migration = Migration.run)
actor {
  type UserRole = AccessControl.UserRole;

  public type ScreeningId = Text;
  public type SeatId = Text;

  public type Screening = {
    id : ScreeningId;
    title : Text;
    date : Time.Time;
    time : Text;
    description : Text;
    posterImages : [Text];
    trailerLinks : [Text];
  };

  public type Seat = {
    id : SeatId;
    row : Text;
    number : Nat;
    status : SeatStatus;
  };

  public type Seats = Map.Map<SeatId, Seat>;

  public type Reservation = {
    customerName : Text;
    contactInfo : Text;
    screeningId : ScreeningId;
    seatIds : [SeatId];
    status : ReservationStatus;
  };

  public type SeatStatus = {
    #available;
    #reserved;
    #booked;
  };

  public type ReservationStatus = {
    #pending;
    #confirmed;
    #cancelled;
  };

  public type UserProfile = {
    name : Text;
    contactInfo : Text;
  };

  module Screening {
    public func compare(a : Screening, b : Screening) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  let screenings = Map.empty<ScreeningId, Screening>();
  let seatPlans = Map.empty<ScreeningId, Seats>();
  let reservations = Map.empty<Text, Reservation>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize the access control system.
  // MixinAuthorization calls AccessControl.initialize with the deployer principal,
  // automatically granting the deployer the admin role on first deploy.
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Admin role management ─────────────────────────────────────────────────

  // Only an existing admin can grant the admin role to another principal.
  // AccessControl.assignRole already enforces admin-only access internally,
  // but we add an explicit guard here for clarity and defense-in-depth.
  public shared ({ caller }) func grantAdminRole(candidate : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can grant the admin role");
    };
    AccessControl.assignRole(accessControlState, caller, candidate, #admin);
  };

  // ── User profile functions (required by frontend) ─────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Screening management (admin only) ─────────────────────────────────────

  public shared ({ caller }) func addScreening(screening : Screening) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add screenings");
    };
    screenings.add(screening.id, screening);
  };

  public shared ({ caller }) func editScreening(id : ScreeningId, updatedScreening : Screening) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can edit screenings");
    };
    screenings.add(id, updatedScreening);
  };

  public shared ({ caller }) func deleteScreening(id : ScreeningId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete screenings");
    };
    screenings.remove(id);
    seatPlans.remove(id);
    // Remove all reservations for this screening
    for ((resId, res) in reservations.entries().toArray().vals()) {
      if (res.screeningId == id) {
        reservations.remove(resId);
      };
    };
  };

  // ── Public screening browsing (no auth required) ─────────────────────────

  public query func getScreening(id : ScreeningId) : async Screening {
    switch (screenings.get(id)) {
      case (null) {
        Runtime.trap("Screening does not exist");
      };
      case (?screening) {
        screening;
      };
    };
  };

  public query func getAllScreenings() : async [Screening] {
    screenings.values().toArray().sort();
  };

  // ── Seat plan management (admin write, public read) ───────────────────────

  public shared ({ caller }) func createSeatPlan(screeningId : ScreeningId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can manage seat plans");
    };
    seatPlans.add(screeningId, Map.empty<SeatId, Seat>());
  };

  // Public: anyone can view the seat map to browse availability
  public query func getSeatPlan(screeningId : ScreeningId) : async [(Text, Seat)] {
    switch (seatPlans.get(screeningId)) {
      case (null) {
        Runtime.trap("Seat plan does not exist");
      };
      case (?seats) {
        seats.toArray();
      };
    };
  };

  public shared ({ caller }) func addSeat(screeningId : ScreeningId, seat : Seat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add seats");
    };
    switch (seatPlans.get(screeningId)) {
      case (null) {
        Runtime.trap("Seat plan does not exist");
      };
      case (?seats) {
        seats.add(seat.id, seat);
      };
    };
  };

  public shared ({ caller }) func removeSeat(screeningId : ScreeningId, seatId : SeatId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can remove seats");
    };
    switch (seatPlans.get(screeningId)) {
      case (null) {
        Runtime.trap("Seat plan does not exist");
      };
      case (?seats) {
        seats.remove(seatId);
      };
    };
  };

  public shared ({ caller }) func toggleSeatStatus(screeningId : ScreeningId, seatId : SeatId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can toggle seat status");
    };
    switch (seatPlans.get(screeningId)) {
      case (null) {
        Runtime.trap("Seat plan does not exist");
      };
      case (?seats) {
        switch (seats.get(seatId)) {
          case (null) {
            Runtime.trap("Seat does not exist");
          };
          case (?seat) {
            let updatedSeat = {
              seat with status = switch (seat.status) {
                case (#available) { #booked };
                case (_) { #available };
              };
            };
            seats.add(seatId, updatedSeat);
          };
        };
      };
    };
  };

  // ── Booking flow (public: any visitor can make a reservation) ─────────────

  // Making a reservation requires no login — any visitor (guest) can book.
  public shared ({ caller }) func makeReservation(reservationId : Text, reservation : Reservation) : async () {
    if (reservation.customerName == "" or reservation.contactInfo == "") {
      Runtime.trap("Invalid reservation: Name and contact info are required");
    };
    // Verify the screening exists
    switch (screenings.get(reservation.screeningId)) {
      case (null) {
        Runtime.trap("Screening does not exist");
      };
      case (?_) {};
    };
    // Verify seats exist and are available, then mark them reserved
    switch (seatPlans.get(reservation.screeningId)) {
      case (null) {
        Runtime.trap("Seat plan does not exist for this screening");
      };
      case (?seats) {
        for (seatId in reservation.seatIds.vals()) {
          switch (seats.get(seatId)) {
            case (null) {
              Runtime.trap("Seat does not exist: " # seatId);
            };
            case (?seat) {
              if (seat.status != #available) {
                Runtime.trap("Seat is not available: " # seatId);
              };
              seats.add(seatId, { seat with status = #reserved });
            };
          };
        };
      };
    };
    let newReservation = { reservation with status = #pending };
    reservations.add(reservationId, newReservation);
  };

  // ── Reservation management (admin only — contains customer PII) ───────────

  public shared ({ caller }) func confirmReservation(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can confirm reservations");
    };
    switch (reservations.get(id)) {
      case (null) {
        Runtime.trap("Reservation does not exist");
      };
      case (?reservation) {
        let updatedReservation = {
          reservation with status = #confirmed;
        };
        // Mark seats as booked
        switch (seatPlans.get(reservation.screeningId)) {
          case (null) {};
          case (?seats) {
            for (seatId in reservation.seatIds.vals()) {
              switch (seats.get(seatId)) {
                case (null) {};
                case (?seat) {
                  seats.add(seatId, { seat with status = #booked });
                };
              };
            };
          };
        };
        reservations.add(id, updatedReservation);
      };
    };
  };

  public shared ({ caller }) func cancelReservation(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can cancel reservations");
    };
    switch (reservations.get(id)) {
      case (null) {
        Runtime.trap("Reservation does not exist");
      };
      case (?reservation) {
        let updatedReservation = {
          reservation with status = #cancelled;
        };
        // Free up the seats back to available
        switch (seatPlans.get(reservation.screeningId)) {
          case (null) {};
          case (?seats) {
            for (seatId in reservation.seatIds.vals()) {
              switch (seats.get(seatId)) {
                case (null) {};
                case (?seat) {
                  seats.add(seatId, { seat with status = #available });
                };
              };
            };
          };
        };
        reservations.add(id, updatedReservation);
      };
    };
  };

  // Admin-only: viewing reservations exposes customer PII (name, contact info)
  public query ({ caller }) func getReservationsByScreening(screeningId : Text) : async [Reservation] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view reservations");
    };
    reservations.entries().toArray()
      .filter(func((_, r) : (Text, Reservation)) : Bool { r.screeningId == screeningId })
      .map(func((_, r) : (Text, Reservation)) : Reservation { r });
  };

  // Admin-only: viewing a single reservation exposes customer PII
  public query ({ caller }) func getReservation(id : Text) : async Reservation {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view reservation details");
    };
    switch (reservations.get(id)) {
      case (null) {
        Runtime.trap("Reservation does not exist");
      };
      case (?reservation) {
        reservation;
      };
    };
  };

  // Admin-only: list all reservations across all screenings
  public query ({ caller }) func getAllReservations() : async [(Text, Reservation)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all reservations");
    };
    reservations.toArray();
  };
};
