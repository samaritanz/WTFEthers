// 声明只可写合约的规则：
// const contract = new ethers.Contract(address, abi, signer);
// 参数分别为合约地址`address`，合约ABI `abi`，Signer变量`signer`

import { ethers } from "ethers";
// playcode免费版不能安装ethers，用这条命令，需要从网络上import包（把上面这行注释掉）
// import { ethers } from "https://cdn-cors.ethers.io/lib/ethers-5.6.9.esm.min.js";

// 利用Infura的rpc节点连接以太坊网络
// 准备Infura API Key, 教程：https://github.com/AmazingAng/WTFSolidity/blob/main/Topics/Tools/TOOL02_Infura/readme.md
const INFURA_ID = '184d4c5ec78243c290d151d3f1a10f1d'
// 连接Rinkeby测试网
const provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${INFURA_ID}`)

// 利用私钥和provider创建wallet对象
const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

// WETH的ABI
const abiWETH = [
    "function balanceOf(address) public view returns(uint)",
    "function deposit() public payable",
    "function transfer(address, uint) public returns (bool)",
    "function withdraw(uint) public ",
];
// WETH合约地址（Rinkeby测试网）
const addressWETH = '0xc778417e063141139fce010982780140aa0cd5ab' // WETH Contract

// 声明可写合约
const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet)
// 也可以声明一个只读合约，再用connect(wallet)函数转换成可写合约。
// const contractWETH = new ethers.Contract(addressWETH, abiWETH, provider)
// contractWETH.connect(wallet)

const main = async () => {

    const address = await wallet.getAddress()
    // 1. 读取WETH合约的链上信息（WETH abi）
    console.log("\n1. 读取WETH余额")
    const balanceWETH = await contractWETH.balanceOf(address)
    console.log(`存款前WETH持仓: ${ethers.utils.formatEther(balanceWETH)}\n`)
    //读取钱包内ETH余额
    const balanceETH = await wallet.getBalance()
    
    // 如果钱包ETH足够
    if(ethers.utils.formatEther(balanceETH) > 0.0015){

        // 2. 调用desposit()函数，将0.001 ETH转为WETH
        console.log("\n2. 调用desposit()函数，存入0.001 ETH")
        // 发起交易
        const tx = await contractWETH.deposit({value: ethers.utils.parseEther("0.001")})
        // 等待交易上链
        await tx.wait()
        console.log(`交易详情：`)
        console.log(tx)
        const balanceWETH_deposit = await contractWETH.balanceOf(address)
        console.log(`存款后WETH持仓: ${ethers.utils.formatEther(balanceWETH_deposit)}\n`)

        // 3. 调用transfer()函数，将0.001 WETH转账给 vitalik
        console.log("\n3. 调用transfer()函数，给vitalik转账0.001 WETH")
        // 发起交易
        const tx2 = await contractWETH.transfer("vitalik.eth", ethers.utils.parseEther("0.001"))
        // 等待交易上链
        await tx2.wait()
        const balanceWETH_transfer = await contractWETH.balanceOf(address)
        console.log(`转账后WETH持仓: ${ethers.utils.formatEther(balanceWETH_transfer)}\n`)

    }else{
        // 如果ETH不足
        console.log("ETH不足，去水龙头领一些Rinkeby ETH")
        console.log("1. chainlink水龙头: https://faucets.chain.link/rinkeby")
        console.log("2. paradigm水龙头: https://faucet.paradigm.xyz/")
    }
}

main()
