import React from 'react';
import { useState , useEffect } from 'react';
import { BigNumber, ethers } from "ethers";
import './App.css';
import { GearFill } from 'react-bootstrap-icons';


import PageButton from "./components/Pagebutton";
import ConnectButton from './components/Connectbutton';
import ConfigModal from './components/Configmodal';
import CurrencyField from './components/Currencyfield';
import { Currency } from '@uniswap/sdk';
import { BeatLoader } from 'react-spinners';

import { getWethContract, getUSDCContract, getPrice, runSwap } from "./ContractService";


function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);

  const [slippageAmount, setSlippageAmount] = useState(2);
  const [deadLineMinutes, setDeadLineMinutes] = useState(10);
  const [showModal, setShowModal] = useState(undefined);

  const [inputAmount, setInputAmount] = useState(undefined);
  const [outputAmount, setOutputAmount] = useState(undefined);
  const [transaction, setTransaction] = useState(undefined);
  const [loading, setLoading] = useState(undefined);
  const [ratio, setRatio] = useState(undefined);
  const [wethContract, setWethContract] = useState(undefined);
  const [usdcContract, setUsdcContract] = useState(undefined);
  const [wethAmount, setWethAmount] = useState(undefined);
  const [usdcAmount, setUsdcAmount] = useState(undefined);


  
  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const wethContract = getWethContract();
      setWethContract(wethContract);

      const usdcContract =  getUSDCContract();
      setUsdcContract(usdcContract);
    }
    onLoad();
  }, [])

  const getSigner = async provider => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
     setSigner(signer);
  }

  const isConnected = () => signer !== undefined
  const getWalletAddress = () => {
     signer.getAddress()
       .then((address) => {
          setSignerAddress(address); 

          wethContract.balanceOf(address)
           .then(res => {
             setWethAmount( Number(ethers.utils.formatUnits(res, 18)))
           })

           usdcContract.balanceOf(address)
           .then(res => {
            let a = Number(ethers.utils.formatUnits(res, 6));
             setUsdcAmount( Number(ethers.utils.formatUnits(res, 6)))
           })
       })
  }
  
  if(signer != undefined) {
      getWalletAddress();
  }

  const getSwapPrice = (inputAmount) => {
    setLoading(true);
    console.log(inputAmount)
    setInputAmount(inputAmount);
   
    const swap = getPrice(inputAmount, slippageAmount, Math.floor(Date.now()/1000 + (deadLineMinutes * 60)), signerAddress)
                         .then( data => {
                          console.log(data)
                          setTransaction(data[0]);
                          setOutputAmount(data[1]);
                          setRatio(data[2]);
                          setLoading(false);
                         })
                         .catch((error) => {
                          console.log(error);
                         })
  }

  return (
    <div className="App">
      <div className='appNav'>
         <div className='my-2 buttonContainer buttonContainerTop'>
          <PageButton name={"Swap"} isBold={true} />
          <PageButton name={"Pool"} />
          <PageButton name={"Vote"} />
          <PageButton name={"Charts"} />
         </div>
          
          <div className='rightNav'>
          <div className='connectButtonContainer'>
            <ConnectButton
             provider={provider}
             isConnected={isConnected}
             signerAddress={signerAddress}
             getSigner={getSigner}

            />
          </div>
          <div className="my-2 buttonContainer">
            <PageButton name={"..."} isBold={true} />
          </div>
         </div>
        </div>
        <div className='appBody'>
          <div className='swapContainer'>
            <div className='swapHeader'>
              <span className='swapText'>Swap</span>
              <span className='gearContainer' onClick={() => setShowModal(true)}>
                <GearFill />
              </span>
              {
                showModal && (
                  <ConfigModal 
                    onClose={() => setShowModal(false)}
                    setDeadLineMinutes={setDeadLineMinutes}
                    deadLineMinutes={deadLineMinutes}
                    setSlippageAmount={setSlippageAmount}
                    slippageAmount={slippageAmount}
                  />
                )
              }
            </div>
            <div className='swapBody'>
              <CurrencyField
                field="input"
                tokenName="WETH"
                getSwapPrice={getSwapPrice}
                signer={signer}
                balance={wethAmount}
                />
                <CurrencyField
                field="output"
                tokenName="USDC"
                value={outputAmount}
                signer={signer}
                balance={usdcAmount}
                spinner={BeatLoader}
                loading={loading}
                />
            </div>
            <div className="ratioContainer">
            {ratio && (
              <>
                {`1 USDC = ${ratio} WETH`}
              </>
            )}
          </div>
          <div className="swapButtonContainer">
            {isConnected() ? (
              <div
                onClick={() => runSwap(transaction, signer)}
                className="swapButton"
              >
                Swap
              </div>
            ) : (
              <div
                onClick={() => getSigner(provider)}
                className="swapButton"
              >
                Connect Wallet
              </div>
            )}
          </div>
          </div>
        </div>
     
    </div>
  );
}

export default App;
