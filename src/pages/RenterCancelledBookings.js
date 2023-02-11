import React, { useState, useEffect } from "react";
import "./RenterCancelledBookings.css";
import { Link, useNavigate } from "react-router-dom";
import { ethers, utils } from "ethers";
import logo from "../images/dimori-logo.png";
import bg from "../images/dimori-bg2.JPG";
import { useSelector } from "react-redux";
import Account from "../components/Account";
import RentalsMap from "../components/RentalsMap";
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import DimoriSmartContract from "../artifacts/contracts/DimoriMain.sol/DimoriMain.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const RenterCancelledBookings = () => {
  const data = useSelector((state) => state.blockchain.value);

  const [rentalsList, setRentalsList] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [highLight, setHighLight] = useState();

  const getCancelledBookingsList = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const DimoriContract = new ethers.Contract(
      contractAddress,
      DimoriSmartContract.abi,
      signer
    );

    const myRentals = [];
    let bookings = await DimoriContract.getRentalBookings();
    let _mybookings = bookings.filter(
      (b) =>
        b[2] == data.account && b[6] == true && b[7] == false && b[8] == false
    );
    await Promise.all(
      _mybookings.map(async (r) => {
        let _rentals = await DimoriContract.getRentalInfo(r[1]);

        if (_rentals.length !== 0) {
          const item = {
            id: Number(r[0]),
            name: _rentals[2],
            city: _rentals[3],
            theme: _rentals[4],
            address: _rentals[5],
            imgUrl: _rentals[9],
            startDate: new Date(Number(r[4]) * 1000),
            endDate: new Date(Number(r[5]) * 1000),
            price: utils.formatUnits(_rentals[11], "ether"),
          };
          myRentals.push(item);
        }
      })
    );

    setRentalsList(myRentals);
    let rentals = await DimoriContract.getRentalInfo(_mybookings[0][1]);
    let cords = rentals.map((r) => {
      return {
        lat: Number(r[6]),
        lng: Number(r[7]),
      };
    });
    setCoordinates(cords);
  };

  useEffect(() => {
    getCancelledBookingsList();
  }, [data.account]);

  let navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState(null);
  let id = 0;
  const confirmCancelBooking = async () => {
    if (data.network === networksMap[networkDeployedTo]) {
      if (image !== undefined && window.ethereum !== undefined) {
        try {
          setLoading(true);
          const provider = new ethers.providers.Web3Provider(
            window.ethereum,
            "any"
          );
          const signer = provider.getSigner();

          const DimoriContract = new ethers.Contract(
            contractAddress,
            DimoriSmartContract.abi,
            signer
          );
          const listingFee = DimoriContract.callStatic.listingFee();

          const add_tx = await DimoriContract.confirmCancelBooking(
            parseInt(id)
          );
          await add_tx.wait();

          setImage(null);
          setLoading(false);

          navigate("/#/renter-cancelled-bookings");
        } catch (err) {
          window.alert("An error has occured");
          setLoading(false);
          console.log(err);
        }
      } else {
        window.alert("Please Install Metamask");
      }
    } else {
      window.alert(
        `Please Switch to the ${networksMap[networkDeployedTo]} network`
      );
    }
  };

  return (
    <>
      <div className="topBanner">
        <div>
          <Link to="/">
            <img
              className="logo"
              src={logo}
              alt="logo"
              style={{ height: "auto" }}
            ></img>
          </Link>
        </div>
        <div className="lrContainers">
          <Account />
        </div>
      </div>
      <div className="rentalsContent">
        <div className="rentalsContentL">
          <div style={{ textAlign: "center" }}>
            <p className="rentalTitle">Rentals on maps</p>
          </div>
          <RentalsMap
            locations={coordinates}
            setHighLight={setHighLight}
            style={{ border: "2px dotted azure" }}
          />
        </div>
        <div className="rentalsContentR">
          {rentalsList.length !== 0 ? (
            rentalsList.map((e, i) => {
              return (
                <>
                  <br />
                  <div
                    className={highLight == i ? "rentalDivH " : "rentalDiv"}
                    key={i}
                  >
                    <div className="divScheduleImg">
                      <img className="scheduleImg" src={e.imgUrl}></img>
                    </div>
                    <div className="rentalInfo">
                      <div className="rentalTitle">{e.name.toUpperCase()}</div>
                      <div className="rentalInformation">
                        <div className="rentalDesc">ở in {e.city} á nè</div>
                        <div className="rentalDesc">
                          màu (theme) {e.theme} thấy được không
                        </div>
                        <div className="rentalDesc">
                          tau để địa chỉ ở đây (at) {e.address}
                        </div>
                        <div className="rentalDesc">
                          Mi đã đặt chỗ ở tụi tau ngày ni nì (Booked dates):
                          {` ${e.startDate.toLocaleString("default", {
                            month: "short",
                          })} ${e.startDate.toLocaleString("default", {
                            day: "2-digit",
                          })}  -  ${e.endDate.toLocaleString("default", {
                            month: "short",
                          })}  ${e.endDate.toLocaleString("default", {
                            day: "2-digit",
                          })} `}
                        </div>
                      </div>

                      <br />
                      <div className="price">{e.price}$</div>
                      <div style={{ textAlign: "center", paddingTop: "15px" }}>
                        <a
                          className="btn btn-outline-danger"
                          href={"/#/confirm-cancel-booking?id=" + e.id}
                          role="button"
                          // onClick={alert("Comming Soon!")}
                        >
                          Confirm Cancel Booking
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              );
            })
          ) : (
            <div
              style={{
                textAlign: "center",
                paddingTop: "30%",
                color: "burlywood",
              }}
            >
              <p style={{ color: "whitesmoke" }}>You have no reservation yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RenterCancelledBookings;
