import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./Home.css";
import Account from "../components/Account";
import { Link } from "react-router-dom";
import bg from "../images/dimori-bg1.JPG";
import logo from "../images/dimori-logo.png";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import {
  TextField,
  Button,
  Input,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const Home = () => {
  const data = useSelector((state) => state.blockchain.value);

  var current = new Date();
  const [info, setInfo] = useState({
    destination: "",
    checkIn: new Date(current.getTime()),
    checkOut: new Date(current.getTime() + 86400000),
  });
  const getInitialState = () => {
    const value = "";
    return value;
  };

  const [value, setValue] = useState(getInitialState);

  return (
    <>
      <div className="topBanner">
        <div>
          <img
            className="logo"
            src={logo}
            alt="logo"
            style={{ height: "auto" }}
          ></img>
        </div>
        <div className="tabContent">
          <div className="searchFields">
            <div className="inputs">
              <Input
                required={true}
                placeholder="Location"
                type="text"
                onChange={(e) => {
                  setInfo({ ...info, destination: e.target.value });
                }}
              />
            </div>
            <hr className="line1"/>
            <div className="vl" />
            <div className="inputs">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                  inputFormat="dd/MM/yyyy"
                  value={info.checkIn}
                  onChange={(newValue) => {
                    setInfo({ ...info, checkIn: newValue });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>

            <div className="vl" />
            <div className="inputs">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                  inputFormat="dd/MM/yyyy"
                  value={info.checkOut}
                  onChange={(newValue) => {
                    setInfo({ ...info, checkOut: newValue });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>

            <div className="vl" />
            <div className="inputs">
              <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="theme-standard-label">Theme</InputLabel>
                <Select
                  labelId="theme-standard-label"
                  id="theme-standard"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Peace">Peace</MenuItem>
                  <MenuItem value="Village">Village</MenuItem>
                  <MenuItem value="Royal">Royal</MenuItem>
                  <MenuItem value="Nature">Nature</MenuItem>
                  <MenuItem value="Arts">Arts</MenuItem>
                  <MenuItem value="Green">Green</MenuItem>
                  <MenuItem value="History">History</MenuItem>
                </Select>
              </FormControl>
            </div>
            {data.network === networksMap[networkDeployedTo] ? (
              <Link
                to={"/rentals"}
                state={{
                  destination: info.destination,
                  checkIn: info.checkIn,
                  checkOut: info.checkOut,
                  theme: value,
                }}
              >
                <div className="searchButton">
                  <SearchIcon sx={{ color: "#2b2623" }} />
                </div>
              </Link>
            ) : (
              <div
                className="searchButton"
                onClick={() => {
                  window.alert(
                    `Please Switch to the ${networksMap[networkDeployedTo]} network`
                  );
                }}
              >
                <SearchIcon sx={{ color: "#2b2623" }} />
              </div>
            )}
          </div>
        </div>
        <div className="lrContainers">
          <Account />
        </div>
      </div>
      <div className="randomLocation">
        <div className="title">Dimori</div>
        <div className="text">Design your best local trip</div>
        <div className="text">
          A decentralized home-sharing platform using cryptocurrency for
          payment.
        </div>
        <Button
          text="Explore A Location"
          onClick={() => console.log(info.checkOut)}
        />
      </div>
    </>
  );
};

export default Home;
