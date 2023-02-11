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
import { Form } from "react-bootstrap";

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
      <div className="rentalsContent" class="newContainer">
        {propertiesList.length !== 0 ? (
          propertiesList.map((e, i) => {
            return (
              <>
                <br />
                <div class="itemDiv" key={i}>
                  <div className="rentalDiv">
                    <div className="imgDiv">
                      <img className="rentalImg" src={e.imgUrl}></img>
                    </div>

                    <div className="rentalInfo">
                      <div className="rentalTitle">{e.name.toUpperCase()}</div>
                      <div className="rentalInformation">
                      <table>
                        <tr>
                          <td>{e.city}</td>
                          <td>{e.theme} </td>
                          <td>{e.address}</td>
                        </tr>
                        <tr>
                          <td colSpan={3}>
                            {e.description.length > 255
                              ? e.description.substring(0, 255) + " ..."
                              : e.description}
                          </td>
                        </tr>
                      </table>
                      </div>
                      <br></br>
                      <div className="price">price per day : {e.price}$</div>
                      <div class="button-area">
                        <a
                          className="btn btn-secondary"
                          href={"/#/edit-rental?id=" + e.id}
                          role="button"
                        >
                          Edit rental
                        </a>
                        &nbsp;
                        <a
                          className="btn btn-danger"
                          href={"/#/remove-rental?id=" + e.id}
                          role="button"
                        >
                          Remove rental
                        </a>
                        &nbsp;
                        <a
                          className="btn btn-dark"
                          href={"/#/renter-booking-schedules?id=" + e.id}
                          role="button"
                        >
                          Booking Schedules
                        </a>
                      </div>
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
              paddingTop: "10%",
              paddingBottom: "10%",
            }}
          >
            <p style={{ color: "whitesmoke" }}>You have no rentals listed</p>
          </div>
        )}
      </div>
    </>
  );
};
export default YourRentals;
