import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import img_bnb from "../assets/bnb.png";
import img_bottom1 from "../assets/48711064.png";
import img_bottom2 from "../assets/image.png";
import { ethers } from "ethers";
import { bnbStakingContract } from "../contracts";
import axios from "axios";
import { fromBigNum } from "../utils/";
import { NotificationManager } from "react-notifications";
import { useWallet } from "../hooks/useWallet";
import { useWalletModal } from "../hooks/useWalletModal";
import WalletModal from "./WalletModal/WalletModal";
import { walletconnect } from '../utils/connector';
import { useWeb3React } from "@web3-react/core";
export default function MainFlex() {
  const { toggleOpen } = useWalletModal();
  const { deactivate } = useWeb3React();
  const { active, account, library } = useWallet();
  const [headerClass, setHeaderClass] = useState("");
  const [headerClass1, setHeaderClass1] = useState("");
  const [bnbPrice, setBNBPrice] = useState();
  const [referalAddress, setReferalAddress] = useState("");
  const [totalStaked, setTotalStaked] = useState("0.0000");
  const [availableWithdraw, setAvailableWithdraw] = useState("0.0000");
  const [totalBonus, setTotalBonous] = useState("0.0000");
  const [userCountInvited, setInviteUserCount] = useState("0");
  const [totalBonousWhtidrawn, settotalBonousWhtidrawn] = useState("0");
  const [firstPlanInvestAmount, setFirstPlanInvestAmount] = useState("0");
  const [secondPlanInvestAmount, setSecondPlanInvestAmount] = useState("0");
  const [thirdPlanInvestAmount, setThirdPlanInvestAmount] = useState("0");

  const viewMenu = () => {
    setHeaderClass("header_responsive");
    setHeaderClass1("");
  };
  const hideMenu = () => {
    setHeaderClass1("header_responsive_hide");
    setHeaderClass("");
  };

  useEffect(() => {
    axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BNBBUSD')
      .then(response => {
        console.log("response ===>", response);
        setBNBPrice(Number(response.data['price']).toFixed(1))
      });
  }, []);
  /* ------------ connect wallet --------------*/
  useEffect(() => {
    const address = `https://bnbextra.xyz?ref=${account}`;
    setReferalAddress(address);
    console.log("account changed", address);
  }, [account]);

  useEffect(() => {
    const getAccountDetail = async () => {
      try {
        if (account) {
          let provider = library.provider;
          const prov = new ethers.providers.Web3Provider(provider)
          let signer = await prov.getSigner();
          let signedTokenContract = bnbStakingContract.connect(signer);
          let bigTotalStaked = await signedTokenContract.totalStaked();
          var tokenBalance = fromBigNum(bigTotalStaked, 18);
          console.log("total staked", tokenBalance)
          setTotalStaked(tokenBalance);
          setAvailableWithdraw(fromBigNum(await signedTokenContract.getUserAvailable(account), 18));
          setTotalBonous(fromBigNum(await signedTokenContract.getUserReferralBonus(account), 18));
          settotalBonousWhtidrawn(fromBigNum(await signedTokenContract.getUserReferralWithdrawn(account), 18)); 
        }
      } catch (error) {
        console.log(error);
      }
    }
    getAccountDetail();
  }, [account]);

  //check connection
  const disconnect = () => {
    if (window.localStorage.getItem('walletconnect')) {
      walletconnect.close();
      walletconnect.walletConnectProvider = null;
    }
    try {
      deactivate()
      localStorage.removeItem("walletconnect");
    } catch (ex) {
      console.log(ex)
    }

  }

  const deposit = async (plan) => {
    if (!account)
      return;
    let investValue = 0;
    switch (plan) {
      case 1:
        investValue = firstPlanInvestAmount;
        break;
      case 2:
        investValue = secondPlanInvestAmount;
        break;
      case 3:
        investValue = thirdPlanInvestAmount;
        break;
    }
    try {
      let provider = library.provider;
      const prov = new ethers.providers.Web3Provider(provider);
      let signer = await prov.getSigner();
      let signedTokenContract = bnbStakingContract.connect(signer);
      // await signedTokenContract.invest(account, toBigNum(Number(investValue), 18));
      await signedTokenContract.invest(account, plan, { value: ethers.utils.parseEther(investValue) });
    } catch (error) {
      NotificationManager.error("Insufficient funds error");
    }

  }

  const withdraw = async () => {
    let provider = library.provider;
    const prov = new ethers.providers.Web3Provider(provider);
    let signer = await prov.getSigner();
    let signedTokenContract = bnbStakingContract.connect(signer);
    await signedTokenContract.withdraw();
  }

  const onChangeDeposit = (plan, value) => {
    switch (plan) {
      case 1:
        setFirstPlanInvestAmount(value)
        break;
      case 2:
        setSecondPlanInvestAmount(value);
        break;
      case 3:
        setThirdPlanInvestAmount(value);
        break;
    }
  }
  return (
    <>
      <WalletModal />
      <div className="box-container">
        <div className="header" style={{}}>
          <div className="header_logo">
            <img src={img_bnb} className="header_logo_img" alt="logo" />
            <div className="header_logo_text">
              <h3>BNBStaker</h3>
            </div>
          </div>

          <div className={"header_middle " + headerClass + headerClass1}>
            <button onClick={hideMenu} className="close_btn">
              X
            </button>
            <a className="header_audit_btn" href="https://bscscan.com/address/0x1f84422c2aaddebe146030fd807ae465a7565c37" target="new">
              <h3>Contract</h3>
            </a>
            <a href="https://t.me/bnbextrachat" target="new">
              <h3>Telegram</h3>
            </a>
            <a href="https://discord.gg/v6bQP4aqPP" target="new">
              <h3>Discord</h3>
            </a>
            <a
              href="https://medium.com/@bnbextra"
              target="new"
            >
              <h3>Documentation</h3>
            </a>
            <a
              href="https://medium.com/@BNBStakerClub/bnbstaker-club-faq-6d6e2820d392"
              target="new"
            >
              <h3>FAQ</h3>
            </a>
            <div className="header_audit_btn1">
              {!active ? (
                <button className="top_connect_btn" onClick={toggleOpen}>
                  Connect{" "}
                </button>
              ) : (
                <button className="top_connect_btn" onClick={disconnect}>Disconnect</button>
              )}
            </div>
          </div>

          <div className="header_right">
            {!active ? (
              <button className="header_connect_btn" onClick={toggleOpen}>
                <h3 id="connect-label">Connect</h3>
              </button>
            ) : (
              <button className="header_connect_btn" onClick={disconnect}>
                <h3 id="connect-label">Disconnect</h3>
              </button>
            )}
          </div>
          <button onClick={viewMenu} className="header_menu_btn">
            <div></div>
            <div></div>
            <div></div>
          </button>
        </div>
        <Grid container style={{ marginTop: "100px" }} justifyContent="center">
          <Grid item xs={12} md={6}>
            <div className="home_f_money">
              <a
                href="https://medium.com/@BNBStakerClub/10-000-giveaway-2e551c054bcb"
                target="new"
                className="home_f_money_btn"
              >
                10000$ GIVEAWAY 🎉
              </a>
              <h1>
                Stake{" "}
                <span style={{ color: "#FFFF00" }} className="cashtag">
                  $BNB
                </span>
              </h1>
              <h1>Earn up to 8.7% daily</h1>
            </div>
          </Grid>
          <Grid item xs={12} md={6} style={{ textAlign: "right" }}>
            <img src={img_bnb} className="home_img_bnb" alt="bnb" />
          </Grid>
        </Grid>
        <Grid container justifyContent="center" style={{ marginTop: "-30px" }}>
          <Grid item xs={12} md={4}>
            <div className="home_s_grp">
              <div className="glass">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xlink="http://www.w3.org/1999/xlink"
                  aria-hidden="true"
                  role="img"
                  className="iconify iconify--cryptocurrency"
                  width="50"
                  height="50"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 32 32"
                  data-icon="cryptocurrency:bnb"
                  data-width="50"
                  data-height="50"
                  style={{ color: "yellow" }}
                >
                  <path
                    fill="currentColor"
                    d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16s-7.163 16-16 16zm-3.884-17.596L16 10.52l3.886 3.886l2.26-2.26L16 6l-6.144 6.144l2.26 2.26zM6 16l2.26 2.26L10.52 16l-2.26-2.26L6 16zm6.116 1.596l-2.263 2.257l.003.003L16 26l6.146-6.146v-.001l-2.26-2.26L16 21.48l-3.884-3.884zM21.48 16l2.26 2.26L26 16l-2.26-2.26L21.48 16zm-3.188-.002h.001L16 13.706L14.305 15.4l-.195.195l-.401.402l-.004.003l.004.003l2.29 2.291l2.294-2.293l.001-.001l-.002-.001z"
                  ></path>
                </svg>
              </div>
              <div className="home_s_grp_text1">
                <h3>Total Staked</h3>
              </div>
              <h2>
                <span id="totalStaked">2667.5</span>{" "}
                <span className="unit">BNB</span>
              </h2>
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className="home_s_grp">
              <div className="glass">
                <div className="icon">💰</div>
              </div>
              <div className="home_s_grp_text1">
                <h3>Contract Balance</h3>
              </div>
              <h2>
                <span id="totalStaked">441.5</span>{" "}
                <span className="unit">BNB</span>
              </h2>
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className="home_s_grp">
              <div className="glass">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xlink="http://www.w3.org/1999/xlink"
                  aria-hidden="true"
                  role="img"
                  className="iconify iconify--cryptocurrency"
                  width="50"
                  height="50"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 32 32"
                  data-icon="cryptocurrency:bnb"
                  data-width="50"
                  data-height="50"
                  style={{ color: "yellow" }}
                >
                  <path
                    fill="currentColor"
                    d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16s-7.163 16-16 16zm-3.884-17.596L16 10.52l3.886 3.886l2.26-2.26L16 6l-6.144 6.144l2.26 2.26zM6 16l2.26 2.26L10.52 16l-2.26-2.26L6 16zm6.116 1.596l-2.263 2.257l.003.003L16 26l6.146-6.146v-.001l-2.26-2.26L16 21.48l-3.884-3.884zM21.48 16l2.26 2.26L26 16l-2.26-2.26L21.48 16zm-3.188-.002h.001L16 13.706L14.305 15.4l-.195.195l-.401.402l-.004.003l.004.003l2.29 2.291l2.294-2.293l.001-.001l-.002-.001z"
                  ></path>
                </svg>
              </div>
              <div className="home_s_grp_text1">
                <h3>BNB Price</h3>
              </div>
              <h2>
                <span id="totalStaked">{bnbPrice}</span>
              </h2>
            </div>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" style={{ marginTop: "100px" }}>
          <Grid item xs={12} md={5} lg={4}>
            <div className="home_t_grp">
              <div className="filler-header">
                <h2>Plan 1</h2>
                <div className="days">
                  <h3>low risk</h3>
                </div>
              </div>
              <div className="filler-body">
                <div className="value">
                  <h3>Investment Term</h3>
                  <div className="lockup">
                    <h1>14 days</h1>
                  </div>
                </div>
                <div className="value">
                  <h3>Investment Strategy</h3>
                  <div className="horizontal-group">
                    <h2>daily return</h2>
                    <h2>7%</h2>
                  </div>
                  <div className="horizontal-group">
                    <h2>auto-reinvested</h2>
                    <h2>14 times</h2>
                  </div>
                  <div className="horizontal-group">
                    <h2>total return</h2>
                    <h2>157.9%</h2>
                  </div>
                  <h3> </h3>
                  <div className="horizontal-group-alt">
                    <h3>
                      Withdrawal Tax <br />
                      <span style={{ fontSize: "smaller" }}>
                        Goes back directly into the contract
                      </span>
                    </h3>
                    <h3>-15%</h3>
                  </div>
                </div>
                <div className="value">
                  <div className="roi-group">
                    <div className="value">
                      <h3>Deposit</h3>
                      <h2>
                        <span id="deposit_left_0">1</span>{" "}
                        <span className="unit">BNB</span>
                      </h2>
                    </div>
                    <svg
                      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-vubbuv"
                      focusable="false"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      data-testid="ArrowRightAltIcon"
                    >
                      <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"></path>
                    </svg>
                    <div className="value">
                      <h3>Receive</h3>
                      <h2>
                        <span id="deposit_right_0">3.43</span>{" "}
                        <span className="unit">BNB</span>
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="deposit">
                  <h3>Deposit Amount</h3>
                  <div className="deposit-group">
                    <div className="input-group">
                      <input
                        id="deposit_value_0"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100000"
                        placeholder="0.1"
                        required=""
                        defaultValue={""}
                        disabled={!account}
                        onChange={(event) => onChangeDeposit(1, event.target.value)}
                      />
                      <h3>BNB</h3>
                    </div>
                    <button id="deposit_0" disabled={!account} onClick={() => { deposit(1) }}>
                      <h4>Deposit</h4>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} md={5} lg={4}>
            <div className="home_t_grp">
              <div className="filler-header">
                <h2>Plan 2</h2>
                <div className="days">
                  <h3>MODERATE RISK</h3>
                </div>
              </div>
              <div className="filler-body">
                <div className="value">
                  <h3>Investment Term</h3>
                  <div className="lockup">
                    <h1>21 days</h1>
                  </div>
                </div>
                <div className="value">
                  <h3>Investment Strategy</h3>
                  <div className="horizontal-group">
                    <h2>daily return</h2>
                    <h2>7%</h2>
                  </div>
                  <div className="horizontal-group">
                    <h2>auto-reinvested</h2>
                    <h2>14 times</h2>
                  </div>
                  <div className="horizontal-group">
                    <h2>total return</h2>
                    <h2>157.9%</h2>
                  </div>
                  <h3> </h3>
                  <div className="horizontal-group-alt">
                    <h3>
                      Withdrawal Tax <br />
                      <span style={{ fontSize: "smaller" }}>
                        Goes back directly into the contract
                      </span>
                    </h3>
                    <h3>-15%</h3>
                  </div>
                </div>
                <div className="value">
                  <div className="roi-group">
                    <div className="value">
                      <h3>Deposit</h3>
                      <h2>
                        <span id="deposit_left_0">1</span>{" "}
                        <span className="unit">BNB</span>
                      </h2>
                    </div>
                    <svg
                      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-vubbuv"
                      focusable="false"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      data-testid="ArrowRightAltIcon"
                    >
                      <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"></path>
                    </svg>
                    <div className="value">
                      <h3>Receive</h3>
                      <h2>
                        <span id="deposit_right_0">3.43</span>{" "}
                        <span className="unit">BNB</span>
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="deposit">
                  <h3>Deposit Amount</h3>
                  <div className="deposit-group">
                    <div className="input-group">
                      <input
                        id="deposit_value_0"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100000"
                        placeholder="0.1"
                        required=""
                        disabled={!account}
                        defaultValue={""}
                        onChange={(event) => onChangeDeposit(2, event.target.value)}
                      />
                      <h3>BNB</h3>
                    </div>
                    <button id="deposit_0" disabled={!account} onClick={() => { deposit(2) }}>
                      <h4>Deposit</h4>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} md={5} lg={4}>
            <div className="home_t_grp">
              <div className="filler-header">
                <h2>Plan 3</h2>
                <div className="days">
                  <h3>HIGH RISK</h3>
                </div>
              </div>
              <div className="filler-body">
                <div className="value">
                  <h3>Investment Term</h3>
                  <div className="lockup">
                    <h1>28 days</h1>
                  </div>
                </div>
                <div className="value">
                  <h3>Investment Strategy</h3>
                  <div className="horizontal-group">
                    <h2>daily return</h2>
                    <h2>7%</h2>
                  </div>
                  <div className="horizontal-group">
                    <h2>auto-reinvested</h2>
                    <h2>14 times</h2>
                  </div>
                  <div className="horizontal-group">
                    <h2>total return</h2>
                    <h2>157.9%</h2>
                  </div>
                  <h3> </h3>
                  <div className="horizontal-group-alt">
                    <h3>
                      Withdrawal Tax <br />
                      <span style={{ fontSize: "smaller" }}>
                        Goes back directly into the contract
                      </span>
                    </h3>
                    <h3>-15%</h3>
                  </div>
                </div>
                <div className="value">
                  <div className="roi-group">
                    <div className="value">
                      <h3>Deposit</h3>
                      <h2>
                        <span id="deposit_left_0">1</span>{" "}
                        <span className="unit">BNB</span>
                      </h2>
                    </div>
                    <svg
                      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-vubbuv"
                      focusable="false"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      data-testid="ArrowRightAltIcon"
                    >
                      <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"></path>
                    </svg>
                    <div className="value">
                      <h3>Receive</h3>
                      <h2>
                        <span id="deposit_right_0">3.43</span>{" "}
                        <span className="unit">BNB</span>
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="deposit">
                  <h3>Deposit Amount</h3>
                  <div className="deposit-group">
                    <div className="input-group">
                      <input
                        id="deposit_value_0"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100000"
                        placeholder="0.1"
                        required=""
                        disabled={!account}
                        defaultValue={""}
                        onChange={(event) => onChangeDeposit(3, event.target.value)}
                      />
                      <h3>BNB</h3>
                    </div>
                    <button id="deposit_0" disabled={!account} onClick={() => { deposit(3) }}>
                      <h4>Deposit</h4>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" style={{ marginTop: "100px" }}>
          <Grid item xs={12} md={5}>
            <div className="home_s_grp">
              <div className="glass1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xlink="http://www.w3.org/1999/xlink"
                  aria-hidden="true"
                  role="img"
                  className="iconify iconify--cryptocurrency"
                  width="50"
                  height="50"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 32 32"
                  data-icon="cryptocurrency:bnb"
                  data-width="50"
                  data-height="50"
                  style={{ color: "yellow" }}
                >
                  <path
                    fill="currentColor"
                    d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16s-7.163 16-16 16zm-3.884-17.596L16 10.52l3.886 3.886l2.26-2.26L16 6l-6.144 6.144l2.26 2.26zM6 16l2.26 2.26L10.52 16l-2.26-2.26L6 16zm6.116 1.596l-2.263 2.257l.003.003L16 26l6.146-6.146v-.001l-2.26-2.26L16 21.48l-3.884-3.884zM21.48 16l2.26 2.26L26 16l-2.26-2.26L21.48 16zm-3.188-.002h.001L16 13.706L14.305 15.4l-.195.195l-.401.402l-.004.003l.004.003l2.29 2.291l2.294-2.293l.001-.001l-.002-.001z"
                  ></path>
                </svg>
              </div>
              <div className="home_s_grp_text1">
                <h3>Total Staked</h3>
              </div>
              <h2>
                <div>{totalStaked}</div>
                {/* <div className="loader">
                  <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div> */}
              </h2>
            </div>

            <div className="home_s_grp">
              <button className="withdraw_btn" onClick={withdraw}>Withdraw</button>
              <div className="home_s_grp_text1">
                <h3>Available to withdraw</h3>
              </div>
              <h2>
                <div>{availableWithdraw}</div>
              </h2>
            </div>
          </Grid>
          <Grid item xs={12} md={7}>
            <div className="home_s_grp">
              <div className="home_s_grp_text1">
                <h3>Your Referral Link</h3>
              </div>
              <div className="horizontal-group">
                <div className="ref-link">
                  {!account ? (
                    <input
                      id="invite-link"
                      disabled={true}
                      defaultValue=""
                    />
                  ) : (
                    <input
                      id="invite-link"
                      disabled={true}
                      defaultValue={referalAddress}
                    />

                  )}


                </div>
                <div className="ref-copy" onClick={() => { navigator.clipboard.writeText(referalAddress) }}>
                  <svg
                    className="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall css-1k33q06"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-testid="ContentCopyIcon"
                  >
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
                  </svg>
                </div>
              </div>
              <Grid container justifyContent="center">
                <Grid item xs={12} md={6}>
                  <div className="home_s_grp_text1">
                    <h3>Total Bonus Earned</h3>
                    <div>{totalBonus}</div>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className="home_s_grp_text1">
                    <h3>Total Bonus Withdrawn</h3>
                    <div>{totalBonousWhtidrawn}</div>
                  </div>
                </Grid>
              </Grid>
              <Grid container justifyContent="center">
                <Grid item xs={12} md={6}>
                  <div className="home_s_grp_text1">
                    <h3>Users Invited by You</h3>
                    <div>0</div>
                  </div>
                </Grid>

                <Grid item xs={12} md={6}>
                  <div className="home_s_grp_text1">
                    <h3>You will receive:</h3>
                    <p>
                      - 6% for each level 1 referral deposit
                      <br />- 3% for each level 2 referral deposit
                      <br />- 1% for each level 3 referral deposit
                      <br />
                      <br />
                    </p>
                  </div>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
        <div className="bottom_imgae_grp">
          <div style={{ width: "190px" }}>
            <img src={img_bottom1} className="bottom_image" alt="bottom" />
          </div>
          <div style={{ width: "190px" }}>
            <img src={img_bottom2} className="bottom_image" alt="bottom" />
          </div>
        </div>
      </div>
    </>
  );
}
