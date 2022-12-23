const { AlphaRouter, USDC_GÖRLI, WETH9 } = require('@uniswap/smart-order-router');
const { Token, CurrencyAmount,  Percent, TradeType } = require('@uniswap/sdk-core');
const { ChainId, JSBI} = require('@uniswap/sdk')
const { ethers, BigNumber} = require('ethers');
const ERC20ABI = require('./abi.json');


const V3_SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const INFURA_GOERL_ENDPOINT = process.env.REACT_APP_INFURA_GOERL_ENDPOINT

const chainId = 5

const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_GOERL_ENDPOINT); 
 
const router = new AlphaRouter({ chainId: chainId, provider: web3Provider });

const name0 = 'Wrapped Ether'
const symbol0 = 'WETH'
const decimals0 = 18
const address0 = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

const name1 = 'USD//C'
const symbol1 = 'USDC'
const decimals1 = 6
const address1 = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'

const WETH = new Token(WETH9[5].chainId, WETH9[5].address, WETH9[5].decimals, WETH9[5].symbol, WETH9[5].name)
const USDC = new Token(USDC_GÖRLI.chainId, USDC_GÖRLI.address, USDC_GÖRLI.decimals, USDC_GÖRLI.symbol, USDC_GÖRLI.name)

export const getWethContract = () => new ethers.Contract(address0, ERC20ABI, web3Provider)
export const getUSDCContract = () => new ethers.Contract(USDC_GÖRLI.address, ERC20ABI, web3Provider)

export const getPrice = async (inputAmount, slippageAmount, deadline, walletAddress) => {
  const percentSlippage = new Percent(slippageAmount, 100)
  let wei = ethers.utils.parseUnits(inputAmount.toString(), decimals0);
  console.log(wei);
  const currencyAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei));
  console.log(currencyAmount);
  console.log(percentSlippage)
  console.log('---')
  console.log(WETH9[5].address)

  const route = await router.route(
    currencyAmount,
    USDC,
    TradeType.EXACT_OUTPUT,
    {
      recipient: walletAddress,
      slippageTolerance: percentSlippage,
      deadline: deadline,
    }
  )

  const transaction = {
    data: route.methodParameters.calldata,
    to: V3_SWAP_ROUTER_ADDRESS,
    value: BigNumber.from(route.methodParameters.value),
    from: walletAddress,
    gasPrice: BigNumber.from(route.gasPriceWei),
    gasLimit: ethers.utils.hexlify(1000000)
  }

  const quoteAmountOut = route.quote.toFixed(6)
  
  const ratio = (inputAmount / quoteAmountOut).toFixed(3)

  return [
    transaction,
    quoteAmountOut,
    ratio
  ]
}

export const runSwap = async (transaction, signer) => {
  const approvalAmount = ethers.utils.parseUnits('10', 18).toString()
  const contract0 = getWethContract()
  await contract0.connect(signer).approve(
    V3_SWAP_ROUTER_ADDRESS,
    approvalAmount
  )

  signer.sendTransaction(transaction)
}