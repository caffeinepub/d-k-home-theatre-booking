import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  type UserRole = AccessControl.UserRole;

  // Inline custom Result type (removing dependency on std lib Result)
  public type Result<Ok, Err> = {
    #ok : Ok;
    #err : Err;
  };

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
    // Optional principal to track which authenticated user made the reservation
    userId : ?Principal;
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

  // Blocked users set to store currently blocked users.
  var blockedUsers = Map.empty<Principal, ()>();

  // Initialize the access control system.
  // MixinAuthorization calls AccessControl.initialize with the deployer principal,
  // automatically granting the deployer the admin role on first deploy.
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Error types for Result returns ─────────────────────────────────────────

  public type Error = {
    #notAuthorized;
    #invalidInput : Text;
    #notFound : Text;
    #internalError : Text;
  };

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

  public shared ({ caller }) func addScreening(screening : Screening) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    if (screening.title == "") {
      return #err(#invalidInput("Title cannot be empty"));
    };
    switch (screenings.get(screening.id)) {
      case (null) {};
      case (?_) {
        return #err(#invalidInput("Screening already exists"));
      };
    };
    screenings.add(screening.id, screening);
    #ok(());
  };

  public shared ({ caller }) func editScreening(id : ScreeningId, updatedScreening : Screening) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    switch (screenings.get(id)) {
      case (null) {
        return #err(#notFound("Screening does not exist"));
      };
      case (?_) {
        screenings.add(id, updatedScreening);
        #ok(());
      };
    };
  };

  public shared ({ caller }) func deleteScreening(id : ScreeningId) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    switch (screenings.get(id)) {
      case (null) {
        return #err(#notFound("Screening does not exist"));
      };
      case (?_) {
        screenings.remove(id);
        // Remove seat plan and reservations for this screening.
        seatPlans.remove(id);
        for ((resId, resv) in reservations.entries()) {
          if (resv.screeningId == id) {
            reservations.remove(resId);
          };
        };
        #ok(());
      };
    };
  };

  // ── Public screening browsing (no auth required) ─────────────────────────

  public query func getScreening(id : ScreeningId) : async Result<Screening, Error> {
    switch (screenings.get(id)) {
      case (null) {
        #err(#notFound("Screening does not exist"));
      };
      case (?screening) {
        #ok(screening);
      };
    };
  };

  public query func getAllScreenings() : async [Screening] {
    screenings.values().toArray().sort();
  };

  // ── Seat plan management (admin write, public read) ───────────────────────

  public shared ({ caller }) func createSeatPlan(screeningId : ScreeningId) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    switch (screenings.get(screeningId)) {
      case (null) {
        return #err(#notFound("Screening does not exist"));
      };
      case (?_) {};
    };
    switch (seatPlans.get(screeningId)) {
      case (null) {};
      case (?_) {
        return #err(#invalidInput("Seat plan already exists"));
      };
    };
    seatPlans.add(screeningId, Map.empty<SeatId, Seat>());
    #ok(());
  };

  public query func getSeatPlan(screeningId : ScreeningId) : async Result<[(Text, Seat)], Error> {
    switch (seatPlans.get(screeningId)) {
      case (null) {
        #err(#notFound("Seat plan does not exist"));
      };
      case (?seats) {
        #ok(seats.toArray());
      };
    };
  };

  public shared ({ caller }) func addSeat(screeningId : ScreeningId, seat : Seat) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    switch (seatPlans.get(screeningId)) {
      case (null) {
        return #err(#notFound("Seat plan does not exist"));
      };
      case (?seats) {
        switch (seats.get(seat.id)) {
          case (null) {
            seats.add(seat.id, seat);
            #ok(());
          };
          case (?_) {
            #err(#invalidInput("Seat already exists"));
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeSeat(screeningId : ScreeningId, seatId : SeatId) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    switch (seatPlans.get(screeningId)) {
      case (null) {
        return #err(#notFound("Seat plan does not exist"));
      };
      case (?seats) {
        switch (seats.get(seatId)) {
          case (null) {
            #err(#notFound("Seat does not exist"));
          };
          case (?_) {
            seats.remove(seatId);
            #ok(());
          };
        };
      };
    };
  };

  public shared ({ caller }) func toggleSeatStatus(screeningId : ScreeningId, seatId : SeatId) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    switch (seatPlans.get(screeningId)) {
      case (null) {
        return #err(#notFound("Seat plan does not exist"));
      };
      case (?seats) {
        switch (seats.get(seatId)) {
          case (null) {
            #err(#notFound("Seat does not exist"));
          };
          case (?seat) {
            let updatedSeat = {
              seat with status = switch (seat.status) {
                case (#available) { #booked };
                case (_) { #available };
              };
            };
            seats.add(seatId, updatedSeat);
            #ok(());
          };
        };
      };
    };
  };

  // ── Booking flow (public: any visitor can make a reservation) ─────────────

  // Making a reservation requires no login — any visitor (guest) can book.
  // However, blocked users are not allowed to make reservations.
  public shared ({ caller }) func makeReservation(reservationId : Text, reservation : Reservation) : async Result<(), Error> {
    // Blocked users cannot make new reservations
    if (not caller.isAnonymous()) {
      switch (blockedUsers.get(caller)) {
        case (?_) {
          return #err(#notAuthorized);
        };
        case (null) {};
      };
    };

    if (reservation.customerName == "" or reservation.contactInfo == "") {
      return #err(#invalidInput("Customer name and contact info are required"));
    };
    switch (screenings.get(reservation.screeningId)) {
      case (null) {
        return #err(#notFound("Screening does not exist"));
      };
      case (?_) {};
    };
    switch (seatPlans.get(reservation.screeningId)) {
      case (null) {
        return #err(#notFound("Seat plan does not exist for this screening"));
      };
      case (?seats) {
        for (seatId in reservation.seatIds.vals()) {
          switch (seats.get(seatId)) {
            case (null) {
              return #err(#notFound("Seat does not exist: " # seatId));
            };
            case (?seat) {
              if (seat.status != #available) {
                return #err(#invalidInput("Seat not available: " # seatId));
              };
              seats.add(seatId, { seat with status = #reserved });
            };
          };
        };
      };
    };
    // Store the caller principal so we can cancel reservations if the user is blocked
    let callerPrincipal : ?Principal = if (caller.isAnonymous()) { null } else { ?caller };
    let newReservation = {
      reservation with
      status = #pending;
      userId = callerPrincipal;
    };
    reservations.add(reservationId, newReservation);
    #ok(());
  };

  // ── Reservation management (admin only — contains customer PII) ───────────

  public shared ({ caller }) func confirmReservation(id : Text) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    switch (reservations.get(id)) {
      case (null) {
        #err(#notFound("Reservation does not exist"));
      };
      case (?reservation) {
        let updatedReservation = {
          reservation with status = #confirmed;
        };
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
        #ok(());
      };
    };
  };

  public shared ({ caller }) func cancelReservation(id : Text) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    switch (reservations.get(id)) {
      case (null) {
        #err(#notFound("Reservation does not exist"));
      };
      case (?reservation) {
        let updatedReservation = {
          reservation with status = #cancelled;
        };
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
        #ok(());
      };
    };
  };

  // Admin-only: viewing reservations exposes customer PII (name, contact info)
  public query ({ caller }) func getReservationsByScreening(screeningId : Text) : async Result<[Reservation], Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    let filtered = reservations.entries().toArray()
      .filter(func((_, r) : (Text, Reservation)) : Bool { r.screeningId == screeningId })
      .map(func((_, r) : (Text, Reservation)) : Reservation { r });
    #ok(filtered);
  };

  // Admin-only: viewing a single reservation exposes customer PII
  public query ({ caller }) func getReservation(id : Text) : async Result<Reservation, Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    switch (reservations.get(id)) {
      case (null) {
        #err(#notFound("Reservation does not exist"));
      };
      case (?reservation) {
        #ok(reservation);
      };
    };
  };

  // Admin-only: list all reservations across all screenings
  public query ({ caller }) func getAllReservations() : async Result<[(Text, Reservation)], Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    #ok(reservations.toArray());
  };

  // ── Admin-only: Blocking and unblocking users ─────────────────────────────

  public shared ({ caller }) func blockUser(user : Principal) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };

    blockedUsers.add(user, ());
    // Cancel and remove all active reservations made by the blocked user,
    // freeing up their seats so other users can book them.
    cancelAndRemoveReservationsForBlockedUser(user);
    #ok(());
  };

  // Cancels all non-cancelled reservations belonging to the given user principal,
  // frees the associated seats back to #available, and removes the reservation records.
  func cancelAndRemoveReservationsForBlockedUser(user : Principal) {
    // Collect reservation IDs to process (avoid mutating map while iterating)
    let toCancel = reservations.entries().toArray()
      .filter(func((_, r) : (Text, Reservation)) : Bool {
        switch (r.userId) {
          case (?uid) { uid == user and r.status != #cancelled };
          case (null) { false };
        };
      })
      .map(func((id, _) : (Text, Reservation)) : Text { id });

    for (resId in toCancel.vals()) {
      switch (reservations.get(resId)) {
        case (null) {};
        case (?reservation) {
          // Free up the seats in the seat plan
          switch (seatPlans.get(reservation.screeningId)) {
            case (null) {};
            case (?seats) {
              for (seatId in reservation.seatIds.vals()) {
                switch (seats.get(seatId)) {
                  case (null) {};
                  case (?seat) {
                    // Only free seats that were reserved/booked by this reservation
                    if (seat.status == #reserved or seat.status == #booked) {
                      seats.add(seatId, { seat with status = #available });
                    };
                  };
                };
              };
            };
          };
          // Remove the reservation entirely so it disappears from the admin UI
          reservations.remove(resId);
        };
      };
    };
  };

  public shared ({ caller }) func unblockUser(user : Principal) : async Result<(), Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };

    blockedUsers.remove(user);
    #ok(());
  };

  // Admin-only: check whether a given user is currently blocked
  public query ({ caller }) func isUserBlocked(user : Principal) : async Result<Bool, Error> {
    if (AccessControl.isAdmin(accessControlState, caller) == false) {
      return #err(#notAuthorized);
    };
    switch (blockedUsers.get(user)) {
      case (?_) { #ok(true) };
      case (null) { #ok(false) };
    };
  };
};

