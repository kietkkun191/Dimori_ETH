import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateAccountData, disconnect } from "../features/blockchain";
import { ethers, utils } from "ethers";
import { Modal, Dropdown } from "react-bootstrap";
import { Button, Box } from "@mui/material";
import Web3Modal from "web3modal";
import "./Account.css";

import networks from "../utils/networksMap.json";
import Identicon from "./Identicon";

const eth = window.ethereum;
let web3Modal = new Web3Modal();

function Account() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.blockchain.value);

  const [injectedProvider, setInjectedProvider] = useState();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  async function fetchAccountData() {
    if (typeof window.ethereum !== "undefined") {
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);

      setInjectedProvider(provider);

      const signer = provider.getSigner();
      const chainId = await provider.getNetwork();
      const account = await signer.getAddress();
      const balance = await signer.getBalance();

      dispatch(
        updateAccountData({
          account: account,
          balance: utils.formatUnits(balance),
          network: networks[String(chainId.chainId)],
        })
      );
    } else {
      console.log("Please install metamask");
      window.alert("Please Install Metamask");
    }
  }

  async function Disconnect() {
    web3Modal.clearCachedProvider();
    if (
      injectedProvider &&
      injectedProvider.provider &&
      typeof injectedProvider.provider.disconnect == "function"
    ) {
      await injectedProvider.provider.disconnect();
      setInjectedProvider(null);
    }
    dispatch(disconnect());
    setShow(false);
    navigate("/");
  }

  useEffect(() => {
    if (eth) {
      eth.on("chainChanged", (chainId) => {
        fetchAccountData();
      });
      eth.on("accountsChanged", (accounts) => {
        fetchAccountData();
      });
    }
  }, []);

  const isConnected = data.account !== "";

  return (
    <div>
      {isConnected ? (
        <>
          <Button variant="contained" color="primary" onClick={handleShow}>
            {data.account &&
              `${data.account.slice(0, 6)}...${data.account.slice(
                data.account.length - 4,
                data.account.length
              )}`}
            <Identicon account={data.account} />
          </Button>
          <Modal show={show} onHide={handleClose}
              style={{
                opacity: "1",
                backgroundColor: "rgba(0, 0, 0, 0.7)"
              }}>
                <div style={{
                    backgroundColor:"rgba(0, 0, 0, 0.4)",
                    boxShadow: "rgba(0, 0, 0, 1) 5px 15px 15px"}}>
                <Modal.Header closeButton 
            style={{ 
              backgroundColor: "rgba(1, 1, 1)"
              }}>
              <Modal.Title>Account information</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ 
              backgroundColor: "rgba(1, 1, 1)"
              }}>
              <p>Wallet address : {data.account}</p>
              <p>
                Your account balance :{" "}
                {data.balance && parseFloat(data.balance).toFixed(4)}{" "}
              </p>
              <p>Your're connect to : {data.network} </p>
            {/* </Modal.Body> */}
            <div class="footer">
            <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  Rentals
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#/your-rentals">
                    Your Rentals
                  </Dropdown.Item>
                  <Dropdown.Item href="#/add-rental">
                    Add new rental
                  </Dropdown.Item>
                  <Dropdown.Item href="#/renter-cancelled-booking">
                    List cancelled bookings
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              &nbsp;
              <Dropdown>
                <Dropdown.Toggle variant="outline-success" id="dropdown-basic">
                  Bookings
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item href="#/booked-schedules">
                    Your booking schedules
                    </Dropdown.Item>
                  <Dropdown.Item href="#/user-cancelled-booking">
                    Your cancelled bookings
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              &nbsp;
              <a className="btn btn-outline-danger" onClick={Disconnect} role="button">
                Disconnect
              </a>
            </div>
              
            </Modal.Body>
                </div>
            
          </Modal>
        </>
      ) : (
        <Button variant="contained" color="primary" onClick={fetchAccountData}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
}

export default Account;
