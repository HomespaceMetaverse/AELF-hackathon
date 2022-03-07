
import AElf from 'aelf-sdk';

const { sha256 } = AElf.utils;

// const defaultPrivateKey = 'a59c14882c023d63e84e5faf36558fdc8dbf1063eed45ce7e507f1cd9bcde1d9';
const wallet = AElf.wallet.createNewWallet();
// const wallet = AElf.wallet.getWalletByPrivateKey(defaultPrivateKey);
// link to local Blockchain, you can learn how to run a local node in https://docs.aelf.io/main/main/setup
// const aelf = new AElf(new AElf.providers.HttpProvider('http://127.0.0.1:1235'));
const aelf = new AElf(new AElf.providers.HttpProvider('http://127.0.0.1:1235'));
const bingoAddress = '2LUmicHyH4RXrMjG4beDwuDsiWJESyLkgkwPdGTR8kahRzq5XS';
if (!aelf.isConnected()) {
  console.log('Blockchain Node is not running.');
}

// add event for dom
function events(multiTokenContract, bingoGameContract) {
  // Update your card number,Returns the change in the number of your cards
  function getBalance() {
    const payload = {
      symbol: 'CARD',
      owner: wallet.address
    };

    // TODO:
    setTimeout(() => {
      multiTokenContract.GetBalance.call(payload)
        .then(result => {
          console.log('result: ', result);
          return difference;
        })
        .catch(err => {
          console.log(err);
        });
    }, 3000);

    return multiTokenContract.GetBalance.call(payload)
      .then(result => {
        // console.log('result: ', result);
        const difference = result.balance - balance.innerText;
        // balance.innerHTML = result.balance;
        return difference;
      })
      .catch(err => {
        console.log(err);
      });;
  }

  refreshButton.onclick = () => {
    getBalance();
  };

  //Approve 
  function Approve() {
    multiTokenContract
      .Approve({
        symbol: "CARD",
        spender: bingoAddress,
        amount: "100000000000000000000",
      })
      .then((approve) => {
        return aelf.chain.getTxResult(approve.TransactionId);
      })
      .then((r) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            getBalance();
            loading = false;
            resolve();
          }, 3000);
        });
      })
      .then(() => {
        console.log("Congratulations on your successful approve");
      })
      .catch((err) => {
        loading = false;
        console.log(err?.Error);
        console.log(err, "=====r");
      });
  }

  // register game, update the number of cards, display game interface
  let loading = false;
  register.onclick = () => {
    if (loading) {
      return;
    }
    loading = true;
    if(register.innerText === 'Register'){
      bingoGameContract.Register()
      .then(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            getBalance();
            loading = false;
            resolve()
          }, 3000);
        });
      })
      .then(() => {
      })
      .catch(err => {
        console.log(err);
      });
    } else {
      Approve();
    }
  };

  // Check the format of the input, start play
  function bet(value) {
    if (reg.test(value) && value <= balance.innerText) {
      bingoGameContract.Play({ value })
        .then(result => {
          console.log('Play result: ', result);
          txId = result.TransactionId;
          return aelf.chain.getTxResult(txId)
        })
        .then(()=>{
        })
        .catch(err => {
          console.log(err);
        });
    } else if (value > balance.innerText) {
      console.log('Please enter a number less than the number of cards you own!');
    } else {
      console.log('Please enter a positive integer greater than 0!');
    }
  };

  // return to game results
  bingo.onclick = () => {
    bingoGameContract.Bingo(txId)
      .then(
        getBalance
      )
      .then(difference => {
        console.log('difference: ', difference);
        if (difference > 0) {
          console.log(`Congratulations！！ You got ${difference} card`);
        } else if (difference < 0) {
          console.log(`It’s a pity. You lost ${-difference} card`);
        } else {
          console.log('You got nothing');
        }
      })
      .catch(err => {
        console.log(err);
      });
  };
}

function init() {
  document.getElementById('register').innerText = 'Please wait...';
  aelf.chain.getChainStatus()
    // get instance by GenesisContractAddress
    .then(res => aelf.chain.contractAt(res.GenesisContractAddress, wallet))
    // return contract's address which you query by contract's name
    .then(zeroC => zeroC.GetContractAddressByName.call(sha256('AElf.ContractNames.Token')))
    // return contract's instance and you can call the methods on this instance
    .then((tokenAddress) => Promise.all([
      aelf.chain.contractAt(tokenAddress, wallet),
      aelf.chain.contractAt(bingoAddress, wallet),
    ]))
    .then(([multiTokenContract, bingoGameContract]) => {
      initDomEvent(multiTokenContract, bingoGameContract);
    })
    .catch(err => {
      console.log(err);
    });
}

// run program
init();
