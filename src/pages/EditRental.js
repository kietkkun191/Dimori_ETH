import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./style/EditRental.css";
import "bootstrap/dist/css/bootstrap.css";
import { Link } from "react-router-dom";
import { ethers, utils } from "ethers";
import { Buffer } from "buffer";
import { Form } from "react-bootstrap";
import styled from "styled-components";
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
import { margin } from "@mui/system";

const client = require("ipfs-http-client");

const projectId = "2HrcvAMNAkZmAGwQO6CfyZPWAw0"; // <---------- your Infura Project ID

const projectSecret = "924de794db26653232257f0e12208ecd"; // <---------- your Infura Secret
// (for security concerns, consider saving these values in .env files)

const CustomFormControl = styled(FormControl)`
  && {
    color: wheat;
  }
  .MuiInput-underline:before {
    border-bottom-color: wheat;
    color: wheat;
  }

  .MuiFormLabel-root.Mui-focused {
    color: wheat;
  }
`;

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfsClient = client.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const ipfsBaseUrl = "https://ipfs.io/ipfs/";

const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
const signer = provider.getSigner();
const DimoriContract = new ethers.Contract(
  contractAddress,
  DimoriSmartContract.abi,
  signer
);

const EditRental = ({ rental }) => {
  let navigate = useNavigate();

  const data = useSelector((state) => state.blockchain.value);
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formInput, setFormInput] = useState({
    name: rental.name,
    city: rental.city,
    theme: rental.theme,
    contactAddress: rental.address,
    latitude: rental.latitude,
    longitude: rental.longitude,
    description: rental.description,
    numberGuests: parseInt(rental.maxGuests),
    pricePerDay: parseInt(rental.price),
  });

  const getInitialState = () => {
    const value = formInput.theme;
    return value;
  };

  const [value, setValue] = useState(getInitialState);

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

  console.log(imagePreview);

  const edit = async () => {
    if (data.network === networksMap[networkDeployedTo]) {
      if (image !== undefined && window.ethereum !== undefined) {
        try {
          setLoading(true);
          const listingFee = DimoriContract.callStatic.listingFee();
          //handle images
          const addedFile = await ipfsClient.add(image);
          const imageURI = ipfsBaseUrl + addedFile.path;

          const add_tx = await DimoriContract.editRental(
            parseInt(rental.id),
            formInput.name,
            formInput.city,
            value,
            formInput.contactAddress,
            formInput.latitude,
            formInput.longitude,
            formInput.description,
            imageURI == null ? rental.imgUrl : imageURI,
            formInput.numberGuests,
            utils.parseEther(formInput.pricePerDay.toString(), "ether"),
            { value: listingFee }
          );
          await add_tx.wait();

          setImage(null);
          setLoading(false);

          navigate("/#/your-rentals");
        } catch (err) {
          window.alert("Couldn't edit this rental, please try again!");
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
      <div className="editRentalContent">
        <table className="pure-table pure-table-horizontal marginTable">
          <br />
          <tr>
            <td>
              <Form.Control
                type="text"
                className="formControlStyles"
                value={formInput.name}
                placeholder="Tên chi? (Name)"
                onChange={(e) => {
                  setFormInput({ ...formInput, name: e.target.value });
                }}
                required={true}
              />
            </td>
            <td>
              <Form.Control
                type="text"
                className="formControlStyles"
                value={formInput.city}
                maxLength={30}
                placeholder="Ở mô? (City)"
                onChange={(e) => {
                  setFormInput({ ...formInput, city: e.target.value });
                }}
                required
              />
            </td>
          </tr>
          <br />
          <tr>
            <td colSpan={2}>
              <CustomFormControl
                variant="standard"
                sx={{ m: 1, minWidth: 900 }}
              >
                <InputLabel id="theme-standard-label" style={{ width: 500 }}>
                  Tụi bây có chi vui (Theme)
                </InputLabel>
                <Select
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                  required
                >
                  <MenuItem value="Peace">Peace</MenuItem>
                  <MenuItem value="Village">Village</MenuItem>
                  <MenuItem value="Royal">Royal</MenuItem>
                  <MenuItem value="Nature">Nature</MenuItem>
                  <MenuItem value="Arts">Arts</MenuItem>
                  <MenuItem value="Green">Green</MenuItem>
                  <MenuItem value="History">History</MenuItem>
                </Select>
              </CustomFormControl>
            </td>
          </tr>
          <br />
          <tr>
            <td colSpan={2}>
              <Form.Control
                type="text"
                className="formControlStyles"
                value={formInput.contactAddress}
                maxLength={255}
                placeholder="Ở lộ mô? (Address)"
                onChange={(e) => {
                  setFormInput({
                    ...formInput,
                    contactAddress: e.target.value,
                  });
                }}
                required
              />
            </td>
            <td></td>
          </tr>
          <br />
          <tr>
            <td>
              <Form.Control
                type="text"
                className="formControlStyles"
                maxLength={30}
                value={formInput.latitude}
                placeholder="Kinh độ (Latitude)"
                onChange={(e) => {
                  setFormInput({ ...formInput, latitude: e.target.value });
                }}
              />
            </td>
            <td>
              <Form.Control
                type="text"
                className="formControlStyles"
                maxLength={30}
                value={formInput.longitude}
                placeholder="Vĩ độ (Longtitude)"
                onChange={(e) => {
                  setFormInput({ ...formInput, longitude: e.target.value });
                }}
              />
            </td>
          </tr>
          <br />
          <tr>
            <td colSpan={2}>
              <Form.Control
                as="textarea"
                className="formControlStyles"
                value={formInput.description}
                rows={5}
                maxLength={2000}
                placeholder="Kể coi tụi bây có chi? (Description)"
                onChange={(e) => {
                  setFormInput({ ...formInput, description: e.target.value });
                }}
              />
            </td>
          </tr>
          <br />
          <tr>
            <td>
              <Form.Control
                type="number"
                className="formControlStyles"
                value={formInput.numberGuests}
                min={1}
                placeholder="Chỗ tụi bây chứa được mấy người? (Max number)"
                onChange={(e) =>
                  setFormInput({
                    ...formInput,
                    numberGuests: Number(e.target.value),
                  })
                }
              />
            </td>
            <td>
              <Form.Control
                style={{ width: "100%" }}
                type="number"
                className="formControlStyles"
                min={0}
                value={formInput.pricePerDay}
                placeholder="Một ngày trả bây mấy $ (Price)"
                onChange={(e) =>
                  setFormInput({ ...formInput, pricePerDay: e.target.value })
                }
              />
            </td>
          </tr>
          <br />
          <tr>
            <td colSpan={2}>
              <Form.Control
                type="file"
                className="formControlStyles"
                name="file"
                onChange={(e) => {
                  getImage(e);
                }}
              />
            </td>
          </tr>
          <br />
          <tr>
            <td colSpan={2}>
              {imagePreview == null ? (
                <div style={{ display:"flex", justifyContent:"center" }}>
                  <img
                    className="rounded mt-4"
                    width="350"
                    src={rental.imgUrl}
                    style={{ margin: "0 15% 0 15%", display: "block" }}
                  />
                </div>
              ) : (
                <div style={{ display:"flex", justifyContent:"center" }}>
                  <img
                    className="rounded mt-4"
                    width="350"
                    src={URL.createObjectURL(imagePreview)}
                    style={{ margin: "0 15% 0 15%", display: "block" }}
                  />
                </div>
              )}
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <div style={{ textAlign: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  style={{ backgroundColor: "#00afd1" }}
                  onClick={edit}
                >
                  {loading ? <CircularProgress color="inherit" /> : "Edit"}
                </Button>
              </div>
            </td>
          </tr>
        </table>
        <br />
      </div>
    </>
  );
};

export default EditRental;
