import { useState, useEffect } from 'react';
import { ethers } from "ethers";

//CHANGE THE FILE NAME HERE TO MATCH THAT OF YOUR CONTRACT
import abi from "./contracts/CadenaNFTS.json";
import nftMetaData from "./nft_metadata.json";

function App() {

  //INSERT YOUR CONTRACT ADDRESS HERE
  const contractAddress = 'INSERT_YOUR_CONTRACT_ADDRESS_HERE';
  const contractABI = abi.abi;

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [yourWalletAddress, setYourWalletAddress] = useState(null);
  const [nftSupply, setNftSupply] = useState(0);
  const [nftMintPrice, setNftMintPrice] = useState(0);
  const [mintStatus, setMintStatus] = useState("");
  const [openSeaProfile, setOpenSeaProfile] = useState('');
  const [error, setError] = useState(null);


  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setYourWalletAddress(account);
        console.log("Account Connected: ", account);
        getContractInfo();

        setOpenSeaProfile(`https://testnets.opensea.io/${account}?tab=activity`);
      } else {
        setError("Install a MetaMask wallet to mint our NFT Collection.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }


  const getContractInfo = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
      const nftSupply = await nftContract.MAX_SUPPLY();
      const mintPrice = await nftContract.MINT_PRICE();
      console.log('Total NFTS', parseInt(nftSupply));
      console.log('Mint price', parseInt(mintPrice));
      setNftSupply(parseInt(nftSupply));
      setNftMintPrice(ethers.utils.formatEther((mintPrice)));
    } catch (error) {
      console.log(error);
    }
  }

  const mintToken = async (tokenId) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        //INSERT THE CID FROM PINATA FROM YOUR JSON FOLDER HERE
        const metadataURI = `https://gateway.pinata.cloud/ipfs/INSERT_YOUR_JSON_CID_HERE/${tokenId}.json`
        console.log(metadataURI);
        const txn = await nftContract.safeMint(yourWalletAddress, metadataURI, {
          value: ethers.utils.parseEther('0.001'),
        });
        console.log("NFT Minting...");
        setMintStatus("⌛Minting...");
        await txn.wait();
        console.log("NFT Minted", txn.hash);
        setMintStatus("✅ Minted");
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to mint an NFT.");
      }
    } catch (error) {
      console.log(error);
    }
  }


  useEffect(() => {
    checkIfWalletIsConnected();
    getContractInfo();
  }, [])

  return (
    <main className="container mx-auto p-4">
      <span className="prose">
        <h1 className="text-white sm:text-5xl text-3xl text-center sm:mt-5 sm:mb-10 mb-5">
          Cadena NFT Minter 🎟
        </h1>
      </span>
      <div className="mt-5">
        {isWalletConnected ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {
                nftMetaData.map((nftMetaData) => {
                  return (
                    <div className="card bg-base-100 shadow-xl col-span-1" key={nftMetaData.edition}>
                      {console.log(nftMetaData)}
                      <figure><img src={nftMetaData.image} alt={nftMetaData.name} /></figure>
                      <div className="card-body">
                        <h2 className="card-title text-white">{nftMetaData.name}</h2>
                        <p className="mb-3 text-white">{nftMetaData.description}</p>
                        <p className="mb-3 text-amber-400"><span className="text-white font-semibold">Mint Price:</span> {nftMintPrice} ETH</p>
                        <div className="card-actions justify-center">
                          <button className="btn btn-primary btn-wide"
                            onClick={() => mintToken(nftMetaData.edition)}>Mint</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
            <p className="mt-5 text-center text-white font-bold">{mintStatus}</p>
            <p className="mt-5 text-center text-amber-400	"><span className="font-bold text-white">Your Wallet Address: </span>{yourWalletAddress}</p>
            <div className="mt-5">
              <p className="text-amber-400 text-center"><span className="font-bold text-white mt-5">Your NFT will be available at: </span>
                <span className=" text-grey-800"> <a href={openSeaProfile} target="_blank" rel="noopener noreferrer">{openSeaProfile}</a> </span>
              </p>
            </div>
          </>
        ) : (
          <div className="prose mx-auto">
            <h2 className="text-center text-white">Connect Your Wallet to Start Minting</h2>
            <button className="btn btn-primary w-full" onClick={checkIfWalletIsConnected}>
              {"Connect Wallet 🔑"}
            </button>
          </div>
        )}
      </div>
      <section className="customer-section pb-10 text-center">
        {error && <p className="text-2xl text-red-700 mt-5">{error}</p>}
        <div className="mt-5">
          <p className="text-amber-400"><span className="font-bold text-white">Contract Address: </span>{contractAddress}</p>
        </div>
        <div className="mt-5">
          <p className="text-amber-400	"><span className="font-bold text-white">NFT Mint Price: </span>{nftMintPrice} ETH</p>
        </div>
        <div className="mt-5">
          <p className="text-amber-400"><span className="font-bold text-white">NFT Supply: </span>{nftSupply}</p>
        </div>
      </section>
    </main>
  );
}
export default App;