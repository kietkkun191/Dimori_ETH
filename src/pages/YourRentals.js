import React, { useState, useEffect } from "react";
import "./YourRentals.css";
import { Link } from "react-router-dom";
import { ethers, utils } from "ethers";
import logo from "../images/dimori-logo.png";
import { useSelector } from "react-redux";
import Account from "../components/Account";
import bg from "../images/dimori-bg1.JPG";

import DimoriSmartContract from "../artifacts/contracts/DimoriMain.sol/DimoriMain.json";
import { contractAddress } from "../utils/contracts-config";

const YourRentals = () => {
  const data = useSelector((state) => state.blockchain.value);

  const [propertiesList, setPropertiesList] = useState([]);

  const getRentalsList = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const DimoriContract = new ethers.Contract(
      contractAddress,
      DimoriSmartContract.abi,
      signer
    );

    const rentals = await DimoriContract.getRentals();
    const user_properties = rentals.filter((r) => r[1] == data.account);
    const items = user_properties.map((r) => {
      return {
        id: r[0],
        name: r[2],
        city: r[3],
        theme: r[4],
        address: r[5],
        description: r[8],
        imgUrl: r[9],
        price: utils.formatUnits(r[11], "ether"),
      };
    });
    setPropertiesList(items);
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
          <div>
            <h2 class="headerText">Your Rentals</h2>
          </div>
          <div className="lrContainers">
            <Account />
          </div>
        </div>
        <hr className="line" />
        <div className="rentalsContent" class="newContainer">
          <br/>
        <div>
          <a className="btn btn-outline-primary" href={"/#/add-rental"} role="button">
              Add rental
            </a>
            &nbsp; &nbsp; 
            <a className="btn btn-outline-success" href={"/#/renter-cancelled-booking"} role="button">
              Cancelled Bookings List
            </a>
        </div>
          {propertiesList.length !== 0 ? (
            propertiesList.map((e, i) => {
              return (
                <>
                  <hr className="line2" />
                  <br/>
                  <div className="rentalDiv" key={i}>
                    <img className="rentalImg" src={e.imgUrl}></img>
                    <div className="rentalInfo">
                      <div className="rentalTitle">{e.name}</div>
                      <table>
                        <tr>
                          <td>City : </td>
                          &nbsp; &nbsp;
                          <td>{e.city}</td>
                        </tr>
                        <tr>
                          <td>Theme : </td>
                          &nbsp; &nbsp;
                          <td>{e.theme} </td>
                        </tr>
                        <tr>
                          <td>Address : </td>
                          &nbsp; &nbsp;
                          <td>{e.address}</td>
                        </tr>
                        <tr>
                          <td>Description : </td>
                          &nbsp; &nbsp;
                          <td>{e.description}</td>
                        </tr>
                      </table>
                      <div className="rentalDesc"></div>
                      <div className="price">price per day : {e.price}$</div>
                      <br></br>
                      <div>
                        <a className="btn btn-outline-secondary" href={"/#/edit-rental?id=" + e.id} role="button">
                          Edit rental
                        </a>
                        &nbsp; &nbsp; 
                        <a className="btn btn-outline-danger" href={"/#/remove-rental?id=" + e.id} role="button">
                          Remove rental
                        </a>
                        &nbsp; &nbsp; 
                        <a className="btn btn-outline-dark" href={"/#/renter-booking-schedules?id=" + e.id} role="button">
                          Booking Schedules
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              );
            })
          ) : (
            <div style={{ textAlign: "center", paddingTop: "30%" }}>
              <p>You have no rentals listed</p>
            </div>
          )}
        </div>
    </>
  );
};
export default YourRentals;
