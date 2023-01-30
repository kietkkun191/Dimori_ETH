// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "./PriceConverter.sol";

contract DimoriMain is PriceConverter {
    //--------------------------------------------------------------------
    // VARIABLES

    address public admin;

    uint256 public listingFee;
    uint256 private _rentalIds;
    uint256 private _bookingIds;

    struct RentalInfo {
        uint256 id;
        address owner;
        string name;
        string city;
        string theme;
        string contactAddress;
        string latitude;
        string longitude;
        string description;
        string imgUrl;
        uint256 maxNumberOfGuests;
        uint256 pricePerDay;
    }

    struct Booking {
        uint256 id;
        uint256 rentalId;
        address rentalOwner;
        address renter;
        uint256 fromTimestamp;
        uint256 toTimestamp;
        bool isWaitingForCancel;
        bool isCheckin;
        bool isExpiered;
    }

    RentalInfo[] public rentals;
    Booking[] public rentalBookings;

    //--------------------------------------------------------------------
    // EVENTS

    event NewRentalCreated(
        uint256 id,
        address owner,
        string name,
        string city,
        string theme,
        string contactAddress,
        string latitude,
        string longitude,
        string description,
        string imgUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        uint256 timestamp
    );

    event RentalEdited(
        uint256 id,
        address owner,
        string name,
        string city,
        string theme,
        string contactAddress,
        string latitude,
        string longitude,
        string description,
        string imgUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        uint256 timestamp
    );

    event NewBookAdded(
        uint256 id,
        uint256 rentalId,
        address rentalOwner,
        address renter,
        uint256 bookDateStart,
        uint256 bookDateEnd,
        uint256 timestamp
    );

    //--------------------------------------------------------------------
    // ERRORS

    error OnlyAdmin();
    error InvalidFee();
    error InvalidRentalId();
    error InvalidBookingId();
    error InvalidBookingPeriod();
    error AlreadyBooked();
    error InsufficientAmount();
    error TransferFailed();
    error CannotRemoveRental();

    //--------------------------------------------------------------------
    // MODIFIERS

    modifier onlyAdmin() {
        if(msg.sender != admin) revert OnlyAdmin();
        _;
    }

    modifier isRental(uint _id) {
        if(_id >= _rentalIds) revert InvalidRentalId();
        _;
    }

    modifier isBooking(uint _id){
        if(_id >= _bookingIds) revert InvalidBookingId();
        _;
    }

    //--------------------------------------------------------------------
    // CONSTRUCTOR

    constructor(uint256 _listingFee, address _priceFeedAddress) {
        admin = msg.sender;
        listingFee = _listingFee;
        priceFeedAddress = _priceFeedAddress;
    }

    //--------------------------------------------------------------------
    // FUNCTIONS
    
    // CRUD Home
    function addRental(
        string memory _name,
        string memory _city,
        string memory _theme,
        string memory _contactAddress,
        string memory _latitude,
        string memory _longitude,
        string memory _description,
        string memory _imgUrl,
        uint256 _maxGuests,
        uint256 _pricePerDay
    ) external payable {
        if(msg.value != listingFee) revert InvalidFee();
        uint256 _rentalId = _rentalIds;

        RentalInfo memory _rental = RentalInfo(
            _rentalId,
            msg.sender,
            _name,
            _city,
            _theme,
            _contactAddress,
            _latitude,
            _longitude,
            _description,
            _imgUrl,
            _maxGuests,
            _pricePerDay
        );

        rentals.push(_rental);
        _rentalIds++;

        emit NewRentalCreated(
            _rentalId,
            msg.sender,
            _name,
            _city,
            _theme,
            _contactAddress,
            _latitude,
            _longitude,
            _description,
            _imgUrl,
            _maxGuests,
            _pricePerDay,
            block.timestamp
        );
    }

    function editRental(
        uint256 _rentalId, 
        string memory _name,
        string memory _city,
        string memory _theme,
        string memory _contactAddress,
        string memory _latitude,
        string memory _longitude,
        string memory _description,
        string memory _imgUrl,
        uint256 _maxGuests,
        uint256 _pricePerDay
    ) external payable {
        if(msg.value != listingFee) revert InvalidFee();

        // If rental index out of index range then return
        if(_rentalId >= _rentalIds) return;

        rentals[_rentalId].name = _name;
        rentals[_rentalId].city = _city;
        rentals[_rentalId].theme = _theme;
        rentals[_rentalId].contactAddress = _contactAddress;
        rentals[_rentalId].latitude = _latitude;
        rentals[_rentalId].longitude = _longitude;
        rentals[_rentalId].description = _description;
        rentals[_rentalId].imgUrl = _imgUrl;
        rentals[_rentalId].maxNumberOfGuests = _maxGuests;
        rentals[_rentalId].pricePerDay = _pricePerDay;

        emit RentalEdited(
            _rentalId,
            msg.sender,
            _name,
            _city,
            _theme,
            _contactAddress,
            _latitude,
            _longitude,
            _description,
            _imgUrl,
            _maxGuests,
            _pricePerDay,
            block.timestamp
        );
    }

    function removeHome(uint _rentalId) public{
        if (_rentalId >= _rentalIds) return;
        for (uint i = 0; i < _bookingIds; i++){
            if(rentalBookings[i].rentalId == _rentalId) 
            {
                revert CannotRemoveRental();
            }
        }
        for (uint i = _rentalId; i < _rentalIds - 1; i++){
            rentals[i] = rentals[i+1];
        }
        delete rentals[_rentalIds - 1];
        _rentalIds -= 1;
    }

    // Booking
    function bookDates(
        uint256 _rentalId,
        uint256 _fromDateTimestamp,
        uint256 _toDateTimestamp
    ) external payable isRental(_rentalId) {

        RentalInfo memory _rental = rentals[_rentalId];

        uint256 bookingPeriod = (_toDateTimestamp - _fromDateTimestamp) /
            1 days;
        // can't book less than 1 day
        if(bookingPeriod < 1) revert InvalidBookingPeriod();
        
        uint256 _amount = convertFromUSD(_rental.pricePerDay) * bookingPeriod;

        if(msg.value != _amount) revert InsufficientAmount();
        if(checkIfBooked(_rentalId, _fromDateTimestamp, _toDateTimestamp)) revert AlreadyBooked();

        uint256 _bookingId = _bookingIds;
        address _rentalOwner = _rental.owner;

        rentalBookings.push(
            Booking(_bookingId, _rentalId, _rentalOwner, msg.sender, _fromDateTimestamp, _toDateTimestamp, false, false, false)
        );
        _bookingIds++;
        (bool success,) = payable(_rental.owner).call{value: msg.value}("Booked");
        if (!success) revert TransferFailed();

        emit NewBookAdded(
            _bookingIds,
            _rentalId,
            _rentalOwner,
            msg.sender,
            _fromDateTimestamp,
            _toDateTimestamp,
            block.timestamp
        );
    }

    // Cancel Booking
    function cancelBooking(
        uint256 _bookingId
    ) public {
        if(_bookingId >= _bookingIds) return;
        rentalBookings[_bookingId].isWaitingForCancel = true;
    }

    function confirmCancelBooking(
        uint256 _bookingId
    ) external payable isBooking(_bookingId) {
        if(_bookingId >= _bookingIds 
            || rentalBookings[_bookingId].isWaitingForCancel == false) 
            return;
        Booking memory _bookingInfo = rentalBookings[_bookingId];
        uint256 rentalId = _bookingInfo.rentalId;   
        RentalInfo memory _rentalInfo = rentals[rentalId];

        uint256 bookingPeriod = (_bookingInfo.toTimestamp - _bookingInfo.fromTimestamp) /
            1 days;

        uint256 _amount = convertFromUSD(_rentalInfo.pricePerDay) * bookingPeriod;
        if(msg.value != _amount) revert InsufficientAmount();

        (bool success,) = payable(_bookingInfo.renter).call{value: msg.value}("Canceled");
        if (!success) revert TransferFailed();       
        if (!success) return;

        for (uint i = _bookingId; i < _bookingIds - 1; i++){
            rentalBookings[i] = rentalBookings[i+1];
        }
        delete rentalBookings[_bookingIds - 1];
        _bookingIds -= 1;
    }

    // function checkIn(){

    // }

    function checkIfBooked(
        uint256 _rentalId,
        uint256 _fromDateTimestamp,
        uint256 _toDateTimestamp
    ) internal view returns (bool) {

        // Make sure the rental is available for the booking dates
        for (uint256 i = 0; i < _bookingIds;) {
            if (
                ((_rentalId == rentalBookings[i].rentalId) &&
                    (_fromDateTimestamp >= rentalBookings[i].fromTimestamp) &&
                    (_fromDateTimestamp <= rentalBookings[i].toTimestamp)) ||
                ((_rentalId == rentalBookings[i].rentalId) &&
                    (_toDateTimestamp >= rentalBookings[i].fromTimestamp) &&
                    (_toDateTimestamp <= rentalBookings[i].toTimestamp))
            ) {
                return true;
            }
            unchecked {
                ++i;
            }
        }
        return false;
    }

    function getRentals() 
        external 
        view 
        returns (RentalInfo[] memory) {
        return rentals;
    }

    // Return the list of booking for a given rental
    function getRentalBookings()
        external
        view
        returns (Booking[] memory)
    {
        return rentalBookings;
    }

    function getRentalBooking(uint256 _id)
        external
        view
        returns (Booking memory){
            return rentalBookings[_id];
    }

    function getRentalInfo(uint256 _id)
        external
        view
        isRental(_id)
        returns (RentalInfo memory)
    {
        return rentals[_id];
    }

    // ADMIN FUNCTIONS

    function changeListingFee(uint256 _newFee) external onlyAdmin {
        listingFee = _newFee;
    }

    function withdrawBalance() external onlyAdmin {
        (bool success,) = payable(admin).call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }
}
