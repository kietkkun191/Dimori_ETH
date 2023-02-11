import {
  AddRental,
  Home,
  Rentals,
  BookedSchedules,
  YourRentals,
  EditRental,
  RemoveRental,
  CancelBooking,
  UserCancelledBookings,
  RenterCancelledBookings,
  ConfirmCancelBooking,
  Footer
} from "./pages";
import { Route, Routes, HashRouter } from "react-router-dom";

function App() {
  return (
    <>
      <div>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/add-rental" element={<AddRental />} />
            <Route path="/booked-schedules" element={<BookedSchedules />} />
            <Route path="/your-rentals" element={<YourRentals />} />
            <Route path="/edit-rental" element={<EditRental />} />
            <Route path="/remove-rental" element={<RemoveRental />} />
            <Route path="/cancel-booking" element={<CancelBooking />} />
            <Route
              path="/user-cancelled-booking"
              element={<UserCancelledBookings />}
            />
            <Route
              path="/renter-cancelled-booking"
              element={<RenterCancelledBookings />}
            />
            <Route
              path="/confirm-cancel-booking"
              element={<ConfirmCancelBooking />}
            />
          </Routes>
        </HashRouter>
      </div>
      <Footer/>
      
    </>
  );
}

export default App;
