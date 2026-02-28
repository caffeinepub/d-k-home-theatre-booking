import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type Screening = {
    id : Text;
    title : Text;
    date : Int;
    time : Text;
    description : Text;
    posterImages : [Text];
    trailerLinks : [Text];
  };

  public type Seat = {
    id : Text;
    row : Text;
    number : Nat;
    status : SeatStatus;
  };

  public type SeatStatus = {
    #available;
    #reserved;
    #booked;
  };

  // Old reservation type without userId field
  public type OldReservation = {
    customerName : Text;
    contactInfo : Text;
    screeningId : Text;
    seatIds : [Text];
    status : ReservationStatus;
  };

  // New reservation type with optional userId field
  public type Reservation = {
    customerName : Text;
    contactInfo : Text;
    screeningId : Text;
    seatIds : [Text];
    status : ReservationStatus;
    userId : ?Principal;
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

  public type OldActor = {
    screenings : Map.Map<Text, Screening>;
    seatPlans : Map.Map<Text, Map.Map<Text, Seat>>;
    reservations : Map.Map<Text, OldReservation>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public type NewActor = {
    screenings : Map.Map<Text, Screening>;
    seatPlans : Map.Map<Text, Map.Map<Text, Seat>>;
    reservations : Map.Map<Text, Reservation>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    // Migrate reservations: add userId = null for all existing reservations
    // since we don't know which principal made them previously.
    let migratedReservations = old.reservations.map<Text, OldReservation, Reservation>(
      func(_id, r) : Reservation {
        {
          customerName = r.customerName;
          contactInfo = r.contactInfo;
          screeningId = r.screeningId;
          seatIds = r.seatIds;
          status = r.status;
          userId = null;
        };
      }
    );

    {
      screenings = old.screenings;
      seatPlans = old.seatPlans;
      reservations = migratedReservations;
      userProfiles = old.userProfiles;
    };
  };
};
