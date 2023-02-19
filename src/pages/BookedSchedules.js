import React, { useState, useEffect } from "react";
import "./style/BookedSchedules.css";
import { Link } from "react-router-dom";
import { ethers, utils } from "ethers";
import logo from "../images/dimori-logo.png";
import bg from "../images/dimori-bg2.JPG";
import { useSelector } from "react-redux";
import Account from "../components/Account";
import RentalsMap from "../components/RentalsMap";

import DimoriSmartContract from "../artifacts/contracts/DimoriMain.sol/DimoriMain.json";
import { contractAddress } from "../utils/contracts-config";

const BookedSchedules = () => {
  const data = useSelector((state) => state.blockchain.value);

  const [rentalsList, setRentalsList] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [highLight, setHighLight] = useState();

  const getRentalsList = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const DimoriContract = new ethers.Contract(
      contractAddress,
      DimoriSmartContract.abi,
      signer
    );
    const _bookedSchedules = await DimoriContract
                              .getRentalBookings();
    const _bookedSchedulesFiltered = _bookedSchedules.filter((b) => b[3] == data.account
                                                                && b[6] == false
                                                                && b[7] == false
                                                                && b[8] == false);
    const _bookedList = [];
    await Promise.all(
      _bookedSchedulesFiltered.map(async (r) => {
        let rental = await DimoriContract.getRentalInfo(parseInt(r[1]));
        // console.log(rental);
        if(rental.length !== 0){
          const item = {
            id: Number(r[0]),
            name: rental[2],
            city: rental[3],
            theme: rental[4],
            address: rental[5],
            imgUrl: rental[9],
            startDate: new Date(Number(r[4]) * 1000),
            endDate: new Date(Number(r[5]) * 1000),
            price: utils.formatUnits(rental[11], "ether"),
          };
          _bookedList.push(item);
        }
      })
    )
    setRentalsList(_bookedList);
    // let cords = _bookedSchedulesFiltered.map((r) => {
    //   let rental = DimoriContract.getRentalInfo(parseInt(r[1]));
    //   return {
    //     lat: Number(rental[6]),
    //     lng: Number(rental[7]),
    //   };
    // });
    // setCoordinates(cords);
  };

  useEffect(() => {
    getRentalsList();
  }, [data.account]);

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
            <p className="headerText">Rentals on maps</p>
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
                  <hr className="line2" />
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
                        <div className="rentalDesc">ở (city) {e.city} á nè</div>
                        <div className="rentalDesc">
                          màu (theme) {e.theme} thấy được không
                        </div>
                        <div className="rentalDesc">
                          tau để địa chỉ ở đây (address) {e.address}
                        </div>
                        <div className="rentalDesc">
                          Booked dates:
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
                      <div className="bottomButton">
                        <a
                          className="btn btn-primary"
                          href={"/#/cancel-booking?id=" + e.id}
                          role="button"
                        >
                          Cancel Booking
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
                color: "InactiveCaptionText",
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

export default BookedSchedules;
