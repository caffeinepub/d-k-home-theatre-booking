import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
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

  // Actor state shape — matches the stable fields of the actor
  public type ActorState = {
    screenings : Map.Map<ScreeningId, Screening>;
    seatPlans : Map.Map<ScreeningId, Seats>;
    reservations : Map.Map<Text, Reservation>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  // Migration function: identity migration — no structural changes needed
  // since the superAdmin_ variable has been removed from the actor.
  public func run(old : ActorState) : ActorState {
    old;
  };
};
