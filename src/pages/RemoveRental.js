import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./RemoveRental.css";
import "bootstrap/dist/css/bootstrap.css";
import { Link } from "react-router-dom";
import { ethers, utils } from "ethers";
import { Buffer } from "buffer";
import { Form } from "react-bootstrap";
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Account from "../components/Account";

import logo from "../images/dimori-logo.png";
import bg from "../images/add-bg.png";

import DimoriSmartContract from "../artifacts/contracts/DimoriMain.sol/DimoriMain.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";
// import { url } from "inspector";

const RemoveRental = () => {
  let navigate = useNavigate();
  const [property, setProperty] = useState({
    name: "",
    city: "",
    theme: "",
    contactAddress: "",
    latitude: "",
    longitude: "",
    description: "",
    imgUrl: "",
    numberGuests: 0,
    pricePerDay: 0,
  });
  var url = new URL(document.URL);
  let hash = url.hash;
  let id = hash.substring(hash.lastIndexOf("?") + 4, hash.length);

  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signer = provider.getSigner();
  const DimoriContract = new ethers.Contract(
    contractAddress,
    DimoriSmartContract.abi,
    signer
  );

  const getRental = async () => {
    const user_properties = await DimoriContract.getRentalInfo(id);

    setProperty({
      name: user_properties[2],
      city: user_properties[3],
      theme: user_properties[4],
      contactAddress: user_properties[5],
      latitude: user_properties[6],
      longitude: user_properties[7],
      description: user_properties[8],
      numberGuests: user_properties[10],
      pricePerDay: user_properties[11],
    });
  };

  const data = useSelector((state) => state.blockchain.value);
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  getRental();

  const getInitialState = () => {
    const value = "";
    return value;
  };

  const getImage = async (e) => {
    e.preventDefault();
    const reader = new window.FileReader();
    const file = e.target.files[0];

    if (file !== undefined) {
      reader.readAsArrayBuffer(file);

      reader.onloadend = () => {
        const buf = Buffer(reader.result, "base64");
        setImage(buf);
        setImagePreview(file);
      };
    }
  };

  const removeRental = async () => {
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
          const add_tx = await DimoriContract.removeHome(parseInt(id));
          await add_tx.wait();

          setImage(null);
          setLoading(false);

          navigate("/#/your-rentals");
        } catch (err) {
          window.alert("Couldn't remove this rental. Please try again!");
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
      <header className="topBanner">
        <div className="logoContainer">
          <Link to="/">
            <img className="logo" src={logo} alt="logo" />
          </Link>
        </div>
        <h2 className="headerText">Remove your Rental</h2>
        <div className="lrContainers">
          <Account />
        </div>
      </header>
      <main className="removeRentalContent">
        <div className="removeContent">
          <table
            className="pure-table pure-table-horizontal"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <tbody>
              {["name", "city", "theme", "contactAddress", "description"].map(
                (key) => {
                  const label = key[0].toUpperCase() + key.slice(1);
                  return (
                    <tr key={key}>
                      <td className="label">{`${label}:`}</td>
                      <td className="labelDetail">{property[key]}</td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
        <div className="buttonContainer">
          <p className="label">Are you sure to remove this Rental?</p>
        </div>

        <div className="buttonContainer">
          <Button
            type="submit"
            variant="contained"
            className="removeButton"
            onClick={removeRental}
          >
            {loading ? <CircularProgress color="inherit" /> : "Remove"}
          </Button>
        </div>
      </main>
  </>
  );
};

export default RemoveRental;
