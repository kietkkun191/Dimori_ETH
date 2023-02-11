import React, { useState, useEffect } from "react";
import "./Rentals.css";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ethers, utils } from "ethers";
import { useLocation } from "react-router";
import logo from "../images/dimori-logo.png";
import bg from "../images/dimori-bg1.JPG";
import SearchIcon from "@mui/icons-material/Search";
import { Button, CircularProgress } from "@mui/material";
import Account from "../components/Account";

import DimoriSmartContract from "../artifacts/contracts/DimoriMain.sol/DimoriMain.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const Rentals = () => {
  let navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const data = useSelector((state) => state.blockchain.value);

  const { state: searchFilters } = useLocation();
  const [rentalsList, setRentalsList] = useState([]);

  const getRentalsList = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const DimoriContract = new ethers.Contract(
      contractAddress,
      DimoriSmartContract.abi,
      signer
    );

    const rentals = await DimoriContract.getRentals();

    const items = rentals.map((r) => {
      return {
        id: Number(r[0]),
        name: r[2],
        city: r[3],
        theme: r[4],
        description: r[8],
        imgUrl: r[9],
        price: utils.formatUnits(r[11], "ether"),
      };
    });

    const matchedItems = items.filter(
      (p) =>
        p.city
          .toLowerCase()
          .includes(searchFilters.destination.toLowerCase()) &&
        p.theme.toLowerCase().includes(searchFilters.theme.toLowerCase())
    );

    setRentalsList(matchedItems);
  };

  const bookProperty = async (_id, _price) => {
    if (data.network == networksMap[networkDeployedTo]) {
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

        const _datefrom = Math.floor(searchFilters.checkIn.getTime() / 1000);
        const _dateto = Math.floor(searchFilters.checkOut.getTime() / 1000);

        const dayToSeconds = 86400;
        const stayDays =
          _dateto - _datefrom == 0 ? dayToSeconds : _dateto - _datefrom;
        const bookPeriod = stayDays / dayToSeconds;
        const totalBookingPriceUSD = Number(_price) * bookPeriod;
        const totalBookingPriceETH = await DimoriContract.convertFromUSD(
          utils.parseEther(totalBookingPriceUSD.toString(), "ether")
        );

        const book_tx = await DimoriContract.bookDates(
          _id,
          _datefrom,
          _dateto,
          { value: totalBookingPriceETH }
        );
        await book_tx.wait();

        setLoading(false);
        navigate("/#/booked-schedules");
      } catch (err) {
        setLoading(false);
        var x = err.message;
        window.alert("An error has occured, please try again");
      }
    } else {
      setLoading(false);
      window.alert(
        `Please Switch to the ${networksMap[networkDeployedTo]} network`
      );
    }
  };

  useEffect(() => {
    getRentalsList();
  }, []);

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
        <div className="searchReminder">
          <div className="filter">{searchFilters.destination}</div>
          <div className="vl" />
          <div className="filter">
            {`${searchFilters.checkIn.toLocaleString("default", {
              month: "short",
            })} ${searchFilters.checkIn.toLocaleString("default", {
              day: "2-digit",
            })}  -  ${searchFilters.checkOut.toLocaleString("default", {
              month: "short",
            })}  ${searchFilters.checkOut.toLocaleString("default", {
              day: "2-digit",
            })} `}
          </div>
          <div className="vl" />
          <div className="filter">{searchFilters.theme} Theme</div>
          <div className="searchFiltersIcon">
            <SearchIcon sx={{ color: "#2b2623" }} />
          </div>
        </div>
        <div className="lrContainers">
          <Account />
        </div>
      </div>
      <hr className="line" />
      <div className="rentalsContent" class="newContainer">
        {rentalsList.length !== 0 ? (
          rentalsList.map((e, i) => {
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
                      <div className="price">Price : {e.price}$ per day</div>
                      <div className="bottomButton">
                        <Button
                          variant="contained"
                          style={{ backgroundColor: "#00afd1" }}
                          onClick={() => {
                            bookProperty(e.id, e.price);
                          }}
                        >
                          {loading ? (
                            <CircularProgress color="inherit" />
                          ) : (
                            "Stay Here"
                          )}
                        </Button>
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
            <p style={{ color: "whitesmoke" }}>
              No rentals found for your search
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Rentals;
