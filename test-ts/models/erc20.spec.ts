import 'dotenv/config';
import {ERC20} from '@models/erc20';
import {expect} from 'chai';
import {toSmartContractDecimals} from '@utils/numbers';
import {describe} from 'mocha';
import {defaultWeb3Connection, erc20Deployer} from '../utils';

describe(`ERC20`, () => {
  let erc20: ERC20;
  let erc20ContractAddress = process.env.ERC20_ADDRESS;
  let contractExisted = !!erc20ContractAddress;

  const capAmount = process.env.ERC20_CAP || '10';
  const cap = toSmartContractDecimals(capAmount, 18) as number;
  const name = `BEPRO`;
  const symbol = `$BEPRO`;

  const web3Connection = defaultWeb3Connection();

  if (!erc20ContractAddress) {
    it(`Deploys a ERC20 Contract`, async () => {
      const receipt = await erc20Deployer(name, symbol, cap, web3Connection);

      expect(receipt.contractAddress).to.not.be.empty;
      erc20ContractAddress = receipt.contractAddress!;
    });
  }

  describe(`new ERC20 Contract methods`, () => {
    before(async () => {
      erc20 = new ERC20(web3Connection, erc20ContractAddress);
      await erc20.start();
    });

    it(`ERC20 name, symbol, cap and distributionAddress match`, async () => {
      expect(await erc20.totalSupply(), `totalSupply`).to.eq(+capAmount)
      expect(await erc20.name(), `Name`).to.eq(name);
      expect(await erc20.symbol(), `Symbol`).to.eq(symbol);

      if (contractExisted)
        expect(await erc20.getTokenAmount(web3Connection.Account.address)).to.be.greaterThan(0);
      else
        expect(await erc20.getTokenAmount(web3Connection.Account.address)).to.eq(+capAmount);
    });

    it(`Approves usage`, async () => {
      const approval = await erc20.approve(web3Connection.Account.address, +capAmount);
      expect(approval, `approved hash`).to.not.be.empty;
    });

    it(`isApproved`, async () => {
      const approved = await erc20.isApproved(web3Connection.Account.address, +capAmount);
      expect(approved, `is approved`).to.be.true;
    })

    it(`Transfers some tokens`, async () => {
      const newAccount = web3Connection.Web3.eth.accounts.create(`0xB3pR0Te511Ng`);
      const transfer = await erc20.transferTokenAmount(newAccount.address, 1)
      expect(transfer).to.not.be.empty;
    });

    it(`Checks that transfer was successful`, async () => {
      expect(await erc20.getTokenAmount(web3Connection.Account.address)).to.be.lessThanOrEqual(+capAmount - 1);
    });
  });

  after(() => {
    console.table({erc20ContractAddress});
  });
});
