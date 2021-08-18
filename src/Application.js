const Web3 = require("web3");

const ERC20Contract = require("./models/index").ERC20Contract;
const PredictionMarketContract = require("./models/index").PredictionMarketContract;
const RealitioERC20Contract = require("./models/index").RealitioERC20Contract;

const Account = require('./utils/Account');

const ETH_URL_MAINNET =
	"https://mainnet.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc";
const ETH_URL_TESTNET =
	"https://kovan.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc";
const TEST_PRIVATE_KEY =
	"0xfdf5475fe6be966cf39e533e5b478b2e10d04e5e966be18f45714550d2429d21";

const networksEnum = Object.freeze({
	1: "Main",
	2: "Morden",
	3: "Ropsten",
	4: "Rinkeby",
	42: "Kovan",
});

class Application {
	constructor({test=false, mainnet=true}) {
		this.test = test;
		this.mainnet = mainnet;
		if (this.test) {
			this.start();
			this.login();
			this.account = new Account(this.web3, this.web3.eth.accounts.privateKeyToAccount(TEST_PRIVATE_KEY));
		}
	}

	/**********/
	/** CORE **/
	/**********/

	/**
	 * @name start
	 * @description Start the Application
	 */
	start() {
		this.web3 = new Web3(
			new Web3.providers.HttpProvider(
				(this.mainnet == true) ? ETH_URL_MAINNET : ETH_URL_TESTNET
			)
		);
		if (typeof window !== "undefined") {
			window.web3 = this.web3;
		} else {
			if (!this.test) {
				throw new Error("Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet");
			}
		}
	}

	/**
	 * @name login
	 * @description Login with Metamask or a web3 provider
	 */
	async login() {
		try {
			if (typeof window === "undefined") { return false; }
			if (window.ethereum) {
				window.web3 = new Web3(window.ethereum);
				this.web3 = window.web3;
				await window.ethereum.enable();
				return true;
			}
			return false;
		} catch(err) {
			throw err;
		}
	};

	/**
	 * @name isLoggedIn
	 * @description Returns wether metamask account is connected to service or not
	 */
	async isLoggedIn () {
		try {
			if (typeof window === "undefined" || typeof window.ethereum === "undefined") { return false; }
			const accounts = await ethereum.request({ method: 'eth_accounts' });

			return accounts.length > 0;
		} catch(err) {
			return false;
		}
	};

	/*************/
	/** GETTERS **/
	/*************/

	/**
	 * @name getPredictionMarketContract
	 * @param {Address} ContractAddress (Opt) If it is deployed
	 * @description Create a PredictionMarket Contract
	 */
	 getPredictionMarketContract ({ contractAddress = null }={}) {
		try {
			return new PredictionMarketContract({
				web3: this.web3,
				contractAddress,
				acc : this.test ? this.account : null
			});
		} catch(err) {
			throw err;
		}
	};

	/**
	 * @name getRealitioERC20Contract
	 * @param {Address} ContractAddress (Opt) If it is deployed
	 * @description Create a RealitioERC20 Contract
	 */
	 getRealitioERC20Contract({ contractAddress = null }={}) {
		try {
			return new RealitioERC20Contract({
				web3: this.web3,
				contractAddress,
				acc : this.test ? this.account : null
			});
		} catch(err) {
			throw err;
		}
	};

	/**
	 * @name getERC20Contract
	 * @param {Address} ContractAddress (Opt) If it is deployed
	 * @description Create a ERC20 Contract
	 */
	getERC20Contract({contractAddress=null}) {
		try {
			return new ERC20Contract({
				web3: this.web3,
				contractAddress: contractAddress,
				acc : this.test ? this.account : null
			});
		} catch(err) {
			throw err;
		}
	};

	/***********/
	/** UTILS **/
	/***********/

	/**
	 * @name getETHNetwork
	 * @description Access current ETH Network used
	 * @returns {String} Eth Network
	 */
	async getETHNetwork() {
		const netId = await this.web3.eth.net.getId();
		const networkName = networksEnum.hasOwnProperty(netId)
			? networksEnum[netId]
			: "Unknown";
		return networkName;
	};

	/**
	 * @name getAddress
	 * @description Access current Address Being Used under Web3 Injector (ex : Metamask)
	 * @returns {Address} Address
	 */
	async getAddress() {
		const accounts = await this.web3.eth.getAccounts();
		return accounts[0];
	};

	/**
	 * @name getETHBalance
	 * @description Access current ETH Balance Available for the Injected Web3 Address
	 * @returns {Integer} Balance
	 */
	async getETHBalance() {
		const address = await this.getAddress();
		let wei = await window.web3.eth.getBalance(address);
		return this.web3.utils.fromWei(wei, "ether");
	};
}

module.exports = Application;
