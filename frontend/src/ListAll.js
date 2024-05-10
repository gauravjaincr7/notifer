import React, { useEffect, useState } from "react";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import axios from "axios";
import { Link } from "react-router-dom";


const ListAll = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [data, setData] = useState(null);
  const [netWork, setNetwork] = useState("devnet");
  const [email, setEmail] = useState("");
  const xAPIKey = "PvMTMbWmqSvINJhs"; // Your X-API-KEY here
  const threshold = 2;

  const handleSendEmail = async () => {
    if (data) {
      const balance = data[0]?.balance || 0; // Assuming data is an array of tokens
      if (balance < threshold) {
        sendEmail();
      } else {
        alert("Balance is above the threshold.");
      }
    }
  };

  const sendEmail = async () => {
    try {
      const response = await axios.get("http://localhost:3001/send-email", {
        params: {
          email: email,
          threshold: threshold,
        },
      });
      console.log(response.data);
      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email.");
    }
  };

  const solanaConnect = async () => {
    const { solana } = window;
    if (!solana) {
      alert("Please Install Solana");
      return;
    }

    try {
      const network = netWork; // Use selected network
      const phantom = new PhantomWalletAdapter();
      await phantom.connect();
      const rpcUrl = clusterApiUrl(network);
      const connection = new Connection(rpcUrl, "confirmed");
      const wallet = {
        address: phantom.publicKey.toString(),
      };

      if (wallet.address) {
        console.log(wallet.address);
        setWalletAddress(wallet.address);
        const accountInfo = await connection.getAccountInfo(
          new PublicKey(wallet.address),
          "confirmed"
        );
        console.log(accountInfo);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchTokens = async () => {
      if (walletAddress) {
        try {
          const reqUrl = `https://api.shyft.to/sol/v1/wallet/all_tokens?network=${netWork}&wallet=${walletAddress}`;
          const response = await axios.get(reqUrl, {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": xAPIKey,
            },
          });
          console.log(response.data);
          setData(response.data.result);
          const balance = response.data.result[0]?.balance || 0;
          if (balance < threshold) {
            sendEmail();
          }
        } catch (error) {
          console.warn("Error fetching tokens:", error);
        }
      }
    };

    fetchTokens();
  }, [walletAddress, netWork, threshold]); // Trigger effect on walletAddress, netWork, or threshold change



  return (
    <div>
      <div className="container py-3">
        <div className="card border border-primary p-5">
          <h2 className="display-4 text-center">
            List All Your Fungible Tokens using Shyft APIs
          </h2>
          {!walletAddress && (
            <div>
              <h4 className="text-center py-3 text-primary">
                Connect Your Wallet to get started
              </h4>
              <div className="text-center pt-3">
                <button
                  className="btn btn-primary px-4 py-2"
                  onClick={solanaConnect}
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          )}
          {walletAddress && (
            <div className="text-center py-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn btn-primary px-4 ms-2" onClick={handleSendEmail}>
                Add your Email
              </button>
            </div>
          )}
        </div>

        <div className="py-3">
          <div className="w-25 mx-auto">
            <select
              name="network"
              className="form-control form-select"
              onChange={(e) => setNetwork(e.target.value)}
              value={netWork}
            >
              <option value="devnet">Devnet</option>
              <option value="testnet">Testnet</option>
              <option value="mainnet-beta">Mainnet Beta</option>
            </select>
          </div>
          <div className="card mt-3 py-3 border-0">
            <table className="table w-75 mx-auto text-center">
              <thead>
                <tr>
                  <td className="w-25 border-2">Token Image</td>
                  <td className="w-50 border-2">Token Details</td>
                  <td className="w-25 border-2">Balance</td>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((token) => (
                    <tr key={token.address}>
                      <td className="w-25 border-2">
                        <img src={token.info.image} className="img-fluid w-75 mx-auto" alt="" />
                      </td>
                      <td className="w-50 border-2">
                        <Link
                          to={`/view-details?token_address=${token.address}&network=${netWork}`}
                          target="_blank"
                        >
                          <h4>{token.info.name}</h4>
                          {token.address}
                        </Link>
                      </td>
                      <td className="w-25 border-2">{token.balance} {token.info.symbol}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListAll;
