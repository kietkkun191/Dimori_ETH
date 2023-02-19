import React, { useState, useEffect } from "react";
import "./style/YourRentals.css";
import { Link } from "react-router-dom";
import { ethers, utils } from "ethers";
import logo from "../images/dimori-logo.png";
import { useSelector } from "react-redux";
import Account from "../components/Account";

import DimoriSmartContract from "../artifacts/contracts/DimoriMain.sol/DimoriMain.json";
import { contractAddress } from "../utils/contracts-config";
import { Modal, Button } from "react-bootstrap";
import RentalDetail from "./RentalDetail";
import AddRental from "./AddRental";
import EditRental from "./EditRental";
import RemoveRental from "./RemoveRental";

const YourRentals = () => {
  const data = useSelector((state) => state.blockchain.value);
  const [showDetail, setShowDetail] = useState(false);

  const handleCloseDetial = () => setShowDetail(false);
  const handleShowDetial = () => setShowDetail(true);

  const [showRemove, setShowRemove] = useState(false);

  const handleCloseRemove = () => setShowRemove(false);
  const handleShowRemove = () => setShowRemove(true);

  const [showEdit, setShowEdit] = useState(false);

  const handleCloseEdit = () => setShowEdit(false);
  const handleShowEdit = () => setShowEdit(true);

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
        latitude: r[6],
        longitude: r[7],
        description: r[8],
        imgUrl: r[9],
        maxGuests: r[10],
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
      <hr className="line1" />
      <div className="rentalsContent" class="newContainer">
        {propertiesList.length !== 0 ? (
          propertiesList.map((e, i) => (
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
                            {/* <a href={"/#/rental-detail?id=" + e.id}>view more</a> */}
                          </td>
                        </tr>
                      </table>
                    </div>
                    <br></br>
                    <div className="price">price per day : {e.price}$</div>
                    <div class="button-area">
                      <a
                        className="btn btn-secondary"
                        onClick={handleShowDetial}
                      >
                        Details
                      </a>
                      &nbsp;
                      <a
                        className="btn btn-secondary"
                        onClick={handleShowEdit}
                        role="button"
                      >
                        Edit rental
                      </a>
                      &nbsp;
                      <a
                        className="btn btn-danger"
                        onClick={handleShowRemove}
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
              {/* Rental Modal */}
              <Modal
                show={showDetail}
                onHide={handleCloseDetial}
                size="lg"
                centered
                scrollable
                animation
              >
                <Modal.Header closeButton>
                  <Modal.Title>View Rental</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <RentalDetail rental={e} />
                </Modal.Body>
              </Modal>
              <Modal
                show={showEdit}
                onHide={handleCloseEdit}
                size="xl"
                centered
                scrollable
                animation
              >
                <Modal.Header closeButton>
                  <Modal.Title>Edit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <EditRental rental={e} />
                </Modal.Body>
              </Modal>
              <Modal
                show={showRemove}
                onHide={handleCloseRemove}
                size="lg"
                centered
                scrollable
                animation
              >
                <Modal.Header closeButton>
                  <Modal.Title>Remove</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <RemoveRental rental={e} />
                </Modal.Body>
              </Modal>
            </>
          ))
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
