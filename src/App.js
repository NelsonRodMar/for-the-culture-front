import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import './styles/App.css';

import ethLogo from './assets/ethlogo.png';
import twitterLogo from './assets/twitter-logo.svg';
import githubLogo from './assets/github-logo.svg';
import ftc from './utils/ForTheCulture.json';
import ftcPng from './assets/billionaire.png';
import {networks, networksLZ} from './utils/networks';

const TWITTER_LINK = `https://twitter.com/NelsonRodMar`;
const GITHUB_LINK = `https://github.com/NelsonRodMar/for-the-culture`;
const CONTRACT_ADDRESS = {
        "Base": "0xB1379C5041c5cA4C222388429Ed5EFA22C9BBdE7", // Base
        "Scroll": "0x3374Eb14b0293D51756f6865a7715D7699b53693", // Scroll
        "Linea": "0xd6cdE7b19bc4BDd3a1784F43f675E268639621B6", // Linea
    }
;
let chainId = '';


const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [network, setNetwork] = useState('');
    const [idTokenTransfer, setIdTokenTransfer] = useState('');
    const [selectNetwork, setSelectNetwork] = useState('');
    const [isApproved, setIsApprove] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const handleChange = (e) => {
        setSelectNetwork(e.target.value);
    };
    /**
     * Implement your connectWallet method here
     */
    const connectWallet = async () => {
        try {
            const {ethereum} = window;

            console.log(ethereum)

            if (!ethereum) {
                alert("Get a wallet !");
                return;
            }
            const accounts = await ethereum.request({method: "eth_requestAccounts"});
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error)
        }
    }
    /*
        Check if a wallet is connected
      */
    const checkIfWalletIsConnected = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            const accounts = await ethereum.request({method: "eth_accounts"});

            chainId = await ethereum.request({method: 'eth_chainId'});
            setNetwork(networks[chainId]);

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);

            } else {
                console.log("No authorized account found")
            }


            ethereum.on('chainChanged', handleChainChanged);

            // Reload the page when they change networks
            function handleChainChanged(_chainId) {
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const checkIfApproveToken = async (value) => {
        const {ethereum} = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        setIdTokenTransfer(value);
        const contract = new ethers.Contract(CONTRACT_ADDRESS[network], ftc, signer);
        try {
            const approvedContract = await contract.getApproved(value);
            const ownerNFT = await contract.ownerOf(value);
            if (approvedContract === CONTRACT_ADDRESS[network] && ownerNFT.toLowerCase() === currentAccount.toLowerCase()) {
                //Display a button to approve the token
                setIsOwner(true);
                setIsApprove(true);
            } else if (approvedContract !== CONTRACT_ADDRESS[network] && ownerNFT.toLowerCase() === currentAccount.toLowerCase()) {
                setIsOwner(true);
            }
        } catch (error) {
            setIsOwner(false);
            setIsApprove(false);
        }
    }

    const approveToken = async () => {
        const {ethereum} = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS[network], ftc, signer);
        const tx = await contract.approve(CONTRACT_ADDRESS[network], idTokenTransfer);
        const receipt = await tx.wait();
        if (!receipt.status === 1) {
            alert("Transaction failed! Please try again");
        } else {
            setIsApprove(true);
        }
    }
    const transferToken = async () => {
        // Alert the user if the domain is too short
        console.log("Transfer token");
        const {ethereum} = window;
        console.log("ethereum", ethereum)
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS[network], ftc, signer);
        try {
            console.log("lol")
            if (ethereum) {
                const resultFee = await contract.estimateSendFee(
                    networksLZ[selectNetwork], // _dstChainId
                    currentAccount, // _toAddress
                    idTokenTransfer, // _tokenId
                    false, // _useZro
                    "0x00010000000000000000000000000000000000000000000000000000000000030d40" // _adapterParams
                );
                console.log("resultFee")
                console.log(resultFee)
                let tx = await contract.sendFrom(
                    currentAccount, // _from
                    networksLZ[selectNetwork], // _dstChainId
                    currentAccount, // _toAddress
                    idTokenTransfer, // _tokenId
                    currentAccount, // _refundAddress
                    "0x000000000000000000000000000000000000dEaD", // _zroPaymentAddress
                    "0x00010000000000000000000000000000000000000000000000000000000000030d40", // _adapterParams
                    {value: resultFee.nativeFee} // _value
                );

                console.log("tx", tx)

                // Wait for the transaction to be mined
                const receipt = await tx.wait();
                // Check if the transaction was successfully completed
                if (!receipt.status === 1) {
                    alert("Transaction failed! Please try again");
                }
            }
        } catch (error) {
            if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
                alert("Please enter a valid number");
            } else {
                console.log(error);
            }
        }
    }

    // Create a function to render if wallet is not connected yet
    const renderNotConnectedContainer = () => (
        <div className="connect-wallet-container">
            <button className="cta-button connect-wallet-button" onClick={connectWallet}>
                Connect Wallet
            </button>
        </div>
    );


    const renderTransferToken = () => {
        return (

            <div id="cyan" className="form-container">
                <div>
                    <h2>🔨 Mint FTC</h2>
                </div>
                <div className="first-row">
                    <p> <b>It is recommended to mint "For The Culture" on Mint.Fun to win 10 points by mint :<br/> <a target="_blank" href={"https://mint.fun/base/0xb1379c5041c5ca4c222388429ed5efa22c9bbde7"}>https://mint.fun/base/0xb1379c5041c5ca4c222388429ed5efa22c9bbde7</a></b> </p>
                </div>
                <div>
                    <h2>📤 Transfer FTC</h2>
                </div>
                <div className="first-row">
                    <select value={selectNetwork} required={true}
                            onChange={handleChange}>
                        <option defaultValue="true" disabled="disabled" value="">Select a network</option>
                        {Reflect.deleteProperty(networks, chainId)}
                        {
                            Object.entries(networks).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v}
                                </option>
                            ))
                        }
                    </select>
                </div>
                <div className="first-row">
                    <input
                        required={true}
                        id="idTokenTransfer"
                        type="number"
                        value={idTokenTransfer}
                        placeholder='Id of the NFT'
                        onChange={e => checkIfApproveToken(e.target.value)}
                    />
                    {(network !== undefined && isApproved && isOwner) && (
                        <button className='cta-button mint-button' onClick={transferToken}>
                            Transfer
                        </button>
                    ) || (network !== undefined && !isApproved && isOwner) && (
                        <button className='cta-button mint-button' onClick={approveToken}>
                            Approve
                        </button>
                    ) || (network !== undefined && !isOwner) && (
                        <button className='cta-button mint-button' disabled={true}>
                            Not the owner
                        </button>
                    )}
                </div>
            </div>
        );
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);
    return (
        <div className="App">
            <div className="container">

                <div className="header-container">
                    <header>
                        <div className="left">
                            <p className="title">🎭 For The Culture</p>
                            <p className="subtitle">An omnichannel NFT so we can all remember where we come from!</p>
                        </div>
                        <div className="right">
                            {network !== undefined ? (
                                <div className="right">
                                    <img alt="Network logo" className="logo" src={ethLogo}/>
                                    <p> {network} </p>
                                </div>
                            ) : (<p style={{marginRight: 10 + '%'}}> ⚠️ Network not supported </p>)}
                            {currentAccount ?
                                <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</p> :
                                <p> Not connected </p>}
                        </div>
                    </header>
                </div>
                <div>
                    <div className="topnav">
                        <a href="#whatis">⁉️ What is FTC ?</a>
                        <a href="#interact">🔨 Interact with FTC</a>
                        <a href="#more">ℹ️ More on FTC</a>
                    </div>
                </div>

                <div id="teal" className="explanation-container">
                    <img src={ftcPng}/>
                    <h2 id="whatis">⁉️ What is FTC (For The Culture) ?</h2>
                    <p>
                        For The Culture, FTC is a omnichain NFT using OFT technologie from LayerZero !
                        <br/>
                        <br/>
                        FTC is only mintable on Base for only 0.0022 ETH (plus fee).
                        <br/>
                        <br/>
                        For The Culture is a NFT that can be move to any supported chain.
                        <br/>
                        <br/>
                    </p>
                </div>
                <div className="form-container">
                    <h2 id="interact">🔨 Interact with FTC</h2>
                </div>
                {!currentAccount && renderNotConnectedContainer()}
                {currentAccount && renderTransferToken()}

                <div className="form-container">
                    <h2 id="more">ℹ️ More on FTC</h2>
                </div>
                <div id="grayBlue">
                <h3>Contract address :</h3>
                    <p>
                        <ul>
                            <li>Base : <a
                                href="https://basescan.org/token/0xb1379c5041c5ca4c222388429ed5efa22c9bbde7"
                                target="_blank">0xb1379c5041c5ca4c222388429ed5efa22c9bbde7</a></li>

                            <li>Scroll : <a
                                href="https://scrollscan.com/address/0x3374eb14b0293d51756f6865a7715d7699b53693"
                                target="_blank">0x3374eb14b0293d51756f6865a7715d7699b53693</a></li>

                            <li>Linea : <a
                                href="https://lineascan.build/address/0xd6cde7b19bc4bdd3a1784f43f675e268639621b6"
                                target="_blank">0xd6cde7b19bc4bdd3a1784f43f675e268639621b6</a></li>
                        </ul>
                    </p>
                </div>
                <div className="footer-container">
                    <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo}/>
                    <a
                        className="footer-text"
                        href={TWITTER_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >@NelsonRodMar</a>
                    <img alt="Github Logo" className="twitter-logo" src={githubLogo}/>
                    <a
                        className="footer-text"
                        href={GITHUB_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >NelsonRodMar</a>
                </div>
            </div>
        </div>
    );
}

export default App;
