<div id="top"></div>

<!-- ABOUT THE PROJECT -->
# Dimori

To install library needed
```sh
    yarn
```

# In this project we don't need to deploy, just replace PRIVATE_KEY on .env file and test smart contract before we run it on web

To deploy smart contract to ganache network
```sh
    cd hardhat
    npx hardhat run scripts/deploy-dimori.js --network ganache
```

Test smart contract by using hardhat test
```sh
    npx hardhat test
```

Run app 
```sh
    yarn start
```
